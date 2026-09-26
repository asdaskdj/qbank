import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Search, Star } from 'lucide-react'
import WizardHeader from '../components/WizardHeader'
import { Badge, Button, Card, Chip, cx, Input } from '../components/ui'
import { CURRICULUM } from '../data/curriculum'
import { useStore } from '../store/useStore'
import type { Problem } from '../data/types'

type Tab = 'unit' | 'school' | 'mock'

export default function Step1() {
  const { state, setWizard } = useStore()
  const nav = useNavigate()
  const [tab, setTab] = useState<Tab>('unit')
  const [level, setLevel] = useState<'중' | '고'>('고')
  const [subject, setSubject] = useState('공통수학1')
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({})
  const [subunitSel, setSubunitSel] = useState<string[]>([]) // key: unit|subunit
  const [examSel, setExamSel] = useState<string[]>([]) // exam keys
  const [schoolQ, setSchoolQ] = useState('')
  const [mockGrade, setMockGrade] = useState('고1')

  const problems = state.problems
  const countBySubject = useMemo(() => {
    const m: Record<string, number> = {}
    problems.forEach((p) => (m[p.subject] = (m[p.subject] ?? 0) + 1))
    return m
  }, [problems])

  const subjects = CURRICULUM.filter((s) => s.level === level)
  const curSubject = CURRICULUM.find((s) => s.name === subject)

  const countUnit = (unit: string) => problems.filter((p) => p.subject === subject && p.unit === unit).length
  const countSub = (unit: string, sub: string) => problems.filter((p) => p.subject === subject && p.unit === unit && p.subunit === sub).length

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  // ---------- school exams ----------
  interface ExamRow { key: string; school: string; region: string; year: number; term: string; subject: string; ids: string[] }
  const schoolExams = useMemo<ExamRow[]>(() => {
    const m = new Map<string, ExamRow>()
    problems.forEach((p) => {
      if (p.source.kind !== 'school') return
      const key = `${p.source.school}|${p.source.year}|${p.source.term}|${p.subject}`
      if (!m.has(key)) m.set(key, { key, school: p.source.school!, region: p.source.region ?? '', year: p.source.year, term: p.source.term ?? '', subject: p.subject, ids: [] })
      m.get(key)!.ids.push(p.id)
    })
    return [...m.values()].sort((a, b) => b.year - a.year || a.school.localeCompare(b.school))
  }, [problems])

  const mockExams = useMemo<ExamRow[]>(() => {
    const m = new Map<string, ExamRow>()
    problems.forEach((p) => {
      if (p.source.kind !== 'mock') return
      const key = `${p.source.gradeLabel}|${p.source.year}|${p.source.month}`
      if (!m.has(key)) m.set(key, { key, school: p.source.gradeLabel!, region: '', year: p.source.year, term: `${p.source.month}월`, subject: p.subject, ids: [] })
      m.get(key)!.ids.push(p.id)
    })
    return [...m.values()].sort((a, b) => b.year - a.year)
  }, [problems])

  // ---------- selection summary ----------
  const selectedProblems = useMemo<Problem[]>(() => {
    if (tab === 'unit') {
      return problems.filter((p) => p.subject === subject && subunitSel.includes(`${p.unit}|${p.subunit}`))
    }
    const rows = tab === 'school' ? schoolExams : mockExams
    const ids = rows.filter((r) => examSel.includes(r.key)).flatMap((r) => r.ids)
    return problems.filter((p) => ids.includes(p.id))
  }, [tab, problems, subject, subunitSel, examSel, schoolExams, mockExams])

  const goNext = () => {
    if (!selectedProblems.length) return
    const label = tab === 'unit' ? subject : selectedProblems[0]?.subject ?? subject
    setWizard({ selectedIds: selectedProblems.map((p) => p.id), longIds: [], subjectLabel: label, step: 2 })
    nav('/wizard/2')
  }

  const filteredSchool = schoolExams.filter((r) => r.subject === subject && (!schoolQ || r.school.includes(schoolQ)))
  const schoolCountBySubject = useMemo(() => {
    const m: Record<string, number> = {}
    schoolExams.forEach((r) => (m[r.subject] = (m[r.subject] ?? 0) + 1))
    return m
  }, [schoolExams])

  return (
    <div>
      <WizardHeader step={1} title="학습지 종류 및 범위 선택" />
      <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[1.6fr_1fr]">
        {/* LEFT */}
        <div className="border-r border-gray-200 bg-white">
          {/* tabs */}
          <div className="flex border-b border-gray-200">
            {([['unit', '단원·유형별'], ['school', '학교별 기출'], ['mock', '모의고사(학평)']] as [Tab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={cx('flex-1 border-b-2 px-6 py-4 text-base font-bold transition', tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600')}>
                {label}
              </button>
            ))}
          </div>

          {/* level + subject chips */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-4">
            {(['중', '고'] as const).map((l) => (
              <button key={l} onClick={() => { setLevel(l); const first = CURRICULUM.find((s) => s.level === l); if (first) setSubject(first.name) }}
                className={cx('rounded-xl border px-4 py-2.5 text-sm font-bold', level === l ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600')}>{l}</button>
            ))}
            <div className="mx-1 h-7 w-px bg-gray-200" />
            {tab === 'mock'
              ? ['고1', '고2', '고3'].map((g) => (
                  <Chip key={g} active={mockGrade === g} onClick={() => setMockGrade(g)} count={mockExams.filter((r) => r.school.startsWith(g)).length}>{g}</Chip>
                ))
              : subjects.map((s) => (
                  <Chip key={s.name} active={subject === s.name} onClick={() => { setSubject(s.name); setSubunitSel([]) }}
                    count={tab === 'school' ? (schoolCountBySubject[s.name] ?? 0) : (countBySubject[s.name] ?? 0)}>
                    {s.name}
                  </Chip>
                ))}
          </div>

          {/* tab bodies */}
          {tab === 'unit' && curSubject && (
            <div className="p-4">
              {curSubject.units.map((u) => {
                const open = openUnits[u.name] ?? false
                const subKeys = u.subunits.map((s) => `${u.name}|${s}`)
                const allSel = subKeys.length > 0 && subKeys.every((k) => subunitSel.includes(k))
                return (
                  <div key={u.name} className="border-b border-gray-100">
                    <div className={cx('flex items-center gap-3 px-3 py-4', open && 'bg-gray-50/70')}>
                      <button onClick={() => setOpenUnits((o) => ({ ...o, [u.name]: !open }))} className="text-gray-400">
                        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <input type="checkbox" checked={allSel}
                        onChange={() => setSubunitSel((sel) => (allSel ? sel.filter((k) => !subKeys.includes(k)) : [...new Set([...sel, ...subKeys])]))}
                        className="h-4.5 w-4.5 accent-brand-600" />
                      <span className="text-base font-bold text-gray-900">{u.name}</span>
                      <Badge>소단원 {u.subunits.length}개</Badge>
                      <Badge tone="brand">문제 {countUnit(u.name).toLocaleString()}개</Badge>
                    </div>
                    {open && (
                      <div className="grid gap-1 pb-3 pl-12 pr-4 md:grid-cols-2">
                        {u.subunits.map((s) => {
                          const k = `${u.name}|${s}`
                          const n = countSub(u.name, s)
                          return (
                            <label key={k} className={cx('flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-50/60', subunitSel.includes(k) ? 'text-brand-700' : 'text-gray-700')}>
                              <input type="checkbox" checked={subunitSel.includes(k)} onChange={() => setSubunitSel((sel) => toggle(sel, k))} className="h-4 w-4 accent-brand-600" />
                              <span className="flex-1">{s}</span>
                              <span className={cx('text-xs', n ? 'text-gray-400' : 'text-gray-300')}>{n}문제</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'school' && (
            <div className="p-5">
              <Card className="mb-4 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  <b>시험 일정</b>
                  <span className="text-gray-400">오늘 {new Date().toISOString().slice(0, 10)} · 시험이 다가오는 학교의 기출을 먼저 확인해 보세요.</span>
                </div>
              </Card>
              <div className="relative mb-3 w-72">
                <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
                <Input value={schoolQ} onChange={(e) => setSchoolQ(e.target.value)} placeholder="학교 이름으로 찾기" className="!pl-9" />
              </div>
              <p className="mb-2 text-sm text-gray-500">{filteredSchool.length}회분 — 고른 시험지의 문항이 그대로 학습지에 담깁니다</p>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-xs font-bold text-gray-400">
                  <tr><th className="w-10 py-2.5"></th><th>학교</th><th>연도</th><th>시기</th><th>과목</th><th>문항</th><th>지역</th></tr>
                </thead>
                <tbody>
                  {filteredSchool.map((r) => (
                    <tr key={r.key} className="cursor-pointer border-b border-gray-100 hover:bg-brand-50/40" onClick={() => setExamSel((s) => toggle(s, r.key))}>
                      <td className="py-3.5"><input type="checkbox" readOnly checked={examSel.includes(r.key)} className="h-4 w-4 accent-brand-600" /></td>
                      <td className="font-bold text-gray-900">{r.school}</td>
                      <td>{r.year}</td><td>{r.term}</td>
                      <td className="text-gray-500">{r.subject}</td>
                      <td>{r.ids.length}</td><td className="text-gray-500">{r.region}</td>
                    </tr>
                  ))}
                  {filteredSchool.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400">이 과목의 기출 시험지가 아직 없습니다. 문항 등록에서 추가해 보세요.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'mock' && (
            <div className="p-5">
              <p className="mb-2 text-sm text-gray-500">{mockExams.filter((r) => r.school.startsWith(mockGrade)).length}회분 — 고른 시험지의 문항이 그대로 학습지에 담깁니다</p>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-xs font-bold text-gray-400">
                  <tr><th className="w-10 py-2.5"></th><th>시험</th><th>연도</th><th>월</th><th>문항</th></tr>
                </thead>
                <tbody>
                  {mockExams.filter((r) => r.school.startsWith(mockGrade)).map((r) => (
                    <tr key={r.key} className="cursor-pointer border-b border-gray-100 hover:bg-brand-50/40" onClick={() => setExamSel((s) => toggle(s, r.key))}>
                      <td className="py-3.5"><input type="checkbox" readOnly checked={examSel.includes(r.key)} className="h-4 w-4 accent-brand-600" /></td>
                      <td className="font-bold text-gray-900">{r.school}</td>
                      <td>{r.year}</td><td>{r.term}</td><td>{r.ids.length}</td>
                    </tr>
                  ))}
                  {mockExams.filter((r) => r.school.startsWith(mockGrade)).length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-400">이 학년의 모의고사가 아직 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT summary */}
        <div className="flex flex-col bg-gray-50/60">
          <div className="flex-1 p-6">
            {selectedProblems.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-gray-400">
                <div className="space-y-16">
                  <p>{tab === 'unit' ? '단원과 유형을 선택해 주세요.' : '시험지를 선택해 주세요.'}</p>
                  <p className="text-sm">{tab === 'unit' ? '왼쪽 나무에서 네모 칸을 누르면 고를 수 있습니다.' : '여러 회를 함께 고를 수 있습니다.'}</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="mb-3 text-lg font-extrabold text-gray-900">선택한 범위</h3>
                <Card className="divide-y divide-gray-100">
                  {tab === 'unit'
                    ? Object.entries(selectedProblems.reduce<Record<string, number>>((m, p) => ((m[`${p.unit} · ${p.subunit}`] = (m[`${p.unit} · ${p.subunit}`] ?? 0) + 1), m), {})).map(([k, n]) => (
                        <div key={k} className="flex items-center justify-between px-4 py-3 text-sm"><span className="font-medium text-gray-800">{k}</span><Badge tone="brand">{n}문제</Badge></div>
                      ))
                    : (tab === 'school' ? schoolExams : mockExams).filter((r) => examSel.includes(r.key)).map((r) => (
                        <div key={r.key} className="flex items-center justify-between px-4 py-3 text-sm"><span className="font-medium text-gray-800">{r.school} {r.year} {r.term}</span><Badge tone="brand">{r.ids.length}문제</Badge></div>
                      ))}
                </Card>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
            <span className="text-base font-bold text-gray-800">문제 수 <span className="text-brand-600">{selectedProblems.length}</span> 개</span>
            <Button variant="primary" className="!px-6 !py-3 !text-base" disabled={!selectedProblems.length} onClick={goNext}>다음 단계 →</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
