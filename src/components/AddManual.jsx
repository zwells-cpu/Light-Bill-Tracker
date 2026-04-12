import React, { useState } from 'react'

export default function AddManual({ onAdd }) {
  const [form, setForm] = useState({ amount: '', dueDate: '', note: '' })
  const [added, setAdded] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleAdd = () => {
    if (!form.amount && !form.dueDate) return
    onAdd(form)
    setForm({ amount: '', dueDate: '', note: '' })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <h2 style={s.title}>Add Bill Manually</h2>
        <p style={s.sub}>Can't find an email? Enter the bill details yourself.</p>
      </div>

      <div style={s.card}>
        <div style={s.field}>
          <label style={s.label}>Amount Due</label>
          <div style={s.inputWrap}>
            <span style={s.prefix}>$</span>
            <input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              style={{ ...s.input, paddingLeft: 32 }}
            />
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)}
            style={s.input}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Note (optional)</label>
          <input
            type="text"
            placeholder="e.g. June billing cycle"
            value={form.note}
            onChange={e => set('note', e.target.value)}
            style={s.input}
          />
        </div>

        <button
          style={{ ...s.btn, background: added ? 'var(--green)' : 'var(--accent)' }}
          onClick={handleAdd}
          disabled={!form.amount && !form.dueDate}
        >
          {added ? '✓ Bill Added!' : '+ Add Bill'}
        </button>
      </div>

      <div style={s.tip}>
        <span style={s.tipIcon}>💡</span>
        <p style={s.tipText}>
          Mississippi Power typically sends bill emails from <strong>no-reply@mississippipower.com</strong>. 
          Make sure that address isn't in your spam folder!
        </p>
      </div>
    </div>
  )
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16 },
  header: { marginBottom: 4 },
  title: { fontSize: '1.1rem', fontWeight: 700 },
  sub: { color: 'var(--muted)', fontSize: '0.82rem', marginTop: 4 },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
  },
  field: {},
  label: { fontSize: '0.76rem', color: 'var(--muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--mono)' },
  inputWrap: { position: 'relative' },
  prefix: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontFamily: 'var(--mono)' },
  input: {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 12px', color: 'var(--text)',
    fontSize: '0.9rem', outline: 'none',
    WebkitAppearance: 'none',
  },
  btn: {
    width: '100%', color: '#000', border: 'none',
    padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: '0.92rem',
    cursor: 'pointer', transition: 'background 0.3s',
  },
  tip: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 10,
  },
  tipIcon: { fontSize: '1.1rem', flexShrink: 0 },
  tipText: { fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 },
}
