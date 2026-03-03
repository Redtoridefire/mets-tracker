import { useEffect, useState } from 'react';
import { useMLBSchedule } from '../hooks.js';

const GAME_FEED_CACHE = new Map();
const GAME_FEED_TTL_MS = 60_000;
const MAX_HIGHLIGHTS = 6;

function inningStatusText(game) {
  if (game?.statusCode !== 'I') return '';
  const inning = game?.inning ? String(game.inning) : '?';
  const halfRaw = String(game?.inningHalf || '').toLowerCase();
  const half = halfRaw === 'top' ? 'Top' : halfRaw === 'bottom' ? 'Bottom' : '';
  return half ? `${half} ${inning}` : `Inning ${inning}`;
}

function gameStatusDetail(game) {
  if (game?.statusCode === 'I') return inningStatusText(game);
  if (game?.result === 'W' || game?.result === 'L') return 'Final';
  if (game?.statusCode === 'S') return 'Scheduled';
  return game?.status || '';
}

export default function LiveScoresView() {
  const { games, loading, error } = useMLBSchedule();
  const [expandedGamePk, setExpandedGamePk] = useState(null);
  const [hubGame, setHubGame] = useState(null);

  const today    = new Date().toISOString().slice(0,10);
  const live     = games.filter(g => g.statusCode === 'I');
  const recent   = games.filter(g => g.result !== null && g.displayDate <= today).slice(0, 20);
  const upcoming = games.filter(g => g.statusCode === 'S' || (!g.result && g.displayDate > today)).slice(0, 10);

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">🎮 Scores & Schedule</div>
        <div className="page-sub">Live · Recent · Upcoming · Via MLB Stats API</div>
      </div>

      {hubGame && <GameHubOverlay game={hubGame} onClose={() => setHubGame(null)} />}

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
          {live.map(g => <GameCard key={g.gamePk} game={g} expandedGamePk={expandedGamePk} setExpandedGamePk={setExpandedGamePk} onOpenHub={setHubGame} />)}
          <div style={{ height: '1.5rem' }} />
        </>
      )}

      {!loading && live.length === 0 && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(255, 167, 38, 0.35)', background: 'rgba(255, 167, 38, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontFamily: 'Oswald', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.68rem', color: 'var(--orange)' }}>
            <span>🟠</span>
            <span>No live game right now</span>
          </div>
          <div style={{ marginTop: '0.35rem', fontSize: '0.62rem', color: 'var(--muted)' }}>
            Live inning indicators appear automatically once the next Mets game is in progress.
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <>
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>📋 Recent Results</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {recent.map(g => <GameCard key={g.gamePk} game={g} expandedGamePk={expandedGamePk} setExpandedGamePk={setExpandedGamePk} onOpenHub={setHubGame} />)}
          </div>
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>🗓️ Upcoming Games</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.map(g => <GameCard key={g.gamePk} game={g} expandedGamePk={expandedGamePk} setExpandedGamePk={setExpandedGamePk} onOpenHub={setHubGame} />)}
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

function GameCard({ game: g, expandedGamePk, setExpandedGamePk, onOpenHub }) {
  const isLive     = g.statusCode === 'I';
  const cls        = isLive ? 'live' : g.result === 'W' ? 'win' : g.result === 'L' ? 'loss' : 'upcoming';
  const isExpanded = expandedGamePk === g.gamePk;
  const inningText = inningStatusText(g);
  const statusDetail = gameStatusDetail(g);

  return (
    <div className={`game-result-card ${cls} ${isExpanded ? 'expanded' : ''}`}>
      <button type="button" className="game-card-toggle" onClick={() => setExpandedGamePk(isExpanded ? null : g.gamePk)} aria-expanded={isExpanded}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ minWidth: 90 }}>
            {isLive
              ? <span className="badge badge-live">🔴 LIVE {inningText || `${g.inning}${g.inningHalf === 'Top' ? '▲' : '▼'}`}</span>
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
            {!!statusDetail && (
              <div style={{ marginTop: '0.22rem', fontSize: '0.58rem', letterSpacing: '0.08em', fontFamily: 'DM Mono', textTransform: 'uppercase', color: isLive ? 'var(--orange)' : 'var(--muted)' }}>
                {isLive ? `🟠 Live Inning: ${statusDetail}` : `Status: ${statusDetail}`}
              </div>
            )}
          </div>

          {g.metsScore !== undefined && g.metsScore !== null && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', letterSpacing: '0.1em', color: g.result === 'W' ? 'var(--win)' : g.result === 'L' ? 'var(--loss)' : 'var(--text)', lineHeight: 1 }}>
                {g.metsScore} – {g.oppScore}
              </div>
              <div style={{ fontSize: '0.55rem', color: 'var(--muted)', letterSpacing: '0.1em', fontFamily: 'Oswald' }}>
                NYM – OPP
              </div>
            </div>
          )}

          <div className="game-card-chevron" aria-hidden="true">{isExpanded ? '▲' : '▼'}</div>
        </div>
      </button>

      <div className="game-hub-row">
        <button type="button" className="game-hub-btn" onClick={() => onOpenHub(g)}>Open Game Hub</button>
      </div>

      {isExpanded && <GameDrillDown game={g} />}
    </div>
  );
}

