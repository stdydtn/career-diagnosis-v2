import { useMemo, useState } from 'react'
import { buildBasicReport, runReportBuilderTests } from '../lib/reportBuilder.js'
import { downloadBasicReportPdf } from '../lib/pdf.js'
import { callCareerAI } from '../lib/ai.js'

if (import.meta.env.DEV) {
  runReportBuilderTests()
}

function SectionCard({ section }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{section.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {section.highlights.map((item) => (
          <span
            key={item}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {item}
          </span>
        ))}
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

function AiReportSection({ data }) {
  const sections = data?.sections && typeof data.sections === 'object' ? data.sections : {}
  const jobs = Array.isArray(data?.recommendedJobs) ? data.recommendedJobs : []
  const plan = Array.isArray(data?.actionPlan) ? data.actionPlan : []

  return (
    <section className="rounded-3xl border-2 border-violet-200 bg-violet-50/40 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
        AI Report
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">
        {data?.title || 'AI 커리어 상세 리포트'}
      </h3>
      <div className="mt-4 rounded-2xl border border-violet-100 bg-white p-4">
        <p className="text-sm leading-6 text-slate-800">{data?.summary}</p>
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
              <p className="mt-2 text-sm leading-6 text-slate-700">{s.description}</p>
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
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {jobs.slice(0, 5).map((job, index) => {
            const name = typeof job === 'string' ? job : job?.name ?? '-'
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
      </div>

      <div className="mt-8">
        <h4 className="text-base font-semibold text-slate-900">다음 실행전략 (AI)</h4>
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
      </div>
    </section>
  )
}

/**
 * @param {{
 *   profile?: object,
 *   diagnosisResult: object | null,
 *   basicReport?: object | null,
 *   aiReport?: object | null,
 *   setAiReport?: (v: object | null) => void,
 *   switchTab: (id: string) => void,
 *   feedbackSubmitted: boolean,
 * }} props
 */
export function BasicReportPage({
  profile,
  diagnosisResult,
  basicReport: basicReportProp,
  aiReport,
  setAiReport,
  switchTab,
  feedbackSubmitted,
}) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

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
    setAiLoading(true)
    try {
      const res = await callCareerAI({
        mode: 'report',
        profile,
        diagnosisResult,
        basicReport: report,
      })
      if (!res?.data) {
        window.alert('AI 리포트 생성 중 오류가 발생했습니다.')
        return
      }
      setAiReport?.(res.data)
    } catch (e) {
      console.error(e)
      window.alert('AI 리포트 생성 중 오류가 발생했습니다.')
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
          <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Basic Report
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{report.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {report.subtitle}
                </p>
                <div className="mt-5 rounded-2xl bg-white/10 p-4">
                  <p className="text-sm leading-6 text-slate-100">{report.summary}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 lg:pt-8">
                <button
                  type="button"
                  disabled={pdfLoading}
                  onClick={handlePdfClick}
                  className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                >
                  {pdfLoading ? 'PDF 생성 중...' : 'PDF 파일로 저장하기'}
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleAiReport}
                  className="w-full rounded-2xl border border-violet-300/50 bg-violet-500/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                >
                  {aiLoading ? 'AI 리포트 생성 중...' : 'AI 리포트 생성하기'}
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SectionCard section={report.sections.interest} />
            <SectionCard section={report.sections.values} />
            <SectionCard section={report.sections.workStyle} />
            <SectionCard section={report.sections.competency} />
            <SectionCard section={report.sections.maturity} />
            <SectionCard section={report.sections.readiness} />
          </div>

          <SectionCard section={report.sections.barriers} />

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900">추천 직무 TOP 5</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {report.recommendedJobs.map((job, index) => (
                <article
                  key={job}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-semibold text-slate-500">
                    {index + 1}순위
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{job}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    상위 직업흥미와 업무역량을 함께 고려했을 때, 강점을 발휘할
                    가능성이 있는 직무입니다.
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900">다음 실행전략</h3>
            <ol className="mt-4 space-y-2">
              {report.actionPlan.map((item, idx) => (
                <li
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <span className="mr-2 font-semibold text-slate-900">
                    {idx + 1}.
                  </span>
                  {item}
                </li>
              ))}
            </ol>
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
