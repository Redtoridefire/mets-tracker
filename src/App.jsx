import { useState, useMemo, useEffect } from 'react';
import CSS from './styles.js';
import { PROMOS } from './data/promos.js';
import { useMLBSchedule } from './hooks.js';
import {
  getProfiles, createProfile, deleteProfile,
  getActiveProfileId, setActiveProfileId,
  getUserData, patchUserData,
  exportProfileData, importProfileData,
} from './storage.js';
import OverviewView from './views/OverviewView.jsx';
import LiveScoresView from './views/LiveScoresView.jsx';
import PlayersView from './views/PlayersView.jsx';
import { ScheduleView, MyGamesView, TrophyView, EggrollView, MapView } from './views/OtherViews.jsx';

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id:'overview',  icon:'🏟️', label:'Home Base',     short:'Home'     },
  { id:'scores',    icon:'🎮', label:'Live Scores',   short:'Scores'   },
  { id:'schedule',  icon:'📅', label:'Schedule',      short:'Sched'    },
  { id:'mygames',   icon:'🎟️', label:'My Games',      short:'Games'    },
  { id:'players',   icon:'👥', label:'Player Stats',  short:'Players'  },
  { id:'trophy',    icon:'🏆', label:'Trophy Shelf',  short:'Trophy'   },
  { id:'eggroll',   icon:'🥚', label:'Eggroll Log',   short:'Eggroll'  },
  { id:'map',       icon:'🗺️', label:'Citi Field Map',short:'Map'      },
];

// ─── AVATAR PICKER ────────────────────────────────────────────────────────────
const AVATARS = ['⚾','🏟️','🔵','🟠','🧢','🎯','👊','🔥','🦁','🏆'];

