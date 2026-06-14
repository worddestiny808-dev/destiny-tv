import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import VideoCard from '../components/VideoCard';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const r = await api.get(`/videos?search=${encodeURIComponent(q)}&limit=50`);
      setResults(r.data.videos);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    setSearchParams({ q: query });
    doSearch(query);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '24px', color: '#F5F0FF', marginBottom: '28px' }}>Search</h1>

      <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '40px', maxWidth: '600px' }}>
        <input
          type="text" value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search sermons, speakers, topics..."
          style={{ width: '100%', background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '12px', padding: '14px 52px 14px 18px', color: '#F5F0FF', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = '#D4AF37'}
          onBlur={e => e.target.style.borderColor = 'var(--purple-border)'}
          autoFocus
        />
        <button type="submit" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', border: 'none', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Search size={16} color="#0D0118" />
        </button>
      </form>

      {loading && <p style={{ color: '#7A6A8A', textAlign: 'center' }}>Searching...</p>}
      {searched && !loading && (
        results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7A6A8A' }}>
            <Search size={48} color="#2d1054" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No results for "{query}"</p>
            <p style={{ fontSize: '13px' }}>Try a different search term</p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#7A6A8A', fontSize: '13px', marginBottom: '20px' }}>{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {results.map(v => <VideoCard key={v.id} video={v} />)}
            </div>
          </div>
        )
      )}
    </div>
  );
}
