/**
 * Vercel 배포 환경의 `/api/ai-career` 서버리스를 호출합니다.
 * OpenAI API 키는 서버(OPENAI_API_KEY)에서만 사용합니다.
 */
function extractJsonCandidate(text) {
  const t = String(text ?? '').trim()
  const fence = /```(?:json)?\s*([\s\S]*?)```/
  const m = t.match(fence)
  if (m) return m[1].trim()
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start !== -1 && end > start) return t.slice(start, end + 1)
  return t
}

/**
 * API 응답 `{ success, data, raw }`에서 화면/상태에 넣을 객체를 만듭니다.
 * `data`가 없고 `raw`만 있을 때 JSON 파싱을 시도하고, 실패 시 `{ _rawText }`를 반환합니다.
 * @param {unknown} json
 * @returns {object | null}
 */
export function careerAiPayloadForState(json) {
  if (!json || typeof json !== 'object') return null

  const d = /** @type {{ data?: unknown, raw?: unknown }} */ (json).data
  if (d != null && typeof d === 'object' && !Array.isArray(d)) {
    return /** @type {object} */ (d)
  }
  if (typeof d === 'string' && d.trim()) {
    try {
      const parsed = JSON.parse(extractJsonCandidate(d))
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      /* fall through */
    }
    return { _rawText: d }
  }

  const raw = /** @type {{ raw?: unknown }} */ (json).raw
  if (typeof raw !== 'string' || !raw.trim()) return null

  try {
    const parsed = JSON.parse(extractJsonCandidate(raw))
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed
    }
  } catch {
    /* fall through */
  }
  return { _rawText: raw }
}

export async function callCareerAI(payload) {
  const response = await fetch('/api/ai-career', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('AI API 호출에 실패했습니다.')
  }

  return response.json()
}
