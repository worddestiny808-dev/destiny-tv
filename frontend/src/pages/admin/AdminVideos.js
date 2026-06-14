import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Trash2, Edit, Eye, Star, ChevronLeft, Upload, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => { setLoading(true); api.get('/admin/videos').then(r => { setVideos(r.data.videos); setLoading(false); }); };
  useEffect(load, []);

  const del = async id => {
    if (!window.confirm('Remove this video?')) return;
    await api.delete(`/videos/${id}`);
    toast.success('Video removed');
    load();
  };

  const toggleFeatured = async v => {
    const fd = new FormData();
    Object.entries(v).forEach(([k, val]) => { if (val != null) fd.append(k, k === 'featured' ? (v.featured ? '0' : '1') : val); });
    await api.put(`/videos/${v.id}`, fd);
    toast.success(v.featured ? 'Removed from featured' : 'Marked as featured');
    load();
  };

  const filtered = videos.filter(v => !search || v.title.toLowerCase().includes(search.toLowerCase()) || (v.speaker || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7A6A8A', textDecoration: 'none', fontSize: '13px', marginBottom: '24px' }}>
        <ChevronLeft size={14} /> Dashboard
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#F5F0FF', fontWeight: 700 }}>Videos ({filtered.length})</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#7A6A8A' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2d1054', borderRadius: '8px', padding: '9px 12px 9px 30px', color: '#F5F0FF', fontSize: '13px', outline: 'none', width: 200 }} />
          </div>
          <Link to="/admin/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #D4AF37, #A8892A)', borderRadius: '10px', padding: '9px 16px', color: '#0D0118', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}>
            <Upload size={14} /> Upload
          </Link>
        </div>
      </div>

      <div style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2d1054' }}>
              {['Video', 'Category', 'Views', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', color: '#7A6A8A', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#7A6A8A' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#7A6A8A' }}>No videos found</td></tr>
            ) : filtered.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid rgba(45,16,84,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 60, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#0D0118' }}>
                      <img src={v.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.title)}&background=2d1054&color=D4AF37`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: '#F5F0FF', fontWeight: 500, marginBottom: 2 }}>{v.title}</p>
                      {v.speaker && <p style={{ fontSize: '11px', color: '#D4AF37' }}>{v.speaker}</p>}
                      {v.featured === 1 && <span style={{ fontSize: '10px', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', padding: '1px 6px', borderRadius: '4px' }}>Featured</span>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#C4B5D9' }}>{v.category_name || '-'}</td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#7A6A8A', display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11} /> {v.views}</td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#7A6A8A' }}>{new Date(v.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => toggleFeatured(v)} title={v.featured ? 'Unfeature' : 'Feature'}
                      style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${v.featured ? 'rgba(212,175,55,0.5)' : 'rgba(45,16,84,0.8)'}`, background: v.featured ? 'rgba(212,175,55,0.15)' : 'transparent', color: v.featured ? '#D4AF37' : '#7A6A8A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Star size={13} fill={v.featured ? '#D4AF37' : 'none'} />
                    </button>
                    <Link to={`/watch/${v.id}`} target="_blank"
                      style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(49,130,206,0.3)', background: 'rgba(49,130,206,0.08)', color: '#3182CE', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                      <Eye size={13} />
                    </Link>
                    <button onClick={() => del(v.id)} title="Delete"
                      style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(229,62,62,0.3)', background: 'rgba(229,62,62,0.08)', color: '#E53E3E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
