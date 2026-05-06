export type MemberRole = 'Developer' | 'Tester' | 'Support'

export interface TeamMember {
  teamName: string
  name: string
  accentureEmail: string
  role: MemberRole
}

export interface UserProfile {
  uid: string
  accentureEmail: string
  personalEmail: string
  name: string
  role: MemberRole | 'Admin'
  teamName: string
  isAdmin: boolean
  createdAt?: unknown
  updatedAt?: unknown
}
