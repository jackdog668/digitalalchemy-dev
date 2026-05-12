-- Persist Google Calendar "open in browser" link from events.insert (htmlLink)
-- so Telegram reminders and new-booking alerts can deep-link the event.

alter table public.scheduling_bookings
  add column if not exists google_calendar_html_link text;

comment on column public.scheduling_bookings.google_calendar_html_link is
  'Google Calendar event URL (htmlLink from Calendar API) for admin deep links';
