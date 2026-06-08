-- Notification preferences store a slot label (Morning/Day/Evening), but the
-- column was originally created with a default of '09:00', which is outside
-- that domain. A row created from the default would never match a slot in the
-- dispatcher and silently fell back to Morning. Align the default with the
-- actual label domain and repair any rows still holding an out-of-domain value.

alter table public.notification_preferences
  alter column preferred_time_local set default 'Morning';

update public.notification_preferences
set preferred_time_local = 'Morning'
where preferred_time_local not in ('Morning', 'Day', 'Evening');
