import { useMemo, useState } from 'react'
import { PageCard, FieldLabel, Input } from '../components/Ui'
import { STATUS_OPTIONS, type AttendanceStatus } from '../config/attendance'
import { isWeekend, safeDay } from '../utils/date'
import { isRateLimited } from '../utils/rateLimit'
import { markAttendanceRange, markSpecificDates, markTodayAttendance } from '../lib/attendanceApi'
import { auth } from '../lib/firebase'

const members = [
  { label: 'Dev 1', uid: 'dev-1' },
  { label: 'Dev 2', uid: 'dev-2' },
  { label: 'Tester 1', uid: 'tester-1' },
  { label: 'Tester 2', uid: 'tester-2' },
]

export function MarkAttendancePage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickMemberUid, setQuickMemberUid] = useState(members[0].uid)
  const [quickStatus, setQuickStatus] = useState<AttendanceStatus>('AB')
  const [rangeMemberUid, setRangeMemberUid] = useState(members[0].uid)
  const [rangeStatus, setRangeStatus] = useState<AttendanceStatus>('AB')
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')
  const [specificMemberUid, setSpecificMemberUid] = useState(members[0].uid)
  const [specificStatus, setSpecificStatus] = useState<AttendanceStatus>('AB')
  const [specificYear, setSpecificYear] = useState(new Date().getFullYear())
  const [specificMonth, setSpecificMonth] = useState(new Date().getMonth() + 1)
  const [specificDatesText, setSpecificDatesText] = useState('')
  const todayDisabled = useMemo(() => isWeekend(new Date()), [])

  function guard(key: string): boolean {
    if (isRateLimited(key)) {
      setResult('Blocked: more than 5 calls within 5 seconds.')
      return false
    }
    return true
  }

  async function runApiCall<T>(task: () => Promise<T>, successText: string) {
    if (!auth.currentUser) {
      setResult('Please login first to call attendance APIs.')
      return
    }
    setLoading(true)
    try {
      await task()
      setResult(successText)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected API error.'
      setResult(`API call failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4">
      <PageCard title="Quick Mark">
        <p className="mb-3 text-sm">Mark today for a selected member. Weekends are blocked.</p>
        <div className="grid gap-2 md:grid-cols-3">
          <select className="rounded-lg border px-3 py-2" value={quickMemberUid} onChange={(e) => setQuickMemberUid(e.target.value)}>
            {members.map((m) => <option key={m.uid} value={m.uid}>{m.label}</option>)}
          </select>
          <select
            className="rounded-lg border px-3 py-2"
            value={quickStatus}
            onChange={(e) => setQuickStatus(e.target.value as AttendanceStatus)}
          >
            {STATUS_OPTIONS.map((s) => <option key={s.code}>{s.code}</option>)}
          </select>
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-40"
            disabled={todayDisabled || loading}
            onClick={async () => {
              if (!guard('quick-mark')) return
              if (todayDisabled) {
                setResult('Weekend blocked.')
                return
              }
              await runApiCall(
                () => markTodayAttendance(quickMemberUid, quickStatus),
                'Attendance saved for today through Firebase Function.',
              )
            }}
          >
            Mark Today
          </button>
        </div>
      </PageCard>

      <PageCard title="Range Mark">
        <p className="mb-3 text-sm">Apply one status across a date range, excluding weekends.</p>
        <div className="grid gap-2 md:grid-cols-4">
          <select className="rounded-lg border px-3 py-2" value={rangeMemberUid} onChange={(e) => setRangeMemberUid(e.target.value)}>
            {members.map((m) => <option key={m.uid} value={m.uid}>{m.label}</option>)}
          </select>
          <select
            className="rounded-lg border px-3 py-2"
            value={rangeStatus}
            onChange={(e) => setRangeStatus(e.target.value as AttendanceStatus)}
          >
            {STATUS_OPTIONS.map((s) => <option key={s.code}>{s.code}</option>)}
          </select>
          <Input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
          <Input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white md:col-span-2"
            disabled={loading}
            onClick={async () => {
              if (!guard('range-mark')) return
              if (!rangeStart || !rangeEnd) {
                setResult('Select both start and end dates.')
                return
              }
              await runApiCall(
                () => markAttendanceRange({ uid: rangeMemberUid, status: rangeStatus, fromDate: rangeStart, toDate: rangeEnd }),
                'Range attendance request submitted to Firebase Function.',
              )
            }}
          >
            Mark Range
          </button>
        </div>
      </PageCard>

      <PageCard title="Specific Dates">
        <p className="mb-3 text-sm">Provide comma-separated days for selected year/month.</p>
        <div className="grid gap-2 md:grid-cols-4">
          <select className="rounded-lg border px-3 py-2" value={specificMemberUid} onChange={(e) => setSpecificMemberUid(e.target.value)}>
            {members.map((m) => <option key={m.uid} value={m.uid}>{m.label}</option>)}
          </select>
          <select
            className="rounded-lg border px-3 py-2"
            value={specificStatus}
            onChange={(e) => setSpecificStatus(e.target.value as AttendanceStatus)}
          >
            {STATUS_OPTIONS.map((s) => <option key={s.code}>{s.code}</option>)}
          </select>
          <Input type="number" value={specificYear} onChange={(e) => setSpecificYear(Number(e.target.value || new Date().getFullYear()))} />
          <Input type="number" min={1} max={12} value={specificMonth} onChange={(e) => setSpecificMonth(Number(e.target.value || new Date().getMonth() + 1))} />
          <div className="md:col-span-4">
            <FieldLabel>Dates (comma-separated)</FieldLabel>
            <Input
              placeholder="1,3,12"
              value={specificDatesText}
              onChange={(e) => setSpecificDatesText(e.target.value)}
              onBlur={() => {
                const dates = specificDatesText
                  .split(',')
                  .map((x) => Number(x.trim()))
                  .filter((x) => !Number.isNaN(x))
                const invalid = dates.some((d) => !safeDay(d, specificYear, specificMonth))
                setResult(invalid ? 'Invalid date found in list.' : 'Dates are valid.')
              }}
            />
          </div>
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white md:col-span-2"
            disabled={loading}
            onClick={async () => {
              if (!guard('specific-mark')) return
              const dates = specificDatesText
                .split(',')
                .map((x) => Number(x.trim()))
                .filter((x) => Number.isInteger(x))
              if (!dates.length || dates.some((d) => !safeDay(d, specificYear, specificMonth))) {
                setResult('Provide valid comma-separated dates first.')
                return
              }
              await runApiCall(
                () =>
                  markSpecificDates({
                    uid: specificMemberUid,
                    status: specificStatus,
                    year: specificYear,
                    month: specificMonth,
                    dates,
                  }),
                'Specific dates request submitted to Firebase Function.',
              )
            }}
          >
            Mark Specific Dates
          </button>
        </div>
      </PageCard>

      <p className="text-sm text-indigo-700 dark:text-indigo-300">{result}</p>
    </div>
  )
}
