import { useState, useEffect, useRef } from 'react';
import { METS_TEAM_ID } from './data/promos.js';

// ─── WEATHER HOOK ────────────────────────────────────────────────────────────
// Uses wttr.in — free, no key, CORS-safe
export function useWeather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('https://wttr.in/Flushing+NY?format=j1')
      .then(r => r.json())
      .then(json => {
        if (cancelled) return;
        const cur = json.current_condition?.[0];
        const area = json.nearest_area?.[0];
        if (cur) {
          setData({
            tempF:       cur.temp_F,
            tempC:       cur.temp_C,
            feelsLikeF:  cur.FeelsLikeF,
            humidity:    cur.humidity,
            windMph:     cur.windspeedMiles,
            windDir:     cur.winddir16Point,
            desc:        cur.weatherDesc?.[0]?.value || '',
            code:        cur.weatherCode,
            visibility:  cur.visibility,
            precipMM:    cur.precipMM,
            uvIndex:     cur.uvIndex,
            location:    area ? `${area.areaName?.[0]?.value}, ${area.region?.[0]?.value}` : 'Flushing, NY',
            forecast:    json.weather?.slice(0,3).map(d => ({
              date:   d.date,
              maxF:   d.maxtempF,
              minF:   d.mintempF,
              avgF:   d.avgtempF,
              desc:   d.hourly?.[4]?.weatherDesc?.[0]?.value || '',
              code:   d.hourly?.[4]?.weatherCode,
              chanceRain: d.hourly?.[4]?.chanceofrain || '0',
            })) || [],
          });
        }
        setLoading(false);
      })
      .catch(e => {
        if (!cancelled) { setError(e.message); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

// ─── WEATHER ICON ────────────────────────────────────────────────────────────
export function weatherIcon(code) {
  const c = parseInt(code);
  if (c === 113) return '☀️';
  if (c === 116) return '⛅';
  if (c === 119 || c === 122) return '☁️';
  if ([143,248,260].includes(c)) return '🌫️';
  if ([176,185,263,266,281,284,293,296,299,302,305,308,311,314,317,320,323,326,374,377].includes(c)) return '🌧️';
  if ([179,182,323,326,329,332,335,338,350,368,371].includes(c)) return '🌨️';
  if ([200,386,389,392,395].includes(c)) return '⛈️';
  return '🌡️';
}

// ─── MLB SCHEDULE HOOK ───────────────────────────────────────────────────────
// Uses MLB Stats API — free, no key, CORS-safe
export function useMLBSchedule() {
  const [games, setGames]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const today   = new Date();
    const start   = new Date(today); start.setDate(start.getDate() - 14);
    const end     = new Date(today); end.setDate(end.getDate() + 30);
    const fmt     = d => d.toISOString().slice(0,10);

    const url = `https://statsapi.mlb.com/api/v1/schedule?teamId=${METS_TEAM_ID}`
      + `&startDate=${fmt(start)}&endDate=${fmt(end)}&sportId=1`
      + `&hydrate=linescore,decisions,team`;

    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (cancelled) return;
        const allGames = [];
        (json.dates || []).forEach(date => {
          (date.games || []).forEach(g => {
            const isHome = g.teams?.home?.team?.id === METS_TEAM_ID;
            const mets   = isHome ? g.teams?.home : g.teams?.away;
            const opp    = isHome ? g.teams?.away : g.teams?.home;
            allGames.push({
              gamePk:     g.gamePk,
              date:       g.gameDate,
              displayDate:date.date,
              status:     g.status?.detailedState || '',
              statusCode: g.status?.statusCode || '',
              isHome,
              metsScore:  mets?.score,
              oppScore:   opp?.score,
              oppName:    opp?.team?.name || '',
              oppId:      opp?.team?.id,
              venue:      g.venue?.name || '',
              inning:     g.linescore?.currentInning,
              inningHalf: g.linescore?.inningHalf,
              gameType:   g.gameType, // 'R' regular, 'S' spring, 'P' postseason
              result:     mets?.isWinner === true ? 'W' : mets?.isWinner === false ? 'L' : null,
              winPitch:   g.decisions?.winner?.fullName,
              losePitch:  g.decisions?.loser?.fullName,
              savePitch:  g.decisions?.save?.fullName,
            });
          });
        });
        setGames(allGames.sort((a,b) => new Date(b.date) - new Date(a.date)));
        setLoading(false);
      })
      .catch(e => {
        if (!cancelled) { setError(e.message); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, []);

  return { games, loading, error };
}

// ─── MLB ROSTER + STATS HOOK ─────────────────────────────────────────────────
export function useMLBRoster() {
  const [roster,  setRoster]  = useState([]);
  const [stats,   setStats]   = useState({});    // { playerId: { hitting?, pitching? } }
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const season = new Date().getFullYear(); // 2026

    // Try current season first; if empty fall back to 2025
    const fetchStats = async (playerId, group, season) => {
      const url = `https://statsapi.mlb.com/api/v1/people/${playerId}/stats`
        + `?stats=season&season=${season}&group=${group}&sportId=1`;
      const r = await fetch(url);
      const j = await r.json();
      const s = j.stats?.[0]?.splits?.[0]?.stat || null;
      if (!s || Object.keys(s).length === 0) {
        // try prior year
        const url2 = `https://statsapi.mlb.com/api/v1/people/${playerId}/stats`
          + `?stats=season&season=${season-1}&group=${group}&sportId=1`;
        const r2 = await fetch(url2);
        const j2 = await r2.json();
        return { stat: j2.stats?.[0]?.splits?.[0]?.stat || null, season: season-1 };
      }
      return { stat: s, season };
    };

    fetch(`https://statsapi.mlb.com/api/v1/teams/${METS_TEAM_ID}/roster?rosterType=active&season=${season}`)
      .then(r => r.json())
      .then(async json => {
        if (cancelled) return;
        const players = (json.roster || []).map(p => ({
          id:       p.person.id,
          name:     p.person.fullName,
          number:   p.jerseyNumber,
          position: p.position?.abbreviation || '?',
          posType:  p.position?.type || '',
          status:   p.status?.description || '',
        }));
        setRoster(players);

        // Load stats in parallel (batched to avoid hammering)
        const batches = [];
        for (let i = 0; i < players.length; i += 5) batches.push(players.slice(i, i+5));
        const allStats = {};

        for (const batch of batches) {
          if (cancelled) break;
          await Promise.all(batch.map(async p => {
            try {
              const isPitcher = p.posType === 'Pitcher';
              if (isPitcher) {
                const { stat, season: s } = await fetchStats(p.id, 'pitching', season);
                allStats[p.id] = { pitching: stat, season: s };
              } else {
                const { stat, season: s } = await fetchStats(p.id, 'hitting', season);
                allStats[p.id] = { hitting: stat, season: s };
              }
            } catch { allStats[p.id] = {}; }
          }));
          if (!cancelled) setStats({ ...allStats });
        }
        if (!cancelled) setLoading(false);
      })
      .catch(e => {
        if (!cancelled) { setError(e.message); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, []);

  return { roster, stats, loading, error };
}

// ─── MLB STANDINGS HOOK ──────────────────────────────────────────────────────
export function useMLBStandings() {
  const [standings, setStandings] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    const season = new Date().getFullYear();
    fetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=104&season=${season}&standingsTypes=regularSeason`)
      .then(r => r.json())
      .then(json => {
        if (cancelled) return;
        // Find Mets' division
        let metsDiv = null;
        for (const div of (json.records || [])) {
          const mets = div.teamRecords?.find(t => t.team?.id === METS_TEAM_ID);
          if (mets) { metsDiv = { division: div.division?.name, teams: div.teamRecords, mets }; break; }
        }
        setStandings(metsDiv);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { standings, loading };
}
