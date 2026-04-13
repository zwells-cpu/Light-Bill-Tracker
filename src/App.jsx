import React, { useState, useCallback } from 'react'
import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'
import BillCard from './components/BillCard'
import ReminderModal from './components/ReminderModal'
import AddManual from './components/AddManual'
import { useGoogleAuth } from './hooks/useGoogleAuth'
import { useBills } from './hooks/useBills'
import { fetchMississippiPowerEmails } from './services/gmail'

const TABS = ['dashboard', 'bills', 'history', 'add']
const TAB_LABELS = { dashboard: '🏠', bills: '⚡', history: '📋', add: '➕' }
const TAB_NAMES  = { dashboard: 'Home', bills: 'Bills', history: 'History', add: 'Add' }

export default function App() {
  const auth = useGoogleAuth()
  const billsStore = useBills()
  const [tab, setTab] = useState('dashboard')
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const [syncMsg, setMsg] = useState(null)
  const [reminderBill, setReminderBill] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSync = useCallback(async () => {
    if (!auth.token) return
    setSyncing(true)
    setSyncError(null)
    try {
      const emails = await fetchMississippiPowerEmails(auth.token)
      const count = billsStore.mergeBills(emails)
      showToast(count > 0 ? `Found ${count} new bill email${count !== 1 ? 's' : ''}! ⚡` : 'Already up to date ✓')
    } catch (e) {
      if (e.message?.includes('401')) {
        auth.signOut()
        setSyncError('Session expired. Please sign in again.')
      } else {
        setSyncError('Sync failed. Check your connection and try again.')
      }
    } finally {
      setSyncing(false)
    }
  }, [auth, billsStore])

  if (!auth.isSignedIn) {
    return <LoginScreen onSignIn={auth.signIn} loading={auth.loading} error={auth.error} />
  }

  const { bills, unpaid, paid, nextDue, avgAmount, totalSpent, meta, togglePaid, setReminder, deleteBill, addManual, editBill } = billsStore

  return (
    <div style={s.app}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.heading}>⚡ <span style={{ color: 'var(--accent)' }}>Light Bill</span></h1>
          <p style={s.headingSub}>
            {auth.userEmail || 'Mississippi Power'} ·{' '}
            {meta.lastFetched
              ? `Synced ${new Date(meta.lastFetched).toLocaleDateString()}`
              : 'Not yet synced'}
          </p>
        </div>
        <div style={s.headerRight}>
          <button style={s.syncBtn} onClick={handleSync} disabled={syncing}>
            <span style={syncing ? { display: 'inline-block', animation: 'spin 1s linear infinite' } : {}}>⟳</span>
            {syncing ? 'Syncing…' : 'Sync'}
          </button>
          <button style={s.avatarBtn} onClick={auth.signOut} title="Sign out">
            {auth.userEmail?.[0]?.toUpperCase() || '?'}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {syncError && (
        <div style={s.errorBanner}>
          ⚠️ {syncError}
          <button style={s.dismissBtn} onClick={() => setSyncError(null)}>✕</button>
        </div>
      )}

      {/* Content */}
      <div style={s.content}>
        {tab === 'dashboard' && (
          <Dashboard bills={bills} unpaid={unpaid} paid={paid} nextDue={nextDue} avgAmount={avgAmount} totalSpent={totalSpent} />
        )}

        {tab === 'bills' && (
          <div style={s.list}>
            <div style={s.listHeader}>
              <span style={s.listTitle}>Unpaid Bills</span>
              <span style={s.listCount}>{unpaid.length}</span>
            </div>
            {unpaid.length === 0
              ? <Empty icon="🎉" title="All caught up!" sub="No unpaid bills. Tap Sync to check for new ones." />
              : unpaid.map(b => (
                  <BillCard key={b.id} bill={b} onPay={togglePaid} onRemind={setReminderBill} onDelete={deleteBill} onEdit={editBill} />
                ))
            }
          </div>
        )}

        {tab === 'history' && (
          <div style={s.list}>
            <div style={s.listHeader}>
              <span style={s.listTitle}>All Bills</span>
              <span style={s.listCount}>{bills.length}</span>
            </div>
            {bills.length === 0
              ? <Empty icon="📋" title="No history yet" sub="Bills will appear here after syncing." />
              : [...bills]
                  .sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''))
                  .map(b => (
                    <BillCard key={b.id} bill={b} onPay={togglePaid} onRemind={setReminderBill} onDelete={deleteBill} onEdit={editBill} />
                  ))
            }
          </div>
        )}

        {tab === 'add' && (
          <AddManual onAdd={(form) => { addManual(form); showToast('Bill added! ✓'); setTab('bills') }} />
        )}
      </div>

      {/* Bottom nav */}
      <nav style={s.nav}>
        {TABS.map(t => (
          <button key={t} style={{ ...s.navBtn, ...(tab === t ? s.navBtnActive : {}) }} onClick={() => setTab(t)}>
            <span style={s.navIcon}>{TAB_LABELS[t]}</span>
            <span style={s.navLabel}>{TAB_NAMES[t]}</span>
          </button>
        ))}
      </nav>

      {/* Reminder modal */}
      {reminderBill && (
        <ReminderModal
          bill={reminderBill}
          onSave={(id, days) => { setReminder(id, days); showToast(`Reminder set for ${days} day${days !== 1 ? 's' : ''} before! 🔔`) }}
          onClose={() => setReminderBill(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, borderColor: toast.type === 'error' ? 'var(--red)' : 'var(--green)', color: toast.type === 'error' ? 'var(--red)' : 'var(--green)' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function Empty({ icon, title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 20px', color: 'var(--text)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
      <h3 style={{ marginBottom: 8, fontSize: '1rem' }}>{title}</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{sub}</p>
    </div>
  )
}

const s = {
  app: {
    minHeight: '100vh',
    maxWidth: 480,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
    backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(245,183,48,0.07) 0%, transparent 60%)',
    paddingTop: 'var(--safe-top)',
    paddingBottom: 'calc(64px + var(--safe-bottom))',
  },
  header: {
    padding: '18px 20px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border)',
  },
  heading: { fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' },
  headingSub: { fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 3 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  syncBtn: {
    background: 'var(--accent)', color: '#000', border: 'none',
    padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
  },
  avatarBtn: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
  },
  errorBanner: {
    background: 'rgba(244,91,105,0.08)', borderBottom: '1px solid rgba(244,91,105,0.3)',
    padding: '10px 20px', fontSize: '0.82rem', color: 'var(--red)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  dismissBtn: { background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '0.9rem' },
  content: { flex: 1, padding: '16px 16px 0', overflowY: 'auto' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  listHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  listTitle: { fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' },
  listCount: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 20, padding: '1px 9px', fontSize: '0.72rem',
    color: 'var(--accent)', fontFamily: 'var(--mono)',
  },
  nav: {
    position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
    width: '100%', maxWidth: 480,
    background: 'var(--surface)', borderTop: '1px solid var(--border)',
    display: 'flex', paddingBottom: 'var(--safe-bottom)',
    zIndex: 50,
  },
  navBtn: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 3, padding: '10px 4px', background: 'none', border: 'none',
    color: 'var(--muted)', cursor: 'pointer', transition: 'color 0.15s',
  },
  navBtnActive: { color: 'var(--accent)' },
  navIcon: { fontSize: '1.2rem' },
  navLabel: { fontSize: '0.62rem', fontFamily: 'var(--mono)', letterSpacing: '0.05em' },
  toast: {
    position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
    background: 'var(--surface2)', border: '1px solid',
    padding: '10px 22px', borderRadius: 30,
    fontSize: '0.82rem', zIndex: 300,
    animation: 'slideUp 0.25s ease', whiteSpace: 'nowrap',
  },
}
