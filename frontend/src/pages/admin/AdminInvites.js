import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Ticket, Plus, Trash2, Copy, Check, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminInvites() {
  const [invites, setInvites] = useState([]);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  const load = () => { setLoading(true); api.get('/admin/invites').then(r => { setInvites(r.data.invites); setLoading(false); }); };
  useEffect(load, []);

  const generate = async () => {
    try {
      const r = await api.post('/admin/invites', { count: parseInt(count) });
      toast.success(`${r.data.invites.length} invite code(s) created!`);
      load();
    } catch { toast.error('Error generating codes'); }
  };

  const del = async id => {
    await api.delete(`/admin/invites/${id}`);
    toast.success('Code deleted');
    load();
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Code copied!');
  };

  const copyLink = (code) => {
    const url = `${window.location.origin}/register`;
    navigator.clipboard.writeText(`${url}?invite=${code}`);
    toast.success('Registration link copied!');
  };

  const available = invites.filter(i => !i.used_by);
  const used = invites.filter(i => i.used_by);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7A6A8A', textDecoration: 'none', fontSize: '13px', marginBottom: '24px' }}>
        <ChevronLeft size={14} /> Dashboard
      </Link>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#F5F0FF', fontWeight: 700, marginBottom: '8px' }}>Invite Codes</h1>
      <p style={{ color: '#7A6A8A', fontSize: '13px', marginBottom: '32px' }}>Generate codes to give members instant access</p>

      {/* Generator */}
      <div style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#D4AF37', marginBottom: '16px', letterSpacing: '1px' }}>GENERATE NEW CODES</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#7A6A8A', marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>Quantity</label>
            <input type="number" min="1" max="50" value={count} onChange={e => setCount(e.target.value)}
              style={{ width: '80px', background: 'rgba(255,255,255,0.04)', border: '1px solid #2d1054', borderRadius: '8px', padding: '10px 12px', color: '#F5F0FF', fontSize: '14px', outline: 'none', textAlign: 'center' }} />
          </div>
          <button onClick={generate} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '20px', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', border: 'none', borderRadius: '10px', padding: '10px 24px', color: '#0D0118', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
            <Plus size={16} /> Generate
          </button>
        </div>
        <p style={{ fontSize: '11px', color: '#7A6A8A', marginTop: '12px' }}>
          Share these codes with members. Each code can only be used once.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {[['Available', available.length, '#D4AF37'], ['Used', used.length, '#38A169']].map(([l, v, c]) => (
          <div key={l} style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: c, fontFamily: 'Cinzel, serif' }}>{v}</p>
            <p style={{ fontSize: '12px', color: '#7A6A8A', textTransform: 'uppercase', letterSpacing: '1px' }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Available codes */}
      {available.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#D4AF37', letterSpacing: '1px', marginBottom: '12px' }}>AVAILABLE CODES</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {available.map(inv => (
              <div key={inv.id} style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Ticket size={15} color="#D4AF37" />
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '15px', fontWeight: 700, color: '#F5F0FF', letterSpacing: '2px' }}>{inv.code}</span>
                  <span style={{ fontSize: '11px', color: '#7A6A8A' }}>Created {new Date(inv.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => copyCode(inv.code)} title="Copy code"
                    style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.08)', color: '#D4AF37', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {copied === inv.code ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                  <button onClick={() => copyLink(inv.code)} title="Copy registration link"
                    style={{ padding: '0 10px', height: 30, borderRadius: 7, border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.08)', color: '#D4AF37', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                    Link
                  </button>
                  <button onClick={() => del(inv.id)} title="Delete"
                    style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(229,62,62,0.3)', background: 'rgba(229,62,62,0.08)', color: '#E53E3E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Used codes */}
      {used.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#7A6A8A', letterSpacing: '1px', marginBottom: '12px' }}>USED CODES</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {used.map(inv => (
              <div key={inv.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(45,16,84,0.5)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Check size={15} color="#38A169" />
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#7A6A8A', letterSpacing: '2px', textDecoration: 'line-through' }}>{inv.code}</span>
                  <span style={{ fontSize: '11px', color: '#7A6A8A' }}>Used by {inv.used_by_name || 'Unknown'} · {inv.used_at ? new Date(inv.used_at).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p style={{ color: '#7A6A8A', textAlign: 'center', padding: '40px' }}>Loading...</p>}
      {!loading && invites.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#7A6A8A' }}>
          <Ticket size={40} color="#2d1054" style={{ marginBottom: '12px' }} />
          <p>No invite codes yet. Generate some above.</p>
        </div>
      )}
    </div>
  );
}
