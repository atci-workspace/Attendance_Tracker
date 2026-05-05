import { PageCard, FieldLabel, Input } from '../components/Ui'

export function AdminPage() {
  return (
    <div className="grid gap-4">
      <PageCard title="Admin Login (Locked)">
        <div className="grid gap-2 md:grid-cols-3">
          <div>
            <FieldLabel>Admin Email</FieldLabel>
            <Input type="email" />
          </div>
          <div>
            <FieldLabel>Secret Phrase</FieldLabel>
            <Input type="password" />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <Input type="password" />
          </div>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white">Verify Admin</button>
        </div>
      </PageCard>
      <PageCard title="Section 1: Unit / Project / Team / Member CRUD">
        <p className="text-sm">Implement upsert flows with immutable attendance snapshots for historical accuracy.</p>
      </PageCard>
      <PageCard title="Section 2: Admin User Management">
        <p className="text-sm">Allow add/remove admins while protecting main admin from deletion.</p>
      </PageCard>
      <PageCard title="Section 3: Attendance Pruning">
        <div className="grid gap-2 md:grid-cols-3">
          <Input type="date" />
          <Input type="date" />
          <button className="rounded-lg bg-red-600 px-4 py-2 text-white">Delete Date Range</button>
        </div>
      </PageCard>
    </div>
  )
}
