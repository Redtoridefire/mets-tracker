const SB_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SB_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SESSION_KEY = 'metsHQ_supabase_session_v1';

function hasConfig() {
  return !!SB_URL && !!SB_ANON_KEY;
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token || !parsed?.expires_at) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors
  }
}

function isSessionValid(session) {
  if (!session?.expires_at) return false;
  const now = Math.floor(Date.now() / 1000);
  return session.expires_at - now > 60;
}

export async function ensureAnonymousSession() {
  if (!hasConfig()) throw new Error('Supabase config missing');

  const existing = readSession();
  if (isSessionValid(existing)) return existing;

  const resp = await fetch(`${SB_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SB_ANON_KEY,
      Authorization: `Bearer ${SB_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: { app: 'mets-hq' } }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Auth failed (${resp.status}): ${text.slice(0, 120)}`);
  }

  const json = await resp.json();
  const session = json.session || json;
  if (!session?.access_token || !session?.user?.id) throw new Error('No session returned. Enable Anonymous Sign-Ins in Supabase Auth settings.');

  saveSession(session);
  return session;
}

function authHeaders(accessToken, extra = {}) {
  return {
    apikey: SB_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    ...extra,
  };
}

export async function listMemoryPosts(limit = 40) {
  const session = await ensureAnonymousSession();
  const url = `${SB_URL}/rest/v1/memory_posts?select=id,user_id,image_path,caption,game_label,created_at&order=created_at.desc&limit=${limit}`;
  const resp = await fetch(url, { headers: authHeaders(session.access_token) });
  if (!resp.ok) throw new Error(`Load failed (${resp.status})`);
  return resp.json();
}

export async function createSignedImageUrl(imagePath, expiresIn = 3600) {
  const session = await ensureAnonymousSession();
  const path = imagePath.split('/').map(encodeURIComponent).join('/');
  const resp = await fetch(`${SB_URL}/storage/v1/object/sign/memory-board/${path}`, {
    method: 'POST',
    headers: authHeaders(session.access_token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ expiresIn }),
  });
  if (!resp.ok) throw new Error(`Sign failed (${resp.status})`);
  const json = await resp.json();
  const signed = json.signedURL || json.signedUrl;
  if (!signed) throw new Error('Missing signed URL');
  return `${SB_URL}/storage/v1${signed}`;
}

function sanitizeFileName(name) {
  return String(name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
}

export async function uploadMemoryPost({ file, caption = '', gameLabel = '' }) {
  const session = await ensureAnonymousSession();
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanName = sanitizeFileName(file.name).replace(/\.[^.]+$/, '');
  const objectPath = `${session.user.id}/${Date.now()}_${cleanName}.${ext}`;

  const uploadResp = await fetch(`${SB_URL}/storage/v1/object/memory-board/${objectPath.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST',
    headers: authHeaders(session.access_token, {
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'false',
    }),
    body: file,
  });

  if (!uploadResp.ok) {
    const text = await uploadResp.text();
    throw new Error(`Upload failed (${uploadResp.status}): ${text.slice(0, 120)}`);
  }

  const insertResp = await fetch(`${SB_URL}/rest/v1/memory_posts`, {
    method: 'POST',
    headers: authHeaders(session.access_token, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({
      user_id: session.user.id,
      image_path: objectPath,
      caption: caption.slice(0, 220),
      game_label: gameLabel.slice(0, 90),
    }),
  });

  if (!insertResp.ok) {
    const text = await insertResp.text();
    throw new Error(`Metadata save failed (${insertResp.status}): ${text.slice(0, 120)}`);
  }

  const [row] = await insertResp.json();
  return row;
}

export function getSupabaseSetupState() {
  return { configured: hasConfig(), url: SB_URL };
}
