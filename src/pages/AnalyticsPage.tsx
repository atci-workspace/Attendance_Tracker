import { useState } from 'react'
import { PageCard } from '../components/Ui'

const levelRows = [
  { key: '7', a: 2, b: 1, c: 1 },
  { key: '8', a: 3, b: 2, c: 1 },
]
const locationRows = [
  { key: 'Bangalore', a: 2, b: 1, c: 1 },
  { key: 'Chennai', a: 3, b: 2, c: 1 },
]

export function AnalyticsPage() {
  const [mode, setMode] = useState<'level' | 'location'>('level')
  const rows = mode === 'level' ? levelRows : locationRows
  return (
    <PageCard title="Analytics">
      <div className="mb-3 flex gap-2">
        <select className="rounded-lg border px-3 py-2" value={mode} onChange={(e) => setMode(e.target.value as 'level' | 'location')}>
          <option value="level">Level-wise</option>
          <option value="location">Location-wise</option>
        </select>
        <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">Fetch details</button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-200 dark:bg-slate-700">
            <th className="p-2 text-left">{mode === 'level' ? 'Level' : 'Location'}</th>
            <th>Team A</th>
            <th>Team B</th>
            <th>Team C</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-slate-200 dark:border-slate-700">
              <td className="p-2">{r.key}</td>
              <td className="text-center">{r.a}</td>
              <td className="text-center">{r.b}</td>
              <td className="text-center">{r.c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageCard>
  )
}
