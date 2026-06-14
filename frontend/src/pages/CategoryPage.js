import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import VideoCard from '../components/VideoCard';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CategoryPage() {
  const { slug } = useParams();
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/videos?category=${slug}&limit=50`),
      api.get('/categories'),
    ]).then(([v, c]) => {
      setVideos(v.data.videos);
      setCategory(c.data.categories.find(cat => cat.slug === slug));
    }).finally(() => setLoading(false));
  }, [slug]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7A6A8A', textDecoration: 'none', fontSize: '13px', marginBottom: '28px' }}>
        <ChevronLeft size={14} /> Back
      </Link>
      {category && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>{category.icon}</div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', color: '#F5F0FF', fontWeight: 700, marginBottom: '8px' }}>{category.name}</h1>
          {category.description && <p style={{ color: '#C4B5D9', fontSize: '14px' }}>{category.description}</p>}
          <p style={{ color: '#D4AF37', fontSize: '13px', marginTop: '8px' }}>{videos.length} video{videos.length !== 1 ? 's' : ''}</p>
        </div>
      )}
      {loading ? (
        <p style={{ color: '#7A6A8A', textAlign: 'center', padding: '60px' }}>Loading...</p>
      ) : videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#7A6A8A' }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No videos in this category yet.</p>
          <p style={{ fontSize: '13px' }}>Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  );
}
