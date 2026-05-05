export const STATUS_META = {
  AB: { label: 'Available', color: 'bg-green-200 text-green-950' },
  PL: { label: 'Planned Leave', color: 'bg-violet-200 text-violet-950' },
  SL: { label: 'Sick Leave', color: 'bg-red-200 text-red-950' },
  LC: { label: 'Late for Call', color: 'bg-yellow-200 text-yellow-950' },
  PH: { label: 'Public Holiday', color: 'bg-blue-200 text-blue-950' },
  CL: { label: 'Cancelled Leave', color: 'bg-orange-200 text-orange-950' },
} as const

export type AttendanceStatus = keyof typeof STATUS_META

export const STATUS_OPTIONS = Object.entries(STATUS_META).map(([code, meta]) => ({
  code: code as AttendanceStatus,
  ...meta,
}))
