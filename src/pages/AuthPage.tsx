import { useState } from 'react'
import { PageCard, FieldLabel, Input, WaveLoader } from '../components/Ui'
import { isRateLimited } from '../utils/rateLimit'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'

const MAX_FAILURE = 3

export function AuthPage() {
  const [failed, setFailed] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const canCall = failed < MAX_FAILURE

  function validateEmail(email: string): boolean {
    return email.toLowerCase().endsWith('@accenture.com')
  }

  async function submitAuth(form: FormData) {
    if (isRateLimited('auth-clicks')) {
      setMessage('Too many requests. Please wait a few seconds.')
      return
    }
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')
    if (!validateEmail(email)) {
      setMessage('Only @accenture.com emails are allowed.')
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
      await signInWithEmailAndPassword(auth, email, password)
      setMessage('Login successful.')
      setFailed(0)
    } catch {
      try {
        await createUserWithEmailAndPassword(auth, email, password)
        setMessage('Signup successful. You are now logged in.')
        setFailed(0)
      } catch (error) {
        const errText = error instanceof Error ? error.message : 'Authentication failed.'
        setFailed((v) => v + 1)
        setMessage(`Auth failed: ${errText}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4">
      <PageCard title="Login / Signup">
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            void submitAuth(new FormData(e.currentTarget))
          }}
        >
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input name="email" type="email" required />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <Input name="password" type="password" required />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50"
            disabled={!canCall || loading}
          >
            Continue
          </button>
          <div className="text-sm text-amber-600 dark:text-amber-300">
            Failed attempts: {failed}/{MAX_FAILURE}
          </div>
          {loading ? <WaveLoader /> : <p className="text-sm">{message}</p>}
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
