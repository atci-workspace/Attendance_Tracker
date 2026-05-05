import { motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'
import type { InputHTMLAttributes } from 'react'

export function PageCard({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <section className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/70">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export function WaveLoader({ text = 'from Team ATCI-Chennai...' }: { text?: string }) {
  return (
    <div className="flex gap-0.5 text-sm font-medium text-indigo-600 dark:text-indigo-300">
      {text.split('').map((char, idx) => (
        <motion.span
          key={`${char}-${idx}`}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.03 }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  )
}

export function FieldLabel({ children }: PropsWithChildren) {
  return <label className="mb-1 block text-xs font-semibold tracking-wide uppercase">{children}</label>
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 ${props.className ?? ''}`}
    />
  )
}
