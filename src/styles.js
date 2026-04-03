const CSS = `
:root {
  color-scheme: dark;
  --bg: #070c1e;
  --panel: #101833;
  --muted: #9cafcc;
  --text: #ecf2ff;
  --line: #2b3a63;
  --brand: #6aa0ff;
  --brand2: #7ef0c8;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background: radial-gradient(circle at 0% 0%, #1a2650 0%, var(--bg) 45%);
  color: var(--text);
}
.page { max-width: 1200px; margin: 0 auto; padding: 24px; }
.hero { margin-bottom: 20px; }
.hero h1 { margin: 0; font-size: clamp(2rem, 3vw, 2.8rem); }
.hero p { color: var(--muted); }
.layout { display: grid; grid-template-columns: 1fr 1.2fr; gap: 16px; }
.panel {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  backdrop-filter: blur(8px);
}
label, .mini-title { display: block; font-size: 0.85rem; color: var(--muted); margin-bottom: 8px; }
input, select, button, a {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
  color: var(--text);
  padding: 10px;
  text-decoration: none;
}
input, select { margin-bottom: 12px; }
button, a { cursor: pointer; }
button:hover, a:hover { border-color: var(--brand); }
.inline-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.chip { width: auto; padding: 8px 12px; }
.chip.active { background: linear-gradient(135deg, var(--brand), #4d72f2); border-color: transparent; }
.row { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
.row button { width: auto; }
.date-area { display: grid; gap: 10px; margin-bottom: 12px; }
.btn-row { display: flex; gap: 8px; margin-top: 8px; }
.btn-row > * { flex: 1; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
.stats article { border: 1px solid var(--line); border-radius: 10px; padding: 10px; text-align: center; }
.stats strong { display: block; font-size: 1.4rem; color: var(--brand2); }
.stats span { font-size: 0.8rem; color: var(--muted); }
.break-list { display: grid; gap: 10px; margin-top: 12px; }
.break-card { border: 1px solid var(--line); border-radius: 12px; padding: 12px; background: rgba(17, 26, 52, 0.6); }
.break-card h3 { margin: 0 0 8px 0; }
.break-card p { margin: 5px 0; color: #c6d4ed; }
.ideas { margin-top: 16px; border-top: 1px solid var(--line); padding-top: 12px; }
.ideas h3 { margin: 0 0 8px 0; }
.ideas ul { margin: 0; padding-left: 18px; color: #c6d4ed; }
.muted { color: var(--muted); }
.scenario-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; margin-bottom: 8px; }
.scenario-row button { width: auto; }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
`;

export default CSS;
