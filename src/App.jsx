import { useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header.jsx'
import { DiagnosisPage } from './components/DiagnosisPage.jsx'
import { CoverLetterPage } from './components/CoverLetterPage.jsx'
import { BasicReportPage } from './components/BasicReportPage.jsx'
import { FeedbackSurveyPage } from './components/FeedbackSurveyPage.jsx'

const emptyProfile = {
  name: '',
  phone: '',
  email: '',
  ageGroup: '',
  status: '',
  education: '',
  school: '',
  major: '',
  gpa: '',
  certificates: '',
  languageScores: '',
  targetJob: '',
  targetCompanyType: '',
  region: '',
  referral: '',
  privacyConsent: false,
  marketingConsent: false,
}

const emptyFeedback = {
  satisfaction: '',
  usefulness: '',
  easyToUse: '',
  recommend: '',
  paidIntent: '',
  bestFeature: '',
  improvement: '',
  desiredService: '',
}

const TABS = /** @type {const} */ ({
  diagnosis: 'diagnosis',
  coverLetter: 'coverLetter',
  basicReport: 'basicReport',
  feedback: 'feedback',
})

const COVER_LETTER_REVIEW_STORAGE_KEY = 'careerDiagnosisCoverLetterReview'

function readStoredCoverLetterReview() {
  try {
    if (typeof sessionStorage === 'undefined') return null
    const raw = sessionStorage.getItem(COVER_LETTER_REVIEW_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function App() {
  const [activeTab, setActiveTab] = useState(TABS.diagnosis)
  const [profile, setProfile] = useState(emptyProfile)
  const [profileReady, setProfileReady] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState(null)
  const [sessionQuestions, setSessionQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [coverLetterReview, setCoverLetterReview] = useState(
    readStoredCoverLetterReview,
  )
  const [feedback, setFeedback] = useState(emptyFeedback)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  useEffect(() => {
    try {
      if (typeof sessionStorage === 'undefined') return
      if (coverLetterReview == null) {
        sessionStorage.removeItem(COVER_LETTER_REVIEW_STORAGE_KEY)
      } else {
        sessionStorage.setItem(
          COVER_LETTER_REVIEW_STORAGE_KEY,
          JSON.stringify(coverLetterReview),
        )
      }
    } catch {
      // quota / private mode
    }
  }, [coverLetterReview])

  const switchTab = (tabId) => {
    setActiveTab(tabId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const tabs = useMemo(
    () => [
      { id: TABS.diagnosis, label: '커리어 진단' },
      { id: TABS.coverLetter, label: '자기소개서 첨삭' },
      { id: TABS.basicReport, label: '베이직 리포트' },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Header tabs={tabs} activeTab={activeTab} onChangeTab={switchTab} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {activeTab === TABS.diagnosis && (
          <DiagnosisPage
            profile={profile}
            setProfile={setProfile}
            profileReady={profileReady}
            setProfileReady={setProfileReady}
            sessionQuestions={sessionQuestions}
            setSessionQuestions={setSessionQuestions}
            answers={answers}
            setAnswers={setAnswers}
            diagnosisResult={diagnosisResult}
            setDiagnosisResult={setDiagnosisResult}
            switchTab={switchTab}
          />
        )}
        {activeTab === TABS.coverLetter && (
          <CoverLetterPage
            profile={profile}
            diagnosisResult={diagnosisResult}
            coverLetterReview={coverLetterReview}
            setCoverLetterReview={setCoverLetterReview}
          />
        )}
        {activeTab === TABS.basicReport && (
          <BasicReportPage
            profile={profile}
            diagnosisResult={diagnosisResult}
            switchTab={switchTab}
            feedbackSubmitted={feedbackSubmitted}
          />
        )}
        {activeTab === TABS.feedback && (
          <FeedbackSurveyPage
            profile={profile}
            sessionQuestions={sessionQuestions}
            answers={answers}
            diagnosisResult={diagnosisResult}
            coverLetterReview={coverLetterReview}
            feedback={feedback}
            setFeedback={setFeedback}
            onSubmitted={() => setFeedbackSubmitted(true)}
            switchTab={switchTab}
          />
        )}
      </main>
    </div>
  )
}

export default App
