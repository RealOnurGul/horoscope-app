import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DailyReading, ReadingSource, getDailyReadings } from '../data/readings';
import { zodiacSigns } from '../data/horoscopes';
import { loadDailyReadingBundle } from '../services/contentService';
import { colors } from '../theme';
import { AppProfile } from '../types/profile';

type HomeScreenProps = {
  profile: AppProfile;
  onResetProfile: () => Promise<void>;
};

export function HomeScreen({ profile, onResetProfile }: HomeScreenProps) {
  const sign = zodiacSigns.find((candidate) => candidate.id === profile.zodiacSignId) ?? zodiacSigns[0];
  const fallbackReadings = useMemo(() => getDailyReadings(sign), [sign]);
  const [readings, setReadings] = useState<DailyReading[]>(fallbackReadings);
  const [readingSource, setReadingSource] = useState<ReadingSource>('fallback');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentHour = new Date().getHours();
  const latestReading = [...readings].reverse().find((reading) => currentHour >= reading.availableHour) ?? readings[0];
  const [selectedId, setSelectedId] = useState(latestReading.id);
  const selectedReading = readings.find((reading) => reading.id === selectedId) ?? latestReading;
  const today = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
  const dateKey = toLocalDateKey(new Date());

  const refreshReadings = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const bundle = await loadDailyReadingBundle(sign, dateKey, fallbackReadings);
      setReadings(bundle.readings);
      setReadingSource(bundle.source);
    } finally {
      setIsRefreshing(false);
    }
  }, [dateKey, fallbackReadings, sign]);

  useEffect(() => {
    void refreshReadings();
  }, [refreshReadings]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.today}>TODAY · {today.toUpperCase()}</Text>
          <Text style={styles.greeting}>Your sky, {sign.name}.</Text>
        </View>
        <View style={styles.signBadge}>
          <Text style={styles.signBadgeText}>{sign.symbol}</Text>
        </View>
      </View>

      <View style={styles.syncRow}>
        <View style={[styles.syncDot, readingSource === 'remote' && styles.syncDotRemote]} />
        <Text style={styles.syncText}>{sourceLabel(readingSource)}</Text>
        <Pressable disabled={isRefreshing} hitSlop={10} onPress={() => void refreshReadings()} style={styles.refreshButton}>
          {isRefreshing ? (
            <ActivityIndicator color={colors.muted} size="small" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroOrb}>
          <View style={styles.heroOrbHighlight} />
        </View>
        <Text style={styles.readingKicker}>{selectedReading.kicker}</Text>
        <Text style={styles.readingTitle}>{selectedReading.title}</Text>
        <Text style={styles.readingMessage}>{selectedReading.message}</Text>
        <View style={styles.reflectionBox}>
          <Text style={styles.reflectionLabel}>A CLOSER LOOK</Text>
          <Text style={styles.reflectionText}>{selectedReading.reflection}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>YOUR DAILY RHYTHM</Text>
      <View style={styles.timeline}>
        {readings.map((reading) => {
          const isAvailable = currentHour >= reading.availableHour;
          const isSelected = reading.id === selectedReading.id;

          return (
            <Pressable
              disabled={!isAvailable}
              key={reading.id}
              onPress={() => setSelectedId(reading.id)}
              style={[styles.timelineItem, isSelected && styles.timelineItemSelected, !isAvailable && styles.timelineItemLocked]}
            >
              <View style={[styles.timelineDot, isAvailable && styles.timelineDotAvailable]} />
              <View style={styles.timelineCopy}>
                <Text style={styles.timelineTime}>{reading.id.toUpperCase()}</Text>
                <Text numberOfLines={1} style={styles.timelineTitle}>
                  {isAvailable ? reading.title : `Available at ${formatHour(reading.availableHour)}`}
                </Text>
              </View>
              <Text style={styles.timelineArrow}>{isAvailable ? '›' : '·'}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.localNote}>
        <Text style={styles.localNoteTitle}>Designed to work offline</Text>
        <Text style={styles.localNoteText}>
          Fresh readings are saved on your phone automatically. If the content service is unavailable, today’s saved or built-in reading remains accessible.
        </Text>
      </View>

      <Pressable onPress={() => void onResetProfile()} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Restart onboarding</Text>
      </Pressable>
    </ScrollView>
  );
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 || 12;
  return `${normalized}:00 ${suffix}`;
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sourceLabel(source: ReadingSource) {
  if (source === 'remote') return 'Today’s readings synced';
  if (source === 'cache') return 'Saved readings · offline';
  return 'Built-in readings · local';
}

const styles = StyleSheet.create({
  content: { backgroundColor: colors.background, paddingBottom: 44, paddingHorizontal: 20, paddingTop: 24 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  today: { color: colors.violet, fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  greeting: { color: colors.text, fontSize: 25, fontWeight: '700', letterSpacing: -0.7, marginTop: 6 },
  signBadge: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 21, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  signBadgeText: { color: colors.gold, fontSize: 22 },
  syncRow: { alignItems: 'center', flexDirection: 'row', marginTop: 18 },
  syncDot: { backgroundColor: colors.faint, borderRadius: 4, height: 7, marginRight: 7, width: 7 },
  syncDotRemote: { backgroundColor: colors.gold },
  syncText: { color: colors.faint, flex: 1, fontSize: 11, fontWeight: '600' },
  refreshButton: { alignItems: 'center', minHeight: 24, minWidth: 54 },
  refreshButtonText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  heroCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 30, borderWidth: 1, marginTop: 28, overflow: 'hidden', padding: 24 },
  heroOrb: { backgroundColor: colors.lavender, borderRadius: 48, height: 96, marginBottom: 30, marginTop: 8, shadowColor: colors.violet, shadowOffset: { height: 0, width: 0 }, shadowOpacity: 0.65, shadowRadius: 26, width: 96 },
  heroOrbHighlight: { backgroundColor: 'rgba(255,255,255,0.74)', borderRadius: 14, height: 23, left: 18, position: 'absolute', top: 15, width: 23 },
  readingKicker: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  readingTitle: { color: colors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.9, marginTop: 10 },
  readingMessage: { color: '#e5e0e9', fontSize: 19, lineHeight: 29, marginTop: 18 },
  reflectionBox: { backgroundColor: colors.surfaceRaised, borderRadius: 18, marginTop: 24, padding: 17 },
  reflectionLabel: { color: colors.faint, fontSize: 9, fontWeight: '800', letterSpacing: 1.6 },
  reflectionText: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  sectionLabel: { color: colors.faint, fontSize: 10, fontWeight: '800', letterSpacing: 1.8, marginBottom: 12, marginTop: 30 },
  timeline: { gap: 9 },
  timelineItem: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 18, borderWidth: 1, flexDirection: 'row', minHeight: 70, paddingHorizontal: 16 },
  timelineItemSelected: { borderColor: colors.violet },
  timelineItemLocked: { opacity: 0.45 },
  timelineDot: { borderColor: colors.faint, borderRadius: 5, borderWidth: 1, height: 10, marginRight: 13, width: 10 },
  timelineDotAvailable: { backgroundColor: colors.gold, borderColor: colors.gold },
  timelineCopy: { flex: 1 },
  timelineTime: { color: colors.faint, fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  timelineTitle: { color: colors.text, fontSize: 15, fontWeight: '600', marginTop: 4 },
  timelineArrow: { color: colors.muted, fontSize: 26 },
  localNote: { borderColor: colors.line, borderRadius: 18, borderWidth: 1, marginTop: 24, padding: 17 },
  localNoteTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  localNoteText: { color: colors.faint, fontSize: 12, lineHeight: 18, marginTop: 5 },
  resetButton: { alignItems: 'center', padding: 20 },
  resetButtonText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
});
