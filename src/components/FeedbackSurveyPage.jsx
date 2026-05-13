import { useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { saveDiagnosisSubmission } from '../lib/saveDiagnosis.js'

const SATISFACTION_OPTIONS = [
  '매우 만족',
  '만족',
  '보통',
  '불만족',
  '매우 불만족',
]

const USEFULNESS_OPTIONS = [
  '매우 도움됨',
  '도움됨',
  '보통',
  '도움 안 됨',
  '전혀 도움 안 됨',
]

const EASY_OPTIONS = ['매우 쉬움', '쉬움', '보통', '어려움', '매우 어려움']

const RECOMMEND_OPTIONS = [
  '적극 추천',
  '추천',
  '보통',
  '추천 어려움',
  '추천하지 않음',
]

const PAID_INTENT_OPTIONS = [
  '유료라도 사용 의향 있음',
  '가격에 따라 사용 의향 있음',
  '무료라면 사용 의향 있음',
  '아직 잘 모르겠음',
  '사용 의향 없음',
]

function RadioGroup({ label, required, name, value, options, onChange }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-900">
        {label}
        {required ? (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const id = `${name}-${opt}`
          return (
            <label
              key={opt}
              htmlFor={id}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50"
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="h-4 w-4 border-slate-300 text-slate-900"
              />
              <span>{opt}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/**
 * @param {{
 *   profile: object,
 *   sessionQuestions: unknown[],
 *   answers: object,
 *   diagnosisResult: object | null,
 *   coverLetterReview: object | null,
 *   aiReport?: object | null,
 *   aiCoverLetterReview?: object | null,
 *   feedback: object,
 *   setFeedback: (fn: object | ((prev: object) => object)) => void,
 *   onSubmitted?: () => void,
 *   switchTab: (id: string) => void,
 *   feedbackSubmitted?: boolean,
 * }} props
 */
export function FeedbackSurveyPage({
  profile,
  sessionQuestions,
  answers,
  diagnosisResult,
  coverLetterReview,
  aiReport,
  aiCoverLetterReview,
  feedback,
  setFeedback,
  onSubmitted,
  switchTab,
  feedbackSubmitted = false,
}) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [skippedSave, setSkippedSave] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const update = (key, val) => {
    setFeedback((prev) => ({ ...prev, [key]: val }))
  }

  const validate = () => {
    const required = [
      ['satisfaction', '전체 만족도'],
      ['usefulness', '진단 결과가 도움이 되었나요?'],
      ['easyToUse', '서비스 사용이 쉬웠나요?'],
      ['recommend', '주변에 추천할 의향'],
      ['paidIntent', '유료화 시 사용 의향'],
      ['improvement', '개선되었으면 하는 점'],
    ]
    for (const [key, label] of required) {
      const v = feedback[key]
      if (typeof v !== 'string' || !v.trim()) {
        window.alert(`${label} 항목을 입력해주세요.`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (feedbackSubmitted) return
    if (!validate()) return
    if (isSupabaseConfigured && !profile?.privacyConsent) {
      window.alert(
        '개인정보 수집·이용에 동의하셔야 후기 제출 및 저장이 가능합니다. 기본정보 입력 단계에서 동의 후 다시 시도해주세요.',
      )
      return
    }

    setLoading(true)
    setSubmitError('')
    try {
      const result = await saveDiagnosisSubmission({
        profile,
        sessionQuestions,
        answers,
        diagnosisResult,
        feedback,
        coverLetterReview,
        aiReport,
        aiCoverLetterReview,
      })

      if (result.skipped) {
        setSkippedSave(true)
      } else {
        setSkippedSave(false)
      }

      setSubmitted(true)
      onSubmitted?.()
      window.setTimeout(() => {
        switchTab('basicReport')
      }, 900)
    } catch (e) {
      console.error(e)
      setSubmitError(
        '후기 제출 중 오류가 발생했습니다. 새로고침하지 말고 잠시 후 다시 시도해주세요.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          후기 제출 완료
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {skippedSave
            ? '현재 개발 환경에서는 저장이 건너뛰어졌습니다. 배포 환경에서는 Supabase 설정을 확인해주세요.'
            : '후기와 진단 결과가 저장되었습니다. 테스트 참여에 감사드립니다.'}
        </p>
        <button
          type="button"
          onClick={() => switchTab('basicReport')}
          className="mt-6 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          베이직 리포트로 이동
        </button>
      </section>
    )
  }

  if (feedbackSubmitted) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          MVP 후기조사
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          후기조사가 제출되었습니다.
        </p>
        <button
          type="button"
          onClick={() => switchTab('basicReport')}
          className="mt-6 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          베이직 리포트로 이동
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Feedback
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
              MVP 후기조사
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              후기조사는 서비스 개선과 정식 출시 가능성 검토를 위해 활용됩니다. 사용
              중 불편했던 점, 도움이 되었던 점, 유료화 시 사용 의향을 솔직하게
              남겨주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => switchTab('basicReport')}
            className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            돌아가기
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-8">
          <RadioGroup
            label="전체 만족도"
            required
            name="satisfaction"
            value={feedback.satisfaction}
            options={SATISFACTION_OPTIONS}
            onChange={(v) => update('satisfaction', v)}
          />
          <RadioGroup
            label="진단 결과가 도움이 되었나요?"
            required
            name="usefulness"
            value={feedback.usefulness}
            options={USEFULNESS_OPTIONS}
            onChange={(v) => update('usefulness', v)}
          />
          <RadioGroup
            label="서비스 사용이 쉬웠나요?"
            required
            name="easyToUse"
            value={feedback.easyToUse}
            options={EASY_OPTIONS}
            onChange={(v) => update('easyToUse', v)}
          />
          <RadioGroup
            label="주변에 추천할 의향이 있나요?"
            required
            name="recommend"
            value={feedback.recommend}
            options={RECOMMEND_OPTIONS}
            onChange={(v) => update('recommend', v)}
          />
          <RadioGroup
            label="정식 출시 후 유료화된다면 사용할 의향이 있나요?"
            required
            name="paidIntent"
            value={feedback.paidIntent}
            options={PAID_INTENT_OPTIONS}
            onChange={(v) => update('paidIntent', v)}
          />

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">
              개선되었으면 하는 점
              <span className="ml-1 text-red-600" aria-hidden="true">
                *
              </span>
            </span>
            <textarea
              value={feedback.improvement}
              onChange={(e) => update('improvement', e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900/10 focus:border-slate-300 focus:bg-white focus:ring-4"
              placeholder="불편했던 점, 부족했던 기능 등을 자유롭게 적어주세요."
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">
              가장 좋았던 기능 (선택)
            </span>
            <textarea
              value={feedback.bestFeature}
              onChange={(e) => update('bestFeature', e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900/10 focus:border-slate-300 focus:bg-white focus:ring-4"
              placeholder="예: 진단 문항 구성, 리포트, 자기소개서 첨삭 등"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">
              추가로 원하는 서비스 (선택)
            </span>
            <textarea
              value={feedback.desiredService}
              onChange={(e) => update('desiredService', e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900/10 focus:border-slate-300 focus:bg-white focus:ring-4"
            />
          </label>
        </div>

        {submitError ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {submitError}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? '저장 중...' : '후기 제출하기'}
          </button>
        </div>
      </section>
    </div>
  )
}
