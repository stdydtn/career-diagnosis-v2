# MVP 테스트 운영 체크리스트

## 테스트 전 확인

- Vercel 배포 URL 접속 가능 여부
- Supabase 저장 여부
- AI 리포트 생성 여부
- AI 자기소개서 첨삭 작동 여부
- PDF 저장 여부
- 후기조사 제출 여부
- 개인정보 처리방침 페이지 표시 여부
- 서비스 이용 안내 페이지 표시 여부

## 테스트 사용자에게 요청할 과업

1. 기본정보 입력
2. 50문항 진단 완료
3. 베이직 리포트 확인
4. AI 리포트 생성
5. 자기소개서 첨삭 기능 테스트
6. AI 자기소개서 첨삭 테스트
7. PDF 저장
8. 후기조사 제출

## 테스트 후 확인할 데이터

- feedback.satisfaction
- feedback.usefulness
- feedback.easyToUse
- feedback.recommend
- feedback.paidIntent
- feedback.improvement
- feedback.desiredService
- ai_report
- ai_cover_letter_review
- paid_intent
