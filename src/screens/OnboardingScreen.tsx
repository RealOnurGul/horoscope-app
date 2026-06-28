import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  KeyboardAvoidingView,
  PanResponder,
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
import { AppProfile, BirthTimeWindow } from '../types/profile';
import { getZodiacSign, toLocalDateString } from '../utils/astrology';

type OnboardingScreenProps = {
  onComplete: (profile: AppProfile) => Promise<void>;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, index) => CURRENT_YEAR - index);
const CITY_SUGGESTIONS = ['Toronto, Canada', 'New York, USA', 'London, UK', 'Istanbul, Türkiye', 'Tokyo, Japan'];
const TOTAL_STEPS = 4;

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { height } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(14);
  const [year, setYear] = useState(CURRENT_YEAR - 25);
  const [birthHour, setBirthHour] = useState(12);
  const [birthTimeWindow, setBirthTimeWindow] = useState<BirthTimeWindow | null>('Afternoon');
  const [birthPlace, setBirthPlace] = useState('');
  const sceneY = useRef(new Animated.Value(0)).current;
  const sceneOpacity = useRef(new Animated.Value(1)).current;
  const wind = useRef(new Animated.Value(0)).current;
  const isTransitioning = useRef(false);

  const maxDay = useMemo(() => new Date(year, month, 0).getDate(), [month, year]);
  const days = useMemo(() => Array.from({ length: maxDay }, (_, index) => index + 1), [maxDay]);
  const birthDate = useMemo(() => new Date(year, month - 1, Math.min(day, maxDay)), [day, maxDay, month, year]);
  const sign = useMemo(() => getZodiacSign(month, Math.min(day, maxDay)), [day, maxDay, month]);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [day, maxDay]);

  function transitionTo(nextStep: number) {
    if (isTransitioning.current || nextStep === step || nextStep < 0 || nextStep > TOTAL_STEPS) return;
    isTransitioning.current = true;
    const direction = nextStep > step ? -1 : 1;
    wind.setValue(0);

    Animated.parallel([
      Animated.timing(sceneY, {
        duration: 280,
        easing: Easing.in(Easing.cubic),
        toValue: direction * height * 0.18,
        useNativeDriver: true,
      }),
      Animated.timing(sceneOpacity, { duration: 220, toValue: 0, useNativeDriver: true }),
      Animated.timing(wind, {
        duration: 520,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      sceneY.setValue(-direction * height * 0.16);
      Animated.parallel([
        Animated.spring(sceneY, { damping: 20, mass: 0.8, stiffness: 115, toValue: 0, useNativeDriver: true }),
        Animated.timing(sceneOpacity, { duration: 360, toValue: 1, useNativeDriver: true }),
      ]).start(() => {
        isTransitioning.current = false;
      });
    });
  }

  function updateBirthHour(hour: number | null) {
    if (hour === null) {
      setBirthTimeWindow(null);
      return;
    }

    setBirthHour(hour);
    setBirthTimeWindow(timeWindowForHour(hour));
  }

  async function finish() {
    await onComplete({
      birthDate: toLocalDateString(birthDate),
      birthPlace: birthPlace.trim() || null,
      birthTimeWindow,
      createdAt: new Date().toISOString(),
      zodiacSignId: sign.id,
    });
  }

  const backgroundSource = step === 4
    ? require('../../assets/zodiac-astrolabe-v2.png')
    : require('../../assets/celestial-descent-v2.png');

  return (
    <ImageBackground resizeMode="cover" source={backgroundSource} style={styles.background}>
      <View style={[styles.backgroundVeil, step === 4 && styles.revealVeil]} />
      <AmbientStars />
      <WindShift progress={wind} />

      {step > 0 ? (
        <ProgressHeader
          currentStep={step}
          onBack={() => transitionTo(step - 1)}
          signSymbol={sign.symbol}
        />
      ) : null}

      <Animated.View
        style={[styles.scene, { opacity: sceneOpacity, transform: [{ translateY: sceneY }] }]}
      >
        {step === 0 ? <WelcomeStep onContinue={() => transitionTo(1)} /> : null}
        {step === 1 ? (
          <DateWheelStep
            day={Math.min(day, maxDay)}
            days={days}
            month={month}
            onDayChange={setDay}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onContinue={() => transitionTo(2)}
            signName={sign.name}
            signSymbol={sign.symbol}
            year={year}
          />
        ) : null}
        {step === 2 ? (
          <TimeOrbitStep
            hour={birthHour}
            onChange={updateBirthHour}
            onContinue={() => transitionTo(3)}
            value={birthTimeWindow}
          />
        ) : null}
        {step === 3 ? (
          <PlaceGlobeStep
            onChange={setBirthPlace}
            onContinue={() => transitionTo(4)}
            value={birthPlace}
          />
        ) : null}
        {step === 4 ? (
          <RevealStep
            birthDate={birthDate}
            birthPlace={birthPlace}
            birthTimeWindow={birthTimeWindow}
            onFinish={() => void finish()}
            sign={sign}
          />
        ) : null}
      </Animated.View>
    </ImageBackground>
  );
}

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.welcomeContent}>
      <View>
        <Text style={styles.brand}>HOROSCOPE</Text>
        <View style={styles.brandRule} />
      </View>

      <View style={styles.welcomeCopy}>
        <Text style={styles.welcomeKicker}>A MAP OF YOUR INNER SKY</Text>
        <Text style={styles.welcomeTitle}>Your story is{`\n`}written above.</Text>
        <Text style={styles.welcomeBody}>
          Descend through the stars and discover the rhythm you arrived with.
        </Text>
      </View>

      <View>
        <PrimaryButton label="Begin the journey" onPress={onContinue} />
        <View style={styles.descentHint}>
          <View style={styles.descentLine} />
          <Text style={styles.descentText}>YOUR SKY AWAITS BELOW</Text>
        </View>
      </View>
    </View>
  );
}

