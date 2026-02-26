import { useMemo, useState } from 'react';
import { useMetsNewsFeed, useMLBTransactions } from '../hooks.js';

const BOOKMARK_KEY = 'metsHQ_feed_bookmarks_v1';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const then = new Date(dateStr);
  if (isNaN(then)) return dateStr;
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtDate(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function normalizeLink(link = '') {
  try {
    const u = new URL(link);
    u.searchParams.forEach((_, k) => {
      if (k.toLowerCase().startsWith('utm_') || ['fbclid', 'gclid'].includes(k.toLowerCase())) u.searchParams.delete(k);
    });
    return u.toString();
  } catch {
    return String(link || '').trim();
  }
}

function detectTopic(article) {
  const txt = `${article.title || ''} ${article.desc || ''}`.toLowerCase();
  if (/(injur|il\b|day-to-day|rehab)/.test(txt)) return 'Injury';
  if (/(trade|waiver|dfa|option|recall|signed|roster|call-up)/.test(txt)) return 'Roster';
  if (/(prospect|farm|aaa|syracuse|draft)/.test(txt)) return 'Prospects';
  if (/(preview|game thread|series opener|probable pitchers)/.test(txt)) return 'Preview';
  return 'Recap';
}

function readBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBookmarks(items) {
  try { localStorage.setItem(BOOKMARK_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

const TXN_ICONS = {
  Option: '⬇', Recall: '⬆', DFA: '⚠', Release: '🚪', Signed: '✍', Contract_Selected: '⬆', Outrighted_To_Minors: '⬇', Transfer: '↔', Claimed_Off_Waivers: '🎯',
};
const TXN_LABELS = {
  Option: 'Optioned to AAA', Recall: 'Recalled from AAA', DFA: 'Designated for Assignment', Release: 'Released', Signed: 'Signed', Contract_Selected: 'Selected to Roster', Outrighted_To_Minors: 'Outrighted to Minors', Transfer: 'Transferred', Claimed_Off_Waivers: 'Claimed off Waivers',
};

export default function FeedView() {
  const { articles, loading: newsLoading, error: newsError, source } = useMetsNewsFeed();
  const { transactions, loading: txnLoading } = useMLBTransactions(30);

  const [bookmarks, setBookmarks] = useState(readBookmarks());
  const [topicFilter, setTopicFilter] = useState('All');

  const recentTxns = transactions.filter(t => TXN_ICONS[t.typeCode]).slice(0, 8);

  const processed = useMemo(() => {
    const seen = new Set();
    const list = [];

    for (const a of articles || []) {
      const key = normalizeLink(a.link) || (a.title || '').toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const topic = detectTopic(a);
      const bookmarked = bookmarks.includes(key);
      list.push({ ...a, normLink: key, topic, bookmarked });
    }
    return list;
  }, [articles, bookmarks]);

  const availableTopics = useMemo(() => ['All', 'Bookmarked', ...Array.from(new Set(processed.map(a => a.topic)))], [processed]);
  const shownArticles = processed.filter(a => topicFilter === 'All' ? true : topicFilter === 'Bookmarked' ? a.bookmarked : a.topic === topicFilter);

  const toggleBookmark = article => {
    const next = bookmarks.includes(article.normLink)
      ? bookmarks.filter(b => b !== article.normLink)
      : [article.normLink, ...bookmarks].slice(0, 120);
    setBookmarks(next);
    writeBookmarks(next);
  };

  return (
    <div>
      <div className="page-hdr">
        <div className="page-title">📰 Mets Feed</div>
        <div className="page-sub">{source ? `Via ${source}` : 'SNY · Amazin\' Avenue · MLB.com · NY Post'} · Recent roster moves · No login required</div>
      </div>

      <div className="feed-layout">
        <div className="feed-main">
          <div className="card-title" style={{ marginBottom: '0.8rem' }}>⚾ Latest Mets News</div>

          {!newsLoading && !newsError && processed.length > 0 && (
            <div className="feed-toolbar">
              {availableTopics.map(t => (
                <button key={t} type="button" className={`feed-chip ${topicFilter === t ? 'active' : ''}`} onClick={() => setTopicFilter(t)}>{t}</button>
              ))}
              <span className="feed-count">{shownArticles.length} shown · {processed.length} deduped</span>
            </div>
          )}

          {newsLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{[...Array(5)].map((_, i) => <div key={i} style={{ height: '90px', borderRadius: 8 }} className="loading-shimmer" />)}</div>
          )}

          {newsError && !newsLoading && (
            <div className="feed-error">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📡</div>
              <div style={{ fontFamily: 'Oswald', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.25rem' }}>Feed Temporarily Unavailable</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                Could not reach any news source right now. Check back in a few minutes or visit <a href="https://sny.tv/mets" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>SNY.tv</a> or <a href="https://amazinavenue.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>Amazin' Avenue</a> directly.
              </div>
            </div>
          )}

          {!newsLoading && !newsError && shownArticles.length === 0 && (
            <div className="feed-error"><div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📭</div><div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>No articles found for this filter.</div></div>
          )}

          {!newsLoading && shownArticles.map((a, i) => (
            <a key={`${a.normLink}-${i}`} href={a.link || '#'} target="_blank" rel="noopener noreferrer" className="feed-article">
              {a.thumb && <img src={a.thumb} alt="" className="feed-thumb" onError={e => { e.target.style.display = 'none'; }} />}
              <div className="feed-article-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div className="feed-article-title">{a.title}</div>
                  <button
                    type="button"
                    className={`feed-bookmark ${a.bookmarked ? 'active' : ''}`}
                    onClick={e => { e.preventDefault(); e.stopPropagation(); toggleBookmark(a); }}
                    aria-label={a.bookmarked ? 'Remove bookmark' : 'Bookmark article'}
                  >
                    {a.bookmarked ? '★' : '☆'}
                  </button>
                </div>
                {a.desc && <div className="feed-article-desc">{a.desc.slice(0, 140)}{a.desc.length > 140 ? '…' : ''}</div>}
                <div className="feed-article-meta">{a.topic} · {timeAgo(a.date)}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="feed-sidebar">
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div className="card-title">🔄 Recent Moves</div>
            {txnLoading && <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Loading…</div>}
            {!txnLoading && recentTxns.length === 0 && <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>No transactions in the last 30 days.</div>}
            {!txnLoading && recentTxns.map((t, i) => {
              const isUp = ['Recall', 'Contract_Selected', 'Claimed_Off_Waivers', 'Signed'].includes(t.typeCode);
              return (
                <div key={t.id || i} className={`feed-txn-row ${isUp ? 'feed-txn-up' : 'feed-txn-down'}`}>
                  <div className="feed-txn-icon">{TXN_ICONS[t.typeCode] || '•'}</div>
                  <div className="feed-txn-body">
                    <div className="feed-txn-name">{t.person?.fullName || '—'}</div>
                    <div className="feed-txn-type">{TXN_LABELS[t.typeCode] || t.typeCode}</div>
                    <div className="feed-txn-date">{fmtDate(t.effectiveDate || t.date)}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.52rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              Data: MLB Stats API (public) · transactions.mlb.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
