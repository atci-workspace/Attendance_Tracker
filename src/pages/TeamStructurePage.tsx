import { PageCard } from '../components/Ui'

const tree = [
  {
    unit: 'DU-02',
    projects: [
      {
        project: 'KP',
        teams: [
          { team: 'Modernization A', roles: { Developer: ['Dev 1'], Tester: ['Tester 1'] } },
          { team: 'Modernization B', roles: { Developer: ['Dev 2'], Tester: ['Tester 2'] } },
        ],
      },
    ],
  },
]

export function TeamStructurePage() {
  return (
    <PageCard title="Team Structure">
      <div className="space-y-2 text-sm">
        {tree.map((u) => (
          <details key={u.unit} open>
            <summary className="cursor-pointer font-semibold">{u.unit}</summary>
            {u.projects.map((p) => (
              <details key={p.project} className="ml-4" open>
                <summary className="cursor-pointer">{p.project}</summary>
                {p.teams.map((t) => (
                  <details key={t.team} className="ml-4" open>
                    <summary className="cursor-pointer">{t.team}</summary>
                    <div className="ml-4">
                      <p>Developers: {t.roles.Developer.join(', ')}</p>
                      <p>Testers: {t.roles.Tester.join(', ')}</p>
                    </div>
                  </details>
                ))}
              </details>
            ))}
          </details>
        ))}
      </div>
    </PageCard>
  )
}