function DateWheelStep({
  day,
  days,
  month,
  onDayChange,
  onMonthChange,
  onYearChange,
  onContinue,
  signName,
  signSymbol,
  year,
}: {
  day: number;
  days: number[];
  month: number;
  onDayChange: (value: number) => void;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
  onContinue: () => void;
  signName: string;
  signSymbol: string;
  year: number;
}) {
  return (
    <StepShell
      eyebrow="YOUR BEGINNING"
      title="When did you arrive?"
      description="Spin the celestial wheels. Your sign will appear as the date settles into place."
    >
      <View style={styles.signPreview}>
        <Text style={styles.signPreviewSymbol}>{signSymbol}</Text>
        <View>
          <Text style={styles.signPreviewLabel}>YOUR SUN SIGN</Text>
          <Text style={styles.signPreviewName}>{signName}</Text>
        </View>
      </View>

      <View style={styles.wheelFrame}>
        <View pointerEvents="none" style={styles.wheelFocus} />
        <WheelPicker
          accessibilityLabel="Birth month"
          flex={1.5}
          items={MONTHS}
          onChange={(index) => onMonthChange(index + 1)}
          selectedIndex={month - 1}
        />
        <WheelPicker
          accessibilityLabel="Birth day"
          flex={0.72}
          items={days.map(String)}
          onChange={(index) => onDayChange(days[index])}
          selectedIndex={day - 1}
        />
        <WheelPicker
          accessibilityLabel="Birth year"
          flex={0.95}
          items={YEARS.map(String)}
          onChange={(index) => onYearChange(YEARS[index])}
          selectedIndex={Math.max(0, YEARS.indexOf(year))}
        />
      </View>

      <PrimaryButton label="Follow the light" onPress={onContinue} />
    </StepShell>
  );
}

const WHEEL_ITEM_HEIGHT = 50;

