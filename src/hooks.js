import { useState, useEffect, useRef } from 'react';
import { METS_TEAM_ID } from './data/promos.js';
import { localDateStr, todayLocalStr } from './dateUtil.js';

// ─── API CACHE HELPER ─────────────────────────────────────────────────────────
// Checks localStorage before hitting the network. Respects a TTL (ms).
// Cache keys are prefixed with metsHQ_cache_ to avoid collisions.
const CACHE_PFX = 'metsHQ_cache_';
const MAX_CACHE_ENTRY_BYTES = 900_000;
const ALLOWED_FETCH_HOSTS = new Set([
  'wttr.in',
  'statsapi.mlb.com',
  'api.allorigins.win',
  'api.rss2json.com',
]);

function safeParseJSON(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

function isAllowedUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && ALLOWED_FETCH_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

function fetchJsonWithTimeout(url, timeoutMs = 12_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    signal: controller.signal,
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    cache: 'no-store',
    mode: 'cors',
  })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .finally(() => clearTimeout(timeout));
}

function cachedFetch(key, url, ttlMs, opts = {}) {
  const timeoutMs = opts.timeoutMs || 12_000;
  if (!isAllowedUrl(url)) return Promise.reject(new Error('Blocked external host'));

  try {
    const raw = localStorage.getItem(CACHE_PFX + key);
    if (raw) {
      const parsed = safeParseJSON(raw);
      if (parsed?.ts && Date.now() - parsed.ts < ttlMs) return Promise.resolve(parsed.data);
    }
  } catch { /* corrupt cache entry — ignore and re-fetch */ }

  return fetchJsonWithTimeout(url, timeoutMs)
    .then(data => {
      try {
        const payload = JSON.stringify({ data, ts: Date.now() });
        if (payload.length <= MAX_CACHE_ENTRY_BYTES) {
          localStorage.setItem(CACHE_PFX + key, payload);
        }
      } catch { /* storage full — serve data without caching */ }
      return data;
    });
}

