import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Tv, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', inviteCode: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const r = await api.post('/auth/register', form);
      if (r.data.pending) {
        toast.success('Registration received! Your account is pending admin approval.');
        navigate('/login');
      } else {
        toast.success(r.data.message);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #2d1054', borderRadius: '10px', padding: '12px 14px', color: '#F5F0FF', fontSize: '14px', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--purple-deep)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #D4AF37, #A8892A)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(212,175,55,0.3)' }}>
            <Tv size={34} color="#0D0118" strokeWidth={2} />
          </div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', fontWeight: 700, color: '#D4AF37', letterSpacing: '2px', marginBottom: '4px' }}>DESTINY TV</h1>
          <p style={{ fontSize: '12px', color: '#7A6A8A', letterSpacing: '3px', textTransform: 'uppercase' }}>Word Ministries International</p>
        </div>

        <div style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '20px', padding: '36px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <UserPlus size={18} color="#D4AF37" />
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#F5F0FF', fontWeight: 600 }}>Request Access</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 characters' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#7A6A8A', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>{f.label}</label>
                <input type={f.type} required placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={inp}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'}
                  onBlur={e => e.target.style.borderColor = '#2d1054'}
                />
              </div>
            ))}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#7A6A8A', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Invite Code <span style={{ color: '#7A6A8A', fontWeight: 400 }}>(optional - for instant access)</span>
              </label>
              <input type="text" placeholder="DESTV-XXXXXX"
                value={form.inviteCode} onChange={e => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })}
                style={{ ...inp, letterSpacing: '2px', fontWeight: 600 }}
                onFocus={e => e.target.style.borderColor = '#D4AF37'}
                onBlur={e => e.target.style.borderColor = '#2d1054'}
              />
              <p style={{ fontSize: '11px', color: '#7A6A8A', marginTop: '6px' }}>Without a code, your account needs admin approval</p>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: loading ? '#A8892A' : 'linear-gradient(135deg, #D4AF37, #A8892A)', border: 'none', borderRadius: '10px', padding: '13px', color: '#0D0118', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', fontFamily: 'Cinzel, serif' }}>
              {loading ? 'Submitting...' : 'REQUEST ACCESS'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #2d1054' }}>
            <p style={{ fontSize: '13px', color: '#7A6A8A' }}>
              Already have access?{' '}
              <Link to="/login" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
