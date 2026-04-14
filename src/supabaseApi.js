const SB_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SB_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SESSION_KEY = 'metsHQ_supabase_session_v1';
const SIGNED_URL_CACHE = new Map();
let pendingAnonymousSession = null;

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

// Combine an external AbortSignal (from the caller) with an internal
// per-attempt timeout signal so aborts propagate correctly either way.
function linkAbortSignal(externalSignal, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
  const onExternalAbort = () => controller.abort(externalSignal?.reason || new Error('aborted'));
  if (externalSignal) {
    if (externalSignal.aborted) onExternalAbort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }
  const cleanup = () => {
    clearTimeout(timeoutId);
    if (externalSignal) externalSignal.removeEventListener?.('abort', onExternalAbort);
  };
  return { signal: controller.signal, cleanup };
}

async function fetchWithRetry(url, options = {}, retries = 2, delayMs = 350, timeoutMs = 12_000) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    const { signal, cleanup } = linkAbortSignal(options.signal, timeoutMs);
    try {
      const resp = await fetch(url, { ...options, signal });
      cleanup();
      if (resp.ok || (resp.status >= 400 && resp.status < 500)) return resp;
      lastErr = new Error(`HTTP ${resp.status}`);
    } catch (e) {
      cleanup();
      if (options.signal?.aborted) throw e;
      lastErr = e?.name === 'AbortError' ? new Error('Request timed out') : e;
    }
    if (i < retries) await new Promise(r => setTimeout(r, delayMs * (i + 1)));
  }
  throw lastErr || new Error('Network request failed');
}

export async function ensureAnonymousSession() {
  if (!hasConfig()) throw new Error('Supabase config missing');

  const existing = readSession();
  if (isSessionValid(existing)) return existing;
  if (pendingAnonymousSession) return pendingAnonymousSession;

  const work = (async () => {
    const resp = await fetchWithRetry(`${SB_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        apikey: SB_ANON_KEY,
        Authorization: `Bearer ${SB_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { app: 'mets-hq' } }),
    }, 1, 400, 10_000);

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Auth failed (${resp.status}): ${text.slice(0, 120)}`);
    }

    const json = await resp.json();
    const session = json.session || json;
    if (!session?.access_token || !session?.user?.id) throw new Error('No session returned. Enable Anonymous Sign-Ins in Supabase Auth settings.');

    saveSession(session);
    return session;
  })();

  // Always clear pendingAnonymousSession when the work settles — regardless
  // of which caller awaits it — so a failed/hung signup never wedges the
  // singleton and blocks subsequent retries.
  pendingAnonymousSession = work.finally(() => { pendingAnonymousSession = null; });
  return pendingAnonymousSession;
}

function authHeaders(accessToken, extra = {}) {
  return {
    apikey: SB_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    ...extra,
  };
}


function looksLikeMissingTable(respText = '') {
  return respText.includes('PGRST205') || respText.includes('relation') || respText.includes('does not exist') || respText.includes('board_') || respText.includes('boards');
}

function makeInviteToken() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export async function listMemoryPosts(limit = 40, offset = 0, boardId = null) {
  const session = await ensureAnonymousSession();
  const boardFilter = boardId ? `&board_id=eq.${encodeURIComponent(boardId)}` : '';
  const url = `${SB_URL}/rest/v1/memory_posts?select=id,user_id,image_path,caption,game_label,created_at,board_id&order=created_at.desc&limit=${limit}&offset=${offset}${boardFilter}`;
  const resp = await fetchWithRetry(url, { headers: authHeaders(session.access_token) });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Load failed (${resp.status}): ${text.slice(0, 160)}`);
  }
  return resp.json();
}

export async function createSignedImageUrl(imagePath, expiresIn = 3600) {
  const now = Date.now();
  const cached = SIGNED_URL_CACHE.get(imagePath);
  if (cached && cached.expiresAt > now + 60_000) return cached.url;

  const session = await ensureAnonymousSession();
  const path = imagePath.split('/').map(encodeURIComponent).join('/');
  const resp = await fetchWithRetry(`${SB_URL}/storage/v1/object/sign/memory-board/${path}`, {
    method: 'POST',
    headers: authHeaders(session.access_token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ expiresIn }),
  });
  if (!resp.ok) throw new Error(`Sign failed (${resp.status})`);
  const json = await resp.json();
  const signed = json.signedURL || json.signedUrl;
  if (!signed) throw new Error('Missing signed URL');
  const url = `${SB_URL}/storage/v1${signed}`;
  SIGNED_URL_CACHE.set(imagePath, { url, expiresAt: now + (expiresIn * 1000) });
  return url;
}

