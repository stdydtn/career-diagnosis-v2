import { isSupabaseConfigured, supabase } from './supabase.js'

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

  const row = {
    ...profileToRow(profile),
    session_questions: toJsonb(sessionQuestions ?? []),
    answers: toJsonb(answers ?? {}),
    diagnosis_result: toJsonb(diagnosisResult),
    feedback: toJsonb(feedback ?? {}),
    cover_letter_review: toJsonb(coverLetterReview),
    ai_report: toJsonb(aiReport),
    ai_cover_letter_review: toJsonb(aiCoverLetterReview),
  }

  if (import.meta.env.DEV) {
    const hasReviewBlock = Boolean(
      coverLetterReview?.review ||
        (coverLetterReview && Array.isArray(coverLetterReview.items)),
    )
    console.debug('[saveDiagnosisSubmission] inserting', {
      hasCoverLetterReview: coverLetterReview != null,
      hasReviewBlock,
      coverLetterVersion: coverLetterReview?.version ?? null,
      sessionQuestionCount: Array.isArray(sessionQuestions)
        ? sessionQuestions.length
        : 0,
      answerKeys: answers && typeof answers === 'object' ? Object.keys(answers).length : 0,
    })
  }

  // insert 후 .select()를 붙이면 return=representation이 되어, RLS에 SELECT 정책이 없으면
  // anon 클라이언트에서 실패할 수 있습니다. MVP는 insert만 수행합니다.
  const { error } = await supabase.from('diagnosis_submissions').insert([row])

  if (error) {
    console.error('[saveDiagnosisSubmission]', error)
    throw new Error(error.message || 'Supabase insert failed')
  }

  return { success: true, id: null }
}
