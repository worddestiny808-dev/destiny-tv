import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, Clock } from 'lucide-react';

export default function VideoCard({ video, large }) {
  const thumb = video.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.title)}&background=2d1054&color=D4AF37&size=400&font-size=0.2`;

  return (
    <Link to={`/watch/${video.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'var(--purple-card)',
        border: '1px solid var(--purple-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--purple-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#0D0118', overflow: 'hidden' }}>
          <img
            src={thumb}
            alt={video.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.title)}&background=2d1054&color=D4AF37&size=400&font-size=0.2`; }}
          />
          {/* Play overlay */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', background: 'rgba(0,0,0,0.4)' }}
            className="play-overlay">
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(212,175,55,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={20} color="#0D0118" fill="#0D0118" style={{ marginLeft: 3 }} />
            </div>
          </div>
          {video.live ? (
            <div style={{ position: 'absolute', top: 8, left: 8, background: '#E53E3E', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse-gold 1.5s infinite' }}></span> LIVE
            </div>
          ) : video.duration ? (
            <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.8)', color: '#F5F0FF', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
              {video.duration}
            </div>
          ) : null}
          {video.featured ? (
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'linear-gradient(135deg, #D4AF37, #A8892A)', color: '#0D0118', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', letterSpacing: '1px' }}>
              FEATURED
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div style={{ padding: large ? '16px' : '12px' }}>
          <h3 style={{ fontSize: large ? '15px' : '13px', fontWeight: 600, color: '#F5F0FF', marginBottom: '6px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {video.title}
          </h3>
          {video.speaker && (
            <p style={{ fontSize: '12px', color: '#D4AF37', marginBottom: '6px', fontWeight: 500 }}>{video.speaker}</p>
          )}
          {video.category_name && (
            <span style={{ fontSize: '10px', background: 'rgba(212,175,55,0.1)', color: '#D4AF37', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.2)' }}>
              {video.category_name}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', color: '#7A6A8A', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11} /> {video.views || 0}</span>
            <span>{new Date(video.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
      <style>{`.play-overlay { opacity: 0; } div:hover .play-overlay { opacity: 1; }`}</style>
    </Link>
  );
}
