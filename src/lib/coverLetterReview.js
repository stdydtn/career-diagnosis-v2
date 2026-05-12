import {
  competencyLabels,
  interestLabels,
  valueLabels,
} from '../constants/labels.js'

const QUESTION_FIT_KEYWORDS = ['지원', '직무', '경험', '역량', '목표', '성장']

const JOB_FIT_KEYWORDS = ['역량', '직무', '업무', '성과', '기여']

const SPECIFICITY_VERBS = [
  '기획',
  '분석',
  '운영',
  '관리',
  '제안',
  '실행',
  '협업',
  '조율',
  '개선',
  '작성',
  '발표',
]

const EVIDENCE_KEYWORDS = [
  '성과',
  '결과',
  '개선',
  '달성',
  '증가',
  '감소',
  '해결',
  '완료',
  '수상',
  '선정',
  '기여',
]

const COMPANY_KEYWORDS = ['회사', '기업', '고객', '서비스', '비전', '사업']

const UNIT_OR_NUMBER_RE =
  /[%명건회]|개월|년|만원|점|\d/

function cap100(n) {
  return Math.min(100, Math.max(0, n))
}

function hasAnyKeyword(text, keywords) {
  if (!text || typeof text !== 'string') return false
  return keywords.some((k) => text.includes(k))
}

function hasNumericOrUnit(text) {
  if (!text || typeof text !== 'string') return false
  return UNIT_OR_NUMBER_RE.test(text)
}

function scoreQuestionFit(question, answer) {
  let s = 0
  if (question?.trim()) s += 20
  if (hasAnyKeyword(answer, QUESTION_FIT_KEYWORDS)) s += 30
  if (answer.length >= 400) s += 20
  return cap100(s)
}

function scoreJobFit(answer, job, diagnosisResult) {
  let s = 0
  const j = job?.trim()
  if (j && answer.includes(j)) s += 40
  if (hasAnyKeyword(answer, JOB_FIT_KEYWORDS)) s += 30
  if (diagnosisResult) s += 10
  return cap100(s)
}

function scoreSpecificity(answer) {
  let s = 0
  if (hasAnyKeyword(answer, SPECIFICITY_VERBS)) s += 30
  if (answer.length >= 500) s += 20
  if (hasNumericOrUnit(answer)) s += 25
  return cap100(s)
}

function scoreEvidence(answer) {
  let s = 0
  if (hasAnyKeyword(answer, EVIDENCE_KEYWORDS)) s += 35
  if (hasNumericOrUnit(answer)) s += 30
  return cap100(s)
}

function scoreCompanyFit(answer, company) {
  let s = 0
  const c = company?.trim()
  if (c && answer.includes(c)) s += 40
  if (hasAnyKeyword(answer, COMPANY_KEYWORDS)) s += 30
  return cap100(s)
}

function collectStrengths(answer, job, company) {
  /** @type {string[]} */
  const out = []
  const j = job?.trim()
  const c = company?.trim()
  if (hasAnyKeyword(answer, SPECIFICITY_VERBS)) {
    out.push('경험에서 본인이 수행한 행동이 드러납니다.')
  }
  if (hasAnyKeyword(answer, EVIDENCE_KEYWORDS) || hasNumericOrUnit(answer)) {
    out.push('경험의 결과나 성과를 설명하려는 시도가 보입니다.')
  }
  if (j && answer.includes(j)) {
    out.push('지원 직무와 연결하려는 방향이 보입니다.')
  }
  if (c && answer.includes(c)) {
    out.push('지원 회사에 맞춘 표현이 포함되어 있습니다.')
  }
  return [...new Set(out)]
}

function collectImprovements(answer, job, company) {
  /** @type {string[]} */
  const out = []
  const j = job?.trim()
  const c = company?.trim()
  if (!hasAnyKeyword(answer, SPECIFICITY_VERBS)) {
    out.push('내가 실제로 한 행동을 구체적인 동사로 보완해보세요.')
  }
  if (!hasAnyKeyword(answer, EVIDENCE_KEYWORDS) && !hasNumericOrUnit(answer)) {
    out.push('경험의 결과, 변화, 배운 점을 마무리 문장에 추가해보세요.')
  }
  if (j && !answer.includes(j)) {
    out.push('지원 직무명 또는 직무역량을 직접 언급해 직무 적합도를 높여보세요.')
  }
  if (c && !answer.includes(c)) {
    out.push('회사명, 사업 방향, 고객, 서비스와 연결되는 문장을 추가해보세요.')
  }
  if (answer.length < 400) {
    out.push('분량이 짧아 경험의 맥락과 결과가 약해 보일 수 있습니다.')
  }
  return [...new Set(out)]
}

