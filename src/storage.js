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

// ── Profiles ─────────────────────────────────────────────────────────────────

export function getProfiles() {
  return safe(() => JSON.parse(localStorage.getItem(PREFIX + 'profiles') || '[]'), []);
}

export function saveProfiles(profiles) {
  safe(() => localStorage.setItem(PREFIX + 'profiles', JSON.stringify(profiles)));
}

export function createProfile(name, avatar = '⚾') {
  const id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  const profile = { id, name, avatar, createdAt: new Date().toISOString() };
  const profiles = getProfiles();
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function deleteProfile(id) {
  const profiles = getProfiles().filter(p => p.id !== id);
  saveProfiles(profiles);
  safe(() => localStorage.removeItem(PREFIX + 'data_' + id));
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
