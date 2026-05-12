import { CheckboxField, InputField, SelectField } from './FormFields.jsx'

const ageGroupOptions = [
  { value: '10s', label: '10대' },
  { value: '20s', label: '20대' },
  { value: '30s', label: '30대' },
  { value: '40s', label: '40대' },
  { value: '50s+', label: '50대 이상' },
]

const statusOptions = [
  { value: 'employed', label: '재직' },
  { value: 'jobSeeking', label: '구직' },
  { value: 'student', label: '학생' },
  { value: 'careerBreak', label: '경력단절/휴식' },
  { value: 'other', label: '기타' },
]

export function ProfileForm({ profile, setProfile, onStart }) {
  const requiredOk =
    profile.name.trim() &&
    profile.email.trim() &&
    profile.ageGroup &&
    profile.status &&
    profile.privacyConsent === true

  const update = (key) => (value) =>
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }))

  const resetProfile = () =>
    setProfile((prev) => ({
      ...prev,
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
    }))

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-800">진단 전 기본정보</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          필수 항목 입력 및 동의 후 진단 화면으로 이동합니다. (2단계에서는
          저장/연동 없이 화면 흐름만 구현)
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">필수 입력</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="이름 / 닉네임"
            required
            value={profile.name}
            onChange={update('name')}
            placeholder="예: 홍길동"
          />
          <InputField
            label="이메일"
            required
            type="email"
            value={profile.email}
            onChange={update('email')}
            placeholder="예: user@example.com"
          />
          <SelectField
            label="연령대"
            required
            value={profile.ageGroup}
            onChange={update('ageGroup')}
            options={ageGroupOptions}
          />
          <SelectField
            label="현재 상태"
            required
            value={profile.status}
            onChange={update('status')}
            options={statusOptions}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">선택 입력</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="연락처"
            value={profile.phone}
            onChange={update('phone')}
            placeholder="예: 010-1234-5678"
          />
          <InputField
            label="최종학력 / 학년"
            value={profile.education}
            onChange={update('education')}
            placeholder="예: 대학교 4학년"
          />
          <InputField
            label="학교"
            value={profile.school}
            onChange={update('school')}
            placeholder="예: 서울대학교, 부산대학교"
          />
          <InputField
            label="전공 / 계열"
            value={profile.major}
            onChange={update('major')}
            placeholder="예: 컴퓨터공학 / 공학계열"
          />
          <InputField
            label="학점"
            value={profile.gpa}
            onChange={update('gpa')}
            placeholder="예: 3.8/4.5"
          />
          <InputField
            label="자격증"
            value={profile.certificates}
            onChange={update('certificates')}
            placeholder="예: 정보처리기사"
          />
          <InputField
            label="어학성적"
            value={profile.languageScores}
            onChange={update('languageScores')}
            placeholder="예: TOEIC 900"
          />
          <InputField
            label="희망 직무"
            value={profile.targetJob}
            onChange={update('targetJob')}
            placeholder="예: 프론트엔드 개발"
          />
          <InputField
            label="희망 기업유형"
            value={profile.targetCompanyType}
            onChange={update('targetCompanyType')}
            placeholder="예: 스타트업 / 중견 / 대기업"
          />
          <InputField
            label="거주/희망 근무지역"
            value={profile.region}
            onChange={update('region')}
            placeholder="예: 서울 / 경기"
          />
          <InputField
            label="유입 경로"
            value={profile.referral}
            onChange={update('referral')}
            placeholder="예: 지인 추천 / 검색 / 광고"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">동의</h3>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <CheckboxField
            label="개인정보 수집 및 진단 결과 활용에 동의합니다."
            checked={profile.privacyConsent}
            onChange={update('privacyConsent')}
            helper="필수 동의 항목입니다."
          />
          <CheckboxField
            label="마케팅 정보 수신에 동의합니다."
            checked={profile.marketingConsent}
            onChange={update('marketingConsent')}
            helper="선택 동의 항목입니다."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!requiredOk}
          onClick={onStart}
          className={[
            'rounded-2xl px-4 py-2 text-sm font-medium text-white transition',
            requiredOk
              ? 'bg-slate-900 hover:bg-slate-800'
              : 'bg-slate-300',
          ].join(' ')}
        >
          진단 시작하기
        </button>
        <button
          type="button"
          onClick={resetProfile}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          입력 초기화
        </button>
      </div>
    </div>
  )
}

