import { useMemo, useState } from 'react'
import {
  barrierLabels,
  competencyLabels,
  DIAGNOSIS_SECTIONS,
  interestLabels,
  valueLabels,
  workStyleLabels,
} from '../constants/labels.js'
import { QUESTION_QUOTA, TOTAL_QUESTION_COUNT } from '../constants/quotas.js'
import { questionBank } from '../data/questionBank.js'
import {
  buildDiagnosisPages,
  generateExamQuestions,
  runQuestionSelectorTests,
} from '../lib/questionSelector.js'
import { SESSION_QUESTIONS_STORAGE_KEY } from '../lib/diagnosisLocalSession.js'
import { buildDiagnosisResult, runScoringTests } from '../lib/scoring.js'
import { ProfileForm } from './ProfileForm.jsx'
import { ScoreBar } from './ScoreBar.jsx'

function Card({ title, children, right }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </section>
  )
}

const statusLabelMap = {
  employed: '재직',
  jobSeeking: '구직',
  student: '학생',
  careerBreak: '경력단절/휴식',
  other: '기타',
}

const DIAGNOSIS_INTERPRETATION_NOTE =
  '본 결과는 응답 내용을 바탕으로 한 진로·취업 준비 참고자료입니다. 특정 직업이나 기업에 대한 적합성을 단정하지 않으며, 실제 선택 시 개인의 경험, 목표, 환경을 함께 고려해야 합니다.'

const POST_DIAGNOSIS_NEXT_STEPS =
  '이제 베이직 리포트를 확인하고, 필요하다면 AI 리포트와 자기소개서 첨삭 기능도 함께 사용해보세요. 마지막으로 MVP 후기조사를 제출하면 PDF 저장과 데이터 저장이 완료됩니다.'

function SummaryItem({ label, value }) {
  const text =
    value == null
      ? ''
      : typeof value === 'string'
        ? value.trim()
        : String(value).trim()
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900">
        {text ? text : '미입력'}
      </p>
    </div>
  )
}

