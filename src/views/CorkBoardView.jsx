import { useEffect, useMemo, useState } from 'react';
import {
  acceptBoardInvite,
  createBoard,
  createBoardInvite,
  createSignedImageUrl,
  deleteMemoryPost,
  getCurrentUserId,
  getSupabaseSetupState,
  listMemoryPosts,
  listMemoryReports,
  listUserBoards,
  submitMemoryReport,
  uploadMemoryPost,
} from '../supabaseApi.js';

const MAX_FILE_MB = 8;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const PAGE_SIZE = 24;


function withTimeout(promise, ms, label = 'Operation timed out') {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(label)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}


function inferMimeType(file) {
  const explicit = (file?.type || '').toLowerCase();
  if (explicit) return explicit;
  const ext = String(file?.name || '').split('.').pop()?.toLowerCase() || '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'heif') return 'image/heif';
  return '';
}

async function decodeImageToCanvas(file, maxEdge) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas;
}

async function decodeImageFallback(file, maxEdge) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(url);
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image decode failed'));
    };
    img.src = url;
  });
}

async function compressImageFile(file, maxEdge = 2200, quality = 0.82) {
  try {
    let canvas = null;
    try {
      canvas = await decodeImageToCanvas(file, maxEdge);
    } catch {
      canvas = await decodeImageFallback(file, maxEdge);
    }
    if (!canvas) return file;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;
    const baseName = (file.name || 'upload').replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
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
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState('');
  const [boardName, setBoardName] = useState('');
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const { configured } = getSupabaseSetupState();

  const activeBoard = useMemo(() => boards.find(b => b.id === activeBoardId) || null, [boards, activeBoardId]);
  const boardRole = activeBoard?.myRole || 'contributor';
  const canAdminBoard = boardRole === 'owner';

  const hydratePosts = async (rows, uid, ownerMode = false) => {
    const hydrated = await Promise.all(rows.map(async row => {
      try { return { ...row, signedUrl: await createSignedImageUrl(row.image_path), broken: false }; }
      catch { return { ...row, signedUrl: '', broken: true }; }
    }));

    const brokenOwned = hydrated.filter(p => p.broken && (p.user_id === uid || ownerMode));
    if (brokenOwned.length > 0) {
      await Promise.allSettled(brokenOwned.map(p => deleteMemoryPost(p, { bestEffortObjectDelete: true })));
    }
    return hydrated.filter(p => !p.broken);
  };

  const load = async (reset = true, boardIdOverride = null, { silent = false } = {}) => {
    try {
      if (!silent) { if (reset) setLoading(true); else setLoadingMore(true); }
      setError(null);

      const baseOffset = reset ? 0 : offset;
      const boardId = boardIdOverride === null ? activeBoardId : boardIdOverride;
      const [uid, boardRows, rows, reportRows] = await Promise.all([
        getCurrentUserId(),
        listUserBoards(),
        listMemoryPosts(PAGE_SIZE, baseOffset, boardId || undefined),
        reset ? listMemoryReports(120, boardId || undefined) : Promise.resolve(reports),
      ]);

      setCurrentUserId(uid);
      setBoards(boardRows || []);
      const nextBoardId = boardId || boardRows?.[0]?.id || '';
      if (!boardId && nextBoardId !== activeBoardId) setActiveBoardId(nextBoardId);
      if (reset) setReports(reportRows || []);

      const cleanPosts = await hydratePosts(rows, uid, canAdminBoard);
      const merged = reset ? cleanPosts : [...posts, ...cleanPosts.filter(np => !posts.some(p => p.id === np.id))];
      setPosts(merged);
      setOffset(baseOffset + rows.length);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (e) {
      if (!silent) setError(e.message);
    } finally {
      if (!silent) { setLoading(false); setLoadingMore(false); }
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
    load(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  useEffect(() => {
    if (!configured) return;
    const token = new URLSearchParams(window.location.search).get('invite');
    if (!token) return;
    (async () => {
      try {
        setInviteBusy(true);
        const boardId = await acceptBoardInvite(token);
        const url = new URL(window.location.href);
        url.searchParams.delete('invite');
        window.history.replaceState({}, '', url.toString());
        await load(true, boardId);
        setActiveBoardId(boardId);
      } catch (e) {
        setError(e.message);
      } finally {
        setInviteBusy(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  useEffect(() => {
    if (!configured || !activeBoardId) return;
    load(true, activeBoardId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBoardId]);

  useEffect(() => {
    if (!expandedPost) return;
    const onKey = e => { if (e.key === 'Escape') setExpandedPost(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expandedPost]);

  const onCreateBoard = async e => {
    e.preventDefault();
    if (!boardName.trim()) return;
    try {
      setCreatingBoard(true);
      const board = await createBoard(boardName.trim());
      setBoardName('');
      setActiveBoardId(board.id);
      await load(true, board.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingBoard(false);
    }
  };

  const onCreateInvite = async () => {
    if (!activeBoardId || !canAdminBoard) return;
    try {
      setInviteBusy(true);
      const token = await createBoardInvite(activeBoardId);
      const url = new URL(window.location.href);
      url.searchParams.set('invite', token);
      const link = url.toString();
      setInviteLink(link);
      try { await navigator.clipboard.writeText(link); } catch { /* ignore */ }
    } catch (e) {
      setError(e.message);
    } finally {
      setInviteBusy(false);
    }
  };

  const onUpload = async e => {
    e.preventDefault();
    if (!file) return;
    const detectedType = inferMimeType(file);
    if (!ALLOWED_TYPES.has(detectedType)) return setError('Unsupported file type. Use JPG, PNG, WEBP, or HEIC.');
    if (file.size > MAX_FILE_MB * 1024 * 1024) return setError(`File too large. Max ${MAX_FILE_MB}MB.`);
    try {
      setUploading(true); setError(null);
      const preparedFile = await withTimeout(compressImageFile(file), 15_000, 'Image preparation timed out. Please try a smaller photo.');
      const newRow = await withTimeout(uploadMemoryPost({ file: preparedFile, caption, gameLabel, boardId: activeBoardId || undefined }), 60_000, 'Upload timed out. Please retry.');

      let signedUrl = '';
      try {
        signedUrl = await withTimeout(createSignedImageUrl(newRow.image_path), 10_000, 'Image uploaded but preview link timed out.');
      } catch {
        signedUrl = '';
      }

      setPosts(prev => [{ ...newRow, signedUrl, broken: false }, ...prev.filter(p => p.id !== newRow.id)]);
      setCaption(''); setGameLabel(''); setFile(null);

      // Refresh in background without showing a loading spinner.
      load(true, activeBoardId, { silent: true }).catch(() => {});
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  };

  const onDelete = async post => {
    const canDelete = post && (post.user_id === currentUserId || canAdminBoard);
    if (!canDelete) return;
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
      await withTimeout(load(true, activeBoardId), 20_000, 'Refresh timed out. Pull to refresh.');
      alert('Thanks — report submitted for review.');
    } catch (err) { setError(err.message); }
    finally { setReportingId(''); }
  };

  const onLoadMore = async () => {
    if (!hasMore || loadingMore || loading) return;
    await load(false, activeBoardId);
  };

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">📌 Mets Cork Board</div>
        <div className="page-sub">Shared Boards · Invite Links · Owner/Admin or Uploader Delete</div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-title">Board Access</div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.6rem' }}>
          <select value={activeBoardId} onChange={e => setActiveBoardId(e.target.value)} style={{ minWidth: 220 }}>
            {boards.length === 0 && <option value="">Default Board (legacy)</option>}
            {boards.map(b => <option key={b.id} value={b.id}>{b.name} · {b.myRole}</option>)}
          </select>
          <button className="btn btn-outline btn-sm" onClick={() => load(true, activeBoardId)} disabled={loading || inviteBusy}>Refresh</button>
          {canAdminBoard && <button className="btn btn-primary btn-sm" onClick={onCreateInvite} disabled={inviteBusy}>{inviteBusy ? 'Creating…' : '🔗 Create Invite Link'}</button>}
        </div>
        {inviteLink && <div style={{ fontSize: '0.6rem', color: 'var(--text2)', wordBreak: 'break-all' }}>Invite link: {inviteLink}</div>}
        <form onSubmit={onCreateBoard} style={{ marginTop: '0.7rem', display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={boardName} onChange={e => setBoardName(e.target.value)} maxLength={80} placeholder="Create a new board name" style={{ minWidth: 220 }} />
          <button className="btn btn-outline btn-sm" disabled={creatingBoard}>{creatingBoard ? 'Creating…' : '➕ Create Board'}</button>
        </form>
        <div style={{ marginTop: '0.5rem', fontSize: '0.58rem', color: 'var(--muted)' }}>
          Contributors can upload + report. Uploaders can delete their own photos. Board owner can delete any photo.
        </div>
      </div>

      <div className="sched-sub-tabs" style={{ marginBottom: '1rem' }}>
        <button className={`sst-btn ${mode === 'board' ? 'active' : ''}`} onClick={() => setMode('board')}>🖼️ Board</button>
        <button className={`sst-btn ${mode === 'moderation' ? 'active' : ''}`} onClick={() => setMode('moderation')}>🛡️ Moderation Queue {reportQueue.length > 0 && <span className="sst-now">{reportQueue.length}</span>}</button>
      </div>

      {!configured && <div className="card"><div className="card-title">Setup Required</div><div style={{ fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.7 }}>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment, then restart the dev server. After that, apply the SQL + policies from the implementation notes.</div></div>}

      {configured && mode === 'board' && (
        <>
          {inviteBusy && <div className="card" style={{ marginBottom: '1rem', fontSize: '0.66rem', color: 'var(--text2)' }}>Processing invite…</div>}
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
              {posts.map(post => {
                const canDelete = post.user_id === currentUserId || canAdminBoard;
                return (
                  <article key={post.id} className="cork-card">
                    {post.signedUrl ? <img src={post.signedUrl} alt={post.caption || 'Mets game memory'} className="cork-photo" loading="lazy" onClick={() => setExpandedPost(post)} style={{ cursor: 'zoom-in' }} /> : <div className="cork-photo" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: '0.65rem' }}>Image unavailable</div>}
                    <div className="cork-meta">
                      {post.game_label && <div className="cork-game">{post.game_label}</div>}
                      {post.caption && <div className="cork-caption">{post.caption}</div>}
                      <div className="cork-date">{new Date(post.created_at).toLocaleString()}</div>
                      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: '0.45rem' }}>
                        {canDelete && <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(post)} disabled={deletingId === post.id}>{deletingId === post.id ? 'Deleting…' : '🗑️ Delete'}</button>}
                        {!canDelete && <button type="button" className="btn btn-outline btn-sm" onClick={() => onReport(post)} disabled={reportingId === post.id}>{reportingId === post.id ? 'Reporting…' : '🚩 Report'}</button>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {!loading && hasMore && (
            <div style={{ marginTop: '0.9rem', textAlign: 'center' }}>
              <button className="btn btn-outline" onClick={onLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading more…' : 'Load More Photos'}
              </button>
            </div>
          )}
        </>
      )}

      {configured && mode === 'moderation' && (
        <div className="card">
          <div className="card-title">🛡️ Moderation Queue</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginBottom: '0.7rem' }}>Community-reported posts grouped by image. Board owners can remove any post.</div>
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
                    {(item.post.user_id === currentUserId || canAdminBoard) ? (
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.post)} disabled={deletingId === item.post.id}>{deletingId === item.post.id ? 'Deleting…' : 'Remove Post'}</button>
                    ) : (
                      <span className="badge badge-limit">Owner/admin action only</span>
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
