const CSS = `
  :root {
    --bg:        #00091a;
    --surface:   #000f26;
    --card:      #001733;
    --card2:     #001f40;
    --border:    #002d5c;
    --border2:   #004080;
    --blue:      #002D72;
    --blue2:     #0050b3;
    --blue3:     #1a6fd4;
    --orange:    #FF5910;
    --orange2:   #ff7a3d;
    --orange3:   #ff9966;
    --text:      #cce0ff;
    --text2:     #8ab0d8;
    --muted:     #4a6888;
    --win:       #00e676;
    --loss:      #ff4444;
    --gold:      #ffcc00;
    --gold2:     #cc9900;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
    background-image:
      radial-gradient(ellipse 80% 60% at 10% 40%, rgba(0,45,114,0.18) 0%, transparent 70%),
      radial-gradient(ellipse 60% 40% at 90% 10%, rgba(255,89,16,0.07) 0%, transparent 60%),
      repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,45,114,0.03) 40px, rgba(0,45,114,0.03) 41px),
      repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,45,114,0.03) 40px, rgba(0,45,114,0.03) 41px);
  }

  #root { display: flex; flex-direction: column; min-height: 100vh; }

  /* ── HEADER ─────────────────────────────────────────────────────────────── */
  .hdr {
    height: 64px;
    background: rgba(0,9,26,0.95);
    border-bottom: 2px solid var(--orange);
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
    box-shadow: 0 2px 40px rgba(255,89,16,0.12), 0 0 0 1px rgba(255,89,16,0.08);
  }

  .hdr-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    text-decoration: none;
  }

  .hdr-logo {
    font-family: 'Bebas Neue', cursive;
    font-size: 2rem;
    letter-spacing: 0.12em;
    background: linear-gradient(135deg, #fff 30%, var(--orange) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .hdr-tag {
    font-size: 0.55rem;
    color: var(--muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-family: 'Oswald', sans-serif;
    line-height: 1.2;
  }

  .hdr-right {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .hdr-stat { text-align: center; }
  .hdr-stat .v {
    font-family: 'Bebas Neue', cursive;
    font-size: 1.5rem;
    line-height: 1;
    color: var(--orange);
  }
  .hdr-stat .l {
    font-size: 0.5rem;
    color: var(--muted);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-family: 'Oswald', sans-serif;
  }
  .hdr-div { width: 1px; height: 32px; background: var(--border); }

  .profile-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.9rem;
    background: rgba(0,80,179,0.15);
    border: 1px solid var(--border2);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.75rem;
    font-family: 'Oswald', sans-serif;
    letter-spacing: 0.08em;
    color: var(--text2);
  }
  .profile-btn:hover { background: rgba(0,80,179,0.3); color: var(--text); }
  .profile-avatar { font-size: 1rem; }

  /* ── LAYOUT ─────────────────────────────────────────────────────────────── */
  .layout { display: flex; flex: 1; }

  .sidebar {
    width: 210px;
    flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    position: sticky;
    top: 64px;
    height: calc(100vh - 64px);
    overflow-y: auto;
    padding: 1.5rem 0 2rem;
  }

  .nav-sec {
    padding: 0.75rem 1.25rem 0.35rem;
    font-size: 0.5rem;
    letter-spacing: 0.25em;
    color: var(--muted);
    text-transform: uppercase;
    font-family: 'Oswald', sans-serif;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 1.25rem;
    cursor: pointer;
    font-family: 'Oswald', sans-serif;
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    border-left: 3px solid transparent;
    transition: all 0.15s;
    user-select: none;
  }
  .nav-item:hover { color: var(--text); background: rgba(0,80,179,0.08); }
  .nav-item.active { color: var(--orange); border-left-color: var(--orange); background: rgba(255,89,16,0.07); }
  .nav-icon { font-size: 1rem; width: 18px; text-align: center; }

  .nav-badge {
    margin-left: auto;
    background: rgba(255,89,16,0.2);
    color: var(--orange);
    border-radius: 10px;
    font-size: 0.55rem;
    padding: 0.1rem 0.4rem;
    font-family: 'DM Mono', monospace;
  }

  /* ── MAIN ───────────────────────────────────────────────────────────────── */
  .main { flex: 1; padding: 2rem; min-width: 0; }

  .page-hdr { margin-bottom: 2rem; }
  .page-title {
    font-family: 'Bebas Neue', cursive;
    font-size: 2.4rem;
    letter-spacing: 0.1em;
    color: white;
    line-height: 1;
    margin-bottom: 0.2rem;
  }
  .page-sub {
    font-family: 'Oswald', sans-serif;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* ── CARDS ──────────────────────────────────────────────────────────────── */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,80,179,0.4), transparent);
  }

  .card-title {
    font-family: 'Oswald', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--orange);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  /* ── GRID HELPERS ───────────────────────────────────────────────────────── */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
  .grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }

  /* ── STAT CARDS (overview top row) ─────────────────────────────────────── */
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
  .stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem 1rem;
    text-align: center;
    transition: border-color 0.2s;
  }
  .stat-card:hover { border-color: var(--border2); }
  .stat-card .big {
    font-family: 'Bebas Neue', cursive;
    font-size: 2.8rem;
    line-height: 1;
    color: var(--orange);
  }
  .stat-card .lbl {
    font-family: 'Oswald', sans-serif;
    font-size: 0.55rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 0.25rem;
  }

  /* ── TABLE ──────────────────────────────────────────────────────────────── */
  .tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
  thead tr { border-bottom: 2px solid var(--orange); }
  th {
    font-family: 'Oswald', sans-serif;
    font-weight: 500;
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    padding: 0.65rem 0.9rem;
    text-align: left;
    white-space: nowrap;
  }
  td { padding: 0.65rem 0.9rem; border-bottom: 1px solid rgba(0,45,92,0.4); vertical-align: middle; }
  tr:hover td { background: rgba(0,80,179,0.05); }
  tr.attended td { background: rgba(0,80,179,0.09); }
  tr.attended td:first-child { border-left: 3px solid var(--orange); padding-left: calc(0.9rem - 3px); }

  /* ── BADGES ─────────────────────────────────────────────────────────────── */
  .badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 20px;
    font-family: 'Oswald', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .badge-special { background: rgba(255,89,16,0.15); color: var(--orange);  border: 1px solid rgba(255,89,16,0.4); }
  .badge-limit   { background: rgba(0,80,179,0.15);  color: #7eb3ff;        border: 1px solid rgba(0,80,179,0.4); }
  .badge-win     { background: rgba(0,230,118,0.12); color: var(--win);     border: 1px solid rgba(0,230,118,0.3); }
  .badge-loss    { background: rgba(255,68,68,0.12); color: var(--loss);    border: 1px solid rgba(255,68,68,0.3); }
  .badge-gold    { background: rgba(255,204,0,0.12); color: var(--gold);    border: 1px solid rgba(255,204,0,0.3); }
  .badge-live    { background: rgba(255,68,68,0.2);  color: #ff6b6b;        border: 1px solid rgba(255,68,68,0.4); animation: pulse-red 1.5s infinite; }
  .tag-86 {
    display: inline-block;
    background: linear-gradient(135deg, #6b3c00, #b86800);
    color: #ffe8b0;
    border-radius: 3px;
    font-size: 0.52rem;
    padding: 0.12rem 0.35rem;
    font-family: 'Oswald', sans-serif;
    letter-spacing: 0.1em;
    margin-left: 0.35rem;
    vertical-align: middle;
  }

  @keyframes pulse-red {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ── BUTTONS ────────────────────────────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.45rem 1rem;
    border-radius: 5px;
    font-family: 'Oswald', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .btn-primary   { background: var(--orange);                color: white; }
  .btn-primary:hover { background: var(--orange2); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,89,16,0.3); }
  .btn-outline   { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-outline:hover { color: var(--text); border-color: var(--blue2); }
  .btn-sm        { padding: 0.3rem 0.7rem; font-size: 0.62rem; }
  .btn-ghost     { background: transparent; color: var(--muted); }
  .btn-ghost:hover { color: var(--text); }
  .btn-danger    { background: rgba(255,68,68,0.15); color: var(--loss); border: 1px solid rgba(255,68,68,0.3); }
  .btn-danger:hover { background: rgba(255,68,68,0.25); }

  /* ── MODAL ──────────────────────────────────────────────────────────────── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,5,15,0.88);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(6px);
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-top: 3px solid var(--orange);
    border-radius: 10px;
    padding: 2rem;
    width: 560px;
    max-width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .modal-title { font-family: 'Bebas Neue', cursive; font-size: 1.9rem; letter-spacing: 0.08em; color: white; line-height: 1; }
  .modal-sub   { font-size: 0.65rem; color: var(--muted); letter-spacing: 0.1em; margin: 0.25rem 0 1.5rem; font-family: 'Oswald', sans-serif; }
  .modal-footer { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }

  /* ── FORMS ──────────────────────────────────────────────────────────────── */
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }

  label {
    font-family: 'Oswald', sans-serif;
    font-size: 0.58rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }

  input, select, textarea {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text);
    padding: 0.6rem 0.8rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--orange);
    box-shadow: 0 0 0 3px rgba(255,89,16,0.1);
  }
  select option { background: var(--card); }
  textarea { resize: vertical; min-height: 80px; }

  .form-section-title {
    font-family: 'Oswald', sans-serif;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    color: var(--orange);
    text-transform: uppercase;
    margin: 1.25rem 0 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255,89,16,0.2);
  }

  /* ── WEATHER ─────────────────────────────────────────────────────────────── */
  .weather-card {
    background: linear-gradient(135deg, #001428 0%, #00091a 60%, rgba(0,45,114,0.3) 100%);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  .weather-icon { font-size: 2.8rem; line-height: 1; }
  .weather-temp { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: white; line-height: 1; }
  .weather-desc { font-size: 0.7rem; color: var(--text2); margin-top: 0.15rem; font-family: 'Oswald', sans-serif; letter-spacing: 0.08em; }
  .weather-meta { display: flex; gap: 1rem; margin-top: 0.5rem; }
  .weather-meta span { font-size: 0.6rem; color: var(--muted); }
  .weather-forecast { display: flex; gap: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); flex-wrap: wrap; }
  .forecast-day { text-align: center; min-width: 60px; }
  .forecast-day .date { font-size: 0.55rem; color: var(--muted); font-family: 'Oswald', sans-serif; letter-spacing: 0.1em; margin-bottom: 0.25rem; }
  .forecast-day .icon { font-size: 1.2rem; }
  .forecast-day .temp { font-size: 0.65rem; color: var(--text2); margin-top: 0.2rem; }
  .forecast-day .rain { font-size: 0.55rem; color: #7eb3ff; }

  /* ── COUNTDOWN ──────────────────────────────────────────────────────────── */
  .countdown { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .cd-unit { text-align: center; }
  .cd-val { font-family: 'Bebas Neue', cursive; font-size: 2.8rem; color: var(--orange); line-height: 1; display: block; }
  .cd-lbl { font-family: 'Oswald', sans-serif; font-size: 0.5rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
  .cd-sep { font-family: 'Bebas Neue', cursive; font-size: 2rem; color: var(--border); margin-top: -6px; }

  /* ── PLAYER CARDS ────────────────────────────────────────────────────────── */
  .player-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.2s;
    cursor: pointer;
  }
  .player-card:hover { border-color: var(--blue2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .player-number { font-family: 'Bebas Neue', cursive; font-size: 1.8rem; color: var(--orange); line-height: 1; }
  .player-name { font-family: 'Oswald', sans-serif; font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase; color: white; line-height: 1.2; margin-top: 0.15rem; }
  .player-pos { font-size: 0.6rem; color: var(--muted); letter-spacing: 0.1em; margin-top: 0.2rem; font-family: 'DM Mono', monospace; }
  .player-stats { margin-top: 0.75rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
  .pstat { text-align: center; background: var(--surface); border-radius: 4px; padding: 0.4rem 0.3rem; }
  .pstat .v { font-family: 'Bebas Neue', cursive; font-size: 1.1rem; color: var(--text); line-height: 1; }
  .pstat .l { font-size: 0.45rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; font-family: 'Oswald', sans-serif; margin-top: 0.1rem; }
  .loading-shimmer { background: linear-gradient(90deg, var(--surface) 25%, var(--card2) 50%, var(--surface) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; height: 1rem; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── LIVE SCORES ─────────────────────────────────────────────────────────── */
  .game-result-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem 1.25rem;
    transition: all 0.2s;
  }
  .game-result-card:hover { border-color: var(--border2); }
  .game-result-card.win  { border-left: 4px solid var(--win); }
  .game-result-card.loss { border-left: 4px solid var(--loss); }
  .game-result-card.live { border-left: 4px solid #ff4444; box-shadow: 0 0 20px rgba(255,68,68,0.1); }
  .game-result-card.upcoming { border-left: 4px solid var(--border2); opacity: 0.8; }

  .game-card-toggle {
    background: transparent;
    border: 0;
    color: inherit;
    width: 100%;
    cursor: pointer;
    padding: 0;
  }

  .game-card-chevron {
    font-size: 0.7rem;
    color: var(--muted);
    margin-left: auto;
  }

  .game-result-card.expanded {
    border-color: var(--border2);
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.28);
  }

  .game-drilldown {
    margin-top: 0.8rem;
    border-top: 1px solid rgba(0,45,92,0.45);
    padding-top: 0.8rem;
  }

  .game-drilldown-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.75rem;
  }

  .game-drilldown-panel {
    background: rgba(0, 15, 38, 0.75);
    border: 1px solid rgba(0, 80, 160, 0.35);
    border-radius: 6px;
    padding: 0.7rem;
  }

  .game-drilldown-status {
    font-size: 0.62rem;
    color: var(--muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: 'Oswald', sans-serif;
  }

  .inning-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
    gap: 0.45rem;
  }

  .inning-chip {
    background: rgba(0,45,92,0.32);
    border: 1px solid rgba(0,80,179,0.35);
    border-radius: 5px;
    padding: 0.4rem;
  }

  .inning-chip-label {
    font-family: 'Oswald', sans-serif;
    letter-spacing: 0.08em;
    font-size: 0.58rem;
    color: var(--muted);
  }

  .inning-chip-score {
    font-size: 0.63rem;
    color: var(--text2);
    margin-top: 0.15rem;
  }

  .performer-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .performer-item {
    display: flex;
    justify-content: space-between;
    gap: 0.6rem;
    font-size: 0.6rem;
    border-bottom: 1px solid rgba(0,45,92,0.3);
    padding-bottom: 0.2rem;
  }

  .event-feed {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    max-height: 280px;
    overflow: auto;
    padding-right: 0.2rem;
  }

  .event-item {
    border-left: 2px solid rgba(0,80,179,0.5);
    padding-left: 0.55rem;
  }

  .event-meta {
    font-family: 'Oswald', sans-serif;
    font-size: 0.54rem;
    letter-spacing: 0.1em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .event-text {
    font-size: 0.63rem;
    color: var(--text);
    margin-top: 0.15rem;
    line-height: 1.3;
  }

  .event-runners {
    font-size: 0.56rem;
    color: var(--orange2);
    margin-top: 0.2rem;
  }



  /* ── CORK BOARD ───────────────────────────────────────────────────────────── */
  .cork-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.9rem;
  }

  .cork-card {
    background: linear-gradient(180deg, rgba(17, 42, 66, 0.85), rgba(5, 22, 39, 0.9));
    border: 1px solid rgba(0, 80, 160, 0.35);
    border-radius: 8px;
    overflow: hidden;
  }

  .cork-photo {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    background: rgba(0, 15, 38, 0.8);
  }

  .cork-meta {
    padding: 0.6rem 0.65rem 0.7rem;
  }

  .cork-game {
    font-family: 'Oswald', sans-serif;
    font-size: 0.56rem;
    letter-spacing: 0.14em;
    color: var(--orange2);
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  .cork-caption {
    font-size: 0.67rem;
    color: var(--text);
    line-height: 1.35;
  }

  .cork-date {
    margin-top: 0.35rem;
    font-size: 0.52rem;
    color: var(--muted);
  }


  .cork-lightbox {
    width: min(96vw, 1200px);
    max-height: 92vh;
    background: rgba(0, 9, 26, 0.98);
    border: 1px solid var(--border2);
    border-radius: 10px;
    padding: 0.75rem;
    overflow: auto;
    position: relative;
  }

  .cork-lightbox-close {
    position: sticky;
    top: 0;
    z-index: 1;
    float: right;
    margin-bottom: 0.5rem;
  }

  .cork-lightbox-img {
    width: 100%;
    height: auto;
    max-height: 78vh;
    object-fit: contain;
    border-radius: 8px;
    background: #000;
  }

  .cork-lightbox-meta {
    clear: both;
    margin-top: 0.55rem;
    padding: 0.3rem 0.2rem;
  }
  /* ── TROPHY SHELF ─────────────────────────────────────────────────────────── */
  .trophy-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem 1rem;
    text-align: center;
    transition: all 0.25s;
    position: relative;
  }
  .trophy-item.collected { border-color: var(--orange); background: rgba(255,89,16,0.06); box-shadow: 0 0 24px rgba(255,89,16,0.1); }
  .trophy-item.locked { opacity: 0.35; filter: grayscale(0.7); }
  .trophy-emoji { font-size: 2.2rem; display: block; margin-bottom: 0.5rem; line-height: 1; }
  .trophy-name { font-family: 'Oswald', sans-serif; font-size: 0.65rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text); line-height: 1.4; }
  .trophy-date { font-size: 0.55rem; color: var(--muted); margin-top: 0.2rem; }
  .trophy-check { position: absolute; top: 0.5rem; right: 0.5rem; font-size: 0.75rem; }

  /* ── EGGROLL ──────────────────────────────────────────────────────────────── */
  .eggroll-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; transition: all 0.2s; }
  .eggroll-card.logged { border-color: #9a6010; background: rgba(154,96,16,0.08); }
  .eggroll-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
  .stars { color: var(--gold); font-size: 1.1rem; letter-spacing: 0.05em; cursor: pointer; user-select: none; }

  /* ── MAP ─────────────────────────────────────────────────────────────────── */
  .map-wrap { display: flex; gap: 1.5rem; align-items: flex-start; }
  .map-svg  { flex: 1; max-width: 640px; }
  .map-side { width: 200px; flex-shrink: 0; display: flex; flex-direction: column; gap: 1rem; }

  /* ── COST TRACKER ─────────────────────────────────────────────────────────── */
  .cost-breakdown { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem; margin-top: 0.75rem; }
  .cost-item { background: var(--surface); border-radius: 6px; padding: 0.6rem; text-align: center; }
  .cost-item .amount { font-family: 'Bebas Neue', cursive; font-size: 1.2rem; color: var(--gold); line-height: 1; }
  .cost-item .label  { font-size: 0.55rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; font-family: 'Oswald', sans-serif; }

  /* ── STANDINGS ──────────────────────────────────────────────────────────── */
  .standings-row { display: flex; align-items: center; gap: 1rem; padding: 0.6rem 0; border-bottom: 1px solid rgba(0,45,92,0.3); }
  .standings-row.mets-row { background: rgba(255,89,16,0.06); border-radius: 6px; padding: 0.6rem 0.75rem; border: 1px solid rgba(255,89,16,0.2); margin: 0.25rem -0.75rem; }

  /* ── PROFILE SCREEN ──────────────────────────────────────────────────────── */
  .profile-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 60% at 20% 50%, rgba(0,45,114,0.25) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 80% 20%, rgba(255,89,16,0.1) 0%, transparent 50%);
  }
  .profile-box {
    background: var(--card);
    border: 1px solid var(--border);
    border-top: 4px solid var(--orange);
    border-radius: 12px;
    padding: 3rem;
    width: 440px;
    max-width: 95vw;
    text-align: center;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
  }

  /* ── SCROLLBAR ──────────────────────────────────────────────────────────── */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--blue2); }

  /* ── GAME DAY BANNER ─────────────────────────────────────────────────────── */
  .gameday-banner {
    background: linear-gradient(90deg, rgba(255,89,16,0.14), rgba(255,89,16,0.07), rgba(255,89,16,0.14));
    border-bottom: 1px solid rgba(255,89,16,0.35);
    padding: 0.5rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    position: sticky;
    top: 64px;
    z-index: 90;
    backdrop-filter: blur(10px);
    animation: gameday-glow 3s ease-in-out infinite;
    flex-wrap: wrap;
  }

  @keyframes gameday-glow {
    0%, 100% { background: linear-gradient(90deg, rgba(255,89,16,0.14), rgba(255,89,16,0.07), rgba(255,89,16,0.14)); }
    50%       { background: linear-gradient(90deg, rgba(255,89,16,0.22), rgba(255,89,16,0.13), rgba(255,89,16,0.22)); }
  }

  .gameday-dot {
    width: 9px; height: 9px;
    background: var(--orange);
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 6px rgba(255,89,16,0.7);
    animation: pulse-red 1.2s ease-in-out infinite;
  }

  .gameday-card {
    background: linear-gradient(135deg, rgba(255,89,16,0.1), rgba(255,89,16,0.03));
    border: 1px solid rgba(255,89,16,0.35);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .gameday-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--orange), transparent);
    animation: gameday-glow 2s ease-in-out infinite;
  }

  /* ── HEADER STATS (wraps the stat chips, hidden on mobile) ───────────────── */
  .hdr-stats {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  /* ── MOBILE NAV (bottom tab bar, hidden on desktop) ─────────────────────── */
  .mobile-nav { display: none; }

  /* ── PLAYER FLIP CARDS ──────────────────────────────────────────────────── */
  .player-flip-wrap {
    perspective: 900px;
    cursor: pointer;
  }

  .player-flip-inner {
    position: relative;
    min-height: 200px;
    transform-style: preserve-3d;
    transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .player-flip-inner.flipped { transform: rotateY(180deg); }

  .player-flip-front,
  .player-flip-back {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 8px;
    padding: 1rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .player-flip-front {
    background: var(--card);
    border: 1px solid var(--border);
    transition: border-color 0.2s;
  }
  .player-flip-wrap:hover .player-flip-front { border-color: var(--blue2); }
  .player-flip-back {
    background: var(--card2);
    border: 1px solid var(--border2);
    transform: rotateY(180deg);
  }
  .player-flip-hint {
    margin-top: auto;
    padding-top: 0.5rem;
    font-size: 0.44rem;
    color: var(--muted);
    font-family: 'Oswald', sans-serif;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-align: right;
    opacity: 0.7;
  }

  /* ── PROMO EXPAND ROW (ScheduleView inline drill-down) ───────────────────── */
  .promo-expand-row td {
    padding: 0 !important;
    background: rgba(0,19,51,0.7);
    border-left: 3px solid var(--orange);
  }
  .promo-expand-panel {
    padding: 1rem 1.25rem 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    animation: slideDown 0.18s ease;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .expand-tile {
    background: var(--surface);
    border-radius: 6px;
    padding: 0.65rem 0.85rem;
  }
  .expand-tile-label {
    font-family: 'Oswald', sans-serif;
    font-size: 0.5rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.3rem;
  }

  /* ── RESPONSIVE ─────────────────────────────────────────────────────────── */
  @media (max-width: 768px) {
    /* Header */
    .hdr {
      height: 56px;
      padding: 0 1rem;
    }
    .hdr-stats { display: none; }
    .hdr-tag   { display: none; }

    /* Sidebar → hidden; bottom nav takes over */
    .sidebar { display: none; }

    /* Layout: make room for fixed bottom nav + iPhone home bar */
    .layout { /* flex already set */ }
    .main   { padding: 0.9rem 0.875rem calc(80px + env(safe-area-inset-bottom, 0px)); }

    /* Typography */
    .page-title { font-size: 1.8rem; }

    /* Grids → single column */
    .grid-2  { grid-template-columns: 1fr; }
    .grid-3  { grid-template-columns: 1fr; }
    .grid-auto { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }

    /* Trophy grid (used in TrophyView): allow 2-col on mobile */
    .stats-row { grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); }

    /* Map */
    .map-wrap { flex-direction: column; }
    .map-side { width: 100%; }

    /* Modal → bottom sheet */
    .overlay { align-items: flex-end; }
    .modal {
      width: 100%;
      max-width: 100%;
      max-height: 92vh;
      border-radius: 14px 14px 0 0;
      padding: 1.5rem 1.25rem 2rem;
      border-left: none;
      border-right: none;
      border-bottom: none;
    }

    /* Forms → single column on mobile */
    .form-row   { grid-template-columns: 1fr; }
    .form-row-3 { grid-template-columns: 1fr; }

    /* Promo expand panel → single column on mobile */
    .promo-expand-panel { grid-template-columns: 1fr; gap: 0.75rem; }

    /* Touch targets */
    .btn     { min-height: 44px; }
    .btn-sm  { min-height: 36px; }

    /* Weather */
    .weather-card { flex-wrap: wrap; gap: 0.75rem; }

    /* Game Day Banner */
    .gameday-banner {
      top: 56px;
      padding: 0.4rem 0.875rem;
      gap: 0.5rem;
    }

    /* Mobile bottom nav — height expands to absorb iPhone home indicator */
    .mobile-nav {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: calc(64px + env(safe-area-inset-bottom, 0px));
      padding-bottom: env(safe-area-inset-bottom, 0px);
      background: rgba(0,9,26,0.97);
      border-top: 2px solid var(--orange);
      z-index: 100;
      backdrop-filter: blur(14px);
      box-shadow: 0 -4px 28px rgba(0,0,0,0.55);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .mobile-nav::-webkit-scrollbar { display: none; }

    .mobile-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-width: 46px;
      gap: 0.1rem;
      padding: 0.25rem 0.1rem;
      cursor: pointer;
      border-top: 2px solid transparent;
      transition: all 0.15s;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      position: relative;
    }
    .mobile-nav-item.active {
      border-top-color: var(--orange);
      background: rgba(255,89,16,0.1);
    }
    .mob-icon {
      font-size: 1.15rem;
      line-height: 1;
    }
    .mob-label {
      font-family: 'Oswald', sans-serif;
      font-size: 0.42rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .mobile-nav-item.active .mob-label { color: var(--orange); }

    .mob-badge {
      position: absolute;
      top: 3px; right: 6px;
      background: var(--orange);
      color: white;
      border-radius: 50%;
      width: 13px; height: 13px;
      font-size: 0.38rem;
      display: flex; align-items: center; justify-content: center;
      font-family: 'DM Mono', monospace;
      line-height: 1;
    }

    /* Toast moves to bottom on mobile (above nav bar) */
    .toast-container {
      top: auto;
      bottom: calc(80px + env(safe-area-inset-bottom, 0px) + 0.75rem);
      right: 1rem;
      left: 1rem;
      align-items: flex-end;
    }
  }

  /* ── TOAST NOTIFICATIONS ─────────────────────────────────────────────────── */
  .toast-container {
    position: fixed;
    top: 80px;
    right: 1.5rem;
    z-index: 9000;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: none;
  }
  .toast {
    background: var(--card2);
    border: 1px solid var(--border2);
    border-left: 3px solid var(--border2);
    border-radius: 8px;
    padding: 0.7rem 1.2rem;
    font-family: 'Oswald', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    color: var(--text);
    box-shadow: 0 8px 32px rgba(0,0,0,0.45);
    animation: toastIn 0.25s ease, toastOut 0.25s ease 2.75s forwards;
    white-space: nowrap;
  }
  .toast-win  { border-left-color: var(--win);    color: var(--win);    background: rgba(0,230,118,0.07); }
  .toast-loss { border-left-color: var(--loss);   color: var(--loss);   background: rgba(255,68,68,0.07); }
  .toast-save { border-left-color: var(--orange); }
  @keyframes toastIn  { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes toastOut { from { opacity: 1; transform: translateX(0); }   to { opacity: 0; transform: translateX(24px); } }

  /* ── VIEW ENTER ANIMATION ────────────────────────────────────────────────── */
  @keyframes viewEnter {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .view-enter { animation: viewEnter 0.2s ease; }

  /* ── SIDEBAR COLLAPSE ────────────────────────────────────────────────────── */
  .sidebar { transition: width 0.2s ease; }
  .sidebar.collapsed { width: 52px; padding-left: 0; padding-right: 0; overflow: hidden; }
  .sidebar.collapsed .nav-sec { display: none; }
  .sidebar.collapsed .nav-item { padding: 0.7rem; justify-content: center; }
  .sidebar.collapsed .nav-item > *:not(.nav-icon),
  .sidebar.collapsed .nav-badge { display: none; }
  .sidebar-collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    margin: 0 auto 0.5rem;
    border-radius: 50%;
    background: transparent;
    border: 1px solid var(--border);
    cursor: pointer;
    font-size: 0.75rem;
    color: var(--muted);
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .sidebar-collapse-btn:hover { color: var(--orange); border-color: rgba(255,89,16,0.5); }

  /* ── PROMO CHIP STRIP ────────────────────────────────────────────────────── */
  .promo-strip-wrap { overflow-x: auto; margin-bottom: 1.5rem; scrollbar-width: none; }
  .promo-strip-wrap::-webkit-scrollbar { display: none; }
  .promo-strip { display: flex; gap: 0.75rem; padding-bottom: 0.25rem; }
  .promo-chip {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem 0.9rem;
    text-align: center;
    min-width: 82px;
    flex-shrink: 0;
    transition: border-color 0.18s, transform 0.15s;
  }
  .promo-chip:hover { border-color: rgba(255,89,16,0.4); transform: translateY(-2px); }
  .promo-chip-icon { font-size: 1.5rem; line-height: 1; }
  .promo-chip-days { font-family: 'Bebas Neue', cursive; font-size: 1.05rem; color: var(--orange); line-height: 1; margin: 0.2rem 0 0.1rem; letter-spacing: 0.04em; }
  .promo-chip-opp  { font-family: 'Oswald', sans-serif; font-size: 0.52rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
  .promo-chip-date { font-size: 0.46rem; color: var(--border2); margin-top: 0.1rem; font-family: 'DM Mono', monospace; }

  /* ── PLAN MODE TOGGLE ────────────────────────────────────────────────────── */
  .plan-toggle { display: flex; gap: 0.4rem; margin-bottom: 1.25rem; background: var(--surface); border-radius: 7px; padding: 0.25rem; }
  .plan-toggle-btn {
    flex: 1;
    padding: 0.5rem;
    border-radius: 5px;
    border: 1px solid transparent;
    font-family: 'Oswald', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent;
    color: var(--muted);
  }
  .plan-toggle-btn.active { background: var(--card2); color: var(--orange); border-color: rgba(255,89,16,0.3); }

  /* ── BADGE PLANNED ───────────────────────────────────────────────────────── */
  .badge-planned { background: rgba(255,89,16,0.08); color: var(--orange2); border: 1px solid rgba(255,89,16,0.25); }

  /* ── SPRING TRAINING CARD ────────────────────────────────────────────────── */
  .st-card {
    background: linear-gradient(135deg, rgba(0,45,114,0.18) 0%, rgba(0,80,179,0.08) 60%, rgba(255,89,16,0.04) 100%);
    border: 1px solid var(--border);
    border-left: 3px solid #00a550;
    border-radius: 8px;
    padding: 1.25rem 1.5rem;
  }
  .st-header   { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem; gap: 1rem; }
  .st-title    { font-family: 'Bebas Neue', cursive; font-size: 1.4rem; letter-spacing: 0.08em; color: white; line-height: 1; }
  .st-sub      { font-family: 'Oswald', sans-serif; font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-top: 0.15rem; }
  .st-record   { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; line-height: 1; white-space: nowrap; }
  .st-feature  { background: rgba(0,0,0,0.25); border-radius: 6px; padding: 0.65rem 0.9rem; margin-top: 0.5rem; }
  .st-feat-label   { font-family: 'Oswald', sans-serif; font-size: 0.52rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--orange); margin-bottom: 0.25rem; }
  .st-feat-matchup { font-family: 'Oswald', sans-serif; font-size: 0.88rem; color: var(--text); margin-bottom: 0.2rem; }
  .st-feat-meta    { font-size: 0.6rem; color: var(--muted); font-family: 'DM Mono', monospace; }

  /* ── SCHEDULE SUB-TABS ───────────────────────────────────────────────────── */
  .sched-sub-tabs {
    display: flex;
    gap: 0.4rem;
    margin-bottom: 1.25rem;
    background: var(--surface);
    border-radius: 8px;
    padding: 0.3rem;
    flex-wrap: wrap;
  }
  .sst-btn {
    flex: 1;
    min-width: 110px;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid transparent;
    font-family: 'Oswald', sans-serif;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent;
    color: var(--muted);
    text-align: center;
  }
  .sst-btn.active  { background: var(--card2); color: var(--orange); border-color: rgba(255,89,16,0.3); }
  .sst-btn:hover:not(.active) { color: var(--text); }
  .sst-now { background: var(--orange); color: white; border-radius: 3px; padding: 0.05rem 0.3rem; font-size: 0.45rem; margin-left: 0.35rem; vertical-align: middle; }

  /* ── FULL SCHEDULE ROWS ──────────────────────────────────────────────────── */
  .full-sched-row {
    display: grid;
    grid-template-columns: 160px 1fr 120px 60px 80px;
    gap: 0.5rem;
    align-items: center;
    padding: 0.45rem 0.6rem;
    border-radius: 5px;
    transition: background 0.1s;
  }
  .full-sched-row:hover { background: rgba(0,80,179,0.07); }
  .full-sched-today { background: rgba(255,89,16,0.06) !important; border-left: 2px solid var(--orange); }
  .full-sched-past  { opacity: 0.55; }
  .fsr-date    { font-size: 0.68rem; color: var(--muted); font-family: 'DM Mono', monospace; white-space: nowrap; }
  .fsr-matchup { font-family: 'Oswald', sans-serif; font-size: 0.82rem; }
  .fsr-venue   { font-size: 0.58rem; color: var(--muted); font-family: 'DM Mono'; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fsr-score   { text-align: center; }
  .fsr-status  { text-align: right; }

  /* ── AAA TRACKER ─────────────────────────────────────────────────────────── */
  .aaa-player-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem;
    background: rgba(255,68,68,0.04);
    border: 1px solid rgba(255,68,68,0.15);
    border-radius: 6px;
  }
  .aaa-arrow     { font-size: 1.1rem; width: 20px; text-align: center; flex-shrink: 0; }
  .aaa-down      { color: var(--loss); }
  .aaa-up        { color: var(--win); }
  .aaa-info      { flex: 1; min-width: 0; }
  .aaa-name      { font-family: 'Oswald', sans-serif; font-size: 0.85rem; color: var(--text); letter-spacing: 0.05em; }
  .aaa-meta      { font-size: 0.6rem; color: var(--muted); margin-top: 0.1rem; }
  .aaa-days      { text-align: center; flex-shrink: 0; }
  .aaa-days-num  { display: block; font-family: 'Bebas Neue', cursive; font-size: 1.5rem; color: var(--loss); line-height: 1; }
  .aaa-days-lbl  { font-family: 'Oswald', sans-serif; font-size: 0.45rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }

  /* Transaction log rows */
  .txn-row       { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid rgba(0,45,92,0.25); }
  .txn-row:last-child { border-bottom: none; }
  .txn-up   .txn-icon { color: var(--win); }
  .txn-down .txn-icon { color: var(--loss); }
  .txn-icon  { font-size: 1rem; width: 18px; text-align: center; flex-shrink: 0; }
  .txn-body  { flex: 1; min-width: 0; }
  .txn-name  { font-family: 'Oswald', sans-serif; font-size: 0.8rem; color: var(--text); letter-spacing: 0.04em; }
  .txn-label { font-size: 0.58rem; color: var(--muted); margin-top: 0.05rem; }
  .txn-right { text-align: right; flex-shrink: 0; }
  .txn-date  { font-size: 0.62rem; color: var(--text2); font-family: 'DM Mono', monospace; }
  .txn-ago   { font-size: 0.52rem; color: var(--muted); margin-top: 0.05rem; }

  /* ── METS FEED ───────────────────────────────────────────────────────────── */
  .feed-layout  { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start; }
  .feed-main    { display: flex; flex-direction: column; gap: 0.75rem; }
  .feed-sidebar { /* sticky is set inline */ }

  .feed-article {
    display: flex;
    gap: 0.85rem;
    align-items: flex-start;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.18s, transform 0.15s;
  }
  .feed-article:hover { border-color: var(--border2); transform: translateY(-1px); }
  .feed-thumb {
    width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: 5px;
    flex-shrink: 0;
    background: var(--surface);
  }
  .feed-article-body    { flex: 1; min-width: 0; }
  .feed-article-title   { font-family: 'Oswald', sans-serif; font-size: 0.85rem; letter-spacing: 0.04em; color: var(--text); line-height: 1.4; margin-bottom: 0.3rem; }
  .feed-article-desc    { font-size: 0.65rem; color: var(--muted); line-height: 1.5; margin-bottom: 0.3rem; }
  .feed-article-meta    { font-size: 0.55rem; color: var(--orange); font-family: 'Oswald', sans-serif; letter-spacing: 0.1em; text-transform: uppercase; }

  .feed-error {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
  }

  /* Feed sidebar transaction rows */
  .feed-txn-row  { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.5rem 0; border-bottom: 1px solid rgba(0,45,92,0.2); }
  .feed-txn-row:last-child { border-bottom: none; }
  .feed-txn-up   .feed-txn-icon { color: var(--win); }
  .feed-txn-down .feed-txn-icon { color: var(--loss); }
  .feed-txn-icon { font-size: 0.9rem; width: 16px; text-align: center; flex-shrink: 0; padding-top: 0.1rem; }
  .feed-txn-body { flex: 1; min-width: 0; }
  .feed-txn-name { font-family: 'Oswald', sans-serif; font-size: 0.75rem; color: var(--text); letter-spacing: 0.04em; }
  .feed-txn-type { font-size: 0.55rem; color: var(--muted); margin-top: 0.05rem; }
  .feed-txn-date { font-size: 0.52rem; color: var(--muted); margin-top: 0.08rem; font-family: 'DM Mono', monospace; }

  /* ── FACT OF THE DAY ────────────────────────────────────────────────────── */
  .fact-card {
    border: 1px solid;
    border-radius: 10px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
  }
  .fact-eyebrow {
    font-family: 'Oswald', sans-serif;
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  .fact-text {
    font-family: 'Georgia', serif;
    font-size: 0.92rem;
    color: var(--text);
    line-height: 1.65;
    font-style: italic;
  }

  /* ── TEAM STATS ─────────────────────────────────────────────────────────── */
  .team-stats-grid  { display: flex; flex-direction: column; gap: 1rem; }
  .team-stats-group { }
  .team-stats-label {
    font-family: 'Oswald', sans-serif;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.55rem;
  }
  .team-stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .ts-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    text-align: center;
    min-width: 46px;
  }
  .ts-val {
    font-family: 'Bebas Neue', cursive;
    font-size: 1.15rem;
    color: var(--text);
    line-height: 1;
    letter-spacing: 0.04em;
  }
  .ts-lbl {
    font-family: 'Oswald', sans-serif;
    font-size: 0.48rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 0.2rem;
  }

  /* ── FSR BROADCAST CHIP ─────────────────────────────────────────────────── */
  .fsr-broadcast {
    font-family: 'Oswald', sans-serif;
    font-size: 0.55rem;
    letter-spacing: 0.06em;
    background: rgba(0,45,92,0.5);
    border: 1px solid rgba(0,80,160,0.45);
    border-radius: 3px;
    padding: 0.1rem 0.4rem;
    color: var(--text2);
    margin-right: 0.25rem;
    white-space: nowrap;
  }

  /* ── PLAYER BIO SECTION ─────────────────────────────────────────────────── */
  .bio-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem 0.75rem;
    margin-top: 0.5rem;
  }
  .bio-item  { }
  .bio-lbl { font-size: 0.48rem; color: var(--muted); font-family: 'Oswald', sans-serif; letter-spacing: 0.1em; text-transform: uppercase; }
  .bio-val { font-size: 0.68rem; color: var(--text); font-family: 'DM Mono', monospace; margin-top: 0.1rem; }

  /* Responsive for feed + schedule + AAA */
  @media (max-width: 768px) {
    .feed-layout { grid-template-columns: 1fr; }
    .feed-sidebar > .card { position: static !important; }
    .full-sched-row { grid-template-columns: 1fr 1fr; gap: 0.3rem; }
    .fsr-venue, .fsr-score { display: none; }
    .sched-sub-tabs { flex-direction: column; }
    .sst-btn { min-width: unset; }
    .st-record { font-size: 1.2rem; }
    .team-stats-row { gap: 0.35rem; }
    .ts-item { min-width: 40px; padding: 0.3rem 0.45rem; }
    .ts-val { font-size: 1rem; }
    .fact-text { font-size: 0.82rem; }
  }
`;


export default CSS;
