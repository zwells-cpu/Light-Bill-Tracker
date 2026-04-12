const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

function authHeaders(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

// Search Gmail for Mississippi Power emails
export async function fetchMississippiPowerEmails(token) {
  const query = 'from:(mississippipower.com) OR subject:("Mississippi Power") OR subject:("bill due") OR subject:("payment due") OR subject:("account statement")'
  const url = `${GMAIL_API}/messages?q=${encodeURIComponent(query)}&maxResults=20`

  const listRes = await fetch(url, { headers: authHeaders(token) })
  if (!listRes.ok) throw new Error(`Gmail API error: ${listRes.status}`)
  const listData = await listRes.json()

  if (!listData.messages?.length) return []

  // Fetch full details for each message (parallel, max 10)
  const messages = await Promise.all(
    listData.messages.slice(0, 10).map(m =>
      fetch(`${GMAIL_API}/messages/${m.id}?format=full`, { headers: authHeaders(token) })
        .then(r => r.json())
    )
  )

  return messages.map(parseEmail).filter(Boolean)
}

function parseEmail(msg) {
  try {
    const headers = msg.payload?.headers || []
    const get = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''

    const subject = get('Subject')
    const from = get('From')
    const dateStr = get('Date')
    const emailDate = dateStr ? new Date(dateStr).toISOString().split('T')[0] : null

    // Extract body text
    const bodyText = extractBody(msg.payload)

    // Parse amount
    const amountMatch = bodyText.match(/\$\s*([\d,]+\.?\d{0,2})/g)
    const amounts = amountMatch
      ? amountMatch.map(a => parseFloat(a.replace(/[$,\s]/g, ''))).filter(a => a > 0 && a < 10000)
      : []
    const amount = amounts.length ? Math.max(...amounts) : null

    // Parse due date
    const dueDate = parseDueDate(bodyText)

    // Parse billing period
    const periodMatch = bodyText.match(/(?:billing period|service period)[:\s]+([A-Za-z]+ \d{1,2}[–\-,\s]+[A-Za-z]* \d{1,2},? \d{4})/i)
    const billingPeriod = periodMatch ? periodMatch[1].trim() : null

    return {
      id: msg.id,
      subject,
      from,
      emailDate,
      amount,
      dueDate,
      billingPeriod,
      snippet: msg.snippet || '',
    }
  } catch { return null }
}

function extractBody(payload) {
  if (!payload) return ''

  // Direct body
  if (payload.body?.data) {
    return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
  }

  // Multipart — prefer text/plain
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
      }
    }
    // Fallback to text/html
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
        return html.replace(/<[^>]+>/g, ' ')
      }
      // Nested multipart
      if (part.parts) {
        const nested = extractBody(part)
        if (nested) return nested
      }
    }
  }
  return ''
}

function parseDueDate(text) {
  const patterns = [
    /(?:payment|amount)\s+due\s+(?:on\s+)?([A-Za-z]+\.?\s+\d{1,2},?\s+\d{4})/i,
    /due\s+(?:date|by|on)[:\s]+([A-Za-z]+\.?\s+\d{1,2},?\s+\d{4})/i,
    /due\s+(?:on\s+)?(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /pay\s+by\s+([A-Za-z]+\.?\s+\d{1,2},?\s+\d{4})/i,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const d = new Date(m[1])
      if (!isNaN(d)) return d.toISOString().split('T')[0]
    }
  }
  return null
}
