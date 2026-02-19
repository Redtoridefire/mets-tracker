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
  .tbl-wrap { overflow-x: auto; }
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

  @media (max-width: 900px) {
    .sidebar, .hdr-right { display: none; }
    .main { padding: 1rem; }
    .grid-2, .grid-3 { grid-template-columns: 1fr; }
    .map-wrap { flex-direction: column; }
    .map-side { width: 100%; }
  }
`;

export default CSS;
