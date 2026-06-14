import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Tv, Eye, EyeOff, Lock } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--purple-deep)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-200px', left: '-200px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(93,30,150,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #D4AF37, #A8892A)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(212,175,55,0.3)' }}>
            <Tv size={34} color="#0D0118" strokeWidth={2} />
          </div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', fontWeight: 700, color: '#D4AF37', letterSpacing: '2px', marginBottom: '4px' }}>DESTINY TV</h1>
          <p style={{ fontSize: '12px', color: '#7A6A8A', letterSpacing: '3px', textTransform: 'uppercase' }}>Word Ministries International</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '20px', padding: '36px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <Lock size={18} color="#D4AF37" />
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#F5F0FF', fontWeight: 600 }}>Member Sign In</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#7A6A8A', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>Email Address</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #2d1054', borderRadius: '10px', padding: '12px 14px', color: '#F5F0FF', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#D4AF37'}
                onBlur={e => e.target.style.borderColor = '#2d1054'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#7A6A8A', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #2d1054', borderRadius: '10px', padding: '12px 44px 12px 14px', color: '#F5F0FF', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'}
                  onBlur={e => e.target.style.borderColor = '#2d1054'}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#7A6A8A' }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: loading ? '#A8892A' : 'linear-gradient(135deg, #D4AF37, #A8892A)', border: 'none', borderRadius: '10px', padding: '13px', color: '#0D0118', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', fontFamily: 'Cinzel, serif', transition: 'opacity 0.2s' }}>
              {loading ? 'Signing In...' : 'SIGN IN'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #2d1054' }}>
            <p style={{ fontSize: '13px', color: '#7A6A8A' }}>
              Don't have access?{' '}
              <Link to="/register" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 500 }}>Request Access</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#7A6A8A', lineHeight: 1.8 }}>
          This is a private platform for members of<br />
          <span style={{ color: '#D4AF37' }}>Destiny Word Ministries International</span>
        </p>
      </div>
    </div>
  );
}
