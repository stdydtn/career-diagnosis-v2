# MVP 테스트 데이터 분석 가이드

## 핵심 확인 항목

1. 전체 만족도
2. 진단 결과 도움 정도
3. 서비스 사용 난이도
4. 추천 의향
5. 유료화 사용 의향
6. 가장 좋았던 기능
7. 개선 요구사항
8. 추가로 원하는 서비스

## 유료화 가능성 판단 기준

- “유료라도 사용 의향 있음”
- “가격에 따라 사용 의향 있음”

위 응답 비율이 높으면 유료화 가능성이 있는 것으로 판단한다.

## 기능 개선 우선순위

1. 사용자가 어렵다고 느낀 화면
2. 문항이 중복되거나 이해하기 어렵다는 의견
3. 리포트가 본인과 맞지 않는다는 의견
4. AI 첨삭이 일반적이라는 의견
5. PDF 저장, 데이터 저장 등 기능 오류

## Supabase에서 우선 볼 컬럼

- feedback
- paid_intent
- recommended_jobs
- top_interest
- top_values
- top_work_style
- top_competency
- stage_label
- ai_report
- ai_cover_letter_review
