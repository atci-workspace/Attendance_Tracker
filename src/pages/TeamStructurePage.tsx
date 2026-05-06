import { useEffect, useMemo, useState } from 'react'
import { PageCard, Input } from '../components/Ui'
import { getTeamMembersCached } from '../lib/orgApi'
import type { TeamMember } from '../types/org'

export function TeamStructurePage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    void getTeamMembersCached().then(setMembers)
  }, [])

  const grouped = useMemo(() => {
    const filtered = members.filter((m) =>
      `${m.teamName} ${m.name} ${m.accentureEmail} ${m.role}`.toLowerCase().includes(query.toLowerCase()),
    )
    return filtered.reduce<Record<string, TeamMember[]>>((acc, m) => {
      acc[m.teamName] ??= []
      acc[m.teamName].push(m)
      return acc
    }, {})
  }, [members, query])

  return (
    <div className="grid gap-4">
      <PageCard title="Team Structure">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          This structure is the source-of-truth for signup authorization. Users can register only if their Accenture email exists below.
        </p>
        <Input placeholder="Search by team, name, email, role..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="mt-4 grid gap-3">
          {Object.entries(grouped).map(([team, rows]) => (
            <details key={team} open className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <summary className="cursor-pointer font-semibold">{team} ({rows.length})</summary>
              <div className="mt-3 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((m) => (
                      <tr key={m.accentureEmail} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="p-2">{m.name}</td>
                        <td className="p-2">{m.accentureEmail}</td>
                        <td className="p-2">{m.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      </PageCard>
    </div>
  )
}