export function DiagnosisPage({
  profile,
  setProfile,
  profileReady,
  setProfileReady,
  sessionQuestions,
  setSessionQuestions,
  answers,
  setAnswers,
  diagnosisResult,
  setDiagnosisResult,
  switchTab,
}) {
  const [currentPage, setCurrentPage] = useState(0)

  const pages = useMemo(() => {
    if (!sessionQuestions?.length) return []
    const rawPages = buildDiagnosisPages(sessionQuestions)
    const order = new Map(DIAGNOSIS_SECTIONS.map((s, i) => [s.type, i]))
    return [...rawPages].sort((a, b) => (order.get(a.type) ?? 999) - (order.get(b.type) ?? 999))
  }, [sessionQuestions])

  const pageTypeToFirstIndex = useMemo(() => {
    /** @type {Record<string, number>} */
    const map = {}
    pages.forEach((p, idx) => {
      if (map[p.type] === undefined) map[p.type] = idx
    })
    return map
  }, [pages])

  const answeredCountByType = useMemo(() => {
    /** @type {Record<string, number>} */
    const out = {}
    for (const q of sessionQuestions) {
      if (answers[q.id] == null) continue
      out[q.type] = (out[q.type] ?? 0) + 1
    }
    return out
  }, [answers, sessionQuestions])

  const answeredQuestionTotal = useMemo(
    () =>
      sessionQuestions.filter((q) => typeof answers[q.id] === 'number').length,
    [sessionQuestions, answers],
  )
  const remainingQuestions = Math.max(0, TOTAL_QUESTION_COUNT - answeredQuestionTotal)

  const isDone =
    sessionQuestions.length > 0 &&
    Object.keys(answers).length === sessionQuestions.length
  const computedResult = isDone
    ? buildDiagnosisResult({ answers, sessionQuestions, profile })
    : null

  const current = pages[currentPage]
  const currentQuestions = current?.questions ?? []
  const currentAllAnswered =
    currentQuestions.length > 0 &&
    currentQuestions.every((q) => typeof answers[q.id] === 'number')

  const initSession = () => {
    try {
      const raw = localStorage.getItem(SESSION_QUESTIONS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length === TOTAL_QUESTION_COUNT) {
          const ids = parsed.map((q) => q?.id)
          if (new Set(ids).size === ids.length) {
            setSessionQuestions(parsed)
            return
          }
        }
      }
    } catch {
      // ignore and regenerate
    }

    const generated = generateExamQuestions(questionBank, QUESTION_QUOTA)
    localStorage.setItem(SESSION_QUESTIONS_STORAGE_KEY, JSON.stringify(generated))
    setSessionQuestions(generated)
  }

  const regenerateSession = () => {
    localStorage.removeItem(SESSION_QUESTIONS_STORAGE_KEY)
    const generated = generateExamQuestions(questionBank, QUESTION_QUOTA)
    localStorage.setItem(SESSION_QUESTIONS_STORAGE_KEY, JSON.stringify(generated))
    setSessionQuestions(generated)
    setAnswers({})
    setCurrentPage(0)
  }

  const resetDiagnosis = () => {
    setAnswers({})
    setCurrentPage(0)
  }
 
  const handleStartDiagnosis = () => {
    initSession()
    if (import.meta.env.DEV) {
      runQuestionSelectorTests({ questionBank, quota: QUESTION_QUOTA })
      runScoringTests()
    }
    setProfileReady(true)
  }

  const labelMaps = {
    interest: Object.fromEntries(
      Object.entries(interestLabels).map(([k, v]) => [k, v.name]),
    ),
    values: valueLabels,
    workStyle: workStyleLabels,
    competency: competencyLabels,
    barriers: barrierLabels,
  }
  const getDisplayLabel = (type, key) => labelMaps[type]?.[key] ?? key

  const scale = [
    { value: 1, label: '전혀 그렇지 않다' },
    { value: 2, label: '그렇지 않은 편이다' },
    { value: 3, label: '보통이다' },
    { value: 4, label: '그런 편이다' },
    { value: 5, label: '매우 그렇다' },
  ]

  return (
    <div className="space-y-6">
      <Card
        title="커리어 진단"
        right={
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!profileReady}
              className={[
                'rounded-2xl px-4 py-2 text-sm font-medium text-white',
                profileReady ? 'bg-slate-900' : 'bg-slate-300',
              ].join(' ')}
            >
              문항 진입(예정)
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              불러오기(예정)
            </button>
          </div>
        }
      >
        <p>
          진단 전 기본정보 입력 → 진단 화면 진입 → 7개 검사 영역 구조 표시까지
          구현합니다.
        </p>
      </Card>

      {!profileReady ? (
        <Card title="기본정보 입력">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={regenerateSession}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              새 문항 세트 생성
            </button>
          </div>
          <ProfileForm
            profile={profile}
            setProfile={setProfile}
            onStart={handleStartDiagnosis}
            switchTab={switchTab}
          />
        </Card>
      ) : (
        <>
          <Card
            title="참여자 요약"
            right={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetDiagnosis}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  진단 초기화
                </button>
                <button
                  type="button"
                  onClick={regenerateSession}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  title="개발용: 새 문항 세트 생성"
                >
                  새 문항 세트 생성
                </button>
                <button
                  type="button"
                  onClick={() => setProfileReady(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  정보 수정
                </button>
              </div>
            }
          >
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryItem label="이름" value={profile.name} />
              <SummaryItem label="이메일" value={profile.email} />
              <SummaryItem
                label="현재 상태"
                value={
                  profile.status
                    ? statusLabelMap[profile.status] || profile.status
                    : ''
                }
              />
              <SummaryItem label="학교" value={profile.school} />
              <SummaryItem label="전공" value={profile.major} />
              <SummaryItem label="희망 직무" value={profile.targetJob} />
            </div>
          </Card>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <aside className="lg:col-span-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    검사 영역 진행
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    영역을 클릭하면 해당 영역의 첫 페이지로 이동합니다.
                  </p>
                </div>

                <ol className="mt-4 space-y-2">
                  {DIAGNOSIS_SECTIONS.map((s, idx) => {
                    const done = answeredCountByType[s.type] ?? 0
                    const total = QUESTION_QUOTA[s.type]
                    const firstPageIndex = pageTypeToFirstIndex[s.type]
                    const isActive = current?.type === s.type
                    return (
                      <li key={s.type}>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof firstPageIndex === 'number') {
                              setCurrentPage(firstPageIndex)
                            }
                          }}
                          className={[
                            'w-full rounded-3xl border px-4 py-3 text-left transition',
                            isActive
                              ? 'border-slate-900 bg-white'
                              : 'border-slate-200 bg-white hover:bg-slate-50',
                          ].join(' ')}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-500">
                                {idx + 1}.
                              </p>
                              <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                                {s.displaySection}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {done}/{total}
                            </span>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </aside>

              <div className="lg:col-span-8">
                {isDone ? (
                  <div className="space-y-4">
                    <div
                      className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200"
                      role="note"
                    >
                      {DIAGNOSIS_INTERPRETATION_NOTE}
                    </div>
                    <div
                      className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 text-sm leading-6 text-indigo-950 ring-1 ring-indigo-100"
                      role="status"
                    >
                      {POST_DIAGNOSIS_NEXT_STEPS}
                    </div>
                    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <p className="text-sm font-semibold text-slate-900">
                        나의 커리어 요약
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {computedResult?.summary?.trim() ||
                          '아직 생성된 결과가 없습니다.'}
                      </p>
                    </section>

                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-white p-5">
                        <p className="text-sm font-semibold text-slate-900">
                          현재 진로·취업 준비 단계
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-800">
                          {computedResult?.stage?.label?.trim() ||
                            '아직 생성된 결과가 없습니다.'}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {computedResult?.stage?.description?.trim() ||
                            '아직 생성된 결과가 없습니다.'}
                        </p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-5">
                        <p className="text-sm font-semibold text-slate-900">
                          추천 직무 TOP 5
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(computedResult?.recommendedJobs ?? []).length ? (
                            (computedResult?.recommendedJobs ?? []).map((job) => (
                              <span
                                key={job}
                                className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                              >
                                {typeof job === 'string' && job.trim() ? job : '미입력'}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-slate-600">추천 직무 정보가 없습니다.</p>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-white p-5">
                        <p className="text-sm font-semibold text-slate-900">
                          직업흥미 TOP 3
                        </p>
                        <div className="mt-3 space-y-3">
                          {(computedResult?.top?.interest ?? []).map(([key, value]) => (
                            <ScoreBar
                              key={`interest-${key}`}
                              label={getDisplayLabel('interest', key)}
                              value={value}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-5">
                        <p className="text-sm font-semibold text-slate-900">
                          직업가치관 TOP 3
                        </p>
                        <div className="mt-3 space-y-3">
                          {(computedResult?.top?.values ?? []).map(([key, value]) => (
                            <ScoreBar
                              key={`values-${key}`}
                              label={getDisplayLabel('values', key)}
                              value={value}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-5">
                        <p className="text-sm font-semibold text-slate-900">
                          업무스타일 TOP 3
                        </p>
                        <div className="mt-3 space-y-3">
                          {(computedResult?.top?.workStyle ?? []).map(([key, value]) => (
                            <ScoreBar
                              key={`workStyle-${key}`}
                              label={getDisplayLabel('workStyle', key)}
                              value={value}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-white p-5">
                        <p className="text-sm font-semibold text-slate-900">
                          직업기초역량 TOP 3
                        </p>
                        <div className="mt-3 space-y-3">
                          {(computedResult?.top?.competency ?? []).map(([key, value]) => (
                            <ScoreBar
                              key={`competency-${key}`}
                              label={getDisplayLabel('competency', key)}
                              value={value}
                            />
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5">
                      <p className="text-sm font-semibold text-slate-900">
                        추가 지원 필요 영역 TOP 2
                      </p>
                      <div className="mt-3 space-y-3">
                        {(computedResult?.top?.barriers ?? []).map(([key, value]) => (
                          <ScoreBar
                            key={`barrier-${key}`}
                            label={getDisplayLabel('barriers', key)}
                            value={value}
                          />
                        ))}
                      </div>
                    </section>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!computedResult) return
                          setDiagnosisResult(computedResult)
                          switchTab('basicReport')
                        }}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                      >
                        베이직 리포트 보기
                      </button>
                    </div>

                    {diagnosisResult ? (
                      <p className="text-xs text-slate-500">
                        최신 결과가 베이직 리포트에 반영되었습니다.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <p
                      className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-100"
                      aria-live="polite"
                    >
                      전체 {TOTAL_QUESTION_COUNT}문항 중 {answeredQuestionTotal}문항 응답
                      완료 · {remainingQuestions}문항 남음
                    </p>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <p className="text-sm font-semibold text-slate-900">
                        {current?.displaySection ?? '문항 로딩 중...'}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {DIAGNOSIS_SECTIONS.find((s) => s.type === current?.type)
                          ?.section ?? ''}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {DIAGNOSIS_SECTIONS.find((s) => s.type === current?.type)
                          ?.description ?? ''}
                      </p>
                    </div>

                    <div className="mt-4 space-y-4">
                      {currentQuestions.map((q, idx) => {
                        const selected = answers[q.id]
                        return (
                          <section
                            key={q.id}
                            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">
                                Q{idx + 1}. {q.text}
                              </p>
                              <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                {q.key}
                              </span>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
                              {scale.map((s) => {
                                const active = selected === s.value
                                return (
                                  <button
                                    key={s.value}
                                    type="button"
                                    onClick={() =>
                                      setAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: s.value,
                                      }))
                                    }
                                    className={[
                                      'rounded-2xl px-3 py-2 text-left text-sm font-medium transition',
                                      active
                                        ? 'bg-slate-900 text-white'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                                    ].join(' ')}
                                  >
                                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-800">
                                      {s.value}
                                    </span>
                                    <span>{s.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </section>
                        )
                      })}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className={[
                          'rounded-2xl px-4 py-2 text-sm font-medium',
                          currentPage === 0
                            ? 'bg-slate-300 text-white'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        이전
                      </button>

                      <div className="text-sm text-slate-600">
                        페이지 {pages.length ? currentPage + 1 : 0}/{pages.length}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(pages.length - 1, p + 1))
                        }
                        disabled={!currentAllAnswered || currentPage >= pages.length - 1}
                        className={[
                          'rounded-2xl px-4 py-2 text-sm font-medium text-white',
                          currentAllAnswered && currentPage < pages.length - 1
                            ? 'bg-slate-900 hover:bg-slate-800'
                            : 'bg-slate-300',
                        ].join(' ')}
                      >
                        다음
                      </button>
                    </div>

                  </>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

