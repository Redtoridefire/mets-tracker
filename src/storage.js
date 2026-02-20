// ─── STORAGE LAYER ───────────────────────────────────────────────────────────
// Each user gets their own isolated data in localStorage.
// Key structure:
//   metsHQ_profiles         → [{id, name, avatar, createdAt}]
//   metsHQ_activeProfile    → profileId string
//   metsHQ_data_<profileId> → { gameRecords, eggrollLog }

const PREFIX = 'metsHQ_';

function safe(fn, fallback) {
  try { return fn(); } catch { return fallback; }
}

// Cryptographically secure ID using Web Crypto API (available in all modern browsers)
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return 'p_' + crypto.randomUUID();
  }
  // Fallback: use getRandomValues for entropy (not just Math.random)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(4);
    crypto.getRandomValues(arr);
    return 'p_' + [...arr].map(n => n.toString(16).padStart(8, '0')).join('');
  }
  // Last resort fallback (should never reach this in any modern browser)
  return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 11);
}

// ── Profiles ─────────────────────────────────────────────────────────────────

export function getProfiles() {
  return safe(() => JSON.parse(localStorage.getItem(PREFIX + 'profiles') || '[]'), []);
}

export function saveProfiles(profiles) {
  safe(() => localStorage.setItem(PREFIX + 'profiles', JSON.stringify(profiles)));
}

export function createProfile(name, avatar = '⚾') {
  // Sanitize inputs: limit lengths, strip any HTML-ish characters
  const safeName   = String(name).replace(/[<>"'&]/g, '').trim().slice(0, 40) || 'Fan';
  const safeAvatar = String(avatar).slice(0, 8);
  const id = generateId();
  const profile = { id, name: safeName, avatar: safeAvatar, createdAt: new Date().toISOString() };
  const profiles = getProfiles();
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function deleteProfile(id) {
  const profiles = getProfiles().filter(p => p.id !== id);
  saveProfiles(profiles);
  safe(() => localStorage.removeItem(PREFIX + 'data_' + id));
  // Also clear any API cache entries (they're harmless but clean up storage)
  safe(() => {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + 'cache_')) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  });
  if (getActiveProfileId() === id) {
    safe(() => localStorage.removeItem(PREFIX + 'activeProfile'));
  }
}

// ── Active Profile ────────────────────────────────────────────────────────────

export function getActiveProfileId() {
  return safe(() => localStorage.getItem(PREFIX + 'activeProfile'), null);
}

export function setActiveProfileId(id) {
  safe(() => localStorage.setItem(PREFIX + 'activeProfile', id));
}

// ── User Data ─────────────────────────────────────────────────────────────────

const DEFAULT_DATA = () => ({ gameRecords: {}, eggrollLog: {} });

export function getUserData(profileId) {
  if (!profileId) return DEFAULT_DATA();
  return safe(
    () => JSON.parse(localStorage.getItem(PREFIX + 'data_' + profileId) || 'null') || DEFAULT_DATA(),
    DEFAULT_DATA()
  );
}

export function saveUserData(profileId, data) {
  if (!profileId) return;
  safe(() => localStorage.setItem(PREFIX + 'data_' + profileId, JSON.stringify(data)));
}

export function patchUserData(profileId, patch) {
  const current = getUserData(profileId);
  const next = { ...current, ...patch };
  saveUserData(profileId, next);
  return next;
}

// ── Export / Import ───────────────────────────────────────────────────────────

export function exportProfileData(profileId) {
  const profile = getProfiles().find(p => p.id === profileId);
  if (!profile) throw new Error('Profile not found');
  const data = getUserData(profileId);
  return JSON.stringify({ profile, data, exportedAt: new Date().toISOString(), appVersion: 2 }, null, 2);
}

// Import a JSON backup, creating a new profile (fresh ID to avoid collisions)
export function importProfileData(jsonString) {
  let parsed;
  try { parsed = JSON.parse(jsonString); } catch {
    throw new Error('Invalid file — could not parse JSON');
  }
  if (!parsed?.profile?.name) throw new Error('Invalid backup — missing profile name');
  if (typeof parsed?.data !== 'object') throw new Error('Invalid backup — missing data block');

  // Sanitize imported data: only allow known shape, clamp string lengths
  const sanitizeRecord = r => {
    if (!r || typeof r !== 'object') return null;
    return {
      attended:       !!r.attended,
      result:         ['W','L',''].includes(r.result) ? r.result : '',
      section:        String(r.section  || '').slice(0, 10),
      row:            String(r.row      || '').slice(0, 10),
      seat:           String(r.seat     || '').slice(0, 10),
      promoCollected: !!r.promoCollected,
      who:            String(r.who      || '').slice(0, 200),
      food:           String(r.food     || '').slice(0, 200),
      notes:          String(r.notes    || '').slice(0, 1000),
      costTickets:    Math.max(0, parseFloat(r.costTickets) || 0),
      costFood:       Math.max(0, parseFloat(r.costFood)    || 0),
      costParking:    Math.max(0, parseFloat(r.costParking) || 0),
      costMerch:      Math.max(0, parseFloat(r.costMerch)   || 0),
      totalCost:      Math.max(0, parseFloat(r.totalCost)   || 0),
    };
  };

  const sanitizeEggroll = e => {
    if (!e || typeof e !== 'object') return null;
    return {
      logged:  !!e.logged,
      flavor:  String(e.flavor || '').slice(0, 100),
      rating:  Math.min(5, Math.max(1, parseInt(e.rating) || 3)),
      notes:   String(e.notes  || '').slice(0, 500),
      date:    /^\d{4}-\d{2}-\d{2}$/.test(e.date || '') ? e.date : '',
    };
  };

  const safeGameRecords = {};
  for (const [k, v] of Object.entries(parsed.data.gameRecords || {})) {
    const id = parseInt(k);
    if (id >= 1 && id <= 100) { // only valid promo IDs
      const rec = sanitizeRecord(v);
      if (rec) safeGameRecords[k] = rec;
    }
  }

  const safeEggrollLog = {};
  for (const [k, v] of Object.entries(parsed.data.eggrollLog || {})) {
    const entry = sanitizeEggroll(v);
    if (entry) safeEggrollLog[String(k).slice(0, 60)] = entry;
  }

  const newProfile = createProfile(parsed.profile.name, parsed.profile.avatar || '⚾');
  saveUserData(newProfile.id, { gameRecords: safeGameRecords, eggrollLog: safeEggrollLog });
  return newProfile;
}

// ── Storage Health ────────────────────────────────────────────────────────────

export function getStorageInfo() {
  try {
    const test = '__metsHQ_quota_test__';
    localStorage.setItem(test, 'x');
    localStorage.removeItem(test);
    let usedBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      usedBytes += (k.length + (localStorage.getItem(k) || '').length) * 2; // UTF-16
    }
    // localStorage limit is typically 5MB (5_242_880 bytes)
    return { available: true, usedBytes, limitBytes: 5_242_880 };
  } catch {
    return { available: false, usedBytes: 0, limitBytes: 5_242_880 };
  }
}
