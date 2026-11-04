import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-[1.25rem] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_-14px_rgba(15,23,42,0.18)] border border-slate-200/70 dark:border-slate-700/70 ${className}`}
    >
      {children}
    </div>
  )
}
