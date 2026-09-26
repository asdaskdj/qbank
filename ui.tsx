import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(16,24,40,.05)]', className)}>{children}</div>
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
export function Button({ variant = 'secondary', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-40'
  const v: Record<Variant, string> = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
    dark: 'bg-navy-900 text-white hover:bg-navy-800',
  }
  return <button className={cx(base, v[variant], className)} {...rest} />
}

export function Chip({ active, onClick, children, count, className }: { active?: boolean; onClick?: () => void; children: ReactNode; count?: number; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={cx('inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition',
        active ? 'border-brand-300 bg-brand-50 text-brand-700 ring-2 ring-brand-100' : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50/50', className)}>
      {children}
      {count !== undefined && <span className={cx('text-xs font-medium', active ? 'text-brand-500' : 'text-gray-400')}>{count.toLocaleString()}</span>}
    </button>
  )
}

export function Badge({ children, tone = 'gray', className }: { children: ReactNode; tone?: 'gray' | 'green' | 'red' | 'amber' | 'brand' | 'sky' | 'navy'; className?: string }) {
  const t = {
    gray: 'bg-gray-100 text-gray-600', green: 'bg-emerald-50 text-emerald-700', red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-700', brand: 'bg-brand-50 text-brand-700', sky: 'bg-sky-50 text-sky-700',
    navy: 'bg-navy-900 text-white',
  }[tone]
  return <span className={cx('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold', t, className)}>{children}</span>
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx('w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100', props.className)} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx('rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100', props.className)} />
}

export const DIFF_COLORS: Record<string, string> = {
  '하': '#a8bfd4', '중하': '#3d8fa8', '중': '#59c27c', '중상': '#7cb342', '상': '#f5a623', '최상': '#e64a19',
}
