create extension if not exists pgcrypto;

create table public.problems (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  statement text not null,
  input_description text not null,
  output_description text not null,
  constraints_text text not null,
  algorithm_tags text[] not null default '{}',
  thinking_step_tags text[] not null default '{}',
  failure_pattern_tags text[] not null default '{}',
  explanation text not null,
  answer_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.test_cases (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  input text not null,
  expected_output text not null,
  is_public boolean not null default false,
  case_type text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.hints (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  level integer not null check (level > 0),
  content text not null,
  created_at timestamptz not null default now(),
  unique (problem_id, level)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  code text not null,
  result text not null check (result in ('accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error')),
  failed_case_type text,
  elapsed_ms integer not null default 0 check (elapsed_ms >= 0),
  created_at timestamptz not null default now()
);

create table public.hint_usages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  hint_id uuid not null references public.hints(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, hint_id)
);

create table public.give_up_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  viewed_hint_level integer not null default 0 check (viewed_hint_level >= 0),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  failed_case_type text,
  created_at timestamptz not null default now()
);

create table public.thinking_step_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  give_up_event_id uuid references public.give_up_events(id) on delete set null,
  weak_step text not null,
  confidence numeric(4, 3) not null check (confidence >= 0 and confidence <= 1),
  evidence jsonb not null default '[]'::jsonb,
  explanation text not null,
  created_at timestamptz not null default now()
);

create table public.review_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, problem_id)
);

create index test_cases_problem_id_idx on public.test_cases(problem_id);
create index hints_problem_id_idx on public.hints(problem_id);
create index submissions_user_problem_idx on public.submissions(user_id, problem_id);
create index hint_usages_user_problem_idx on public.hint_usages(user_id, problem_id);
create index give_up_events_user_problem_idx on public.give_up_events(user_id, problem_id);
create index thinking_step_analyses_user_problem_idx on public.thinking_step_analyses(user_id, problem_id);
create index review_notes_user_problem_idx on public.review_notes(user_id, problem_id);

alter table public.problems enable row level security;
alter table public.test_cases enable row level security;
alter table public.hints enable row level security;
alter table public.submissions enable row level security;
alter table public.hint_usages enable row level security;
alter table public.give_up_events enable row level security;
alter table public.thinking_step_analyses enable row level security;
alter table public.review_notes enable row level security;

create policy "public can read problems"
  on public.problems
  for select
  to anon, authenticated
  using (true);

create policy "public can read public test cases"
  on public.test_cases
  for select
  to anon, authenticated
  using (is_public);

create policy "authenticated can read hints"
  on public.hints
  for select
  to authenticated
  using (true);

create policy "users can read own submissions"
  on public.submissions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own submissions"
  on public.submissions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can update own submissions"
  on public.submissions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own submissions"
  on public.submissions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can read own hint_usages"
  on public.hint_usages
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own hint_usages"
  on public.hint_usages
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can update own hint_usages"
  on public.hint_usages
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own hint_usages"
  on public.hint_usages
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can read own give_up_events"
  on public.give_up_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own give_up_events"
  on public.give_up_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can update own give_up_events"
  on public.give_up_events
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own give_up_events"
  on public.give_up_events
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can read own thinking_step_analyses"
  on public.thinking_step_analyses
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own thinking_step_analyses"
  on public.thinking_step_analyses
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can update own thinking_step_analyses"
  on public.thinking_step_analyses
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own thinking_step_analyses"
  on public.thinking_step_analyses
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can read own review_notes"
  on public.review_notes
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own review_notes"
  on public.review_notes
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can update own review_notes"
  on public.review_notes
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own review_notes"
  on public.review_notes
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated, service_role;
grant select on public.problems to anon, authenticated;
grant select on public.test_cases to anon, authenticated;
grant select on public.hints to authenticated;
grant select, insert, update, delete on public.submissions to authenticated;
grant select, insert, update, delete on public.hint_usages to authenticated;
grant select, insert, update, delete on public.give_up_events to authenticated;
grant select, insert, update, delete on public.thinking_step_analyses to authenticated;
grant select, insert, update, delete on public.review_notes to authenticated;
grant all on all tables in schema public to service_role;
