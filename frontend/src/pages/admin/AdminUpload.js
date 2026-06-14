import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Upload, Link as LinkIcon, Film, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminUpload() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', speaker: '', series: '', tags: '',
    featured: false, live: false, video_type: 'upload', video_url: '', live_url: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef();
  const thumbRef = useRef();

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.categories)); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required'); return; }
    if (form.video_type === 'upload' && !videoFile) { toast.error('Please select a video file'); return; }
    if (form.video_type === 'embed' && !form.video_url) { toast.error('Please enter a video URL'); return; }

    setUploading(true);
    setProgress(0);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v === true ? '1' : v === false ? '0' : v));
    if (videoFile) fd.append('video', videoFile);
    if (thumbnail) fd.append('thumbnail', thumbnail);

    try {
      await api.post('/videos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      toast.success('Video uploaded successfully! 🎬');
      setForm({ title: '', description: '', category_id: '', speaker: '', series: '', tags: '', featured: false, live: false, video_type: 'upload', video_url: '', live_url: '' });
      setVideoFile(null);
      setThumbnail(null);
      setProgress(0);
      if (videoRef.current) videoRef.current.value = '';
      if (thumbRef.current) thumbRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #2d1054', borderRadius: '10px', padding: '11px 14px', color: '#F5F0FF', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' };
  const label = { display: 'block', fontSize: '12px', color: '#7A6A8A', marginBottom: '7px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500 };
  const field = { marginBottom: '20px' };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7A6A8A', textDecoration: 'none', fontSize: '13px', marginBottom: '24px' }}>
        <ChevronLeft size={14} /> Dashboard
      </Link>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '24px', color: '#F5F0FF', fontWeight: 700, marginBottom: '8px' }}>Upload Video</h1>
      <p style={{ color: '#7A6A8A', fontSize: '13px', marginBottom: '32px' }}>Add new content to Destiny TV</p>

      <form onSubmit={handleSubmit}>
        {/* Video Source Type */}
        <div style={{ ...field, display: 'flex', gap: '12px', marginBottom: '28px' }}>
          {[{ v: 'upload', label: 'Upload File', icon: <Upload size={16} /> }, { v: 'embed', label: 'Embed URL', icon: <LinkIcon size={16} /> }].map(opt => (
            <button key={opt.v} type="button" onClick={() => setForm({ ...form, video_type: opt.v })}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: '10px', border: `1px solid ${form.video_type === opt.v ? '#D4AF37' : '#2d1054'}`, background: form.video_type === opt.v ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)', color: form.video_type === opt.v ? '#D4AF37' : '#7A6A8A', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}>
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <div style={field}>
          <label style={label}>Title *</label>
          <input style={inp} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Sermon title" required
            onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
        </div>

        {/* Two column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={label}>Category</label>
            <select style={inp} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Speaker</label>
            <input style={inp} value={form.speaker} onChange={e => setForm({ ...form, speaker: e.target.value })} placeholder="Pastor / Minister name"
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={label}>Series</label>
            <input style={inp} value={form.series} onChange={e => setForm({ ...form, series: e.target.value })} placeholder="e.g. Faith series"
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
          </div>
          <div>
            <label style={label}>Tags (comma separated)</label>
            <input style={inp} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="faith, prayer, healing"
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
          </div>
        </div>

        {/* Description */}
        <div style={field}>
          <label style={label}>Description</label>
          <textarea style={{ ...inp, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Video description..."
            onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
        </div>

        {/* Video Source */}
        {form.video_type === 'upload' ? (
          <div style={field}>
            <label style={label}>Video File</label>
            <div style={{ border: '2px dashed #2d1054', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: videoFile ? 'rgba(212,175,55,0.05)' : 'transparent' }}
              onClick={() => videoRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setVideoFile(f); }}>
              <Film size={32} color={videoFile ? '#D4AF37' : '#2d1054'} style={{ marginBottom: '8px' }} />
              <p style={{ color: videoFile ? '#D4AF37' : '#7A6A8A', fontSize: '14px', fontWeight: 500 }}>
                {videoFile ? videoFile.name : 'Click or drag video here'}
              </p>
              <p style={{ color: '#7A6A8A', fontSize: '12px', marginTop: '4px' }}>MP4, WebM, MOV up to 2GB</p>
              <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => setVideoFile(e.target.files[0])} />
            </div>
          </div>
        ) : (
          <div style={field}>
            <label style={label}>Video URL (YouTube, Vimeo, or direct)</label>
            <input style={inp} value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..."
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
          </div>
        )}

        {/* Thumbnail */}
        <div style={field}>
          <label style={label}>Thumbnail Image</label>
          <div style={{ border: '2px dashed #2d1054', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: thumbnail ? 'rgba(212,175,55,0.05)' : 'transparent' }}
            onClick={() => thumbRef.current?.click()}>
            {thumbnail ? (
              <img src={URL.createObjectURL(thumbnail)} alt="thumb" style={{ width: 80, height: 55, objectFit: 'cover', borderRadius: 6 }} />
            ) : (
              <div style={{ width: 80, height: 55, background: '#2d1054', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={20} color="#7A6A8A" />
              </div>
            )}
            <div>
              <p style={{ color: thumbnail ? '#D4AF37' : '#7A6A8A', fontSize: '14px', fontWeight: 500 }}>{thumbnail ? thumbnail.name : 'Upload thumbnail'}</p>
              <p style={{ color: '#7A6A8A', fontSize: '12px' }}>JPG, PNG, WebP</p>
            </div>
            <input ref={thumbRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setThumbnail(e.target.files[0])} />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '28px' }}>
          {[
            { key: 'featured', label: 'Featured', desc: 'Show in hero banner' },
            { key: 'live', label: 'Live Stream', desc: 'Show LIVE badge' },
          ].map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: form[opt.key] ? '#D4AF37' : '#2d1054', position: 'relative', transition: 'background 0.2s' }}
                onClick={() => setForm({ ...form, [opt.key]: !form[opt.key] })}>
                <div style={{ position: 'absolute', top: 3, left: form[opt.key] ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#F5F0FF', fontWeight: 500 }}>{opt.label}</p>
                <p style={{ fontSize: '11px', color: '#7A6A8A' }}>{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Progress bar */}
        {uploading && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#D4AF37' }}>Uploading...</span>
              <span style={{ fontSize: '12px', color: '#D4AF37' }}>{progress}%</span>
            </div>
            <div style={{ background: '#2d1054', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #D4AF37, #A8892A)', width: `${progress}%`, transition: 'width 0.3s', borderRadius: '4px' }} />
            </div>
          </div>
        )}

        <button type="submit" disabled={uploading}
          style={{ width: '100%', background: uploading ? '#A8892A' : 'linear-gradient(135deg, #D4AF37, #A8892A)', border: 'none', borderRadius: '12px', padding: '15px', color: '#0D0118', fontSize: '15px', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', letterSpacing: '1px', fontFamily: 'Cinzel, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Upload size={18} /> {uploading ? `Uploading... ${progress}%` : 'PUBLISH VIDEO'}
        </button>
      </form>
    </div>
  );
}
