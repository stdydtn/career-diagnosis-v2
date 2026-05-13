import { TOTAL_QUESTION_COUNT } from '../constants/quotas.js'
import { loadSessionQuestionsFromStorage } from './diagnosisLocalSession.js'
import { isSupabaseConfigured, supabase } from './supabase.js'
import { buildDiagnosisResult } from './scoring.js'

/**
 * @param {object} profile
 */
function profileToRow(profile) {
  const p = profile ?? {}
  return {
    name: p.name ?? '',
    email: p.email ?? '',
    phone: p.phone ?? '',
    age_group: p.ageGroup ?? '',
    status: p.status ?? '',
    education: p.education ?? '',
    school: p.school ?? '',
    major: p.major ?? '',
    gpa: p.gpa ?? '',
    certificates: p.certificates ?? '',
    language_scores: p.languageScores ?? '',
    target_job: p.targetJob ?? '',
    target_company_type: p.targetCompanyType ?? '',
    region: p.region ?? '',
    referral: p.referral ?? '',
    privacy_consent: p.privacyConsent === true,
    marketing_consent: Boolean(p.marketingConsent),
  }
}

/** JSONB 컬럼용 — 직렬화 가능한 순수 JSON만 남김 */
function toJsonb(value) {
  if (value == null) return null
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return null
  }
}

/** PostgREST가 스키마에 없는 컬럼을 거절할 때(마이그레이션 전) 메시지에 컬럼명이 드러남 */
function shouldRetryInsertWithoutAiColumns(error) {
  const m = String(error?.message ?? '').toLowerCase()
  return m.includes('ai_report') || m.includes('ai_cover_letter_review')
}

/**
 * @param {unknown[]} sessionQs
 * @param {object} answers
 * @param {object | null} diagnosisResult
 * @param {object} profile
 */
function resolveDiagnosisForSave(sessionQs, answers, diagnosisResult, profile) {
  const looksComplete =
    diagnosisResult?.scores &&
    diagnosisResult?.top &&
    typeof diagnosisResult?.stage?.label === 'string' &&
    diagnosisResult.stage.label.trim() !== '' &&
    Array.isArray(diagnosisResult?.recommendedJobs)

  if (looksComplete) return diagnosisResult
  if (!Array.isArray(sessionQs) || sessionQs.length === 0) return diagnosisResult ?? null
  if (!answers || typeof answers !== 'object') return diagnosisResult ?? null
  const allAnswered = sessionQs.every((q) => typeof answers[q.id] === 'number')
  if (!allAnswered) return diagnosisResult ?? null
  try {
    return buildDiagnosisResult({ answers, sessionQuestions: sessionQs, profile })
  } catch {
    return diagnosisResult ?? null
  }
}

/**
 * @param {{
 *   profile: object,
 *   sessionQuestions: unknown[],
 *   answers: object,
 *   diagnosisResult: object | null,
 *   feedback: object,
 *   coverLetterReview: object | null,
 *   aiReport?: object | null,
 *   aiCoverLetterReview?: object | null,
 * }} input
 * @returns {Promise<{ success: true, id: string | null } | { success: true, skipped: true, message: string }>}
 */
