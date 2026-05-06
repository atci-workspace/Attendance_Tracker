import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { PageCard, FieldLabel, Input } from '../components/Ui'
import { useAuthState } from '../context/AuthContext'
import { db } from '../lib/firebase'

export function ProfileHistoryPage() {
  const { profile, user, refreshProfile } = useAuthState()
  const [location, setLocation] = useState('Chennai')
  const [level, setLevel] = useState('8')
  const [message, setMessage] = useState('')

  async function saveSelf() {
    if (!user || !profile) return
    await setDoc(doc(db, 'users', user.uid), { location, level }, { merge: true })
    await refreshProfile()
    setMessage('Your details were saved. You can only update your own profile.')
  }

  return (
    <div className="grid gap-4">
      <PageCard title="Individual Profile & History">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Your profile is tied to your authenticated account. Editing is restricted to your own record only.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-slate-100 p-2 text-sm dark:bg-slate-800"><strong>Name:</strong> {profile?.name}</div>
          <div className="rounded-lg bg-slate-100 p-2 text-sm dark:bg-slate-800"><strong>Accenture Email:</strong> {profile?.accentureEmail}</div>
          <div className="rounded-lg bg-slate-100 p-2 text-sm dark:bg-slate-800"><strong>Personal Gmail:</strong> {profile?.personalEmail}</div>
          <div className="rounded-lg bg-slate-100 p-2 text-sm dark:bg-slate-800"><strong>Team:</strong> {profile?.teamName}</div>
          <div>
            <FieldLabel>Location</FieldLabel>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Level</FieldLabel>
            <Input value={level} onChange={(e) => setLevel(e.target.value)} />
          </div>
          <button onClick={() => void saveSelf()} className="rounded-lg bg-indigo-600 px-4 py-2 text-white">Save My Details</button>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">{message}</p>
        </div>
      </PageCard>
    </div>
  )
}