function WheelPicker({
  accessibilityLabel,
  flex,
  items,
  onChange,
  selectedIndex,
}: {
  accessibilityLabel: string;
  flex: number;
  items: string[];
  onChange: (index: number) => void;
  selectedIndex: number;
}) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ animated: false, y: selectedIndex * WHEEL_ITEM_HEIGHT });
    });
  }, [items.length, selectedIndex]);

  function settle(offsetY: number) {
    const index = Math.max(0, Math.min(items.length - 1, Math.round(offsetY / WHEEL_ITEM_HEIGHT)));
    onChange(index);
  }

  return (
    <View style={{ flex }}>
      <ScrollView
        accessibilityLabel={accessibilityLabel}
        bounces={false}
        contentContainerStyle={styles.wheelContent}
        decelerationRate="fast"
        onMomentumScrollEnd={(event) => settle(event.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(event) => settle(event.nativeEvent.contentOffset.y)}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <View key={item} style={styles.wheelItem}>
              <Text numberOfLines={1} style={[styles.wheelItemText, isSelected && styles.wheelItemTextSelected]}>
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TimeOrbitStep({
  hour,
  onChange,
  onContinue,
  value,
}: {
  hour: number;
  onChange: (hour: number | null) => void;
  onContinue: () => void;
  value: BirthTimeWindow | null;
}) {
  const dialSize = 252;
  const center = dialSize / 2;
  const orbitRadius = 96;
  const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
  const knobX = center + Math.cos(angle) * orbitRadius - 24;
  const knobY = center + Math.sin(angle) * orbitRadius - 24;

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => updateFromPoint(event.nativeEvent.locationX, event.nativeEvent.locationY),
      onPanResponderMove: (event) => updateFromPoint(event.nativeEvent.locationX, event.nativeEvent.locationY),
      onStartShouldSetPanResponder: () => true,
    }),
    [onChange],
  );

  function updateFromPoint(x: number, y: number) {
    let pointAngle = Math.atan2(y - center, x - center) + Math.PI / 2;
    if (pointAngle < 0) pointAngle += Math.PI * 2;
    onChange(Math.round((pointAngle / (Math.PI * 2)) * 24) % 24);
  }

  return (
    <StepShell
      eyebrow="YOUR FIRST LIGHT"
      title="What was the sky doing?"
      description="Guide the sun around the day. An estimate is more than enough."
    >
      <View style={styles.orbitWrap}>
        <View {...panResponder.panHandlers} style={[styles.timeDial, { height: dialSize, width: dialSize }]}>
          <View style={styles.timeDialInner} />
          <View style={styles.orbitVertical} />
          <View style={styles.orbitHorizontal} />
          <Text style={[styles.orbitMarker, styles.orbitMarkerTop]}>MIDNIGHT</Text>
          <Text style={[styles.orbitMarker, styles.orbitMarkerRight]}>6 PM</Text>
          <Text style={[styles.orbitMarker, styles.orbitMarkerBottom]}>NOON</Text>
          <Text style={[styles.orbitMarker, styles.orbitMarkerLeft]}>6 AM</Text>
          <View style={[styles.sunKnob, { left: knobX, top: knobY }]}>
            <View style={styles.sunCore} />
          </View>
          <View style={styles.timeCenter}>
            <Text style={styles.timeValue}>{formatHour(hour)}</Text>
            <Text style={styles.timeWindow}>{value ?? 'Unknown'}</Text>
          </View>
        </View>
      </View>

      <PrimaryButton label="Continue downward" onPress={onContinue} />
      <Pressable
        onPress={() => {
          onChange(null);
          onContinue();
        }}
        style={styles.textButton}
      >
        <Text style={styles.textButtonLabel}>I don’t know my birth time</Text>
      </Pressable>
    </StepShell>
  );
}

