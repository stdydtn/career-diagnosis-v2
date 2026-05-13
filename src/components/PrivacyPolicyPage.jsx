/**
 * @param {{ switchTab: (id: string) => void }} props
 */
export function PrivacyPolicyPage({ switchTab }) {
  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            개인정보 처리방침
          </h1>
          <p className="mt-3 text-sm leading-6 text-amber-900/90">
            본 문서는 <strong className="font-semibold">MVP 테스트용 초안</strong>입니다. 법적
            효력이나 최종 약관으로 단정할 수 없으며, 정식 출시 전에는 반드시 전문가(변호사
            등) 검토를 거쳐 보완해야 합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => switchTab('diagnosis')}
          className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          커리어 진단으로
        </button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">1. 수집하는 개인정보 항목</h2>
        <p className="mt-3 text-sm font-medium text-slate-800">필수</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
          <li>이름 또는 닉네임</li>
          <li>이메일</li>
          <li>연령대</li>
          <li>현재 상태</li>
          <li>진단 응답값</li>
        </ul>
        <p className="mt-4 text-sm font-medium text-slate-800">선택</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
          <li>연락처</li>
          <li>학교</li>
          <li>전공</li>
          <li>학점</li>
          <li>자격증</li>
          <li>어학성적</li>
          <li>희망 직무</li>
          <li>희망 기업유형</li>
          <li>거주 또는 희망 근무지역</li>
          <li>자기소개서 문항 및 답변</li>
          <li>후기조사 응답</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">2. 개인정보 수집 및 이용 목적</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          수집된 정보는 커리어 진단 결과 제공, 베이직 리포트 생성, AI 리포트 생성, 자기소개서
          첨삭, 서비스 개선, MVP 테스트 분석, 정식 출시 가능성 검토를 위해 활용됩니다.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">3. 개인정보 보관 및 이용 기간</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          MVP 테스트 목적에 맞게 필요한 기간 동안 보관·이용할 수 있습니다. 정확한 보관
          기간·파기 절차는 정식 서비스 오픈 전 정책으로 명확히 정할 예정이며, 본 초안만으로
          구체적 기간을 확정하지 않습니다.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">4. AI 분석 활용 안내</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          이용자가 입력한 진단 응답, 기본정보, 자기소개서 내용은 AI 리포트 및 AI 자기소개서
          첨삭 결과 생성을 위해 외부 AI API 처리 과정에 사용될 수 있습니다.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">5. 개인정보 제3자 제공 여부</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          MVP 단계에서는 AI 처리를 위한 외부 API 이용 등으로 정보가 처리될 수 있습니다.
          별도의 영리 목적 제3자 제공 여부·범위는 정식 출시 전 정책으로 구체화할 예정이며,
          본 초안은 참고용 안내입니다.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">6. 개인정보 삭제 요청</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          개인정보 삭제 또는 테스트 데이터 삭제를 원할 경우 서비스 운영자에게 요청할 수
          있습니다.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">7. 민감정보 입력 주의</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          주민등록번호, 상세 주소, 계좌번호, 건강정보, 가족관계 등 진로·취업 상담에 불필요한
          민감정보는 입력하지 말아주세요.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">8. 문의</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          문의 이메일:{' '}
          <a
            href="mailto:stdydtn@gmail.com"
            className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2"
          >
            stdydtn@gmail.com
          </a>
        </p>
      </section>
    </div>
  )
}
