import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, Columns2, Copy, Plus, Trash2 } from 'lucide-react'
import WizardHeader from '../components/WizardHeader'
import { Math as M, CIRCLED } from '../components/Math'
import { Badge, Button, cx, DIFF_COLORS, Input } from '../components/ui'
import { DIFFS } from '../data/types'
import type { Problem } from '../data/types'
import { sourceLabel, useStore } from '../store/useStore'
import { isLongProblem } from '../lib/paper'

type Tab = 'summary' | 'add' | 'similar'

export default function Step2() {
  const { state, setWizard } = useStore()
  const nav = useNavigate()
  const [tab, setTab] = useState<Tab>('summary')
  const [q, setQ] = useState('')
  const { selectedIds, longIds } = state.wizard
  const byId = useMemo(() => new Map(state.problems.map((p) => [p.id, p])), [state.problems])
  const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean) as Problem[]

  const diffCount = DIFFS.map((d) => [d, selected.filter((p) => p.diff === d).length] as const)
  const maxDiff = Math.max(1, ...diffCount.map(([, n]) => n))
  const nChoice = selected.filter((p) => p.type === '객관식').length

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= selectedIds.length) return
    const ids = [...selectedIds]
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    setWizard({ selectedIds: ids })
  }
  const remove = (id: string) => setWizard({ selectedIds: selectedIds.filter((x) => x !== id), longIds: longIds.filter((x) => x !== id) })
  const toggleLong = (id: string) => setWizard({ longIds: longIds.includes(id) ? longIds.filter((x) => x !== id) : [...longIds, id] })
  const addProblem = (id: string) => { if (!selectedIds.includes(id)) setWizard({ selectedIds: [...selectedIds, id] }) }

  const candidates = useMemo(() => state.problems.filter((p) => !selectedIds.includes(p.id)), [state.problems, selectedIds])
  const searchResults = candidates.filter((p) => !q || `${p.subject} ${p.unit} ${p.subunit} ${p.body} ${sourceLabel(p)}`.includes(q))
  const similar = useMemo(() => {
    const subs = new Set(selected.map((p) => `${p.subject}|${p.unit}|${p.subunit}`))
    return candidates.filter((p) => subs.has(`${p.subject}|${p.unit}|${p.subunit}`))
  }, [candidates, selected])

  const summaryLine = diffCount.filter(([, n]) => n > 0).map(([d, n]) => `${d}${n}`).join(' · ')

  return (
    <div className="flex min-h-screen flex-col">
      <WizardHeader step={2} title="학습지 상세 편집" />
      <div className="grid flex-1 lg:grid-cols-[1fr_1.15fr]">
        {/* LEFT */}
        <div className="border-r border-gray-200 bg-white">
          <div className="flex border-b border-gray-200">
            {([['summary', '단원 요약'], ['add', '새 문제 추가'], ['similar', '쌍둥이 · 유사']] as [Tab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={cx('flex-1 border-b-2 px-4 py-4 text-base font-bold transition', tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600')}>{label}</button>
            ))}
          </div>

          {tab === 'summary' && (
            <div className="p-5">
              <div className="mb-5 grid grid-cols-[200px_1fr] gap-4 rounded-2xl border border-gray-200 p-5">
                <div>
                  <div className="font-extrabold text-gray-900">문제 통계</div>
                  <div className="mt-3 text-sm text-gray-500">총 문제 수</div>
                  <div className="text-4xl font-black text-gray-900">{selected.length} <span className="text-base font-bold">문제</span></div>
                  <div className="mt-1 text-sm text-gray-500">객관식 {nChoice} · 주관식 {selected.length - nChoice}</div>
                </div>
                <div className="flex items-end justify-around gap-2 border-l border-gray-100 pl-4">
                  {diffCount.map(([d, n]) => (
                    <div key={d} className="flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-gray-500">{n}문제</span>
                      <div className="w-8 rounded-t-md" style={{ height: `${(n / maxDiff) * 90 + 4}px`, background: n ? DIFF_COLORS[d] : '#eee' }} />
                      <span className="text-xs text-gray-500">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-xs font-bold text-gray-400">
                  <tr><th className="py-2.5 pl-2">번호</th><th>문제 타입</th><th>난이도</th><th>유형명</th><th className="text-right pr-2">순서 변경</th></tr>
                </thead>
                <tbody>
                  {selected.map((p, i) => (
                    <tr key={p.id} className="border-b border-gray-100">
                      <td className="py-3 pl-2 font-bold text-gray-700">{i + 1}</td>
                      <td>{p.type}</td>
                      <td><span className="font-semibold" style={{ color: DIFF_COLORS[p.diff] }}>{p.diff}</span></td>
                      <td className="font-medium text-gray-800">{p.subunit}</td>
                      <td className="pr-2 text-right">
                        <button onClick={() => move(i, -1)} className="p-1 text-gray-400 hover:text-brand-600"><ArrowUp size={15} /></button>
                        <button onClick={() => move(i, 1)} className="p-1 text-gray-400 hover:text-brand-600"><ArrowDown size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(tab === 'add' || tab === 'similar') && (
            <div className="p-5">
              {tab === 'add' && <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="단원·유형·본문·출처로 검색 (예: 나머지정리, 경기고)" className="mb-4" />}
              {tab === 'similar' && <p className="mb-4 text-sm text-gray-500">지금 담긴 문제와 같은 유형의 문제를 은행에서 찾았습니다. 숫자만 다른 쌍둥이 문제를 등록해 두면 여기에 모입니다.</p>}
              <div className="space-y-3">
                {(tab === 'add' ? searchResults : similar).slice(0, 30).map((p) => (
                  <div key={p.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-1.5 flex items-center gap-2 text-xs">
                      <Badge tone="brand">{p.subunit}</Badge>
                      <span className="font-semibold" style={{ color: DIFF_COLORS[p.diff] }}>{p.diff}</span>
                      <span className="text-gray-400">{p.type} · {sourceLabel(p)}</span>
                      <Button variant="primary" className="!ml-auto !rounded-lg !px-2.5 !py-1 !text-xs" onClick={() => addProblem(p.id)}><Plus size={13} /> 담기</Button>
                    </div>
                    <div className="text-[13.5px] leading-relaxed text-gray-700"><M text={p.body} /></div>
                  </div>
                ))}
                {(tab === 'add' ? searchResults : similar).length === 0 && <p className="py-10 text-center text-sm text-gray-400">{tab === 'add' ? '검색 결과가 없습니다.' : '아직 같은 유형의 여분 문제가 없습니다.'}</p>}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT dark panel */}
        <div className="flex flex-col bg-navy-900">
          <div className="flex items-center justify-between px-6 py-4">
            <h3 className="text-lg font-extrabold text-white">선택한 문제 목록</h3>
            <span className="text-xs text-gray-400">긴 문제는 <Columns2 size={12} className="inline" /> 버튼으로 한 단을 통째로 쓰게 할 수 있습니다</span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6" style={{ maxHeight: 'calc(100vh - 190px)' }}>
            {selected.map((p, i) => {
              const long = longIds.includes(p.id) || isLongProblem(p)
              return (
                <div key={p.id} className="rounded-2xl bg-white p-5 shadow">
                  <div className="mb-3 flex items-baseline gap-3">
                    <span className="text-2xl font-black text-gray-900">{i + 1}</span>
                    <span className="font-bold text-gray-800">{p.subunit}</span>
                    <span className="ml-auto text-xs font-semibold text-sky-600">{sourceLabel(p)}</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex w-14 shrink-0 flex-col items-center gap-1.5">
                      <span className="w-full rounded-md py-1 text-center text-xs font-bold text-white" style={{ background: DIFF_COLORS[p.diff] }}>{p.diff}</span>
                      <span className="w-full rounded-md border border-gray-200 py-1 text-center text-[11px] font-semibold text-gray-600">{p.type}</span>
                      <span className="w-full rounded-md border border-gray-200 py-1 text-center text-[11px] font-semibold text-gray-600">{p.points}점</span>
                    </div>
                    <div className="min-w-0 flex-1 text-[14.5px] leading-relaxed text-gray-800">
                      <M text={`${p.body} [${p.points.toFixed(2)}점]`} />
                      {p.choices && (
                        <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1">
                          {p.choices.map((c, ci) => <span key={ci}><M text={`${CIRCLED[ci]} ${c}`} /></span>)}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <button onClick={() => remove(p.id)} className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:border-red-200 hover:text-red-500" title="빼기"><Trash2 size={15} /></button>
                      <button onClick={() => toggleLong(p.id)} disabled={isLongProblem(p)}
                        className={cx('rounded-lg border p-2', long ? 'border-brand-300 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-400 hover:text-brand-600')}
                        title={isLongProblem(p) ? '내용이 길어 자동으로 한 단을 씁니다' : '한 단 통째로 쓰기'}>
                        <Columns2 size={15} />
                      </button>
                      <button onClick={() => { const s = similar.find((x) => x.subunit === p.subunit); if (s) addProblem(s.id) }}
                        className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:text-brand-600" title="쌍둥이·유사 담기"><Copy size={15} /></button>
                    </div>
                  </div>
                </div>
              )
            })}
            {selected.length === 0 && <p className="py-16 text-center text-gray-400">담긴 문제가 없습니다. 왼쪽에서 문제를 추가해 주세요.</p>}
          </div>
          <div className="flex items-center gap-4 border-t border-white/10 bg-navy-900 px-6 py-4">
            <Button onClick={() => { setWizard({ step: 1 }); nav('/') }}>이전</Button>
            <span className="ml-auto text-sm text-gray-300">{summaryLine}</span>
            <span className="text-base font-bold text-white">문제 수 <span className="text-emerald-400">{selected.length}</span> 개</span>
            <Button variant="primary" className="!bg-teal-600 !px-6 !py-3 !text-base hover:!bg-teal-700" disabled={!selected.length}
              onClick={() => { setWizard({ step: 3 }); nav('/wizard/3') }}>다음 단계 →</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
