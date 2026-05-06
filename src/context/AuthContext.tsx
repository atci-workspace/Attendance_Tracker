import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { getUserProfile } from '../lib/orgApi'
import type { UserProfile } from '../types/org'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isAdmin: boolean
  isMainAdmin: boolean
  loading: boolean
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
}

const MAIN_ADMIN_EMAIL = 'farooq.baig@accenture.com'
const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshProfile() {
    if (!auth.currentUser) {
      setProfile(null)
      return
    }
    const doc = await getUserProfile(auth.currentUser.uid)
    setProfile(doc)
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (next) => {
      setUser(next)
      if (!next) {
        setProfile(null)
        setLoading(false)
        return
      }
      await refreshProfile()
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      profile,
      isAdmin: Boolean(profile?.isAdmin),
      isMainAdmin: profile?.accentureEmail?.toLowerCase() === MAIN_ADMIN_EMAIL,
      loading,
      refreshProfile,
      logout: () => signOut(auth),
    }),
    [user, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthState() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuthState must be used under AuthProvider')
  return value
}
