import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/20 active:from-blue-700 active:to-blue-800',
  secondary:
    'bg-slate-100 text-slate-900 active:bg-slate-200 dark:bg-slate-700 dark:text-white dark:active:bg-slate-600',
  danger:
    'bg-gradient-to-b from-red-600 to-red-700 text-white shadow-md shadow-red-900/20 active:from-red-700 active:to-red-800',
  success:
    'bg-gradient-to-b from-green-600 to-green-700 text-white shadow-md shadow-green-900/20 active:from-green-700 active:to-green-800',
}

export function BigButton({ children, variant = 'primary', className = '', ...props }: BigButtonProps) {
  return (
    <button
      className={`min-h-[52px] px-5 py-3 rounded-2xl text-lg font-semibold disabled:opacity-40 disabled:shadow-none disabled:active:bg-none flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