function PlaceGlobeStep({
  onChange,
  onContinue,
  value,
}: {
  onChange: (value: string) => void;
  onContinue: () => void;
  value: string;
}) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <StepShell
        eyebrow="YOUR HORIZON"
        title="Where did Earth meet you?"
        description="Choose a city, or leave this detail among the stars for now."
      >
        <CelestialGlobe />
        <View style={styles.placeField}>
          <Text style={styles.placePin}>⌖</Text>
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={onChange}
            placeholder="City, country"
            placeholderTextColor={colors.faint}
            returnKeyType="done"
            style={styles.placeInput}
            value={value}
          />
        </View>
        <View style={styles.citySuggestions}>
          {CITY_SUGGESTIONS.map((city) => (
            <Pressable key={city} onPress={() => onChange(city)} style={styles.cityChip}>
              <Text style={styles.cityChipText}>{city.split(',')[0]}</Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton label={value.trim() ? 'Set this horizon' : 'Skip for now'} onPress={onContinue} />
      </StepShell>
    </KeyboardAvoidingView>
  );
}

function CelestialGlobe() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        duration: 12000,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  return (
    <View style={styles.globeStage}>
      <View style={styles.globeHalo} />
      <View style={styles.globe}>
        <View style={styles.globeShade} />
        <View style={[styles.globeLatitude, { top: 48 }]} />
        <View style={[styles.globeLatitude, { bottom: 48 }]} />
        <View style={[styles.globeMeridian, { transform: [{ rotate: '26deg' }] }]} />
        <View style={[styles.globeMeridian, { transform: [{ rotate: '-26deg' }] }]} />
        <Animated.View
          style={[
            styles.continentGroup,
            {
              transform: [{
                rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
              }],
            },
          ]}
        >
          <View style={[styles.continent, styles.continentOne]} />
          <View style={[styles.continent, styles.continentTwo]} />
          <View style={[styles.continent, styles.continentThree]} />
        </Animated.View>
        <View style={styles.globeHighlight} />
      </View>
      <Animated.View
        style={[
          styles.globeOrbit,
          {
            transform: [{
              rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['12deg', '372deg'] }),
            }],
          },
        ]}
      >
        <View style={styles.globeSatellite} />
      </Animated.View>
    </View>
  );
}

