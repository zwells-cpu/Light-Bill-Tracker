import React, { useState } from 'react'
import { formatDate, getReminderDate } from '../utils'

export default function ReminderModal({ bill, onSave, onClose }) {
  const [days, setDays] = useState(bill.reminder || 3)

  const reminderDate = getReminderDate(bill.dueDate, days)

  const handleSave = () => {
    onSave(bill.id, days)
    onClose()
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.icon}>🔔</div>
        <h2 style={s.title}>Set a Reminder</h2>
        <p style={s.sub}>
          {bill.amount != null ? `$${bill.amount.toFixed(2)} · ` : ''}
          Due {formatDate(bill.dueDate)}
        </p>

        <div style={s.field}>
          <label style={s.label}>Remind me how many days before?</label>
          <div style={s.options}>
            {[1, 2, 3, 5, 7, 10].map(d => (
              <button
                key={d}
                style={{ ...s.dayBtn, ...(days === d ? s.dayBtnActive : {}) }}
                onClick={() => setDays(d)}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {reminderDate && (
          <div style={s.reminderResult}>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Reminder on</span>
            <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
              {formatDate(reminderDate)}
            </span>
          </div>
        )}

        <p style={s.note}>
          💡 Add this date to your phone calendar for a real notification.
        </p>

        <div style={s.actions}>
          <button style={s.btnPrimary} onClick={handleSave}>Save Reminder</button>
          <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    zIndex: 200, padding: '0 0 var(--safe-bottom)',
  },
  modal: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px 20px 0 0',
    padding: '24px 24px 32px',
    width: '100%',
    maxWidth: 480,
    animation: 'fadeIn 0.2s ease',
  },
  icon: { fontSize: '2rem', marginBottom: 8 },
  title: { fontSize: '1.15rem', fontWeight: 700, marginBottom: 4 },
  sub: { color: 'var(--muted)', fontSize: '0.82rem', fontFamily: 'var(--mono)', marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 10 },
  options: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  dayBtn: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--muted)', padding: '8px 16px', borderRadius: 8,
    fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--mono)',
    transition: 'all 0.15s',
  },
  dayBtnActive: {
    background: 'rgba(245,183,48,0.15)', borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
  reminderResult: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px', marginBottom: 12,
  },
  note: {
    fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 20,
    background: 'var(--surface2)', padding: '10px 14px', borderRadius: 8,
  },
  actions: { display: 'flex', gap: 10 },
  btnPrimary: {
    flex: 1, background: 'var(--accent)', color: '#000', border: 'none',
    padding: 12, borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
  },
  btnSecondary: {
    flex: 1, background: 'var(--surface2)', color: 'var(--text)',
    border: '1px solid var(--border)', padding: 12, borderRadius: 10,
    fontSize: '0.9rem', cursor: 'pointer',
  },
}
