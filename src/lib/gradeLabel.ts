const KO_LABELS: Record<number, string> = {
  0: '3살', 1: '4살', 2: '5살', 3: '6살 (유치원)', 4: '7살 (유치원)',
  5: '초1', 6: '초2', 7: '초3', 8: '초4', 9: '초5', 10: '초6',
  11: '중1', 12: '중2',
}

const US_LABELS: Record<number, string> = {
  0: 'Age 3', 1: 'Age 4', 2: 'Age 5', 3: 'Kindergarten',
  4: 'Grade 1', 5: 'Grade 2', 6: 'Grade 3', 7: 'Grade 4',
  8: 'Grade 5', 9: 'Grade 6', 10: 'Grade 7', 11: 'Grade 8',
}

export function gradeLabel(grade: number | null, system: string | null) {
  if (grade === null || grade === undefined) return ''
  if (system === 'us') return US_LABELS[grade] || `Grade ${grade}`
  return KO_LABELS[grade] || `${grade}학년`
}
