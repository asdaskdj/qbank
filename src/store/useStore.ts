import { createContext, useContext } from 'react'
import type { Problem, SavedPaper, Student, WizardState, WrongMap } from '../data/types'

export interface AppState {
  user: { name: string; academy: string } | null
  problems: Problem[]
  students: Student[]
  papers: SavedPaper[]
  wrong: WrongMap
  wizard: WizardState
}

export interface StoreApi {
  state: AppState
  login: (name: string, academy: string) => void
  logout: () => void
  addProblems: (ps: Problem[]) => void
  removeProblem: (id: string) => void
  setWizard: (patch: Partial<WizardState>) => void
  addStudent: (name: string, grade: string) => void
  removeStudent: (id: string) => void
  savePaper: (p: SavedPaper) => void
  removePaper: (id: string) => void
  toggleWrong: (paperId: string, studentId: string, problemId: string) => void
  reset: () => void
}

export const StoreContext = createContext<StoreApi | null>(null)
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('StoreProvider missing')
  return ctx
}

export function sourceLabel(p: Problem): string {
  const s = p.source
  if (s.kind === 'school') return `${s.school} ${s.year} ${s.term}${s.number ? ` ${String(s.number).padStart(2, '0')}번` : ''}`
  if (s.kind === 'mock') return `${s.gradeLabel} ${s.year}.${s.month}${s.number ? ` ${String(s.number).padStart(2, '0')}번` : ''}`
  return '자체 제작'
}
