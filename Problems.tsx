import { useMemo, useState } from 'react'
import { ClipboardCopy, Trash2, Upload } from 'lucide-react'
import { Math as M } from '../components/Math'
import { Badge, Button, Card, Chip, DIFF_COLORS, Input } from '../components/ui'
import { DIFFS, type Diff, type Problem } from '../data/types'
import { sourceLabel, useStore } from '../store/useStore'

const GPT_GUIDE = `아래 규칙대로, 시험지 사진의 문항을 JSON 배열로 변환해 주세요.

규칙:
1. 수식은 반드시 $...$ 안에 KaTeX 문법으로 쓰세요. (예: $x^2-3x+1=0$, 분수는 $\\dfrac{a}{b}$)
2. 그림·표가 필요한 문항은 그리지 말고 "needimg": true 로만 표시하세요. SVG를 만들지 마세요.
3. 객관식은 choices 배열(5개)과 answer("①"~"⑤"), 주관식은 choices 없이 answer에 값만.
4. diff는 "하","중하","중","중상","상","최상" 중 하나. points는 배점(숫자).
5. subject/unit/subunit은 교육과정 이름 그대로. (예: "공통수학1" / "다항식" / "나머지정리")
6. source는 {"kind":"school","school":"OO고","region":"서울","year":2026,"term":"1중간","number":문항번호}
   모의고사는 {"kind":"mock","gradeLabel":"고1 학평","year":2025,"month":6,"number":번호}

형식 예시:
[
  {
    "subject": "공통수학1", "unit": "다항식", "subunit": "나머지정리",
    "type": "객관식", "diff": "중", "points": 4.4,
    "body": "다항식 $P(x)$ 를 $x-1$ 로 나눈 나머지는 $3$ 이다. ...",
    "choices": ["$1$", "$2$", "$3$", "$4$", "$5$"],
    "answer": "③",
    "solution": "$R(x)=2x+1$ 이므로 ...",
    "needimg": false,
    "source": {"kind": "school", "school": "황금중", "region": "대구", "year": 2026, "term": "2중간", "number": 1}
  }
]`

export default function Problems() {
  const { state, addProblems, removeProblem } = useStore()
  const [tab, setTab] = useState<'list' | 'json'>('list')
  const [q, setQ] = useState('')
  const [subject, setSubject] = useState('')
  const [json, setJson] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const subjects = useMemo(() => [...new Set(state.problems.map((p) => p.subject))], [state.problems])
  const list = state.problems.filter((p) => (!subject || p.subject === subject) && (!q || `${p.unit} ${p.subunit} ${p.body} ${sourceLabel(p)}`.includes(q)))

  const importJson = () => {
    try {
      const arr = JSON.parse(json)
      if (!Array.isArray(arr)) throw new Error('JSON 배열이 아닙니다')
      const ps: Problem[] = arr.map((r: Record<string, unknown>, i: number) => {
        if (!r.body || !r.subject || !r.unit || !r.subunit) throw new Error(`${i + 1}번째 문항에 body/subject/unit/subunit 이 없습니다`)
        return {
          id: '',
          subject: String(r.subject), unit: String(r.unit), subunit: String(r.subunit),
          type: r.type === '주관식' ? '주관식' : '객관식',
          diff: (DIFFS.includes(r.diff as Diff) ? r.diff : '중') as Problem['diff'],
          points: Number(r.points) || 4.3,
          body: String(r.body),
          choices: Array.isArray(r.choices) ? (r.choices as string[]).map(String) : undefined,
          answer: String(r.answer ?? ''),
          solution: r.solution ? String(r.solution) : undefined,
          needimg: !!r.needimg,
          source: (r.source && typeof r.source === 'object') ? (r.source as Problem['source']) : { kind: 'custom', year: new Date().getFullYear() },
        }
      })
      addProblems(ps)
      setMsg({ ok: true, text: `${ps.length}문항을 등록했습니다.` })
      setJson('')
    } catch (e) {
      setMsg({ ok: false, text: `등록 실패: ${(e as Error).message}` })
    }
  }

  return (
    <div className="p-7">
      <div className="mb-1 text-2xl font-extrabold text-gray-900">문항 등록/관리</div>
      <p className="mb-5 text-sm text-gray-500">사진 → GPT 변환 → JSON 붙여넣기 한 번으로 문항이 은행에 쌓입니다. 등록한 문항은 학습지 만들기에서 바로 검색됩니다.</p>

      <div className="mb-5 flex gap-2">
        <Chip active={tab === 'list'} onClick={() => setTab('list')} count={state.problems.length}>문항 목록</Chip>
        <Chip active={tab === 'json'} onClick={() => setTab('json')}>JSON 대량 등록</Chip>
      </div>

      {tab === 'json' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <b>GPT 변환 지침</b>
              <Button onClick={() => { navigator.clipboard?.writeText(GPT_GUIDE).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
                <ClipboardCopy size={15} /> {copied ? '복사됨!' : '지침 복사'}
              </Button>
            </div>
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">{GPT_GUIDE}</pre>
          </Card>
          <Card className="flex flex-col p-5">
            <b className="mb-2">JSON 붙여넣기</b>
            <textarea value={json} onChange={(e) => setJson(e.target.value)} placeholder='[ { "subject": "공통수학1", ... } ]'
              className="min-h-[360px] flex-1 rounded-xl border border-gray-200 p-4 font-mono text-xs outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            {msg && <p className={`mt-2 text-sm font-semibold ${msg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</p>}
            <Button variant="primary" className="mt-3 self-end !px-6" onClick={importJson} disabled={!json.trim()}><Upload size={15} /> 등록하기</Button>
          </Card>
        </div>
      )}

      {tab === 'list' && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="단원·유형·본문·출처 검색" className="!w-72" />
            <Chip active={subject === ''} onClick={() => setSubject('')}>전체</Chip>
            {subjects.map((s) => <Chip key={s} active={subject === s} onClick={() => setSubject(s)} count={state.problems.filter((p) => p.subject === s).length}>{s}</Chip>)}
          </div>
          <div className="space-y-3">
            {list.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="mb-1.5 flex items-center gap-2 text-xs">
                  <Badge tone="brand">{p.subject}</Badge>
                  <Badge>{p.unit} · {p.subunit}</Badge>
                  <span className="font-bold" style={{ color: DIFF_COLORS[p.diff] }}>{p.diff}</span>
                  <span className="text-gray-400">{p.type} · {p.points}점 · {sourceLabel(p)}</span>
                  {p.needimg && <Badge tone="red">🖼 그림 추가 필요</Badge>}
                  <button onClick={() => removeProblem(p.id)} className="ml-auto text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
                <div className="text-[13.5px] leading-relaxed text-gray-700"><M text={p.body} /></div>
                <div className="mt-1.5 text-xs text-gray-400">정답 <span className="font-semibold text-gray-600"><M text={p.answer} /></span></div>
              </Card>
            ))}
            {list.length === 0 && <p className="py-14 text-center text-gray-400">문항이 없습니다.</p>}
          </div>
        </>
      )}
    </div>
  )
}
