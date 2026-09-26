import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import Paper from '../components/Paper'
import { Button } from '../components/ui'
import type { Problem } from '../data/types'
import { useStore } from '../store/useStore'

export default function PrintPaper() {
  const { paperId } = useParams()
  const { state } = useStore()
  const paper = state.papers.find((p) => p.id === paperId)
  const byId = useMemo(() => new Map(state.problems.map((p) => [p.id, p])), [state.problems])

  if (!paper) return <div className="p-10 text-gray-500">학습지를 찾을 수 없습니다. <Link to="/" className="text-brand-600 underline">처음으로</Link></div>
  const problems = paper.problemIds.map((id) => byId.get(id)).filter(Boolean) as Problem[]

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="no-print sticky top-0 z-20 flex items-center gap-3 border-b border-gray-300 bg-white px-6 py-3">
        <Link to="/"><Button><ArrowLeft size={15} /> 학습지 만들기로</Button></Link>
        <div className="font-extrabold text-gray-900">{paper.title}</div>
        <span className="text-sm text-gray-400">{paper.subjectLabel} · {problems.length}문제 · {paper.tag}</span>
        <Button variant="primary" className="ml-auto !px-6" onClick={() => window.print()}><Printer size={16} /> 인쇄 · PDF 저장</Button>
      </div>
      <div className="py-8">
        <Paper spec={{ title: paper.title, author: paper.author, subjectLabel: paper.subjectLabel, color: paper.color, headerStyle: paper.headerStyle, problems, longIds: paper.longIds }} />
      </div>
    </div>
  )
}
