import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { cx } from './ui'

const STEPS = ['범위 선택', '상세 편집', '구성 설정']

export default function WizardHeader({ step, title }: { step: 1 | 2 | 3; title: string }) {
  const { state } = useStore()
  const nav = useNavigate()
  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/95 px-6 backdrop-blur">
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-extrabold tracking-wide text-brand-600">STEP {step}</span>
        <span className="text-lg font-extrabold text-gray-900">{title}</span>
      </div>
      <span className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-500">뷰티풀매스 문제은행</span>
      <div className="mx-auto flex items-center gap-5">
        {STEPS.map((s, i) => {
          const n = (i + 1) as 1 | 2 | 3
          const active = n === step
          const done = n < step
          return (
            <button key={s} onClick={() => { if (done) nav(n === 1 ? '/' : `/wizard/${n}`) }}
              className={cx('flex items-center gap-2 text-[15px] font-bold', active ? 'text-gray-900' : done ? 'text-brand-500' : 'text-gray-300', !done && !active && 'cursor-default')}>
              <span className={cx('grid h-6 w-6 place-items-center rounded-full text-xs font-extrabold', active ? 'bg-navy-900 text-white' : done ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400')}>{n}</span>
              {s}
            </button>
          )
        })}
      </div>
      {state.user && (
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">{state.user.name.slice(0, 1)}</span>
          <span className="text-sm font-bold text-gray-800">{state.user.name}T</span>
          <span className="text-sm text-gray-400">· {state.user.academy}</span>
        </div>
      )}
    </header>
  )
}
