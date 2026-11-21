-- Execute no SQL Editor do projeto Supabase antes de ativar as contas.
create table if not exists public.study_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{"read": [], "history": [], "active": null}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.study_progress enable row level security;

-- Safe to rerun: replace only these named access policies; no progress rows are deleted.
drop policy if exists "Users can read their own progress" on public.study_progress;
create policy "Users can read their own progress"
  on public.study_progress for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own progress" on public.study_progress;
create policy "Users can create their own progress"
  on public.study_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own progress" on public.study_progress;
create policy "Users can update their own progress"
  on public.study_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.study_progress to authenticated;
