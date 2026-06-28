with signs(id, display_name) as (
  values
    ('aries', 'Aries'), ('taurus', 'Taurus'), ('gemini', 'Gemini'),
    ('cancer', 'Cancer'), ('leo', 'Leo'), ('virgo', 'Virgo'),
    ('libra', 'Libra'), ('scorpio', 'Scorpio'), ('sagittarius', 'Sagittarius'),
    ('capricorn', 'Capricorn'), ('aquarius', 'Aquarius'), ('pisces', 'Pisces')
), slots(slot, available_hour, kicker, title, message_template, reflection) as (
  values
    (
      'morning', 0, 'MORNING NOTE', 'Begin with intention',
      'Today gives %s room to move with purpose. Choose one intention that feels honest and let it shape the pace of your morning.',
      'Notice what deserves your energy before the outside world begins asking for it.'
    ),
    (
      'afternoon', 12, 'MIDDAY PERSPECTIVE', 'Return to what matters',
      'The middle of the day offers %s a useful reset. Protect the priority that still feels true, even if the pace around you changes.',
      'Pause before reacting. The strongest next move may be quieter and more precise than the first one available.'
    ),
    (
      'evening', 18, 'EVENING REFLECTION', 'Let the day settle',
      '%s does not need to solve tomorrow tonight. Keep the lesson, release the tension, and make room for rest.',
      'Ask what restored your energy today—and what quietly took too much of it.'
    )
)
insert into public.daily_messages (
  publish_date,
  zodiac_sign,
  slot,
  kicker,
  title,
  message,
  reflection,
  available_hour
)
select
  current_date,
  signs.id,
  slots.slot,
  slots.kicker,
  slots.title,
  format(slots.message_template, signs.display_name),
  slots.reflection,
  slots.available_hour
from signs
cross join slots
on conflict (publish_date, zodiac_sign, slot) do update set
  kicker = excluded.kicker,
  title = excluded.title,
  message = excluded.message,
  reflection = excluded.reflection,
  available_hour = excluded.available_hour,
  published_at = now();
