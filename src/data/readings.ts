import { ZodiacSign } from './horoscopes';

export type DailyReading = {
  id: 'morning' | 'afternoon' | 'evening';
  kicker: string;
  title: string;
  message: string;
  reflection: string;
  availableHour: number;
};

const elementGuidance: Record<ZodiacSign['element'], string> = {
  Fire: 'Put your energy behind one clear intention instead of scattering it across every possibility.',
  Earth: 'A practical choice creates more peace than another round of overthinking.',
  Air: 'A conversation or new perspective can shift the shape of the entire day.',
  Water: 'Notice what your intuition says before the noise of the day gets louder.',
};

export function getDailyReadings(sign: ZodiacSign): DailyReading[] {
  return [
    {
      id: 'morning',
      kicker: 'MORNING NOTE',
      title: 'Begin with intention',
      message: sign.horoscope,
      reflection: `Your ${sign.element.toLowerCase()} nature is asking for a deliberate start. ${elementGuidance[sign.element]}`,
      availableHour: 0,
    },
    {
      id: 'afternoon',
      kicker: 'MIDDAY PERSPECTIVE',
      title: 'Return to what matters',
      message: `The middle of the day brings a useful reset for ${sign.name}. Protect the priority that still feels true, even if the pace around you changes.`,
      reflection: 'Pause before reacting. The strongest next move may be quieter and more precise than the first one available.',
      availableHour: 12,
    },
    {
      id: 'evening',
      kicker: 'EVENING REFLECTION',
      title: 'Let the day settle',
      message: 'You do not need to solve tomorrow tonight. Keep the lesson, release the tension, and make room for rest.',
      reflection: 'Ask yourself what restored your energy today—and what quietly took too much of it.',
      availableHour: 18,
    },
  ];
}
