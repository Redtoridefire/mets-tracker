import { useState, useMemo } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PROMOS = [
  { id: 1,  isoDate:"2026-03-26", display:"Thu, Mar 26", opponent:"Pittsburgh Pirates",    oppShort:"PIT", emoji:"⚓", time:"1:15 PM ET",  promo:"2 Promotions (Details TBA)",                   specialTicket:false, limit:null,  icon:"🎁" },
  { id: 2,  isoDate:"2026-03-28", display:"Sat, Mar 28", opponent:"Pittsburgh Pirates",    oppShort:"PIT", emoji:"⚓", time:"4:10 PM ET",  promo:"1986 World Series Championship Replica Ring",  specialTicket:false, limit:15000, icon:"💍" },
  { id: 3,  isoDate:"2026-03-29", display:"Sun, Mar 29", opponent:"Pittsburgh Pirates",    oppShort:"PIT", emoji:"⚓", time:"1:40 PM ET",  promo:"5-Borough Race Kids Puzzle",                   specialTicket:false, limit:5000,  icon:"🧩" },
  { id: 4,  isoDate:"2026-04-09", display:"Thu, Apr 9",  opponent:"Arizona D-backs",       oppShort:"ARI", emoji:"🐍", time:"7:10 PM ET",  promo:"Gary Carter Bobblehead (1986 Series)",         specialTicket:true,  limit:null,  icon:"🎎" },
  { id: 5,  isoDate:"2026-04-11", display:"Sat, Apr 11", opponent:"Athletics",             oppShort:"ATH", emoji:"🐘", time:"4:10 PM ET",  promo:"Juan Soto 40/30 Bobblehead",                   specialTicket:false, limit:18000, icon:"🎎" },
  { id: 6,  isoDate:"2026-04-24", display:"Fri, Apr 24", opponent:"Colorado Rockies",      oppShort:"COL", emoji:"⛰️", time:"7:10 PM ET",  promo:"Jesse Orosco Bobblehead (1986 Series)",        specialTicket:true,  limit:null,  icon:"🎎" },
  { id: 7,  isoDate:"2026-04-25", display:"Sat, Apr 25", opponent:"Colorado Rockies",      oppShort:"COL", emoji:"⛰️", time:"4:10 PM ET",  promo:"Mr. Met Unisphere Light-Up Bobblehead",        specialTicket:false, limit:18000, icon:"🎎" },
  { id: 8,  isoDate:"2026-05-12", display:"Tue, May 12", opponent:"Detroit Tigers",        oppShort:"DET", emoji:"🐯", time:"7:10 PM ET",  promo:"Mookie Wilson Bobblehead (1986 Series)",       specialTicket:true,  limit:null,  icon:"🎎" },
  { id: 9,  isoDate:"2026-05-26", display:"Tue, May 26", opponent:"Cincinnati Reds",       oppShort:"CIN", emoji:"🔴", time:"7:10 PM ET",  promo:"1986 World Championship Retro T-shirt",        specialTicket:false, limit:15000, icon:"👕" },
  { id: 10, isoDate:"2026-05-29", display:"Fri, May 29", opponent:"Miami Marlins",         oppShort:"MIA", emoji:"🐟", time:"7:10 PM ET",  promo:"Bobby Valentine Disguise",                     specialTicket:false, limit:15000, icon:"🥸" },
  { id: 11, isoDate:"2026-06-11", display:"Thu, Jun 11", opponent:"St. Louis Cardinals",   oppShort:"STL", emoji:"🐦", time:"1:10 PM ET",  promo:"Mets Soccer Jersey",                           specialTicket:false, limit:15000, icon:"⚽" },
  { id: 12, isoDate:"2026-06-13", display:"Sat, Jun 13", opponent:"Atlanta Braves",        oppShort:"ATL", emoji:"🪓", time:"4:10 PM ET",  promo:"Hello Kitty Bobblehead",                       specialTicket:false, limit:18000, icon:"🎎" },
  { id: 13, isoDate:"2026-06-14", display:"Sun, Jun 14", opponent:"Atlanta Braves",        oppShort:"ATL", emoji:"🪓", time:"1:40 PM ET",  promo:"Crayola Mrs. Met Bobblehead (Kids 12 & Under)",specialTicket:false, limit:5000,  icon:"🖍️" },
  { id: 14, isoDate:"2026-06-22", display:"Mon, Jun 22", opponent:"Chicago Cubs",          oppShort:"CHC", emoji:"🐻", time:"7:10 PM ET",  promo:"Mets Purse",                                   specialTicket:false, limit:15000, icon:"👜" },
  { id: 15, isoDate:"2026-06-23", display:"Tue, Jun 23", opponent:"Chicago Cubs",          oppShort:"CHC", emoji:"🐻", time:"7:10 PM ET",  promo:"Mets Chain Necklace",                          specialTicket:false, limit:15000, icon:"📿" },
  { id: 16, isoDate:"2026-06-24", display:"Wed, Jun 24", opponent:"Chicago Cubs",          oppShort:"CHC", emoji:"🐻", time:"7:10 PM ET",  promo:"Marcus Semien Replica Jersey",                 specialTicket:false, limit:15000, icon:"👕" },
  { id: 17, isoDate:"2026-06-25", display:"Thu, Jun 25", opponent:"Chicago Cubs",          oppShort:"CHC", emoji:"🐻", time:"7:10 PM ET",  promo:"Juan Soto Baseball Card Bobblehead",           specialTicket:false, limit:18000, icon:"🎎" },
  { id: 18, isoDate:"2026-06-26", display:"Fri, Jun 26", opponent:"Philadelphia Phillies", oppShort:"PHI", emoji:"🔔", time:"7:10 PM ET",  promo:"Mets Pride Sleeveless Jersey",                 specialTicket:false, limit:15000, icon:"🌈" },
  { id: 19, isoDate:"2026-07-12", display:"Sun, Jul 12", opponent:"Boston Red Sox",        oppShort:"BOS", emoji:"🧦", time:"1:40 PM ET",  promo:"1986 Retro Jersey",                            specialTicket:false, limit:15000, icon:"👕" },
  { id: 20, isoDate:"2026-08-02", display:"Sun, Aug 2",  opponent:"Miami Marlins",         oppShort:"MIA", emoji:"🐟", time:"1:40 PM ET",  promo:"Ray Knight Bobblehead (1986 Series)",          specialTicket:true,  limit:null,  icon:"🎎" },
];

