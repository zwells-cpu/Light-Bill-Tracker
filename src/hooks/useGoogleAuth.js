import { useState, useEffect, useCallback } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly'
const STORAGE_KEY = 'gauth_token'

export function useGoogleAuth() {
  const [token, setToken] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      const { accessToken, expiry } = JSON.parse(stored)
      if (Date.now() > expiry) { localStorage.removeItem(STORAGE_KEY); return null }
      return accessToken
    } catch { return null }
  })
  const [userEmail, setUserEmail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load Google Identity Services script
  useEffect(() => {
    if (document.getElementById('gsi-script')) return
    const script = document.createElement('script')
    script.id = 'gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Fetch user email when token is available
  useEffect(() => {
    if (!token) { setUserEmail(null); return }
    fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setUserEmail(d.email))
      .catch(() => {})
  }, [token])

  const signIn = useCallback(() => {
    setLoading(true)
    setError(null)
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        prompt: 'select_account',
        callback: (resp) => {
          setLoading(false)
          if (resp.error) { setError('Sign-in failed. Please try again.'); return }
          const expiry = Date.now() + (resp.expires_in * 1000)
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: resp.access_token, expiry }))
          setToken(resp.access_token)
        }
      })
      client.requestAccessToken()
    } catch (e) {
      setLoading(false)
      setError('Google sign-in unavailable. Check your Client ID in .env')
    }
  }, [])

  const signOut = useCallback(() => {
    if (token) window.google?.accounts?.oauth2?.revoke(token, () => {})
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUserEmail(null)
  }, [token])

  return { token, userEmail, signIn, signOut, loading, error, isSignedIn: !!token }
}
