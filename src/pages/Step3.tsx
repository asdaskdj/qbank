import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import WizardHeader from '../components/WizardHeader'
import Paper from '../components/Paper'
import { Button, Card, cx, Input } from '../components/ui'
import { PAPER_COLORS, TAGS } from '../data/curriculum'
import type { Problem } from '../data/types'
import { useStore } from '../store/useStore'
import { paginate } from '../lib/paper'

export default function Step3() {
  const { state, setWizard, savePaper } = useStore()
  const nav = useNavigate()
  const w = state.wizard
  const byId = useMemo(() => new Map(state.problems.map((p) => [p.id, p])), [state.problems])
  const problems = w.selectedIds.map((id) => byId.get(id)).filter(Boolean) as Problem[]
  const pageCount = paginate(problems, w.longIds).length

  const spec = {
    title: w.title || '새 학습지',
    author: w.author,
    subjectLabel: w.subjectLabel,
    color: w.color,
    headerStyle: w.headerStyle,
    problems,
    longIds: w.longIds,
  }

  const create = () => {
    const id = Math.random().toString(36).slice(2, 10)
    savePaper({
      id, title: spec.title, author: w.author, subjectLabel: w.subjectLabel, tag: w.tag,
      color: w.color, headerStyle: w.headerStyle, problemIds: w.selectedIds, longIds: w.longIds,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    nav(`/print/${id}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <WizardHeader step={3} title="학습지 설정" />
      <div className="grid flex-1 lg:grid-cols-[1fr_1fr]">
        {/* LEFT form */}
        <div className="space-y-6 border-r border-gray-200 bg-white p-7">
          <div className="grid grid-cols-2 gap-5">
            <Field label="학습지명"><Input value={w.title} onChange={(e) => setWizard({ title: e.target.value })} placeholder="예: 황금중 2학기 중간고사 대비" /></Field>
            <Field label="출제자"><Input value={w.author} onChange={(e) => setWizard({ author: e.target.value })} placeholder="예: 이인제T" /></Field>
            <Field label="학원 이름 🔒 로그인한 학원"><Input value={state.user?.academy ?? ''} disabled className="bg-gray-50 text-gray-500" /></Field>
            <Field label="과목 표시"><Input value={w.subjectLabel} onChange={(e) => setWizard({ subjectLabel: e.target.value })} placeholder="예: 공통수학1 / 중2" /></Field>
          </div>

          <div>
            <div className="mb-2 font-extrabold text-gray-900">학습지 태그</div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button key={t} onClick={() => setWizard({ tag: t })}
                  className={cx('rounded-full border px-4 py-2 text-sm font-semibold', w.tag === t ? 'border-brand-300 bg-brand-50 text-brand-700 ring-2 ring-brand-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>{t}</button>
              ))}
            </div>
          </div>

          <Card className="space-y-5 bg-gray-50/60 p-5">
            <div className="font-extrabold text-gray-900">학습지 디자인</div>
            <div>
              <div className="mb-2 text-sm font-semibold text-gray-600">색상</div>
              <div className="flex gap-2.5">
                {PAPER_COLORS.map((c) => (
                  <button key={c} onClick={() => setWizard({ color: c })}
                    className={cx('h-9 w-9 rounded-full border-4 transition', w.color === c ? 'border-gray-900 scale-110' : 'border-white shadow')} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-gray-600">머리 모양</div>
              <div className="flex gap-3">
                <HeaderThumb active={w.headerStyle === 'exam'} onClick={() => setWizard({ headerStyle: 'exam' })} label="수학 영역형">
                  <div className="mx-auto mt-1 h-1 w-14 rounded bg-gray-300" />
                  <div className="mx-auto mt-1 h-2.5 w-20 rounded bg-gray-800" />
                </HeaderThumb>
                <HeaderThumb active={w.headerStyle === 'bar'} onClick={() => setWizard({ headerStyle: 'bar' })} label="제목 바형">
                  <div className="ml-2 mt-2 flex items-center gap-1"><div className="h-3 w-1 rounded bg-gray-800" /><div className="h-2 w-16 rounded bg-gray-400" /></div>
                </HeaderThumb>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT preview */}
        <div className="flex flex-col bg-gray-100">
          <div className="px-6 pt-5 text-lg font-extrabold text-gray-900">학습지 미리보기 <span className="ml-1 text-sm font-semibold text-gray-400">{pageCount}쪽 + 정답 1쪽</span></div>
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div style={{ transform: 'scale(0.62)', transformOrigin: 'top center', width: '100%', pointerEvents: 'none' }}>
              <Paper spec={spec} />
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-gray-200 bg-white px-6 py-4">
            <Button onClick={() => { setWizard({ step: 2 }); nav('/wizard/2') }}>이전</Button>
            <span className="ml-auto text-base font-bold text-gray-800">학습지 문제 수 <span className="text-brand-600">{problems.length}</span> 개</span>
            <Button variant="primary" className="!bg-teal-700 !px-6 !py-3 !text-base hover:!bg-teal-800" disabled={!problems.length} onClick={create}>
              학습지 만들기 (인쇄 · PDF)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1.5 font-extrabold text-gray-900">{label}</div>{children}</label>
}

function HeaderThumb({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={cx('w-32 rounded-xl border-2 bg-white p-2 pb-1 text-center', active ? 'border-teal-600' : 'border-gray-200')}>
      <div className="h-14 overflow-hidden rounded-md border border-gray-100">{children}</div>
      <div className={cx('mt-1 text-xs font-semibold', active ? 'text-teal-700' : 'text-gray-500')}>{label}</div>
    </button>
  )
}
