-- Supabase 테이블 및 RLS 정책 (MVP 후기조사 + 진단 데이터 저장)
-- SQL Editor에서 실행하세요.

create table public.diagnosis_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text,
  email text,
  phone text,
  age_group text,
  status text,
  education text,
  school text,
  major text,
  gpa text,
  certificates text,
  language_scores text,
  target_job text,
  target_company_type text,
  region text,
  referral text,

  privacy_consent boolean not null default false,
  marketing_consent boolean not null default false,

  session_questions jsonb,
  answers jsonb,
  diagnosis_result jsonb,
  feedback jsonb,
  cover_letter_review jsonb
);

alter table public.diagnosis_submissions enable row level security;

create policy "Allow anonymous insert for MVP"
on public.diagnosis_submissions
for insert
to anon
with check (privacy_consent = true);

-- insert 직후 .select('id') 등으로 생성 행을 받으려면 anon에게 SELECT가 필요합니다.
-- (선택) Table Editor는 대시보드 권한으로 RLS를 우회하지만, 프론트에서 id를 받으려면 아래를 실행하세요.
-- create policy "Allow anonymous select for MVP"
-- on public.diagnosis_submissions
-- for select
-- to anon
-- using (true);

-- 기존 테이블에 AI 결과 컬럼 추가 (이미 적용했다면 생략)

alter table public.diagnosis_submissions
add column if not exists ai_report jsonb,
add column if not exists ai_cover_letter_review jsonb;