function sanitizeFileName(name) {
  return String(name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
}

export async function uploadMemoryPost({ file, caption = '', gameLabel = '', boardId = null, signal, onStage }) {
  const stage = s => { try { onStage?.(s); } catch { /* ignore */ } };

  stage('auth');
  const session = await ensureAnonymousSession();
  if (signal?.aborted) throw new Error('Upload canceled');

  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanName = sanitizeFileName(file.name || 'photo').replace(/\.[^.]+$/, '');
  const objectPath = `${session.user.id}/${Date.now()}_${cleanName}.${ext}`;

  // Pre-read the File into an ArrayBuffer before starting the network upload.
  // On iOS/Safari, a File reference from the camera/photo picker can have
  // lazily-loaded data that fails mid-stream; resolving it to a concrete
  // Blob avoids those hangs and gives us a real byte count to send.
  stage('prepare');
  let body;
  try {
    const buf = await file.arrayBuffer();
    body = new Blob([buf], { type: file.type || 'application/octet-stream' });
  } catch (e) {
    throw new Error(`Could not read photo: ${e?.message || 'unknown error'}`);
  }
  if (signal?.aborted) throw new Error('Upload canceled');

  stage('upload');
  // Single-shot upload with a generous timeout. We deliberately do NOT
  // retry here — retrying a 90MB upload on a flaky mobile connection
  // usually makes the experience worse, not better.
  const uploadResp = await fetchWithRetry(`${SB_URL}/storage/v1/object/memory-board/${objectPath.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST',
    headers: authHeaders(session.access_token, {
      'Content-Type': body.type || 'application/octet-stream',
      'x-upsert': 'false',
    }),
    body,
    signal,
  }, 0, 0, 90_000);

  if (!uploadResp.ok) {
    const text = await uploadResp.text();
    throw new Error(`Upload failed (${uploadResp.status}): ${text.slice(0, 160)}`);
  }

  stage('save');
  const insertResp = await fetchWithRetry(`${SB_URL}/rest/v1/memory_posts`, {
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
      ...(boardId ? { board_id: boardId } : {}),
    }),
    signal,
  }, 1, 350, 15_000);

  if (!insertResp.ok) {
    const text = await insertResp.text();
    throw new Error(`Metadata save failed (${insertResp.status}): ${text.slice(0, 160)}`);
  }

  const payload = await insertResp.json();
  const row = Array.isArray(payload) ? payload[0] : payload;
  if (!row?.id) throw new Error('Metadata save returned no row');
  stage('done');
  return row;
}

export async function getCurrentUserId() {
  const session = await ensureAnonymousSession();
  return session.user.id;
}

export async function deleteMemoryPost(post, opts = {}) {
  const session = await ensureAnonymousSession();
  if (!post?.id || !post?.image_path) throw new Error('Invalid post');

  const deleteRowResp = await fetch(`${SB_URL}/rest/v1/memory_posts?id=eq.${encodeURIComponent(post.id)}`, {
    method: 'DELETE',
    headers: authHeaders(session.access_token, { Prefer: 'return=minimal' }),
  });
  if (!deleteRowResp.ok) {
    const text = await deleteRowResp.text();
    throw new Error(`Delete failed (${deleteRowResp.status}): ${text.slice(0, 120)}`);
  }

  const objectPath = post.image_path.split('/').map(encodeURIComponent).join('/');
  const deleteObjResp = await fetch(`${SB_URL}/storage/v1/object/memory-board/${objectPath}`, {
    method: 'DELETE',
    headers: authHeaders(session.access_token),
  });
  if (!deleteObjResp.ok && !opts.bestEffortObjectDelete) {
    const text = await deleteObjResp.text();
    throw new Error(`Image delete failed (${deleteObjResp.status}): ${text.slice(0, 120)}`);
  }

  SIGNED_URL_CACHE.delete(post.image_path);
}

export async function submitMemoryReport(postId, reason = '') {
  const session = await ensureAnonymousSession();
  if (!postId) throw new Error('Missing post id');

  const resp = await fetch(`${SB_URL}/rest/v1/memory_reports`, {
    method: 'POST',
    headers: authHeaders(session.access_token, {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    }),
    body: JSON.stringify({
      post_id: postId,
      reporter_id: session.user.id,
      reason: String(reason || '').slice(0, 250),
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Report failed (${resp.status}): ${text.slice(0, 120)}`);
  }
}

export async function listMemoryReports(limit = 80, boardId = null) {
  const session = await ensureAnonymousSession();
  const boardFilter = boardId ? `&memory_posts.board_id=eq.${encodeURIComponent(boardId)}` : '';
  const url = `${SB_URL}/rest/v1/memory_reports?select=id,post_id,reporter_id,reason,created_at,memory_posts(id,user_id,image_path,caption,game_label,created_at,board_id)&order=created_at.desc&limit=${limit}${boardFilter}`;
  const resp = await fetchWithRetry(url, { headers: authHeaders(session.access_token) });
  if (!resp.ok) {
    const text = await resp.text();
    if (resp.status === 404 || text.includes('PGRST205') || text.includes('memory_reports')) return [];
    throw new Error(`Report load failed (${resp.status}): ${text.slice(0, 120)}`);
  }
  return resp.json();
}

