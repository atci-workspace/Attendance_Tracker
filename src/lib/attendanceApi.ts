import { httpsCallable } from 'firebase/functions'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db, functions } from './firebase'

export type AttendanceStatus = 'AB' | 'PH' | 'SL' | 'PL' | 'CL' | 'LC'

export interface AttendanceDoc {
  uid: string
  year: number
  month: number
  attendanceData: Record<string, AttendanceStatus>
  updatedAt?: unknown
  updatedBy?: string | null
}

const markTodayCallable = httpsCallable<{ uid: string; status: AttendanceStatus }, { ok: boolean }>(
  functions,
  'markTodayAttendance',
)
const markRangeCallable = httpsCallable(functions, 'markAttendanceRange')
const markSpecificCallable = httpsCallable(functions, 'markSpecificDates')

export async function markTodayAttendance(uid: string, status: AttendanceStatus) {
  return markTodayCallable({ uid, status })
}

export async function markAttendanceRange(payload: {
  uid: string
  status: AttendanceStatus
  fromDate: string
  toDate: string
}) {
  return markRangeCallable(payload)
}

export async function markSpecificDates(payload: {
  uid: string
  status: AttendanceStatus
  year: number
  month: number
  dates: number[]
}) {
  return markSpecificCallable(payload)
}

export async function getMonthlyAttendance(year: number, month: number) {
  const attendanceRef = collection(db, 'attendance')
  const q = query(attendanceRef, where('year', '==', year), where('month', '==', month))
  const snap = await getDocs(q)
  return snap.docs.map((doc) => doc.data() as AttendanceDoc)
}
