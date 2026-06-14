import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import api from '../api';
import VideoCard from '../components/VideoCard';
import { Eye, Calendar, Tag, User, BookOpen, Share2, ChevronLeft } from 'lucide-react';

export default function WatchPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/videos/${id}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Video not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <CenteredMsg msg="Loading..." />;
  if (error) return <CenteredMsg msg={error} error />;

  const { video, related } = data;
  const videoSrc = video.video_url?.startsWith('/uploads') ? video.video_url : video.video_url;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7A6A8A', textDecoration: 'none', fontSize: '13px', marginBottom: '20px' }}>
        <ChevronLeft size={14} /> Back to Home
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
        {/* Main */}
        <div>
          {/* Player */}
          <div style={{ background: '#000', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', aspectRatio: '16/9', position: 'relative' }}>
            <ReactPlayer
              url={videoSrc}
              width="100%"
              height="100%"
              controls
              style={{ position: 'absolute', top: 0, left: 0 }}
              config={{
                youtube: { playerVars: { showinfo: 1 } },
                vimeo: { playerOptions: { title: true } },
                file: { attributes: { controlsList: 'nodownload' } }
              }}
            />
          </div>

          {/* Info */}
          <div style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '16px', padding: '24px' }}>
            {video.category_name && (
              <span style={{ fontSize: '11px', color: '#D4AF37', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>{video.category_name}</span>
            )}
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, color: '#F5F0FF', marginBottom: '16px', lineHeight: 1.3 }}>{video.title}</h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #2d1054' }}>
              {video.speaker && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: '#C4B5D9' }}>
                  <User size={14} color="#D4AF37" /> <strong style={{ color: '#D4AF37' }}>{video.speaker}</strong>
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: '#7A6A8A' }}>
                <Eye size={14} /> {video.views} views
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: '#7A6A8A' }}>
                <Calendar size={14} /> {new Date(video.created_at).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {video.series && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: '#7A6A8A' }}>
                  <BookOpen size={14} /> {video.series}
                </span>
              )}
            </div>

            {video.description && (
              <p style={{ fontSize: '14px', color: '#C4B5D9', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{video.description}</p>
            )}

            {video.tags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                {video.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                  <span key={tag} style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#F5F0FF', fontWeight: 600, marginBottom: '16px', letterSpacing: '1px' }}>UP NEXT</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {related.length > 0 ? related.map(v => <VideoCard key={v.id} video={v} />) : (
              <p style={{ color: '#7A6A8A', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No related videos</p>
            )}
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .watch-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function CenteredMsg({ msg, error }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: error ? '#E53E3E' : '#7A6A8A', fontSize: '16px' }}>{msg}</p>
    </div>
  );
}
