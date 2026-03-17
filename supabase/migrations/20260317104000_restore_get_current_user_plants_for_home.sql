create or replace function get_current_user_plants_for_home(
  target_home_id uuid default null,
  default_home_name text default 'My home'
)
returns table (
  id uuid,
  name text,
  avatar text,
  watering_interval integer,
  last_watered timestamptz,
  replanting_interval integer,
  last_replanted timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  resolved_home_id uuid;
begin
  if current_user_id is null then
    return;
  end if;

  if target_home_id is not null and exists (
    select 1
    from home_members hm
    where hm.home_id = target_home_id
      and hm.user_id = current_user_id
  ) then
    resolved_home_id := target_home_id;
  else
    resolved_home_id := ensure_current_user_home(default_home_name);
  end if;

  return query
  select
    p.id,
    p.name,
    coalesce(p.avatar, '') as avatar,
    p.watering_interval,
    p.last_watered,
    p.replanting_interval,
    p.last_replanted
  from plants p
  where p.home_id = resolved_home_id
  order by p.name asc;
end;
$$;

grant execute on function get_current_user_plants_for_home(uuid, text) to authenticated;
