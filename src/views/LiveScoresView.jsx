import { useEffect, useState } from 'react';
import { useMLBSchedule } from '../hooks.js';

export default function LiveScoresView() {
  const { games, loading, error } = useMLBSchedule();
  const [expandedGamePk, setExpandedGamePk] = useState(null);

  const today    = new Date().toISOString().slice(0,10);
  const live     = games.filter(g => g.statusCode === 'I');
  const recent   = games.filter(g => g.result !== null && g.displayDate < today).slice(0, 20);
  const upcoming = games.filter(g => g.statusCode === 'S' || (!g.result && g.displayDate >= today)).slice(0, 10);

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">🎮 Scores & Schedule</div>
        <div className="page-sub">Live · Recent · Upcoming · Via MLB Stats API</div>
      </div>

      {loading && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
          <div style={{ fontFamily: 'Oswald', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.2em' }}>LOADING SCORES FROM MLB STATS API...</div>
        </div>
      )}

      {error && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(255,68,68,0.3)' }}>
          <div style={{ color: 'var(--loss)', fontSize: '0.75rem' }}>⚠️ Could not connect to MLB Stats API: {error}</div>
        </div>
      )}

      {live.length > 0 && (
        <>
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>🔴 LIVE NOW</div>
          {live.map(g => <GameCard key={g.gamePk} game={g} expandedGamePk={expandedGamePk} setExpandedGamePk={setExpandedGamePk} />)}
          <div style={{ height: '1.5rem' }} />
        </>
      )}

      {recent.length > 0 && (
        <>
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>📋 Recent Results</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {recent.map(g => <GameCard key={g.gamePk} game={g} expandedGamePk={expandedGamePk} setExpandedGamePk={setExpandedGamePk} />)}
          </div>
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>🗓️ Upcoming Games</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.map(g => <GameCard key={g.gamePk} game={g} expandedGamePk={expandedGamePk} setExpandedGamePk={setExpandedGamePk} />)}
          </div>
        </>
      )}

      {!loading && games.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚾</div>
          <div style={{ fontFamily: 'Oswald', fontSize: '0.85rem', color: 'var(--muted)', letterSpacing: '0.15em' }}>
            NO GAMES FOUND IN THE CURRENT WINDOW — CHECK BACK AS THE SEASON APPROACHES!
          </div>
        </div>
      )}
    </>
  );
}

