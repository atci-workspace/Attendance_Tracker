import { useState } from 'react'
import { PageCard, FieldLabel, Input, WaveLoader } from '../components/Ui'
import { isRateLimited } from '../utils/rateLimit'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import { getTeamMembersCached, getUserByAccentureEmail, upsertOwnProfile } from '../lib/orgApi'

const MAX_FAILURE = 3

export function AuthPage() {
  const [failed, setFailed] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const canCall = failed < MAX_FAILURE

  function validateAccentureEmail(email: string): boolean {
    return email.toLowerCase().endsWith('@accenture.com')
  }

  function validatePersonalEmail(email: string): boolean {
    return email.toLowerCase().endsWith('@gmail.com')
  }

  async function submitLogin(form: FormData) {
    const accentureEmail = String(form.get('accentureEmail') ?? '').toLowerCase()
    const password = String(form.get('password') ?? '')
    if (!validateAccentureEmail(accentureEmail)) {
      setMessage('Use your Accenture email as username.')
      return
    }
    const existing = await getUserByAccentureEmail(accentureEmail)
    if (!existing) {
      setMessage('User is not present. Please signup first.')
      return
    }
    await signInWithEmailAndPassword(auth, existing.personalEmail, password)
    setMessage('Login successful.')
    setFailed(0)
  }

  async function submitSignup(form: FormData) {
    const accentureEmail = String(form.get('accentureEmail') ?? '').toLowerCase()
    const personalEmail = String(form.get('personalEmail') ?? '').toLowerCase()
    const password = String(form.get('password') ?? '')
    if (!validateAccentureEmail(accentureEmail)) {
      setMessage('Accenture email is mandatory as your username.')
      return
    }
    if (!validatePersonalEmail(personalEmail)) {
      setMessage('Personal Gmail is mandatory for password reset support.')
      return
    }
    const members = await getTeamMembersCached()
    const allowed = members.find((m) => m.accentureEmail.toLowerCase() === accentureEmail)
    if (!allowed) {
      setMessage('You are not yet in team structure. Ask admin to add your email first.')
      return
    }
    const existing = await getUserByAccentureEmail(accentureEmail)
    if (existing) {
      setMessage('User already present. Please login.')
      return
    }
    const cred = await createUserWithEmailAndPassword(auth, personalEmail, password)
    await upsertOwnProfile(cred.user.uid, {
      accentureEmail,
      personalEmail,
      name: allowed.name,
      teamName: allowed.teamName,
      role: allowed.role,
      isAdmin: accentureEmail === 'farooq.baig@accenture.com',
    })
    setMessage('Signup completed. You can now use the full portal.')
  }

  async function submitAuth(form: FormData) {
    if (isRateLimited('auth-clicks')) {
      setMessage('Too many requests. Please wait a few seconds.')
      return
    }
    if (!isFirebaseConfigured()) {
      setMessage('Firebase environment is missing. Fill .env values before login.')
      return
    }
    if (!canCall) {
      setMessage('Auth locked after 3 failed attempts in this session.')
      return
    }
    setLoading(true)
    try {
      if (mode === 'login') {
        await submitLogin(form)
      } else {
        await submitSignup(form)
      }
    } catch (error) {
      const errText = error instanceof Error ? error.message : 'Authentication failed.'
      setFailed((v) => v + 1)
      setMessage(`Auth failed: ${errText}`)
    } finally {
      setLoading(false)
    }
  }

  async function forgotPassword(form: FormData) {
    const accentureEmail = String(form.get('accentureEmail') ?? '').toLowerCase()
    if (!validateAccentureEmail(accentureEmail)) {
      setMessage('Enter your Accenture email first.')
      return
    }
    const existing = await getUserByAccentureEmail(accentureEmail)
    if (!existing?.personalEmail) {
      setMessage('No linked Gmail found. Contact admin.')
      return
    }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, existing.personalEmail)
      setMessage(`Password reset mail sent to ${existing.personalEmail}`)
    } catch (error) {
      const errText = error instanceof Error ? error.message : 'Unable to send reset email.'
      setMessage(errText)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/50 bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 p-8 text-white shadow-xl">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <h2 className="text-3xl font-semibold">Attendance Platform For Real Teams</h2>
        <p className="mt-3 max-w-3xl text-sm text-indigo-100">
          This portal is designed for production usage: controlled signup from org structure, secure authentication, role-aware access, and API-efficient flows with session caching.
        </p>
      </section>

      <PageCard title="Login / Signup">
        <div className="mb-4 flex gap-2">
          <button type="button" onClick={() => setMode('login')} className={`rounded-full px-4 py-1 text-sm ${mode === 'login' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>Login</button>
          <button type="button" onClick={() => setMode('signup')} className={`rounded-full px-4 py-1 text-sm ${mode === 'signup' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>Signup</button>
        </div>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            void submitAuth(new FormData(e.currentTarget))
          }}
        >
          <div>
            <FieldLabel>Accenture Email (Username)</FieldLabel>
            <Input name="accentureEmail" type="email" required />
            <p className="mt-1 text-xs text-slate-500">Used as your enterprise identity and team mapping key.</p>
          </div>
          {mode === 'signup' ? (
            <div>
              <FieldLabel>Personal Gmail</FieldLabel>
              <Input name="personalEmail" type="email" required />
              <p className="mt-1 text-xs text-slate-500">Mandatory so forgot-password emails can be delivered reliably.</p>
            </div>
          ) : <div />}
          <div>
            <FieldLabel>Password</FieldLabel>
            <Input name="password" type="password" required />
            <p className="mt-1 text-xs text-slate-500">Minimum 8 characters is recommended for production security.</p>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50"
              disabled={!canCall || loading}
            >
              {mode === 'login' ? 'Login' : 'Signup'}
            </button>
          </div>
          <button
            type="button"
            onClick={(e) => {
              const form = new FormData((e.currentTarget.form as HTMLFormElement))
              void forgotPassword(form)
            }}
            className="text-left text-sm text-indigo-600 underline"
          >
            Forgot password? Send reset email
          </button>
          <div className="text-sm text-amber-600 dark:text-amber-300">Failed attempts: {failed}/{MAX_FAILURE}</div>
          {loading ? <WaveLoader /> : <p className="text-sm md:col-span-2">{message}</p>}
        </form>
      </PageCard>

      <PageCard title="Contact Us">
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const name = String(fd.get('name') ?? '')
            const details = String(fd.get('details') ?? '')
            const subject = encodeURIComponent('Enquiry about Attendance Site Creation')
            const body = encodeURIComponent(`Name: ${name}\n\nDetails:\n${details}`)
            window.location.href = `mailto:farooq.baig.work@gmail.com?subject=${subject}&body=${body}`
          }}
        >
          <div>
            <FieldLabel>Name</FieldLabel>
            <Input name="name" required />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Details</FieldLabel>
            <Input name="details" required />
          </div>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900">
            Contact Us
          </button>
        </form>
      </PageCard>
    </div>
  )
}
