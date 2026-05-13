/** DiagnosisPage와 저장 로직이 동일한 키를 쓰도록 공유 */
export const SESSION_QUESTIONS_STORAGE_KEY = 'careerDiagnosisSessionQuestions'

/** 진단 탭을 거치지 않은 채로 session state가 비었을 때 localStorage에서 복원 */
export function loadSessionQuestionsFromStorage() {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(SESSION_QUESTIONS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}
