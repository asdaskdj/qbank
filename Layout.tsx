import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FilePlus2, LogOut, NotebookPen, Sparkles, Target } from 'lucide-react'
import { useStore } from '../store/useStore'
import { cx } from './ui'

const MENU = [
  { to: '/', label: '학습지 만들기', icon: NotebookPen, end: true },
  { to: '/problems', label: '문항 등록/관리', icon: FilePlus2 },
  { to: '/naesin', label: '내신대비', icon: Target },
]

export default function Layout() {
  const { state, logout } = useStore()
  const nav = useNavigate()
  return (
    <div className="flex min-h-screen">
      <aside className="no-print sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 text-white shadow-sm"><Sparkles size={19} /></div>
          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight text-gray-900">문제은행</div>
            <div className="text-[9.5px] font-bold tracking-[0.18em] text-brand-400">BEAUTIFUL MATH BANK</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 pt-2">
          {MENU.map((m) => {
            const Icon = m.icon
            return (
              <NavLink key={m.to} to={m.to} end={m.end}
                className={({ isActive }) => cx('flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50')}>
                <Icon size={18} /> {m.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="border-t border-gray-100 px-5 py-4 text-xs leading-relaxed text-gray-400">
          나만의 수학 문제은행<br />등록한 문항·자료는 이 브라우저에 자동 저장됩니다.
        </div>
        {state.user && (
          <button onClick={() => { logout(); nav('/login') }} className="flex items-center gap-2 border-t border-gray-100 px-5 py-3.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
            <LogOut size={15} /> {state.user.name} · 나가기
          </button>
        )}
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
