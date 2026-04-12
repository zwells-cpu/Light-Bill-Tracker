import React from 'react'
import { daysUntil, formatDate, formatCurrency } from '../utils'

export default function Dashboard({ bills, unpaid, paid, nextDue, avgAmount, totalSpent }) {
  const chartBills = [...bills].filter(b => b.amount).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')).slice(-8)
  const chartMax = Math.max(...chartBills.map(b => b.amount), 1)

  const days = nextDue ? daysUntil(nextDue.dueDate) : null

  return (
    <div style={s.wrap}>
      {/* Next Due Alert */}
      {nextDue && (
        <div style={{
          ...s.alert,
          borderColor: days !== null && days <= 5 ? 'rgba(244,91,105,0.4)' : 'rgba(245,183,48,0.3)',
          background: days !== null && days <= 5 ? 'rgba(244,91,105,0.06)' : 'rgba(245,183,48,0.06)',
        }}>
          <span style={s.alertIcon}>💡</span>
          <div>
            <strong style={{ color: days !== null && days <= 5 ? 'var(--red)' : 'var(--accent)', fontSize: '0.9rem' }}>
              Next Payment Due
            </strong>
            <p style={s.alertSub}>
              {nextDue.amount ? `${formatCurrency(nextDue.amount)} · ` : ''}
              {formatDate(nextDue.dueDate)}
              {days !== null && ` · ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ${days < 0 ? 'overdue' : 'away'}`}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Total Bills', value: bills.length, color: 'var(--accent)' },
          { label: 'Unpaid', value: unpaid.length, color: 'var(--red)' },
          { label: 'Paid', value: paid.length, color: 'var(--green)' },
          { label: 'Avg Bill', value: avgAmount ? formatCurrency(avgAmount) : '—', color: 'var(--accent)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={s.statCard}>
            <div style={s.statLabel}>{label}</div>
            <div style={{ ...s.statValue, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartBills.length > 0 && (
        <div style={s.chartCard}>
          <div style={s.chartTitle}>📊 Bill History</div>
          <div style={s.chartBars}>
            {chartBills.map(b => (
              <div key={b.id} style={s.chartCol}>
                <div style={s.chartBarWrap}>
                  <div
                    style={{
                      ...s.chartBar,
                      height: `${(b.amount / chartMax) * 80}px`,
                      background: b.paid ? 'var(--green)' : 'var(--accent)',
                      opacity: b.paid ? 0.8 : 1,
                    }}
                    title={formatCurrency(b.amount)}
                  />
                </div>
                <div style={s.chartLbl}>{b.dueDate ? b.dueDate.slice(5) : '?'}</div>
              </div>
            ))}
          </div>
          <div style={s.chartLegend}>
            <span><span style={{ ...s.dot, background: 'var(--green)' }} /> Paid</span>
            <span><span style={{ ...s.dot, background: 'var(--accent)' }} /> Unpaid</span>
          </div>
        </div>
      )}

      {/* Total spent */}
      {totalSpent > 0 && (
        <div style={s.totalCard}>
          <span style={s.totalLabel}>Total paid this year</span>
          <span style={s.totalValue}>{formatCurrency(totalSpent)}</span>
        </div>
      )}

      {bills.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚡</div>
          <h3 style={{ marginBottom: 8 }}>No bills yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>
            Tap <strong>Sync Gmail</strong> to pull in your Mississippi Power emails.
          </p>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 14 },
  alert: {
    background: 'rgba(245,183,48,0.06)',
    border: '1px solid rgba(245,183,48,0.3)',
    borderRadius: 12,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  alertIcon: { fontSize: '1.4rem', flexShrink: 0 },
  alertSub: { color: 'var(--muted)', fontSize: '0.8rem', marginTop: 3, fontFamily: 'var(--mono)' },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  statCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '14px 16px',
  },
  statLabel: { fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' },
  statValue: { fontSize: '1.5rem', fontWeight: 700, marginTop: 4, fontFamily: 'var(--mono)' },
  chartCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '16px',
  },
  chartTitle: { fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)', marginBottom: 14 },
  chartBars: { display: 'flex', alignItems: 'flex-end', gap: 6, height: 96 },
  chartCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  chartBarWrap: { width: '100%', display: 'flex', alignItems: 'flex-end', height: 80 },
  chartBar: { width: '100%', borderRadius: '3px 3px 0 0', minHeight: 4, transition: 'height 0.4s ease' },
  chartLbl: { fontSize: '0.58rem', color: 'var(--muted)', fontFamily: 'var(--mono)', textAlign: 'center' },
  chartLegend: { display: 'flex', gap: 16, marginTop: 10, fontSize: '0.74rem', color: 'var(--muted)' },
  dot: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 4 },
  totalCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { fontSize: '0.82rem', color: 'var(--muted)' },
  totalValue: { fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--mono)' },
  empty: { textAlign: 'center', padding: '48px 20px', color: 'var(--text)' },
}
