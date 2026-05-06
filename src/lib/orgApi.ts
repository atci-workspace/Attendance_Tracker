import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { seedTeamMembers } from '../data/teamMembers'
import type { TeamMember, UserProfile } from '../types/org'

const TEAM_CACHE_KEY = 'team-members-cache-v1'

function readSessionCache(): TeamMember[] | null {
  const raw = sessionStorage.getItem(TEAM_CACHE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as TeamMember[]
  } catch {
    return null
  }
}

function writeSessionCache(data: TeamMember[]) {
  sessionStorage.setItem(TEAM_CACHE_KEY, JSON.stringify(data))
}

export async function getTeamMembersCached(force = false) {
  if (!force) {
    const cached = readSessionCache()
    if (cached?.length) return cached
  }
  try {
    const snap = await getDocs(collection(db, 'teamMembers'))
    const members = snap.docs.map((d) => d.data() as TeamMember)
    if (members.length) {
      writeSessionCache(members)
      return members
    }
  } catch {
    // Fallback to seed below for first setup.
  }
  writeSessionCache(seedTeamMembers)
  return seedTeamMembers
}

export async function seedTeamMembersIfMissing() {
  const existing = await getTeamMembersCached(true)
  if (existing.length) return
  const batch = writeBatch(db)
  seedTeamMembers.forEach((m) => {
    const key = `${m.teamName}_${m.accentureEmail}`.replaceAll(/[^\w@.-]/g, '_')
    batch.set(doc(db, 'teamMembers', key), m, { merge: true })
  })
  await batch.commit()
}

export async function getUserByAccentureEmail(accentureEmail: string) {
  const q = query(collection(db, 'users'), where('accentureEmail', '==', accentureEmail.toLowerCase()))
  const snap = await getDocs(q)
  return snap.docs[0]?.data() as UserProfile | undefined
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function upsertOwnProfile(
  uid: string,
  profile: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>,
) {
  await setDoc(
    doc(db, 'users', uid),
    {
      ...profile,
      uid,
      accentureEmail: profile.accentureEmail.toLowerCase(),
      personalEmail: profile.personalEmail.toLowerCase(),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )
}
