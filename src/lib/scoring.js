import { jobMap } from '../constants/jobMap.js'

export function scoreAnswers(_answers) {
  // TODO: 점수 계산 로직 구현(1단계에서는 미구현)
  void _answers
  return {}
}

export function computeScores(answers, sessionQuestions, type) {
  const target = sessionQuestions.filter((q) => q.type === type)

  /** @type {Record<string, { sum: number, count: number }>} */
  const acc = {}

  for (const q of target) {
    const v = answers?.[q.id]
    if (typeof v !== 'number') continue
    if (!acc[q.key]) acc[q.key] = { sum: 0, count: 0 }
    acc[q.key].sum += v
    acc[q.key].count += 1
  }

  /** @type {Record<string, number>} */
  const out = {}
  for (const [k, { sum, count }] of Object.entries(acc)) {
    out[k] = count > 0 ? sum / count : 0
  }

  return out
}

export function average(values) {
  const nums = values.filter((v) => typeof v === 'number' && Number.isFinite(v))
  if (nums.length === 0) return 0
  return nums.reduce((sum, v) => sum + v, 0) / nums.length
}

export function topEntries(scores, count = 3) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
}

export function getStageLabel(maturityAverage, readinessAverage) {
  if (maturityAverage < 3.2) {
    return {
      label: '탐색 우선형',
      description: '직업 선택 기준과 자기이해를 먼저 정리해야 하는 단계입니다.',
    }
  }
  if (readinessAverage < 3.3) {
    return {
      label: '방향 설정형',
      description:
        '관심 직무는 어느 정도 잡혔지만 경험 정리와 지원 준비가 더 필요한 단계입니다.',
    }
  }
  return {
    label: '실행 강화형',
    description:
      '진로 방향과 준비행동이 비교적 갖춰져 있어 실전 지원 전략을 고도화할 단계입니다.',
  }
}

function uniqueJobsFromInterestTop(topInterest, maxCount = 5) {
  const jobs = []
  const seen = new Set()
  for (const [key] of topInterest) {
    for (const title of jobMap[key] ?? []) {
      if (seen.has(title)) continue
      seen.add(title)
      jobs.push(title)
      if (jobs.length >= maxCount) return jobs
    }
  }
  return jobs
}

export function buildDiagnosisResult({ answers, sessionQuestions, profile }) {
  const interest = computeScores(answers, sessionQuestions, 'interest')
  const values = computeScores(answers, sessionQuestions, 'values')
  const workStyle = computeScores(answers, sessionQuestions, 'workStyle')
  const competency = computeScores(answers, sessionQuestions, 'competency')
  const maturity = computeScores(answers, sessionQuestions, 'maturity')
  const readiness = computeScores(answers, sessionQuestions, 'readiness')
  const barriers = computeScores(answers, sessionQuestions, 'barriers')

  const top = {
    interest: topEntries(interest, 3),
    values: topEntries(values, 3),
    workStyle: topEntries(workStyle, 3),
    competency: topEntries(competency, 3),
    maturity: topEntries(maturity, 3),
    readiness: topEntries(readiness, 3),
    barriers: topEntries(barriers, 2),
  }

  const maturityAverage = average(Object.values(maturity))
  const readinessAverage = average(Object.values(readiness))
  const stage = getStageLabel(maturityAverage, readinessAverage)
  const recommendedJobs = uniqueJobsFromInterestTop(top.interest, 5)

  const userName = profile?.name?.trim() || '사용자'
  const topInterestKey = top.interest[0]?.[0] ?? '관심'
  const topValueKey = top.values[0]?.[0] ?? '가치'
  const summary = `${userName}님은 ${topInterestKey} 성향 관련 활동 선호가 상대적으로 높고, ${topValueKey} 기준을 중요하게 여기는 편입니다. 현재 진로 준비 단계는 ${stage.label}으로, 과도한 단정보다는 현재 강점을 바탕으로 직무 방향을 구체화하고 준비행동을 점검하는 접근이 적절합니다.`

  return {
    scores: {
      interest,
      values,
      workStyle,
      competency,
      maturity,
      readiness,
      barriers,
    },
    top,
    averages: {
      maturityAverage,
      readinessAverage,
    },
    stage,
    recommendedJobs,
    summary,
  }
}

export function runScoringTests() {
  const t = topEntries({ R: 4.5, I: 3.2, S: 4.8 }, 2)
  console.assert(t[0][0] === 'S' && t[1][0] === 'R', 'topEntries sort failed')

  console.assert(
    getStageLabel(3.1, 4).label === '탐색 우선형',
    'stage label 탐색 우선형 failed',
  )
  console.assert(
    getStageLabel(3.2, 3.0).label === '방향 설정형',
    'stage label 방향 설정형 failed',
  )
  console.assert(
    getStageLabel(3.3, 3.3).label === '실행 강화형',
    'stage label 실행 강화형 failed',
  )

  const mockQuestions = [
    { id: 'q1', type: 'interest', key: 'R' },
    { id: 'q2', type: 'interest', key: 'S' },
    { id: 'q3', type: 'values', key: 'reward' },
    { id: 'q4', type: 'maturity', key: 'planning' },
    { id: 'q5', type: 'readiness', key: 'documents' },
    { id: 'q6', type: 'barriers', key: 'infoGap' },
  ]
  const mockAnswers = { q1: 4, q2: 5, q3: 3, q4: 3, q5: 4, q6: 2 }
  const result = buildDiagnosisResult({
    answers: mockAnswers,
    sessionQuestions: mockQuestions,
    profile: { name: '테스터' },
  })
  console.assert(result.recommendedJobs.length <= 5, 'recommendedJobs max 5 failed')
  console.assert(typeof result.summary === 'string' && result.summary.length > 0, 'summary should exist')
}

