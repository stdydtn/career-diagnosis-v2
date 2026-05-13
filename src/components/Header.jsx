import { SERVICE_NAME } from '../constants/labels.js'

export function Header({ tabs, activeTab, onChangeTab }) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-slate-500">MVP</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {SERVICE_NAME}
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            직업상담 기반 7개 영역 진단 · AI 리포트 · 자기소개서 첨삭
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={[
                  'rounded-2xl px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>

        <p className="text-xs leading-5 text-slate-500">
          본 서비스는 MVP 테스트 버전이며, 진단 및 AI 결과는 참고용입니다.
        </p>
      </div>
    </header>
  )
}