function GameHubOverlay({ game, onClose }) {
  const { details, loading, error } = useGameFeed(game.gamePk);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="game-hub" onClick={e => e.stopPropagation()}>
        <div className="game-hub-head">
          <div>
            <div className="page-title" style={{ fontSize: '1.8rem' }}>⚾ Game Hub</div>
            <div className="page-sub">{game.isHome ? 'Mets vs' : 'Mets @'} {game.oppName} · {new Date(game.date).toLocaleString()}</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={onClose}>Close</button>
        </div>

        {loading && <div className="game-drilldown-status">Loading Game Hub details…</div>}
        {error && <div className="game-drilldown-status" style={{ color: 'var(--loss)' }}>Could not load game feed: {error}</div>}
        {!loading && !error && details && <GameHubBody details={details} />}
      </div>
    </div>
  );
}

function GameHubBody({ details }) {
  const { inningScoring, keyEvents, topPerformers, highlights } = details;
  return (
    <div>
      <div className="game-drilldown-grid">
        <div className="game-drilldown-panel">
          <div className="card-title" style={{ marginBottom: '0.4rem' }}>Inning Breakdown</div>
          <div className="inning-grid">
            {inningScoring.map(inning => (
              <div key={inning.inning} className="inning-chip">
                <div className="inning-chip-label">Inning {inning.inning}</div>
                <div className="inning-chip-score">NYM {inning.metsRuns} · OPP {inning.oppRuns}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="game-drilldown-panel">
          <div className="card-title" style={{ marginBottom: '0.4rem' }}>Top Mets Performers</div>
          <div className="performer-list">
            {topPerformers.length === 0 && <div className="game-drilldown-status">No performer stats yet.</div>}
            {topPerformers.map(p => (
              <div key={p.id} className="performer-item"><span>{p.name}</span><span>{p.line}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="game-drilldown-panel" style={{ marginTop: '0.8rem' }}>
        <div className="card-title" style={{ marginBottom: '0.4rem' }}>Moment Timeline</div>
        <div className="event-feed" style={{ maxHeight: '40vh' }}>
          {keyEvents.length === 0 && <div className="game-drilldown-status">No major events available yet.</div>}
          {keyEvents.map((event, idx) => (
            <div key={`${event.inning}-${idx}`} className="event-item">
              <div className="event-meta">{event.half} {event.inning} · {event.result}</div>
              <div className="event-text">{event.description}</div>
              {event.runners.length > 0 && <div className="event-runners">Scored: {event.runners.join(', ')}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="game-drilldown-panel" style={{ marginTop: '0.8rem' }}>
        <div className="card-title" style={{ marginBottom: '0.45rem' }}>🎬 Video Highlights</div>
        {highlights.length === 0 ? (
          <div className="game-drilldown-status">No MLB highlight clips are available for this game yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.7rem' }}>
            {highlights.map(h => (
              <div key={h.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.5rem', background: 'rgba(0,0,0,0.22)' }}>
                <video controls preload="metadata" poster={h.thumbnail || undefined} style={{ width: '100%', borderRadius: 6, background: '#000' }}>
                  <source src={h.url} />
                </video>
                <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text)' }}>{h.title}</div>
                {h.duration && <div style={{ marginTop: '0.2rem', fontSize: '0.58rem', color: 'var(--muted)' }}>{h.duration}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GameDrillDown({ game }) {
  const { details, loading, error } = useGameFeed(game.gamePk);
  if (loading) return <div className="game-drilldown-status">Loading inning-by-inning feed…</div>;
  if (error) return <div className="game-drilldown-status" style={{ color: 'var(--loss)' }}>Could not load game feed: {error}</div>;
  if (!details) return <div className="game-drilldown-status">No feed details are available for this game yet.</div>;

  const { inningScoring, keyEvents, topPerformers, highlights } = details;
  return (
    <div className="game-drilldown">
      <div className="game-drilldown-grid">
        <div className="game-drilldown-panel">
          <div className="card-title" style={{ marginBottom: '0.4rem' }}>Inning Linescore</div>
          <div className="inning-grid">
            {inningScoring.map(inning => (
              <div key={inning.inning} className="inning-chip"><div className="inning-chip-label">{inning.inning}</div><div className="inning-chip-score">NYM {inning.metsRuns} · OPP {inning.oppRuns}</div></div>
            ))}
          </div>
        </div>
        <div className="game-drilldown-panel">
          <div className="card-title" style={{ marginBottom: '0.4rem' }}>Key Players</div>
          {topPerformers.length === 0 ? <div className="game-drilldown-status">No player stats posted yet.</div> : <div className="performer-list">{topPerformers.map(p => <div key={p.id} className="performer-item"><span>{p.name}</span><span>{p.line}</span></div>)}</div>}
        </div>
      </div>
      <div className="game-drilldown-panel" style={{ marginTop: '0.75rem' }}>
        <div className="card-title" style={{ marginBottom: '0.4rem' }}>Play-by-Play Feed</div>
        {keyEvents.length === 0 ? <div className="game-drilldown-status">No scoring or major events yet.</div> : (
          <div className="event-feed">{keyEvents.map((event, idx) => <div key={`${event.inning}-${idx}`} className="event-item"><div className="event-meta">{event.half} {event.inning} · {event.result}</div><div className="event-text">{event.description}</div>{event.runners.length > 0 && <div className="event-runners">Scored: {event.runners.join(', ')}</div>}</div>)}</div>
        )}
      </div>
      <div className="game-drilldown-panel" style={{ marginTop: '0.75rem' }}>
        <div className="card-title" style={{ marginBottom: '0.4rem' }}>Video Highlights</div>
        {highlights.length === 0 ? <div className="game-drilldown-status">No clips posted yet.</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
            {highlights.slice(0, 2).map(h => (
              <a key={h.id} href={h.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.45rem', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '0.66rem' }}>🎬 {h.title}</div>
                {h.duration && <div style={{ marginTop: '0.2rem', fontSize: '0.56rem', color: 'var(--muted)' }}>{h.duration}</div>}
              </a>
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    setLoading(true);
    setError(null);

    const cached = GAME_FEED_CACHE.get(gamePk);
    if (cached && Date.now() - cached.ts < GAME_FEED_TTL_MS) {
      setDetails(cached.data);
      setLoading(false);
      return () => {
        cancelled = true;
        controller.abort();
        clearTimeout(timeout);
      };
    }

    const requestOptions = {
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      mode: 'cors',
    };

    const feedPromise = fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`, requestOptions)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });

    const contentPromise = fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/content`, requestOptions)
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);

    Promise.all([feedPromise, contentPromise])
      .then(([feedJson, contentJson]) => {
        if (cancelled) return;
        const parsed = parseGameDetails(feedJson, contentJson);
        GAME_FEED_CACHE.set(gamePk, { data: parsed, ts: Date.now() });
        setDetails(parsed);
        setLoading(false);
      })
      .catch(e => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [gamePk]);

  return { details, loading, error };
}


function pickHighlightUrl(playbacks = []) {
  if (!Array.isArray(playbacks) || playbacks.length === 0) return null;
  const scored = playbacks
    .filter(p => p?.url)
    .map(p => {
      const name = String(p.name || '').toLowerCase();
      let score = 0;
      if (name.includes('mp4')) score += 4;
      if (name.includes('1280') || name.includes('720')) score += 3;
      if (name.includes('high') || name.includes('hq')) score += 2;
      if (name.includes('hls') || name.includes('m3u8')) score -= 1;
      return { score, url: p.url };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.url || null;
}

function parseHighlights(content) {
  const highlightItems = content?.highlights?.highlights?.items || [];
  const alternateItems = (content?.media?.epgAlternate || []).flatMap(section => section?.items || []);
  const items = [...highlightItems, ...alternateItems];

  const seen = new Set();
  const clips = [];
  items.forEach((item, idx) => {
    const url = pickHighlightUrl(item?.playbacks || []);
    if (!url || seen.has(url)) return;
    seen.add(url);
    const thumb = item?.image?.cuts?.[0]?.src || item?.image?.cuts?.[1]?.src || '';
    clips.push({
      id: item?.guid || item?.id || `${idx}_${url.slice(-12)}`,
      title: item?.headline || item?.title || 'Game highlight',
      duration: item?.duration || '',
      thumbnail: thumb,
      url,
    });
  });

  return clips.slice(0, MAX_HIGHLIGHTS);
}

function parseGameDetails(feed, content) {
  const metsTeamId = feed?.gameData?.teams?.home?.name === 'New York Mets'
    ? feed?.gameData?.teams?.home?.id
    : feed?.gameData?.teams?.away?.name === 'New York Mets'
    ? feed?.gameData?.teams?.away?.id
    : null;

  const innings = feed?.liveData?.linescore?.innings || [];
  const inningScoring = innings.map(i => {
    const homeId = feed?.gameData?.teams?.home?.id;
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
    highlights: parseHighlights(content),
    topPerformers: topPerformers.sort((a, b) => b.impact - a.impact).slice(0, 6),
  };
}
