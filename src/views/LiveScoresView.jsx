import { useMLBSchedule } from '../hooks.js';

export default function LiveScoresView() {
  const { games, loading, error } = useMLBSchedule();

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
          {live.map(g => <GameCard key={g.gamePk} game={g} />)}
          <div style={{ height: '1.5rem' }} />
        </>
      )}

      {recent.length > 0 && (
        <>
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>📋 Recent Results</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {recent.map(g => <GameCard key={g.gamePk} game={g} />)}
          </div>
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>🗓️ Upcoming Games</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.map(g => <GameCard key={g.gamePk} game={g} />)}
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

function GameCard({ game: g }) {
  const isLive     = g.statusCode === 'I';
  const isUpcoming = !g.result && !isLive;
  const cls        = isLive ? 'live' : g.result === 'W' ? 'win' : g.result === 'L' ? 'loss' : 'upcoming';

  return (
    <div className={`game-result-card ${cls}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 90 }}>
          {isLive
            ? <span className="badge badge-live">🔴 LIVE {g.inning}{g.inningHalf === 'Top' ? '▲' : '▼'}</span>
            : g.result
            ? <span className={`badge badge-${g.result === 'W' ? 'win' : 'loss'}`}>{g.result === 'W' ? '✓ WIN' : '✗ LOSS'}</span>
            : <span className="badge badge-limit">UPCOMING</span>
          }
        </div>

        <div style={{ flex: 1 }}>
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
      </div>

      {(g.winPitch || g.losePitch || g.savePitch) && (
        <div style={{ marginTop: '0.6rem', fontSize: '0.62rem', color: 'var(--muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(0,45,92,0.3)', paddingTop: '0.5rem' }}>
          {g.winPitch  && <span style={{ color: 'var(--win)'  }}>W: {g.winPitch}</span>}
          {g.losePitch && <span style={{ color: 'var(--loss)' }}>L: {g.losePitch}</span>}
          {g.savePitch && <span style={{ color: 'var(--gold)' }}>SV: {g.savePitch}</span>}
        </div>
      )}
    </div>
  );
}
