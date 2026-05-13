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

/**
 * @param {{
 *   profile: object,
 *   setProfile: (fn: object | ((prev: object) => object)) => void,
 *   onStart: () => void,
 *   switchTab?: (id: string) => void,
 * }} props
 */
export function ProfileForm({ profile, setProfile, onStart, switchTab }) {
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
      <div
        className="rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-950 ring-1 ring-indigo-100"
        role="note"
      >
        현재 서비스는 정식 출시 전 MVP 테스트 버전입니다. 진단 문항, 리포트 문장,
        AI 첨삭 결과는 사용자 피드백을 바탕으로 개선될 예정입니다. 테스트 완료 후
        마지막 후기조사까지 작성해주시면 서비스 개선에 큰 도움이 됩니다.
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-slate-900">테스트 진행 순서</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
          <li>기본정보 입력</li>
          <li>50문항 커리어 진단</li>
          <li>베이직 리포트 확인</li>
          <li>AI 리포트 생성</li>
          <li>자기소개서 첨삭</li>
          <li>MVP 후기조사 제출</li>
        </ol>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-800">진단 전 기본정보</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          필수 항목 입력 및 동의 후 진단 화면으로 이동합니다.
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

      <div
        className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950 ring-1 ring-amber-100"
        role="note"
      >
        <p>
          입력하신 정보는 커리어 진단 결과 제공, 자기소개서 첨삭, 서비스 개선 및
          MVP 테스트 분석을 위해 활용될 수 있습니다. 본 서비스는 정식 심리검사
          또는 의학적·임상적 진단을 대체하지 않으며, 진로·취업 준비를 돕기 위한
          참고용 서비스입니다.
        </p>
        <p className="mt-3">
          연락처, 학교, 학점, 자격증, 어학성적 등은 선택 입력 항목이며, 입력하지
          않아도 진단을 진행할 수 있습니다.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">동의</h3>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="space-y-2">
            <CheckboxField
              label="개인정보 수집·이용 및 진단 결과 분석 활용에 동의합니다."
              checked={profile.privacyConsent}
              onChange={update('privacyConsent')}
              helper="필수 동의 항목입니다."
            />
            {typeof switchTab === 'function' ? (
              <button
                type="button"
                onClick={() => switchTab('privacy')}
                className="text-xs font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
              >
                개인정보 처리방침 보기
              </button>
            ) : null}
          </div>
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