const BOBBLE_SERIES = [4, 6, 8, 20]; // IDs that are 1986 special ticket bobbleheads

const CITI_SECTIONS = [
  // Field Level - lower bowl
  { id:"101", label:"101", x:220, y:310, w:38, h:28, level:"field", zone:"1B Side" },
  { id:"102", label:"102", x:185, y:290, w:38, h:28, level:"field", zone:"1B Side" },
  { id:"103", label:"103", x:155, y:265, w:38, h:28, level:"field", zone:"Behind Plate" },
  { id:"104", label:"104", x:145, y:235, w:38, h:28, level:"field", zone:"Behind Plate" },
  { id:"105", label:"105", x:145, y:205, w:38, h:28, level:"field", zone:"3B Side" },
  { id:"106", label:"106", x:155, y:178, w:38, h:28, level:"field", zone:"3B Side" },
  { id:"107", label:"107", x:175, y:155, w:38, h:28, level:"field", zone:"3B Side" },
  { id:"108", label:"108", x:205, y:140, w:38, h:28, level:"field", zone:"LF Corner" },
  { id:"109", label:"109", x:240, y:130, w:38, h:28, level:"field", zone:"LF" },
  { id:"110", label:"110", x:278, y:125, w:38, h:28, level:"field", zone:"CF/LF" },
  { id:"111", label:"111", x:316, y:122, w:38, h:28, level:"field", zone:"CF" },
  { id:"112", label:"112", x:354, y:125, w:38, h:28, level:"field", zone:"CF/RF" },
  { id:"113", label:"113", x:390, y:130, w:38, h:28, level:"field", zone:"RF" },
  { id:"114", label:"114", x:424, y:140, w:38, h:28, level:"field", zone:"RF Corner" },
  { id:"115", label:"115", x:454, y:155, w:38, h:28, level:"field", zone:"1B Side" },
  { id:"116", label:"116", x:472, y:178, w:38, h:28, level:"field", zone:"1B Side" },
  { id:"117", label:"117", x:483, y:205, w:38, h:28, level:"field", zone:"1B Side" },
  { id:"118", label:"118", x:483, y:235, w:38, h:28, level:"field", zone:"Behind Plate" },
  { id:"119", label:"119", x:472, y:265, w:38, h:28, level:"field", zone:"Behind Plate" },
  { id:"120", label:"120", x:452, y:290, w:38, h:28, level:"field", zone:"3B Side" },
  { id:"121", label:"121", x:424, y:310, w:38, h:28, level:"field", zone:"3B Side" },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');

  :root {
    --bg:       #000d1a;
    --surface:  #001428;
    --card:     #001f3d;
    --border:   #003366;
    --blue:     #002D72;
    --blue2:    #0050b3;
    --orange:   #FF5910;
    --orange2:  #ff7a3d;
    --text:     #d4e4f5;
    --muted:    #5a7fa8;
    --win:      #00e676;
    --loss:     #ff4444;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(0,45,114,0.15) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(255,89,16,0.08) 0%, transparent 50%);
  }

  #root { display: flex; flex-direction: column; min-height: 100vh; }

  /* Header */
  .header {
    background: linear-gradient(135deg, #000d1a 0%, #001428 50%, #000d1a 100%);
    border-bottom: 2px solid var(--orange);
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    height: 72px;
    box-shadow: 0 4px 40px rgba(255,89,16,0.15);
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.2rem;
    letter-spacing: 0.08em;
    line-height: 1;
    background: linear-gradient(135deg, #ffffff, var(--orange));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-sub {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    color: var(--muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .header-stats {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .stat-pill {
    text-align: center;
  }

  .stat-pill .val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.6rem;
    line-height: 1;
    color: var(--orange);
  }

  .stat-pill .lbl {
    font-size: 0.55rem;
    color: var(--muted);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .divider { width: 1px; height: 36px; background: var(--border); }

  /* Layout */
  .layout {
    display: flex;
    flex: 1;
  }

  /* Sidebar */
  .sidebar {
    width: 220px;
    min-height: calc(100vh - 72px);
    background: var(--surface);
    border-right: 1px solid var(--border);
    padding: 1.5rem 0;
    position: sticky;
    top: 72px;
    height: calc(100vh - 72px);
    overflow-y: auto;
    flex-shrink: 0;
  }

  .nav-section {
    padding: 0.5rem 1rem 0.25rem;
    font-size: 0.55rem;
    letter-spacing: 0.2em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    color: var(--muted);
    border-left: 3px solid transparent;
    font-family: 'Oswald', sans-serif;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .nav-item:hover {
    color: var(--text);
    background: rgba(0,80,179,0.1);
  }

  .nav-item.active {
    color: var(--orange);
    background: rgba(255,89,16,0.08);
    border-left-color: var(--orange);
  }

  .nav-icon { font-size: 1.1rem; width: 20px; text-align: center; }

  /* Main */
  .main {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }

  .page-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5rem;
    letter-spacing: 0.1em;
    color: white;
    margin-bottom: 0.25rem;
  }

  .page-sub {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.15em;
    margin-bottom: 2rem;
  }

  /* Cards */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .card-title {
    font-family: 'Oswald', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--orange);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Table */
  .table-wrap { overflow-x: auto; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
  }

  thead tr {
    border-bottom: 2px solid var(--orange);
  }

  th {
    font-family: 'Oswald', sans-serif;
    font-weight: 500;
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    padding: 0.75rem 1rem;
    text-align: left;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(0,51,102,0.4);
    vertical-align: middle;
  }

  tr:hover td {
    background: rgba(0,80,179,0.06);
  }

  tr.attended td {
    background: rgba(0,80,179,0.1);
  }

  tr.attended td:first-child {
    border-left: 3px solid var(--orange);
  }

  .badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.6rem;
    font-family: 'Oswald', sans-serif;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .badge-special {
    background: rgba(255,89,16,0.15);
    color: var(--orange);
    border: 1px solid var(--orange);
  }

  .badge-limit {
    background: rgba(0,80,179,0.15);
    color: #7eb3ff;
    border: 1px solid #003d80;
  }

  .badge-win {
    background: rgba(0,230,118,0.12);
    color: var(--win);
    border: 1px solid rgba(0,230,118,0.3);
  }

  .badge-loss {
    background: rgba(255,68,68,0.12);
    color: var(--loss);
    border: 1px solid rgba(255,68,68,0.3);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 1rem;
    border-radius: 4px;
    font-family: 'Oswald', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--orange);
    color: white;
  }

  .btn-primary:hover { background: var(--orange2); }

  .btn-outline {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
  }

  .btn-outline:hover {
    color: var(--text);
    border-color: var(--blue2);
  }

  .btn-attended {
    background: rgba(0,230,118,0.15);
    color: var(--win);
    border: 1px solid rgba(0,230,118,0.3);
  }

  /* Modal overlay */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,10,25,0.85);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }

  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-top: 3px solid var(--orange);
    border-radius: 8px;
    padding: 2rem;
    width: 520px;
    max-width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem;
    letter-spacing: 0.1em;
    color: white;
    margin-bottom: 0.25rem;
  }

  .modal-sub {
    font-size: 0.65rem;
    color: var(--muted);
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  label {
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    font-family: 'Oswald', sans-serif;
  }

  input, select, textarea {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text);
    padding: 0.6rem 0.8rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.8rem;
    outline: none;
    transition: border-color 0.2s;
  }

  input:focus, select:focus, textarea:focus {
    border-color: var(--orange);
  }

  select option { background: var(--card); }

  textarea { resize: vertical; min-height: 80px; }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }

  /* Trophy shelf */
  .trophy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .trophy-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem 1rem;
    text-align: center;
    transition: all 0.2s;
    cursor: default;
    position: relative;
  }

  .trophy-item.collected {
    border-color: var(--orange);
    background: rgba(255,89,16,0.06);
    box-shadow: 0 0 20px rgba(255,89,16,0.1);
  }

  .trophy-item.not-collected {
    opacity: 0.4;
    filter: grayscale(0.8);
  }

  .trophy-emoji {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.5rem;
    line-height: 1;
  }

  .trophy-name {
    font-size: 0.65rem;
    line-height: 1.4;
    color: var(--text);
    font-family: 'Oswald', sans-serif;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .trophy-date {
    font-size: 0.55rem;
    color: var(--muted);
    margin-top: 0.25rem;
    letter-spacing: 0.08em;
  }

  .trophy-check {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 0.8rem;
  }

  /* Eggroll log */
  .eggroll-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .eggroll-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem;
    transition: all 0.2s;
  }

  .eggroll-card.logged {
    border-color: #cc7722;
    background: rgba(204,119,34,0.06);
  }

  .eggroll-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .eggroll-team-emoji { font-size: 1.8rem; }

  .eggroll-team-name {
    font-family: 'Oswald', sans-serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text);
  }

  .eggroll-date { font-size: 0.6rem; color: var(--muted); }

  .stars { color: #ffcc00; font-size: 1rem; letter-spacing: 0.1em; }

  .eggroll-flavor {
    font-size: 0.75rem;
    color: #cc9933;
    margin: 0.5rem 0;
    font-style: italic;
  }

  .eggroll-notes {
    font-size: 0.7rem;
    color: var(--muted);
    line-height: 1.5;
  }

  /* Citi Field Map */
  .map-container {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }

  .map-svg-wrap {
    flex: 1;
    max-width: 680px;
  }

  .map-legend {
    width: 200px;
    flex-shrink: 0;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.7rem;
    color: var(--muted);
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .section-info {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.75rem;
  }

  /* Countdown */
  .countdown {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .countdown-unit {
    text-align: center;
  }

  .countdown-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5rem;
    color: var(--orange);
    line-height: 1;
    display: block;
  }

  .countdown-lbl {
    font-size: 0.5rem;
    color: var(--muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .countdown-sep {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem;
    color: var(--border);
    line-height: 1;
    margin-top: -8px;
  }

  /* Stats overview */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem;
    text-align: center;
  }

  .stat-card .big {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 3rem;
    line-height: 1;
    color: var(--orange);
  }

  .stat-card .label {
    font-family: 'Oswald', sans-serif;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 0.25rem;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--blue2); }

  .tag-1986 {
    display: inline-block;
    background: linear-gradient(135deg, #7c4d00, #cc8800);
    color: #fff8e0;
    border-radius: 3px;
    font-size: 0.55rem;
    padding: 0.15rem 0.4rem;
    font-family: 'Oswald', sans-serif;
    letter-spacing: 0.1em;
    margin-left: 0.4rem;
    vertical-align: middle;
  }

  @media (max-width: 900px) {
    .sidebar { display: none; }
    .header-stats { display: none; }
    .map-container { flex-direction: column; }
    .map-legend { width: 100%; }
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getCountdown(isoDate) {
  const now = new Date();
  const target = new Date(isoDate + "T00:00:00");
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hrs, mins };
}

function nextPromoGame(games) {
  const today = new Date().toISOString().slice(0, 10);
  return PROMOS.find(p => p.isoDate >= today && !games[p.id]?.attended) || null;
}

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "0.25rem" }}>
      {[1,2,3,4,5].map(s => (
        <span
          key={s}
          onClick={() => onChange(s)}
          style={{ cursor: "pointer", fontSize: "1.3rem", color: s <= value ? "#ffcc00" : "#2a3a4a" }}
        >★</span>
      ))}
    </div>
  );
}

