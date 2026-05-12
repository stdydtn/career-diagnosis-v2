import {
  barrierLabels,
  competencyLabels,
  interestLabels,
  valueLabels,
  workStyleLabels,
} from '../constants/labels.js'

function topLabel(entries, labelMap) {
  return entries
    .map(([k]) => {
      if (labelMap?.[k]?.name) return labelMap[k].name
      if (typeof labelMap?.[k] === 'string') return labelMap[k]
      return k
    })
    .slice(0, 3)
}

function sectionObject(title, description, highlights) {
  return { title, description, highlights }
}

export function buildBasicReport(diagnosisResult, profile) {
  const safeResult = diagnosisResult ?? {
    summary: '',
    stage: { label: '탐색 우선형', description: '' },
    top: {
      interest: [],
      values: [],
      workStyle: [],
      competency: [],
      readiness: [],
      barriers: [],
    },
    averages: { readinessAverage: 0 },
    recommendedJobs: [],
  }

  const userName = profile?.name?.trim() || '사용자'
  const interestTop = topLabel(safeResult.top.interest, interestLabels, '활동')
  const valuesTop = topLabel(safeResult.top.values, valueLabels, '조건')
  const workStyleTop = topLabel(safeResult.top.workStyle, workStyleLabels, '스타일')
  const competencyTop = topLabel(safeResult.top.competency, competencyLabels, '역량')
  const readinessTop = topLabel(safeResult.top.readiness, null, '준비영역')
  const barriersTop = topLabel(safeResult.top.barriers, barrierLabels, '지원영역')

  const summary = `${safeResult.summary} ${userName}님이 현재 강점이 보이는 영역을 중심으로, 바로 실행 가능한 준비전략을 함께 정리했습니다.`

  const sections = {
    interest: sectionObject(
      '내가 좋아하는 일의 방식',
      `${interestTop.join(', ')} 관련 활동 선호가 높게 나타났습니다. 사람, 정보, 실행 환경을 함께 다루는 업무에서 강점을 발휘할 가능성이 있습니다.`,
      [
        `${interestTop[0] ?? '핵심'} 활동 선호가 상대적으로 높습니다.`,
        '혼합형 업무(사람+정보, 기획+실행)에서 적합도를 확인해보세요.',
        '관심 직무를 공고 기반으로 구체화하면 선택 속도가 빨라집니다.',
      ],
    ),
    values: sectionObject(
      '내가 중요하게 생각하는 직업 조건',
      `${valuesTop.join(', ')}을(를) 중요하게 보는 경향이 있습니다. 장기적으로 지속 가능한 성장 환경과 일의 만족도를 함께 고려하는 것이 좋습니다.`,
      [
        `${valuesTop[0] ?? '핵심가치'} 우선순위를 먼저 설정해보세요.`,
        '조직 문화/평가 방식/성장 경로를 함께 확인해보세요.',
        '직무 적합도와 가치 적합도를 같이 비교하는 것이 중요합니다.',
      ],
    ),
    workStyle: sectionObject(
      '나의 일하는 스타일',
      `${workStyleTop.join(', ')} 성향이 두드러집니다. 책임감과 협업 밸런스를 살릴 수 있는 역할에서 안정적으로 성과를 만들 가능성이 있습니다.`,
      [
        '협업에서 강점이 드러나는 역할을 우선 탐색해보세요.',
        '업무 방식(문서화/소통 주기/피드백 방식)을 스스로 정의해보세요.',
        '면접에서 “내 일하는 방식” 사례를 2개 이상 준비해두세요.',
      ],
    ),
    competency: sectionObject(
      '내가 잘할 수 있는 업무역량',
      `${competencyTop.join(', ')} 역량이 강점으로 나타났습니다. 경험을 직무 요구역량과 연결해 설명하면 자기소개서/면접 완성도를 높일 수 있습니다.`,
      [
        `${competencyTop[0] ?? '핵심역량'}이 실제 사례로 증명되면 더 강력합니다.`,
        '문제-행동-결과(또는 상황-과제-행동-결과) 구조로 정리해보세요.',
        '정량 지표(성과, 기간, 개선치)를 함께 제시하면 설득력이 높습니다.',
      ],
    ),
    maturity: sectionObject(
      '나의 진로 결정 준비도',
      `현재 단계는 ${safeResult.stage.label}에 가깝습니다. ${safeResult.stage.description}`,
      [
        '관심 직무 1~2개를 우선 고정해 비교해보세요.',
        '직무별 필수역량과 내 경험의 연결도를 점검해보세요.',
        '의사결정을 미루기보다 작은 실행을 통해 검증해보세요.',
      ],
    ),
    readiness: sectionObject(
      '나의 취업 준비 상태',
      `현재 평균 준비도는 ${safeResult.averages.readinessAverage.toFixed(2)}점 수준입니다. ${readinessTop.join(', ')} 관련 준비를 우선 정리하면 지원 실행력이 높아질 수 있습니다.`,
      [
        '채용공고 3개 이상에서 반복 요구역량을 추출해보세요.',
        '이력서/포트폴리오/자기소개서의 메시지를 일관되게 맞춰보세요.',
        '면접 질문 대비를 직무 사례 중심으로 업데이트해보세요.',
      ],
    ),
    barriers: sectionObject(
      '지금 추가로 필요한 지원',
      `${barriersTop.join(', ')} 영역은 우선 정리하면 좋은 부분입니다. 이는 부족하다는 의미가 아니라 다음 단계로 넘어가기 위한 준비 포인트입니다.`,
      [
        '추가 지원 필요 영역을 1~2개만 먼저 선택해 집중하세요.',
        '멘토링/스터디/코칭 등 외부 도움을 활용해 속도를 높이세요.',
        '작은 완료 경험을 쌓아 실행 루틴을 만드는 것이 중요합니다.',
      ],
    ),
  }

  const recommendedJobs = (safeResult.recommendedJobs ?? []).slice(0, 5)
  const actionPlan = [
    '추천 직무 TOP 5 중 가장 관심 있는 직무 1~2개를 선택해보세요.',
    '선택한 직무의 채용공고를 3개 이상 확인하고 반복되는 요구역량을 정리하세요.',
    '본인의 경험을 직무역량, 행동, 결과 순서로 정리하세요.',
    '자기소개서에서는 강점이 드러나는 경험 2~3개를 우선 활용하세요.',
    '부족한 부분은 프로젝트, 자격증, 포트폴리오, 면접 연습 중 하나로 보완하세요.',
  ]

  return {
    title: '나의 커리어 방향 분석 리포트',
    subtitle:
      '직업흥미, 가치관, 업무스타일, 기초역량, 취업 준비 상태를 종합해 정리한 결과입니다.',
    summary,
    sections,
    recommendedJobs,
    actionPlan,
  }
}

export function runReportBuilderTests() {
  const mock = {
    summary: '요약 문장입니다.',
    stage: { label: '방향 설정형', description: '설명' },
    top: {
      interest: [['S', 4.5], ['I', 4.1], ['E', 3.9]],
      values: [['growth', 4.2], ['stability', 3.9], ['balance', 3.8]],
      workStyle: [['conscientiousness', 4.3]],
      competency: [['problemSolving', 4.2]],
      readiness: [['documents', 3.8]],
      barriers: [['infoGap', 3.4]],
    },
    averages: { readinessAverage: 3.7 },
    recommendedJobs: ['데이터분석', 'IT기획', '전략기획', '정책분석', '연구개발', '추가직무'],
  }
  const built = buildBasicReport(mock, { name: '테스터' })
  console.assert(typeof built.title === 'string' && built.title.length > 0, 'title missing')
  console.assert(Object.keys(built.sections).length === 7, 'sections should have 7 areas')
  console.assert(built.actionPlan.length >= 4, 'actionPlan should have >= 4')
  console.assert(built.recommendedJobs.length <= 5, 'recommendedJobs should be <= 5')
}

