// ─── DATE UTILITIES ──────────────────────────────────────────────────────────
// Centralized helpers so "today" always means the viewer's LOCAL calendar day.
// Using `new Date().toISOString().slice(0, 10)` gives the UTC date, which is
// wrong for anyone east of UTC late in the day and west of UTC early morning —
// games routinely appeared on the "wrong day" because of this.

// Returns YYYY-MM-DD for the given date in the user's local timezone.
// Accepts a Date, timestamp, or ISO string. Defaults to now.
export function localDateStr(input) {
  const d = input == null ? new Date() : (input instanceof Date ? input : new Date(input));
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Returns today's local date string (YYYY-MM-DD).
export function todayLocalStr() {
  return localDateStr(new Date());
}

// Parse an MLB "displayDate" (YYYY-MM-DD string that the API treats as the
// calendar day the game is played on) into a Date pinned to local noon so
// toLocaleDateString() / weekday rendering doesn't drift by a day near the
// day boundary regardless of the viewer's timezone.
export function displayDateToLocalDate(displayDate) {
  if (!displayDate || typeof displayDate !== 'string') return null;
  const [y, m, d] = displayDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}
