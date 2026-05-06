import { useEffect, useMemo, useState } from 'react'
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { Lock } from 'lucide-react'
import { PageCard, FieldLabel, Input } from '../components/Ui'
import { useAuthState } from '../context/AuthContext'
import { db } from '../lib/firebase'
import { getTeamMembersCached } from '../lib/orgApi'
import type { TeamMember } from '../types/org'

export function AdminPage() {
  const { user, profile, isMainAdmin } = useAuthState()
  const [unlocked, setUnlocked] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [message, setMessage] = useState('')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [selectedEmail, setSelectedEmail] = useState('')
  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [targetAdminEmail, setTargetAdminEmail] = useState('')

  useEffect(() => {
    void getTeamMembersCached().then((rows) => {
      setMembers(rows)
      setSelectedEmail(rows[0]?.accentureEmail ?? '')
    })
  }, [])

  async function unlockAdminArea() {
    if (!user || !user.email) return
    const credential = EmailAuthProvider.credential(user.email, adminPassword)
    await reauthenticateWithCredential(user, credential)
    setUnlocked(true)
    setMessage('Admin section unlocked for this session.')
  }

  async function addAdmin() {
    const q = query(collection(db, 'users'), where('accentureEmail', '==', targetAdminEmail.toLowerCase()))
    const snap = await getDocs(q)
    const target = snap.docs[0]
    if (!target) {
      setMessage('Target user does not exist.')
      return
    }
    await setDoc(doc(db, 'users', target.id), { isAdmin: true }, { merge: true })
    await setDoc(doc(db, 'admins', target.id), { accentureEmail: targetAdminEmail.toLowerCase(), grantedBy: profile?.accentureEmail ?? '' }, { merge: true })
    setMessage('Admin role granted.')
  }

  async function removeAdmin() {
    const q = query(collection(db, 'users'), where('accentureEmail', '==', targetAdminEmail.toLowerCase()))
    const snap = await getDocs(q)
    const target = snap.docs[0]
    if (!target) {
      setMessage('Target user does not exist.')
      return
    }
    await setDoc(doc(db, 'users', target.id), { isAdmin: false }, { merge: true })
    await deleteDoc(doc(db, 'admins', target.id))
    setMessage('Admin role removed.')
  }

  async function deleteRange() {
    setMessage('Use backend callable pruneAttendanceByDateRange in production. UI wiring ready for main admin only.')
  }

  const memberDocId = useMemo(
    () => `${editMember?.teamName ?? ''}_${editMember?.accentureEmail ?? ''}`.replaceAll(/[^\w@.-]/g, '_'),
    [editMember],
  )

  async function saveMember() {
    if (!editMember) return
    await setDoc(doc(db, 'teamMembers', memberDocId), editMember, { merge: true })
    setMembers((prev) => {
      const idx = prev.findIndex((m) => m.accentureEmail === selectedEmail)
      if (idx === -1) return [...prev, editMember]
      const copy = [...prev]
      copy[idx] = editMember
      return copy
    })
    setSelectedEmail(editMember.accentureEmail)
    setMessage('Member updated.')
  }

  async function deleteMember() {
    if (!editMember) return
    await deleteDoc(doc(db, 'teamMembers', memberDocId))
    setMembers((prev) => prev.filter((m) => m.accentureEmail !== selectedEmail))
    setSelectedEmail('')
    setEditMember(null)
    setMessage('Member deleted.')
  }

  return (
    <div className="grid gap-4">
      <PageCard title="Admin Access Lock">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Secret phrase is removed. Existing admins must re-authenticate once more to unlock the dashboard controls.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <FieldLabel>Logged-in Admin</FieldLabel>
            <Input value={profile?.accentureEmail ?? ''} disabled />
          </div>
          <div>
            <FieldLabel>Re-enter Current Password</FieldLabel>
            <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
          </div>
          <button onClick={() => void unlockAdminArea()} className="rounded-lg bg-indigo-600 px-4 py-2 text-white inline-flex items-center gap-2">
            <Lock size={16} /> Unlock Dashboard
          </button>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">{message}</p>
        </div>
      </PageCard>

      {unlocked && (
        <>
          <PageCard title="Section 1: Team / Member Operations">
            <p className="mb-3 text-sm">Use this area to reorganize teams, add members, rename entries, and move roles between Developer/Tester/Support.</p>
            <div className="grid gap-2 md:grid-cols-2">
              <select className="rounded-lg border px-3 py-2" value={selectedEmail} onChange={(e) => setSelectedEmail(e.target.value)}>
                {members.map((m) => <option key={m.accentureEmail} value={m.accentureEmail}>{m.teamName} - {m.name} ({m.role})</option>)}
              </select>
              <button
                onClick={() => {
                  const current = members.find((m) => m.accentureEmail === selectedEmail) ?? null
                  setEditMember(current ? { ...current } : null)
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
              >
                Open Member Editor
              </button>
            </div>
            {editMember && (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <Input value={editMember.teamName} onChange={(e) => setEditMember({ ...editMember, teamName: e.target.value })} />
                <Input value={editMember.name} onChange={(e) => setEditMember({ ...editMember, name: e.target.value })} />
                <Input value={editMember.accentureEmail} onChange={(e) => setEditMember({ ...editMember, accentureEmail: e.target.value.toLowerCase() })} />
                <select className="rounded-lg border px-3 py-2" value={editMember.role} onChange={(e) => setEditMember({ ...editMember, role: e.target.value as TeamMember['role'] })}>
                  <option value="Developer">Developer</option>
                  <option value="Tester">Tester</option>
                  <option value="Support">Support</option>
                </select>
                <button onClick={() => void saveMember()} className="rounded-lg bg-emerald-600 px-4 py-2 text-white">Save Changes</button>
                <button onClick={() => void deleteMember()} className="rounded-lg bg-red-600 px-4 py-2 text-white">Delete Member</button>
              </div>
            )}
            <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-3 text-sm dark:border-slate-700">
              <p className="mb-2 font-semibold">Add New Member</p>
              <button
                onClick={() => setEditMember({ teamName: 'Modernization', name: '', accentureEmail: '', role: 'Developer' })}
                className="rounded-lg bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Create New Draft
              </button>
            </div>
          </PageCard>

          <PageCard title="Section 2: Admin User Management">
            <div className="grid gap-2 md:grid-cols-3">
              <Input placeholder="Accenture email to grant/revoke admin" value={targetAdminEmail} onChange={(e) => setTargetAdminEmail(e.target.value)} />
              <button onClick={() => void addAdmin()} className="rounded-lg bg-emerald-600 px-4 py-2 text-white">Add Admin</button>
              <button onClick={() => void removeAdmin()} className="rounded-lg bg-amber-600 px-4 py-2 text-white">Remove Admin</button>
            </div>
          </PageCard>

          {isMainAdmin && (
            <PageCard title="Section 3: Attendance Pruning (Main Admin Only)">
              <div className="grid gap-2 md:grid-cols-3">
                <Input type="date" />
                <Input type="date" />
                <button onClick={() => void deleteRange()} className="rounded-lg bg-red-600 px-4 py-2 text-white">Delete Date Range</button>
              </div>
            </PageCard>
          )}
        </>
      )}
    </div>
  )
}
