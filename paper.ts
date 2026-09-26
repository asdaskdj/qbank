import type { Problem } from '../data/types'

/** 내용이 길어 자동으로 한 단(컬럼)을 통째로 쓰는 문제인지 */
export function isLongProblem(p: Problem): boolean {
  let est = p.body.length
  if (p.choices) est += p.choices.join('').length * 0.6
  const tall = (p.body.match(/\\begin\{(pmatrix|cases|array|aligned)/g) ?? []).length
  est += tall * 70
  if (p.needimg) est += 90
  return est > 165
}

export interface ColumnSlot { ids: string[] } // 1 (long) or up to 2
export interface Page { columns: [ColumnSlot, ColumnSlot] }

/** 2단, 단당 2문제(긴 문제는 단당 1문제) 규칙으로 페이지 배치 */
export function paginate(problems: Problem[], longIds: string[]): Page[] {
  const isLong = (p: Problem) => longIds.includes(p.id) || isLongProblem(p)
  const columns: ColumnSlot[] = []
  let cur: string[] = []
  for (const p of problems) {
    if (isLong(p)) {
      if (cur.length) { columns.push({ ids: cur }); cur = [] }
      columns.push({ ids: [p.id] })
    } else {
      cur.push(p.id)
      if (cur.length === 2) { columns.push({ ids: cur }); cur = [] }
    }
  }
  if (cur.length) columns.push({ ids: cur })
  const pages: Page[] = []
  for (let i = 0; i < columns.length; i += 2) {
    pages.push({ columns: [columns[i], columns[i + 1] ?? { ids: [] }] })
  }
  return pages
}
