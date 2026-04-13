import React, { useState } from 'react'
import { daysUntil, formatDate, formatCurrency, getBillStatus } from '../utils'

const STATUS_CONFIG = {
  paid:     { label: '✓ Paid',    bg: 'rgba(52,209,122,0.12)',  color: 'var(--green)'  },
  overdue:  { label: 'Overdue',   bg: 'rgba(244,91,105,0.12)',  color: 'var(--red)'    },
  urgent:   { label: 'Due Soon',  bg: 'rgba(245,128,58,0.12)',  color: 'var(--orange)' },
  upcoming: { label: 'Upcoming',  bg: 'rgba(91,156,245,0.1)',   color: 'var(--blue)'   },
  unknown:  { label: 'Unknown',   bg: 'rgba(107,117,145,0.12)', color: 'var(--muted)'  },
}

export default function BillCard({ bill, onPay, onRemind, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    amount: bill.amount ?? '',
    dueDate: bill.dueDate ?? '',
    note: bill.billingPeriod ?? '',
    ignore: bill.ignore ?? false,
  })

  const status = getBillStatus(bill)
  const cfg = STATUS_CONFIG[status]
  const days = daysUntil(bill.dueDate)

  const handleSave = () => {
    onEdit(bill.id, {
      amount: form.amount !== '' ? parseFloat(form.amount) : null,
      dueDate: form.dueDate || null,
      billingPeriod: form.note || null,
      ignore: form.ignore,
    })
    setEditing(false)
  }

  if (bill.ignore) return null

  return (
    <div style={{ ...s.card, opacity: bill.paid ? 0.65 : 1, borderColor: editing ? 'var(--accent)' : 'var(--border)' }}>
      <div style={s.top}>
        <span style={s.icon}>{bill.paid ? '✅' : '⚡'}</span>
        <div style={s.info}>
          <div style={s.subject}>{bill.subject}</div>
          <div style={s.meta}>
            {bill.billingPeriod ? `${bill.billingPeriod} · ` : ''}
            {bill.emailDate ? `Received ${formatDate(bill.emailDate, true)}` : ''}
            {bill.paid && bill.paidDate ? ` · Paid ${formatDate(bill.paidDate, true)}` : ''}
          </div>
        </div>
        <div style={s.right}>
          {bill.amount != null && <div style={s.amount}>{formatCurrency(bill.amount)}</div>}
          <div style={s.dueLabel}>Due {formatDate(bill.dueDate, true)}</div>
          <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div style={s.editForm}>
          <div style={s.editRow}>
            <div style={s.editField}>
              <label style={s.editLabel}>Amount ($)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                style={s.editInput}
                placeholder="0.00"
              />
            </div>
            <div style={s.editField}>
              <label style={s.editLabel}>Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                style={s.editInput}
              />
            </div>
          </div>
          <div style={s.editField}>
            <label style={s.editLabel}>Note</label>
            <input
              type="text"
              value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              style={s.editInput}
              placeholder="e.g. June billing cycle"
            />
          </div>
          <div style={s.ignoreRow}>
            <input
              type="checkbox"
              id={`ignore-${bill.id}`}
              checked={form.ignore}
              onChange={e => setForm(p => ({ ...p, ignore: e.target.checked }))}
              style={{ accentColor: 'var(--accent)', width: 14, height: 14 }}
            />
            <label htmlFor={`ignore-${bill.id}`} style={s.ignoreLabel}>
              Hide this bill (e.g. "thanks for payment" confirmation email)
            </label>
          </div>
          <div style={s.editActions}>
            <button style={s.btnSave} onClick={handleSave}>Save ✓</button>
            <button style={s.btnCancel} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Days remaining bar */}
      {!bill.paid && !editing && days !== null && days >= 0 && days <= 30 && (
        <div style={s.progressWrap}>
          <div style={{ ...s.progressBar, width: `${Math.max(4, (days / 30) * 100)}%`, background: days <= 5 ? 'var(--red)' : days <= 10 ? 'var(--orange)' : 'var(--accent)' }} />
        </div>
      )}

      <div style={s.actions}>
        {!bill.paid ? (
          <>
            <button style={s.btnPay} onClick={() => onPay(bill.id)}>Mark Paid ✓</button>
            <button style={s.btnRemind} onClick={() => onRemind(bill)}>🔔</button>
          </>
        ) : (
          <button style={s.btnUndo} onClick={() => onPay(bill.id)}>Undo</button>
        )}
        <button style={s.btnEdit} onClick={() => setEditing(p => !p)}>✏️</button>
        <button style={s.btnDelete} onClick={() => onDelete(bill.id)}>✕</button>
      </div>
    </div>
  )
}