// ─── WEATHER HOOK ────────────────────────────────────────────────────────────
// Uses wttr.in — free, no key, CORS-safe. Cached 10 minutes.
export function useWeather() {
  const STATIC_KEY = `${CACHE_PFX}weather_static_latest`;
  const initCached = () => {
    try {
      const raw = localStorage.getItem(STATIC_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.data) return parsed.data;
    } catch { /* ignore */ }
    return null;
  };

  const cached = initCached();
  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(prev => (cached ? prev : true));
    cachedFetch('weather', 'https://wttr.in/Flushing+NY?format=j1', 600_000)
      .then(json => {
        if (cancelled) return;
        const cur  = json.current_condition?.[0];
        const area = json.nearest_area?.[0];
        if (cur) {
          const nextData = {
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
          };
          setData(nextData);
          try { localStorage.setItem(STATIC_KEY, JSON.stringify({ data: nextData, ts: Date.now() })); } catch { /* ignore */ }
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
    const fmt   = d => localDateStr(d);
    const todayStr = fmt(today);

    const url = `https://statsapi.mlb.com/api/v1/schedule?teamId=${METS_TEAM_ID}`
      + `&startDate=${fmt(start)}&endDate=${fmt(end)}&sportId=1`
      + `&hydrate=linescore,decisions,team,broadcasts`;

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
              broadcasts: (g.broadcasts || []).filter(b => b.type === 'TV').map(b => b.name),
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

// ─── WORLD BASEBALL CLASSIC SCHEDULE HOOK ───────────────────────────────────
// sportId=51 (WBC/International). Cached 5 minutes.
export function useWBCSchedule() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const year = new Date().getFullYear();
    const todayStr = todayLocalStr();
    const forceRefresh = refreshToken > 0;
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=51`
      + `&startDate=${year}-01-01&endDate=${year}-12-31`
      + `&hydrate=linescore,team,broadcasts`;

    cachedFetch(`wbc_${year}_${todayStr}_${refreshToken}`, url, forceRefresh ? 1 : 300_000)
      .then(json => {
        if (cancelled) return;
        const parsed = [];
        (json.dates || []).forEach(date => {
          (date.games || []).forEach(g => {
            const home = g.teams?.home;
            const away = g.teams?.away;
            parsed.push({
              gamePk: g.gamePk,
              date: g.gameDate,
              displayDate: date.date,
              status: g.status?.detailedState || '',
              statusCode: g.status?.statusCode || '',
              gameType: g.gameType || '',
              homeName: home?.team?.name || 'Home',
              awayName: away?.team?.name || 'Away',
              homeScore: home?.score,
              awayScore: away?.score,
              venue: g.venue?.name || '',
              broadcasts: (g.broadcasts || []).filter(b => b.type === 'TV').map(b => b.name),
            });
          });
        });
        setGames(parsed.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setLastUpdated(Date.now());
        setLoading(false);
      })
      .catch(e => {
        if (!cancelled) { setError(e.message); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [refreshToken]);

  const refresh = () => setRefreshToken(v => v + 1);

  return { games, loading, error, refresh, lastUpdated };
}

// ─── MLB ROSTER + STATS HOOK ─────────────────────────────────────────────────
// Roster cached 6h. Individual player stats cached 2h. Bio data cached 24h.
export function useMLBRoster() {
  const [roster,  setRoster]  = useState([]);
  const [stats,   setStats]   = useState({});
  const [bios,    setBios]    = useState({});
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

        // ── Load bio data for all players (batch) ─────────────────────────
        if (!cancelled && players.length > 0) {
          const ids    = players.map(p => p.id).join(',');
          const bioUrl = `https://statsapi.mlb.com/api/v1/people?personIds=${ids}`
            + `&fields=people,id,birthDate,birthCity,birthStateProvince,birthCountry`
            + `,height,weight,bats,pitchHand,currentAge,draftYear,mlbDebutDate,nameSlug`;
          cachedFetch(`bios_${season}`, bioUrl, 86_400_000) // 24h cache
            .then(json => {
              if (cancelled) return;
              const m = {};
              for (const p of (json.people || [])) {
                m[p.id] = {
                  age:          p.currentAge,
                  birthDate:    p.birthDate,
                  birthCity:    p.birthCity,
                  birthState:   p.birthStateProvince,
                  birthCountry: p.birthCountry,
                  height:       p.height,
                  weight:       p.weight,
                  bats:         p.bats?.code,
                  throwsHand:   p.pitchHand?.code,
                  draftYear:    p.draftYear,
                  debutDate:    p.mlbDebutDate,
                };
              }
              setBios(m);
            })
            .catch(() => {}); // bio is non-critical, silently ignore
        }
      })
      .catch(e => {
        if (!cancelled) { setError(e.message); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, []);

  return { roster, stats, bios, loading, error };
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
// Fetches Spring Training / Exhibition (S/E) + Regular Season (R) games.
// Cached 15 minutes. Sorted ascending (oldest → newest) for schedule display.
export function useMLBFullSchedule() {
  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const season   = new Date().getFullYear();
    const todayStr = todayLocalStr();
    const forceRefresh = refreshToken > 0;
    const url = `https://statsapi.mlb.com/api/v1/schedule?teamId=${METS_TEAM_ID}`
      + `&sportId=1&season=${season}&gameTypes=S,E,R`
      + `&startDate=${season}-01-01&endDate=${season}-10-31`
      + `&hydrate=linescore,decisions,team,broadcasts`;

    cachedFetch(`fullsched_${season}_${todayStr}_${refreshToken}`, url, forceRefresh ? 1 : 900_000)
      .then(json => {
        if (cancelled) return;
        const all = [];
        (json.dates || []).forEach(date => {
          (date.games || []).forEach(g => {
            const isHome = g.teams?.home?.team?.id === METS_TEAM_ID;
            const mets   = isHome ? g.teams?.home : g.teams?.away;
            const opp    = isHome ? g.teams?.away : g.teams?.home;
            const normalizedType = (g.gameType === 'S' || g.gameType === 'E') ? 'S' : g.gameType;
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
              gameType:    g.gameType,
              scheduleType: normalizedType, // 'S' = Spring/Exhibition, 'R' = Regular Season
              result:      mets?.isWinner === true ? 'W' : mets?.isWinner === false ? 'L' : null,
              winPitch:    g.decisions?.winner?.fullName,
              losePitch:   g.decisions?.loser?.fullName,
              savePitch:   g.decisions?.save?.fullName,
              broadcasts:  (g.broadcasts || []).filter(b => b.type === 'TV').map(b => b.name),
            });
          });
        });
        setGames(all.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setLastUpdated(Date.now());
        setLoading(false);
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [refreshToken]);

  const refresh = () => setRefreshToken(v => v + 1);

  return { games, loading, error, refresh, lastUpdated };
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
    const fmt      = d => localDateStr(d);
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
// Two-strategy approach:
//   A) allorigins raw proxy → DOMParser (works even when rss2json is blocked)
//   B) rss2json JSON API (fallback)
// Feed priority: SNY → Amazin' Avenue → MLB.com
// Each feed is tried via Strategy A first, then B, before moving to next feed.
export function useMetsNewsFeed() {
  const STATIC_KEY = `${CACHE_PFX}metsnews_static_latest`;
  const initCached = () => {
    try {
      const raw = localStorage.getItem(STATIC_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.items?.length) return parsed;
    } catch { /* ignore */ }
    return null;
  };

  const cached = initCached();
  const [articles, setArticles] = useState(cached?.items || []);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [source,   setSource]   = useState(cached?.label || '');
  const [lastUpdated, setLastUpdated] = useState(cached?.ts || null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const hourKey = new Date().toISOString().slice(0, 13);
    const forceRefresh = refreshToken > 0;
    setLoading(!cached?.items?.length || forceRefresh);
    setError(null);

    const extractThumbFromHtml = (html = '') => {
      if (!html) return null;
      try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const img = doc.querySelector('img');
        const src = img?.getAttribute('src') || '';
        return src && /^https?:\/\//i.test(src) ? src : null;
      } catch {
        return null;
      }
    };

    const parseXML = (text) => {
      try {
        const xml  = new DOMParser().parseFromString(text, 'text/xml');
        const items = [...xml.querySelectorAll('item, entry')];
        return items.slice(0, 20).map(el => {
          const t    = tag => el.querySelector(tag)?.textContent?.trim() || '';
          const attr = (sel, a) => { try { return el.querySelector(sel)?.getAttribute(a) || null; } catch { return null; } };
          const rawDesc = t('description');
          const thumb = attr('media\:content', 'url') || attr('media\:thumbnail', 'url') || attr('enclosure', 'url') || extractThumbFromHtml(rawDesc);
          const link  = t('link') || attr('link', 'href') || t('guid') || '';
          return {
            title:  t('title'),
            link,
            desc:   rawDesc.replace(/<[^>]*>/g, '').trim().slice(0, 200),
            date:   t('pubDate') || t('published') || t('updated'),
            thumb,
            author: t('author') || t('creator'),
          };
        }).filter(a => a.title && a.link);
      } catch { return []; }
    };

    const viaAllorigins = async (feedUrl, cacheKey) => {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
      const ck = `${CACHE_PFX}${cacheKey}_ao`;
      let text;
      try {
        if (!forceRefresh) {
          const cached = localStorage.getItem(ck);
          if (cached) { const { data, ts } = JSON.parse(cached); if (Date.now() - ts < 600_000) text = data; }
        }
      } catch { /* ignore */ }
      if (!text) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8_000);
        const resp = await fetch(proxyUrl, {
          signal: controller.signal,
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          cache: 'no-store',
          mode: 'cors',
        }).finally(() => clearTimeout(timeout));
        if (!resp.ok) throw new Error(`allorigins ${resp.status}`);
        text = await resp.text();
        try { localStorage.setItem(ck, JSON.stringify({ data: text, ts: Date.now() })); } catch { /* full */ }
      }
      const items = parseXML(text);
      if (!items.length) throw new Error('empty after parse');
      return items;
    };

    const viaRss2json = async (feedUrl, cacheKey) => {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
      const json = await cachedFetch(`${cacheKey}_r2j_${hourKey}_${refreshToken}`, apiUrl, forceRefresh ? 1 : 600_000);
      if (json.status !== 'ok' || !json.items?.length) throw new Error('rss2json non-ok');
      return json.items.slice(0, 20).map(i => ({
        title:  i.title?.trim() || '',
        link:   i.link?.trim()  || '',
        desc:   (i.description || i.content || '').replace(/<[^>]*>/g, '').trim().slice(0, 200),
        date:   i.pubDate || '',
        thumb:  i.thumbnail || i.enclosure?.link || extractThumbFromHtml(i.description || i.content || ''),
        author: i.author || '',
      })).filter(a => a.title && a.link);
    };

    const FEEDS = [
      { url: 'https://sny.tv/mets-feed',                         label: 'SNY',            key: 'sny'    },
      { url: 'https://feeds.fansided.com/amazinavenue/feed/',     label: "Amazin' Avenue", key: 'aa'     },
      { url: 'https://www.mlb.com/mets/news/rss.xml',            label: 'MLB.com',        key: 'mlb'    },
      { url: 'https://nypost.com/sports/baseball/mets/feed/',     label: 'NY Post',        key: 'nypost' },
    ];

    const trySequential = async (makeAttempts) => {
      for (const makeAttempt of makeAttempts) {
        try {
          const result = await makeAttempt();
          if (result?.items?.length) return result;
        } catch { /* try next */ }
      }
      return null;
    };

    const run = async () => {
      const viaAllOriginsAttempts = FEEDS.map(feed =>
        () => viaAllorigins(feed.url, `metsnews_${feed.key}_${hourKey}`).then(items => ({ items, label: feed.label }))
      );
      const aoResult = await trySequential(viaAllOriginsAttempts);
      if (aoResult) return aoResult;

      const viaRss2jsonAttempts = FEEDS.map(feed =>
        () => viaRss2json(feed.url, `metsnews_${feed.key}`).then(items => ({ items, label: feed.label }))
      );
      const r2jResult = await trySequential(viaRss2jsonAttempts);
      if (r2jResult) return r2jResult;

      throw new Error('All sources unavailable');
    };

    run()
      .then(({ items, label }) => {
        if (cancelled) return;
        const ts = Date.now();
        setArticles(items);
        setSource(label);
        setLastUpdated(ts);
        setLoading(false);
        try { localStorage.setItem(STATIC_KEY, JSON.stringify({ items, label, ts })); } catch { /* ignore */ }
      })
      .catch(e => {
        if (!cancelled) {
          setError(cached?.items?.length ? `Live refresh failed (${e.message}); showing cached feed.` : e.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [refreshToken]);

  const refresh = () => setRefreshToken(v => v + 1);

  return { articles, loading, error, source, refresh, lastUpdated };
}

// ─── MLB TEAM STATS HOOK ─────────────────────────────────────────────────────
// Fetches Mets team batting + pitching aggregate stats for the current season.
// Cached 60 minutes.
export function useMLBTeamStats() {
  const [batting,  setBatting]  = useState(null);
  const [pitching, setPitching] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;
    const season   = new Date().getFullYear();
    const todayStr = todayLocalStr();

    const hitUrl  = `https://statsapi.mlb.com/api/v1/teams/${METS_TEAM_ID}/stats`
      + `?stats=season&season=${season}&group=hitting&sportId=1`;
    const pitchUrl = `https://statsapi.mlb.com/api/v1/teams/${METS_TEAM_ID}/stats`
      + `?stats=season&season=${season}&group=pitching&sportId=1`;

    Promise.all([
      cachedFetch(`teamhit_${season}_${todayStr}`,   hitUrl,   3_600_000),
      cachedFetch(`teampitch_${season}_${todayStr}`, pitchUrl, 3_600_000),
    ]).then(([hitJson, pitchJson]) => {
      if (cancelled) return;
      setBatting( hitJson.stats?.[0]?.splits?.[0]?.stat  || null);
      setPitching(pitchJson.stats?.[0]?.splits?.[0]?.stat || null);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { batting, pitching, loading };
}

// ─── MLB GAME DETAIL HOOK ────────────────────────────────────────────────────
// Fetches linescore for a specific game. Pass null gamePk to skip.
// Cached 5 minutes.
export function useMLBGameDetail(gamePk) {
  const [linescore, setLinescore] = useState(null);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (!gamePk) return;
    let cancelled = false;
    setLoading(true);
    const url = `https://statsapi.mlb.com/api/v1/game/${gamePk}/linescore`;
    cachedFetch(`linescore_${gamePk}`, url, 300_000)
      .then(json => {
        if (cancelled) return;
        setLinescore(json);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [gamePk]);

  return { linescore, loading };
}
