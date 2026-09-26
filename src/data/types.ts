export type Diff = '하' | '중하' | '중' | '중상' | '상' | '최상'
export const DIFFS: Diff[] = ['하', '중하', '중', '중상', '상', '최상']

export interface Source {
  kind: 'school' | 'mock' | 'custom'
  school?: string
  region?: string
  year: number
  term?: string // '1중간' | '1기말' | '2중간' | '2기말'
  month?: number // mock
  gradeLabel?: string // '고1 학평'
  number?: number
}

export interface Problem {
  id: string
  subject: string // '공통수학1'
  unit: string // 대단원
  subunit: string // 유형명
  type: '객관식' | '주관식'
  diff: Diff
  points: number
  body: string // text with $...$ KaTeX
  choices?: string[]
  answer: string
  solution?: string
  needimg?: boolean
  source: Source
}

export interface Student {
  id: string
  name: string
  grade: string
  createdAt: string
}

export interface SavedPaper {
  id: string
  title: string
  author: string
  subjectLabel: string
  tag: string
  color: string
  headerStyle: 'exam' | 'bar'
  problemIds: string[]
  longIds: string[] // 한 단을 통째로 쓰는 문제
  createdAt: string
}

// wrong[paperId][studentId] = problemId[]
export type WrongMap = Record<string, Record<string, string[]>>

export interface WizardState {
  step: 1 | 2 | 3
  selectedIds: string[]
  longIds: string[]
  title: string
  author: string
  subjectLabel: string
  tag: string
  color: string
  headerStyle: 'exam' | 'bar'
}
