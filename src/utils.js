export function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr + 'T12:00:00') - new Date()
  return Math.ceil(diff / 86400000)
}

export function formatDate(dateStr, short = false) {
  if (!dateStr) return '—'
  const opts = short
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' }
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', opts)
}

export function formatCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function getBillStatus(bill) {
  if (bill.paid) return 'paid'
  const days = daysUntil(bill.dueDate)
  if (days === null) return 'unknown'
  if (days < 0) return 'overdue'
  if (days <= 5) return 'urgent'
  return 'upcoming'
}

export function getReminderDate(dueDate, daysBefore) {
  if (!dueDate || !daysBefore) return null
  const d = new Date(dueDate + 'T12:00:00')
  d.setDate(d.getDate() - daysBefore)
  return d.toISOString().split('T')[0]
}
