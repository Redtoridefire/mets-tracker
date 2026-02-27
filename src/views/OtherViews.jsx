import { useState, useMemo } from 'react';
import { PROMOS, EGGROLL_TEAMS } from '../data/promos.js';
import { useMLBFullSchedule, useMLBGameDetail } from '../hooks.js';

// ─── FULL SCHEDULE SECTION ────────────────────────────────────────────────────
function FullScheduleSection({ gameType, userData, onEditGame }) {
  const { games, loading, error } = useMLBFullSchedule();
  const { gameRecords = {} }      = userData || {};
  const [expandedGamePk, setExpandedGamePk] = useState(null);
  const { linescore, loading: detailLoading } = useMLBGameDetail(expandedGamePk);
  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() =>
    games.filter(g => g.gameType === gameType),
    [games, gameType]
  );

  const byMonth = useMemo(() => {
    const map = {};
    for (const g of filtered) {
      const key = g.displayDate?.slice(0, 7) || 'Unknown';
      if (!map[key]) map[key] = [];
      map[key].push(g);
    }
    return map;
  }, [filtered]);

  const monthKeys = Object.keys(byMonth).sort();

  function statusLabel(g) {
    const s = g.statusCode || '';
    if (s === 'I') return <span className="badge badge-live">LIVE</span>;
    if (['F','FO','FT','FR','FG'].includes(s)) {
      if (g.result === 'W') return <span className="badge badge-win">W</span>;
      if (g.result === 'L') return <span className="badge badge-loss">L</span>;
      return <span style={{ color: 'var(--muted)', fontSize: '0.65rem' }}>Final</span>;
    }
    if (g.displayDate < today) return <span style={{ color: 'var(--muted)', fontSize: '0.62rem' }}>Past</span>;
    if (g.displayDate === today) return <span className="badge badge-gold">TODAY</span>;
    return <span style={{ color: 'var(--muted)', fontSize: '0.62rem' }}>—</span>;
  }

  function scoreLabel(g) {
    const s = g.statusCode || '';
    const done  = ['F','FO','FT','FR','FG'].includes(s);
    const live  = s === 'I';
    if ((done || live) && g.metsScore !== undefined && g.oppScore !== undefined) {
      const color = g.result === 'W' ? 'var(--win)' : g.result === 'L' ? 'var(--loss)' : 'var(--text2)';
      return <span style={{ fontFamily: 'Bebas Neue', fontSize: '1rem', color }}>{g.metsScore}–{g.oppScore}</span>;
    }
    return null;
  }

  function monthLabel(key) {
    const [year, month] = key.split('-').map(Number);
    if (!year || !month) return key;
    const d = new Date(year, month - 1, 1, 12, 0, 0);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem' }}>
      Loading schedule from MLB…
    </div>
  );
  if (error) return (
    <div style={{ padding: '1rem', color: 'var(--loss)', fontSize: '0.78rem', background: 'rgba(255,68,68,0.06)', borderRadius: 6 }}>
      ⚠ Could not load schedule: {error}
    </div>
  );
  if (filtered.length === 0) return (
    <div style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.78rem' }}>
      No {gameType === 'S' ? 'spring training' : 'regular season'} games found for 2026.
    </div>
  );

  const selectedInnings = linescore?.innings || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {monthKeys.map(mKey => (
        <div key={mKey}>
          <div style={{ fontFamily: 'Oswald', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,89,16,0.2)' }}>
            {monthLabel(mKey)} ({byMonth[mKey].length} games)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {byMonth[mKey].map(g => {
              const isPast   = g.displayDate < today;
              const isToday  = g.displayDate === today;
              const recKey   = `mlb_${g.gamePk}`;
              const rec      = gameRecords[recKey] || {};
              const logged   = rec.attended || rec.planned;
              const isExpanded = expandedGamePk === g.gamePk;
              const gameObj  = {
                id: recKey, gamePk: g.gamePk,
                emoji: g.isHome ? '🏟️' : '✈️',
                opponent: g.oppName, oppShort: g.oppName?.split(' ').pop(),
                display: new Date(g.displayDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: '', icon: '⚾', promo: gameType === 'S' ? 'Spring Training' : 'Regular Season',
              };
              return (
                <div key={g.gamePk}>
                  <div className={`full-sched-row ${isToday ? 'full-sched-today' : ''} ${isPast ? 'full-sched-past' : ''}`} onClick={() => setExpandedGamePk(isExpanded ? null : g.gamePk)} style={{ cursor: 'pointer' }}>
                    <div className="fsr-date">{new Date(g.displayDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="fsr-matchup">
                      <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'Oswald', marginRight: '0.3rem' }}>{g.isHome ? 'vs' : '@'}</span>
                      <span style={{ fontFamily: 'Oswald', fontSize: '0.82rem', color: isPast ? 'var(--muted)' : 'var(--text)' }}>{g.oppName}</span>
                      {g.broadcasts?.length > 0 && (
                        <span className="fsr-broadcast">{g.broadcasts.slice(0, 2).join(' · ')}</span>
                      )}
                    </div>
                    <div className="fsr-venue" style={{ color: 'var(--muted)', fontSize: '0.6rem', fontFamily: 'DM Mono' }}>{g.isHome ? 'Citi Field' : g.venue?.split(',')[0]}</div>
                    <div className="fsr-score">{scoreLabel(g)}</div>
                    <div className="fsr-status">
                      {statusLabel(g)}
                      {onEditGame && (
                        <button className={`btn btn-sm ${logged ? 'btn-outline' : 'btn-ghost'}`}
                          style={{ fontSize: '0.5rem', padding: '0.15rem 0.4rem', marginLeft: '0.4rem', minHeight: 'unset' }}
                          onClick={e => { e.stopPropagation(); onEditGame(gameObj); }}>
                          {rec.attended ? '✏' : rec.planned ? '🎯' : '+'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="game-drilldown-panel" style={{ marginTop: '0.35rem', marginBottom: '0.55rem' }}>
                      <div className="card-title" style={{ marginBottom: '0.35rem' }}>Game Snapshot</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text2)', marginBottom: '0.35rem' }}>
                        {g.status || 'Scheduled'} · {g.venue || (g.isHome ? 'Citi Field' : 'Away')} · {new Date(g.date).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginBottom: '0.45rem' }}>
                        {g.winPitch && <span style={{ marginRight: '0.7rem' }}>W: {g.winPitch}</span>}
                        {g.losePitch && <span style={{ marginRight: '0.7rem' }}>L: {g.losePitch}</span>}
                        {g.savePitch && <span>SV: {g.savePitch}</span>}
                        {!g.winPitch && !g.losePitch && !g.savePitch && 'Pitching decisions will appear after game completion.'}
                      </div>

                      {detailLoading && <div className="game-drilldown-status">Loading inning linescore…</div>}
                      {!detailLoading && selectedInnings.length > 0 && (
                        <div className="inning-grid">
                          {selectedInnings.map(i => (
                            <div key={i.num} className="inning-chip">
                              <div className="inning-chip-label">Inning {i.num}</div>
                              <div className="inning-chip-score">NYM {g.isHome ? i.home?.runs ?? 0 : i.away?.runs ?? 0} · OPP {g.isHome ? i.away?.runs ?? 0 : i.home?.runs ?? 0}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {!detailLoading && selectedInnings.length === 0 && (
                        <div className="game-drilldown-status">Detailed linescore not posted yet for this game.</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SCHEDULE VIEW ────────────────────────────────────────────────────────────
export function ScheduleView({ userData, onEditGame }) {
  const { gameRecords = {} } = userData;
  const today = new Date().toISOString().slice(0, 10);
  const [expandedId, setExpandedId] = useState(null);
  const [schedMode, setSchedMode]   = useState('promo'); // 'promo' | 'spring' | 'regular'

  const toggleExpand = id => setExpandedId(prev => prev === id ? null : id);

  // Detect if we are currently in spring training period (roughly Feb–March)
  const month = new Date().getMonth() + 1; // 1-12
  const isSpringTime = month >= 2 && month <= 3;

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">📅 2026 Mets Schedule</div>
        <div className="page-sub">Spring Training · Regular Season · Promo Tracker</div>
      </div>

      {/* Sub-tab bar */}
      <div className="sched-sub-tabs">
        <button className={`sst-btn ${schedMode === 'promo'   ? 'active' : ''}`} onClick={() => setSchedMode('promo')}>
          🎁 Promo Tracker
        </button>
        <button className={`sst-btn ${schedMode === 'spring'  ? 'active' : ''}`} onClick={() => setSchedMode('spring')}>
          🌴 Spring Training {isSpringTime && <span className="sst-now">NOW</span>}
        </button>
        <button className={`sst-btn ${schedMode === 'regular' ? 'active' : ''}`} onClick={() => setSchedMode('regular')}>
          📅 Regular Season
        </button>
      </div>

      {schedMode === 'spring' && (
        <div className="card">
          <FullScheduleSection gameType="S" userData={userData} onEditGame={onEditGame} />
        </div>
      )}

      {schedMode === 'regular' && (
        <div className="card">
          <FullScheduleSection gameType="R" userData={userData} onEditGame={onEditGame} />
        </div>
      )}

      {schedMode === 'promo' && (
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Date</th><th>Opponent</th><th>Time</th>
                <th>Promotion</th><th>Limit</th><th>Cost</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {PROMOS.flatMap(p => {
                const rec  = gameRecords[p.id] || {};
                const past = p.isoDate < today;
                const is86 = p.promo.includes('1986') || [4,6,8,20].includes(p.id);
                const isExpanded = expandedId === p.id;

                const mainRow = (
                  <tr key={p.id}
                    className={`${rec.attended ? 'attended' : ''}`}
                    onClick={() => toggleExpand(p.id)}
                    style={{ cursor: 'pointer', outline: isExpanded ? '1px solid rgba(255,89,16,0.35)' : 'none' }}>
                    <td style={{ color: 'var(--muted)', fontSize: '0.68rem', fontFamily: 'DM Mono' }}>{String(p.id).padStart(2,'0')}</td>
                    <td>
                      <div style={{ fontFamily: 'Oswald', fontSize: '0.82rem', color: past ? 'var(--muted)' : 'var(--text)', letterSpacing: '0.04em' }}>
                        {p.display}
                      </div>
                    </td>
                    <td>
                      <span style={{ marginRight: '0.4rem' }}>{p.emoji}</span>
                      <span style={{ fontFamily: 'Oswald', fontSize: '0.78rem' }}>{p.opponent}</span>
                    </td>
                    <td style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{p.time}</td>
                    <td>
                      <span style={{ fontSize: '0.78rem' }}>{p.icon} {p.promo}</span>
                      {is86 && <span className="tag-86">1986</span>}
                      {p.specialTicket && <span className="badge badge-special" style={{ marginLeft: '0.4rem' }}>Special Ticket</span>}
                    </td>
                    <td>
                      {p.limit
                        ? <span className="badge badge-limit">First {p.limit.toLocaleString()}</span>
                        : <span style={{ color: 'var(--muted)', fontSize: '0.65rem' }}>—</span>
                      }
                    </td>
                    <td style={{ fontSize: '0.72rem', color: rec.totalCost > 0 ? 'var(--gold)' : 'var(--muted)' }}>
                      {rec.totalCost > 0 ? `$${rec.totalCost}` : '—'}
                    </td>
                    <td>
                      {rec.attended ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span className="badge badge-win">✓ Attended</span>
                          {rec.result === 'W' && <span className="badge badge-win">W</span>}
                          {rec.result === 'L' && <span className="badge badge-loss">L</span>}
                        </div>
                      ) : rec.planned ? (
                        <span className="badge badge-planned">🎯 Planned</span>
                      ) : past ? (
                        <span style={{ color: 'var(--muted)', fontSize: '0.62rem' }}>PAST</span>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '0.62rem' }}>UPCOMING</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); onEditGame(p); }}>
                        {rec.attended ? '✏️ Edit' : rec.planned ? '🎯 Update' : '+ Log'}
                      </button>
                    </td>
                  </tr>
                );

                if (!isExpanded) return [mainRow];

                const expandRow = (
                  <tr key={`${p.id}-expand`} className="promo-expand-row">
                    <td colSpan={9}>
                      <div className="promo-expand-panel">

                        {/* ── Promo Info ── */}
                        <div>
                          <div style={{ fontFamily: 'Oswald', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                            Promo Details
                          </div>
                          <div style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>{p.icon}</div>
                          <div style={{ fontFamily: 'Oswald', fontSize: '0.9rem', color: 'var(--orange)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                            {p.promo.split(' (')[0]}
                          </div>
                          {p.promo.includes('(') && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>
                              {p.promo.slice(p.promo.indexOf('('))}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                            {p.limit && <span className="badge badge-limit">First {p.limit.toLocaleString()}</span>}
                            {p.specialTicket && <span className="badge badge-special">Special Ticket Required</span>}
                            {is86 && <span className="tag-86">1986</span>}
                          </div>
                          <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>{p.emoji} vs {p.opponent}</div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>📅 {p.display} · ⏰ {p.time}</div>
                          </div>
                        </div>

                        {/* ── My Game Record ── */}
                        <div>
                          <div style={{ fontFamily: 'Oswald', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                            {rec.attended ? 'My Game Record' : rec.planned ? '🎯 Planned to Attend' : 'Not Yet Logged'}
                          </div>
                          {rec.planned && !rec.attended && rec.notes && (
                            <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--surface)', borderRadius: 6, fontSize: '0.68rem', color: 'var(--text2)', lineHeight: 1.6, borderLeft: '2px solid rgba(255,89,16,0.4)' }}>
                              💬 {rec.notes}
                            </div>
                          )}
                          {rec.attended ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {rec.result === 'W' && <span className="badge badge-win" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>WIN ✓</span>}
                                {rec.result === 'L' && <span className="badge badge-loss" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>LOSS ✗</span>}
                                <span className="badge" style={{ fontSize: '0.62rem', background: rec.promoCollected ? 'rgba(0,200,0,0.1)' : 'rgba(255,68,68,0.08)', color: rec.promoCollected ? 'var(--win)' : 'var(--loss)', border: `1px solid ${rec.promoCollected ? 'rgba(0,200,0,0.25)' : 'rgba(255,68,68,0.2)'}` }}>
                                  {p.icon} {rec.promoCollected ? 'Got Promo' : 'Missed Promo'}
                                </span>
                              </div>
                              {(rec.section || rec.row || rec.seat) && (
                                <div className="expand-tile">
                                  <div className="expand-tile-label">📍 Seats</div>
                                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '1rem', color: 'var(--orange)', letterSpacing: '0.06em' }}>
                                    §{rec.section || '—'} · Row {rec.row || '—'} · #{rec.seat || '—'}
                                  </div>
                                </div>
                              )}
                              {rec.totalCost > 0 && (
                                <div className="expand-tile">
                                  <div className="expand-tile-label">💰 Total Spent</div>
                                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>${rec.totalCost}</div>
                                  <div style={{ fontSize: '0.6rem', color: 'var(--muted)', lineHeight: 1.7, marginTop: '0.2rem' }}>
                                    {rec.costTickets > 0  && <div>🎟️ Tickets: ${rec.costTickets}</div>}
                                    {rec.costFood > 0     && <div>🌭 Food: ${rec.costFood}</div>}
                                    {rec.costParking > 0  && <div>🅿️ Parking: ${rec.costParking}</div>}
                                    {rec.costMerch > 0    && <div>🛍️ Merch: ${rec.costMerch}</div>}
                                  </div>
                                </div>
                              )}
                              {rec.who && (
                                <div className="expand-tile">
                                  <div className="expand-tile-label">👥 Crew</div>
                                  <div style={{ fontSize: '0.72rem' }}>{rec.who}</div>
                                </div>
                              )}
                              {rec.food && (
                                <div className="expand-tile">
                                  <div className="expand-tile-label">🌭 Food & Drinks</div>
                                  <div style={{ fontSize: '0.72rem' }}>{rec.food}</div>
                                </div>
                              )}
                              {rec.notes && (
                                <div style={{ padding: '0.6rem 0.75rem', background: 'var(--surface)', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text2)', lineHeight: 1.6, borderLeft: '2px solid var(--border2)' }}>
                                  💬 {rec.notes}
                                </div>
                              )}
                              <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}
                                onClick={e => { e.stopPropagation(); onEditGame(p); }}>
                                ✏️ Edit Record
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                                {past ? 'Did you attend this game? Log it to track your history.' : 'Planning to go? Log it after the game to track your attendance, costs, and memories.'}
                              </div>
                              <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}
                                onClick={e => { e.stopPropagation(); onEditGame(p); }}>
                                + Log This Game
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </td>
                  </tr>
                );

                return [mainRow, expandRow];
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </>
  );
}

// ─── MY GAMES VIEW ────────────────────────────────────────────────────────────
export function MyGamesView({ userData, onEditGame }) {
  const { gameRecords = {} } = userData;
  const attended = PROMOS.filter(p => gameRecords[p.id]?.attended);
  const totalSpent = attended.reduce((sum, p) => sum + (gameRecords[p.id]?.totalCost || 0), 0);
  const wins   = attended.filter(p => gameRecords[p.id]?.result === 'W').length;
  const losses = attended.filter(p => gameRecords[p.id]?.result === 'L').length;

  if (!attended.length) return (
    <>
      <div className="page-hdr">
        <div className="page-title">🎟️ My Games</div>
        <div className="page-sub">Your Personal Game Log</div>
      </div>
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
        <div style={{ fontFamily: 'Oswald', color: 'var(--muted)', letterSpacing: '0.15em', fontSize: '0.85rem' }}>
          NO GAMES LOGGED YET — HEAD TO THE SCHEDULE TO LOG YOUR FIRST GAME!
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">🎟️ My Games</div>
        <div className="page-sub">{attended.length} Games Attended · 2026 Season</div>
      </div>

      <div className="stats-row" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="big">{attended.length}</div><div className="lbl">Games</div></div>
        <div className="stat-card"><div className="big" style={{ color: wins > losses ? 'var(--win)' : wins < losses ? 'var(--loss)' : 'var(--orange)' }}>{wins}‑{losses}</div><div className="lbl">W-L</div></div>
        <div className="stat-card"><div className="big" style={{ color: 'var(--gold)', fontSize: '1.8rem' }}>${totalSpent}</div><div className="lbl">Total Spent</div></div>
        <div className="stat-card"><div className="big">{attended.filter(p => gameRecords[p.id]?.promoCollected).length}</div><div className="lbl">Promos Got</div></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {attended.map(p => {
          const rec = gameRecords[p.id];
          return (
            <div key={p.id} className="card" style={{ borderLeft: '4px solid var(--orange)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.45rem', letterSpacing: '0.08em', color: 'white', lineHeight: 1 }}>
                    {p.emoji} vs {p.opponent}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontFamily: 'Oswald', letterSpacing: '0.1em', marginTop: '0.2rem' }}>
                    {p.display} · {p.time}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {rec.result === 'W' && <span className="badge badge-win" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>WIN ✓</span>}
                  {rec.result === 'L' && <span className="badge badge-loss" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>LOSS ✗</span>}
                  {rec.totalCost > 0 && <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}>💰 ${rec.totalCost}</span>}
                  <button className="btn btn-outline btn-sm" onClick={() => onEditGame(p)}>✏️ Edit</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                {(rec.section || rec.row || rec.seat) && (
                  <InfoTile icon="📍" label="Seats">
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: 'var(--orange)', letterSpacing: '0.06em' }}>
                      §{rec.section || '—'} · Row {rec.row || '—'} · #{rec.seat || '—'}
                    </span>
                  </InfoTile>
                )}
                {rec.promoCollected !== undefined && (
                  <InfoTile icon={p.icon} label="Promo Item">
                    <span style={{ fontSize: '0.78rem', color: rec.promoCollected ? 'var(--win)' : 'var(--loss)' }}>
                      {rec.promoCollected ? '✓ Collected' : '✗ Missed'} — {p.promo.split(' (')[0]}
                    </span>
                  </InfoTile>
                )}
                {rec.who && <InfoTile icon="👥" label="Crew"><span style={{ fontSize: '0.78rem' }}>{rec.who}</span></InfoTile>}
                {rec.food && <InfoTile icon="🌭" label="Food Order"><span style={{ fontSize: '0.78rem' }}>{rec.food}</span></InfoTile>}
                {rec.totalCost > 0 && (
                  <InfoTile icon="💰" label="Cost Breakdown">
                    <div style={{ fontSize: '0.68rem', lineHeight: 1.6 }}>
                      {rec.costTickets > 0  && <div>🎟️ Tickets: <b style={{color:'var(--gold)'}}>${rec.costTickets}</b></div>}
                      {rec.costFood > 0     && <div>🌭 Food: <b style={{color:'var(--gold)'}}>${rec.costFood}</b></div>}
                      {rec.costParking > 0  && <div>🅿️ Parking: <b style={{color:'var(--gold)'}}>${rec.costParking}</b></div>}
                      {rec.costMerch > 0    && <div>🛍️ Merch: <b style={{color:'var(--gold)'}}>${rec.costMerch}</b></div>}
                    </div>
                  </InfoTile>
                )}
              </div>

              {rec.notes && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: '6px', fontSize: '0.73rem', color: 'var(--text2)', lineHeight: 1.6, borderLeft: '2px solid var(--border2)' }}>
                  💬 {rec.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function InfoTile({ icon, label, children }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: '6px', padding: '0.65rem 0.75rem' }}>
      <div style={{ fontSize: '0.52rem', color: 'var(--muted)', letterSpacing: '0.18em', fontFamily: 'Oswald', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{icon} {label}</div>
      {children}
    </div>
  );
}



// ─── SEASON INSIGHTS VIEW ─────────────────────────────────────────────────────
export function SeasonInsightsView({ userData }) {
  const { gameRecords = {} } = userData;
  const attended = PROMOS.filter(p => gameRecords[p.id]?.attended);
  const planned = PROMOS.filter(p => gameRecords[p.id]?.planned && !gameRecords[p.id]?.attended);

  const wins = attended.filter(p => gameRecords[p.id]?.result === 'W').length;
  const losses = attended.filter(p => gameRecords[p.id]?.result === 'L').length;
  const totalSpent = attended.reduce((sum, p) => sum + (gameRecords[p.id]?.totalCost || 0), 0);
  const avgSpend = attended.length ? totalSpent / attended.length : 0;
  const promosCollected = attended.filter(p => gameRecords[p.id]?.promoCollected).length;
  const winRate = attended.length ? Math.round((wins / attended.length) * 100) : 0;

  const byMonthMap = {};
  for (const p of attended) {
    const key = String(p.isoDate || '').slice(0, 7);
    if (!key) continue;
    const rec = gameRecords[p.id] || {};
    if (!byMonthMap[key]) byMonthMap[key] = { games: 0, spend: 0, wins: 0, losses: 0 };
    byMonthMap[key].games += 1;
    byMonthMap[key].spend += rec.totalCost || 0;
    if (rec.result === 'W') byMonthMap[key].wins += 1;
    if (rec.result === 'L') byMonthMap[key].losses += 1;
  }
  const byMonth = Object.entries(byMonthMap).sort(([a],[b]) => a.localeCompare(b));
  const maxGamesInMonth = Math.max(1, ...byMonth.map(([,v]) => v.games));
  const bestMonth = byMonth.length ? byMonth.reduce((best, cur) => cur[1].games > best[1].games ? cur : best) : null;

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">📈 My Mets Season Insights</div>
        <div className="page-sub">Attendance Trends · Cost Insights · Monthly Breakdown</div>
      </div>

      <div className="stats-row" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card"><div className="big">{attended.length}</div><div className="lbl">Attended</div></div>
        <div className="stat-card"><div className="big" style={{ color: 'var(--blue3)' }}>{planned.length}</div><div className="lbl">Planned</div></div>
        <div className="stat-card"><div className="big" style={{ color: wins >= losses ? 'var(--win)' : 'var(--loss)' }}>{wins}-{losses}</div><div className="lbl">W-L Logged</div></div>
        <div className="stat-card"><div className="big" style={{ color: 'var(--gold)', fontSize: '1.8rem' }}>${totalSpent.toFixed(0)}</div><div className="lbl">Total Spent</div></div>
        <div className="stat-card"><div className="big" style={{ color: 'var(--orange)', fontSize: '1.8rem' }}>${avgSpend.toFixed(0)}</div><div className="lbl">Avg / Game</div></div>
        <div className="stat-card"><div className="big">{promosCollected}</div><div className="lbl">Promos Collected</div></div>
        <div className="stat-card"><div className="big" style={{ color: 'var(--win)' }}>{winRate}%</div><div className="lbl">Win Rate</div></div>
        <div className="stat-card"><div className="big" style={{ color: 'var(--blue3)', fontSize: '1.7rem' }}>{bestMonth ? new Date(bestMonth[0] + '-01T12:00:00').toLocaleDateString('en-US', { month: 'short' }) : '—'}</div><div className="lbl">Best Month</div></div>
      </div>

      <div className="card">
        <div className="card-title">📅 Monthly Attendance Momentum</div>
        {byMonth.length === 0 ? (
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>No attended games yet — log games to unlock your season trendline.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {byMonth.map(([m, v]) => {
              const d = new Date(m + '-01T12:00:00');
              const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              const pct = Math.max(6, Math.round((v.games / maxGamesInMonth) * 100));
              return (
                <div key={m} style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: '0.65rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text2)', fontFamily: 'Oswald', letterSpacing: '0.08em' }}>{label}</div>
                  <div style={{ height: 10, background: 'rgba(0,45,92,0.35)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,var(--orange),var(--orange2))' }} />
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'DM Mono' }}>{v.games}G · ${v.spend.toFixed(0)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ─── TROPHY VIEW ─────────────────────────────────────────────────────────────
export function TrophyView({ userData }) {
  const { gameRecords = {} } = userData;
  const collected = PROMOS.filter(p => gameRecords[p.id]?.promoCollected).length;

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">🏆 Trophy Shelf</div>
        <div className="page-sub">{collected} of {PROMOS.length} Promo Items Collected</div>
      </div>

      <div style={{ marginBottom: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1, height: 8, background: 'var(--surface)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${(collected / PROMOS.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--orange), var(--orange2))', borderRadius: 4, transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.2rem', color: 'var(--orange)', minWidth: 60, textAlign: 'right' }}>
          {collected}/{PROMOS.length}
        </span>
      </div>

      <div className="grid-auto">
        {PROMOS.map(p => {
          const isCollected = !!gameRecords[p.id]?.promoCollected;
          return (
            <div key={p.id} className={`trophy-item ${isCollected ? 'collected' : 'locked'}`}>
              {isCollected && <span className="trophy-check">✓</span>}
              <span className="trophy-emoji">{p.icon}</span>
              <div className="trophy-name">{p.promo.split(' (')[0]}</div>
              <div className="trophy-date">{p.display}</div>
              {p.specialTicket && <div style={{ fontSize: '0.5rem', color: 'var(--orange)', marginTop: '0.2rem', letterSpacing: '0.1em', fontFamily: 'Oswald' }}>SPECIAL TICKET</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── EGGROLL VIEW ─────────────────────────────────────────────────────────────
export function EggrollView({ userData, onSaveEggroll }) {
  const { eggrollLog = {} } = userData;
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({});

  const open = team => {
    setForm({ flavor: '', rating: 3, notes: '', date: '', ...eggrollLog[team.name] });
    setEditing(team);
  };

  const save = () => {
    onSaveEggroll(editing.name, { ...form, logged: true });
    setEditing(null);
  };

  const logged = Object.values(eggrollLog).filter(r => r?.logged).length;

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">🥚 Eggroll Hall of Fame</div>
        <div className="page-sub">{logged} of {EGGROLL_TEAMS.length} Visiting Team Eggrolls Tried</div>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.7 }}>
          🍱 Citi Field's famous eggrolls come in special visiting team–themed flavors. Log your ratings, flavor names, and tasting notes here — the ultimate ballpark food diary.
        </div>
      </div>

      <div className="eggroll-grid">
        {EGGROLL_TEAMS.map(team => {
          const log = eggrollLog[team.name];
          return (
            <div key={team.name} className={`eggroll-card ${log?.logged ? 'logged' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{team.emoji}</span>
                <div>
                  <div style={{ fontFamily: 'Oswald', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text)' }}>{team.name}</div>
                  {log?.date && <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{log.date}</div>}
                </div>
              </div>
              {log?.logged ? (
                <>
                  <div className="stars">{'★'.repeat(log.rating)}{'☆'.repeat(5 - log.rating)}</div>
                  {log.flavor && <div style={{ fontSize: '0.72rem', color: '#cc9933', fontStyle: 'italic', margin: '0.4rem 0' }}>🥚 {log.flavor}</div>}
                  {log.notes && <div style={{ fontSize: '0.68rem', color: 'var(--muted)', lineHeight: 1.5 }}>{log.notes}</div>}
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => open(team)}>✏️ Edit</button>
                </>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => open(team)}>+ Log Eggroll</button>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing.emoji} {editing.name}</div>
            <div className="modal-sub">Eggroll Tasting Notes</div>
            <div className="form-group">
              <label>Eggroll Flavor / Theme</label>
              <input placeholder='e.g. "Pittsburgh Pierogi Roll"' value={form.flavor || ''} onChange={e => setForm(p => ({...p, flavor: e.target.value}))} maxLength={100} />
            </div>
            <div className="form-group">
              <label>Rating</label>
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ cursor: 'pointer', fontSize: '1.4rem', color: s <= (form.rating || 3) ? 'var(--gold)' : 'var(--border2)' }}
                    onClick={() => setForm(p => ({...p, rating: s}))}>★</span>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Date Tried</label>
                <input type="date" value={form.date || ''} onChange={e => setForm(p => ({...p, date: e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label>Tasting Notes</label>
              <textarea placeholder="Crispy? Greasy? Worth the 20-min line? Spill it." value={form.notes || ''} onChange={e => setForm(p => ({...p, notes: e.target.value}))} maxLength={500} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── MAP VIEW ─────────────────────────────────────────────────────────────────
const SECTION_INFO = {
  '101': { level: 'Field Level', location: 'Right Field Corner', tip: 'Great view of the right-field foul pole. Easy access to the Delta Club Lounge nearby.', fact: 'The foul pole here was custom-painted Mets blue for the 2009 opening season.' },
  '102': { level: 'Field Level', location: 'Right Field', tip: 'Elevated angle gives you a panoramic view of the entire outfield. Ideal for watching outfield play develop.', fact: 'On summer evenings the shadow line falls perfectly mid-section — one half sun, one half shade.' },
  '103': { level: 'Field Level', location: 'Right Center Field', tip: 'Close to the bullpen — you can hear catchers calling pitches on quiet nights.', fact: 'Mets relievers warm up right in front of you. Autograph opportunities before games are common here.' },
  '104': { level: 'Field Level', location: 'Right Field Grandstand', tip: 'Budget-friendly gems with a surprisingly clean angle to home plate.', fact: 'These seats have one of the best sight lines to the high-definition video board above left-center.' },
  '105': { level: 'Field Level', location: 'First Base Line (RF Side)', tip: 'Foul balls come this way often — stay alert and bring a glove!', fact: 'More foul balls land in sections 105-107 than any other field-level stretch at Citi Field.' },
  '106': { level: 'Field Level', location: 'First Base Line', tip: 'Excellent sightline down the first-base line. You can see pickoff throws in sharp detail.', fact: 'From here you can clearly see the Mets dugout steps and watch pitching coach visits unfold.' },
  '107': { level: 'Field Level', location: 'First Base (Dugout Side)', tip: 'Close to the Mets dugout — great for high-fives after home runs and post-inning walks.', fact: 'Section 107 is among the most requested by scouts and player families visiting opposing teams.' },
  '108': { level: 'Field Level', location: 'Behind First Base', tip: "Watch the first baseman's footwork up close. Perfect angle for seeing double plays turn.", fact: "This section's front row is just 40 feet from first base — closer than any other non-premium seat." },
  '109': { level: 'Field Level', location: 'First Base / Infield Corner', tip: 'Mid-infield view lets you see both infielder positioning and pitcher delivery clearly.', fact: 'Players often toss balls into this section after the last out of an inning — a fan favorite.' },
  '110': { level: 'Field Level', location: 'Between 1B and Home Plate', tip: 'A premium sightline combining the pitcher, catcher, and infield in one frame.', fact: 'This area is historically associated with Mets legends who once sat in these box seats as fans.' },
  '111': { level: 'Field Level', location: 'Behind Home Plate (1B Side)', tip: 'Near-perfect view of pitch location and break. Ideal for serious stat watchers.', fact: 'Citi Field\'s home-plate sections were modeled after Ebbets Field\'s intimate seating geometry.' },
  '112': { level: 'Field Level', location: 'Behind Home Plate (3B Side)', tip: 'Mirror of 111 — equally great for judging balls and strikes. Great ambience on big nights.', fact: 'Former Mets great Keith Hernandez once called Section 112 his personal favorite to watch a game from.' },
  '113': { level: 'Field Level', location: 'Between Home Plate and 3B', tip: 'Watch the catcher frame pitches and third baseman range in stunning clarity.', fact: 'The dugout tunnel entrance for the Mets is just beyond the 3B wall visible from here.' },
  '114': { level: 'Field Level', location: 'Third Base (Dugout Side)', tip: "Visiting team's dugout is directly opposite — you'll overhear a lot from here!", fact: 'Some visiting managers have been caught using hand signals from the dugout that fans in 114 spotted first.' },
  '115': { level: 'Field Level', location: 'Behind Third Base', tip: "Watch the third baseman's dives and double-play pivots up close — spectacular from here.", fact: 'Wright Way: David Wright made many memorable diving stops clearly visible from this section.' },
  '116': { level: 'Field Level', location: 'Third Base Line', tip: 'Foul tips and ground-rule doubles come this way. Stay sharp — good souvenir territory.', fact: 'The chalk line is re-drawn right in front of this section before every game by the grounds crew.' },
  '117': { level: 'Field Level', location: 'Third Base Line (LF Side)', tip: 'Relaxed atmosphere with a nice wide-angle view of the whole left side of the diamond.', fact: 'You can see the visitors clubhouse windows from here on the upper level if you look just right.' },
  '118': { level: 'Field Level', location: 'Left Field Grandstand', tip: 'Great view of left-field play and the scoreboard. Often breezy on hot days.', fact: 'Left field at Citi Field plays differently each season as the fence distance was adjusted in 2012.' },
  '119': { level: 'Field Level', location: 'Left Center Field', tip: 'Watch the center fielder track fly balls — the depth perception from here is incredible.', fact: 'The apple used to pop up in center field before the 2012 renovation — visible from this section.' },
  '120': { level: 'Field Level', location: 'Left Field / Center Field', tip: 'Panoramic outfield view — perfect for watching positioning shifts unfold in real time.', fact: "The Mets' famous Home Run Apple now sits near center-left, visible when homers are hit." },
  '121': { level: 'Field Level', location: 'Left Field Corner', tip: 'Near the left-field foul pole. Unique angle for judging fair/foul calls down the line.', fact: 'On cool October nights, this section has some of the warmest pockets due to stadium wind flow patterns.' },
};

export function MapView({ userData }) {
  const { gameRecords = {} } = userData;
  const [selected, setSelected] = useState(null);
  const [mapTab, setMapTab] = useState('map');

  const visitedSections = new Set(
    Object.values(gameRecords).filter(r => r?.section).map(r => r.section)
  );

  const SECTIONS = [
    { id:'101', d:'M 480,375 L 540,365 L 545,340 L 490,348 Z' },
    { id:'102', d:'M 545,340 L 590,315 L 595,290 L 545,310 Z' },
    { id:'103', d:'M 590,315 L 620,280 L 620,255 L 585,282 Z' },
    { id:'104', d:'M 585,282 L 610,250 L 608,225 L 578,250 Z' },
    { id:'105', d:'M 578,250 L 608,225 L 600,200 L 565,222 Z' },
    { id:'106', d:'M 565,222 L 600,200 L 582,170 L 548,192 Z' },
    { id:'107', d:'M 548,192 L 582,170 L 555,145 L 522,168 Z' },
    { id:'108', d:'M 522,168 L 555,145 L 516,125 L 486,148 Z' },
    { id:'109', d:'M 486,148 L 516,125 L 468,112 L 442,136 Z' },
    { id:'110', d:'M 442,136 L 468,112 L 418,104 L 396,128 Z' },
    { id:'111', d:'M 396,128 L 418,104 L 370,100 L 334,100 L 334,125 Z' },
    { id:'112', d:'M 334,100 L 298,100 L 252,104 L 270,128 Z' },
    { id:'113', d:'M 270,128 L 252,104 L 204,112 L 226,136 Z' },
    { id:'114', d:'M 226,136 L 204,112 L 158,125 L 182,148 Z' },
    { id:'115', d:'M 182,148 L 158,125 L 130,145 L 150,168 Z' },
    { id:'116', d:'M 150,168 L 130,145 L 103,170 L 120,192 Z' },
    { id:'117', d:'M 120,192 L 103,170 L 82,200 L 100,222 Z' },
    { id:'118', d:'M 100,222 L 82,200 L 72,225 L 85,250 Z' },
    { id:'119', d:'M 85,250 L 72,225 L 70,255 L 88,282 Z' },
    { id:'120', d:'M 88,282 L 70,255 L 73,290 L 97,315 Z' },
    { id:'121', d:'M 97,315 L 73,290 L 90,340 L 140,348 Z' },
  ];

  const LABELS = [
    {id:'101',x:510,y:362},{id:'102',x:567,y:330},{id:'103',x:602,y:294},
    {id:'104',x:594,y:264},{id:'105',x:585,y:236},{id:'106',x:570,y:207},
    {id:'107',x:549,y:182},{id:'108',x:520,y:158},{id:'109',x:488,y:137},
    {id:'110',x:452,y:124},{id:'111',x:408,y:116},{id:'112',x:296,y:116},
    {id:'113',x:254,y:124},{id:'114',x:218,y:137},{id:'115',x:180,y:158},
    {id:'116',x:152,y:182},{id:'117',x:130,y:207},{id:'118',x:114,y:236},
    {id:'119',x:108,y:264},{id:'120',x:108,y:294},{id:'121',x:135,y:332},
  ];

  const selectedVisits = selected
    ? Object.entries(gameRecords).filter(([,r]) => r?.section === selected).map(([id]) => PROMOS.find(p => p.id === Number(id))).filter(Boolean)
    : [];

  const info = selected ? SECTION_INFO[selected] : null;

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">🏟️ Citi Field Map</div>
        <div className="page-sub">Click a section to explore · Track your seat history · Flushing, NY</div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[['map','🗺️ Map'],['guide','📋 Section Guide']].map(([k,l]) => (
          <button key={k} className={`btn ${mapTab===k?'btn-primary':'btn-outline'}`} style={{ fontSize: '0.72rem', padding: '0.35rem 0.85rem' }} onClick={() => setMapTab(k)}>{l}</button>
        ))}
      </div>

      {mapTab === 'guide' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          {Object.entries(SECTION_INFO).map(([sec, inf]) => (
            <div key={sec} className="card" style={{ padding: '1rem', cursor: 'pointer', borderColor: visitedSections.has(sec) ? 'rgba(255,89,16,0.5)' : undefined }} onClick={() => { setMapTab('map'); setSelected(sec); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.3rem', color: 'var(--orange)', letterSpacing: '0.06em' }}>§ {sec}</span>
                {visitedSections.has(sec) && <span style={{ fontSize: '0.6rem', color: 'var(--win)', background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>✓ Visited</span>}
              </div>
              <div style={{ fontFamily: 'Oswald', fontSize: '0.72rem', color: 'var(--text)', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>{inf.location}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '0.4rem' }}>{inf.tip}</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--gold)', lineHeight: 1.5, borderTop: '1px solid rgba(0,45,92,0.2)', paddingTop: '0.4rem' }}>⭐ {inf.fact}</div>
            </div>
          ))}
        </div>
      )}

      {mapTab === 'map' && <div className="map-wrap">
        <div className="map-svg">
          <div className="card" style={{ padding: '1rem' }}>
            <svg viewBox="0 0 680 480" style={{ width: '100%', height: 'auto' }}>
              <defs>
                <radialGradient id="sky" cx="50%" cy="60%" r="60%">
                  <stop offset="0%" stopColor="#001428" />
                  <stop offset="100%" stopColor="#00091a" />
                </radialGradient>
              </defs>
              <rect width="680" height="480" fill="url(#sky)" rx="8" />
              <ellipse cx="334" cy="220" rx="185" ry="140" fill="#0e3d0e" />
              <ellipse cx="334" cy="220" rx="165" ry="125" fill="#145214" />
              <ellipse cx="334" cy="220" rx="185" ry="140" fill="none" stroke="#8B6914" strokeWidth="12" />
              <ellipse cx="334" cy="270" rx="80" ry="57" fill="#7a5c10" />
              <ellipse cx="334" cy="270" rx="72" ry="50" fill="#1a6e1a" />
              <rect x="330" y="218" width="9" height="9" fill="white" rx="1" />
              <rect x="374" y="252" width="9" height="9" fill="white" rx="1" transform="rotate(45,378,256)" />
              <rect x="330" y="288" width="9" height="9" fill="white" rx="1" />
              <rect x="286" y="252" width="9" height="9" fill="white" rx="1" transform="rotate(45,290,256)" />
              <circle cx="334" cy="262" r="8" fill="#9a7010" />
              <polygon points="330,312 344,312 344,320 337,327 330,320" fill="white" />
              <line x1="334" y1="320" x2="160" y2="120" stroke="white" strokeWidth="1.5" opacity="0.35" />
              <line x1="334" y1="320" x2="510" y2="120" stroke="white" strokeWidth="1.5" opacity="0.35" />
              <text x="334" y="103" textAnchor="middle" fill="#cc8800" fontSize="16" fontFamily="Bebas Neue" letterSpacing="2">410 ft</text>
              <text x="170" y="148" fill="#cc8800" fontSize="13" fontFamily="Bebas Neue">335 ft</text>
              <text x="470" y="148" fill="#cc8800" fontSize="13" fontFamily="Bebas Neue">330 ft</text>
              <path d="M 140,348 L 90,340 L 97,415 Q 200,450 334,455 Q 470,450 570,415 L 580,340 L 480,375 L 380,390 L 334,395 L 290,390 Z" fill="#001f3d" stroke="#002d5c" strokeWidth="1" />
              {SECTIONS.map(s => {
                const visited  = visitedSections.has(s.id);
                const sel      = selected === s.id;
                return (
                  <path key={s.id} d={s.d}
                    fill={sel ? 'var(--orange)' : visited ? '#b84800' : '#002D72'}
                    stroke={sel ? '#ff7a3d' : visited ? '#ff6600' : '#0050b3'}
                    strokeWidth={sel ? 2 : 1}
                    style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => setSelected(selected === s.id ? null : s.id)}>
                    <title>Section {s.id}{visited ? ' ✓ Visited' : ''}</title>
                  </path>
                );
              })}
              {LABELS.map(l => (
                <text key={l.id} x={l.x} y={l.y} textAnchor="middle"
                  fill={visitedSections.has(l.id) ? '#fff' : '#5a8fc0'}
                  fontSize="9" fontFamily="DM Mono" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {l.id}
                </text>
              ))}
              <text x="334" y="468" textAnchor="middle" fill="#1e3d6e" fontSize="11" fontFamily="Bebas Neue" letterSpacing="4">CITI FIELD · FLUSHING, NY</text>
            </svg>
          </div>
        </div>

        <div className="map-side">
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title">Legend</div>
            {[
              { color: '#002D72', border: '#0050b3', label: 'Field Level (100s)' },
              { color: '#b84800', border: '#ff6600', label: "Section You've Sat In" },
              { color: 'var(--orange)', border: 'var(--orange)', label: 'Selected Section' },
              { color: '#1a6e1a', border: '#2a8a2a', label: 'Playing Field' },
            ].map(i => (
              <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <div style={{ width: 14, height: 14, background: i.color, border: `1px solid ${i.border}`, borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{i.label}</span>
              </div>
            ))}
          </div>

          {selected && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.6rem', color: 'var(--orange)', letterSpacing: '0.08em', lineHeight: 1 }}>
                Section {selected}
              </div>
              {info && (
                <>
                  <div style={{ fontFamily: 'Oswald', fontSize: '0.72rem', color: 'var(--text2)', letterSpacing: '0.06em', margin: '0.3rem 0 0.5rem', textTransform: 'uppercase' }}>{info.location}</div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--muted)', lineHeight: 1.6, background: 'rgba(0,45,92,0.2)', borderRadius: '5px', padding: '0.5rem 0.6rem', marginBottom: '0.5rem' }}>
                    💡 {info.tip}
                  </div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--gold)', lineHeight: 1.6, background: 'rgba(180,140,0,0.08)', borderRadius: '5px', padding: '0.5rem 0.6rem', marginBottom: '0.5rem' }}>
                    ⭐ {info.fact}
                  </div>
                </>
              )}
              {visitedSections.has(selected) ? (
                <>
                  <div style={{ fontSize: '0.65rem', color: 'var(--win)', margin: '0.4rem 0 0.3rem' }}>✓ You've sat here!</div>
                  {selectedVisits.map(p => (
                    <div key={p.id} style={{ fontSize: '0.65rem', color: 'var(--text2)', padding: '0.35rem 0', borderBottom: '1px solid rgba(0,45,92,0.3)' }}>
                      • {p.display} vs {p.oppShort}
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: '0.3rem' }}>No visits logged here yet. Click 📋 Section Guide to explore all sections.</div>
              )}
            </div>
          )}

          {!selected && (
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👆</div>
              <div style={{ fontFamily: 'Oswald', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>CLICK ANY SECTION</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: '0.3rem' }}>View tips, fun facts &amp; your visit history</div>
            </div>
          )}

          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title">Your Sections</div>
            {visitedSections.size === 0
              ? <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>No sections logged yet — log a game with a seat section to start tracking!</div>
              : <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {[...visitedSections].map(s => (
                    <span key={s} onClick={() => setSelected(s)} style={{ cursor: 'pointer', background: 'rgba(255,89,16,0.15)', color: 'var(--orange)', border: '1px solid rgba(255,89,16,0.4)', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.65rem', fontFamily: 'Oswald', letterSpacing: '0.08em' }}>
                      §{s}
                    </span>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>}
    </>
  );
}
