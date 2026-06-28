import { useMemo, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { colors } from '../theme';
import { BirthTimeWindow, AppProfile } from '../types/profile';
import { getZodiacSign, parseBirthDate, toLocalDateString } from '../utils/astrology';

type OnboardingScreenProps = {
  onComplete: (profile: AppProfile) => Promise<void>;
};

const TIME_WINDOWS: BirthTimeWindow[] = ['Dawn', 'Morning', 'Afternoon', 'Evening', 'Night'];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [birthTimeWindow, setBirthTimeWindow] = useState<BirthTimeWindow | null>('Afternoon');
  const [birthPlace, setBirthPlace] = useState('');
  const [dateError, setDateError] = useState('');

  const birthDate = useMemo(() => parseBirthDate(month, day, year), [day, month, year]);
  const sign = birthDate ? getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate()) : null;

  function continueFromDate() {
    if (!birthDate) {
      setDateError('Enter a valid birth date to continue.');
      return;
    }

    setDateError('');
    setStep(2);
  }

  async function finish() {
    if (!birthDate || !sign) return;

    await onComplete({
      birthDate: toLocalDateString(birthDate),
      birthPlace: birthPlace.trim() || null,
      birthTimeWindow,
      createdAt: new Date().toISOString(),
      zodiacSignId: sign.id,
    });
  }

  if (step === 0) {
    return <WelcomeStep onContinue={() => setStep(1)} />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <View style={styles.shell}>
        <ProgressHeader currentStep={step} onBack={() => setStep((current) => Math.max(0, current - 1))} />

        {step === 1 && (
          <QuestionLayout
            eyebrow="YOUR BEGINNING"
            title="When did your story begin?"
            description="Your birth date reveals your sun sign—the anchor for your daily readings."
          >
            <View style={styles.dateRow}>
              <DateField label="MM" maxLength={2} value={month} onChangeText={setMonth} />
              <DateField label="DD" maxLength={2} value={day} onChangeText={setDay} />
              <DateField label="YYYY" maxLength={4} value={year} onChangeText={setYear} wide />
            </View>
            {dateError ? <Text style={styles.error}>{dateError}</Text> : null}
            <PrimaryButton label="Continue" onPress={continueFromDate} />
          </QuestionLayout>
        )}

        {step === 2 && (
          <TimeOrbitStep
            value={birthTimeWindow}
            onChange={setBirthTimeWindow}
            onContinue={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <QuestionLayout
            eyebrow="YOUR HORIZON"
            title="Where were you born?"
            description="Your birthplace will eventually help us calculate a more precise chart. City and country are enough."
          >
            <TextInput
              autoCapitalize="words"
              autoCorrect={false}
              onChangeText={setBirthPlace}
              placeholder="Toronto, Canada"
              placeholderTextColor={colors.faint}
              returnKeyType="done"
              style={styles.placeInput}
              value={birthPlace}
            />
            <PrimaryButton label="Continue" onPress={() => setStep(4)} />
            <Pressable onPress={() => { setBirthPlace(''); setStep(4); }} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>Skip for now</Text>
            </Pressable>
          </QuestionLayout>
        )}

        {step === 4 && sign && birthDate && (
          <QuestionLayout
            eyebrow="YOUR PROFILE"
            title="The sky remembers you."
            description="This is the beginning of your personal daily rhythm. You can refine these details later."
          >
            <View style={styles.revealCard}>
              <Text style={styles.revealSymbol}>{sign.symbol}</Text>
              <Text style={styles.revealName}>{sign.name}</Text>
              <Text style={styles.revealDates}>{sign.dates}  ·  {sign.element}</Text>
              <View style={styles.divider} />
              <ProfileLine label="Born" value={birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
              <ProfileLine label="Time" value={birthTimeWindow ?? 'Not provided'} />
              <ProfileLine label="Place" value={birthPlace.trim() || 'Not provided'} />
            </View>
            <PrimaryButton label="Enter your sky" onPress={() => void finish()} />
          </QuestionLayout>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <ImageBackground
      resizeMode="cover"
      source={require('../../assets/celestial-onboarding.png')}
      style={styles.welcomeImage}
    >
      <View style={styles.welcomeShade} />
      <View style={styles.welcomeContent}>
        <Text style={styles.brand}>HOROSCOPE</Text>
        <View>
          <Text style={styles.welcomeTitle}>Meet yourself{`\n`}in the stars.</Text>
          <Text style={styles.welcomeBody}>
            Three thoughtful readings, shaped around your rhythm and delivered across the day.
          </Text>
          <PrimaryButton label="Begin" onPress={onContinue} />
          <Text style={styles.privacyNote}>Private by default. Your profile stays on this device.</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

function ProgressHeader({ currentStep, onBack }: { currentStep: number; onBack: () => void }) {
  return (
    <View style={styles.progressHeader}>
      <Pressable hitSlop={12} onPress={onBack}>
        <Text style={styles.back}>‹</Text>
      </Pressable>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
      </View>
      <Text style={styles.stepCount}>{currentStep}/4</Text>
    </View>
  );
}

function QuestionLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={styles.questionContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.questionTitle}>{title}</Text>
      <Text style={styles.questionDescription}>{description}</Text>
      <View style={styles.answerArea}>{children}</View>
    </ScrollView>
  );
}

function DateField({
  label,
  value,
  onChangeText,
  maxLength,
  wide = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  maxLength: number;
  wide?: boolean;
}) {
  return (
    <View style={[styles.dateField, wide && styles.dateFieldWide]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        keyboardType="number-pad"
        maxLength={maxLength}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.faint}
        style={styles.dateInput}
        value={value}
      />
    </View>
  );
}

function TimeOrbitStep({
  value,
  onChange,
  onContinue,
}: {
  value: BirthTimeWindow | null;
  onChange: (value: BirthTimeWindow | null) => void;
  onContinue: () => void;
}) {
  const { width } = useWindowDimensions();
  const [ratio, setRatio] = useState(0.58);
  const trackWidth = Math.max(260, width - 56);

  function updateTime(locationX: number) {
    const nextRatio = Math.max(0, Math.min(1, locationX / trackWidth));
    setRatio(nextRatio);
    onChange(TIME_WINDOWS[Math.min(4, Math.floor(nextRatio * 5))]);
  }

  return (
    <ScrollView contentContainerStyle={styles.questionContent}>
      <Text style={styles.eyebrow}>YOUR FIRST LIGHT</Text>
      <Text style={styles.questionTitle}>About when were you born?</Text>
      <Text style={styles.questionDescription}>
        Move the planet across the horizon. An estimate is completely fine.
      </Text>

      <View
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => updateTime(event.nativeEvent.locationX)}
        onResponderMove={(event) => updateTime(event.nativeEvent.locationX)}
        onStartShouldSetResponder={() => true}
        style={[styles.orbitStage, { width: trackWidth }]}
      >
        <View style={styles.orbitGlow} />
        <View style={styles.horizon} />
        <View style={[styles.draggablePlanet, { left: ratio * (trackWidth - 62) }]}>
          <View style={styles.planetHighlight} />
        </View>
        <Text style={styles.dawnLabel}>DAWN</Text>
        <Text style={styles.nightLabel}>NIGHT</Text>
      </View>

      <View style={styles.timeResult}>
        <Text style={styles.timeResultLabel}>ESTIMATED TIME</Text>
        <Text style={styles.timeResultValue}>{value ?? 'Not provided'}</Text>
      </View>

      <PrimaryButton label="Continue" onPress={onContinue} />
      <Pressable onPress={() => { onChange(null); onContinue(); }} style={styles.textButton}>
        <Text style={styles.textButtonLabel}>I don’t know my birth time</Text>
      </Pressable>
    </ScrollView>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
      <Text style={styles.primaryButtonLabel}>{label}</Text>
      <Text style={styles.primaryButtonArrow}>→</Text>
    </Pressable>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileLine}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.profileValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shell: { backgroundColor: colors.background, flex: 1 },
  welcomeImage: { flex: 1 },
  welcomeShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5, 7, 16, 0.28)' },
  welcomeContent: { flex: 1, justifyContent: 'space-between', paddingBottom: 24, paddingHorizontal: 24, paddingTop: 22 },
  brand: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 3.2 },
  welcomeTitle: { color: colors.text, fontSize: 48, fontWeight: '700', letterSpacing: -2.1, lineHeight: 52 },
  welcomeBody: { color: '#d1ced8', fontSize: 16, lineHeight: 24, marginBottom: 8, marginTop: 18, maxWidth: 340 },
  privacyNote: { color: '#aaa7b7', fontSize: 11, marginTop: 13, textAlign: 'center' },
  progressHeader: { alignItems: 'center', flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingVertical: 16 },
  back: { color: colors.text, fontSize: 36, fontWeight: '300', lineHeight: 36 },
  progressTrack: { backgroundColor: colors.line, borderRadius: 99, flex: 1, height: 3, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.gold, borderRadius: 99, height: 3 },
  stepCount: { color: colors.muted, fontSize: 12, fontWeight: '700', width: 26 },
  questionContent: { flexGrow: 1, paddingBottom: 34, paddingHorizontal: 24, paddingTop: 34 },
  eyebrow: { color: colors.violet, fontSize: 11, fontWeight: '800', letterSpacing: 2.2 },
  questionTitle: { color: colors.text, fontSize: 38, fontWeight: '700', letterSpacing: -1.4, lineHeight: 43, marginTop: 12 },
  questionDescription: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 360 },
  answerArea: { flex: 1, justifyContent: 'flex-end', minHeight: 330, paddingTop: 42 },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateField: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 18, borderWidth: 1, flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  dateFieldWide: { flex: 1.45 },
  inputLabel: { color: colors.faint, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  dateInput: { color: colors.text, fontSize: 23, fontWeight: '600', marginTop: 5, padding: 0 },
  error: { color: colors.danger, fontSize: 13, marginTop: 10 },
  placeInput: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 18, borderWidth: 1, color: colors.text, fontSize: 18, paddingHorizontal: 18, paddingVertical: 18 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.text, borderRadius: 18, flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, minHeight: 58, paddingHorizontal: 20 },
  primaryButtonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  primaryButtonLabel: { color: colors.background, fontSize: 16, fontWeight: '800' },
  primaryButtonArrow: { color: colors.background, fontSize: 22 },
  textButton: { alignItems: 'center', padding: 16 },
  textButtonLabel: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  orbitStage: { alignSelf: 'center', height: 245, marginTop: 40, overflow: 'hidden' },
  orbitGlow: { backgroundColor: 'rgba(142, 113, 222, 0.16)', borderRadius: 999, bottom: -145, height: 250, left: -30, position: 'absolute', right: -30 },
  horizon: { borderColor: '#393653', borderRadius: 999, borderTopWidth: 1, bottom: 58, height: 100, left: 0, position: 'absolute', right: 0 },
  draggablePlanet: { backgroundColor: '#d7cdf6', borderColor: '#f1e7c5', borderRadius: 31, borderWidth: 1, bottom: 73, elevation: 7, height: 62, position: 'absolute', shadowColor: '#bda9ff', shadowOffset: { height: 0, width: 0 }, shadowOpacity: 0.8, shadowRadius: 20, width: 62 },
  planetHighlight: { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 12, height: 17, left: 12, position: 'absolute', top: 10, width: 17 },
  dawnLabel: { bottom: 31, color: colors.faint, fontSize: 10, fontWeight: '800', left: 0, letterSpacing: 1.6, position: 'absolute' },
  nightLabel: { bottom: 31, color: colors.faint, fontSize: 10, fontWeight: '800', letterSpacing: 1.6, position: 'absolute', right: 0 },
  timeResult: { alignItems: 'center', marginBottom: 12 },
  timeResultLabel: { color: colors.faint, fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
  timeResultValue: { color: colors.text, fontSize: 26, fontWeight: '700', marginTop: 7 },
  revealCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 28, borderWidth: 1, padding: 24 },
  revealSymbol: { color: colors.gold, fontSize: 58 },
  revealName: { color: colors.text, fontSize: 30, fontWeight: '700', marginTop: 4 },
  revealDates: { color: colors.muted, fontSize: 13, marginTop: 6 },
  divider: { backgroundColor: colors.line, height: 1, marginVertical: 20, width: '100%' },
  profileLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 11, width: '100%' },
  profileLabel: { color: colors.faint, fontSize: 13 },
  profileValue: { color: colors.text, flex: 1, fontSize: 13, fontWeight: '600', marginLeft: 20, textAlign: 'right' },
});
