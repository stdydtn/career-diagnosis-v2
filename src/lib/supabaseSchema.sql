-- Supabase 테이블 및 RLS 정책 (MVP 후기조사 + 진단 데이터 저장)
-- SQL Editor에서 실행하세요.

-- ---------------------------------------------------------------------------
-- 운영/스테이징 배포 전 필수: 아래 ALTER 구문을 SQL Editor에서 실행하세요.
-- 컬럼이 없는 상태에서 프론트가 새 필드를 insert 하면 PostgREST 오류로
-- 저장이 실패할 수 있습니다. (ai_report / 분석용 컬럼 모두 해당)
-- ---------------------------------------------------------------------------

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

-- MVP 테스트 데이터 분석용 컬럼 (정규화된 요약값 — 상세는 jsonb 컬럼에도 보관됨)
alter table public.diagnosis_submissions
add column if not exists completed_at timestamptz,
add column if not exists total_answer_count integer,
add column if not exists recommended_jobs jsonb,
add column if not exists top_interest jsonb,
add column if not exists top_values jsonb,
add column if not exists top_work_style jsonb,
add column if not exists top_competency jsonb,
add column if not exists stage_label text,
add column if not exists paid_intent text;

-- 컬럼 추가 후 Table Editor에는 보이는데 API 저장이 "column does not exist"로 실패하면
-- PostgREST 스키마 캐시가 갱신되지 않은 경우입니다. SQL Editor에서 한 번 실행하세요.
-- notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- 분석 컬럼 자동 채움 (권장): INSERT/UPDATE 시 diagnosis_result·feedback·session_questions
-- JSON에서 total_answer_count, recommended_jobs, top_*, stage_label, paid_intent를 채웁니다.
-- (클라이언트 누락·캐시 문제와 무관하게 DB에서 보정)
-- SQL Editor에서 한 번 실행하세요.
-- ---------------------------------------------------------------------------

create or replace function public.fill_diagnosis_submission_analysis()
returns trigger
language plpgsql
as $$
declare
  dr jsonb := new.diagnosis_result;
  fb jsonb := new.feedback;
  sqcnt int;
  anscnt int;
begin
  if new.session_questions is not null and jsonb_typeof(new.session_questions) = 'array' then
    select count(*)::int into sqcnt from jsonb_array_elements(new.session_questions);
    if sqcnt > 0 then
      new.total_answer_count := sqcnt;
    end if;
  end if;

  if (new.total_answer_count is null or new.total_answer_count = 0)
     and new.answers is not null and jsonb_typeof(new.answers) = 'object' then
    select count(*)::int into anscnt from jsonb_object_keys(new.answers);
    new.total_answer_count := anscnt;
  end if;

  if dr is not null then
    new.recommended_jobs := coalesce(dr->'recommendedJobs', '[]'::jsonb);
    new.top_interest := coalesce(dr->'top'->'interest', '[]'::jsonb);
    new.top_values := coalesce(dr->'top'->'values', '[]'::jsonb);
    new.top_work_style := coalesce(dr->'top'->'workStyle', '[]'::jsonb);
    new.top_competency := coalesce(dr->'top'->'competency', '[]'::jsonb);
    new.stage_label := coalesce(nullif(trim(coalesce(new.stage_label, '')), ''), dr->'stage'->>'label');
  end if;

  if fb is not null then
    new.paid_intent := coalesce(nullif(trim(coalesce(new.paid_intent, '')), ''), fb->>'paidIntent');
  end if;

  return new;
end;
$$;

drop trigger if exists trg_fill_diagnosis_analysis on public.diagnosis_submissions;

create trigger trg_fill_diagnosis_analysis
  before insert or update on public.diagnosis_submissions
  for each row
  execute procedure public.fill_diagnosis_submission_analysis();
