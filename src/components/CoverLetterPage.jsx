import { useMemo, useState } from 'react'
import { reviewCoverLetter } from '../lib/coverLetterReview.js'
import { callCareerAI } from '../lib/ai.js'
import { ScoreBar } from './ScoreBar.jsx'

const initialItems = [1, 2, 3, 4].map((id) => ({
  id,
  question: '',
  answer: '',
}))

/**
 * @param {{
 *   profile?: object,
 *   diagnosisResult?: object | null,
 *   coverLetterReview?: object | null,
 *   setCoverLetterReview?: (v: object | null) => void,
 *   aiCoverLetterReview?: object | null,
 *   setAiCoverLetterReview?: (v: object | null) => void,
 * }} props
 */
export function CoverLetterPage({
  profile,
  diagnosisResult,
  coverLetterReview,
  setCoverLetterReview,
  aiCoverLetterReview,
  setAiCoverLetterReview,
}) {
  const [aiLoading, setAiLoading] = useState(false)

  const [coverLetter, setCoverLetter] = useState({
    company: '',
    job: profile?.targetJob || '',
    items: initialItems,
  })
  const [reviewResult, setReviewResult] = useState(null)

  /** App/Supabase에는 { inputs, review } 봉투로 저장, UI는 review만 사용 */
  const displayReview = useMemo(() => {
    if (reviewResult) return reviewResult
    if (!coverLetterReview) return null
    if (
      coverLetterReview.review &&
      typeof coverLetterReview.review === 'object'
    ) {
      return coverLetterReview.review
    }
    if (Array.isArray(coverLetterReview.items)) return coverLetterReview
    return null
  }, [reviewResult, coverLetterReview])

  const answeredCount = useMemo(
    () => coverLetter.items.filter((it) => it.answer.trim()).length,
    [coverLetter.items],
  )

  const updateField = (field, value) => {
    setCoverLetter((prev) => ({ ...prev, [field]: value }))
  }

  const updateItem = (id, field, value) => {
    setCoverLetter((prev) => ({
      ...prev,
      items: prev.items.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    }))
  }

  const handleReview = () => {
    const hasAnswer = coverLetter.items.some((it) => it.answer.trim())
    if (!hasAnswer) {
      window.alert(
        '답변이 입력된 문항이 없습니다. 첨삭을 받으려면 최소 한 개 문항에 답변을 입력해주세요.',
      )
      return
    }
    const letterForReview = {
      ...coverLetter,
      job:
        coverLetter.job.trim() ||
        (typeof profile?.targetJob === 'string' ? profile.targetJob.trim() : '') ||
        '',
    }
    const result = reviewCoverLetter({
      coverLetter: letterForReview,
      profile,
      diagnosisResult: diagnosisResult ?? null,
    })
    setReviewResult(result)
    const forAppAndDb = {
      version: 1,
      savedAt: new Date().toISOString(),
      inputs: JSON.parse(JSON.stringify(letterForReview)),
      review: result,
    }
    setCoverLetterReview?.(forAppAndDb)
  }

  const handleAiCoverLetter = async () => {
    const hasAnswer = coverLetter.items.some((it) => it.answer.trim())
    if (!hasAnswer) {
      window.alert(
        '답변이 입력된 문항이 없습니다. AI 첨삭을 받으려면 최소 한 개 문항에 답변을 입력해주세요.',
      )
      return
    }
    const letterForReview = {
      ...coverLetter,
      job:
        coverLetter.job.trim() ||
        (typeof profile?.targetJob === 'string' ? profile.targetJob.trim() : '') ||
        '',
    }
    setAiLoading(true)
    try {
      const res = await callCareerAI({
        mode: 'coverLetter',
        profile,
        diagnosisResult: diagnosisResult ?? null,
        coverLetter: letterForReview,
      })
      if (!res?.data) {
        window.alert('AI 자기소개서 첨삭 중 오류가 발생했습니다.')
        return
      }
      setAiCoverLetterReview?.(res.data)
    } catch (e) {
      console.error(e)
      window.alert('AI 자기소개서 첨삭 중 오류가 발생했습니다.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
      <aside className="h-fit space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cover letter
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
            자기소개서 첨삭 안내
          </h2>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          문항과 답변을 입력한 뒤 &ldquo;자기소개서 첨삭하기&rdquo;를 누르면
          규칙 기반으로 점수와 보완 포인트를 확인할 수 있습니다. (GPT 미연동)
        </p>
        <dl className="space-y-3 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">진단 결과 연동</dt>
            <dd className="font-medium text-slate-900">
              {diagnosisResult ? '연동됨' : '미연동'}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">입력된 답변 문항 수</dt>
            <dd className="font-medium text-slate-900">{answeredCount} / 4</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">평균 점수</dt>
            <dd className="font-medium text-slate-900">
              {displayReview ? `${displayReview.averageScore}점` : '—'}
            </dd>
          </div>
        </dl>
      </aside>

      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h3 className="text-base font-semibold text-slate-900">지원 정보</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">지원 회사</span>
              <input
                type="text"
                value={coverLetter.company}
                onChange={(e) => updateField('company', e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900/10 focus:border-slate-300 focus:bg-white focus:ring-4"
                placeholder="예: OO주식회사"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">지원 직무</span>
              <input
                type="text"
                value={coverLetter.job}
                onChange={(e) => updateField('job', e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900/10 focus:border-slate-300 focus:bg-white focus:ring-4"
                placeholder="예: HR, 마케팅, 개발 등"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h3 className="text-base font-semibold text-slate-900">
            자기소개서 문항 (최대 4개)
          </h3>
          <div className="mt-6 space-y-6">
            {coverLetter.items.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5"
              >
                <p className="text-xs font-semibold text-slate-500">
                  문항 {row.id}
                </p>
                <label className="mt-2 block text-sm">
                  <span className="font-medium text-slate-700">문항</span>
                  <input
                    type="text"
                    value={row.question}
                    onChange={(e) =>
                      updateItem(row.id, 'question', e.target.value)
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900/10 focus:border-slate-300 focus:ring-4"
                    placeholder="자기소개서 질문을 붙여넣거나 요약해 입력하세요."
                  />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-slate-700">답변</span>
                  <textarea
                    value={row.answer}
                    onChange={(e) =>
                      updateItem(row.id, 'answer', e.target.value)
                    }
                    rows={6}
                    className="mt-1 w-full resize-y rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none ring-slate-900/10 focus:border-slate-300 focus:ring-4"
                    placeholder="답변을 입력하세요."
                  />
                </label>
                <p className="mt-2 text-right text-xs text-slate-500">
                  {row.answer.length}자
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleReview}
              className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              자기소개서 첨삭하기
            </button>
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleAiCoverLetter}
              className="rounded-2xl border border-indigo-300 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-900 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? 'AI 첨삭 생성 중...' : 'AI 자기소개서 첨삭하기'}
            </button>
          </div>
        </section>

        {displayReview && displayReview.items.length > 0 ? (
          <section className="space-y-6">
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                첨삭 결과
              </p>
              <h3 className="mt-2 text-xl font-semibold">전체 총평</h3>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                {displayReview.overallComment}
              </p>
              <p className="mt-4 text-sm font-medium text-slate-100">
                평균 점수:{' '}
                <span className="tabular-nums text-lg">
                  {displayReview.averageScore}
                </span>
                <span className="text-slate-300"> / 100</span>
              </p>
            </div>

            {displayReview.items.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-lg font-semibold text-slate-900">
                    문항 {item.id}
                  </h4>
                  <p className="text-sm text-slate-600">
                    종합{' '}
                    <span className="font-semibold text-slate-900">
                      {item.score}점
                    </span>
                    <span className="text-slate-400"> · </span>
                    분량 {item.length}자
                  </p>
                </div>
                {item.question ? (
                  <p className="mt-2 text-sm text-slate-600">{item.question}</p>
                ) : null}

                <div className="mt-6 space-y-4">
                  <p className="text-sm font-semibold text-slate-800">세부 점수</p>
                  <ScoreBar
                    label="문항적합도"
                    value={item.scores.questionFit}
                    valueScale="hundred"
                  />
                  <ScoreBar
                    label="직무연결성"
                    value={item.scores.jobFit}
                    valueScale="hundred"
                  />
                  <ScoreBar
                    label="경험구체성"
                    value={item.scores.specificity}
                    valueScale="hundred"
                  />
                  <ScoreBar
                    label="성과근거"
                    value={item.scores.evidence}
                    valueScale="hundred"
                  />
                  <ScoreBar
                    label="회사맞춤도"
                    value={item.scores.companyFit}
                    valueScale="hundred"
                  />
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      좋은 점
                    </p>
                    {item.strengths.length ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                        {item.strengths.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        규칙상 자동으로 집은 강점이 없습니다. 키워드·분량을
                        보강해보세요.
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      보완할 점
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                      {item.improvements.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-semibold text-slate-800">
                    진단 결과 기반 조언
                  </p>
                  <ul className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
                    {item.diagnosisAdvice.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-semibold text-slate-800">
                    추천 수정 구조
                  </p>
                  <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
                    {item.recommendedStructure.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ol>
                </div>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    문장 수정 예시
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {item.sampleRevision}
                  </p>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {aiCoverLetterReview &&
        Array.isArray(aiCoverLetterReview.items) &&
        aiCoverLetterReview.items.length > 0 ? (
          <section className="space-y-6">
            <div className="rounded-3xl border-2 border-indigo-200 bg-indigo-50/50 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                AI 첨삭
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                AI 자기소개서 첨삭 결과
              </h3>
            </div>

            <div className="rounded-3xl bg-indigo-950 p-6 text-white shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                AI 총평
              </p>
              <p className="mt-3 text-sm leading-6 text-indigo-50">
                {aiCoverLetterReview.overallComment}
              </p>
              <p className="mt-4 text-sm font-medium text-white">
                평균 점수:{' '}
                <span className="tabular-nums text-lg">
                  {aiCoverLetterReview.averageScore}
                </span>
                <span className="text-indigo-200"> / 100</span>
              </p>
            </div>

            {aiCoverLetterReview.items.map((item) => (
              <article
                key={`ai-${item.id}`}
                className="rounded-3xl border-2 border-indigo-100 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-lg font-semibold text-slate-900">
                    문항 {item.id} (AI)
                  </h4>
                  <p className="text-sm text-slate-600">
                    종합{' '}
                    <span className="font-semibold text-slate-900">{item.score}점</span>
                  </p>
                </div>
                {item.question ? (
                  <p className="mt-2 text-sm text-slate-600">{item.question}</p>
                ) : null}

                <div className="mt-6 space-y-4">
                  <p className="text-sm font-semibold text-slate-800">세부 점수 (AI)</p>
                  <ScoreBar
                    label="문항적합도"
                    value={item.scores?.questionFit ?? 0}
                    valueScale="hundred"
                  />
                  <ScoreBar
                    label="직무연결성"
                    value={item.scores?.jobFit ?? 0}
                    valueScale="hundred"
                  />
                  <ScoreBar
                    label="경험구체성"
                    value={item.scores?.specificity ?? 0}
                    valueScale="hundred"
                  />
                  <ScoreBar
                    label="성과근거"
                    value={item.scores?.evidence ?? 0}
                    valueScale="hundred"
                  />
                  <ScoreBar
                    label="회사맞춤도"
                    value={item.scores?.companyFit ?? 0}
                    valueScale="hundred"
                  />
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">좋은 점</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                      {(item.strengths ?? []).map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">보완할 점</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                      {(item.improvements ?? []).map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-semibold text-slate-800">
                    진단 결과 기반 조언 (AI)
                  </p>
                  <ul className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
                    {(item.diagnosisAdvice ?? []).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-semibold text-slate-800">추천 수정 구조 (AI)</p>
                  <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
                    {(item.recommendedStructure ?? []).map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ol>
                </div>

                <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <p className="text-sm font-semibold text-slate-800">문장 수정 예시 (AI)</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {item.sampleRevision}
                  </p>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  )
}
