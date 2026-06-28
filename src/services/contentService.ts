import AsyncStorage from '@react-native-async-storage/async-storage';

import { DailyReading, DailyReadingBundle } from '../data/readings';
import { ZodiacSign } from '../data/horoscopes';

const CACHE_PREFIX = '@horoscope/readings-v1';
const REQUEST_TIMEOUT_MS = 8000;
const VALID_SLOTS = ['morning', 'afternoon', 'evening'] as const;

type RemoteReadingRow = {
  available_hour: number;
  kicker: string;
  message: string;
  reflection: string;
  slot: string;
  title: string;
};

export async function loadDailyReadingBundle(
  sign: ZodiacSign,
  date: string,
  fallbackReadings: DailyReading[],
): Promise<DailyReadingBundle> {
  const remoteConfig = getRemoteConfig();

  if (remoteConfig) {
    try {
      const readings = await fetchRemoteReadings(remoteConfig, sign.id, date);
      const bundle: DailyReadingBundle = { date, readings, signId: sign.id, source: 'remote' };
      await writeCache(bundle);
      return bundle;
    } catch (error) {
      console.warn('Fresh readings are unavailable. Using offline content.', error);
    }
  }

  const cachedBundle = await readCache(sign.id, date);
  if (cachedBundle) {
    return { ...cachedBundle, source: 'cache' };
  }

  return { date, readings: fallbackReadings, signId: sign.id, source: 'fallback' };
}

function getRemoteConfig() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) return null;
  return { publishableKey, url };
}

async function fetchRemoteReadings(
  config: { publishableKey: string; url: string },
  signId: string,
  date: string,
): Promise<DailyReading[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const query = new URLSearchParams({
    order: 'available_hour.asc',
    publish_date: `eq.${date}`,
    select: 'slot,kicker,title,message,reflection,available_hour',
    zodiac_sign: `eq.${signId}`,
  });

  try {
    const response = await fetch(`${config.url}/rest/v1/daily_messages?${query.toString()}`, {
      headers: {
        apikey: config.publishableKey,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Reading service returned ${response.status}.`);
    }

    const rows = (await response.json()) as unknown;
    return parseRemoteRows(rows);
  } finally {
    clearTimeout(timeout);
  }
}

function parseRemoteRows(value: unknown): DailyReading[] {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new Error('Reading service did not return all three daily messages.');
  }

  const rows = value as RemoteReadingRow[];
  const readings = rows.map((row) => {
    const isValidSlot = VALID_SLOTS.includes(row.slot as (typeof VALID_SLOTS)[number]);
    const isValidText = [row.kicker, row.title, row.message, row.reflection].every(
      (field) => typeof field === 'string' && field.trim().length > 0,
    );

    if (!isValidSlot || !isValidText || !Number.isInteger(row.available_hour)) {
      throw new Error('Reading service returned malformed content.');
    }

    return {
      availableHour: row.available_hour,
      id: row.slot as DailyReading['id'],
      kicker: row.kicker,
      message: row.message,
      reflection: row.reflection,
      title: row.title,
    };
  });

  if (!VALID_SLOTS.every((slot) => readings.some((reading) => reading.id === slot))) {
    throw new Error('Reading service returned duplicate or missing time slots.');
  }

  return readings;
}

async function readCache(signId: string, date: string): Promise<DailyReadingBundle | null> {
  try {
    const value = await AsyncStorage.getItem(cacheKey(signId, date));
    if (!value) return null;

    const bundle = JSON.parse(value) as DailyReadingBundle;
    const readings = parseRemoteRows(
      bundle.readings.map((reading) => ({
        available_hour: reading.availableHour,
        kicker: reading.kicker,
        message: reading.message,
        reflection: reading.reflection,
        slot: reading.id,
        title: reading.title,
      })),
    );

    return { date, readings, signId, source: 'cache' };
  } catch (error) {
    console.warn('Cached readings could not be loaded.', error);
    return null;
  }
}

async function writeCache(bundle: DailyReadingBundle) {
  try {
    await AsyncStorage.setItem(cacheKey(bundle.signId, bundle.date), JSON.stringify(bundle));
  } catch (error) {
    console.warn('Readings could not be cached for offline use.', error);
  }
}

function cacheKey(signId: string, date: string) {
  return `${CACHE_PREFIX}/${date}/${signId}`;
}