function interestTopName(diagnosisResult) {
  const key = diagnosisResult?.top?.interest?.[0]?.[0]
  if (!key) return null
  return interestLabels[key]?.name ?? key
}

function valueTopName(diagnosisResult) {
  const key = diagnosisResult?.top?.values?.[0]?.[0]
  if (!key) return null
  return valueLabels[key] ?? key
}

function competencyTopName(diagnosisResult) {
  const key = diagnosisResult?.top?.competency?.[0]?.[0]
  if (!key) return null
  return competencyLabels[key] ?? key
}

function buildDiagnosisAdviceList(diagnosisResult) {
  if (!diagnosisResult) {
    return ['커리어 진단을 완료하면 진단 결과를 반영한 맞춤 첨삭이 가능합니다.']
  }
  const interestName = interestTopName(diagnosisResult)
  const valueName = valueTopName(diagnosisResult)
  const competencyName = competencyTopName(diagnosisResult)
  const readinessAvg = diagnosisResult.averages?.readinessAverage
  const readinessText =
    typeof readinessAvg === 'number' && Number.isFinite(readinessAvg)
      ? `현재 구직준비도 평균은 ${readinessAvg.toFixed(1)}점 수준입니다. `
      : ''

  const lines = []
  if (interestName) {
    lines.push(
      `직업흥미 상위(${interestName})를 활용해 지원동기를 강화하세요.`,
    )
  } else {
    lines.push('직업흥미 상위 1개를 활용해 지원동기를 강화하세요.')
  }
  if (valueName) {
    lines.push(
      `직업가치관 상위(${valueName})를 활용해 회사 선택 이유를 구체화하세요.`,
    )
  } else {
    lines.push('직업가치관 상위 1개를 활용해 회사 선택 이유를 구체화하세요.')
  }
  if (competencyName) {
    lines.push(
      `직업기초역량 상위(${competencyName})를 활용해 직무역량 문항을 강화하세요.`,
    )
  } else {
    lines.push('직업기초역량 상위 1개를 활용해 직무역량 문항을 강화하세요.')
  }
  lines.push(
    `${readinessText}구직준비도 결과를 참고해 경험정리와 성과정리 부분을 보완하세요.`,
  )
  return lines
}

function recommendedStructureTemplate() {
  return [
    '첫 문장: 지원 직무에서 발휘할 핵심 강점 1개를 명확히 제시합니다.',
    '중간 문단: 상황, 행동, 결과 순서로 경험을 구체적으로 설명합니다.',
    '마무리: 회사와 직무에서의 기여 방향을 연결해 지원 의지를 정리합니다.',
  ]
}

function buildSampleRevision(company, job) {
  const jobPhrase = job?.trim() ? job.trim() : '지원 직무'
  const companyPhrase = company?.trim() ? company.trim() : '지원 기업'
  return `저는 ${jobPhrase}에서 필요한 문제해결력과 실행력을 실제 경험으로 증명해온 지원자입니다. 특히 문제 상황을 구조적으로 파악하고 필요한 행동을 실행해 결과를 만들어낸 경험이 있습니다. 이 경험을 바탕으로 ${companyPhrase}에서도 직무 목표를 정확히 이해하고 성과를 만드는 구성원이 되겠습니다.`
}

function overallCommentFromAverage(avg) {
  if (avg >= 75) {
    return '전반적으로 문항 적합도와 근거 제시가 양호한 편입니다. 회사·직무 맞춤 표현을 조금 더 다듬으면 완성도가 높아집니다.'
  }
  if (avg >= 55) {
    return '기본 골격은 갖춰져 있습니다. 행동 동사·정량 근거·직무·회사 연결을 보강하면 설득력이 크게 올라갑니다.'
  }
  return '아직 경험의 맥락·결과·직무 연결이 약하게 보입니다. 상황-행동-결과 구조와 정량 지표를 중심으로 재작성하는 것을 권합니다.'
}

/**
 * @param {{ coverLetter: object, profile?: object, diagnosisResult?: object | null }} params
 */
