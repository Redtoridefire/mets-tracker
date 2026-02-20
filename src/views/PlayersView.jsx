import { useState, useMemo } from 'react';
import { useMLBRoster } from '../hooks.js';

function fmt(val, dec = 3) {
  if (val === undefined || val === null || val === '') return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return dec === 3 ? n.toFixed(3).replace(/^0/, '') : n.toFixed(dec);
}

function fmtInt(val) {
  if (val === undefined || val === null) return '—';
  return String(val);
}

function StatBox({ v, l }) {
  return (
    <div className="pstat">
      <div className="v">{v}</div>
      <div className="l">{l}</div>
    </div>
  );
}

// ─── HITTER FLIP CARD ─────────────────────────────────────────────────────────
function HitterCard({ player, statObj, flipped, onFlip }) {
  const s      = statObj?.hitting;
  const season = statObj?.season;

  return (
    <div className="player-flip-wrap" onClick={onFlip} role="button" aria-label={`${player.name} stats — tap to flip`}>
      <div className={`player-flip-inner ${flipped ? 'flipped' : ''}`}>

        {/* ── FRONT: primary stats ── */}
        <div className="player-flip-front">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div>
              <div className="player-number">#{player.number || '—'}</div>
              <div className="player-name">{player.name}</div>
              <div className="player-pos">{player.position} · {player.posType}</div>
            </div>
            <div style={{ background: 'rgba(0,80,179,0.2)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🏏</div>
          </div>
          {s ? (
            <div className="player-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <StatBox v={fmt(s.avg)}             l="AVG" />
              <StatBox v={fmtInt(s.homeRuns)}     l="HR"  />
              <StatBox v={fmtInt(s.rbi)}          l="RBI" />
              <StatBox v={fmtInt(s.hits)}         l="H"   />
            </div>
          ) : (
            <div style={{ marginTop: '0.5rem' }}>
              <div className="loading-shimmer" style={{ height: 44 }} />
            </div>
          )}
          {season && (
            <div style={{ fontSize: '0.45rem', color: 'var(--muted)', fontFamily: 'Oswald', letterSpacing: '0.12em', marginTop: '0.4rem' }}>
              {season} SEASON
            </div>
          )}
          <div className="player-flip-hint">Tap for advanced stats ↔</div>
        </div>

        {/* ── BACK: advanced stats ── */}
        <div className="player-flip-back">
          <div style={{ fontFamily: 'Oswald', fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {player.name}
            {season && <span style={{ color: 'var(--muted)', marginLeft: '0.4rem', fontSize: '0.52rem' }}>· {season}</span>}
          </div>
          {s ? (
            <div className="player-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <StatBox v={fmt(s.obp)}             l="OBP" />
              <StatBox v={fmt(s.slg)}             l="SLG" />
              <StatBox v={fmt(s.ops)}             l="OPS" />
              <StatBox v={fmtInt(s.strikeOuts)}   l="K"   />
              <StatBox v={fmtInt(s.baseOnBalls)}  l="BB"  />
              <StatBox v={fmtInt(s.runs)}         l="R"   />
              <StatBox v={fmtInt(s.stolenBases)}  l="SB"  />
              <StatBox v={fmtInt(s.gamesPlayed)}  l="G"   />
            </div>
          ) : (
            <div className="loading-shimmer" style={{ height: 80 }} />
          )}
          <div className="player-flip-hint">Tap to flip back ↔</div>
        </div>

      </div>
    </div>
  );
}

// ─── PITCHER FLIP CARD ────────────────────────────────────────────────────────
function PitcherCard({ player, statObj, flipped, onFlip }) {
  const s      = statObj?.pitching;
  const season = statObj?.season;

  return (
    <div className="player-flip-wrap" onClick={onFlip} role="button" aria-label={`${player.name} stats — tap to flip`}>
      <div className={`player-flip-inner ${flipped ? 'flipped' : ''}`}>

        {/* ── FRONT: primary stats ── */}
        <div className="player-flip-front">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div>
              <div className="player-number">#{player.number || '—'}</div>
              <div className="player-name">{player.name}</div>
              <div className="player-pos">{player.position} · {player.posType}</div>
            </div>
            <div style={{ background: 'rgba(255,89,16,0.15)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>⚡</div>
          </div>
          {s ? (
            <div className="player-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <StatBox v={fmt(s.era, 2)}                             l="ERA"  />
              <StatBox v={fmt(s.whip)}                               l="WHIP" />
              <StatBox v={fmtInt(s.strikeOuts)}                      l="K"    />
              <StatBox v={`${fmtInt(s.wins)}-${fmtInt(s.losses)}`}  l="W-L"  />
            </div>
          ) : (
            <div style={{ marginTop: '0.5rem' }}>
              <div className="loading-shimmer" style={{ height: 44 }} />
            </div>
          )}
          {season && (
            <div style={{ fontSize: '0.45rem', color: 'var(--muted)', fontFamily: 'Oswald', letterSpacing: '0.12em', marginTop: '0.4rem' }}>
              {season} SEASON
            </div>
          )}
          <div className="player-flip-hint">Tap for advanced stats ↔</div>
        </div>

        {/* ── BACK: advanced stats ── */}
        <div className="player-flip-back">
          <div style={{ fontFamily: 'Oswald', fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {player.name}
            {season && <span style={{ color: 'var(--muted)', marginLeft: '0.4rem', fontSize: '0.52rem' }}>· {season}</span>}
          </div>
          {s ? (
            <div className="player-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <StatBox v={fmt(s.inningsPitched, 1)} l="IP"   />
              <StatBox v={fmtInt(s.saves)}          l="SV"   />
              <StatBox v={fmtInt(s.baseOnBalls)}    l="BB"   />
              <StatBox v={fmtInt(s.homeRuns)}       l="HR"   />
              <StatBox v={fmtInt(s.hits)}           l="H"    />
              <StatBox v={fmtInt(s.gamesPlayed)}    l="G"    />
              <StatBox v={fmtInt(s.gamesStarted)}   l="GS"   />
              <StatBox v={fmtInt(s.blownSaves)}     l="BS"   />
            </div>
          ) : (
            <div className="loading-shimmer" style={{ height: 80 }} />
          )}
          <div className="player-flip-hint">Tap to flip back ↔</div>
        </div>

      </div>
    </div>
  );
}

// ─── PLAYERS VIEW ─────────────────────────────────────────────────────────────
export default function PlayersView() {
  const { roster, stats, loading, error } = useMLBRoster();
  const [filter,       setFilter]       = useState('all');
  const [search,       setSearch]       = useState('');
  const [flippedCards, setFlippedCards] = useState(new Set());

  const toggleFlip = id => setFlippedCards(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filtered = useMemo(() => {
    const base = filter === 'pitchers'
      ? roster.filter(p => p.posType === 'Pitcher')
      : filter === 'hitters'
        ? roster.filter(p => p.posType !== 'Pitcher')
        : roster;
    return search
      ? base.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      : base;
  }, [roster, filter, search]);

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">👥 Mets Roster & Stats</div>
        <div className="page-sub">2026 Active Roster · Tap any card to flip for advanced stats</div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all','hitters','pitchers'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? '⚾ All' : f === 'hitters' ? '🏏 Hitters' : '⚡ Pitchers'}
            </button>
          ))}
        </div>
        <input
          style={{ maxWidth: 220, height: 34 }}
          placeholder="Search player..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          maxLength={50}
        />
        {flippedCards.size > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFlippedCards(new Set())}>
            ↺ Flip All Back
          </button>
        )}
        {roster.length > 0 && (
          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'Oswald', letterSpacing: '0.1em', marginLeft: 'auto' }}>
            {filtered.length} PLAYERS
          </span>
        )}
      </div>

      {loading && roster.length === 0 && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
          <div style={{ fontFamily: 'Oswald', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.2em' }}>
            FETCHING METS ROSTER FROM MLB STATS API...
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: 'rgba(255,68,68,0.3)', marginBottom: '1rem' }}>
          <div style={{ color: 'var(--loss)', fontSize: '0.75rem' }}>⚠️ Could not load roster: {error}</div>
        </div>
      )}

      {roster.length === 0 && !loading && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚾</div>
          <div style={{ fontFamily: 'Oswald', fontSize: '0.82rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
            ROSTER NOT YET AVAILABLE FOR 2026 — CHECK BACK AS OPENING DAY APPROACHES!
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
            The MLB Stats API roster will populate once the active 26-man roster is set.
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {filtered.map(p => (
            p.posType === 'Pitcher'
              ? <PitcherCard key={p.id} player={p} statObj={stats[p.id]} flipped={flippedCards.has(p.id)} onFlip={() => toggleFlip(p.id)} />
              : <HitterCard  key={p.id} player={p} statObj={stats[p.id]} flipped={flippedCards.has(p.id)} onFlip={() => toggleFlip(p.id)} />
          ))}
        </div>
      )}

      {roster.length > 0 && !loading && (
        <div style={{ marginTop: '1.5rem', fontSize: '0.6rem', color: 'var(--muted)', textAlign: 'center', fontFamily: 'Oswald', letterSpacing: '0.1em' }}>
          STATS FROM MOST RECENT AVAILABLE SEASON · MLB STATS API · TAP ANY CARD TO SEE ADVANCED STATS
        </div>
      )}
    </>
  );
}
