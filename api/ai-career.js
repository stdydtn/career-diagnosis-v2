/**
 * Vercel Serverless Function — POST /api/ai-career
 * OPENAI_API_KEY는 Vercel 환경변수(서버)에서만 사용합니다.
 */
import OpenAI from 'openai'

const MODEL = 'gpt-4o-mini'

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

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

function jsonResponse(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function buildReportPrompt(body) {
  const payload = JSON.stringify(
    {
      profile: body.profile ?? {},
      diagnosisResult: body.diagnosisResult ?? null,
      basicReport: body.basicReport ?? null,
    },
    null,
    2,
  )
  return `아래 JSON은 사용자의 커리어 진단 결과와 베이직 리포트 요약 데이터입니다.

${payload}

다음 규칙을 반드시 지키세요.
- 검사 유형 코드(R, I, A 등)나 "RIA형", "SEC형" 같은 코드·유형 표현은 사용하지 마세요.
- 사용자가 이해하기 쉬운 한국어로, 직업상담 톤으로 작성하세요.
- 단정하지 말고 "가능성이 있습니다", "도움이 될 수 있습니다" 등 완곡한 표현을 사용하세요.
- 응답은 JSON 하나만 출력하세요. 마크다운 코드 블록이나 설명 문장은 넣지 마세요.

반드시 아래 JSON 스키마를 따르세요.
{
  "title": "AI 커리어 상세 리포트 제목",
  "summary": "전체 요약",
  "sections": {
    "interest": { "title": "내가 좋아하는 일의 방식", "description": "해석 문장", "highlights": ["핵심1","핵심2","핵심3"] },
    "values": { "title": "내가 중요하게 생각하는 직업 조건", "description": "...", "highlights": ["...","...","..."] },
    "workStyle": { "title": "나의 일하는 스타일", "description": "...", "highlights": ["...","...","..."] },
    "competency": { "title": "내가 잘할 수 있는 업무역량", "description": "...", "highlights": ["...","...","..."] },
    "maturity": { "title": "나의 진로 결정 준비도", "description": "...", "highlights": ["...","...","..."] },
    "readiness": { "title": "나의 취업 준비 상태", "description": "...", "highlights": ["...","...","..."] },
    "barriers": { "title": "지금 추가로 필요한 지원", "description": "...", "highlights": ["...","...","..."] }
  },
  "recommendedJobs": [ { "name": "직무명", "reason": "추천 이유" } ],
  "actionPlan": [ "실행전략1", "실행전략2", "실행전략3", "실행전략4", "실행전략5" ]
}

recommendedJobs는 5개, actionPlan은 5개 항목으로 채우세요.`
}

function buildCoverLetterPrompt(body) {
  const payload = JSON.stringify(
    {
      profile: body.profile ?? {},
      diagnosisResult: body.diagnosisResult ?? null,
      coverLetter: body.coverLetter ?? null,
    },
    null,
    2,
  )
  return `아래는 지원자 프로필, 진단 결과(있을 수 있음), 자기소개서 문항·답변입니다.

${payload}

직무연결성, 경험 구체성, 성과 근거, 회사 맞춤도를 중심으로 첨삭하세요. 맞춤법만 고치는 수준은 피하세요.
진단 결과가 있으면 직업흥미·가치관·업무스타일·기초역량을 반영한 조언을 포함하세요.
답변이 있는 문항에 대해 문항별 피드백을 작성하세요.

응답은 JSON 하나만 출력하세요. 마크다운 코드 블록이나 설명 문장은 넣지 마세요.

스키마:
{
  "overallComment": "전체 총평",
  "averageScore": 0,
  "items": [
    {
      "id": 1,
      "question": "문항",
      "score": 0,
      "scores": {
        "questionFit": 0,
        "jobFit": 0,
        "specificity": 0,
        "evidence": 0,
        "companyFit": 0
      },
      "strengths": ["좋은 점"],
      "improvements": ["보완점"],
      "diagnosisAdvice": ["진단 기반 조언"],
      "recommendedStructure": ["구조1","구조2","구조3"],
      "sampleRevision": "수정 예시 문장"
    }
  ]
}

점수는 0~100 정수로 제시하세요. averageScore는 items의 score 평균에 가깝게 맞추세요.`
}

function buildDiagnosisSummaryPrompt(body) {
  const payload = JSON.stringify(
    {
      profile: body.profile ?? {},
      diagnosisResult: body.diagnosisResult ?? null,
    },
    null,
    2,
  )
  return `아래는 사용자 진단 결과입니다.

${payload}

검사 코드(R, I, A 등)나 유형 코드 표현은 쓰지 마세요. 쉬운 한국어로 요약하세요.

응답은 JSON 하나만 출력하세요.

스키마:
{
  "summary": "사용자가 이해하기 쉬운 진단 요약",
  "keyStrengths": ["강점1","강점2","강점3"],
  "priorityActions": ["우선 실행1","우선 실행2","우선 실행3"]
}`
}

function getPromptForMode(mode, body) {
  if (mode === 'report') return buildReportPrompt(body)
  if (mode === 'coverLetter') return buildCoverLetterPrompt(body)
  if (mode === 'diagnosisSummary') return buildDiagnosisSummaryPrompt(body)
  return null
}

async function readJsonBody(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body
  }
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    jsonResponse(res, 405, { success: false, error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    jsonResponse(res, 503, {
      success: false,
      error: '서버에 OpenAI API 키가 설정되지 않았습니다.',
    })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    jsonResponse(res, 400, { success: false, error: 'Invalid JSON body' })
    return
  }

  const safeBody = body && typeof body === 'object' ? body : {}
  const { mode } = safeBody
  const prompt = getPromptForMode(mode, safeBody)
  if (!prompt) {
    jsonResponse(res, 400, {
      success: false,
      error: 'mode는 report, coverLetter, diagnosisSummary 중 하나여야 합니다.',
    })
    return
  }

  const client = new OpenAI({ apiKey })

  try {
    const response = await client.responses.create({
      model: MODEL,
      instructions:
        '당신은 직업상담 관점의 커리어 코치입니다. 지시된 형식의 JSON만 출력합니다.',
      input: prompt,
    })

    const text =
      typeof response.output_text === 'string'
        ? response.output_text
        : String(response.output_text ?? '')

    const candidate = extractJsonCandidate(text)
    const parsed = safeJsonParse(candidate)

    jsonResponse(res, 200, {
      success: true,
      data: parsed || null,
      raw: parsed ? null : text,
    })
  } catch (e) {
    console.error('[api/ai-career]', e)
    jsonResponse(res, 500, {
      success: false,
      error: e instanceof Error ? e.message : 'OpenAI 호출 실패',
    })
  }
}
