/**
 * Vercel 배포 환경의 `/api/ai-career` 서버리스를 호출합니다.
 * OpenAI API 키는 서버(OPENAI_API_KEY)에서만 사용합니다.
 */
export async function callCareerAI(payload) {
  const response = await fetch('/api/ai-career', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(json.error || 'AI API 호출에 실패했습니다.')
  }
  if (json.success === false) {
    throw new Error(json.error || 'AI API 호출에 실패했습니다.')
  }

  return json
}
