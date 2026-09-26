import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { seedProblems, seedStudents } from '../data/seed'
import type { AppState, StoreApi } from './useStore'
import { StoreContext } from './useStore'
import type { Problem, SavedPaper, WizardState } from '../data/types'

const KEY = 'qbank:v1'

const initialWizard: WizardState = {
  step: 1, selectedIds: [], title: '', author: '', subjectLabel: '', tag: '기본', color: '#111827', headerStyle: 'exam', longIds: [],
}

function initial(): AppState {
  return { user: null, problems: seedProblems, students: seedStudents, papers: [], wrong: {}, wizard: initialWizard }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      return { ...initial(), ...saved, wizard: { ...initialWizard, ...(saved.wizard ?? {}) } }
    }
  } catch { /* ignore */ }
  return initial()
}

const uid = () => Math.random().toString(36).slice(2, 10)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const login = useCallback((name: string, academy: string) => setState((p) => ({ ...p, user: { name, academy } })), [])
  const logout = useCallback(() => setState((p) => ({ ...p, user: null })), [])
  const addProblems = useCallback((ps: Problem[]) => setState((p) => ({ ...p, problems: [...p.problems, ...ps.map((x) => ({ ...x, id: x.id || uid() }))] })), [])
  const removeProblem = useCallback((id: string) => setState((p) => ({
    ...p,
    problems: p.problems.filter((x) => x.id !== id),
    wizard: { ...p.wizard, selectedIds: p.wizard.selectedIds.filter((x) => x !== id) },
  })), [])
  const setWizard = useCallback((patch: Partial<WizardState>) => setState((p) => ({ ...p, wizard: { ...p.wizard, ...patch } })), [])
  const addStudent = useCallback((name: string, grade: string) => setState((p) => ({ ...p, students: [...p.students, { id: uid(), name, grade, createdAt: new Date().toISOString().slice(0, 10) }] })), [])
  const removeStudent = useCallback((id: string) => setState((p) => ({ ...p, students: p.students.filter((s) => s.id !== id) })), [])
  const savePaper = useCallback((paper: SavedPaper) => setState((p) => ({ ...p, papers: [paper, ...p.papers.filter((x) => x.id !== paper.id)] })), [])
  const removePaper = useCallback((id: string) => setState((p) => {
    const wrong = { ...p.wrong }; delete wrong[id]
    return { ...p, papers: p.papers.filter((x) => x.id !== id), wrong }
  }), [])
  const toggleWrong = useCallback((paperId: string, studentId: string, problemId: string) => setState((p) => {
    const forPaper = { ...(p.wrong[paperId] ?? {}) }
    const list = forPaper[studentId] ?? []
    forPaper[studentId] = list.includes(problemId) ? list.filter((x) => x !== problemId) : [...list, problemId]
    return { ...p, wrong: { ...p.wrong, [paperId]: forPaper } }
  }), [])
  const reset = useCallback(() => { localStorage.removeItem(KEY); setState(initial()) }, [])

  const api = useMemo<StoreApi>(() => ({ state, login, logout, addProblems, removeProblem, setWizard, addStudent, removeStudent, savePaper, removePaper, toggleWrong, reset }),
    [state, login, logout, addProblems, removeProblem, setWizard, addStudent, removeStudent, savePaper, removePaper, toggleWrong, reset])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}
