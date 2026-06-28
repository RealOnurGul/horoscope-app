export type ZodiacSign = {
  id: string;
  name: string;
  symbol: string;
  dates: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  horoscope: string;
};

export const zodiacSigns: ZodiacSign[] = [
  {
    id: 'aries',
    name: 'Aries',
    symbol: '♈',
    dates: 'Mar 21 – Apr 19',
    element: 'Fire',
    horoscope: 'A direct conversation clears the way forward. Trust your momentum, but leave room to listen.',
  },
  {
    id: 'taurus',
    name: 'Taurus',
    symbol: '♉',
    dates: 'Apr 20 – May 20',
    element: 'Earth',
    horoscope: 'A steady pace brings the best result today. Focus on one practical task that makes life feel lighter.',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    symbol: '♊',
    dates: 'May 21 – Jun 20',
    element: 'Air',
    horoscope: 'Curiosity leads to a useful connection. Follow the question that keeps returning to your mind.',
  },
  {
    id: 'cancer',
    name: 'Cancer',
    symbol: '♋',
    dates: 'Jun 21 – Jul 22',
    element: 'Water',
    horoscope: 'Protect your energy without closing yourself off. A familiar place or person offers perspective.',
  },
  {
    id: 'leo',
    name: 'Leo',
    symbol: '♌',
    dates: 'Jul 23 – Aug 22',
    element: 'Fire',
    horoscope: 'Your warmth is noticed. Share an idea you have been holding back and let others help shape it.',
  },
  {
    id: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    dates: 'Aug 23 – Sep 22',
    element: 'Earth',
    horoscope: 'Small improvements add up quickly today. Choose progress over perfection and finish what matters.',
  },
  {
    id: 'libra',
    name: 'Libra',
    symbol: '♎',
    dates: 'Sep 23 – Oct 22',
    element: 'Air',
    horoscope: 'Balance comes from making a clear choice, not delaying one. Let your values guide the decision.',
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    symbol: '♏',
    dates: 'Oct 23 – Nov 21',
    element: 'Water',
    horoscope: 'Look beneath the obvious answer. Your instincts are sharp, especially around a changing priority.',
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    symbol: '♐',
    dates: 'Nov 22 – Dec 21',
    element: 'Fire',
    horoscope: 'A change of scenery refreshes your thinking. Make space for something spontaneous but meaningful.',
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    symbol: '♑',
    dates: 'Dec 22 – Jan 19',
    element: 'Earth',
    horoscope: 'Your discipline pays off, but rest is part of the plan. Set one boundary that protects your time.',
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    symbol: '♒',
    dates: 'Jan 20 – Feb 18',
    element: 'Air',
    horoscope: 'An unusual approach solves a familiar problem. Share your perspective with someone you trust.',
  },
  {
    id: 'pisces',
    name: 'Pisces',
    symbol: '♓',
    dates: 'Feb 19 – Mar 20',
    element: 'Water',
    horoscope: 'Pay attention to subtle signals today. Quiet creative time helps turn a feeling into a clear idea.',
  },
];
