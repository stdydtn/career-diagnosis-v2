/**
 * @param {{ switchTab: (id: string) => void }} props
 */
export function Footer({ switchTab }) {
  return (
    <footer className="border-t border-slate-200 bg-white text-sm text-slate-500">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="max-w-3xl leading-6">
          본 서비스는 MVP 테스트 버전이며, 진단 및 AI 결과는 진로·취업 준비를 돕기 위한
          참고자료입니다.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={() => switchTab('privacy')}
            className="text-left font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
          >
            개인정보 처리방침
          </button>
          <button
            type="button"
            onClick={() => switchTab('terms')}
            className="text-left font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
          >
            서비스 이용 안내
          </button>
          <button
            type="button"
            onClick={() => switchTab('diagnosis')}
            className="text-left font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
          >
            커리어 진단으로 돌아가기
          </button>
        </div>
      </div>
    </footer>
  )
}
