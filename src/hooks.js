import { useState, useEffect, useRef } from 'react';
import { METS_TEAM_ID } from './data/promos.js';

// ─── API CACHE HELPER ─────────────────────────────────────────────────────────
// Checks localStorage before hitting the network. Respects a TTL (ms).
// Cache keys are prefixed with metsHQ_cache_ to avoid collisions.
const CACHE_PFX = 'metsHQ_cache_';

function cachedFetch(key, url, ttlMs) {
  try {
    const raw = localStorage.getItem(CACHE_PFX + key);
    if (raw) {
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts < ttlMs) return Promise.resolve(data);
    }
  } catch { /* corrupt cache entry — ignore and re-fetch */ }

  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      try {
        localStorage.setItem(CACHE_PFX + key, JSON.stringify({ data, ts: Date.now() }));
      } catch { /* storage full — serve data without caching */ }
      return data;
    });
}

// ─── WEATHER HOOK ────────────────────────────────────────────────────────────
// Uses wttr.in — free, no key, CORS-safe. Cached 10 minutes.
export function useWeather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    cachedFetch('weather', 'https://wttr.in/Flushing+NY?format=j1', 600_000)
      .then(json => {
        if (cancelled) return;
        const cur  = json.current_condition?.[0];
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
            forecast:    json.weather?.slice(0, 3).map(d => ({
              date:       d.date,
              maxF:       d.maxtempF,
              minF:       d.mintempF,
              avgF:       d.avgtempF,
              desc:       d.hourly?.[4]?.weatherDesc?.[0]?.value || '',
              code:       d.hourly?.[4]?.weatherCode,
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
  if ([143, 248, 260].includes(c)) return '🌫️';
  if ([176,185,263,266,281,284,293,296,299,302,305,308,311,314,317,320,323,326,374,377].includes(c)) return '🌧️';
  if ([179,182,329,332,335,338,350,368,371].includes(c)) return '🌨️';
  if ([200,386,389,392,395].includes(c)) return '⛈️';
  return '🌡️';
}

// ─── MLB SCHEDULE HOOK ───────────────────────────────────────────────────────
// Uses MLB Stats API — free, no key, CORS-safe.
// Cached 90 seconds (short TTL so live scores stay fresh).
export function useMLBSchedule() {
  const [games, setGames]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const today = new Date();
    const start = new Date(today); start.setDate(start.getDate() - 14);
    const end   = new Date(today); end.setDate(end.getDate() + 30);
    const fmt   = d => d.toISOString().slice(0, 10);
    const todayStr = fmt(today);

    const url = `https://statsapi.mlb.com/api/v1/schedule?teamId=${METS_TEAM_ID}`
      + `&startDate=${fmt(start)}&endDate=${fmt(end)}&sportId=1`
      + `&hydrate=linescore,decisions,team`;

    // Cache key includes today's date so it busts naturally at midnight
    cachedFetch(`schedule_${todayStr}`, url, 90_000)
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
              gameType:   g.gameType,
              result:     mets?.isWinner === true ? 'W' : mets?.isWinner === false ? 'L' : null,
              winPitch:   g.decisions?.winner?.fullName,
              losePitch:  g.decisions?.loser?.fullName,
              savePitch:  g.decisions?.save?.fullName,
            });
          });
        });
        setGames(allGames.sort((a, b) => new Date(b.date) - new Date(a.date)));
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
// Roster cached 6h. Individual player stats cached 2h.
export function useMLBRoster() {
  const [roster,  setRoster]  = useState([]);
  const [stats,   setStats]   = useState({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const season = new Date().getFullYear();

    const fetchStats = async (playerId, group, yr) => {
      const url = `https://statsapi.mlb.com/api/v1/people/${playerId}/stats`
        + `?stats=season&season=${yr}&group=${group}&sportId=1`;
      const j = await cachedFetch(`pstats_${playerId}_${group}_${yr}`, url, 7_200_000);
      const s = j.stats?.[0]?.splits?.[0]?.stat || null;
      if (!s || Object.keys(s).length === 0) {
        // Fall back to prior season
        const url2 = `https://statsapi.mlb.com/api/v1/people/${playerId}/stats`
          + `?stats=season&season=${yr - 1}&group=${group}&sportId=1`;
        const j2 = await cachedFetch(`pstats_${playerId}_${group}_${yr - 1}`, url2, 7_200_000);
        return { stat: j2.stats?.[0]?.splits?.[0]?.stat || null, season: yr - 1 };
      }
      return { stat: s, season: yr };
    };

    const rosterUrl = `https://statsapi.mlb.com/api/v1/teams/${METS_TEAM_ID}/roster?rosterType=active&season=${season}`;
    cachedFetch(`roster_${season}`, rosterUrl, 21_600_000)
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

        // Load stats in batches of 5 to avoid hammering the API
        const batches = [];
        for (let i = 0; i < players.length; i += 5) batches.push(players.slice(i, i + 5));
        const allStats = {};

        for (const batch of batches) {
          if (cancelled) break;
          await Promise.all(batch.map(async p => {
            try {
              const isPitcher = p.posType === 'Pitcher';
              const group = isPitcher ? 'pitching' : 'hitting';
              const { stat, season: s } = await fetchStats(p.id, group, season);
              allStats[p.id] = isPitcher ? { pitching: stat, season: s } : { hitting: stat, season: s };
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
// Cached 60 minutes.
export function useMLBStandings() {
  const [standings, setStandings] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    const season = new Date().getFullYear();
    const url = `https://statsapi.mlb.com/api/v1/standings?leagueId=104&season=${season}&standingsTypes=regularSeason`;
    cachedFetch(`standings_${season}`, url, 3_600_000)
      .then(json => {
        if (cancelled) return;
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

// ─── FULL SEASON SCHEDULE HOOK ────────────────────────────────────────────────
// Fetches Spring Training (S) + Regular Season (R) games for the full season.
// Cached 15 minutes. Sorted ascending (oldest → newest) for schedule display.
export function useMLBFullSchedule() {
  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const season   = new Date().getFullYear();
    const todayStr = new Date().toISOString().slice(0, 10);
    const url = `https://statsapi.mlb.com/api/v1/schedule?teamId=${METS_TEAM_ID}`
      + `&sportId=1&season=${season}&gameTypes=S,R`
      + `&startDate=${season}-01-01&endDate=${season}-10-31`
      + `&hydrate=linescore,decisions,team`;

    cachedFetch(`fullsched_${season}`, url, 900_000)
      .then(json => {
        if (cancelled) return;
        const all = [];
        (json.dates || []).forEach(date => {
          (date.games || []).forEach(g => {
            const isHome = g.teams?.home?.team?.id === METS_TEAM_ID;
            const mets   = isHome ? g.teams?.home : g.teams?.away;
            const opp    = isHome ? g.teams?.away : g.teams?.home;
            all.push({
              gamePk:      g.gamePk,
              date:        g.gameDate,
              displayDate: date.date,
              status:      g.status?.detailedState || '',
              statusCode:  g.status?.statusCode || '',
              isHome,
              metsScore:   mets?.score,
              oppScore:    opp?.score,
              oppName:     opp?.team?.name || '',
              oppId:       opp?.team?.id,
              venue:       g.venue?.name || '',
              inning:      g.linescore?.currentInning,
              inningHalf:  g.linescore?.inningHalf,
              gameType:    g.gameType,   // 'S' = Spring Training, 'R' = Regular Season
              result:      mets?.isWinner === true ? 'W' : mets?.isWinner === false ? 'L' : null,
              winPitch:    g.decisions?.winner?.fullName,
              losePitch:   g.decisions?.loser?.fullName,
              savePitch:   g.decisions?.save?.fullName,
            });
          });
        });
        setGames(all.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setLoading(false);
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  return { games, loading, error };
}

// ─── MLB TRANSACTIONS HOOK ────────────────────────────────────────────────────
// Fetches recent Mets transactions: optionings, recalls, DFA, etc.
// Cached 30 minutes.
export function useMLBTransactions(daysBack = 90) {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - daysBack);
    const fmt      = d => d.toISOString().slice(0, 10);
    const todayStr = fmt(today);
    const url = `https://statsapi.mlb.com/api/v1/transactions?teamId=${METS_TEAM_ID}`
      + `&startDate=${fmt(start)}&endDate=${todayStr}`;

    cachedFetch(`txns_${daysBack}_${todayStr}`, url, 1_800_000)
      .then(json => {
        if (cancelled) return;
        const txns = (json.transactions || [])
          .filter(t => t.typeCode && t.person)
          .sort((a, b) => new Date(b.effectiveDate || b.date) - new Date(a.effectiveDate || a.date));
        setTransactions(txns);
        setLoading(false);
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [daysBack]);

  return { transactions, loading, error };
}

// ─── METS NEWS FEED HOOK ──────────────────────────────────────────────────────
// Fetches the Mets official RSS feed via allorigins.win (free, no-key CORS proxy).
// Parses XML client-side. Cached 10 minutes.
export function useMetsNewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const rss      = 'https://www.mets.com/feeds/rss.xml';
    const proxy    = `https://api.allorigins.win/get?url=${encodeURIComponent(rss)}`;
    const todayStr = new Date().toISOString().slice(0, 13); // cache per-hour

    cachedFetch(`metsnews_${todayStr}`, proxy, 600_000)
      .then(json => {
        if (cancelled) return;
        const text   = json.contents || '';
        const parser = new DOMParser();
        const xml    = parser.parseFromString(text, 'text/xml');
        const items  = Array.from(xml.querySelectorAll('item'));
        const parsed = items.slice(0, 25).map(el => {
          // Extract thumbnail from enclosure or media:thumbnail
          const enclosure = el.querySelector('enclosure');
          const thumb = el.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url')
            || enclosure?.getAttribute('url') || null;
          return {
            title: el.querySelector('title')?.textContent?.trim() || '',
            link:  el.querySelector('link')?.textContent?.trim() || '',
            desc:  el.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '').trim() || '',
            date:  el.querySelector('pubDate')?.textContent?.trim() || '',
            thumb,
          };
        }).filter(a => a.title);
        setArticles(parsed);
        setLoading(false);
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  return { articles, loading, error };
}
