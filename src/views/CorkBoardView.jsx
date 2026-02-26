import { useEffect, useMemo, useState } from 'react';
import { createSignedImageUrl, deleteMemoryPost, getCurrentUserId, getSupabaseSetupState, listMemoryPosts, listMemoryReports, submitMemoryReport, uploadMemoryPost } from '../supabaseApi.js';

const MAX_FILE_MB = 8;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

async function compressImageFile(file, maxEdge = 2200, quality = 0.82) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;
    const baseName = (file.name || 'upload').replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch { return file; }
}

export default function CorkBoardView() {
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [mode, setMode] = useState('board');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [gameLabel, setGameLabel] = useState('');
  const [file, setFile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [reportingId, setReportingId] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const { configured } = getSupabaseSetupState();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [uid, rows, reportRows] = await Promise.all([getCurrentUserId(), listMemoryPosts(48), listMemoryReports(120)]);
      setCurrentUserId(uid);
      setReports(reportRows || []);

      const hydrated = await Promise.all(rows.map(async row => {
        try { return { ...row, signedUrl: await createSignedImageUrl(row.image_path), broken: false }; }
        catch { return { ...row, signedUrl: '', broken: true }; }
      }));

      const brokenOwned = hydrated.filter(p => p.broken && p.user_id === uid);
      if (brokenOwned.length > 0) {
        await Promise.allSettled(brokenOwned.map(p => deleteMemoryPost(p, { bestEffortObjectDelete: true })));
      }
      setPosts(hydrated.filter(p => !p.broken));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reportQueue = useMemo(() => {
    const grouped = new Map();
    for (const r of reports) {
      const post = r.memory_posts;
      if (!post?.id) continue;
      if (!grouped.has(post.id)) grouped.set(post.id, { post, count: 0, reasons: [], latestAt: r.created_at });
      const g = grouped.get(post.id);
      g.count += 1;
      if (r.reason) g.reasons.push(r.reason);
      if (new Date(r.created_at) > new Date(g.latestAt)) g.latestAt = r.created_at;
    }
    return Array.from(grouped.values()).sort((a,b)=>new Date(b.latestAt)-new Date(a.latestAt));
  }, [reports]);

  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    load();
  }, [configured]);

  useEffect(() => {
    if (!expandedPost) return;
    const onKey = e => { if (e.key === 'Escape') setExpandedPost(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expandedPost]);

  const onUpload = async e => {
    e.preventDefault();
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return setError('Unsupported file type. Use JPG, PNG, WEBP, or HEIC.');
    if (file.size > MAX_FILE_MB * 1024 * 1024) return setError(`File too large. Max ${MAX_FILE_MB}MB.`);
    try {
      setUploading(true); setError(null);
      await uploadMemoryPost({ file: await compressImageFile(file), caption, gameLabel });
      setCaption(''); setGameLabel(''); setFile(null);
      await load();
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  };

  const onDelete = async post => {
    if (!post || post.user_id !== currentUserId) return;
    if (!confirm('Delete this photo from the cork board?')) return;
    try {
      setDeletingId(post.id); setError(null);
      await deleteMemoryPost(post);
      setPosts(prev => prev.filter(p => p.id !== post.id));
      setReports(prev => prev.filter(r => r.post_id !== post.id));
    } catch (err) { setError(err.message); }
    finally { setDeletingId(''); }
  };

  const onReport = async post => {
    if (!post || post.user_id === currentUserId) return;
    const reason = prompt('Optional: Why are you reporting this image? (spam, offensive, etc.)') || '';
    try {
      setReportingId(post.id); setError(null);
      await submitMemoryReport(post.id, reason);
      await load();
      alert('Thanks — report submitted for review.');
    } catch (err) { setError(err.message); }
    finally { setReportingId(''); }
  };

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">📌 Mets Cork Board</div>
        <div className="page-sub">Anonymous Uploads · Supabase Storage · Signed Photo URLs</div>
      </div>

      <div className="sched-sub-tabs" style={{ marginBottom: '1rem' }}>
        <button className={`sst-btn ${mode === 'board' ? 'active' : ''}`} onClick={() => setMode('board')}>🖼️ Board</button>
        <button className={`sst-btn ${mode === 'moderation' ? 'active' : ''}`} onClick={() => setMode('moderation')}>🛡️ Moderation Queue {reportQueue.length > 0 && <span className="sst-now">{reportQueue.length}</span>}</button>
      </div>

      {!configured && <div className="card"><div className="card-title">Setup Required</div><div style={{ fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.7 }}>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment, then restart the dev server. After that, apply the SQL + policies from the implementation notes.</div></div>}

      {configured && mode === 'board' && (
        <>
          <form className="card" onSubmit={onUpload} style={{ marginBottom: '1rem' }}>
            <div className="card-title">Upload Game Memory</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}><label>Game Label (optional)</label><input value={gameLabel} onChange={e => setGameLabel(e.target.value)} maxLength={90} placeholder="ex: Mets vs Braves · Apr 4" /></div>
              <div className="form-group" style={{ marginBottom: 0 }}><label>Photo</label><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required /></div>
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}><label>Caption (optional)</label><textarea value={caption} onChange={e => setCaption(e.target.value)} maxLength={220} placeholder="What was happening in this moment?" style={{ minHeight: 72 }} /></div>
            <button className="btn btn-primary" disabled={uploading || !file}>{uploading ? 'Uploading…' : '📍 Pin to Board'}</button>
          </form>

          {error && <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(255,68,68,0.4)' }}><div style={{ fontSize: '0.7rem', color: 'var(--loss)' }}>⚠️ {error}</div></div>}

          {loading ? <div className="card" style={{ padding: '1.25rem', color: 'var(--muted)' }}>Loading board…</div> : (
            <div className="cork-grid">
              {posts.map(post => (
                <article key={post.id} className="cork-card">
                  {post.signedUrl ? <img src={post.signedUrl} alt={post.caption || 'Mets game memory'} className="cork-photo" loading="lazy" onClick={() => setExpandedPost(post)} style={{ cursor: 'zoom-in' }} /> : <div className="cork-photo" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: '0.65rem' }}>Image unavailable</div>}
                  <div className="cork-meta">
                    {post.game_label && <div className="cork-game">{post.game_label}</div>}
                    {post.caption && <div className="cork-caption">{post.caption}</div>}
                    <div className="cork-date">{new Date(post.created_at).toLocaleString()}</div>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
                      {post.user_id === currentUserId && <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(post)} disabled={deletingId === post.id}>{deletingId === post.id ? 'Deleting…' : '🗑️ Delete'}</button>}
                      {post.user_id !== currentUserId && <button type="button" className="btn btn-outline btn-sm" onClick={() => onReport(post)} disabled={reportingId === post.id}>{reportingId === post.id ? 'Reporting…' : '🚩 Report'}</button>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {configured && mode === 'moderation' && (
        <div className="card">
          <div className="card-title">🛡️ Moderation Queue</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginBottom: '0.7rem' }}>Community-reported posts grouped by image. Remove your own post if needed.</div>
          {loading && <div className="game-drilldown-status">Loading moderation queue…</div>}
          {!loading && reportQueue.length === 0 && <div className="game-drilldown-status">No active reports right now.</div>}
          {!loading && reportQueue.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {reportQueue.map(item => (
                <div key={item.post.id} className="game-drilldown-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div>
                      <div className="card-title" style={{ marginBottom: '0.2rem' }}>Post {item.post.id.slice(0, 8)} · {item.count} report{item.count > 1 ? 's' : ''}</div>
                      {item.post.game_label && <div className="cork-game">{item.post.game_label}</div>}
                      {item.post.caption && <div className="cork-caption">{item.post.caption}</div>}
                      <div className="cork-date">Latest report: {new Date(item.latestAt).toLocaleString()}</div>
                      {item.reasons.length > 0 && <div style={{ marginTop: '0.25rem', fontSize: '0.58rem', color: 'var(--text2)' }}>Reasons: {item.reasons.slice(0, 3).join(' · ')}</div>}
                    </div>
                    {item.post.user_id === currentUserId ? (
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.post)} disabled={deletingId === item.post.id}>{deletingId === item.post.id ? 'Deleting…' : 'Remove My Post'}</button>
                    ) : (
                      <span className="badge badge-limit">Owner action only</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {expandedPost?.signedUrl && (
        <div className="overlay" onClick={() => setExpandedPost(null)}>
          <div className="cork-lightbox" onClick={e => e.stopPropagation()}>
            <button type="button" className="btn btn-danger btn-sm cork-lightbox-close" onClick={() => setExpandedPost(null)}>✕ Close</button>
            <img src={expandedPost.signedUrl} alt={expandedPost.caption || 'Expanded Mets game memory'} className="cork-lightbox-img" />
            <div className="cork-lightbox-meta">
              {expandedPost.game_label && <div className="cork-game">{expandedPost.game_label}</div>}
              {expandedPost.caption && <div className="cork-caption">{expandedPost.caption}</div>}
              <div className="cork-date">{new Date(expandedPost.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
