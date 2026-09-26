import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { isDemo, supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'

export default function Login() {
  const { login } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [keep, setKeep] = useState(true)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    if (isDemo) {
      const name = email.split('@')[0] || '선생님'
      login(name === 'demo' ? '이인제' : name, '뷰티풀매스')
      nav('/')
      return
    }
    setBusy(true)
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password: pw })
    setBusy(false)
    if (error || !data.user) { setErr('이메일 또는 비밀번호가 올바르지 않습니다.'); return }
    const name = (data.user.user_metadata?.name as string) || email.split('@')[0]
    login(name, (data.user.user_metadata?.academy as string) || '뷰티풀매스')
    nav('/')
  }

  return (
    <div className="grid min-h-screen place-items-center bg-white">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 text-white shadow"><Sparkles size={22} /></div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">뷰티풀매스 문제은행</h1>
            <p className="mt-1 text-gray-500">선생님 계정으로 들어오십시오.</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <div className="mb-1.5 text-sm font-semibold text-gray-700">이메일</div>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="!py-3.5" />
          </label>
          <label className="block">
            <div className="mb-1.5 text-sm font-semibold text-gray-700">비밀번호</div>
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호" className="!py-3.5" />
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 font-medium text-gray-700">
              <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="h-4 w-4 accent-brand-600" /> 로그인 유지 (한 달)
            </label>
            <span className="font-semibold text-brand-600">비밀번호를 잊으셨나요?</span>
          </div>
          {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
          <Button type="submit" variant="primary" disabled={busy} className="w-full !rounded-xl !py-4 !text-lg">{busy ? '확인 중…' : '로그인'}</Button>
        </form>
        <p className="mt-6 text-sm leading-relaxed text-gray-400">
          허락된 선생님만 들어오실 수 있습니다.<br />
          {isDemo
            ? '지금은 데모 모드입니다 — 아무 이메일이나 입력하면 들어올 수 있고, Supabase 키를 설정하면 진짜 로그인으로 바뀝니다 (README 참고).'
            : '계정이 필요하시면 원장님께 말씀해 주십시오.'}
        </p>
      </div>
    </div>
  )
}
