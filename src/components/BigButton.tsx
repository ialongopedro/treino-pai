import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
}

const variantClasses: Record<string, string> = {
  primary: 'bg-blue-700 text-white active:bg-blue-800',
  secondary: 'bg-slate-200 text-slate-900 active:bg-slate-300 dark:bg-slate-700 dark:text-white',
  danger: 'bg-red-600 text-white active:bg-red-700',
  success: 'bg-green-700 text-white active:bg-green-800',
}

export function BigButton({ children, variant = 'primary', className = '', ...props }: BigButtonProps) {
  return (
    <button
      className={`min-h-[52px] px-5 py-3 rounded-2xl text-lg font-semibold shadow-sm disabled:opacity-40 disabled:active:bg-none transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
