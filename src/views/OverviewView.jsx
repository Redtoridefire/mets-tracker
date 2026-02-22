import { useState, useEffect } from 'react';
import { useWeather, weatherIcon, useMLBSchedule, useMLBStandings, useMLBFullSchedule } from '../hooks.js';
import { PROMOS } from '../data/promos.js';

// ─── SPRING TRAINING CARD ─────────────────────────────────────────────────────
function SpringTrainingCard() {
  const { games, loading } = useMLBFullSchedule();
  const today = new Date().toISOString().slice(0, 10);

  const stGames = games.filter(g => g.gameType === 'S');
  if (!loading && stGames.length === 0) return null;

  const played  = stGames.filter(g => g.result);
  const stWins  = played.filter(g => g.result === 'W').length;
  const stLoss  = played.filter(g => g.result === 'L').length;
  const nextST  = stGames.find(g => g.displayDate >= today && !g.result);
  const liveST  = stGames.find(g => g.statusCode === 'I');
  const feature = liveST || nextST || played.at(-1);
  const last5   = played.slice(-5);

  if (loading) return (
    <div className="st-card" style={{ marginBottom: '1.5rem' }}>
      <div className="loading-shimmer" style={{ height: 80 }} />
    </div>
  );

  return (
    <div className="st-card" style={{ marginBottom: '1.5rem' }}>
      <div className="st-header">
        <div>
          <div className="st-title">🌴 Spring Training 2026</div>
          <div className="st-sub">Clover Park · Port St. Lucie, FL</div>
        </div>
        <div className="st-record">
          <span style={{ color: 'var(--win)' }}>{stWins}W</span>
          <span style={{ color: 'var(--muted)', margin: '0 0.2rem' }}>–</span>
          <span style={{ color: 'var(--loss)' }}>{stLoss}L</span>
        </div>
      </div>

      {/* Mini W/L trail */}
      {last5.length > 0 && (
        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.52rem', color: 'var(--muted)', fontFamily: 'Oswald', letterSpacing: '0.12em', textTransform: 'uppercase', marginRight: '0.2rem', alignSelf: 'center' }}>Last {last5.length}:</span>
          {last5.map(g => (
            <span key={g.gamePk} className={`badge ${g.result === 'W' ? 'badge-win' : 'badge-loss'}`}>
              {g.result} {g.metsScore}–{g.oppScore}
            </span>
          ))}
        </div>
      )}

      {feature && (
        <div className="st-feature">
          <div className="st-feat-label">
            {liveST ? '🔴 LIVE NOW' : feature.displayDate === today ? '⚾ TODAY' : feature.result ? '📋 LAST' : '📅 NEXT'}
          </div>
          <div className="st-feat-matchup">
            <span style={{ color: 'var(--muted)', fontSize: '0.65rem' }}>{feature.isHome ? 'vs' : '@'}</span>{' '}
            <span style={{ fontFamily: 'Oswald', fontSize: '0.88rem' }}>{feature.oppName}</span>
            {feature.metsScore !== undefined && feature.oppScore !== undefined && (
              <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: feature.result === 'W' ? 'var(--win)' : feature.result === 'L' ? 'var(--loss)' : 'var(--text)', marginLeft: '0.5rem' }}>
                {feature.metsScore}–{feature.oppScore}
              </span>
            )}
          </div>
          <div className="st-feat-meta">
            {new Date(feature.displayDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            {feature.venue && ` · ${feature.venue.split(',')[0]}`}
          </div>
        </div>
      )}

      <div style={{ fontSize: '0.5rem', color: 'var(--muted)', marginTop: '0.5rem', fontFamily: 'DM Mono' }}>
        Live data from MLB Stats API · {stGames.length} ST games scheduled
      </div>
    </div>
  );
}

function getCountdown(isoDate) {
  const diff = new Date(isoDate + 'T00:00:00') - new Date();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hrs:  Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
  };
}