export async function saveDiagnosisSubmission({
  profile,
  sessionQuestions,
  answers,
  diagnosisResult,
  feedback,
  coverLetterReview,
  aiReport,
  aiCoverLetterReview,
}) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn(
      '[saveDiagnosisSubmission] Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY). Skipping save.',
    )
    return {
      success: true,
      skipped: true,
      message:
        'Supabase 환경변수가 설정되지 않아 저장을 건너뛰었습니다. 로컬 개발용 동작입니다.',
    }
  }

  const sessionQs =
    Array.isArray(sessionQuestions) && sessionQuestions.length > 0
      ? sessionQuestions
      : loadSessionQuestionsFromStorage() ?? []

  const diagnosisPayload = resolveDiagnosisForSave(
    sessionQs,
    answers,
    diagnosisResult,
    profile,
  )

  const completedAt = new Date().toISOString()
  const sqLen = sessionQs.length
  const ansLen = Object.keys(answers || {}).length
  const totalAnswerCount =
    sqLen === TOTAL_QUESTION_COUNT || ansLen === TOTAL_QUESTION_COUNT
      ? TOTAL_QUESTION_COUNT
      : Math.max(sqLen, ansLen, 0)

  const recommendedJobs = diagnosisPayload?.recommendedJobs ?? []
  const topInterest = diagnosisPayload?.top?.interest ?? []
  const topValues = diagnosisPayload?.top?.values ?? []
  const topWorkStyle = diagnosisPayload?.top?.workStyle ?? []
  const topCompetency = diagnosisPayload?.top?.competency ?? []
  const stageLabel = diagnosisPayload?.stage?.label ?? null
  const paidIntent =
    feedback?.paidIntent ??
    (typeof feedback?.paid_intent === 'string' ? feedback.paid_intent : null)

  /** 저장·로그용 — DB 컬럼명과 동일한 키로 분석·검증이 쉽도록 정리 */
  const payload = {
    profile,
    session_questions: sessionQs,
    answers,
    diagnosis_result: diagnosisPayload,
    feedback,
    cover_letter_review: coverLetterReview,
    ai_report: aiReport,
    ai_cover_letter_review: aiCoverLetterReview,
    completed_at: completedAt,
    total_answer_count: totalAnswerCount,
    recommended_jobs: recommendedJobs,
    top_interest: topInterest,
    top_values: topValues,
    top_work_style: topWorkStyle,
    top_competency: topCompetency,
    stage_label: stageLabel,
    paid_intent: paidIntent,
  }

  const row = {
    ...profileToRow(profile),
    session_questions: toJsonb(sessionQs),
    answers: toJsonb(answers ?? {}),
    diagnosis_result: toJsonb(diagnosisPayload),
    feedback: toJsonb(feedback ?? {}),
    cover_letter_review: toJsonb(coverLetterReview),
    ai_report: toJsonb(aiReport),
    ai_cover_letter_review: toJsonb(aiCoverLetterReview),
    completed_at: completedAt,
    total_answer_count: totalAnswerCount,
    recommended_jobs: toJsonb(recommendedJobs),
    top_interest: toJsonb(topInterest),
    top_values: toJsonb(topValues),
    top_work_style: toJsonb(topWorkStyle),
    top_competency: toJsonb(topCompetency),
    stage_label: stageLabel,
    paid_intent: typeof paidIntent === 'string' ? paidIntent : paidIntent == null ? null : String(paidIntent),
  }

  if (import.meta.env.DEV) {
    console.log('Supabase 저장 payload:', payload)
    const hasReviewBlock = Boolean(
      coverLetterReview?.review ||
        (coverLetterReview && Array.isArray(coverLetterReview.items)),
    )
    console.debug('[saveDiagnosisSubmission] inserting', {
      usedStoredSession: !(Array.isArray(sessionQuestions) && sessionQuestions.length > 0),
      recomputedDiagnosis: diagnosisPayload !== diagnosisResult,
      hasCoverLetterReview: coverLetterReview != null,
      hasReviewBlock,
      coverLetterVersion: coverLetterReview?.version ?? null,
      hasAiReport: aiReport != null,
      hasAiCoverLetterReview: aiCoverLetterReview != null,
      sessionQuestionCount: sessionQs.length,
      answerKeys: ansLen,
      totalAnswerCount,
      hasStageLabel: Boolean(stageLabel),
      hasPaidIntent: Boolean(paidIntent),
    })
  }

  // insert 후 .select()를 붙이면 return=representation이 되어, RLS에 SELECT 정책이 없으면
  // anon 클라이언트에서 실패할 수 있습니다. MVP는 insert만 수행합니다.
  /** @type {Record<string, unknown>} */
  let insertRow = { ...row }
  let { error } = await supabase.from('diagnosis_submissions').insert([insertRow])

  let guard = 0
  while (error && guard < 8) {
    guard += 1
    const stripAi =
      shouldRetryInsertWithoutAiColumns(error) &&
      ('ai_report' in insertRow || 'ai_cover_letter_review' in insertRow)
    if (!stripAi) break

    console.warn(
      '[saveDiagnosisSubmission] ai_report / ai_cover_letter_review 컬럼이 없어 AI 필드 없이 재시도합니다. Supabase SQL Editor에서 src/lib/supabaseSchema.sql의 ALTER 구문을 실행하면 AI 결과까지 저장됩니다.',
      error.message,
    )
    const { ai_report: _a, ai_cover_letter_review: _c, ...rest } = insertRow
    void _a
    void _c
    insertRow = rest
    ;({ error } = await supabase.from('diagnosis_submissions').insert([insertRow]))
  }

  if (error) {
    console.error('[saveDiagnosisSubmission]', error)
    throw new Error(error.message || 'Supabase insert failed')
  }

  return { success: true, id: null }
}
