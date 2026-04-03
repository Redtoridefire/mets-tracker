# PTO Optimizer Studio

A modern PTO planning app inspired by holiday-optimizer style workflows.

## Included functionality

- PTO optimization across a selected timeframe (2026, 2027, or rolling 12 months)
- Strategy presets (balanced, long weekends, mini breaks, week-long, extended)
- Public holiday support (US presets for 2026/2027 + custom additions)
- Pre-booked PTO and company days off
- Custom weekend definitions
- Scenario save + duplication and reload
- Calendar exports:
  - Download entire plan as `.ics`
  - Download per-break `.ics`
  - One-click add per-break to Google Calendar

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Vercel deployment

1. Push this repository to GitHub.
2. In Vercel, choose **Add New Project** and import the repo.
3. Framework preset: **Vite** (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

