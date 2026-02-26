import { useEffect, useState } from 'react';
import { createSignedImageUrl, deleteMemoryPost, getCurrentUserId, getSupabaseSetupState, listMemoryPosts, uploadMemoryPost } from '../supabaseApi.js';

const MAX_FILE_MB = 8;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export default function CorkBoardView() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [gameLabel, setGameLabel] = useState('');
  const [file, setFile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const { configured } = getSupabaseSetupState();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [uid, rows] = await Promise.all([getCurrentUserId(), listMemoryPosts(48)]);
      setCurrentUserId(uid);
      const withUrls = await Promise.all(
        rows.map(async row => {
          try {
            const signedUrl = await createSignedImageUrl(row.image_path);
            return { ...row, signedUrl };
          } catch {
            return { ...row, signedUrl: '' };
          }
        })
      );
      setPosts(withUrls);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    load();
  }, [configured]);

  const onUpload = async e => {
    e.preventDefault();
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Use JPG, PNG, WEBP, or HEIC.');
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_FILE_MB}MB.`);
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await uploadMemoryPost({ file, caption, gameLabel });
      setCaption('');
      setGameLabel('');
      setFile(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async post => {
    if (!post || post.user_id !== currentUserId) return;
    if (!confirm('Delete this photo from the cork board?')) return;

    try {
      setDeletingId(post.id);
      setError(null);
      await deleteMemoryPost(post);
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId('');
    }
  };

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">📌 Mets Cork Board</div>
        <div className="page-sub">Anonymous Uploads · Supabase Storage · Signed Photo URLs</div>
      </div>

      {!configured && (
        <div className="card">
          <div className="card-title">Setup Required</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.7 }}>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment, then restart the dev server.
            After that, apply the SQL + policies from the implementation notes.
          </div>
        </div>
      )}

      {configured && (
        <>
          <form className="card" onSubmit={onUpload} style={{ marginBottom: '1rem' }}>
            <div className="card-title">Upload Game Memory</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Game Label (optional)</label>
                <input value={gameLabel} onChange={e => setGameLabel(e.target.value)} maxLength={90} placeholder="ex: Mets vs Braves · Apr 4" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label>Caption (optional)</label>
              <textarea value={caption} onChange={e => setCaption(e.target.value)} maxLength={220} placeholder="What was happening in this moment?" style={{ minHeight: 72 }} />
            </div>
            <button className="btn btn-primary" disabled={uploading || !file}>
              {uploading ? 'Uploading…' : '📍 Pin to Board'}
            </button>
          </form>

          {error && (
            <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(255,68,68,0.4)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--loss)' }}>⚠️ {error}</div>
            </div>
          )}

          {loading ? (
            <div className="card" style={{ padding: '1.25rem', color: 'var(--muted)' }}>Loading board…</div>
          ) : (
            <div className="cork-grid">
              {posts.map(post => (
                <article key={post.id} className="cork-card">
                  {post.signedUrl ? (
                    <img src={post.signedUrl} alt={post.caption || 'Mets game memory'} className="cork-photo" loading="lazy" />
                  ) : (
                    <div className="cork-photo" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: '0.65rem' }}>Image unavailable</div>
                  )}
                  <div className="cork-meta">
                    {post.game_label && <div className="cork-game">{post.game_label}</div>}
                    {post.caption && <div className="cork-caption">{post.caption}</div>}
                    <div className="cork-date">{new Date(post.created_at).toLocaleString()}</div>
                    {post.user_id === currentUserId && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ marginTop: '0.45rem' }}
                        onClick={() => onDelete(post)}
                        disabled={deletingId === post.id}
                      >
                        {deletingId === post.id ? 'Deleting…' : '🗑️ Delete'}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