// ─── VIEWS ───────────────────────────────────────────────────────────────────

function ScheduleView({ gameRecords, onEditGame }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="page-title">📅 2026 Promo Schedule</div>
      <div className="page-sub">ALL 20 PROMOTIONAL GAMES · CITI FIELD · FLUSHING, NY</div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Opponent</th>
                <th>Time</th>
                <th>Promotion</th>
                <th>Limit</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {PROMOS.map((p) => {
                const rec = gameRecords[p.id] || {};
                const past = p.isoDate < today;
                const isBobble = p.promo.includes("Bobblehead");
                const is1986 = p.promo.includes("1986") || BOBBLE_SERIES.includes(p.id);
                return (
                  <tr key={p.id} className={rec.attended ? "attended" : ""}>
                    <td style={{ color: "var(--muted)", fontSize: "0.7rem" }}>{String(p.id).padStart(2,"0")}</td>
                    <td>
                      <div style={{ fontFamily: "Oswald, sans-serif", fontSize: "0.85rem", color: past ? "var(--muted)" : "var(--text)" }}>
                        {p.display}
                      </div>
                    </td>
                    <td>
                      <span style={{ marginRight: "0.4rem" }}>{p.emoji}</span>
                      <span style={{ fontFamily: "Oswald, sans-serif", fontSize: "0.8rem" }}>{p.opponent}</span>
                    </td>
                    <td style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{p.time}</td>
                    <td>
                      <span style={{ fontSize: "0.8rem" }}>
                        {p.icon} {p.promo}
                        {is1986 && <span className="tag-1986">1986</span>}
                      </span>
                      {p.specialTicket && <span className="badge badge-special" style={{ marginLeft: "0.5rem" }}>Special Ticket</span>}
                    </td>
                    <td>
                      {p.limit ? (
                        <span className="badge badge-limit">First {p.limit.toLocaleString()}</span>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>—</span>
                      )}
                    </td>
                    <td>
                      {rec.attended ? (
                        <span style={{ display:"flex", flexDirection:"column", gap:"0.15rem" }}>
                          <span className="badge badge-win">✓ ATTENDED</span>
                          {rec.result === "W" && <span className="badge badge-win">W</span>}
                          {rec.result === "L" && <span className="badge badge-loss">L</span>}
                        </span>
                      ) : past ? (
                        <span style={{ color:"var(--muted)", fontSize:"0.65rem" }}>PAST</span>
                      ) : (
                        <span style={{ color:"var(--muted)", fontSize:"0.65rem" }}>UPCOMING</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-outline" onClick={() => onEditGame(p)}>
                        {rec.attended ? "✏️ Edit" : "Log Game"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function MyGamesView({ gameRecords }) {
  const attended = PROMOS.filter(p => gameRecords[p.id]?.attended);

  if (!attended.length) {
    return (
      <>
        <div className="page-title">🎟️ My Games</div>
        <div className="page-sub">YOUR PERSONAL GAME LOG</div>
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏟️</div>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: "1rem", color: "var(--muted)", letterSpacing: "0.15em" }}>
            NO GAMES LOGGED YET — HEAD TO THE SCHEDULE TO LOG YOUR FIRST GAME!
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-title">🎟️ My Games</div>
      <div className="page-sub">{attended.length} GAME{attended.length !== 1 ? "S" : ""} ATTENDED · 2026 SEASON</div>
      <div style={{ display: "grid", gap: "1rem" }}>
        {attended.map(p => {
          const rec = gameRecords[p.id];
          return (
            <div key={p.id} className="card" style={{ borderLeft: "4px solid var(--orange)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.5rem", letterSpacing: "0.1em", color: "white" }}>
                    {p.emoji} vs {p.opponent}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.1em" }}>
                    {p.display} · {p.time}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  {rec.result === "W" && <span className="badge badge-win" style={{ fontSize: "0.9rem", padding: "0.3rem 0.8rem" }}>WIN ✓</span>}
                  {rec.result === "L" && <span className="badge badge-loss" style={{ fontSize: "0.9rem", padding: "0.3rem 0.8rem" }}>LOSS ✗</span>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginTop: "1.25rem" }}>
                {(rec.section || rec.row || rec.seat) && (
                  <div style={{ background: "var(--surface)", borderRadius: "6px", padding: "0.75rem" }}>
                    <div style={{ fontSize: "0.55rem", color: "var(--muted)", letterSpacing: "0.2em", fontFamily: "Oswald", textTransform: "uppercase", marginBottom: "0.4rem" }}>📍 Seats</div>
                    <div style={{ fontFamily: "Bebas Neue", fontSize: "1.1rem", color: "var(--orange)", letterSpacing: "0.08em" }}>
                      §{rec.section || "—"} · Row {rec.row || "—"} · #{rec.seat || "—"}
                    </div>
                  </div>
                )}
                {rec.promoCollected !== undefined && (
                  <div style={{ background: "var(--surface)", borderRadius: "6px", padding: "0.75rem" }}>
                    <div style={{ fontSize: "0.55rem", color: "var(--muted)", letterSpacing: "0.2em", fontFamily: "Oswald", textTransform: "uppercase", marginBottom: "0.4rem" }}>🎁 Promo Item</div>
                    <div style={{ fontSize: "0.8rem", color: rec.promoCollected ? "var(--win)" : "var(--loss)" }}>
                      {rec.promoCollected ? "✓ Collected" : "✗ Didn't get it"} — {p.icon} {p.promo.split(" (")[0]}
                    </div>
                  </div>
                )}
                {rec.who && (
                  <div style={{ background: "var(--surface)", borderRadius: "6px", padding: "0.75rem" }}>
                    <div style={{ fontSize: "0.55rem", color: "var(--muted)", letterSpacing: "0.2em", fontFamily: "Oswald", textTransform: "uppercase", marginBottom: "0.4rem" }}>👥 Crew</div>
                    <div style={{ fontSize: "0.8rem" }}>{rec.who}</div>
                  </div>
                )}
                {rec.food && (
                  <div style={{ background: "var(--surface)", borderRadius: "6px", padding: "0.75rem" }}>
                    <div style={{ fontSize: "0.55rem", color: "var(--muted)", letterSpacing: "0.2em", fontFamily: "Oswald", textTransform: "uppercase", marginBottom: "0.4rem" }}>🌭 Food Order</div>
                    <div style={{ fontSize: "0.8rem" }}>{rec.food}</div>
                  </div>
                )}
              </div>

              {rec.notes && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--surface)", borderRadius: "6px", fontSize: "0.75rem", color: "var(--muted)", lineHeight: "1.6", borderLeft: "2px solid var(--border)" }}>
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

function TrophyView({ gameRecords }) {
  const collected = PROMOS.filter(p => gameRecords[p.id]?.promoCollected);

  return (
    <>
      <div className="page-title">🏆 Trophy Shelf</div>
      <div className="page-sub">{collected.length} OF {PROMOS.length} PROMO ITEMS COLLECTED</div>
      <div className="trophy-grid">
        {PROMOS.map(p => {
          const isCollected = !!gameRecords[p.id]?.promoCollected;
          const attended = !!gameRecords[p.id]?.attended;
          return (
            <div key={p.id} className={`trophy-item ${isCollected ? "collected" : "not-collected"}`}>
              {isCollected && <span className="trophy-check">✓</span>}
              <span className="trophy-emoji">{p.icon}</span>
              <div className="trophy-name">{p.promo.split(" (")[0]}</div>
              <div className="trophy-date">{p.display}</div>
              {p.specialTicket && <div style={{ fontSize: "0.55rem", color: "var(--orange)", marginTop: "0.25rem", letterSpacing: "0.1em" }}>SPECIAL TICKET REQ.</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}

function EggrollView({ eggrollLog, setEggrollLog }) {
  const TEAMS = [
    { name: "Pittsburgh Pirates", emoji: "⚓" },
    { name: "Arizona D-backs",    emoji: "🐍" },
    { name: "Athletics",          emoji: "🐘" },
    { name: "Colorado Rockies",   emoji: "⛰️" },
    { name: "Detroit Tigers",     emoji: "🐯" },
    { name: "Cincinnati Reds",    emoji: "🔴" },
    { name: "Miami Marlins",      emoji: "🐟" },
    { name: "St. Louis Cardinals",emoji: "🐦" },
    { name: "Atlanta Braves",     emoji: "🪓" },
    { name: "Chicago Cubs",       emoji: "🐻" },
    { name: "Philadelphia Phillies",emoji:"🔔"},
    { name: "Boston Red Sox",     emoji: "🧦" },
  ];

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const openEdit = (team) => {
    const existing = eggrollLog[team.name] || {};
    setForm({ flavor: "", rating: 3, notes: "", date: "", ...existing });
    setEditing(team);
  };

  const save = () => {
    setEggrollLog(prev => ({ ...prev, [editing.name]: { ...form, logged: true } }));
    setEditing(null);
  };

  return (
    <>
      <div className="page-title">🥚 Eggroll Hall of Fame</div>
      <div className="page-sub">TRACK THE CITI FIELD VISITING TEAM THEMED EGGROLL EXPERIENCE</div>

      <div className="card" style={{ marginBottom: "1.5rem", padding: "1rem 1.5rem" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", lineHeight: "1.7" }}>
          🍱 The Mets' famous Citi Field eggrolls feature special flavor themes for visiting teams. Log your eggroll ratings and tasting notes here — the ultimate ballpark food journal.
        </div>
      </div>

      <div className="eggroll-grid">
        {TEAMS.map(team => {
          const log = eggrollLog[team.name];
          return (
            <div key={team.name} className={`eggroll-card ${log?.logged ? "logged" : ""}`}>
              <div className="eggroll-header">
                <span className="eggroll-team-emoji">{team.emoji}</span>
                <div>
                  <div className="eggroll-team-name">{team.name}</div>
                  {log?.date && <div className="eggroll-date">{log.date}</div>}
                </div>
              </div>

              {log?.logged ? (
                <>
                  <div className="stars">{"★".repeat(log.rating)}{"☆".repeat(5 - log.rating)}</div>
                  {log.flavor && <div className="eggroll-flavor">🥚 {log.flavor}</div>}
                  {log.notes && <div className="eggroll-notes">{log.notes}</div>}
                  <button className="btn btn-outline" style={{ marginTop: "1rem", width: "100%" }} onClick={() => openEdit(team)}>
                    ✏️ Edit Entry
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => openEdit(team)}>
                  + Log Eggroll
                </button>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing.emoji} {editing.name}</div>
            <div className="modal-sub">EGGROLL TASTING NOTES</div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Eggroll Flavor / Theme</label>
              <input placeholder='e.g. "Pittsburgh Pierogi Roll"' value={form.flavor} onChange={e => setForm(p => ({...p, flavor: e.target.value}))} />
            </div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Rating</label>
              <StarRating value={form.rating || 3} onChange={r => setForm(p => ({...p, rating: r}))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date Tried</label>
                <input type="date" value={form.date || ""} onChange={e => setForm(p => ({...p, date: e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label>Tasting Notes</label>
              <textarea placeholder="How was it? Crispy? Greasy? Worth the 20 minute line?" value={form.notes || ""} onChange={e => setForm(p => ({...p, notes: e.target.value}))} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CitiFieldMap({ gameRecords }) {
  const [selected, setSelected] = useState(null);

  const sectionColors = {
    field: { default: "#002D72", hover: "#0050b3", visited: "#FF5910" }
  };

  // Gather visited sections from game records
  const visitedSections = new Set(
    Object.values(gameRecords)
      .filter(r => r?.section)
      .map(r => r.section)
  );

  return (
    <>
      <div className="page-title">🏟️ Citi Field</div>
      <div className="page-sub">CLICK A SECTION TO SEE YOUR VISIT HISTORY · FLUSHING, NY</div>

      <div className="map-container">
        <div className="map-svg-wrap">
          <div className="card" style={{ padding: "1.5rem" }}>
            <svg viewBox="0 0 680 480" style={{ width: "100%", height: "auto" }}>
              {/* Sky background */}
              <defs>
                <radialGradient id="skyGrad" cx="50%" cy="60%" r="60%">
                  <stop offset="0%" stopColor="#001428" />
                  <stop offset="100%" stopColor="#000d1a" />
                </radialGradient>
                <radialGradient id="fieldGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1a5c1a" />
                  <stop offset="60%" stopColor="#145214" />
                  <stop offset="100%" stopColor="#0e3d0e" />
                </radialGradient>
              </defs>

              <rect width="680" height="480" fill="url(#skyGrad)" rx="8" />

              {/* Outfield grass */}
              <ellipse cx="334" cy="220" rx="185" ry="140" fill="#0e3d0e" />
              <ellipse cx="334" cy="220" rx="165" ry="125" fill="#145214" />

              {/* Warning track */}
              <ellipse cx="334" cy="220" rx="185" ry="140" fill="none" stroke="#8B6914" strokeWidth="12" />

              {/* Infield dirt */}
              <ellipse cx="334" cy="270" rx="90" ry="65" fill="#8B6914" opacity="0.6" />
              <ellipse cx="334" cy="270" rx="80" ry="57" fill="#7a5c10" />

              {/* Infield grass */}
              <ellipse cx="334" cy="270" rx="72" ry="50" fill="#1a6e1a" />

              {/* Bases */}
              <rect x="330" y="218" width="9" height="9" fill="white" rx="1" />
              <rect x="374" y="252" width="9" height="9" fill="white" rx="1" transform="rotate(45,378,256)" />
              <rect x="330" y="288" width="9" height="9" fill="white" rx="1" />
              <rect x="286" y="252" width="9" height="9" fill="white" rx="1" transform="rotate(45,290,256)" />

              {/* Pitcher's mound */}
              <circle cx="334" cy="262" r="8" fill="#9a7010" />

              {/* Home plate */}
              <polygon points="330,312 344,312 344,320 337,327 330,320" fill="white" />

              {/* Foul lines */}
              <line x1="334" y1="320" x2="160" y2="120" stroke="white" strokeWidth="1.5" opacity="0.4" />
              <line x1="334" y1="320" x2="510" y2="120" stroke="white" strokeWidth="1.5" opacity="0.4" />

              {/* Center field wall label */}
              <text x="334" y="88" textAnchor="middle" fill="#2a7a2a" fontSize="11" fontFamily="Oswald" letterSpacing="3" opacity="0.8">CENTER FIELD</text>
              <text x="334" y="103" textAnchor="middle" fill="#cc8800" fontSize="16" fontFamily="Bebas Neue" letterSpacing="2">410 ft</text>

              {/* LF/RF markers */}
              <text x="170" y="148" fill="#cc8800" fontSize="13" fontFamily="Bebas Neue">335 ft</text>
              <text x="470" y="148" fill="#cc8800" fontSize="13" fontFamily="Bebas Neue">330 ft</text>

              {/* Upper deck outline */}
              <path d="M 80,360 Q 80,50 334,35 Q 590,50 590,360 L 590,400 Q 540,430 334,440 Q 130,430 80,400 Z"
                fill="none" stroke="#003366" strokeWidth="1" opacity="0.5" />

              {/* ── LOWER BOWL SECTIONS ─────────────────────────────────────────────── */}
              {/* 1B Side lower */}
              {[
                { id:"101", d:"M 480,375 L 540,365 L 545,340 L 490,348 Z" },
                { id:"102", d:"M 545,340 L 590,315 L 595,290 L 545,310 Z" },
                { id:"103", d:"M 590,315 L 620,280 L 620,255 L 585,282 Z" },
                { id:"104", d:"M 585,282 L 610,250 L 608,225 L 578,250 Z" },
                { id:"105", d:"M 578,250 L 608,225 L 600,200 L 565,222 Z" },
                { id:"106", d:"M 565,222 L 600,200 L 582,170 L 548,192 Z" },
                { id:"107", d:"M 548,192 L 582,170 L 555,145 L 522,168 Z" },
                { id:"108", d:"M 522,168 L 555,145 L 516,125 L 486,148 Z" },
                { id:"109", d:"M 486,148 L 516,125 L 468,112 L 442,136 Z" },
                { id:"110", d:"M 442,136 L 468,112 L 418,104 L 396,128 Z" },
                { id:"111", d:"M 396,128 L 418,104 L 370,100 L 334,100 L 334,125 Z" },
                { id:"112", d:"M 334,100 L 298,100 L 252,104 L 270,128 Z" },
                { id:"113", d:"M 270,128 L 252,104 L 204,112 L 226,136 Z" },
                { id:"114", d:"M 226,136 L 204,112 L 158,125 L 182,148 Z" },
                { id:"115", d:"M 182,148 L 158,125 L 130,145 L 150,168 Z" },
                { id:"116", d:"M 150,168 L 130,145 L 103,170 L 120,192 Z" },
                { id:"117", d:"M 120,192 L 103,170 L 82,200 L 100,222 Z" },
                { id:"118", d:"M 100,222 L 82,200 L 72,225 L 85,250 Z" },
                { id:"119", d:"M 85,250 L 72,225 L 70,255 L 88,282 Z" },
                { id:"120", d:"M 88,282 L 70,255 L 73,290 L 97,315 Z" },
                { id:"121", d:"M 97,315 L 73,290 L 90,340 L 140,348 Z" },
              ].map(s => {
                const isVisited = visitedSections.has(s.id);
                const isSelected = selected === s.id;
                return (
                  <path
                    key={s.id}
                    d={s.d}
                    fill={isSelected ? "var(--orange)" : isVisited ? "#cc5500" : "#002D72"}
                    stroke={isSelected ? "#ff7a3d" : isVisited ? "#ff7a3d" : "#0050b3"}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={isSelected ? 1 : 0.85}
                    style={{ cursor: "pointer", transition: "all 0.15s" }}
                    onClick={() => setSelected(selected === s.id ? null : s.id)}
                  >
                    <title>Section {s.id}{isVisited ? " ✓ Visited" : ""}</title>
                  </path>
                );
              })}

              {/* Section number labels */}
              {[
                { id:"101", x:510,  y:362 }, { id:"102", x:567,  y:330 }, { id:"103", x:602,  y:294 },
                { id:"104", x:594,  y:264 }, { id:"105", x:585,  y:236 }, { id:"106", x:570,  y:207 },
                { id:"107", x:549,  y:182 }, { id:"108", x:520,  y:158 }, { id:"109", x:488,  y:137 },
                { id:"110", x:452,  y:124 }, { id:"111", x:408,  y:116 }, { id:"112", x:296,  y:116 },
                { id:"113", x:254,  y:124 }, { id:"114", x:218,  y:137 }, { id:"115", x:180,  y:158 },
                { id:"116", x:152,  y:182 }, { id:"117", x:130,  y:207 }, { id:"118", x:114,  y:236 },
                { id:"119", x:108,  y:264 }, { id:"120", x:108,  y:294 }, { id:"121", x:135,  y:332 },
              ].map(l => (
                <text key={l.id} x={l.x} y={l.y} textAnchor="middle" fill={visitedSections.has(l.id) ? "#fff" : "#7eb3ff"}
                  fontSize="9" fontFamily="DM Mono" style={{ pointerEvents: "none", userSelect: "none" }}>
                  {l.id}
                </text>
              ))}

              {/* Home plate area / Seating behind home */}
              <path d="M 140,348 L 90,340 L 97,415 Q 200,450 334,455 Q 470,450 570,415 L 580,340 L 480,375 L 380,390 L 334,395 L 290,390 Z"
                fill="#001f3d" stroke="#003366" strokeWidth="1" />

              {/* Mezzanine deck label areas */}
              <text x="580" y="360" fill="#5a7fa8" fontSize="8" fontFamily="Oswald" letterSpacing="1">200s</text>
              <text x="75"  y="360" fill="#5a7fa8" fontSize="8" fontFamily="Oswald" letterSpacing="1">200s</text>

              {/* Upper deck hint */}
              <text x="610" y="200" fill="#1e3d6e" fontSize="8" fontFamily="Oswald" letterSpacing="1" transform="rotate(90,610,200)">500s UPPER</text>
              <text x="55"  y="270" fill="#1e3d6e" fontSize="8" fontFamily="Oswald" letterSpacing="1" transform="rotate(-90,55,270)">500s UPPER</text>

              {/* Compass / Citi Field label */}
              <text x="334" y="468" textAnchor="middle" fill="#1e3d6e" fontSize="11" fontFamily="Bebas Neue" letterSpacing="4">CITI FIELD · FLUSHING, NY</text>

              {/* Selected section highlight ring */}
              {selected && (
                <circle cx="334" cy="200" r="4" fill="var(--orange)" opacity="0">
                  <animate attributeName="r" values="4;80;4" dur="1s" repeatCount="1" />
                  <animate attributeName="opacity" values="0.5;0;0" dur="1s" repeatCount="1" />
                </circle>
              )}
            </svg>
          </div>
        </div>

        <div className="map-legend">
          <div className="card" style={{ padding: "1.25rem" }}>
            <div className="card-title">Legend</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#002D72", border: "1px solid #0050b3" }} />
                <span>Field Level (100s)</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#cc5500", border: "1px solid #ff7a3d" }} />
                <span>Section You've Sat In</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "var(--orange)" }} />
                <span>Selected Section</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#1a6e1a", border: "1px solid #2a8a2a" }} />
                <span>Field / Playing Surface</span>
              </div>
            </div>
          </div>

          {selected && (
            <div className="section-info">
              <div style={{ fontFamily: "Bebas Neue", fontSize: "1.5rem", color: "var(--orange)", letterSpacing: "0.08em" }}>
                Section {selected}
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                {visitedSections.has(selected) ? (
                  <>
                    <span style={{ color: "var(--win)" }}>✓ You've sat here!</span>
                    <div style={{ marginTop: "0.5rem" }}>
                      {Object.entries(gameRecords)
                        .filter(([, r]) => r?.section === selected)
                        .map(([id]) => {
                          const p = PROMOS.find(pr => pr.id === Number(id));
                          return p ? <div key={id} style={{ color: "var(--text)", marginTop: "0.25rem" }}>• {p.display} vs {p.opponent}</div> : null;
                        })}
                    </div>
                  </>
                ) : (
                  <span>No visits logged here yet. Log a game with this section from the Schedule!</span>
                )}
              </div>
            </div>
          )}

          <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
            <div className="card-title" style={{ marginBottom: "0.5rem" }}>Your Sections</div>
            {visitedSections.size === 0 ? (
              <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>No sections logged yet</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {[...visitedSections].map(s => (
                  <span key={s} onClick={() => setSelected(s)}
                    style={{ cursor: "pointer", background: "rgba(255,89,16,0.15)", color: "var(--orange)", border: "1px solid var(--orange)", borderRadius: "4px", padding: "0.2rem 0.5rem", fontSize: "0.65rem", fontFamily: "Oswald" }}>
                    §{s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function OverviewView({ gameRecords, eggrollLog }) {
  const attended = Object.values(gameRecords).filter(r => r?.attended).length;
  const promoCollected = Object.values(gameRecords).filter(r => r?.promoCollected).length;
  const wins = Object.values(gameRecords).filter(r => r?.result === "W").length;
  const losses = Object.values(gameRecords).filter(r => r?.result === "L").length;
  const eggrollCount = Object.values(eggrollLog).filter(r => r?.logged).length;

  const next = nextPromoGame(gameRecords);
  const countdown = next ? getCountdown(next.isoDate) : null;

  return (
    <>
      <div className="page-title">🏟️ METS HQ</div>
      <div className="page-sub">2026 SEASON COMMAND CENTER · LET'S GO METS!</div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="big">{attended}</div>
          <div className="label">Games Attended</div>
        </div>
        <div className="stat-card">
          <div className="big">{promoCollected}</div>
          <div className="label">Promos Collected</div>
        </div>
        <div className="stat-card">
          <div className="big" style={{ color: wins > losses ? "var(--win)" : wins < losses ? "var(--loss)" : "var(--orange)" }}>
            {wins}-{losses}
          </div>
          <div className="label">Win-Loss Record</div>
        </div>
        <div className="stat-card">
          <div className="big">{eggrollCount}</div>
          <div className="label">Eggrolls Tried</div>
        </div>
        <div className="stat-card">
          <div className="big">{20 - attended}</div>
          <div className="label">Games Remaining</div>
        </div>
      </div>

      {next && countdown && (
        <div className="card">
          <div className="card-title">⏳ Next Promo Game</div>
          <div style={{ fontFamily: "Bebas Neue", fontSize: "1.4rem", color: "white", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
            {next.emoji} vs {next.opponent} · {next.display} · {next.time}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
            {next.icon} {next.promo}
            {next.specialTicket && <span className="badge badge-special" style={{ marginLeft: "0.5rem" }}>Special Ticket Required</span>}
          </div>
          <div className="countdown">
            <div className="countdown-unit">
              <span className="countdown-val">{String(countdown.days).padStart(2,"0")}</span>
              <span className="countdown-lbl">Days</span>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit">
              <span className="countdown-val">{String(countdown.hrs).padStart(2,"0")}</span>
              <span className="countdown-lbl">Hours</span>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit">
              <span className="countdown-val">{String(countdown.mins).padStart(2,"0")}</span>
              <span className="countdown-lbl">Mins</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <div className="card-title">🗓️ Upcoming Promo Games</div>
          {PROMOS.filter(p => p.isoDate >= new Date().toISOString().slice(0,10)).slice(0, 5).map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid rgba(0,51,102,0.3)" }}>
              <span style={{ fontFamily: "DM Mono", fontSize: "0.65rem", color: "var(--muted)", minWidth: "70px" }}>{p.display}</span>
              <span style={{ fontSize: "0.85rem" }}>{p.emoji}</span>
              <span style={{ fontFamily: "Oswald", fontSize: "0.78rem", flex: 1 }}>{p.opponent}</span>
              <span style={{ fontSize: "0.8rem" }}>{p.icon}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">🏆 Recent Haul</div>
          {Object.entries(gameRecords).filter(([,r]) => r?.attended).slice(-5).reverse().map(([id, rec]) => {
            const p = PROMOS.find(pr => pr.id === Number(id));
            if (!p) return null;
            return (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid rgba(0,51,102,0.3)" }}>
                <span style={{ fontFamily: "DM Mono", fontSize: "0.65rem", color: "var(--muted)", minWidth: "70px" }}>{p.display}</span>
                <span style={{ fontSize: "0.85rem" }}>{p.emoji}</span>
                <span style={{ fontFamily: "Oswald", fontSize: "0.78rem", flex: 1 }}>{p.opponent}</span>
                {rec.result && <span className={`badge badge-${rec.result === "W" ? "win" : "loss"}`}>{rec.result}</span>}
                {rec.promoCollected && <span title={p.promo}>{p.icon}</span>}
              </div>
            );
          })}
          {!Object.values(gameRecords).some(r => r?.attended) && (
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", padding: "0.5rem 0" }}>No games logged yet — go to Schedule to start!</div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── GAME LOG MODAL ───────────────────────────────────────────────────────────

function GameModal({ game, record, onSave, onClose }) {
  const [form, setForm] = useState({
    attended: true,
    result: "",
    section: "",
    row: "",
    seat: "",
    promoCollected: false,
    who: "",
    food: "",
    notes: "",
    ...record,
  });
  // ensure attended always true when modal opens
  if (!form.attended) setForm(p => ({...p, attended: true}));

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{game.emoji} vs {game.opponent}</div>
        <div className="modal-sub">{game.display} · {game.time} · {game.icon} {game.promo}</div>

        <div className="form-row">
          <div className="form-group">
            <label>Game Result</label>
            <select value={form.result} onChange={e => set("result", e.target.value)}>
              <option value="">Not recorded</option>
              <option value="W">Mets Won 🎉</option>
              <option value="L">Mets Lost 😔</option>
            </select>
          </div>
          <div className="form-group">
            <label>Got Promo Item?</label>
            <select value={form.promoCollected ? "yes" : "no"} onChange={e => set("promoCollected", e.target.value === "yes")}>
              <option value="no">No / N/A</option>
              <option value="yes">Yes! Got it ✓</option>
            </select>
          </div>
        </div>

        <div style={{ fontFamily: "Oswald", fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--orange)", marginBottom: "0.75rem", textTransform: "uppercase" }}>📍 Seat Info</div>
        <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="form-group">
            <label>Section</label>
            <input placeholder="e.g. 105" value={form.section} onChange={e => set("section", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Row</label>
            <input placeholder="e.g. 14" value={form.row} onChange={e => set("row", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Seat #</label>
            <input placeholder="e.g. 7" value={form.seat} onChange={e => set("seat", e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>👥 Crew (Who'd You Go With?)</label>
            <input placeholder="e.g. Mike, Sarah, Tony" value={form.who} onChange={e => set("who", e.target.value)} />
          </div>
          <div className="form-group">
            <label>🌭 Food / Drinks Ordered</label>
            <input placeholder="e.g. Eggroll, Shake Shack, Modelos" value={form.food} onChange={e => set("food", e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>💬 Notes / Memories</label>
          <textarea placeholder="How was the vibe? Any highlights? Walk-off? Crazy fan moment?" value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>
            ✓ Save Game Log
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",  label: "Home Base",     icon: "🏟️" },
  { id: "schedule",  label: "Schedule",       icon: "📅" },
  { id: "mygames",   label: "My Games",       icon: "🎟️" },
  { id: "trophy",    label: "Trophy Shelf",   icon: "🏆" },
  { id: "eggroll",   label: "Eggroll Log",    icon: "🥚" },
  { id: "map",       label: "Citi Field Map", icon: "🗺️" },
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [gameRecords, setGameRecords] = useState({});
  const [eggrollLog, setEggrollLog] = useState({});
  const [editingGame, setEditingGame] = useState(null);

  const stats = useMemo(() => {
    const attended = Object.values(gameRecords).filter(r => r?.attended).length;
    const promos   = Object.values(gameRecords).filter(r => r?.promoCollected).length;
    const wins     = Object.values(gameRecords).filter(r => r?.result === "W").length;
    const losses   = Object.values(gameRecords).filter(r => r?.result === "L").length;
    return { attended, promos, wins, losses };
  }, [gameRecords]);

  const handleSaveGame = (form) => {
    setGameRecords(prev => ({ ...prev, [editingGame.id]: { ...form, attended: true } }));
    setEditingGame(null);
  };

  return (
    <>
      <style>{css}</style>

      <header className="header">
        <div className="header-brand">
          <div>
            <div className="header-logo">⚾ METS HQ</div>
            <div className="header-sub">2026 Game Tracker · Citi Field</div>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-pill">
            <div className="val">{stats.attended}</div>
            <div className="lbl">Attended</div>
          </div>
          <div className="divider" />
          <div className="stat-pill">
            <div className="val">{stats.promos}</div>
            <div className="lbl">Promos</div>
          </div>
          <div className="divider" />
          <div className="stat-pill">
            <div className="val" style={{ color: stats.wins > stats.losses ? "var(--win)" : stats.wins < stats.losses ? "var(--loss)" : "var(--orange)" }}>
              {stats.wins}-{stats.losses}
            </div>
            <div className="lbl">W-L</div>
          </div>
          <div className="divider" />
          <div className="stat-pill">
            <div className="val" style={{ color: "#cc8800" }}>20</div>
            <div className="lbl">Promo Games</div>
          </div>
        </div>
      </header>

      <div className="layout">
        <nav className="sidebar">
          <div className="nav-section">Navigation</div>
          {TABS.map(t => (
            <div
              key={t.id}
              className={`nav-item ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </div>
          ))}
        </nav>

        <main className="main">
          {tab === "overview" && <OverviewView gameRecords={gameRecords} eggrollLog={eggrollLog} />}
          {tab === "schedule" && <ScheduleView gameRecords={gameRecords} onEditGame={setEditingGame} />}
          {tab === "mygames"  && <MyGamesView gameRecords={gameRecords} />}
          {tab === "trophy"   && <TrophyView gameRecords={gameRecords} />}
          {tab === "eggroll"  && <EggrollView eggrollLog={eggrollLog} setEggrollLog={setEggrollLog} />}
          {tab === "map"      && <CitiFieldMap gameRecords={gameRecords} />}
        </main>
      </div>

      {editingGame && (
        <GameModal
          game={editingGame}
          record={gameRecords[editingGame.id]}
          onSave={handleSaveGame}
          onClose={() => setEditingGame(null)}
        />
      )}
    </>
  );
}
