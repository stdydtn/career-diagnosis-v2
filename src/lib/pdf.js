/**
 * 베이직 리포트 PDF (텍스트 직접 렌더링, jsPDF만 사용)
 *
 * MVP: jsPDF 기본 Helvetica는 한글 글리프를 포함하지 않아, 일부 환경에서는
 * 한글이 빈 칸·깨짐으로 보일 수 있습니다. 정식 서비스 전에는
 * addFileToVFS + addFont 로 Noto Sans KR 등 한글 폰트를 내장하는 방식을 권장합니다.
 *
 * 금지: html2canvas, 화면 캡처, 이미지 기반 PDF
 */

const STATUS_LABELS = {
  employed: '재직',
  jobSeeking: '구직',
  student: '학생',
  careerBreak: '경력단절/휴식',
  other: '기타',
}

const SECTION_KEYS = [
  'interest',
  'values',
  'workStyle',
  'competency',
  'maturity',
  'readiness',
  'barriers',
]

export function validateBasicReportPdfInput({ diagnosisResult, basicReport }) {
  if (!diagnosisResult) {
    throw new Error('PDF로 저장할 리포트 데이터가 없습니다.')
  }
  if (!basicReport) {
    throw new Error('PDF로 저장할 리포트 데이터가 없습니다.')
  }
}

function normalizeRecommendedJobs(basicReport, diagnosisResult) {
  const fromReport = basicReport?.recommendedJobs
  if (Array.isArray(fromReport) && fromReport.length > 0) {
    return fromReport.map((job) =>
      typeof job === 'string' ? job : job?.name ?? String(job),
    )
  }
  const fromDiag = diagnosisResult?.recommendedJobs
  if (Array.isArray(fromDiag) && fromDiag.length > 0) {
    return fromDiag.map((job) =>
      typeof job === 'string' ? job : job?.name ?? String(job),
    )
  }
  return []
}

function normalizeActionPlan(basicReport) {
  const plan = basicReport?.actionPlan
  return Array.isArray(plan) ? plan : []
}

function formatStatus(status) {
  if (status == null || status === '') return '-'
  return STATUS_LABELS[status] ?? String(status)
}

/**
 * @param {{
 *   profile?: object,
 *   diagnosisResult: object,
 *   basicReport: object,
 * }} params
 */
export async function downloadBasicReportPdf({
  profile,
  diagnosisResult,
  basicReport,
}) {
  validateBasicReportPdfInput({ diagnosisResult, basicReport })

  const { jsPDF } = await import('jspdf')

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 14
  const maxWidth = pageWidth - margin * 2
  const lineHeight = 7

  let y = margin

  const addPageIfNeeded = () => {
    if (y > pageHeight - margin) {
      pdf.addPage()
      y = margin
    }
  }

  const addText = (text, options = {}) => {
    const fontSize = options.fontSize ?? 10
    const gap = options.gap ?? 2

    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(String(text ?? ''), maxWidth)

    for (const line of lines) {
      addPageIfNeeded()
      pdf.text(line, margin, y)
      y += lineHeight
    }
    y += gap
  }

  const p = profile ?? {}

  addText(basicReport.title || '나의 커리어 방향 분석 리포트', {
    fontSize: 16,
    gap: 4,
  })

  if (basicReport.subtitle) {
    addText(basicReport.subtitle, { fontSize: 10, gap: 4 })
  }

  addText(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, {
    fontSize: 10,
    gap: 5,
  })

  addText('[참여자 정보]', { fontSize: 13, gap: 3 })
  addText(`이름: ${p.name?.trim() || '-'}`)
  addText(`이메일: ${p.email?.trim() || '-'}`)
  addText(`현재 상태: ${formatStatus(p.status)}`)
  addText(`학교: ${p.school?.trim() || '-'}`)
  addText(`전공: ${p.major?.trim() || '-'}`)
  addText(`희망 직무: ${p.targetJob?.trim() || '-'}`)

  addText('[커리어 요약]', { fontSize: 13, gap: 3 })
  addText(basicReport.summary || '')

  const sections = basicReport.sections || {}
  for (const key of SECTION_KEYS) {
    const section = sections[key]
    if (!section?.title) continue
    addText(`[${section.title}]`, { fontSize: 13, gap: 3 })
    addText(section.description || '')
    if (Array.isArray(section.highlights)) {
      section.highlights.forEach((item, index) => {
        addText(`${index + 1}. ${item}`)
      })
    }
    y += 2
  }

  addText('[추천 직무 TOP 5]', { fontSize: 13, gap: 3 })
  const jobs = normalizeRecommendedJobs(basicReport, diagnosisResult).slice(0, 5)
  if (jobs.length === 0) {
    addText('(추천 직무 데이터 없음)')
  } else {
    jobs.forEach((jobName, index) => {
      addText(`${index + 1}. ${jobName}`)
      addText(
        '추천 이유: 진단 결과를 바탕으로 추천된 직무입니다.',
        { fontSize: 9, gap: 2 },
      )
    })
  }

  addText('[다음 실행전략]', { fontSize: 13, gap: 3 })
  const plan = normalizeActionPlan(basicReport)
  if (plan.length === 0) {
    addText('(실행전략 데이터 없음)')
  } else {
    plan.forEach((item, index) => {
      addText(`${index + 1}. ${item}`)
    })
  }

  const rawName = p.name?.trim()
  if (rawName) {
    const safeName = rawName.replace(/[^가-힣a-zA-Z0-9_-]/g, '_')
    pdf.save(`${safeName}_커리어_진단_리포트.pdf`)
  } else {
    pdf.save('career_report.pdf')
  }
}

export function runPdfBasicReportPayloadTests() {
  let noDiag = false
  try {
    validateBasicReportPdfInput({ diagnosisResult: null, basicReport: {} })
  } catch {
    noDiag = true
  }
  console.assert(noDiag, 'pdf: diagnosisResult 없으면 throw')

  let noReport = false
  try {
    validateBasicReportPdfInput({ diagnosisResult: {}, basicReport: null })
  } catch {
    noReport = true
  }
  console.assert(noReport, 'pdf: basicReport 없으면 throw')

  console.assert(
    normalizeRecommendedJobs({}, {}).length === 0,
    'pdf: recommendedJobs 없음',
  )
  console.assert(
    normalizeRecommendedJobs(
      { recommendedJobs: ['a', 'b'] },
      {},
    ).length === 2,
    'pdf: recommendedJobs from basicReport',
  )
  console.assert(
    normalizeRecommendedJobs({}, { recommendedJobs: ['x'] }).length === 1,
    'pdf: recommendedJobs from diagnosisResult',
  )

  console.assert(normalizeActionPlan({}).length === 0, 'pdf: actionPlan 없음')
  console.assert(
    normalizeActionPlan({ actionPlan: ['a'] }).length === 1,
    'pdf: actionPlan 있음',
  )
}

if (import.meta.env.DEV) {
  runPdfBasicReportPayloadTests()
}
