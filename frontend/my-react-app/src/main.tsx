import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import './index.css'
import MainPage from './components/MainPage'
import LoginPage from './components/Login'
import { supabase } from './services/supabaseClient'

function RootContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return null
  }

  return user ? <MainPage /> : <LoginPage />
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootContent />
  </StrictMode>,
)
