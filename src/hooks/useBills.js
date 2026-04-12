import { useState, useEffect } from 'react'

const BILLS_KEY = 'light-bill-tracker-bills-v2'
const META_KEY = 'light-bill-tracker-meta-v2'

const DEFAULT_META = { lastFetched: null }

export function useBills() {
  const [bills, setBills] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BILLS_KEY)) || [] } catch { return [] }
  })
  const [meta, setMeta] = useState(() => {
    try { return JSON.parse(localStorage.getItem(META_KEY)) || DEFAULT_META } catch { return DEFAULT_META }
  })

  useEffect(() => { localStorage.setItem(BILLS_KEY, JSON.stringify(bills)) }, [bills])
  useEffect(() => { localStorage.setItem(META_KEY, JSON.stringify(meta)) }, [meta])

  const mergeBills = (fetched) => {
    setBills(prev => {
      const existingIds = new Set(prev.map(b => b.id))
      const newOnes = fetched
        .filter(b => !existingIds.has(b.id))
        .map(b => ({ ...b, paid: false, paidDate: null, source: 'gmail', reminder: null }))
      const merged = [...newOnes, ...prev]
      merged.sort((a, b) => (b.dueDate || b.emailDate || '').localeCompare(a.dueDate || a.emailDate || ''))
      return merged
    })
    setMeta({ lastFetched: new Date().toISOString() })
    return fetched.length
  }

  const addManual = ({ amount, dueDate, note }) => {
    const bill = {
      id: `manual-${Date.now()}`,
      subject: 'Mississippi Power Bill',
      from: 'manual',
      emailDate: new Date().toISOString().split('T')[0],
      amount: amount ? parseFloat(amount) : null,
      dueDate: dueDate || null,
      billingPeriod: note || null,
      paid: false,
      paidDate: null,
      source: 'manual',
      reminder: null,
      snippet: '',
    }
    setBills(prev => [bill, ...prev].sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || '')))
    return bill
  }

  const togglePaid = (id) => {
    setBills(prev => prev.map(b =>
      b.id === id
        ? { ...b, paid: !b.paid, paidDate: !b.paid ? new Date().toISOString().split('T')[0] : null }
        : b
    ))
  }

  const setReminder = (id, days) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, reminder: days } : b))
  }

  const deleteBill = (id) => {
    setBills(prev => prev.filter(b => b.id !== id))
  }

  const unpaid = bills.filter(b => !b.paid)
  const paid = bills.filter(b => b.paid)
  const nextDue = [...unpaid].sort((a, b) => (a.dueDate || 'z').localeCompare(b.dueDate || 'z'))[0]
  const totalSpent = paid.reduce((s, b) => s + (b.amount || 0), 0)
  const avgAmount = paid.filter(b => b.amount).length
    ? totalSpent / paid.filter(b => b.amount).length
    : 0

  return {
    bills, unpaid, paid, nextDue, totalSpent, avgAmount,
    meta, mergeBills, addManual, togglePaid, setReminder, deleteBill,
  }
}
