export const SERVICE_NAME = '직업상담 기반 AI 커리어 진단 MVP'

export const DIAGNOSIS_SECTIONS = [
  {
    type: 'interest',
    section: '직업흥미검사',
    displaySection: '내가 좋아하는 일의 방식',
    description: '어떤 직업활동과 일의 방식을 선호하는지 확인합니다.',
  },
  {
    type: 'values',
    section: '직업가치관검사',
    displaySection: '내가 중요하게 생각하는 직업 조건',
    description: '직업을 선택할 때 중요하게 생각하는 기준을 확인합니다.',
  },
  {
    type: 'workStyle',
    section: '성격·업무스타일검사',
    displaySection: '나의 일하는 스타일',
    description: '업무 방식, 협업 태도, 스트레스 대응 방식을 확인합니다.',
  },
  {
    type: 'competency',
    section: '직업기초역량검사',
    displaySection: '내가 잘할 수 있는 업무역량',
    description: '직무 수행에 필요한 기본 역량을 점검합니다.',
  },
  {
    type: 'maturity',
    section: '진로성숙도검사',
    displaySection: '나의 진로 결정 준비도',
    description: '진로 선택과 의사결정을 위한 준비 수준을 확인합니다.',
  },
  {
    type: 'readiness',
    section: '구직준비도검사',
    displaySection: '나의 취업 준비 상태',
    description:
      '실제 지원을 위한 서류, 면접, 경험 정리 수준을 확인합니다.',
  },
  {
    type: 'barriers',
    section: '취업장벽·지원필요도검사',
    displaySection: '지금 추가로 필요한 지원',
    description:
      '취업 준비 과정에서 추가 지원이 필요한 영역을 확인합니다.',
  },
]

export const DIAGNOSIS_DOMAINS = DIAGNOSIS_SECTIONS.map((s) => s.section)

export const interestLabels = {
  R: {
    name: '현실형',
    easyName: '직접 만들고 다루는 일을 선호하는 유형',
    desc: '도구, 장비, 현장, 실물 중심의 활동을 선호합니다.',
  },
  I: {
    name: '탐구형',
    easyName: '분석하고 원인을 찾는 일을 선호하는 유형',
    desc: '자료를 조사하고 원인을 분석하며 문제를 해결하는 활동을 선호합니다.',
  },
  A: {
    name: '예술형',
    easyName: '아이디어를 표현하고 만드는 일을 선호하는 유형',
    desc: '글, 디자인, 콘텐츠, 기획 아이디어처럼 창의적으로 표현하는 활동을 선호합니다.',
  },
  S: {
    name: '사회형',
    easyName: '사람을 돕고 설명하는 일을 선호하는 유형',
    desc: '상담, 교육, 코칭, 설명처럼 사람의 성장과 문제 해결을 돕는 활동을 선호합니다.',
  },
  E: {
    name: '진취형',
    easyName: '목표를 세우고 추진하는 일을 선호하는 유형',
    desc: '설득, 리더십, 성과 창출, 프로젝트 추진 활동을 선호합니다.',
  },
  C: {
    name: '관습형',
    easyName: '정리하고 관리하는 일을 선호하는 유형',
    desc: '문서, 절차, 일정, 데이터처럼 체계적으로 정리하고 관리하는 활동을 선호합니다.',
  },
}

export const valueLabels = {
  stability: '안정성',
  reward: '보상',
  growth: '성장',
  autonomy: '자율성',
  contribution: '사회기여',
  recognition: '인정',
  balance: '워라밸',
}

export const workStyleLabels = {
  extroversion: '외향성',
  conscientiousness: '성실성',
  openness: '개방성',
  agreeableness: '친화성',
  emotionalStability: '정서안정성',
}

export const competencyLabels = {
  communication: '의사소통',
  numeracy: '수리·자료해석',
  problemSolving: '문제해결',
  information: '정보활용',
  relationship: '대인관계',
  selfManagement: '자기관리',
  organization: '조직이해',
  ethics: '직업윤리',
}

export const maturityLabels = {
  selfUnderstanding: '자기이해',
  careerInfo: '직업정보탐색',
  decisionMaking: '의사결정',
  planning: '진로계획',
  action: '준비행동',
}

export const readinessLabels = {
  experience: '경험정리',
  achievement: '성과정리',
  jobMatching: '직무매칭',
  documents: '서류준비',
  interview: '면접준비',
  strategy: '지원전략',
}

export const barrierLabels = {
  infoGap: '정보부족',
  confidence: '자신감 보완',
  experienceGap: '경험보완',
  direction: '방향혼란',
  executionDelay: '실행지연',
  resourceGap: '자원부족',
}

