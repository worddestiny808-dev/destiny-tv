import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';
import { Play, ChevronRight, Radio, Star, BookOpen, Music, Calendar, Heart } from 'lucide-react';

const CATEGORY_ICONS = { sermons: <BookOpen size={18}/>, worship: <Music size={18}/>, 'bible-study': <BookOpen size={18}/>, events: <Calendar size={18}/>, testimonies: <Star size={18}/>, prayer: <Heart size={18}/> };

export default function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [live, setLive] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/videos?featured=1&limit=5'),
      api.get('/videos?limit=12'),
      api.get('/videos?live=1&limit=3'),
      api.get('/categories'),
    ]).then(([f, r, l, c]) => {
      setFeatured(f.data.videos);
      setRecent(r.data.videos);
      setLive(l.data.videos);
      setCategories(c.data.categories);
    }).finally(() => setLoading(false));
  }, []);

  const hero = featured[heroIdx];

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '2px solid #2d1054', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#7A6A8A', fontSize: '13px', letterSpacing: '2px', fontFamily: 'Cinzel, serif' }}>LOADING...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* Hero Banner */}
      {hero ? (
        <div style={{ position: 'relative', height: '520px', overflow: 'hidden', background: '#0D0118' }}>
          {featured.map((v, i) => (
            <div key={v.id} style={{ position: 'absolute', inset: 0, opacity: i === heroIdx ? 1 : 0, transition: 'opacity 0.6s ease' }}>
              <img src={v.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.title)}&background=2d1054&color=D4AF37&size=1200`}
                alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
            </div>
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(13,1,24,0.95) 40%, transparent 100%), linear-gradient(to top, rgba(13,1,24,0.8) 0%, transparent 50%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 48px', maxWidth: '700px' }}>
            {hero.live && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E53E3E', borderRadius: '6px', padding: '4px 12px', marginBottom: '16px', width: 'fit-content' }}>
                <Radio size={12} color="#fff" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '2px' }}>LIVE NOW</span>
              </div>
            )}
            {hero.category_name && (
              <span style={{ fontSize: '11px', color: '#D4AF37', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>{hero.category_name}</span>
            )}
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 700, color: '#F5F0FF', marginBottom: '12px', lineHeight: 1.3 }}>{hero.title}</h1>
            {hero.speaker && <p style={{ fontSize: '14px', color: '#D4AF37', marginBottom: '8px', fontWeight: 500 }}>with {hero.speaker}</p>}
            {hero.description && <p style={{ fontSize: '14px', color: '#C4B5D9', marginBottom: '28px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{hero.description}</p>}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to={`/watch/${hero.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', border: 'none', borderRadius: '10px', padding: '13px 28px', color: '#0D0118', fontSize: '14px', fontWeight: 700, textDecoration: 'none', fontFamily: 'Cinzel, serif', letterSpacing: '1px', boxShadow: '0 4px 20px rgba(212,175,55,0.4)' }}>
                <Play size={16} fill="#0D0118" /> WATCH NOW
              </Link>
            </div>
          </div>
          {/* Dots */}
          {featured.length > 1 && (
            <div style={{ position: 'absolute', bottom: '20px', left: '48px', display: 'flex', gap: '8px' }}>
              {featured.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)}
                  style={{ width: i === heroIdx ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === heroIdx ? '#D4AF37' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, #1a0533 0%, #0D0118 100%)', padding: '80px 48px', textAlign: 'center', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '36px', color: '#D4AF37', marginBottom: '12px' }}>Welcome to Destiny TV</h1>
          <p style={{ color: '#C4B5D9', fontSize: '16px' }}>Destiny Word Ministries International</p>
          {user?.role === 'admin' && (
            <Link to="/admin/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: '24px', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', padding: '12px 24px', borderRadius: '10px', color: '#0D0118', fontWeight: 700, textDecoration: 'none', fontFamily: 'Cinzel, serif', fontSize: '13px' }}>
              Upload First Video
            </Link>
          )}
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Live */}
        {live.length > 0 && (
          <Section title="Live Now" icon={<Radio size={18} color="#E53E3E" />} color="#E53E3E">
            <Grid videos={live} />
          </Section>
        )}

        {/* Categories */}
        <div style={{ marginBottom: '48px' }}>
          <SectionHeader title="Browse by Category" icon={<Star size={18} color="#D4AF37" />} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '12px', padding: '20px 16px', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--purple-border)'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.icon}</div>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#F5F0FF', fontWeight: 600, marginBottom: '4px' }}>{cat.name}</p>
                  <p style={{ fontSize: '11px', color: '#7A6A8A' }}>{cat.video_count} video{cat.video_count !== 1 ? 's' : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent */}
        {recent.length > 0 && (
          <Section title="Latest Videos" icon={<Play size={18} color="#D4AF37" />} linkTo={null}>
            <Grid videos={recent} />
          </Section>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, icon, to }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {icon}
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#F5F0FF', fontWeight: 600 }}>{title}</h2>
      </div>
      {to && (
        <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#D4AF37', textDecoration: 'none', fontWeight: 500 }}>
          View all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

function Section({ title, icon, children, linkTo, color }) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <SectionHeader title={title} icon={icon} to={linkTo} />
      {children}
    </div>
  );
}

function Grid({ videos }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
      {videos.map(v => <VideoCard key={v.id} video={v} />)}
    </div>
  );
}
