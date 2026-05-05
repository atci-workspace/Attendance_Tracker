import { PageCard } from '../components/Ui'
import { STATUS_META, type AttendanceStatus } from '../config/attendance'

const profile = {
  name: 'Farooq Baig',
  email: 'farooq.baig@accenture.com',
  project: 'KP',
  nuid: 'NU12345',
  team: 'Modernization',
  role: 'Developer',
  location: 'Chennai',
  level: '8',
  gender: 'Male',
  accentureJoinDate: 'NA',
  projectJoinDate: 'NA',
  certifications: 'NA',
  primarySkill: 'React',
}

const monthRows = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function ProfileHistoryPage() {
  return (
    <div className="grid gap-4">
      <PageCard title="Individual Profile & History">
        <div className="grid gap-2 md:grid-cols-3">
          {Object.entries(profile).map(([key, value]) => (
            <div key={key} className="rounded-lg bg-slate-100 p-2 text-sm dark:bg-slate-800">
              <strong className="mr-2 capitalize">{key}:</strong>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </PageCard>
      <PageCard title="Annual Grid">
        <div className="overflow-auto">
          <table className="min-w-[1200px] border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-slate-200 p-2 dark:bg-slate-700">Month</th>
                {Array.from({ length: 31 }, (_, i) => (
                  <th key={i} className="bg-slate-200 p-2 dark:bg-slate-700">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthRows.map((m) => (
                <tr key={m}>
                  <td className="sticky left-0 bg-slate-200 p-2 dark:bg-slate-700">{m}</td>
                  {Array.from({ length: 31 }, (_, i) => {
                    const code: AttendanceStatus | '' = i % 9 === 0 ? 'SL' : i % 5 === 0 ? 'PH' : ''
                    return (
                      <td key={i} className={`h-8 min-w-8 rounded ${code ? STATUS_META[code].color : 'bg-white dark:bg-slate-900'}`}>
                        {code}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  )
}
