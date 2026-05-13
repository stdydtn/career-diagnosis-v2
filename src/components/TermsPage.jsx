/**
 * @param {{ switchTab: (id: string) => void }} props
 */
export function TermsPage({ switchTab }) {
  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">서비스 이용 안내</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            MVP 테스트 운영을 위한 안내이며, 정식 서비스 약관과는 별도로 참고해 주세요.
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
        <h2 className="text-lg font-semibold text-slate-900">1. 서비스 목적</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          본 서비스는 취업준비생, 대학생, 이직 준비자 등이 자신의 진로 방향, 직업 선택 기준,
          업무스타일, 직업기초역량, 취업 준비 상태를 점검할 수 있도록 돕는 MVP 테스트
          서비스입니다.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">2. 진단 결과의 성격</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          진단 결과는 사용자의 응답을 바탕으로 생성되는 참고자료이며, 특정 직업이나 기업에
          대한 적합성을 단정하지 않습니다.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">3. AI 결과의 한계</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          AI 리포트와 AI 자기소개서 첨삭은 입력 내용을 바탕으로 생성되는 보조 자료입니다.
          결과가 항상 정확하거나 개인의 모든 상황을 반영하는 것은 아니므로, 최종 판단과 제출
          전 검토는 이용자 본인이 해야 합니다.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">4. 자기소개서 첨삭 이용 시 주의사항</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          AI 첨삭 결과는 문항 이해도, 직무 연결성, 경험 구체성, 성과 근거 등을 보완하기 위한
          참고자료입니다. 실제 제출 전에는 사실관계, 표현 방식, 기업 및 직무 적합성을 반드시
          직접 확인해주세요.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">5. 금지 입력 정보</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          주민등록번호, 상세 주소, 계좌번호, 건강정보, 가족관계 등 불필요한 민감정보는
          입력하지 말아주세요. 서비스 목적과 무관한 정보는 삭제·거절될 수 있습니다.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">6. 서비스 개선을 위한 데이터 활용</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          익명·통계 형태로 집계되거나, MVP 후기조사 및 저장된 응답을 바탕으로 기능·문항·리포트
          품질을 개선하는 데 활용될 수 있습니다. 세부 범위는 개인정보 처리방침 초안을
          참고해 주세요.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">7. 오류 및 결과 부정확성 안내</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          네트워크 오류, AI API 일시 장애, 브라우저 환경 등으로 일부 기능이 정상 동작하지 않을
          수 있습니다. 진단·리포트·첨삭 결과는 참고용이며, 중요한 결정에는 반드시 별도의
          검증과 상담을 병행해 주세요.
        </p>
      </section>
    </div>
  )
}
