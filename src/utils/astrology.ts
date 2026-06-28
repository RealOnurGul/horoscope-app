import { zodiacSigns } from '../data/horoscopes';

export function parseBirthDate(month: string, day: string, year: string): Date | null {
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  const yearNumber = Number(year);

  if (!Number.isInteger(monthNumber) || !Number.isInteger(dayNumber) || !Number.isInteger(yearNumber)) {
    return null;
  }

  const date = new Date(yearNumber, monthNumber - 1, dayNumber);
  const today = new Date();
  const isExactDate =
    date.getFullYear() === yearNumber &&
    date.getMonth() === monthNumber - 1 &&
    date.getDate() === dayNumber;

  if (!isExactDate || yearNumber < 1900 || date > today) {
    return null;
  }

  return date;
}

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getZodiacSign(month: number, day: number) {
  const boundary = month * 100 + day;
  const signId =
    boundary >= 321 && boundary <= 419
      ? 'aries'
      : boundary >= 420 && boundary <= 520
        ? 'taurus'
        : boundary >= 521 && boundary <= 620
          ? 'gemini'
          : boundary >= 621 && boundary <= 722
            ? 'cancer'
            : boundary >= 723 && boundary <= 822
              ? 'leo'
              : boundary >= 823 && boundary <= 922
                ? 'virgo'
                : boundary >= 923 && boundary <= 1022
                  ? 'libra'
                  : boundary >= 1023 && boundary <= 1121
                    ? 'scorpio'
                    : boundary >= 1122 && boundary <= 1221
                      ? 'sagittarius'
                      : boundary >= 1222 || boundary <= 119
                        ? 'capricorn'
                        : boundary <= 218
                          ? 'aquarius'
                          : 'pisces';

  return zodiacSigns.find((sign) => sign.id === signId) ?? zodiacSigns[0];
}
