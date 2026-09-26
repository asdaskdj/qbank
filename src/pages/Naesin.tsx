import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileWarning, Plus, Printer, Trash2, UserPlus } from 'lucide-react'
import { Badge, Button, Card, cx, Input, Select } from '../components/ui'
import type { Problem } from '../data/types'
import { useStore } from '../store/useStore'

export default function Naesin() {
  const { state, addStudent, removeStudent, toggleWrong, setWizard } = useStore()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('중2')
  const [selStudent, setSelStudent] = useState<string>('')
  const [selPaper, setSelPaper] = useState<string>('')
  const byId = useMemo(() => new Map(state.problems.map((p) => [p.id, p])), [state.problems])

  const student = state.students.find((s) => s.id === selStudent)
  const paper = state.papers.find((p) => p.id === selPaper)
  const wrongIds = (selPaper && selStudent && state.wrong[selPaper]?.[selStudent]) || []
  const allWrongOfStudent = useMemo(() => {
    if (!selStudent) return []
    const ids = new Set<string>()
    Object.values(state.wrong).forEach((byStu) => (byStu[selStudent] ?? []).forEach((id) => ids.add(id)))
    return [...ids].map((id) => byId.get(id)).filter(Boolean) as Problem[]
  }, [state.wrong, selStudent, byId])

  const makeRetest = () => {
    if (!student || !allWrongOfStudent.length) return
    setWizard({
      selectedIds: allWrongOfStudent.map((p) => p.id), longIds: [],
      title: `${student.name} 오답 재시험`, tag: '오답', subjectLabel: allWrongOfStudent[0].subject, step: 2,
    })
    nav('/wizard/2')
  }

  return (
    <div className="p-7">
      <div className="mb-1 text-2xl font-extrabold text-gray-900">내신대비</div>
      <p className="mb-6 text-sm text-gray-500">학생별 오답 관리 · 오답 문항으로 재시험 만들기</p>

      {/* 학생 관리 */}
      <Card className="mb-6 p-5">
        <b className="text-lg">학생 관리</b>
        <p className="mt-1 text-sm text-gray-500">학생을 추가하고, 저장한 학습지에서 틀린 문항을 체크하면 그 학생의 <b>오답 문항만 모아보기</b>와 <b>오답 재시험지 만들기</b>를 할 수 있습니다.</p>
        <div className="mt-4 flex items-end gap-3">
          <div><div className="mb-1 text-xs font-semibold text-gray-500">이름</div><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 김민준" className="!w-48" /></div>
          <div><div className="mb-1 text-xs font-semibold text-gray-500">학년</div>
            <Select value={grade} onChange={(e) => setGrade(e.target.value)}>{['중1', '중2', '중3', '고1', '고2', '고3'].map((g) => <option key={g}>{g}</option>)}</Select></div>
          <Button variant="primary" onClick={() => { if (name.trim()) { addStudent(name.trim(), grade); setName('') } }}><UserPlus size={15} /> 학생 추가</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {state.students.length === 0 && <span className="text-sm text-gray-400">아직 등록된 학생이 없습니다.</span>}
          {state.students.map((s) => (
            <span key={s.id} className={cx('group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold cursor-pointer',
              selStudent === s.id ? 'border-brand-300 bg-brand-50 text-brand-700 ring-2 ring-brand-100' : 'border-gray-200 text-gray-700 hover:bg-gray-50')}
              onClick={() => setSelStudent(selStudent === s.id ? '' : s.id)}>
              {s.name} <span className="text-xs text-gray-400">{s.grade}</span>
              <button onClick={(e) => { e.stopPropagation(); removeStudent(s.id) }} className="hidden text-gray-300 hover:text-red-500 group-hover:inline"><Trash2 size={13} /></button>
            </span>
          ))}
        </div>
      </Card>

      {/* 오답 체크 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <b className="text-lg">오답 체크</b>
          <p className="mt-1 text-sm text-gray-500">학생과 학습지를 고른 뒤, 틀린 문항 번호를 눌러 표시하세요.</p>
          {state.papers.length === 0 ? (
            <p className="mt-6 flex items-center gap-2 text-sm text-gray-400"><FileWarning size={16} /> 저장된 학습지가 없습니다. 먼저 학습지를 만들어 주세요.</p>
          ) : (
            <>
              <div className="mt-4 flex gap-2">
                <Select value={selStudent} onChange={(e) => setSelStudent(e.target.value)}>
                  <option value="">학생 선택</option>
                  {state.students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                </Select>
                <Select value={selPaper} onChange={(e) => setSelPaper(e.target.value)} className="min-w-0 flex-1">
                  <option value="">학습지 선택</option>
                  {state.papers.map((p) => <option key={p.id} value={p.id}>{p.title} · {p.problemIds.length}문제 ({p.createdAt})</option>)}
                </Select>
              </div>
              {student && paper && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {paper.problemIds.map((pid, i) => {
                      const wrong = wrongIds.includes(pid)
                      return (
                        <button key={pid} onClick={() => toggleWrong(paper.id, student.id, pid)}
                          className={cx('h-10 w-10 rounded-lg border text-sm font-bold transition',
                            wrong ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300')}>
                          {i + 1}
                        </button>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-sm text-gray-500">틀린 문항 <b className="text-red-600">{wrongIds.length}</b>개 / {paper.problemIds.length}문항</p>
                </div>
              )}
            </>
          )}
        </Card>

        <Card className="p-5">
          <b className="text-lg">오답 모아보기 · 재시험</b>
          {!student ? (
            <p className="mt-6 text-sm text-gray-400">왼쪽에서 학생을 선택하면 모든 학습지의 오답이 모입니다.</p>
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-500"><b>{student.name}</b> 학생의 누적 오답 <b className="text-red-600">{allWrongOfStudent.length}</b>문항</p>
              <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {allWrongOfStudent.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
                    <Badge tone="brand">{p.subunit}</Badge>
                    <span className="truncate text-gray-600">{p.body.replace(/\$[^$]*\$/g, ' … ').slice(0, 40)}</span>
                  </div>
                ))}
                {allWrongOfStudent.length === 0 && <p className="py-6 text-center text-sm text-gray-400">아직 체크된 오답이 없습니다.</p>}
              </div>
              <Button variant="primary" className="mt-4 w-full !py-3" disabled={!allWrongOfStudent.length} onClick={makeRetest}>
                <Plus size={16} /> 오답 문항으로 재시험지 만들기
              </Button>
            </>
          )}
        </Card>
      </div>

      {/* 저장된 학습지 */}
      <Card className="mt-6 p-5">
        <b className="text-lg">저장된 학습지</b>
        <table className="mt-3 w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-xs font-bold text-gray-400">
            <tr><th className="py-2">학습지명</th><th>과목</th><th>태그</th><th>문항</th><th>만든 날짜</th><th></th></tr>
          </thead>
          <tbody>
            {state.papers.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="py-3 font-bold text-gray-900">{p.title}</td>
                <td>{p.subjectLabel}</td>
                <td><Badge tone="brand">{p.tag}</Badge></td>
                <td>{p.problemIds.length}</td>
                <td className="text-gray-500">{p.createdAt}</td>
                <td className="text-right"><Button variant="ghost" className="!px-2 !py-1" onClick={() => nav(`/print/${p.id}`)}><Printer size={15} /></Button></td>
              </tr>
            ))}
            {state.papers.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">아직 만든 학습지가 없습니다.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
