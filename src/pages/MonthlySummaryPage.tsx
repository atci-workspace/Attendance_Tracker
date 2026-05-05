import { useMemo, useState } from 'react'
import { PageCard } from '../components/Ui'
import { STATUS_META } from '../config/attendance'
import { getMonthlyAttendance, type AttendanceDoc } from '../lib/attendanceApi'
import { auth } from '../lib/firebase'

export function MonthlySummaryPage() {
  const [rows, setRows] = useState<AttendanceDoc[]>([])
  const [message, setMessage] = useState('Click refresh to load Firebase data.')
  const [loading, setLoading] = useState(false)
  const now = useMemo(() => new Date(), [])
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  async function loadData() {
    if (!auth.currentUser) {
      setMessage('Login first to read attendance records.')
      return
    }
    setLoading(true)
    try {
      const docs = await getMonthlyAttendance(year, month)
      setRows(docs)
      setMessage(`Loaded ${docs.length} records for ${month}/${year}.`)
    } catch (error) {
      const errText = error instanceof Error ? error.message : 'Read failed.'
      setMessage(`Unable to load records: ${errText}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageCard title="Monthly Summary">
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <input
          className="rounded-lg border px-2 py-1 text-sm"
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
        <input
          className="w-20 rounded-lg border px-2 py-1 text-sm"
          type="number"
          min={1}
          max={12}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        />
        <button disabled={loading} onClick={() => void loadData()} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50">
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-[1400px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-200 p-2 dark:bg-slate-700">Name</th>
              {days.map((d) => <th key={d} className="bg-slate-200 p-2 dark:bg-slate-700">{`D${d}`}</th>)}
              <th className="bg-slate-200 p-2 dark:bg-slate-700">PH</th>
              <th className="bg-slate-200 p-2 dark:bg-slate-700">SL</th>
              <th className="bg-slate-200 p-2 dark:bg-slate-700">PL</th>
              <th className="bg-slate-200 p-2 dark:bg-slate-700">CL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const counters = { PH: 0, SL: 0, PL: 0, CL: 0 }
              return (
              <tr key={row.uid}>
                <td className="sticky left-0 bg-slate-200 p-2 dark:bg-slate-700">{row.uid}</td>
                {days.map((d) => {
                  const code = row.attendanceData[String(d).padStart(2, '0')] ?? 'AB'
                  if (code in counters) counters[code as keyof typeof counters] += 1
                  return <td key={d} className={`rounded p-2 text-center ${STATUS_META[code].color}`}>{code}</td>
                })}
                <td className="bg-slate-100 p-2 dark:bg-slate-800">{counters.PH}</td>
                <td className="bg-slate-100 p-2 dark:bg-slate-800">{counters.SL}</td>
                <td className="bg-slate-100 p-2 dark:bg-slate-800">{counters.PL}</td>
                <td className="bg-slate-100 p-2 dark:bg-slate-800">{counters.CL}</td>
              </tr>
              )})}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-indigo-700 dark:text-indigo-300">{message}</p>
    </PageCard>
  )
}
