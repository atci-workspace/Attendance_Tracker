import { PageCard, Input } from '../components/Ui'

const rows = [
  { name: 'Dev 1', nuid: 'N1001', location: 'Chennai' },
  { name: 'Dev 2', nuid: 'N1002', location: 'Bangalore' },
  { name: 'Tester 1', nuid: 'N1003', location: 'Chennai' },
]

export function FilteredSummaryPage() {
  return (
    <PageCard title="Filtered Summary">
      <div className="mb-3 grid gap-2 md:grid-cols-3">
        <Input placeholder="Filter by name" />
        <Input placeholder="Filter by NUId" />
        <Input placeholder="Filter by location" />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-200 dark:bg-slate-700">
            <th className="p-2 text-left">Name</th>
            <th>NUId</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.nuid} className="border-b border-slate-200 dark:border-slate-700">
              <td className="p-2">{r.name}</td>
              <td>{r.nuid}</td>
              <td>{r.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageCard>
  )
}
