import { useMemo, useState } from 'react'
import { buildBasicReport, runReportBuilderTests } from '../lib/reportBuilder.js'
import { downloadBasicReportPdf } from '../lib/pdf.js'
import { callCareerAI, careerAiPayloadForState } from '../lib/ai.js'

if (import.meta.env.DEV) {
  runReportBuilderTests()
}

function SectionCard({ section }) {
  const title =
    typeof section?.title === 'string' && section.title.trim()
      ? section.title
      : '아직 생성된 결과가 없습니다.'
  const description =
    typeof section?.description === 'string' && section.description.trim()
      ? section.description
      : '아직 생성된 결과가 없습니다.'
  const highlights = Array.isArray(section?.highlights) ? section.highlights : []

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {highlights.length ? (
          highlights.map((item) => (
            <span
              key={item}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {item}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500">아직 생성된 결과가 없습니다.</p>
        )}
      </div>
    </section>
  )
}

const AI_SECTION_KEYS = [
  'interest',
  'values',
  'workStyle',
  'competency',
  'maturity',
  'readiness',
  'barriers',
]

const DIAGNOSIS_INTERPRETATION_NOTE =
  '본 결과는 응답 내용을 바탕으로 한 진로·취업 준비 참고자료입니다. 특정 직업이나 기업에 대한 적합성을 단정하지 않으며, 실제 선택 시 개인의 경험, 목표, 환경을 함께 고려해야 합니다.'

const AI_REPORT_DISCLAIMER =
  'AI 리포트는 진단 응답과 입력 정보를 바탕으로 생성되는 참고용 해석입니다. 실제 진로 선택, 지원 기업 결정, 자기소개서 최종 제출 시에는 본인의 상황과 목표에 맞게 검토해 주세요.'

const AI_REPORT_ERROR_MESSAGE =
  'AI 리포트 생성 중 일시적인 오류가 발생했습니다. 현재 화면의 기본 리포트는 계속 확인할 수 있습니다. 잠시 후 다시 시도해주세요.'

const PDF_FEEDBACK_NOTICE =
  'PDF 저장은 MVP 후기조사 제출 후 이용할 수 있습니다. 후기조사는 서비스 개선과 정식 출시 준비에 활용됩니다.'

const AI_REGENERATE_CONFIRM =
  '이미 생성된 AI 리포트가 있습니다. 다시 생성하면 기존 AI 리포트가 새 결과로 바뀝니다. 다시 생성하시겠습니까?'

const AI_REPORT_TEST_FEEDBACK_HINT =
  'AI 리포트 결과가 본인의 상황과 얼마나 맞는지 확인해보고, 어색하거나 보완이 필요한 부분은 후기조사에 남겨주세요.'

function AiReportSection({ data }) {
  if (data == null) return null
  if (typeof data === 'string' && data.trim()) {
    return (
      <section className="rounded-3xl border-2 border-violet-200 bg-violet-50/40 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
          AI Report
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">AI 커리어 상세 리포트</h3>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-800">{data}</p>
      </section>
    )
  }
  if (
    typeof data === 'object' &&
    typeof data._rawText === 'string' &&
    data._rawText.trim()
  ) {
    return (
      <section className="rounded-3xl border-2 border-violet-200 bg-violet-50/40 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
          AI Report
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">AI 커리어 상세 리포트 (원문)</h3>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-800">
          {data._rawText}
        </p>
      </section>
    )
  }

  const sections = data?.sections && typeof data.sections === 'object' ? data.sections : {}
  const jobs = Array.isArray(data?.recommendedJobs) ? data.recommendedJobs : []
  const plan = Array.isArray(data?.actionPlan) ? data.actionPlan : []
  const summaryText =
    typeof data?.summary === 'string' && data.summary.trim()
      ? data.summary
      : '아직 생성된 결과가 없습니다.'

  return (
    <section className="rounded-3xl border-2 border-violet-200 bg-violet-50/40 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
        AI Report
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">
        {data?.title?.trim() || 'AI 커리어 상세 리포트'}
      </h3>
      <div className="mt-4 rounded-2xl border border-violet-100 bg-white p-4">
        <p className="text-sm leading-6 text-slate-800">{summaryText}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AI_SECTION_KEYS.map((key) => {
          const s = sections[key]
          if (!s?.title) return null
          return (
            <div
              key={key}
              className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm"
            >
              <h4 className="text-sm font-semibold text-slate-900">{s.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {typeof s.description === 'string' && s.description.trim()
                  ? s.description
                  : '아직 생성된 결과가 없습니다.'}
              </p>
              {Array.isArray(s.highlights) && s.highlights.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-700">
                  {s.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-8">
        <h4 className="text-base font-semibold text-slate-900">추천 직무 (AI)</h4>
        {jobs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">추천 직무 정보가 없습니다.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {jobs.slice(0, 5).map((job, index) => {
              const name = typeof job === 'string' ? job : job?.name ?? '미입력'
              const reason =
                typeof job === 'object' && job?.reason
                  ? job.reason
                  : '진단 결과를 바탕으로 추천된 직무입니다.'
              return (
                <article
                  key={`${name}-${index}`}
                  className="rounded-2xl border border-violet-100 bg-white p-4"
                >
                  <p className="text-xs font-semibold text-violet-600">{index + 1}순위</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{reason}</p>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h4 className="text-base font-semibold text-slate-900">다음 실행전략 (AI)</h4>
        {plan.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">아직 생성된 결과가 없습니다.</p>
        ) : (
          <ol className="mt-3 space-y-2">
            {plan.map((item, idx) => (
              <li
                key={`${idx}-${item}`}
                className="rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <span className="mr-2 font-semibold text-slate-900">{idx + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

/**
 * @param {{
 *   profile?: object,
 *   diagnosisResult: object | null,
 *   switchTab: (id: string) => void,
 *   feedbackSubmitted: boolean,
 *   aiReport?: object | null,
 *   setAiReport?: (v: object | null) => void,
 *   basicReport?: object | null,
 * }} props
 */
export function BasicReportPage({
  profile,
  diagnosisResult,
  switchTab,
  feedbackSubmitted,
  aiReport,
  setAiReport,
  basicReport: basicReportProp,
}) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const report = useMemo(() => {
    if (!diagnosisResult) return null
    if (basicReportProp) return basicReportProp
    return buildBasicReport(diagnosisResult, profile)
  }, [basicReportProp, diagnosisResult, profile])

  const handlePdfClick = async () => {
    if (!feedbackSubmitted) {
      window.alert('PDF 저장 전 MVP 후기조사를 먼저 작성해주세요.')
      switchTab('feedback')
      return
    }
    if (!diagnosisResult || !report) return

    setPdfLoading(true)
    try {
      await downloadBasicReportPdf({
        profile,
        diagnosisResult,
        basicReport: report,
      })
    } catch (e) {
      console.error(e)
      window.alert(
        e instanceof Error
          ? e.message
          : 'PDF를 생성하는 중 오류가 발생했습니다.',
      )
    } finally {
      setPdfLoading(false)
    }
  }

  const handleAiReport = async () => {
    if (!diagnosisResult || !report) return
    if (
      aiReport &&
      !window.confirm(AI_REGENERATE_CONFIRM)
    ) {
      return
    }
    setAiError('')
    setAiLoading(true)
    try {
      const res = await callCareerAI({
        mode: 'report',
        profile,
        diagnosisResult,
        basicReport: report,
      })
      const payload = careerAiPayloadForState(res)
      if (!payload) {
        setAiError(AI_REPORT_ERROR_MESSAGE)
        return
      }
      setAiReport?.(payload)
      setAiError('')
    } catch (e) {
      console.error(e)
      setAiError(AI_REPORT_ERROR_MESSAGE)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {!diagnosisResult || !report ? (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            베이직 리포트
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            아직 생성된 리포트가 없습니다. 커리어 진단을 먼저 완료해주세요.
          </p>
          <button
            type="button"
            onClick={() => switchTab('diagnosis')}
            className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            커리어 진단하러 가기
          </button>
        </section>
      ) : (
        <>
          {feedbackSubmitted ? (
            <div
              className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium leading-6 text-emerald-950 ring-1 ring-emerald-100"
              role="status"
            >
              테스트 참여와 후기 제출이 완료되었습니다. 저장된 응답은 서비스 개선과 정식 출시
              검토에 활용됩니다.
            </div>
          ) : null}

          <div
            className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200"
            role="note"
          >
            {DIAGNOSIS_INTERPRETATION_NOTE}
          </div>

          <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Basic Report
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {report.title?.trim() || '베이직 리포트'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {report.subtitle?.trim() || '아직 생성된 결과가 없습니다.'}
                </p>
                <div className="mt-5 rounded-2xl bg-white/10 p-4">
                  <p className="text-sm leading-6 text-slate-100">
                    {report.summary?.trim() || '아직 생성된 결과가 없습니다.'}
                  </p>
                </div>
              </div>
              <div className="flex w-full min-w-[220px] shrink-0 flex-col gap-3 lg:max-w-sm lg:pt-8">
                <p className="text-xs leading-5 text-slate-300">{PDF_FEEDBACK_NOTICE}</p>
                <button
                  type="button"
                  disabled={pdfLoading || !feedbackSubmitted}
                  onClick={handlePdfClick}
                  className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                >
                  {pdfLoading ? 'PDF 생성 중...' : 'PDF 파일로 저장하기'}
                </button>
                <p className="text-xs leading-5 text-slate-300">{AI_REPORT_DISCLAIMER}</p>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleAiReport}
                  className="w-full rounded-2xl border border-violet-300/50 bg-violet-500/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:bg-slate-300 lg:w-auto"
                >
                  {aiLoading ? 'AI 리포트 생성 중...' : 'AI 리포트 생성하기'}
                </button>
                <p className="text-xs leading-5 text-slate-200">
                  {AI_REPORT_TEST_FEEDBACK_HINT}
                </p>
                {aiError ? (
                  <p
                    className="rounded-2xl border border-amber-200/40 bg-amber-950/30 px-3 py-2 text-xs leading-5 text-amber-100"
                    role="alert"
                  >
                    {aiError}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(() => {
              const sec = report?.sections && typeof report.sections === 'object' ? report.sections : {}
              return (
                <>
                  <SectionCard section={sec.interest} />
                  <SectionCard section={sec.values} />
                  <SectionCard section={sec.workStyle} />
                  <SectionCard section={sec.competency} />
                  <SectionCard section={sec.maturity} />
                  <SectionCard section={sec.readiness} />
                </>
              )
            })()}
          </div>

          <SectionCard section={report?.sections?.barriers} />

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900">추천 직무 TOP 5</h3>
            {Array.isArray(report.recommendedJobs) && report.recommendedJobs.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {report.recommendedJobs.map((job, index) => (
                  <article
                    key={String(job) + index}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-semibold text-slate-500">
                      {index + 1}순위
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {typeof job === 'string' && job.trim() ? job : '미입력'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      상위 직업흥미와 업무역량을 함께 고려했을 때, 강점을 발휘할
                      가능성이 있는 직무입니다.
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">추천 직무 정보가 없습니다.</p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900">다음 실행전략</h3>
            {Array.isArray(report.actionPlan) && report.actionPlan.length > 0 ? (
              <ol className="mt-4 space-y-2">
                {report.actionPlan.map((item, idx) => (
                  <li
                    key={String(item) + idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    <span className="mr-2 font-semibold text-slate-900">
                      {idx + 1}.
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-slate-600">아직 생성된 결과가 없습니다.</p>
            )}
          </section>

          {aiReport ? <AiReportSection data={aiReport} /> : null}

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900">MVP 후기조사</h3>
            {feedbackSubmitted ? (
              <p className="mt-3 text-sm leading-6 text-slate-700">
                후기조사가 제출되었습니다.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  서비스 개선을 위해 짧은 후기를 남겨주시면 큰 도움이 됩니다.
                </p>
                <button
                  type="button"
                  onClick={() => switchTab('feedback')}
                  className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  MVP 후기 작성하기
                </button>
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}
