create extension if not exists pgcrypto;

create table if not exists homes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists home_members (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references homes(id) on delete cascade,
  user_id uuid not null,
  joined_at timestamptz not null default now(),
  unique(home_id, user_id)
);

create table if not exists profiles (
  id uuid primary key,
  full_name text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_home_members_user on home_members(user_id);
create index if not exists idx_home_members_home on home_members(home_id);

create table if not exists plants (
  id uuid primary key default gen_random_uuid(),
  home_id uuid references homes(id) on delete cascade,
  name text not null,
  avatar text,
  watering_interval integer not null,
  replanting_interval integer not null,
  last_watered timestamptz not null,
  last_replanted timestamptz not null
);

alter table plants add column if not exists home_id uuid references homes(id) on delete cascade;
create index if not exists idx_plants_home on plants(home_id);

alter table homes enable row level security;
alter table home_members enable row level security;
alter table plants enable row level security;
alter table profiles enable row level security;

drop policy if exists homes_select_for_members on homes;
create policy homes_select_for_members
on homes for select
using (
  exists (
    select 1
    from home_members hm
    where hm.home_id = homes.id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists homes_insert_any_authenticated on homes;
create policy homes_insert_any_authenticated
on homes for insert
with check (auth.uid() is not null);

drop policy if exists homes_update_for_members on homes;
create policy homes_update_for_members
on homes for update
using (
  exists (
    select 1
    from home_members hm
    where hm.home_id = homes.id
      and hm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from home_members hm
    where hm.home_id = homes.id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists homes_delete_for_members on homes;
create policy homes_delete_for_members
on homes for delete
using (
  exists (
    select 1
    from home_members hm
    where hm.home_id = homes.id
      and hm.user_id = auth.uid()
  )
);

create or replace function get_user_home_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select home_id from home_members where user_id = auth.uid()
$$;

create or replace function ensure_current_user_home(default_home_name text default 'My home')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_home_id uuid;
  created_home_id uuid;
  safe_home_name text := coalesce(nullif(trim(default_home_name), ''), 'My home');
begin
  if current_user_id is null then
    return null;
  end if;

  select hm.home_id
  into existing_home_id
  from home_members hm
  where hm.user_id = current_user_id
  order by hm.joined_at asc
  limit 1;

  if existing_home_id is not null then
    return existing_home_id;
  end if;

  insert into homes (name)
  values (safe_home_name)
  returning id into created_home_id;

  insert into home_members (home_id, user_id)
  values (created_home_id, current_user_id)
  on conflict (home_id, user_id) do nothing;

  return created_home_id;
end;
$$;

grant execute on function ensure_current_user_home(text) to authenticated;

create or replace function ensure_home_has_creator_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  insert into home_members (home_id, user_id)
  values (new.id, auth.uid())
  on conflict (home_id, user_id) do nothing;

  return new;
end;
$$;

drop function if exists set_home_creator_default();

drop trigger if exists trg_homes_set_creator_default on homes;

drop trigger if exists trg_homes_ensure_creator_membership on homes;
create trigger trg_homes_ensure_creator_membership
after insert on homes
for each row
execute function ensure_home_has_creator_membership();

insert into home_members (home_id, user_id)
select h.id, auth.uid()
from homes h
where auth.uid() is not null
  and not exists (
    select 1
    from home_members hm
    where hm.home_id = h.id
      and hm.user_id = auth.uid()
  )
on conflict (home_id, user_id) do nothing;

create or replace function invite_user_to_home_by_email(target_home_id uuid, target_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_email text := lower(coalesce(trim(target_email), ''));
  target_user_id uuid;
  existing_home_id uuid;
begin
  if current_user_id is null then
    return 'not_authenticated';
  end if;

  if target_home_id is null then
    return 'invalid_home';
  end if;

  if normalized_email = '' then
    return 'invalid_email';
  end if;

  if normalized_email = lower(coalesce(auth.jwt() ->> 'email', '')) then
    return 'self_invite';
  end if;

  if not exists (
    select 1
    from home_members hm
    where hm.home_id = target_home_id
      and hm.user_id = current_user_id
  ) then
    return 'forbidden';
  end if;

  select u.id
  into target_user_id
  from auth.users u
  where lower(u.email) = normalized_email
  order by u.created_at asc
  limit 1;

  if target_user_id is null then
    return 'user_not_found';
  end if;

  select hm.home_id
  into existing_home_id
  from home_members hm
  where hm.home_id = target_home_id
    and hm.user_id = target_user_id
  limit 1;

  if existing_home_id is not null then
    return 'already_member';
  end if;

  insert into home_members (home_id, user_id)
  values (target_home_id, target_user_id)
  on conflict (home_id, user_id) do nothing;

  return 'added';
end;
$$;

grant execute on function invite_user_to_home_by_email(uuid, text) to authenticated;

drop policy if exists members_select_for_home_members on home_members;
create policy members_select_for_home_members
on home_members for select
using (
  home_id in (select get_user_home_ids())
);

drop policy if exists members_insert_for_home_members_or_self on home_members;
create policy members_insert_for_home_members_or_self
on home_members for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from home_members hm
    where hm.home_id = home_members.home_id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists members_delete_self_only on home_members;
create policy members_delete_self_only
on home_members for delete
using (user_id = auth.uid());

drop policy if exists profiles_select_shared_home_or_self on profiles;
create policy profiles_select_shared_home_or_self
on profiles for select
using (
  id = auth.uid()
  or exists (
    select 1
    from home_members me
    join home_members other on other.home_id = me.home_id
    where me.user_id = auth.uid()
      and other.user_id = profiles.id
  )
);

drop policy if exists profiles_upsert_self_only on profiles;
create policy profiles_upsert_self_only
on profiles for insert
with check (id = auth.uid());

drop policy if exists profiles_update_self_only on profiles;
create policy profiles_update_self_only
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists plants_select_for_home_members on plants;
create policy plants_select_for_home_members
on plants for select
using (
  exists (
    select 1
    from home_members hm
    where hm.home_id = plants.home_id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists plants_insert_for_home_members on plants;
create policy plants_insert_for_home_members
on plants for insert
with check (
  exists (
    select 1
    from home_members hm
    where hm.home_id = plants.home_id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists plants_update_for_home_members on plants;
create policy plants_update_for_home_members
on plants for update
using (
  exists (
    select 1
    from home_members hm
    where hm.home_id = plants.home_id
      and hm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from home_members hm
    where hm.home_id = plants.home_id
      and hm.user_id = auth.uid()
  )
);

drop policy if exists plants_delete_for_home_members on plants;
create policy plants_delete_for_home_members
on plants for delete
using (
  exists (
    select 1
    from home_members hm
    where hm.home_id = plants.home_id
      and hm.user_id = auth.uid()
  )
);
