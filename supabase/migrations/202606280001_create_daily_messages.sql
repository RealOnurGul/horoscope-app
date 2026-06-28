create extension if not exists pgcrypto;

create table if not exists public.daily_messages (
  id uuid primary key default gen_random_uuid(),
  publish_date date not null,
  zodiac_sign text not null check (
    zodiac_sign in (
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    )
  ),
  slot text not null check (slot in ('morning', 'afternoon', 'evening')),
  kicker text not null check (char_length(kicker) between 1 and 80),
  title text not null check (char_length(title) between 1 and 120),
  message text not null check (char_length(message) between 1 and 1000),
  reflection text not null check (char_length(reflection) between 1 and 1000),
  available_hour smallint not null check (available_hour between 0 and 23),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (publish_date, zodiac_sign, slot)
);

create index if not exists daily_messages_lookup_idx
  on public.daily_messages (publish_date, zodiac_sign, available_hour);

alter table public.daily_messages enable row level security;

revoke all on table public.daily_messages from anon, authenticated;
grant select on table public.daily_messages to anon, authenticated;

drop policy if exists "Published daily messages are publicly readable" on public.daily_messages;
create policy "Published daily messages are publicly readable"
  on public.daily_messages
  for select
  to anon, authenticated
  using (published_at <= now());

comment on table public.daily_messages is
  'Editorial horoscope messages. Clients have read-only access to published rows.';
