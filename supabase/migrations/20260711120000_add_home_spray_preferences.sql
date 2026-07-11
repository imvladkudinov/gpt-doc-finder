create table if not exists public.home_spray_preferences (
  home_id uuid primary key references public.homes (id) on delete cascade,
  enabled boolean not null default false,
  interval_days smallint not null default 7 check (interval_days in (2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14)),
  last_sprayed_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.home_spray_preferences enable row level security;

drop policy if exists home_spray_preferences_select_for_members on public.home_spray_preferences;
create policy home_spray_preferences_select_for_members
on public.home_spray_preferences for select
using (
  exists (
    select 1
    from home_members hm
    where hm.home_id = home_spray_preferences.home_id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists home_spray_preferences_insert_for_members on public.home_spray_preferences;
create policy home_spray_preferences_insert_for_members
on public.home_spray_preferences for insert
with check (
  exists (
    select 1
    from home_members hm
    where hm.home_id = home_spray_preferences.home_id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists home_spray_preferences_update_for_members on public.home_spray_preferences;
create policy home_spray_preferences_update_for_members
on public.home_spray_preferences for update
using (
  exists (
    select 1
    from home_members hm
    where hm.home_id = home_spray_preferences.home_id
      and hm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from home_members hm
    where hm.home_id = home_spray_preferences.home_id
      and hm.user_id = auth.uid()
  )
);

create index if not exists idx_home_spray_preferences_home on public.home_spray_preferences (home_id);

alter table public.notification_dispatch_log
  drop constraint if exists notification_dispatch_log_kind_check;
alter table public.notification_dispatch_log
  add constraint notification_dispatch_log_kind_check
  check (kind in ('watering_due', 'replant_due', 'replant_week_before', 'spray_due'));