function WeatherWidget() {
  const { data, loading, error } = useWeather();

  if (loading) return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div className="card-title">🌤️ Citi Field Weather</div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ fontSize: '2.5rem' }}>⏳</div>
        <div>
          <div className="loading-shimmer" style={{ width: 100, height: 32, marginBottom: 8 }} />
          <div className="loading-shimmer" style={{ width: 160, height: 14 }} />
        </div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div className="card-title">🌤️ Citi Field Weather</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Weather unavailable — check back soon</div>
    </div>
  );

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div className="card-title">🌤️ Citi Field Weather · Flushing, NY</div>
      <div className="weather-card" style={{ padding: 0, border: 'none', background: 'none', gap: '1.25rem' }}>
        <div className="weather-icon">{weatherIcon(data.code)}</div>
        <div style={{ flex: 1 }}>
          <div className="weather-temp">{data.tempF}°F <span style={{ fontSize: '1rem', color: 'var(--text2)' }}>/ {data.tempC}°C</span></div>
          <div className="weather-desc">{data.desc}</div>
          <div className="weather-meta">
            <span>💧 {data.humidity}%</span>
            <span>💨 {data.windMph} mph {data.windDir}</span>
            <span>🌡️ Feels {data.feelsLikeF}°F</span>
            {parseFloat(data.precipMM) > 0 && <span>🌧️ {data.precipMM}mm</span>}
            <span>☀️ UV {data.uvIndex}</span>
          </div>
        </div>
      </div>
      {data.forecast?.length > 0 && (
        <div className="weather-forecast">
          {data.forecast.map((d, i) => (
            <div key={i} className="forecast-day">
              <div className="date">{i === 0 ? 'TODAY' : i === 1 ? 'TMW' : new Date(d.date + 'T12:00:00').toLocaleDateString('en',{weekday:'short'}).toUpperCase()}</div>
              <div className="icon">{weatherIcon(d.code)}</div>
              <div className="temp">{d.maxF}° / {d.minF}°</div>
              <div className="rain">💧{d.chanceRain}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StandingsWidget() {
  const { standings, loading } = useMLBStandings();

  if (loading) return (
    <div className="card">
      <div className="card-title">📊 NL East Standings</div>
      {[1,2,3,4,5].map(i => <div key={i} className="loading-shimmer" style={{ height: 28, marginBottom: 8 }} />)}
    </div>
  );

  if (!standings) return (
    <div className="card">
      <div className="card-title">📊 NL East Standings</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Standings not yet available — season starting soon!</div>
    </div>
  );

  return (
    <div className="card">
      <div className="card-title">📊 {standings.division}</div>
      {standings.teams?.map((t, i) => {
        const isMets = t.team?.id === 121;
        return (
          <div key={t.team?.id} className={`standings-row ${isMets ? 'mets-row' : ''}`}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: 'var(--muted)', width: 20 }}>{i+1}</span>
            <span style={{ fontFamily: 'Oswald', fontSize: '0.82rem', flex: 1, color: isMets ? 'white' : 'var(--text2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {isMets ? '⚾ ' : ''}{t.team?.name}
            </span>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '1rem', color: isMets ? 'var(--orange)' : 'var(--text2)', minWidth: 50, textAlign: 'right' }}>
              {t.wins}-{t.losses}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--muted)', minWidth: 40, textAlign: 'right', fontFamily: 'DM Mono' }}>
              {i === 0 ? '—' : t.gamesBack === '0.0' ? '—' : `GB ${t.gamesBack}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RecentGamesWidget() {
  const { games, loading } = useMLBSchedule();

  const recent = games.filter(g => g.result !== null).slice(0, 5);
  const live   = games.filter(g => g.statusCode === 'I').slice(0, 1);

  if (loading) return (
    <div className="card">
      <div className="card-title">🎮 Recent Results</div>
      {[1,2,3].map(i => <div key={i} className="loading-shimmer" style={{ height: 48, marginBottom: 8 }} />)}
    </div>
  );

  const allShow = [...live, ...recent].slice(0, 5);

  return (
    <div className="card">
      <div className="card-title">🎮 Recent Results</div>
      {allShow.length === 0 && (
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Season hasn't started yet — games incoming!</div>
      )}
      {allShow.map(g => {
        const isLive = g.statusCode === 'I';
        return (
          <div key={g.gamePk} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid rgba(0,45,92,0.3)' }}>
            <div style={{ minWidth: 70 }}>
              {isLive ? (
                <span className="badge badge-live">LIVE {g.inning}{g.inningHalf === 'Top' ? '▲' : '▼'}</span>
              ) : (
                <span className={`badge badge-${g.result === 'W' ? 'win' : 'loss'}`}>{g.result}</span>
              )}
            </div>
            <div style={{ flex: 1, fontFamily: 'Oswald', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)' }}>
              {g.isHome ? 'vs' : '@'} {g.oppName}
            </div>
            {(g.metsScore !== undefined && g.metsScore !== null) && (
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: g.result === 'W' ? 'var(--win)' : g.result === 'L' ? 'var(--loss)' : 'var(--text)', letterSpacing: '0.05em' }}>
                {g.metsScore} – {g.oppScore}
              </div>
            )}
            <div style={{ fontSize: '0.58rem', color: 'var(--muted)', minWidth: 64, textAlign: 'right' }}>
              {new Date(g.displayDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── GAME DAY CARD ────────────────────────────────────────────────────────────
function GameDayCard({ todayGame, todayPromo, onLogGame }) {
  const [timeLeft, setTimeLeft] = useState(null);

  const isFinal = todayGame.result !== null || ['F','FO','FT','FR'].includes(todayGame.statusCode);
  const isLive  = todayGame.statusCode === 'I';
  const homeAway = todayGame.isHome ? 'vs' : '@';

  useEffect(() => {
    if (!todayGame?.date || isFinal || isLive) return;
    const tick = () => {
      const diff = new Date(todayGame.date) - new Date();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [todayGame?.date, isFinal, isLive]);

  return (
    <div className="gameday-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'Oswald', fontSize: '0.58rem', letterSpacing: '0.28em', color: 'var(--orange)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            ⚾ Game Day
          </div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.9rem', letterSpacing: '0.08em', color: 'white', lineHeight: 1 }}>
            Mets {homeAway} {todayGame.oppName}
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text2)', fontFamily: 'Oswald', letterSpacing: '0.08em', marginTop: '0.2rem' }}>
            {todayGame.venue}{todayPromo?.time ? ` · ${todayPromo.time}` : ''}
          </div>
        </div>
        {todayPromo && (
          <button className="btn btn-primary" onClick={() => onLogGame(todayPromo)}>
            {isFinal ? '📝 Log This Game' : '+ Quick Log'}
          </button>
        )}
      </div>

      {todayPromo && (
        <div style={{ background: 'rgba(255,89,16,0.1)', border: '1px solid rgba(255,89,16,0.25)', borderRadius: 6, padding: '0.55rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem' }}>{todayPromo.icon}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--orange)', fontFamily: 'Oswald', letterSpacing: '0.06em' }}>
            {todayPromo.promo.split(' (')[0]}
          </span>
          {todayPromo.limit && (
            <span className="badge badge-limit" style={{ marginLeft: 'auto' }}>First {todayPromo.limit.toLocaleString()}</span>
          )}
          {todayPromo.specialTicket && (
            <span className="badge badge-special">Special Ticket</span>
          )}
        </div>
      )}

      {isLive ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-live" style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}>🔴 LIVE</span>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', letterSpacing: '0.06em', lineHeight: 1, color: 'var(--text)' }}>
            {todayGame.metsScore ?? 0} – {todayGame.oppScore ?? 0}
          </span>
          {todayGame.inning && (
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'Oswald', letterSpacing: '0.1em' }}>
              {todayGame.inningHalf === 'Top' ? '▲' : '▼'}{todayGame.inning} Inn
            </span>
          )}
        </div>
      ) : isFinal ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className={`badge badge-${todayGame.result === 'W' ? 'win' : todayGame.result === 'L' ? 'loss' : 'gold'}`} style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}>
            {todayGame.result === 'W' ? 'WIN ✓' : todayGame.result === 'L' ? 'LOSS ✗' : 'FINAL'}
          </span>
          {todayGame.metsScore != null && (
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', letterSpacing: '0.06em', lineHeight: 1, color: todayGame.result === 'W' ? 'var(--win)' : todayGame.result === 'L' ? 'var(--loss)' : 'var(--text)' }}>
              {todayGame.metsScore} – {todayGame.oppScore}
            </span>
          )}
          {!todayPromo && (
            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'DM Mono' }}>
              (Non-promo game — log via Schedule tab)
            </span>
          )}
        </div>
      ) : timeLeft ? (
        <div>
          <div style={{ fontFamily: 'Oswald', fontSize: '0.52rem', letterSpacing: '0.22em', color: 'var(--muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            First Pitch In
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {[['h','Hrs'],['m','Min'],['s','Sec']].map(([key, lbl], i) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {i > 0 && <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: 'var(--border2)', lineHeight: 1, marginBottom: '12px' }}>:</span>}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: 'var(--orange)', lineHeight: 1 }}>
                    {String(timeLeft[key]).padStart(2, '0')}
                  </div>
                  <div style={{ fontFamily: 'Oswald', fontSize: '0.45rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '0.72rem', color: 'var(--orange)', fontFamily: 'Oswald', letterSpacing: '0.1em' }}>
          ⚾ PLAY BALL — Game time is here!
        </div>
      )}
    </div>
  );
}

export default function OverviewView({ userData, todayGame, todayPromo, onLogGame }) {
  const { gameRecords = {}, eggrollLog = {} } = userData;
  const today = new Date().toISOString().slice(0, 10);

  const attended       = Object.values(gameRecords).filter(r => r?.attended).length;
  const planned        = Object.values(gameRecords).filter(r => r?.planned && !r?.attended).length;
  const promoCollected = Object.values(gameRecords).filter(r => r?.promoCollected).length;
  const wins           = Object.values(gameRecords).filter(r => r?.result === 'W').length;
  const losses         = Object.values(gameRecords).filter(r => r?.result === 'L').length;
  const eggrollCount   = Object.values(eggrollLog).filter(r => r?.logged).length;
  const totalSpent     = Object.values(gameRecords).reduce((sum, r) => sum + (r?.totalCost || 0), 0);

  const nextGame  = PROMOS.find(p => p.isoDate >= today && !gameRecords[p.id]?.attended) || null;
  const countdown = nextGame ? getCountdown(nextGame.isoDate) : null;

  // Upcoming promo chips (next N unattended future games)
  const upcomingChips = PROMOS.filter(p => p.isoDate >= today && !gameRecords[p.id]?.attended);

  // Good-luck charm stat
  const recordedGames = Object.values(gameRecords).filter(r => r?.attended && r?.result);
  const charmRate = recordedGames.length > 0
    ? `${wins}‑${losses}`
    : null;

  return (
    <>
      <div className="page-hdr">
        <div className="page-title">🏟️ Mets HQ — 2026</div>
        <div className="page-sub">Season Command Center · Citi Field · Flushing, NY</div>
      </div>

      {todayGame && (
        <GameDayCard
          todayGame={todayGame}
          todayPromo={todayPromo}
          onLogGame={onLogGame}
        />
      )}

      <div className="stats-row">
        <div className="stat-card"><div className="big">{attended}</div><div className="lbl">Games Attended</div></div>
        <div className="stat-card"><div className="big">{promoCollected}</div><div className="lbl">Promos Snagged</div></div>
        <div className="stat-card">
          <div className="big" style={{ color: wins > losses ? 'var(--win)' : wins < losses ? 'var(--loss)' : 'var(--orange)' }}>
            {wins}‑{losses}
          </div>
          <div className="lbl">Your W-L</div>
        </div>
        {charmRate ? (
          <div className="stat-card" style={{ borderColor: wins > losses ? 'rgba(0,230,118,0.3)' : undefined }}>
            <div className="big" style={{ fontSize: '1.6rem', color: wins > losses ? 'var(--win)' : wins < losses ? 'var(--loss)' : 'var(--orange)' }}>
              {wins > losses ? '🍀' : wins < losses ? '😬' : '⚖️'}
            </div>
            <div className="lbl" style={{ fontSize: '0.48rem', lineHeight: 1.4 }}>
              Mets {charmRate} when you're there
            </div>
          </div>
        ) : (
          <div className="stat-card"><div className="big">{planned > 0 ? planned : '—'}</div><div className="lbl">{planned > 0 ? 'Games Planned' : 'Charm TBD'}</div></div>
        )}
        <div className="stat-card"><div className="big">{eggrollCount}</div><div className="lbl">Eggrolls Tried</div></div>
        <div className="stat-card">
          <div className="big" style={{ color: 'var(--gold)', fontSize: '2rem' }}>${totalSpent.toFixed(0)}</div>
          <div className="lbl">Total Spent</div>
        </div>
        <div className="stat-card"><div className="big">{20 - attended}</div><div className="lbl">Promos Left</div></div>
      </div>

      <SpringTrainingCard />

      {/* ── Upcoming promo chip strip ── */}
      {upcomingChips.length > 0 && (
        <div className="promo-strip-wrap">
          <div className="promo-strip">
            {upcomingChips.map(p => {
              const daysLeft = Math.ceil((new Date(p.isoDate + 'T00:00:00') - new Date()) / 86400000);
              return (
                <div key={p.id} className="promo-chip">
                  <div className="promo-chip-icon">{p.icon}</div>
                  <div className="promo-chip-days">
                    {daysLeft <= 0 ? 'TODAY' : daysLeft === 1 ? 'TMW' : `${daysLeft}d`}
                  </div>
                  <div className="promo-chip-opp">{p.oppShort || p.opponent.split(' ').pop()}</div>
                  <div className="promo-chip-date">{p.display}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {nextGame && countdown && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(255,89,16,0.3)', background: 'linear-gradient(135deg, var(--card), rgba(255,89,16,0.04))' }}>
          <div className="card-title">⏳ Next Promo Game</div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: 'white', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            {nextGame.emoji} vs {nextGame.opponent} · {nextGame.display} · {nextGame.time}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '1rem' }}>
            {nextGame.icon} {nextGame.promo}
            {nextGame.specialTicket && <span className="badge badge-special" style={{ marginLeft: '0.5rem' }}>Special Ticket</span>}
            {nextGame.limit && <span className="badge badge-limit" style={{ marginLeft: '0.5rem' }}>First {nextGame.limit.toLocaleString()}</span>}
          </div>
          <div className="countdown">
            <div className="cd-unit"><span className="cd-val">{String(countdown.days).padStart(2,'0')}</span><span className="cd-lbl">Days</span></div>
            <span className="cd-sep">:</span>
            <div className="cd-unit"><span className="cd-val">{String(countdown.hrs).padStart(2,'0')}</span><span className="cd-lbl">Hours</span></div>
            <span className="cd-sep">:</span>
            <div className="cd-unit"><span className="cd-val">{String(countdown.mins).padStart(2,'0')}</span><span className="cd-lbl">Mins</span></div>
          </div>
        </div>
      )}

      <WeatherWidget />

      <div style={{ height: '1.5rem' }} />

      <div className="grid-2">
        <RecentGamesWidget />
        <StandingsWidget />
      </div>

      <div style={{ height: '1.5rem' }} />

      <div className="grid-2">
        <div className="card">
          <div className="card-title">🗓️ Upcoming Promo Games</div>
          {PROMOS.filter(p => p.isoDate >= today).slice(0, 6).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0', borderBottom: '1px solid rgba(0,45,92,0.3)' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '0.62rem', color: 'var(--muted)', minWidth: 62 }}>{p.display}</span>
              <span>{p.emoji}</span>
              <span style={{ fontFamily: 'Oswald', fontSize: '0.78rem', flex: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.opponent}</span>
              <span style={{ fontSize: '0.85rem' }}>{p.icon}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">🏆 My Recent Games</div>
          {Object.entries(gameRecords).filter(([,r]) => r?.attended).slice(-6).reverse().map(([id, rec]) => {
            const p = PROMOS.find(pr => pr.id === Number(id));
            if (!p) return null;
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0', borderBottom: '1px solid rgba(0,45,92,0.3)' }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.62rem', color: 'var(--muted)', minWidth: 62 }}>{p.display}</span>
                <span>{p.emoji}</span>
                <span style={{ fontFamily: 'Oswald', fontSize: '0.78rem', flex: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.opponent}</span>
                {rec.result && <span className={`badge badge-${rec.result === 'W' ? 'win' : 'loss'}`}>{rec.result}</span>}
                {rec.promoCollected && <span title={p.promo}>{p.icon}</span>}
                {rec.totalCost > 0 && <span style={{ fontSize: '0.65rem', color: 'var(--gold)' }}>${rec.totalCost}</span>}
              </div>
            );
          })}
          {attended === 0 && <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>No games logged yet — head to Schedule!</div>}
        </div>
      </div>
    </>
  );
}