export function getSupabaseSetupState() {
  return { configured: hasConfig(), url: SB_URL };
}


export async function listUserBoards() {
  const session = await ensureAnonymousSession();
  const uid = session.user.id;

  const ownerResp = await fetchWithRetry(`${SB_URL}/rest/v1/boards?select=id,name,owner_id,created_at&owner_id=eq.${encodeURIComponent(uid)}&order=created_at.desc`, {
    headers: authHeaders(session.access_token),
  });
  if (!ownerResp.ok) {
    const text = await ownerResp.text();
    if (ownerResp.status === 404 || looksLikeMissingTable(text)) return [];
    throw new Error(`Boards load failed (${ownerResp.status}): ${text.slice(0, 120)}`);
  }
  const owners = await ownerResp.json();

  const memberResp = await fetchWithRetry(`${SB_URL}/rest/v1/board_members?select=role,board:boards(id,name,owner_id,created_at)&user_id=eq.${encodeURIComponent(uid)}`, {
    headers: authHeaders(session.access_token),
  });
  if (!memberResp.ok) {
    const text = await memberResp.text();
    if (memberResp.status === 404 || looksLikeMissingTable(text)) return owners.map(b => ({ ...b, myRole: 'owner' }));
    throw new Error(`Board membership load failed (${memberResp.status}): ${text.slice(0, 120)}`);
  }
  const members = await memberResp.json();

  const out = new Map();
  owners.forEach(b => out.set(b.id, { ...b, myRole: 'owner' }));
  members.forEach(m => {
    if (!m.board?.id) return;
    const prev = out.get(m.board.id);
    if (prev) return;
    out.set(m.board.id, { ...m.board, myRole: m.role || 'contributor' });
  });
  return Array.from(out.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function createBoard(name) {
  const session = await ensureAnonymousSession();
  const payload = {
    owner_id: session.user.id,
    name: String(name || 'Shared Board').slice(0, 80),
  };
  const resp = await fetch(`${SB_URL}/rest/v1/boards`, {
    method: 'POST',
    headers: authHeaders(session.access_token, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Create board failed (${resp.status}): ${text.slice(0, 120)}`);
  }
  const [row] = await resp.json();

  await fetch(`${SB_URL}/rest/v1/board_members`, {
    method: 'POST',
    headers: authHeaders(session.access_token, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({ board_id: row.id, user_id: session.user.id, role: 'owner' }),
  });
  return { ...row, myRole: 'owner' };
}

export async function createBoardInvite(boardId, expiresHours = 72) {
  const session = await ensureAnonymousSession();
  const token = makeInviteToken();
  const expiresAt = new Date(Date.now() + (Math.max(1, expiresHours) * 60 * 60 * 1000)).toISOString();

  const resp = await fetch(`${SB_URL}/rest/v1/board_invites`, {
    method: 'POST',
    headers: authHeaders(session.access_token, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({ board_id: boardId, token, created_by: session.user.id, expires_at: expiresAt, used_count: 0 }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Invite create failed (${resp.status}): ${text.slice(0, 120)}`);
  }
  return token;
}

export async function acceptBoardInvite(token) {
  const session = await ensureAnonymousSession();
  const resp = await fetchWithRetry(`${SB_URL}/rest/v1/board_invites?select=id,board_id,expires_at,used_count,max_uses&token=eq.${encodeURIComponent(token)}&limit=1`, {
    headers: authHeaders(session.access_token),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Invite lookup failed (${resp.status}): ${text.slice(0, 120)}`);
  }
  const [invite] = await resp.json();
  if (!invite?.board_id) throw new Error('Invite link is invalid or expired.');
  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) throw new Error('Invite link expired.');
  if (invite.max_uses && invite.used_count >= invite.max_uses) throw new Error('Invite link has reached max uses.');

  const upsertMember = await fetch(`${SB_URL}/rest/v1/board_members`, {
    method: 'POST',
    headers: authHeaders(session.access_token, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({ board_id: invite.board_id, user_id: session.user.id, role: 'contributor' }),
  });
  if (!upsertMember.ok) {
    const text = await upsertMember.text();
    throw new Error(`Invite accept failed (${upsertMember.status}): ${text.slice(0, 120)}`);
  }

  await fetch(`${SB_URL}/rest/v1/board_invites?id=eq.${encodeURIComponent(invite.id)}`, {
    method: 'PATCH',
    headers: authHeaders(session.access_token, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({ used_count: (invite.used_count || 0) + 1 }),
  });

  return invite.board_id;
}
