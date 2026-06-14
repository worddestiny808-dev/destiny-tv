import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Video, Users, Eye, Clock, Upload, UserCheck, Ticket, Film } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data)); }, []);

  if (!stats) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#7A6A8A' }}>Loading...</p></div>;

  const cards = [
    { label: 'Total Videos', value: stats.totalVideos, icon: <Film size={22} />, color: '#D4AF37', to: '/admin/videos' },
    { label: 'Total Members', value: stats.totalUsers, icon: <Users size={22} />, color: '#9F7AEA', to: '/admin/users' },
    { label: 'Active Members', value: stats.activeUsers, icon: <UserCheck size={22} />, color: '#38A169', to: '/admin/users' },
    { label: 'Pending Approval', value: stats.pendingUsers, icon: <Clock size={22} />, color: '#E53E3E', to: '/admin/users' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: <Eye size={22} />, color: '#3182CE', to: null },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '24px', color: '#F5F0FF', fontWeight: 700, marginBottom: '4px' }}>Admin Dashboard</h1>
          <p style={{ color: '#7A6A8A', fontSize: '13px' }}>Destiny Word Ministries International TV</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/admin/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #D4AF37, #A8892A)', borderRadius: '10px', padding: '10px 20px', color: '#0D0118', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}>
            <Upload size={16} /> Upload Video
          </Link>
          <Link to="/admin/invites" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', padding: '10px 20px', color: '#D4AF37', fontWeight: 600, textDecoration: 'none', fontSize: '13px' }}>
            <Ticket size={16} /> Invite Codes
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {cards.map(c => (
          <div key={c.label} onClick={() => c.to && (window.location.href = c.to)}
            style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '14px', padding: '20px', cursor: c.to ? 'pointer' : 'default', transition: 'all 0.2s' }}
            onMouseEnter={e => c.to && (e.currentTarget.style.borderColor = c.color)}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--purple-border)'}>
            <div style={{ color: c.color, marginBottom: '12px' }}>{c.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#F5F0FF', fontFamily: 'Cinzel, serif', marginBottom: '4px' }}>{c.value}</div>
            <div style={{ fontSize: '12px', color: '#7A6A8A', textTransform: 'uppercase', letterSpacing: '1px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Recent Videos */}
        <div style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#F5F0FF', fontWeight: 600, letterSpacing: '1px' }}>RECENT VIDEOS</h2>
            <Link to="/admin/videos" style={{ fontSize: '12px', color: '#D4AF37', textDecoration: 'none' }}>View all</Link>
          </div>
          {stats.recentVideos.length === 0 ? <p style={{ color: '#7A6A8A', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No videos yet</p> : (
            <div>
              {stats.recentVideos.map(v => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(45,16,84,0.5)' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#F5F0FF', fontWeight: 500, marginBottom: '2px' }}>{v.title}</p>
                    <p style={{ fontSize: '11px', color: '#7A6A8A' }}>{new Date(v.created_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#7A6A8A', display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11} /> {v.views}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#F5F0FF', fontWeight: 600, letterSpacing: '1px' }}>RECENT MEMBERS</h2>
            <Link to="/admin/users" style={{ fontSize: '12px', color: '#D4AF37', textDecoration: 'none' }}>View all</Link>
          </div>
          {stats.recentUsers.length === 0 ? <p style={{ color: '#7A6A8A', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No members yet</p> : (
            <div>
              {stats.recentUsers.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(45,16,84,0.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#0D0118', flexShrink: 0 }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: '#F5F0FF', fontWeight: 500, marginBottom: '2px' }}>{u.name}</p>
                      <p style={{ fontSize: '11px', color: '#7A6A8A' }}>{u.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories stats */}
      <div style={{ marginTop: '24px', background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '14px', padding: '24px' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#F5F0FF', fontWeight: 600, letterSpacing: '1px', marginBottom: '20px' }}>VIDEOS BY CATEGORY</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {stats.videosByCategory.map(c => (
            <div key={c.name} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', fontWeight: 700, color: '#D4AF37' }}>{c.count}</span>
              <span style={{ fontSize: '13px', color: '#C4B5D9' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { active: '#38A169', pending: '#D69E2E', suspended: '#E53E3E' };
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, color: colors[status] || '#7A6A8A', background: `${colors[status] || '#7A6A8A'}15`, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {status}
    </span>
  );
}
