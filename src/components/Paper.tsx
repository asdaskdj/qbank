import { useMemo } from 'react'
import type { Problem } from '../data/types'
import { paginate } from '../lib/paper'
import { CIRCLED, Math as M } from './Math'

export interface PaperSpec {
  title: string
  author: string
  subjectLabel: string
  color: string
  headerStyle: 'exam' | 'bar'
  problems: Problem[]
  longIds: string[]
}

/** PDF 스타일 A4 시험지: 2단, 단당 2문제(긴 문제 1문제), 마지막에 빠른 정답 */
export default function Paper({ spec, withAnswers = true }: { spec: PaperSpec; withAnswers?: boolean }) {
  const pages = useMemo(() => paginate(spec.problems, spec.longIds), [spec.problems, spec.longIds])
  const numOf = useMemo(() => new Map(spec.problems.map((p, i) => [p.id, i + 1])), [spec.problems])
  const byId = useMemo(() => new Map(spec.problems.map((p) => [p.id, p])), [spec.problems])

  return (
    <div className="space-y-6">
      {pages.map((page, pi) => (
        <div key={pi} className="print-page relative mx-auto bg-white shadow-lg" style={{ width: '210mm', height: '297mm', padding: '11mm 13mm 13mm', breakAfter: 'page' }}>
          {/* header */}
          {pi === 0 ? (
            spec.headerStyle === 'exam' ? (
              <div className="relative pb-2">
                <div className="text-center text-[15px] font-extrabold" style={{ color: spec.color }}>{spec.title}</div>
                <div className="text-center text-[34px] font-black tracking-[0.35em] text-gray-900" style={{ fontFamily: 'serif' }}>수학 영역</div>
                <div className="absolute left-0 top-6 text-lg font-extrabold text-gray-900">{spec.subjectLabel}</div>
                <div className="absolute right-0 top-7 text-[12px] text-gray-700">{spec.author && <span className="mr-4 font-semibold">{spec.author}</span>}이름 <span className="inline-block w-24 border-b border-gray-500" /></div>
              </div>
            ) : (
              <div className="flex items-end justify-between pb-2">
                <div>
                  <div className="border-l-4 pl-2 text-xl font-black text-gray-900" style={{ borderColor: spec.color }}>{spec.title}</div>
                  <div className="mt-1 pl-3 text-xs text-gray-500">{spec.subjectLabel} · {spec.problems.length}문제</div>
                </div>
                <div className="text-[12px] text-gray-700">{spec.author && <span className="mr-4 font-semibold">{spec.author}</span>}이름 <span className="inline-block w-24 border-b border-gray-500" /></div>
              </div>
            )
          ) : (
            <div className="pb-1 text-center text-[11px] text-gray-400">{spec.title} · {spec.subjectLabel}</div>
          )}

          {/* body: two columns with divider */}
          <div className="absolute" style={{ top: pi === 0 ? '34mm' : '18mm', bottom: '14mm', left: '13mm', right: '13mm' }}>
            <div className="h-full border-y border-gray-800" style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', columnGap: '5mm' }}>
              <ColumnView ids={page.columns[0].ids} byId={byId} numOf={numOf} />
              <div className="h-full w-px bg-gray-400" />
              <ColumnView ids={page.columns[1].ids} byId={byId} numOf={numOf} />
            </div>
          </div>
          <div className="absolute bottom-[6mm] right-[13mm] text-[12px] font-semibold text-gray-800">{pi + 1}</div>
        </div>
      ))}

      {withAnswers && spec.problems.length > 0 && (
        <div className="print-page relative mx-auto bg-white shadow-lg" style={{ width: '210mm', height: '297mm', padding: '14mm 16mm', breakAfter: 'page' }}>
          <div className="mb-4 border-l-4 pl-3 text-xl font-black text-gray-900" style={{ borderColor: spec.color }}>{spec.title} — 빠른 정답</div>
          <div className="grid grid-cols-4 gap-x-8 gap-y-1.5">
            {spec.problems.map((p, i) => (
              <div key={p.id} className="flex items-baseline justify-between border-b border-gray-100 py-1 text-[13px]">
                <span className="font-bold text-gray-700">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-semibold text-gray-900"><M text={p.answer} /></span>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            {spec.problems.filter((p) => p.solution).map((p) => (
              <div key={p.id} className="text-[12px] leading-relaxed text-gray-700">
                <b className="mr-2 text-gray-900">{String(numOf.get(p.id)).padStart(2, '0')}</b>
                <M text={p.solution!} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ColumnView({ ids, byId, numOf }: { ids: string[]; byId: Map<string, Problem>; numOf: Map<string, number> }) {
  return (
    <div className="flex h-full flex-col overflow-hidden py-[4mm]">
      {ids.map((id) => {
        const p = byId.get(id)!
        return (
          <div key={id} className="min-h-0 flex-1">
            <div className="flex gap-2 pr-2">
              <span className="text-[15px] font-black text-gray-900" style={{ fontFamily: 'serif' }}>{numOf.get(id)}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] leading-[1.65] text-gray-900">
                  <M text={`${p.body}${p.type === '주관식' ? '' : ''} [${p.points.toFixed(2)}점]`} />
                </div>
                {p.choices && (
                  <div className="mt-2 space-y-0.5 text-[12.5px] text-gray-900">
                    {p.choices.map((c, ci) => <div key={ci}><M text={`${CIRCLED[ci]} ${c}`} /></div>)}
                  </div>
                )}
                {p.needimg && <div className="mt-2 grid h-16 w-40 place-items-center border border-dashed border-gray-300 text-[10px] text-gray-400">그림</div>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
