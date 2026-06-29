export type BirthTimeWindow = 'Dawn' | 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export type AppProfile = {
  birthDate: string;
  birthPlace: string | null;
  birthTime?: string | null;
  birthTimeWindow: BirthTimeWindow | null;
  createdAt: string;
  zodiacSignId: string;
};
