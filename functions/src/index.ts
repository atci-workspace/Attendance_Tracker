import { onCall, HttpsError } from 'firebase-functions/https'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

initializeApp()
const db = getFirestore()
type AttendanceStatus = 'AB' | 'PH' | 'SL' | 'PL' | 'CL' | 'LC'

function assertAccenture(email?: string) {
  if (!email || !email.endsWith('@accenture.com')) {
    throw new HttpsError('permission-denied', 'Only @accenture.com users are allowed.')
  }
}

export const markTodayAttendance = onCall(async (req) => {
  assertAccenture(req.auth?.token.email)
  const uid = String(req.data.uid ?? '')
  const status = String(req.data.status ?? 'AB') as AttendanceStatus
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const docId = `${uid}_${now.getFullYear()}_${month}`
  await db.collection('attendance').doc(docId).set(
    {
      uid,
      year: now.getFullYear(),
      month: Number(month),
      attendanceData: { [day]: status },
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: req.auth?.uid ?? null,
    },
    { merge: true },
  )
  return { ok: true }
})

export const markAttendanceRange = onCall(async (req) => {
  assertAccenture(req.auth?.token.email)
  const uid = String(req.data.uid ?? '')
  const status = String(req.data.status ?? 'AB') as AttendanceStatus
  const fromDate = String(req.data.fromDate ?? '')
  const toDate = String(req.data.toDate ?? '')
  if (!uid || !fromDate || !toDate) {
    throw new HttpsError('invalid-argument', 'uid, fromDate and toDate are required.')
  }

  const start = new Date(fromDate)
  const end = new Date(toDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new HttpsError('invalid-argument', 'Invalid date range.')
  }

  const updates = new Map<string, { uid: string; year: number; month: number; attendanceData: Record<string, AttendanceStatus> }>()
  for (const dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    const weekday = dt.getDay()
    if (weekday === 0 || weekday === 6) continue
    const year = dt.getFullYear()
    const month = dt.getMonth() + 1
    const day = String(dt.getDate()).padStart(2, '0')
    const docId = `${uid}_${year}_${String(month).padStart(2, '0')}`
    const existing = updates.get(docId) ?? { uid, year, month, attendanceData: {} }
    existing.attendanceData[day] = status
    updates.set(docId, existing)
  }

  const batch = db.batch()
  updates.forEach((value, docId) => {
    const ref = db.collection('attendance').doc(docId)
    batch.set(
      ref,
      {
        ...value,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: req.auth?.uid ?? null,
      },
      { merge: true },
    )
  })
  await batch.commit()
  return { ok: true, docsUpdated: updates.size }
})

export const markSpecificDates = onCall(async (req) => {
  assertAccenture(req.auth?.token.email)
  const uid = String(req.data.uid ?? '')
  const status = String(req.data.status ?? 'AB') as AttendanceStatus
  const year = Number(req.data.year ?? 0)
  const month = Number(req.data.month ?? 0)
  const dates = Array.isArray(req.data.dates) ? req.data.dates.map((x: unknown) => Number(x)) : []
  if (!uid || !year || month < 1 || month > 12 || dates.length === 0) {
    throw new HttpsError('invalid-argument', 'uid, year, month and dates are required.')
  }

  const monthStr = String(month).padStart(2, '0')
  const docId = `${uid}_${year}_${monthStr}`
  const data: Record<string, AttendanceStatus> = {}
  for (const dayNum of dates) {
    const date = new Date(year, month - 1, dayNum)
    if (date.getMonth() + 1 !== month) continue
    const weekday = date.getDay()
    if (weekday === 0 || weekday === 6) continue
    data[String(dayNum).padStart(2, '0')] = status
  }

  await db.collection('attendance').doc(docId).set(
    {
      uid,
      year,
      month,
      attendanceData: data,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: req.auth?.uid ?? null,
    },
    { merge: true },
  )
  return { ok: true, markedDays: Object.keys(data).length }
})
export const upsertMember = onCall(async () => ({ ok: true }))
export const adminAddOrRemoveAdmin = onCall(async () => ({ ok: true }))
export const pruneAttendanceByDateRange = onCall(async () => ({ ok: true }))
export const validateAdminSecretPhrase = onCall(async () => ({ ok: true }))