// ─── PROFILE SCREEN (first launch / switcher) ─────────────────────────────────
function ProfileScreen({ onSelect }) {
  const [profiles, setProfiles] = useState(getProfiles());
  const [creating, setCreating] = useState(profiles.length === 0);
  const [name, setName]         = useState('');
  const [avatar, setAvatar]     = useState('⚾');

  const refresh = () => setProfiles(getProfiles());

  const create = () => {
    if (!name.trim()) return;
    const p = createProfile(name.trim(), avatar);
    setActiveProfileId(p.id);
    onSelect(p.id);
  };

  const select = id => { setActiveProfileId(id); onSelect(id); };

  const remove = id => {
    if (!confirm('Delete this profile and all its data?')) return;
    deleteProfile(id);
    refresh();
  };

  return (
    <div className="profile-screen">
      <div className="profile-box">
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', letterSpacing: '0.12em', background: 'linear-gradient(135deg,#fff,var(--orange))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, marginBottom: '0.25rem' }}>
          ⚾ METS HQ
        </div>
        <div style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '2rem' }}>
          2026 SEASON TRACKER
        </div>

        {!creating && profiles.length > 0 ? (
          <>
            <div style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '1rem', textAlign: 'left' }}>
              SELECT YOUR PROFILE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {profiles.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => select(p.id)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: '1.5rem' }}>{p.avatar}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontFamily: 'Oswald', fontSize: '0.9rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'white' }}>{p.name}</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>Created {new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); remove(p.id); }}>✕</button>
                </div>
              ))}
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setCreating(true)}>
              + Add New Profile
            </button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: 'Oswald', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '1rem', textAlign: 'left' }}>
              {profiles.length > 0 ? 'NEW PROFILE' : 'CREATE YOUR PROFILE'}
            </div>
            <div className="form-group">
              <label>Your Name</label>
              <input
                placeholder="e.g. Mike"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && create()}
                maxLength={40}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Pick an Avatar</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {AVATARS.map(a => (
                  <span key={a}
                    onClick={() => setAvatar(a)}
                    style={{ fontSize: '1.5rem', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px', border: `2px solid ${avatar === a ? 'var(--orange)' : 'transparent'}`, transition: 'all 0.15s', background: avatar === a ? 'rgba(255,89,16,0.1)' : 'transparent' }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {profiles.length > 0 && (
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setCreating(false)}>Back</button>
              )}
              <button className="btn btn-primary" style={{ flex: 2 }} disabled={!name.trim()} onClick={create}>
                Let's Go Mets! ⚾
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── GAME LOG MODAL ───────────────────────────────────────────────────────────
function GameModal({ game, record, onSave, onClose }) {
  const [form, setForm] = useState({
    attended:      true,
    result:        '',
    section:       '',
    row:           '',
    seat:          '',
    promoCollected:false,
    who:           '',
    food:          '',
    notes:         '',
    costTickets:   '',
    costFood:      '',
    costParking:   '',
    costMerch:     '',
    ...record,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const totalCost = [form.costTickets, form.costFood, form.costParking, form.costMerch]
    .map(v => parseFloat(v) || 0)
    .reduce((a, b) => a + b, 0);

  const save = () => onSave({ ...form, attended: true, totalCost: parseFloat(totalCost.toFixed(2)) });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{game.emoji} vs {game.opponent}</div>
        <div className="modal-sub">{game.display} · {game.time} · {game.icon} {game.promo}</div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Game Result</label>
            <select value={form.result} onChange={e => set('result', e.target.value)}>
              <option value="">Not recorded</option>
              <option value="W">🎉 Mets Won</option>
              <option value="L">😔 Mets Lost</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Got Promo Item?</label>
            <select value={form.promoCollected ? 'yes' : 'no'} onChange={e => set('promoCollected', e.target.value === 'yes')}>
              <option value="no">No / N/A</option>
              <option value="yes">✓ Yes! Got it</option>
            </select>
          </div>
        </div>

        <div className="form-section-title">📍 Seat Info</div>
        <div className="form-row-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Section</label>
            <input placeholder="e.g. 105" value={form.section} onChange={e => set('section', e.target.value)} maxLength={10} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Row</label>
            <input placeholder="e.g. 14" value={form.row} onChange={e => set('row', e.target.value)} maxLength={10} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Seat #</label>
            <input placeholder="e.g. 7" value={form.seat} onChange={e => set('seat', e.target.value)} maxLength={10} />
          </div>
        </div>

        <div className="form-section-title">💰 Cost Tracker</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {[
            ['costTickets', '🎟️ Tickets ($)'],
            ['costFood',    '🌭 Food & Drinks ($)'],
            ['costParking', '🅿️ Parking ($)'],
            ['costMerch',   '🛍️ Merch ($)'],
          ].map(([key, lbl]) => (
            <div key={key} className="form-group" style={{ marginBottom: 0 }}>
              <label>{lbl}</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form[key] || ''} onChange={e => set(key, e.target.value)} />
            </div>
          ))}
        </div>
        {totalCost > 0 && (
          <div style={{ background: 'rgba(255,204,0,0.08)', border: '1px solid rgba(255,204,0,0.2)', borderRadius: 6, padding: '0.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'Oswald', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Total This Game</span>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>${totalCost.toFixed(2)}</span>
          </div>
        )}

        <div className="form-section-title">👥 Details</div>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Who'd You Go With?</label>
            <input placeholder="e.g. Mike, Sarah, Tony" value={form.who} onChange={e => set('who', e.target.value)} maxLength={200} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Food / Drinks Ordered</label>
            <input placeholder="e.g. Eggroll, Shake Shack, Modelos" value={form.food} onChange={e => set('food', e.target.value)} maxLength={200} />
          </div>
        </div>
        <div className="form-group">
          <label>💬 Notes / Memories</label>
          <textarea placeholder="How was the vibe? Any highlights? Walk-off? Crazy fan moment?" value={form.notes} onChange={e => set('notes', e.target.value)} maxLength={1000} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>✓ Save Game Log</button>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE SWITCHER MODAL ───────────────────────────────────────────────────
function ProfileSwitcherModal({ currentId, onSwitch, onClose }) {
  const [profiles,  setProfiles]  = useState(getProfiles);
  const [importMsg, setImportMsg] = useState(null);

  const handleExport = () => {
    try {
      const json = exportProfileData(currentId);
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `mets-hq-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setImportMsg({ ok: false, text: e.message });
    }
  };

  const handleImport = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const newProfile = importProfileData(ev.target.result);
        setImportMsg({ ok: true, text: `Imported "${newProfile.name}" successfully!` });
        setProfiles(getProfiles());
      } catch (err) {
        setImportMsg({ ok: false, text: err.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">Switch Profile</div>
        <div className="modal-sub">Each profile has its own game log & data</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
          {profiles.map(p => (
            <div key={p.id}
              onClick={() => { setActiveProfileId(p.id); onSwitch(p.id); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: p.id === currentId ? 'rgba(255,89,16,0.1)' : 'var(--surface)', border: `1px solid ${p.id === currentId ? 'rgba(255,89,16,0.4)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '1.4rem' }}>{p.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Oswald', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: p.id === currentId ? 'var(--orange)' : 'white' }}>{p.name}</div>
              </div>
              {p.id === currentId && <span style={{ fontSize: '0.65rem', color: 'var(--orange)', fontFamily: 'Oswald' }}>ACTIVE</span>}
            </div>
          ))}
        </div>
        <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => { onClose(); onSwitch(null); }}>
          + Add New Profile
        </button>

        {/* ── Data Management ── */}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--muted)', fontFamily: 'Oswald', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Data Management
          </div>
          {importMsg && (
            <div style={{ marginBottom: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: 6, background: importMsg.ok ? 'rgba(0,200,0,0.08)' : 'rgba(255,68,68,0.08)', border: `1px solid ${importMsg.ok ? 'rgba(0,200,0,0.2)' : 'rgba(255,68,68,0.2)'}`, fontSize: '0.65rem', color: importMsg.ok ? 'var(--win)' : 'var(--loss)' }}>
              {importMsg.ok ? '✓ ' : '⚠️ '}{importMsg.text}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={handleExport}>
              ⬇ Export Backup
            </button>
            <label className="btn btn-outline btn-sm" style={{ flex: 1, cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ⬆ Import Backup
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            </label>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.55rem', color: 'var(--muted)', lineHeight: 1.5 }}>
            Export saves your game log to a JSON file. Import restores a backup as a new profile.
          </div>
        </div>

        <div className="modal-footer" style={{ paddingTop: '0.75rem', marginTop: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ profile, userData, onSwitchProfile }) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const { gameRecords = {} } = userData;

  const attended       = Object.values(gameRecords).filter(r => r?.attended).length;
  const promoCollected = Object.values(gameRecords).filter(r => r?.promoCollected).length;
  const wins           = Object.values(gameRecords).filter(r => r?.result === 'W').length;
  const losses         = Object.values(gameRecords).filter(r => r?.result === 'L').length;
  const totalSpent     = Object.values(gameRecords).reduce((s, r) => s + (r?.totalCost || 0), 0);

  return (
    <header className="hdr">
      <div className="hdr-brand">
        <div>
          <div className="hdr-logo">⚾ Mets HQ</div>
          <div className="hdr-tag">2026 Season Tracker · Citi Field</div>
        </div>
      </div>
      <div className="hdr-right">
        <div className="hdr-stats">
          <div className="hdr-stat"><div className="v">{attended}</div><div className="l">Games</div></div>
          <div className="hdr-div" />
          <div className="hdr-stat"><div className="v">{promoCollected}</div><div className="l">Promos</div></div>
          <div className="hdr-div" />
          <div className="hdr-stat">
            <div className="v" style={{ color: wins > losses ? 'var(--win)' : wins < losses ? 'var(--loss)' : 'var(--orange)' }}>{wins}‑{losses}</div>
            <div className="l">W-L</div>
          </div>
          <div className="hdr-div" />
          <div className="hdr-stat"><div className="v" style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>${totalSpent.toFixed(0)}</div><div className="l">Spent</div></div>
          <div className="hdr-div" />
        </div>
        <button className="profile-btn" onClick={() => setShowSwitcher(true)}>
          <span className="profile-avatar">{profile?.avatar || '⚾'}</span>
          {profile?.name || 'Guest'}
        </button>
      </div>
      {showSwitcher && (
        <ProfileSwitcherModal
          currentId={profile?.id}
          onSwitch={id => { setShowSwitcher(false); onSwitchProfile(id); }}
          onClose={() => setShowSwitcher(false)}
        />
      )}
    </header>
  );
}

// ─── MOBILE BOTTOM NAV ────────────────────────────────────────────────────────
function MobileNav({ tab, setTab, attended, promoCollected }) {
  return (
    <nav className="mobile-nav">
      {TABS.map(t => (
        <div
          key={t.id}
          className={`mobile-nav-item ${tab === t.id ? 'active' : ''}`}
          onClick={() => setTab(t.id)}
        >
          <span className="mob-icon">{t.icon}</span>
          <span className="mob-label">{t.short}</span>
          {t.id === 'mygames'  && attended > 0        && <span className="mob-badge">{attended}</span>}
          {t.id === 'trophy'   && promoCollected > 0   && <span className="mob-badge">{promoCollected}</span>}
        </div>
      ))}
    </nav>
  );
}

// ─── GAME DAY BANNER ──────────────────────────────────────────────────────────
function GameDayBanner({ todayGame, todayPromo, onLogGame }) {
  const isFinal = todayGame.result !== null || ['F','FO','FT','FR'].includes(todayGame.statusCode);
  const isLive  = todayGame.statusCode === 'I';
  const homeAway = todayGame.isHome ? 'vs' : '@';

  return (
    <div className="gameday-banner">
      <div className="gameday-dot" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', minWidth: 0 }}>
        {isFinal ? (
          <span style={{ fontFamily: 'Oswald', fontSize: '0.8rem', letterSpacing: '0.12em', color: todayGame.result === 'W' ? 'var(--win)' : todayGame.result === 'L' ? 'var(--loss)' : 'var(--text2)', textTransform: 'uppercase' }}>
            FINAL · Mets {todayGame.metsScore}–{todayGame.oppScore} {homeAway} {todayGame.oppName}
          </span>
        ) : isLive ? (
          <span style={{ fontFamily: 'Oswald', fontSize: '0.8rem', letterSpacing: '0.12em', color: '#ff6b6b', textTransform: 'uppercase' }}>
            🔴 LIVE · Mets {todayGame.metsScore ?? 0}–{todayGame.oppScore ?? 0} {homeAway} {todayGame.oppName}
            {todayGame.inning && <span> · {todayGame.inningHalf === 'Top' ? '▲' : '▼'}{todayGame.inning}</span>}
          </span>
        ) : (
          <span style={{ fontFamily: 'Oswald', fontSize: '0.8rem', letterSpacing: '0.12em', color: 'var(--orange)', textTransform: 'uppercase' }}>
            🔴 GAME DAY — {homeAway} {todayGame.oppName} · {todayGame.venue}
          </span>
        )}
        {todayPromo && (
          <span style={{ fontSize: '0.68rem', color: 'var(--text2)', fontFamily: 'DM Mono', whiteSpace: 'nowrap' }}>
            🎁 {todayPromo.promo.split(' (')[0]}
          </span>
        )}
      </div>
      {todayPromo && (
        <button className="btn btn-primary btn-sm" onClick={() => onLogGame(todayPromo)} style={{ flexShrink: 0 }}>
          {isFinal ? '📝 Log Game' : '+ Log Game'}
        </button>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [profileId,  setProfileId]  = useState(() => getActiveProfileId());
  const [tab,        setTab]        = useState('overview');
  const [userData,   setUserData]   = useState(() => getUserData(getActiveProfileId()));
  const [editGame,   setEditGame]   = useState(null);

  const profile = useMemo(() => getProfiles().find(p => p.id === profileId) || null, [profileId]);

  // Game Day detection — called at App level so banner + Overview card share the data
  const { games: scheduleGames } = useMLBSchedule();
  const todayStr   = new Date().toISOString().slice(0, 10);
  const todayGame  = scheduleGames.find(g => g.displayDate === todayStr && g.gameType === 'R') || null;
  const todayPromo = PROMOS.find(p => p.isoDate === todayStr) || null;

  // Reload user data when profile changes
  useEffect(() => {
    setUserData(getUserData(profileId));
  }, [profileId]);

  const handleSwitchProfile = (id) => {
    if (!id) {
      setProfileId(null); // force profile screen
    } else {
      setProfileId(id);
      setActiveProfileId(id);
    }
  };

  const handleSaveGame = (form) => {
    const next = patchUserData(profileId, {
      gameRecords: { ...userData.gameRecords, [editGame.id]: { ...form, attended: true } }
    });
    setUserData(next);
    setEditGame(null);
  };

  const handleSaveEggroll = (teamName, data) => {
    const next = patchUserData(profileId, {
      eggrollLog: { ...userData.eggrollLog, [teamName]: data }
    });
    setUserData(next);
  };

  const attended = Object.values(userData.gameRecords || {}).filter(r => r?.attended).length;
  const promoCollected = Object.values(userData.gameRecords || {}).filter(r => r?.promoCollected).length;

  // Show profile screen if no profile selected
  if (!profileId) {
    return (
      <>
        <style>{CSS}</style>
        <ProfileScreen onSelect={id => { setProfileId(id); setUserData(getUserData(id)); }} />
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <Header profile={profile} userData={userData} onSwitchProfile={handleSwitchProfile} />

      {todayGame && (
        <GameDayBanner
          todayGame={todayGame}
          todayPromo={todayPromo}
          onLogGame={setEditGame}
        />
      )}

      <div className="layout">
        <nav className="sidebar">
          <div className="nav-sec">Navigation</div>
          {TABS.map(t => (
            <div key={t.id} className={`nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              {t.label}
              {t.id === 'mygames'   && attended > 0         && <span className="nav-badge">{attended}</span>}
              {t.id === 'trophy'    && promoCollected > 0    && <span className="nav-badge">{promoCollected}</span>}
            </div>
          ))}
        </nav>

        <main className="main">
          {tab === 'overview'  && <OverviewView    userData={userData} todayGame={todayGame} todayPromo={todayPromo} onLogGame={setEditGame} />}
          {tab === 'scores'    && <LiveScoresView  />}
          {tab === 'schedule'  && <ScheduleView    userData={userData} onEditGame={setEditGame} />}
          {tab === 'mygames'   && <MyGamesView     userData={userData} onEditGame={setEditGame} />}
          {tab === 'players'   && <PlayersView     />}
          {tab === 'trophy'    && <TrophyView      userData={userData} />}
          {tab === 'eggroll'   && <EggrollView     userData={userData} onSaveEggroll={handleSaveEggroll} />}
          {tab === 'map'       && <MapView         userData={userData} />}
        </main>
      </div>

      <MobileNav tab={tab} setTab={setTab} attended={attended} promoCollected={promoCollected} />

      {editGame && (
        <GameModal
          game={editGame}
          record={userData.gameRecords?.[editGame.id]}
          onSave={handleSaveGame}
          onClose={() => setEditGame(null)}
        />
      )}
    </>
  );
}
