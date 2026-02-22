import { useState } from 'react';
import { useMLBTransactions } from '../hooks.js';

// Transaction type display config
const TXN_TYPES = {
  'Option':             { label: 'Optioned to AAA',      icon: '⬇', dir: 'down', color: 'var(--loss)' },
  'Recall':             { label: 'Recalled to Majors',   icon: '⬆', dir: 'up',   color: 'var(--win)'  },
  'DFA':                { label: 'Designated for Assign',icon: '⚠', dir: 'out',  color: 'var(--gold)' },
  'Release':            { label: 'Released',              icon: '🚪', dir: 'out', color: 'var(--muted)'},
  'Signed':             { label: 'Signed',                icon: '✍', dir: 'in',  color: 'var(--blue3)'},
  'Contract_Selected':  { label: 'Selected to Roster',   icon: '⬆', dir: 'up',  color: 'var(--win)'  },
  'Outrighted_To_Minors':{ label: 'Outrighted to Minors',icon: '⬇', dir: 'down',color: 'var(--loss)' },
  'Transfer':           { label: 'Transferred',           icon: '↔', dir: 'out', color: 'var(--muted)'},
  'Claimed_Off_Waivers':{ label: 'Claimed off Waivers',  icon: '🎯', dir: 'in',  color: 'var(--blue3)'},
  'Free_Agent':         { label: 'Filed for Free Agency', icon: '🏷', dir: 'out', color: 'var(--muted)'},
};

function daysSince(dateStr) {
  if (!dateStr) return '—';
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Determine who is currently in AAA:
// Find each player's latest transaction — if it's an Option/Outrighted, they're in AAA
const AAA_DOWN_TYPES = new Set(['Option', 'Outrighted_To_Minors']);
const AAA_UP_TYPES   = new Set(['Recall', 'Contract_Selected', 'Release', 'DFA', 'Free_Agent']);

function buildAAAState(transactions) {
  const playerLatest = {}; // id → latest txn
  // transactions are already sorted newest-first; reverse to process oldest-first
  for (const t of [...transactions].reverse()) {
    const id = t.person?.id;
    if (id) playerLatest[id] = t;
  }
  const inAAA    = Object.values(playerLatest).filter(t => AAA_DOWN_TYPES.has(t.typeCode));
  const recalled = Object.values(playerLatest).filter(t => AAA_UP_TYPES.has(t.typeCode));
  return { inAAA, recalled };
}

export default function AAAView() {
  const [daysBack, setDaysBack] = useState(90);
  const { transactions, loading, error } = useMLBTransactions(daysBack);

  const moves  = transactions.filter(t => Object.keys(TXN_TYPES).includes(t.typeCode));
  const { inAAA } = buildAAAState(transactions);

  // Find the last "Option" date for each player in AAA
  const lastOptionDate = {};
  for (const t of [...transactions].reverse()) {
    if (AAA_DOWN_TYPES.has(t.typeCode) && t.person?.id) {
      lastOptionDate[t.person.id] = t.effectiveDate || t.date;
    }
  }

  return (
    <div>
      <div className="page-hdr">
        <div className="page-title">🔄 AAA Tracker</div>
        <div className="page-sub">Syracuse Mets · Roster Transactions · Real-Time</div>
      </div>

      {/* Filter range */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[30, 60, 90, 180].map(d => (
          <button
            key={d}
            className={`btn btn-sm ${daysBack === d ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setDaysBack(d)}
          >
            Last {d} days
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ color: 'var(--muted)', fontSize: '0.8rem', padding: '2rem 0', textAlign: 'center' }}>
          Loading transactions…
        </div>
      )}
      {error && (
        <div style={{ color: 'var(--loss)', fontSize: '0.8rem', padding: '1rem', background: 'rgba(255,68,68,0.06)', borderRadius: 6, marginBottom: '1rem' }}>
          ⚠ Could not load transactions: {error}
        </div>
      )}

      {!loading && (
        <>
          {/* ── Currently in AAA ── */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-title">🏟️ Currently at Syracuse ({inAAA.length})</div>
            {inAAA.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem', padding: '0.5rem 0' }}>
                No optioned players found in this window — everyone is on the 40-man!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {inAAA.map(t => {
                  const sentDown = lastOptionDate[t.person?.id];
                  const days     = sentDown ? Math.floor((Date.now() - new Date(sentDown)) / 86400000) : null;
                  return (
                    <div key={t.person?.id || t.id} className="aaa-player-row">
                      <div className="aaa-arrow aaa-down">⬇</div>
                      <div className="aaa-info">
                        <div className="aaa-name">{t.person?.fullName || 'Unknown'}</div>
                        <div className="aaa-meta">
                          {TXN_TYPES[t.typeCode]?.label || t.typeCode}
                          {sentDown && <> · Since {fmtDate(sentDown)}</>}
                        </div>
                      </div>
                      {days !== null && (
                        <div className="aaa-days">
                          <span className="aaa-days-num">{days}</span>
                          <span className="aaa-days-lbl">days</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Transaction Timeline ── */}
          <div className="card">
            <div className="card-title">📋 Transaction Log ({moves.length})</div>
            {moves.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem', padding: '0.5rem 0' }}>
                No transactions found in this window.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {moves.map((t, i) => {
                  const cfg   = TXN_TYPES[t.typeCode] || { icon: '•', label: t.typeCode, color: 'var(--muted)' };
                  const isUp  = cfg.dir === 'up';
                  const isIn  = cfg.dir === 'in';
                  const date  = t.effectiveDate || t.date;
                  return (
                    <div key={t.id || i} className={`txn-row ${isUp || isIn ? 'txn-up' : 'txn-down'}`}>
                      <div className="txn-icon" style={{ color: cfg.color }}>{cfg.icon}</div>
                      <div className="txn-body">
                        <div className="txn-name">{t.person?.fullName || '—'}</div>
                        <div className="txn-label">{cfg.label}</div>
                      </div>
                      <div className="txn-right">
                        <div className="txn-date">{fmtDate(date)}</div>
                        <div className="txn-ago">{daysSince(date)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
