import { Link, Route, Routes } from 'react-router-dom'
import { Lock, LogOut, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AuthPage } from './pages/AuthPage'
import { MarkAttendancePage } from './pages/MarkAttendancePage'
import { TeamStructurePage } from './pages/TeamStructurePage'
import { ProfileHistoryPage } from './pages/ProfileHistoryPage'
import { MonthlySummaryPage } from './pages/MonthlySummaryPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { FilteredSummaryPage } from './pages/FilteredSummaryPage'
import { AdminPage } from './pages/AdminPage'
import { useAuthState } from './context/AuthContext'

const navItems = [
  { to: '/mark-attendance', label: 'Mark Attendance' },
  { to: '/team-structure', label: 'Team Structure' },
  { to: '/profile-history', label: 'Profile & History' },
  { to: '/monthly-summary', label: 'Monthly Summary' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/filtered-summary', label: 'Filtered Summary' },
  { to: '/admin', label: 'Admin' },
]

function App() {
  const { user, profile, isAdmin, loading, logout } = useAuthState()
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem('theme') !== 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-100 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 dark:text-slate-50">
      <header className="sticky top-0 z-20 border-b border-white/30 bg-white/60 backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-950/50">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">Accenture ATCI Attendance Tracker</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300">Enterprise attendance platform with secure access controls</p>
          </div>
          <div className="flex items-center gap-2">
            {user && profile && (
              <div className="rounded-xl border border-slate-300/60 bg-white/60 px-3 py-1 text-xs dark:border-slate-600 dark:bg-slate-800/60">
                <p className="font-semibold">{profile.name}</p>
                <p>{profile.accentureEmail}</p>
              </div>
            )}
            {user && (
              <button className="rounded-full border border-slate-300 p-2 dark:border-slate-600" onClick={() => void logout()} title="Logout">
                <LogOut size={16} />
              </button>
            )}
            <button
              type="button"
              className="rounded-full border border-slate-300 p-2 hover:scale-105 dark:border-slate-600"
              onClick={() => setIsDark((v) => !v)}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
        {user && (
          <nav className="mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-4 pb-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full bg-slate-900/5 px-3 py-1 text-sm whitespace-nowrap hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20"
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="rounded-full bg-indigo-600 px-3 py-1 text-sm whitespace-nowrap text-white">
                <span className="inline-flex items-center gap-1"><Lock size={14} /> Admin</span>
              </Link>
            )}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-[1400px] p-4">
        {loading ? <p>Loading session...</p> : null}
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/mark-attendance" element={user ? <MarkAttendancePage /> : <AuthPage />} />
          <Route path="/team-structure" element={user ? <TeamStructurePage /> : <AuthPage />} />
          <Route path="/profile-history" element={user ? <ProfileHistoryPage /> : <AuthPage />} />
          <Route path="/monthly-summary" element={user ? <MonthlySummaryPage /> : <AuthPage />} />
          <Route path="/analytics" element={user ? <AnalyticsPage /> : <AuthPage />} />
          <Route path="/filtered-summary" element={user ? <FilteredSummaryPage /> : <AuthPage />} />
          <Route path="/admin" element={user && isAdmin ? <AdminPage /> : <AuthPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
