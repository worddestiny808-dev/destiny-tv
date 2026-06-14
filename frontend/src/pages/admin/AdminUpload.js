import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Upload, Link as LinkIcon, Film, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminUpload() {
  const [categories, setCategories] = useState([]);
  const [cloudinaryReady, setCloudinaryReady] = useState(null); // null=checking, true, false
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', speaker: '', series: '', tags: '',
    featured: false, live: false, video_type: 'embed', video_url: '', live_url: '', duration: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [thumbUploadProgress, setThumbUploadProgress] = useState(0);
  const [step, setStep] = useState('form'); // form | uploading | done
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadedThumbUrl, setUploadedThumbUrl] = useState('');
  const videoRef = useRef();
  const thumbRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories));
    // Check if Cloudinary is configured
    api.post('/videos/cloudinary-signature', {})
      .then(() => setCloudinaryReady(true))
      .catch(err => {
        if (err.response?.status === 400 && err.response?.data?.error?.includes('not configured')) {
          setCloudinaryReady(false);
        } else {
          setCloudinaryReady(true); // other error means it's configured
        }
      });
  }, []);

  // Upload file to Cloudinary directly from browser
  const uploadToCloudinary = async (file, type) => {
    const sigEndpoint = type === 'video' ? '/videos/cloudinary-signature' : '/videos/cloudinary-thumbnail-signature';
    const sigRes = await api.post(sigEndpoint, {});
    const { signature, timestamp, apiKey, cloudName, folder } = sigRes.data;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', apiKey);
    fd.append('timestamp', timestamp);
    fd.append('signature', signature);
    fd.append('folder', folder);
    if (type === 'video') {
      fd.append('resource_type', 'video');
    }

    const resourceType = type === 'video' ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);
      xhr.upload.onprogress = e => {
        const pct = Math.round((e.loaded / e.total) * 100);
        if (type === 'video') setVideoUploadProgress(pct);
        else setThumbUploadProgress(pct);
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url);
        } else {
          reject(new Error(`Upload failed: ${xhr.responseText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(fd);
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required'); return; }

    if (form.video_type === 'upload') {
      if (!videoFile) { toast.error('Please select a video file'); return; }
      if (!cloudinaryReady) { toast.error('Cloudinary is not configured. Use Embed URL instead, or add Cloudinary credentials.'); return; }
    } else {
      if (!form.video_url) { toast.error('Please enter a video URL'); return; }
    }

    setStep('uploading');

    try {
      let finalVideoUrl = form.video_url;
      let finalThumbUrl = '';

      // Upload video to Cloudinary if file selected
      if (form.video_type === 'upload' && videoFile) {
        toast('Uploading video to Cloudinary...', { icon: '🎬' });
        finalVideoUrl = await uploadToCloudinary(videoFile, 'video');
        toast.success('Video uploaded!');
      }

      // Upload thumbnail to Cloudinary if selected
      if (thumbnail) {
        toast('Uploading thumbnail...', { icon: '🖼️' });
        finalThumbUrl = await uploadToCloudinary(thumbnail, 'image');
        toast.success('Thumbnail uploaded!');
      }

      // Save to our database
      await api.post('/videos', {
        title: form.title,
        description: form.description,
        category_id: form.category_id,
        speaker: form.speaker,
        series: form.series,
        tags: form.tags,
        featured: form.featured,
        live: form.live,
        live_url: form.live_url,
        duration: form.duration,
        video_url: finalVideoUrl,
        video_type: form.video_type === 'upload' ? 'cloudinary' : 'embed',
        thumbnail_url: finalThumbUrl || '',
      });

      setStep('done');
      toast.success('Video published successfully! 🎉');
    } catch (err) {
      setStep('form');
      toast.error(err.message || err.response?.data?.error || 'Upload failed');
      setVideoUploadProgress(0);
      setThumbUploadProgress(0);
    }
  };

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #2d1054', borderRadius: '10px', padding: '11px 14px', color: '#F5F0FF', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' };
  const labelStyle = { display: 'block', fontSize: '12px', color: '#7A6A8A', marginBottom: '7px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500 };
  const field = { marginBottom: '20px' };

  if (step === 'done') {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(56,161,105,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="#38A169" />
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '24px', color: '#F5F0FF', marginBottom: '12px' }}>Video Published!</h1>
        <p style={{ color: '#C4B5D9', marginBottom: '32px' }}>{form.title} is now live on Destiny TV</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => { setStep('form'); setForm({ title: '', description: '', category_id: '', speaker: '', series: '', tags: '', featured: false, live: false, video_type: 'embed', video_url: '', live_url: '', duration: '' }); setVideoFile(null); setThumbnail(null); setVideoUploadProgress(0); setThumbUploadProgress(0); }}
            style={{ background: 'linear-gradient(135deg, #D4AF37, #A8892A)', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#0D0118', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'Cinzel, serif' }}>
            Upload Another
          </button>
          <button onClick={() => navigate('/admin/videos')}
            style={{ background: 'transparent', border: '1px solid #2d1054', borderRadius: '10px', padding: '12px 24px', color: '#C4B5D9', cursor: 'pointer', fontSize: '13px' }}>
            View All Videos
          </button>
        </div>
      </div>
    );
  }

  if (step === 'uploading') {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#F5F0FF', marginBottom: '8px' }}>Publishing...</h1>
        <p style={{ color: '#7A6A8A', marginBottom: '40px', fontSize: '14px' }}>{form.title}</p>

        {form.video_type === 'upload' && videoFile && (
          <ProgressBar label="Video" progress={videoUploadProgress} color="#D4AF37" />
        )}
        {thumbnail && (
          <ProgressBar label="Thumbnail" progress={thumbUploadProgress} color="#9F7AEA" />
        )}
        {form.video_type === 'embed' && (
          <div style={{ color: '#D4AF37', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <div style={{ width: 16, height: 16, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            Saving to database...
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7A6A8A', textDecoration: 'none', fontSize: '13px', marginBottom: '24px' }}>
        <ChevronLeft size={14} /> Dashboard
      </Link>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '24px', color: '#F5F0FF', fontWeight: 700, marginBottom: '4px' }}>Upload Video</h1>
      <p style={{ color: '#7A6A8A', fontSize: '13px', marginBottom: '28px' }}>Add new content to Destiny TV</p>

      {/* Cloudinary status banner */}
      {cloudinaryReady === false && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircle size={18} color="#D4AF37" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: '13px', color: '#D4AF37', fontWeight: 600, marginBottom: '4px' }}>File upload not configured yet</p>
            <p style={{ fontSize: '12px', color: '#C4B5D9', lineHeight: 1.6 }}>
              To enable direct video file uploads, add these 3 environment variables in your{' '}
              <a href="https://render.com" target="_blank" rel="noreferrer" style={{ color: '#D4AF37' }}>Render dashboard</a>:{' '}
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4 }}>CLOUDINARY_CLOUD_NAME</code>{' '}
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4 }}>CLOUDINARY_API_KEY</code>{' '}
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4 }}>CLOUDINARY_API_SECRET</code>{' '}
              — free account at <a href="https://cloudinary.com" target="_blank" rel="noreferrer" style={{ color: '#D4AF37' }}>cloudinary.com</a>.
              Until then, use <strong>Embed URL</strong> (YouTube/Vimeo links work great).
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Video Source Type */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          {[
            { v: 'upload', label: 'Upload File', icon: <Upload size={16} />, disabled: cloudinaryReady === false },
            { v: 'embed', label: 'Embed URL', icon: <LinkIcon size={16} />, disabled: false },
          ].map(opt => (
            <button key={opt.v} type="button"
              onClick={() => !opt.disabled && setForm({ ...form, video_type: opt.v })}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: '10px', border: `1px solid ${form.video_type === opt.v ? '#D4AF37' : '#2d1054'}`, background: form.video_type === opt.v ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)', color: opt.disabled ? '#4a3060' : form.video_type === opt.v ? '#D4AF37' : '#7A6A8A', cursor: opt.disabled ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', opacity: opt.disabled ? 0.5 : 1 }}>
              {opt.icon} {opt.label} {opt.disabled && <span style={{ fontSize: '10px' }}>(needs Cloudinary)</span>}
            </button>
          ))}
        </div>

        {/* Title */}
        <div style={field}>
          <label style={labelStyle}>Title *</label>
          <input style={inp} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Sermon title" required
            onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={inp} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Speaker / Minister</label>
            <input style={inp} value={form.speaker} onChange={e => setForm({ ...form, speaker: e.target.value })} placeholder="Pastor name"
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Series</label>
            <input style={inp} value={form.series} onChange={e => setForm({ ...form, series: e.target.value })} placeholder="e.g. Faith Series"
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
          </div>
          <div>
            <label style={labelStyle}>Duration</label>
            <input style={inp} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 1:32:00"
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
          </div>
          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input style={inp} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="faith, healing"
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
          </div>
        </div>

        {/* Description */}
        <div style={field}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inp, minHeight: '90px', resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Video description..."
            onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
        </div>

        {/* Video source */}
        {form.video_type === 'upload' ? (
          <div style={field}>
            <label style={labelStyle}>Video File</label>
            <div style={{ border: '2px dashed #2d1054', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: videoFile ? 'rgba(212,175,55,0.04)' : 'transparent' }}
              onClick={() => videoRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#D4AF37'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = '#2d1054'; }}
              onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#2d1054'; const f = e.dataTransfer.files[0]; if (f) setVideoFile(f); }}>
              <Film size={32} color={videoFile ? '#D4AF37' : '#2d1054'} style={{ marginBottom: '8px' }} />
              <p style={{ color: videoFile ? '#D4AF37' : '#7A6A8A', fontSize: '14px', fontWeight: 500 }}>
                {videoFile ? videoFile.name : 'Click or drag video here'}
              </p>
              {videoFile && <p style={{ color: '#7A6A8A', fontSize: '12px', marginTop: '4px' }}>{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>}
              <p style={{ color: '#4a3060', fontSize: '11px', marginTop: '6px' }}>MP4, WebM, MOV — uploaded directly to Cloudinary (fast)</p>
              <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => setVideoFile(e.target.files[0])} />
            </div>
          </div>
        ) : (
          <div style={field}>
            <label style={labelStyle}>Video URL</label>
            <input style={inp} value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=... or Vimeo, direct MP4"
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = '#2d1054'} />
            <p style={{ fontSize: '11px', color: '#7A6A8A', marginTop: '6px' }}>YouTube, Vimeo, Facebook Video, or any direct video URL</p>
          </div>
        )}

        {/* Thumbnail */}
        <div style={field}>
          <label style={labelStyle}>Thumbnail Image <span style={{ color: '#4a3060', fontWeight: 400 }}>(optional)</span></label>
          <div style={{ border: '2px dashed #2d1054', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: thumbnail ? 'rgba(212,175,55,0.04)' : 'transparent' }}
            onClick={() => thumbRef.current?.click()}>
            {thumbnail ? (
              <img src={URL.createObjectURL(thumbnail)} alt="thumb" style={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 6 }} />
            ) : (
              <div style={{ width: 72, height: 48, background: '#2d1054', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={18} color="#7A6A8A" />
              </div>
            )}
            <div>
              <p style={{ color: thumbnail ? '#D4AF37' : '#7A6A8A', fontSize: '13px', fontWeight: 500 }}>{thumbnail ? thumbnail.name : 'Upload thumbnail'}</p>
              <p style={{ color: '#7A6A8A', fontSize: '11px' }}>JPG, PNG, WebP</p>
            </div>
            <input ref={thumbRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setThumbnail(e.target.files[0])} />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { key: 'featured', label: 'Featured', desc: 'Show in hero banner' },
            { key: 'live', label: 'Live Stream', desc: 'Show LIVE badge' },
          ].map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: form[opt.key] ? '#D4AF37' : '#2d1054', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
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

        <button type="submit"
          style={{ width: '100%', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', border: 'none', borderRadius: '12px', padding: '15px', color: '#0D0118', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px', fontFamily: 'Cinzel, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Upload size={18} /> PUBLISH VIDEO
        </button>
      </form>
    </div>
  );
}

function ProgressBar({ label, progress, color }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#C4B5D9' }}>{label}</span>
        <span style={{ fontSize: '13px', color, fontWeight: 600 }}>{progress}%</span>
      </div>
      <div style={{ background: '#2d1054', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}aa)`, width: `${progress}%`, transition: 'width 0.3s', borderRadius: '6px' }} />
      </div>
      {progress === 100 && (
        <p style={{ fontSize: '11px', color: '#38A169', marginTop: '4px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <CheckCircle size={11} /> Complete
        </p>
      )}
    </div>
  );
}