export function reviewCoverLetter({ coverLetter, profile: _profile, diagnosisResult }) {
  void _profile
  const company = coverLetter?.company ?? ''
  const job = coverLetter?.job ?? ''
  const items = (coverLetter?.items ?? []).filter((it) => it?.answer?.trim())

  const diagnosisAdviceBase = buildDiagnosisAdviceList(diagnosisResult ?? null)

  const reviewedItems = items.map((it) => {
    const answer = it.answer.trim()
    const question = it.question ?? ''
    const scores = {
      questionFit: scoreQuestionFit(question, answer),
      jobFit: scoreJobFit(answer, job, diagnosisResult),
      specificity: scoreSpecificity(answer),
      evidence: scoreEvidence(answer),
      companyFit: scoreCompanyFit(answer, company),
    }
    const score = cap100(
      Object.values(scores).reduce((a, b) => a + b, 0) / 5,
    )
    return {
      id: it.id,
      question,
      score,
      length: answer.length,
      scores,
      strengths: collectStrengths(answer, job, company),
      improvements: collectImprovements(answer, job, company),
      diagnosisAdvice: [...diagnosisAdviceBase],
      recommendedStructure: recommendedStructureTemplate(),
      sampleRevision: buildSampleRevision(company, job),
    }
  })

  const averageScore =
    reviewedItems.length === 0
      ? 0
      : Math.round(
          (reviewedItems.reduce((s, it) => s + it.score, 0) /
            reviewedItems.length) *
            10,
        ) / 10

  const overallComment =
    reviewedItems.length === 0
      ? '첨삭할 답변이 없습니다.'
      : overallCommentFromAverage(averageScore)

  return {
    overallComment,
    averageScore,
    items: reviewedItems,
  }
}

export function runCoverLetterReviewTests() {
  const empty = reviewCoverLetter({
    coverLetter: {
      company: '',
      job: '',
      items: [
        { id: 1, question: 'Q1', answer: '   ' },
        { id: 2, question: '', answer: '' },
      ],
    },
    profile: {},
    diagnosisResult: null,
  })
  console.assert(empty.items.length === 0, 'empty answers should be excluded')
  console.assert(empty.averageScore === 0, 'averageScore 0 when no items')

  const withAnswer = reviewCoverLetter({
    coverLetter: {
      company: '테스트주식회사',
      job: '기획',
      items: [
        {
          id: 1,
          question: '지원동기',
          answer:
            '지원 직무 경험을 바탕으로 기획과 분석을 수행했고 성과 10% 개선을 달성했습니다. 테스트주식회사의 서비스 비전에 공감합니다.' +
            'a'.repeat(350),
        },
      ],
    },
    profile: { targetJob: '기획' },
    diagnosisResult: {
      top: {
        interest: [['I', 4]],
        values: [['growth', 4]],
        competency: [['problemSolving', 4]],
        readiness: [['documents', 3]],
      },
      averages: { readinessAverage: 3.5 },
    },
  })
  console.assert(withAnswer.items.length === 1, 'answered item included')
  console.assert(typeof withAnswer.items[0].score === 'number', 'score returned')
  console.assert(withAnswer.averageScore > 0, 'averageScore calculated')
  console.assert(
    withAnswer.items[0].recommendedStructure.length >= 3,
    'recommendedStructure >= 3',
  )
  console.assert(
    withAnswer.items[0].diagnosisAdvice.length >= 4,
    'diagnosis advice lines',
  )

  const noDiag = reviewCoverLetter({
    coverLetter: {
      company: '',
      job: '개발',
      items: [{ id: 1, question: 'Q', answer: '개발 업무 경험이 있습니다.' }],
    },
    profile: {},
    diagnosisResult: null,
  })
  console.assert(noDiag.items.length === 1, 'single item')
  console.assert(
    noDiag.items[0].diagnosisAdvice.some((l) => l.includes('커리어 진단')),
    'no diagnosis fallback',
  )

  let threw = false
  try {
    reviewCoverLetter({
      coverLetter: { company: '', job: '', items: [] },
      profile: undefined,
      diagnosisResult: undefined,
    })
  } catch {
    threw = true
  }
  console.assert(!threw, 'undefined diagnosis should not throw')
}

if (import.meta.env.DEV) {
  runCoverLetterReviewTests()
}
