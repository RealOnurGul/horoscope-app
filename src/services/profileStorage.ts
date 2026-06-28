import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { AppProfile } from '../types/profile';

const SECURE_PROFILE_KEY = 'horoscope.profile.v2';
const LEGACY_PROFILE_KEY = '@horoscope/profile-v2';
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function loadProfile(): Promise<AppProfile | null> {
  const secureValue = await SecureStore.getItemAsync(SECURE_PROFILE_KEY, secureStoreOptions);
  if (secureValue) return parseProfile(secureValue);

  // Migrate profiles created before encrypted device storage was introduced.
  const legacyValue = await AsyncStorage.getItem(LEGACY_PROFILE_KEY);
  if (!legacyValue) return null;

  const profile = parseProfile(legacyValue);
  await saveProfile(profile);
  await AsyncStorage.removeItem(LEGACY_PROFILE_KEY);
  return profile;
}

export async function saveProfile(profile: AppProfile): Promise<void> {
  await SecureStore.setItemAsync(SECURE_PROFILE_KEY, JSON.stringify(profile), secureStoreOptions);
}

export async function deleteProfile(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(SECURE_PROFILE_KEY, secureStoreOptions),
    AsyncStorage.removeItem(LEGACY_PROFILE_KEY),
  ]);
}

function parseProfile(value: string): AppProfile {
  const profile = JSON.parse(value) as Partial<AppProfile>;

  if (
    typeof profile.birthDate !== 'string' ||
    typeof profile.createdAt !== 'string' ||
    typeof profile.zodiacSignId !== 'string'
  ) {
    throw new Error('The saved profile is invalid.');
  }

  return profile as AppProfile;
}