function RevealStep({
  birthDate,
  birthPlace,
  birthTimeWindow,
  onFinish,
  sign,
}: {
  birthDate: Date;
  birthPlace: string;
  birthTimeWindow: BirthTimeWindow | null;
  onFinish: () => void;
  sign: ReturnType<typeof getZodiacSign>;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { duration: 1800, toValue: 1, useNativeDriver: true }),
        Animated.timing(pulse, { duration: 1800, toValue: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.revealContent}>
      <View style={styles.revealTop}>
        <Text style={styles.revealEyebrow}>THE SKY REMEMBERS</Text>
        <Animated.View
          style={[
            styles.revealSymbolWrap,
            {
              transform: [
                { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
                { translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
              ],
            },
          ]}
        >
          <Text style={styles.revealSymbol}>{sign.symbol}</Text>
        </Animated.View>
      </View>

      <View style={styles.revealCard}>
        <Text style={styles.revealIntro}>You arrived beneath</Text>
        <Text style={styles.revealName}>{sign.name}</Text>
        <Text style={styles.revealMeta}>{sign.dates}  ·  {sign.element}</Text>
        <View style={styles.divider} />
        <ProfileLine
          label="Born"
          value={birthDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
        />
        <ProfileLine label="First light" value={birthTimeWindow ?? 'Unknown'} />
        <ProfileLine label="Horizon" value={birthPlace.trim() || 'Uncharted'} />
        <PrimaryButton label="Enter my sky" onPress={onFinish} />
      </View>
    </View>
  );
}

function StepShell({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.stepContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.questionTitle}>{title}</Text>
      <Text style={styles.questionDescription}>{description}</Text>
      <View style={styles.answerArea}>{children}</View>
    </ScrollView>
  );
}

function ProgressHeader({
  currentStep,
  onBack,
  signSymbol,
}: {
  currentStep: number;
  onBack: () => void;
  signSymbol: string;
}) {
  return (
    <View style={styles.progressHeader}>
      <Pressable accessibilityLabel="Go back" hitSlop={12} onPress={onBack} style={styles.backButton}>
        <Text style={styles.back}>↑</Text>
      </Pressable>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(currentStep / TOTAL_STEPS) * 100}%` }]} />
      </View>
      <Text style={styles.headerSign}>{signSymbol}</Text>
    </View>
  );
}

function WindShift({ progress }: { progress: Animated.Value }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.windStreak,
            {
              left: `${8 + index * 17}%`,
              opacity: progress.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 0.8, 0.45, 0] }),
              transform: [
                { rotate: '-14deg' },
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-220 - index * 24, 900 + index * 32] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

function AmbientStars() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {[
        [12, 18, 2],
        [85, 15, 3],
        [71, 34, 2],
        [17, 48, 3],
        [89, 61, 2],
        [9, 78, 2],
        [63, 84, 3],
        [91, 91, 2],
      ].map(([left, top, size], index) => (
        <View key={index} style={[styles.star, { height: size, left: `${left}%`, top: `${top}%`, width: size }]} />
      ))}
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
      <Text style={styles.primaryButtonLabel}>{label}</Text>
      <View style={styles.buttonOrb}>
        <Text style={styles.primaryButtonArrow}>↓</Text>
      </View>
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

function timeWindowForHour(hour: number): BirthTimeWindow {
  if (hour >= 5 && hour < 8) return 'Dawn';
  if (hour >= 8 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

function formatHour(hour: number) {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: { backgroundColor: colors.background, flex: 1 },
  backgroundVeil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4, 6, 18, 0.55)' },
  revealVeil: { backgroundColor: 'rgba(4, 5, 15, 0.25)' },
  scene: { flex: 1 },
  star: { backgroundColor: '#fff8dc', borderRadius: 99, opacity: 0.72, position: 'absolute' },
  windStreak: { backgroundColor: '#e6d8ff', borderRadius: 99, height: 170, position: 'absolute', top: 0, width: 1 },

  welcomeContent: { flex: 1, justifyContent: 'space-between', paddingBottom: 26, paddingHorizontal: 24, paddingTop: 22 },
  brand: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 3.4 },
  brandRule: { backgroundColor: colors.gold, height: 1, marginTop: 10, opacity: 0.5, width: 42 },
  welcomeCopy: { marginTop: 140 },
  welcomeKicker: { color: '#c1b4e6', fontSize: 10, fontWeight: '800', letterSpacing: 2.7 },
  welcomeTitle: { color: colors.text, fontSize: 47, fontWeight: '700', letterSpacing: -2.3, lineHeight: 50, marginTop: 14 },
  welcomeBody: { color: '#d2cedd', fontSize: 16, lineHeight: 24, marginTop: 18, maxWidth: 330 },
  descentHint: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  descentLine: { backgroundColor: colors.gold, height: 1, marginRight: 10, opacity: 0.6, width: 24 },
  descentText: { color: '#9690a6', fontSize: 9, fontWeight: '800', letterSpacing: 1.9 },

  progressHeader: { alignItems: 'center', flexDirection: 'row', gap: 13, paddingHorizontal: 20, paddingVertical: 14, zIndex: 10 },
  backButton: { alignItems: 'center', borderColor: 'rgba(233,216,166,0.35)', borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 },
  back: { color: colors.gold, fontSize: 18, fontWeight: '500' },
  progressTrack: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 99, flex: 1, height: 2, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.gold, borderRadius: 99, height: 2 },
  headerSign: { color: colors.gold, fontSize: 22, textAlign: 'center', width: 28 },
  stepContent: { flexGrow: 1, paddingBottom: 30, paddingHorizontal: 24, paddingTop: 12 },
  eyebrow: { color: '#b9a7ef', fontSize: 10, fontWeight: '800', letterSpacing: 2.6 },
  questionTitle: { color: colors.text, fontSize: 36, fontWeight: '700', letterSpacing: -1.5, lineHeight: 40, marginTop: 10 },
  questionDescription: { color: '#b7b2c2', fontSize: 15, lineHeight: 22, marginTop: 12, maxWidth: 355 },
  answerArea: { flex: 1, justifyContent: 'flex-end', minHeight: 440, paddingTop: 20 },

  signPreview: { alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(10,12,28,0.64)', borderColor: 'rgba(233,216,166,0.23)', borderRadius: 22, borderWidth: 1, flexDirection: 'row', marginBottom: 14, paddingHorizontal: 16, paddingVertical: 10 },
  signPreviewSymbol: { color: colors.gold, fontSize: 29, marginRight: 12 },
  signPreviewLabel: { color: '#8d8799', fontSize: 8, fontWeight: '800', letterSpacing: 1.6 },
  signPreviewName: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 2 },
  wheelFrame: { backgroundColor: 'rgba(9,11,28,0.82)', borderColor: 'rgba(215,205,246,0.18)', borderRadius: 26, borderWidth: 1, flexDirection: 'row', height: 180, overflow: 'hidden', paddingHorizontal: 8, position: 'relative' },
  wheelContent: { paddingVertical: 65 },
  wheelItem: { alignItems: 'center', height: WHEEL_ITEM_HEIGHT, justifyContent: 'center', paddingHorizontal: 3 },
  wheelItemText: { color: '#686579', fontSize: 16, fontWeight: '500' },
  wheelItemTextSelected: { color: colors.text, fontSize: 18, fontWeight: '800' },
  wheelFocus: { backgroundColor: 'rgba(215,205,246,0.08)', borderBottomColor: 'rgba(233,216,166,0.35)', borderBottomWidth: 1, borderTopColor: 'rgba(233,216,166,0.35)', borderTopWidth: 1, height: WHEEL_ITEM_HEIGHT, left: 10, position: 'absolute', right: 10, top: 65 },

  orbitWrap: { alignItems: 'center', marginBottom: 8 },
  timeDial: { alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(8,10,26,0.68)', borderColor: 'rgba(215,205,246,0.33)', borderRadius: 126, borderWidth: 1, justifyContent: 'center', position: 'relative', shadowColor: '#8f78d4', shadowOffset: { height: 0, width: 0 }, shadowOpacity: 0.34, shadowRadius: 24 },
  timeDialInner: { borderColor: 'rgba(233,216,166,0.22)', borderRadius: 83, borderWidth: 1, height: 166, position: 'absolute', width: 166 },
  orbitVertical: { backgroundColor: 'rgba(255,255,255,0.08)', height: 166, position: 'absolute', width: 1 },
  orbitHorizontal: { backgroundColor: 'rgba(255,255,255,0.08)', height: 1, position: 'absolute', width: 166 },
  orbitMarker: { color: '#797386', fontSize: 7, fontWeight: '800', letterSpacing: 1, position: 'absolute' },
  orbitMarkerTop: { top: 14 },
  orbitMarkerRight: { right: 8, top: 121 },
  orbitMarkerBottom: { bottom: 14 },
  orbitMarkerLeft: { left: 9, top: 121 },
  sunKnob: { alignItems: 'center', backgroundColor: '#cbb9ff', borderColor: '#fff3c8', borderRadius: 24, borderWidth: 1, height: 48, justifyContent: 'center', position: 'absolute', shadowColor: '#efd88e', shadowOffset: { height: 0, width: 0 }, shadowOpacity: 0.9, shadowRadius: 15, width: 48 },
  sunCore: { backgroundColor: '#fff3c8', borderRadius: 9, height: 18, shadowColor: '#ffffff', shadowOffset: { height: 0, width: 0 }, shadowOpacity: 0.9, shadowRadius: 8, width: 18 },
  timeCenter: { alignItems: 'center' },
  timeValue: { color: colors.text, fontSize: 25, fontWeight: '800', letterSpacing: -0.8 },
  timeWindow: { color: colors.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' },

  globeStage: { alignItems: 'center', alignSelf: 'center', height: 220, justifyContent: 'center', marginBottom: 2, width: 280 },
  globeHalo: { backgroundColor: 'rgba(125,100,203,0.18)', borderRadius: 100, height: 198, position: 'absolute', shadowColor: '#af96ef', shadowOffset: { height: 0, width: 0 }, shadowOpacity: 0.7, shadowRadius: 34, width: 198 },
  globe: { backgroundColor: '#151a3a', borderColor: 'rgba(233,216,166,0.55)', borderRadius: 86, borderWidth: 1, height: 172, overflow: 'hidden', position: 'relative', width: 172 },
  globeShade: { backgroundColor: 'rgba(5,7,20,0.46)', borderRadius: 90, bottom: -20, height: 185, position: 'absolute', right: -55, width: 130 },
  globeLatitude: { borderColor: 'rgba(215,205,246,0.2)', borderRadius: 80, borderWidth: 1, height: 38, left: 8, position: 'absolute', right: 8 },
  globeMeridian: { borderColor: 'rgba(215,205,246,0.18)', borderRadius: 80, borderWidth: 1, bottom: 5, left: 58, position: 'absolute', top: 5, width: 55 },
  continentGroup: { ...StyleSheet.absoluteFillObject },
  continent: { backgroundColor: 'rgba(218,199,143,0.55)', position: 'absolute' },
  continentOne: { borderBottomLeftRadius: 18, borderTopRightRadius: 22, height: 38, left: 35, top: 38, transform: [{ rotate: '-18deg' }], width: 52 },
  continentTwo: { borderBottomRightRadius: 20, borderTopLeftRadius: 18, height: 48, right: 23, top: 79, transform: [{ rotate: '26deg' }], width: 37 },
  continentThree: { borderRadius: 20, bottom: 24, height: 26, left: 49, transform: [{ rotate: '12deg' }], width: 34 },
  globeHighlight: { backgroundColor: 'rgba(255,255,255,0.26)', borderRadius: 20, height: 35, left: 29, position: 'absolute', top: 25, transform: [{ rotate: '-30deg' }], width: 13 },
  globeOrbit: { borderColor: 'rgba(233,216,166,0.43)', borderRadius: 120, borderWidth: 1, height: 108, position: 'absolute', transform: [{ rotate: '12deg' }], width: 255 },
  globeSatellite: { backgroundColor: colors.gold, borderRadius: 5, height: 10, left: 8, position: 'absolute', top: 16, width: 10 },
  placeField: { alignItems: 'center', backgroundColor: 'rgba(9,11,28,0.84)', borderColor: 'rgba(215,205,246,0.24)', borderRadius: 18, borderWidth: 1, flexDirection: 'row', paddingHorizontal: 16 },
  placePin: { color: colors.gold, fontSize: 20, marginRight: 10 },
  placeInput: { color: colors.text, flex: 1, fontSize: 17, paddingVertical: 16 },
  citySuggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 10 },
  cityChip: { backgroundColor: 'rgba(16,19,42,0.82)', borderColor: 'rgba(255,255,255,0.12)', borderRadius: 99, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  cityChipText: { color: '#c9c4d2', fontSize: 12, fontWeight: '600' },

  revealContent: { flex: 1, justifyContent: 'flex-end', paddingBottom: 24, paddingHorizontal: 22 },
  revealTop: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingTop: 10 },
  revealEyebrow: { color: '#d7c894', fontSize: 10, fontWeight: '800', letterSpacing: 2.6, marginBottom: 16 },
  revealSymbolWrap: { alignItems: 'center', backgroundColor: 'rgba(7,8,20,0.62)', borderColor: 'rgba(233,216,166,0.6)', borderRadius: 74, borderWidth: 1, height: 148, justifyContent: 'center', shadowColor: '#bda1ff', shadowOffset: { height: 0, width: 0 }, shadowOpacity: 0.65, shadowRadius: 28, width: 148 },
  revealSymbol: { color: '#f3df9c', fontSize: 78, textShadowColor: 'rgba(242,222,156,0.7)', textShadowOffset: { height: 0, width: 0 }, textShadowRadius: 20 },
  revealCard: { backgroundColor: 'rgba(8,10,25,0.88)', borderColor: 'rgba(233,216,166,0.25)', borderRadius: 28, borderWidth: 1, padding: 21 },
  revealIntro: { color: '#a7a1b1', fontSize: 13, textAlign: 'center' },
  revealName: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -1.2, marginTop: 2, textAlign: 'center' },
  revealMeta: { color: colors.gold, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 5, textAlign: 'center', textTransform: 'uppercase' },
  divider: { backgroundColor: 'rgba(255,255,255,0.12)', height: 1, marginVertical: 14 },
  profileLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, width: '100%' },
  profileLabel: { color: '#777386', fontSize: 12 },
  profileValue: { color: '#ded9e5', flex: 1, fontSize: 12, fontWeight: '600', marginLeft: 20, textAlign: 'right' },

  primaryButton: { alignItems: 'center', backgroundColor: '#f3eee4', borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, minHeight: 58, paddingLeft: 20, paddingRight: 9 },
  primaryButtonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  primaryButtonLabel: { color: '#111224', fontSize: 15, fontWeight: '800' },
  buttonOrb: { alignItems: 'center', backgroundColor: '#17172b', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  primaryButtonArrow: { color: colors.gold, fontSize: 19, fontWeight: '600' },
  textButton: { alignItems: 'center', padding: 13 },
  textButtonLabel: { color: '#aaa4b5', fontSize: 13, fontWeight: '600' },
});