function GameCard({ game: g, expandedGamePk, setExpandedGamePk }) {
  const isLive     = g.statusCode === 'I';
  const isUpcoming = !g.result && !isLive;
  const cls        = isLive ? 'live' : g.result === 'W' ? 'win' : g.result === 'L' ? 'loss' : 'upcoming';
  const isExpanded = expandedGamePk === g.gamePk;

  return (
    <div className={`game-result-card ${cls} ${isExpanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className="game-card-toggle"
        onClick={() => setExpandedGamePk(isExpanded ? null : g.gamePk)}
        aria-expanded={isExpanded}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ minWidth: 90 }}>
            {isLive
              ? <span className="badge badge-live">🔴 LIVE {g.inning}{g.inningHalf === 'Top' ? '▲' : '▼'}</span>
              : g.result
              ? <span className={`badge badge-${g.result === 'W' ? 'win' : 'loss'}`}>{g.result === 'W' ? '✓ WIN' : '✗ LOSS'}</span>
              : <span className="badge badge-limit">UPCOMING</span>
            }
          </div>

          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontFamily: 'Oswald', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'white' }}>
              {g.isHome ? 'Mets vs' : 'Mets @'} {g.oppName}
              <span style={{ fontFamily: 'DM Mono', fontSize: '0.6rem', color: 'var(--muted)', marginLeft: '0.75rem' }}>
                {g.gameType === 'S' ? '· Spring Training' : g.gameType === 'P' ? '· Postseason' : ''}
              </span>
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
              {new Date(g.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
              {g.venue && ` · ${g.venue}`}
            </div>
            {g.broadcasts && g.broadcasts.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '0.52rem', color: 'var(--muted)', fontFamily: 'DM Mono', marginRight: '0.1rem', alignSelf: 'center' }}>📺</span>
                {g.broadcasts.map(ch => (
                  <span key={ch} style={{ fontSize: '0.55rem', fontFamily: 'Oswald', letterSpacing: '0.06em', background: 'rgba(0,45,92,0.5)', border: '1px solid rgba(0,80,160,0.5)', borderRadius: '3px', padding: '0.1rem 0.4rem', color: 'var(--text2)' }}>{ch}</span>
                ))}
              </div>
            )}
          </div>

          {g.metsScore !== undefined && g.metsScore !== null && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', letterSpacing: '0.1em', color: g.result === 'W' ? 'var(--win)' : g.result === 'L' ? 'var(--loss)' : 'var(--text)', lineHeight: 1 }}>
                {g.metsScore} – {g.oppScore}
              </div>
              <div style={{ fontSize: '0.55rem', color: 'var(--muted)', letterSpacing: '0.1em', fontFamily: 'Oswald' }}>NYM – OPP</div>
            </div>
          )}

          <div className="game-card-chevron" aria-hidden="true">{isExpanded ? '▲' : '▼'}</div>
        </div>
      </button>

      {(g.winPitch || g.losePitch || g.savePitch) && (
        <div style={{ marginTop: '0.6rem', fontSize: '0.62rem', color: 'var(--muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(0,45,92,0.3)', paddingTop: '0.5rem' }}>
          {g.winPitch  && <span style={{ color: 'var(--win)'  }}>W: {g.winPitch}</span>}
          {g.losePitch && <span style={{ color: 'var(--loss)' }}>L: {g.losePitch}</span>}
          {g.savePitch && <span style={{ color: 'var(--gold)' }}>SV: {g.savePitch}</span>}
        </div>
      )}

      {isExpanded && <GameDrillDown game={g} />}
    </div>
  );
}

function GameDrillDown({ game }) {
  const { details, loading, error } = useGameFeed(game.gamePk);

  if (loading) return <div className="game-drilldown-status">Loading inning-by-inning feed…</div>;
  if (error) return <div className="game-drilldown-status" style={{ color: 'var(--loss)' }}>Could not load game feed: {error}</div>;
  if (!details) return <div className="game-drilldown-status">No feed details are available for this game yet.</div>;

  const { inningScoring, keyEvents, topPerformers } = details;

  return (
    <div className="game-drilldown">
      <div className="game-drilldown-grid">
        <div className="game-drilldown-panel">
          <div className="card-title" style={{ marginBottom: '0.4rem' }}>Inning Linescore</div>
          <div className="inning-grid">
            {inningScoring.map(inning => (
              <div key={inning.inning} className="inning-chip">
                <div className="inning-chip-label">{inning.inning}</div>
                <div className="inning-chip-score">NYM {inning.metsRuns} · OPP {inning.oppRuns}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="game-drilldown-panel">
          <div className="card-title" style={{ marginBottom: '0.4rem' }}>Key Players</div>
          {topPerformers.length === 0 ? (
            <div className="game-drilldown-status">No player stats posted yet.</div>
          ) : (
            <div className="performer-list">
              {topPerformers.map(p => (
                <div key={p.id} className="performer-item">
                  <span>{p.name}</span>
                  <span>{p.line}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="game-drilldown-panel" style={{ marginTop: '0.75rem' }}>
        <div className="card-title" style={{ marginBottom: '0.4rem' }}>Play-by-Play Feed</div>
        {keyEvents.length === 0 ? (
          <div className="game-drilldown-status">No scoring or major events yet.</div>
        ) : (
          <div className="event-feed">
            {keyEvents.map((event, idx) => (
              <div key={`${event.inning}-${idx}`} className="event-item">
                <div className="event-meta">{event.half} {event.inning} · {event.result}</div>
                <div className="event-text">{event.description}</div>
                {event.runners.length > 0 && (
                  <div className="event-runners">Scored: {event.runners.join(', ')}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function useGameFeed(gamePk) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (cancelled) return;
        setDetails(parseGameDetails(json));
        setLoading(false);
      })
      .catch(e => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [gamePk]);

  return { details, loading, error };
}

function parseGameDetails(feed) {
  const metsTeamId = feed?.gameData?.teams?.home?.name === 'New York Mets'
    ? feed?.gameData?.teams?.home?.id
    : feed?.gameData?.teams?.away?.name === 'New York Mets'
    ? feed?.gameData?.teams?.away?.id
    : null;

  const innings = feed?.liveData?.linescore?.innings || [];
  const inningScoring = innings.map(i => {
    const homeId = feed?.gameData?.teams?.home?.id;
    const awayId = feed?.gameData?.teams?.away?.id;
    const metsRuns = metsTeamId === homeId ? i.home?.runs ?? 0 : i.away?.runs ?? 0;
    const oppRuns = metsTeamId === homeId ? i.away?.runs ?? 0 : i.home?.runs ?? 0;
    return { inning: i.num, metsRuns, oppRuns };
  });

  const plays = (feed?.liveData?.plays?.allPlays || []).slice(-25).reverse();
  const keyEvents = plays
    .filter(p => (p?.result?.rbi || 0) > 0 || ['home_run', 'double', 'triple', 'single', 'strikeout', 'field_out', 'grounded_into_double_play'].includes(p?.result?.eventType))
    .map(p => ({
      inning: p.about?.inning,
      half: p.about?.halfInning,
      result: p.result?.event || 'Play',
      description: p.result?.description || 'No description available.',
      runners: (p.runners || []).filter(r => r.movement?.end === 'score').map(r => r.details?.runner?.fullName).filter(Boolean),
    }));

  const battingStats = feed?.liveData?.boxscore?.teams;
  const topPerformers = [];
  if (battingStats) {
    const side = feed?.gameData?.teams?.home?.id === metsTeamId ? 'home' : 'away';
    const players = Object.values(battingStats?.[side]?.players || {});
    players.forEach(p => {
      const bs = p.stats?.batting;
      if (!bs) return;
      const hits = bs.hits || 0;
      const hr = bs.homeRuns || 0;
      const rbi = bs.rbi || 0;
      const runs = bs.runs || 0;
      if (hits === 0 && hr === 0 && rbi === 0 && runs === 0) return;
      topPerformers.push({
        id: p.person?.id,
        name: p.person?.fullName,
        line: `${hits}H · ${runs}R · ${rbi}RBI${hr > 0 ? ` · ${hr}HR` : ''}`,
        impact: (hr * 4) + (rbi * 3) + (hits * 2) + runs,
      });
    });
  }

  return {
    inningScoring,
    keyEvents,
    topPerformers: topPerformers.sort((a, b) => b.impact - a.impact).slice(0, 6),
  };
}
