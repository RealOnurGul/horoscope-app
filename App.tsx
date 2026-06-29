import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';

import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { deleteProfile, loadProfile, saveProfile } from './src/services/profileStorage';
import { AppProfile } from './src/types/profile';

export default function App() {
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreProfile() {
      try {
        setProfile(await loadProfile());
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
    await saveProfile(newProfile);
  }

  async function resetProfile() {
    await deleteProfile();
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
    backgroundColor: '#060708',
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: '#060708',
    flex: 1,
    justifyContent: 'center',
  },
});
