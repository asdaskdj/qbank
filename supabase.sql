-- 뷰티풀매스 문제은행: Supabase 스키마
-- Supabase 프로젝트 → SQL Editor 에 붙여넣고 실행하세요.

-- 사용자별 전체 상태를 하나의 JSON으로 저장 (문항·학생·학습지·오답)
create table if not exists user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table user_state enable row level security;

create policy "own state read"  on user_state for select using (auth.uid() = user_id);
create policy "own state write" on user_state for insert with check (auth.uid() = user_id);
create policy "own state update" on user_state for update using (auth.uid() = user_id);

-- 선생님 계정은 Supabase 대시보드 → Authentication → Users 에서 직접 추가하세요.
-- (이 사이트에는 회원가입 화면이 없습니다 — 허락된 선생님만 로그인)
