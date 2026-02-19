import { useState } from 'react';
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

function HitterCard({ player, statObj }) {
  const s = statObj?.hitting;
  const season = statObj?.season;
  return (
    <div className="player-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="player-number">#{player.number || '—'}</div>
          <div className="player-name">{player.name}</div>
          <div className="player-pos">{player.position} · {season ? `${season} Stats` : 'Loading...'}</div>
        </div>
        <div style={{ background: 'rgba(0,80,179,0.2)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🏏</div>
      </div>
      {s ? (
        <div className="player-stats" style={{ marginTop: '0.75rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="pstat"><div className="v">{fmt(s.avg)}</div><div className="l">AVG</div></div>
          <div className="pstat"><div className="v">{fmtInt(s.homeRuns)}</div><div className="l">HR</div></div>
          <div className="pstat"><div className="v">{fmtInt(s.rbi)}</div><div className="l">RBI</div></div>
          <div className="pstat"><div className="v">{fmtInt(s.hits)}</div><div className="l">H</div></div>
          <div className="pstat"><div className="v">{fmt(s.obp)}</div><div className="l">OBP</div></div>
          <div className="pstat"><div className="v">{fmt(s.slg)}</div><div className="l">SLG</div></div>
          <div className="pstat"><div className="v">{fmt(s.ops)}</div><div className="l">OPS</div></div>
          <div className="pstat"><div className="v">{fmtInt(s.strikeOuts)}</div><div className="l">K</div></div>
        </div>
      ) : (
        <div style={{ marginTop: '0.75rem' }}>
          {[1,2].map(i => <div key={i} className="loading-shimmer" style={{ height: 44, marginBottom: 6 }} />)}
        </div>
      )}
    </div>
  );
}

function PitcherCard({ player, statObj }) {
  const s = statObj?.pitching;
  const season = statObj?.season;
  return (
    <div className="player-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="player-number">#{player.number || '—'}</div>
          <div className="player-name">{player.name}</div>
          <div className="player-pos">{player.position} · {season ? `${season} Stats` : 'Loading...'}</div>
        </div>
        <div style={{ background: 'rgba(255,89,16,0.15)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>⚡</div>
      </div>
      {s ? (
        <div className="player-stats" style={{ marginTop: '0.75rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="pstat"><div className="v">{fmt(s.era, 2)}</div><div className="l">ERA</div></div>
          <div className="pstat"><div className="v">{fmt(s.whip)}</div><div className="l">WHIP</div></div>
          <div className="pstat"><div className="v">{fmtInt(s.strikeOuts)}</div><div className="l">K</div></div>
          <div className="pstat"><div className="v">{fmtInt(s.wins)}-{fmtInt(s.losses)}</div><div className="l">W-L</div></div>
          <div className="pstat"><div className="v">{fmt(s.inningsPitched, 1)}</div><div className="l">IP</div></div>
          <div className="pstat"><div className="v">{fmtInt(s.saves)}</div><div className="l">SV</div></div>
          <div className="pstat"><div className="v">{fmtInt(s.baseOnBalls)}</div><div className="l">BB</div></div>
          <div className="pstat"><div className="v">{fmtInt(s.homeRuns)}</div><div className="l">HR</div></div>
        </div>
      ) : (
        <div style={{ marginTop: '0.75rem' }}>
          {[1,2].map(i => <div key={i} className="loading-shimmer" style={{ height: 44, marginBottom: 6 }} />)}
        </div>
      )}
    </div>
  );
}

export default function PlayersView() {
  const { roster, stats, loading, error } = useMLBRoster();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const pitchers = roster.filter(p => p.posType === 'Pitcher');
  const hitters  = roster.filter(p => p.posType !== 'Pitcher');

  const filtered = (filter === 'pitchers' ? pitchers : filter === 'hitters' ? hitters : roster)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">👥 Mets Roster & Stats</div>
        <div className="page-sub">2026 Active Roster · Live via MLB Stats API</div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all','hitters','pitchers'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilter(f)}>
              {f === 'all' ? '⚾ All' : f === 'hitters' ? '🏏 Hitters' : '⚡ Pitchers'}
            </button>
          ))}
        </div>
        <input
          style={{ maxWidth: 220, height: 34 }}
          placeholder="Search player..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {roster.length > 0 && (
          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'Oswald', letterSpacing: '0.1em' }}>
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
              ? <PitcherCard key={p.id} player={p} statObj={stats[p.id]} />
              : <HitterCard  key={p.id} player={p} statObj={stats[p.id]} />
          ))}
        </div>
      )}

      {roster.length > 0 && !loading && (
        <div style={{ marginTop: '1.5rem', fontSize: '0.6rem', color: 'var(--muted)', textAlign: 'center', fontFamily: 'Oswald', letterSpacing: '0.1em' }}>
          STATS FROM MOST RECENT AVAILABLE SEASON · MLB STATS API
        </div>
      )}
    </>
  );
}