const s = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '14px 16px',
    transition: 'border-color 0.15s',
    animation: 'fadeIn 0.3s ease',
  },
  top: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  icon: { fontSize: '1.3rem', flexShrink: 0, marginTop: 2 },
  info: { flex: 1, minWidth: 0 },
  subject: { fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { fontSize: '0.72rem', color: 'var(--muted)', marginTop: 3, fontFamily: 'var(--mono)' },
  right: { textAlign: 'right', flexShrink: 0 },
  amount: { fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' },
  dueLabel: { fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 },
  badge: { display: 'inline-block', fontSize: '0.65rem', padding: '2px 8px', borderRadius: 20, marginTop: 4, fontFamily: 'var(--mono)', fontWeight: 500 },
  progressWrap: { height: 3, background: 'var(--border)', borderRadius: 2, marginBottom: 10, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },
  actions: { display: 'flex', gap: 8, alignItems: 'center' },
  btnPay: {
    background: 'var(--green)', color: '#000', border: 'none',
    padding: '7px 16px', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600,
    cursor: 'pointer', transition: 'opacity 0.15s',
  },
  btnRemind: {
    background: 'rgba(91,156,245,0.1)', color: 'var(--blue)',
    border: '1px solid rgba(91,156,245,0.25)', padding: '7px 10px',
    borderRadius: 7, fontSize: '0.8rem', cursor: 'pointer',
  },
  btnUndo: {
    background: 'var(--surface2)', color: 'var(--muted)',
    border: '1px solid var(--border)', padding: '7px 14px',
    borderRadius: 7, fontSize: '0.78rem', cursor: 'pointer',
  },
  btnEdit: {
    background: 'rgba(245,183,48,0.1)', color: 'var(--accent)',
    border: '1px solid rgba(245,183,48,0.25)', padding: '7px 10px',
    borderRadius: 7, fontSize: '0.8rem', cursor: 'pointer',
  },
  btnDelete: {
    marginLeft: 'auto', background: 'none', border: 'none',
    color: 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem',
    padding: '4px 6px', transition: 'color 0.15s',
  },
  editForm: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '12px', marginBottom: 10,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  editRow: { display: 'flex', gap: 10 },
  editField: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  editLabel: { fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'var(--mono)' },
  editInput: {
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 6, padding: '7px 10px', color: 'var(--text)',
    fontSize: '0.84rem', outline: 'none', width: '100%',
  },
  ignoreRow: { display: 'flex', alignItems: 'center', gap: 8 },
  ignoreLabel: { fontSize: '0.74rem', color: 'var(--muted)', cursor: 'pointer' },
  editActions: { display: 'flex', gap: 8 },
  btnSave: {
    background: 'var(--accent)', color: '#000', border: 'none',
    padding: '7px 18px', borderRadius: 7, fontSize: '0.82rem',
    fontWeight: 600, cursor: 'pointer',
  },
  btnCancel: {
    background: 'var(--surface)', color: 'var(--muted)',
    border: '1px solid var(--border)', padding: '7px 14px',
    borderRadius: 7, fontSize: '0.82rem', cursor: 'pointer',
  },
}
