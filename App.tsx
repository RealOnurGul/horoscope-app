import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';

import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AppProfile } from './src/types/profile';

const PROFILE_KEY = '@horoscope/profile-v2';

export default function App() {
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreProfile() {
      try {
        const savedProfile = await AsyncStorage.getItem(PROFILE_KEY);
        setProfile(savedProfile ? (JSON.parse(savedProfile) as AppProfile) : null);
      } catch (error) {
        console.warn('The saved profile could not be loaded.', error);
      } finally {
        setIsLoading(false);
      }
    }

    void restoreProfile();
  }, []);

  async function completeOnboarding(newProfile: AppProfile) {
    setProfile(newProfile);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
  }

  async function resetProfile() {
    await AsyncStorage.removeItem(PROFILE_KEY);
    setProfile(null);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loading}>
        <StatusBar style="light" />
        <ActivityIndicator color="#e9d8a6" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="light" />
      {profile ? (
        <HomeScreen profile={profile} onResetProfile={resetProfile} />
      ) : (
        <OnboardingScreen onComplete={completeOnboarding} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: '#070914',
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: '#070914',
    flex: 1,
    justifyContent: 'center',
  },
});
