import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
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
const DISPLAY_FONT = Platform.select({ android: 'serif', default: 'serif', ios: 'Didot' });

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(14);
  const [year, setYear] = useState(CURRENT_YEAR - 25);
  const [birthHour, setBirthHour] = useState(12);
  const [birthTimeWindow, setBirthTimeWindow] = useState<BirthTimeWindow | null>('Afternoon');
  const [birthPlace, setBirthPlace] = useState('');
  const sceneY = useRef(new Animated.Value(0)).current;
  const sceneOpacity = useRef(new Animated.Value(1)).current;
  const sceneScale = useRef(new Animated.Value(1)).current;
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

    Animated.parallel([
      Animated.timing(sceneY, {
        duration: 210,
        easing: Easing.inOut(Easing.cubic),
        toValue: direction * 30,
        useNativeDriver: true,
      }),
      Animated.timing(sceneOpacity, { duration: 180, toValue: 0, useNativeDriver: true }),
      Animated.timing(sceneScale, { duration: 210, toValue: 0.985, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      sceneY.setValue(-direction * 38);
      sceneScale.setValue(0.99);
      Animated.parallel([
        Animated.spring(sceneY, { damping: 24, mass: 0.75, stiffness: 145, toValue: 0, useNativeDriver: true }),
        Animated.timing(sceneOpacity, { duration: 300, toValue: 1, useNativeDriver: true }),
        Animated.spring(sceneScale, { damping: 22, stiffness: 160, toValue: 1, useNativeDriver: true }),
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

  return (
    <View style={styles.background}>
      <CosmicBackdrop reveal={step === 4} />

      {step > 0 ? (
        <ProgressHeader
          currentStep={step}
          onBack={() => transitionTo(step - 1)}
        />
      ) : null}

      <Animated.View
        style={[
          styles.scene,
          { opacity: sceneOpacity, transform: [{ translateY: sceneY }, { scale: sceneScale }] },
        ]}
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
    </View>
  );
}

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.welcomeContent}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>NATAL</Text>
        <Text style={styles.brandMeta}>PRIVATE PROFILE  /  01—04</Text>
      </View>

      <View style={styles.welcomeCopy}>
        <View style={styles.welcomeIndexRow}>
          <Text style={styles.welcomeIndex}>01</Text>
          <View style={styles.welcomeIndexRule} />
          <Text style={styles.welcomeIndexLabel}>BEGIN HERE</Text>
        </View>
        <Text style={styles.welcomeTitle}>Know your place{`\n`}in the sky.</Text>
        <Text style={styles.welcomeBody}>
          A precise daily horoscope, shaped by the details of your birth.
        </Text>
      </View>

      <View>
        <PrimaryButton label="Create my profile" onPress={onContinue} />
        <View style={styles.descentHint}>
          <Text style={styles.descentText}>FOUR DETAILS</Text>
          <View style={styles.descentDot} />
          <Text style={styles.descentText}>PRIVATE BY DEFAULT</Text>
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
      eyebrow="01  /  DATE"
      title="Your date of birth"
      description="Set the exact date. Your sun sign updates as you move through the calendar."
    >
      <View style={styles.signPreview}>
        <Text style={styles.signPreviewSymbol}>{signSymbol}</Text>
        <View>
          <Text style={styles.signPreviewLabel}>SUN SIGN</Text>
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

      <PrimaryButton label="Next: birth time" onPress={onContinue} />
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
      eyebrow="02  /  TIME"
      title="Your birth time"
      description="Move the marker to the closest hour. An estimate is completely fine."
    >
      <View style={styles.orbitWrap}>
        <View {...panResponder.panHandlers} style={[styles.timeDial, { height: dialSize, width: dialSize }]}>
          <View style={styles.timeDialInner} />
          <View style={styles.orbitVertical} />
          <View style={styles.orbitHorizontal} />
          <Text style={[styles.orbitMarker, styles.orbitMarkerTop]}>MIDNIGHT</Text>
          <Text style={[styles.orbitMarker, styles.orbitMarkerRight]}>6 AM</Text>
          <Text style={[styles.orbitMarker, styles.orbitMarkerBottom]}>NOON</Text>
          <Text style={[styles.orbitMarker, styles.orbitMarkerLeft]}>6 PM</Text>
          <View style={[styles.sunKnob, { left: knobX, top: knobY }]}>
            <View style={styles.sunCore} />
          </View>
          <View style={styles.timeCenter}>
            <Text style={styles.timeValue}>{formatHour(hour)}</Text>
            <Text style={styles.timeWindow}>{value ?? 'Unknown'}</Text>
          </View>
        </View>
      </View>

      <PrimaryButton label="Next: birthplace" onPress={onContinue} />
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
        eyebrow="03  /  PLACE"
        title="Your birthplace"
        description="Enter a city and country. You can skip this and add it later."
      >
        <CoordinateField />
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
        <PrimaryButton label={value.trim() ? 'Review profile' : 'Skip for now'} onPress={onContinue} />
      </StepShell>
    </KeyboardAvoidingView>
  );
}

function CoordinateField() {
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, { duration: 3600, easing: Easing.inOut(Easing.cubic), toValue: 1, useNativeDriver: true }),
        Animated.timing(scan, { duration: 3600, easing: Easing.inOut(Easing.cubic), toValue: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scan]);

  return (
    <View style={styles.coordinateStage}>
      {[1, 2, 3, 4].map((index) => (
        <View key={`h-${index}`} style={[styles.coordinateHorizontal, { top: `${index * 20}%` }]} />
      ))}
      {[1, 2, 3, 4, 5].map((index) => (
        <View key={`v-${index}`} style={[styles.coordinateVertical, { left: `${index * 16.66}%` }]} />
      ))}
      <View style={styles.coordinateOrbitOuter} />
      <View style={styles.coordinateOrbitInner} />
      <View style={styles.coordinateCrossHorizontal} />
      <View style={styles.coordinateCrossVertical} />
      <View style={styles.coordinateTarget} />
      <Animated.View
        style={[
          styles.coordinateScan,
          { transform: [{ translateX: scan.interpolate({ inputRange: [0, 1], outputRange: [-130, 130] }) }] },
        ]}
      />
      <Text style={styles.coordinateLabelLeft}>LATITUDE</Text>
      <Text style={styles.coordinateLabelRight}>LONGITUDE</Text>
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
        <Text style={styles.revealEyebrow}>04  /  YOUR SUN SIGN</Text>
        <Animated.View style={{ transform: [{ translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }}>
          <Astrolabe size={270} symbol={sign.symbol} />
        </Animated.View>
      </View>

      <View style={styles.revealCard}>
        <Text style={styles.revealIntro}>Your profile begins with</Text>
        <Text style={styles.revealName}>{sign.name}</Text>
        <Text style={styles.revealMeta}>{sign.dates}  ·  {sign.element}</Text>
        <View style={styles.divider} />
        <ProfileLine
          label="Born"
          value={birthDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
        />
        <ProfileLine label="Time" value={birthTimeWindow ?? 'Not provided'} />
        <ProfileLine label="Place" value={birthPlace.trim() || 'Not provided'} />
        <PrimaryButton label="View today’s reading" onPress={onFinish} />
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
}: {
  currentStep: number;
  onBack: () => void;
}) {
  return (
    <View style={styles.progressHeader}>
      <Pressable accessibilityLabel="Go back" hitSlop={12} onPress={onBack} style={styles.backButton}>
        <Text style={styles.back}>BACK</Text>
      </Pressable>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(currentStep / TOTAL_STEPS) * 100}%` }]} />
      </View>
      <Text style={styles.headerSign}>0{currentStep} / 04</Text>
    </View>
  );
}

function CosmicBackdrop({ reveal }: { reveal: boolean }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.backdropGlow, styles.backdropGlowTop, reveal && styles.backdropGlowReveal]} />
      <View style={[styles.backdropGlow, styles.backdropGlowBottom]} />
      <View style={styles.backdropArcLarge} />
      <View style={styles.backdropArcSmall} />
      <View style={styles.backdropAxisVertical} />
      <View style={styles.backdropAxisHorizontal} />
      {[
        [8, 13, 2], [22, 8, 1], [44, 16, 2], [79, 11, 1], [91, 24, 2],
        [14, 38, 1], [72, 43, 2], [89, 56, 1], [8, 67, 2], [34, 77, 1],
        [65, 83, 2], [93, 89, 1], [19, 94, 1],
      ].map(([left, top, size], index) => (
        <View key={index} style={[styles.star, { height: size, left: `${left}%`, top: `${top}%`, width: size }]} />
      ))}
      <View style={[styles.constellationLine, { left: '72%', top: '18%', transform: [{ rotate: '28deg' }] }]} />
      <View style={[styles.constellationLine, { left: '78%', top: '23%', transform: [{ rotate: '-38deg' }] }]} />
      <View style={[styles.constellationNode, { left: '71%', top: '17.5%' }]} />
      <View style={[styles.constellationNode, { left: '82%', top: '25%' }]} />
    </View>
  );
}

function Astrolabe({ size, symbol }: { size: number; symbol: string }) {
  const rotation = useRef(new Animated.Value(0)).current;
  const center = size / 2;
  const outerRadius = size / 2 - 8;
  const innerSize = size * 0.68;
  const coreSize = size * 0.37;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        duration: 24000,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  return (
    <View style={[styles.astrolabe, { height: size, width: size }]}>
      <View style={[styles.astrolabeGlow, { borderRadius: center, height: size, width: size }]} />
      <Animated.View
        style={[
          styles.astrolabeOuterRing,
          {
            borderRadius: center,
            height: size - 8,
            left: 4,
            top: 4,
            transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
            width: size - 8,
          },
        ]}
      >
        {Array.from({ length: 32 }, (_, index) => {
          const angle = (index / 32) * Math.PI * 2;
          const major = index % 4 === 0;
          return (
            <View
              key={index}
              style={[
                styles.astrolabeTick,
                major && styles.astrolabeTickMajor,
                {
                  left: center - 4 + Math.cos(angle) * outerRadius,
                  top: center - 4 + Math.sin(angle) * outerRadius,
                  transform: [{ rotate: `${(index / 32) * 360 + 90}deg` }],
                },
              ]}
            />
          );
        })}
      </Animated.View>
      <Animated.View
        style={[
          styles.astrolabeInnerRing,
          {
            borderRadius: innerSize / 2,
            height: innerSize,
            left: (size - innerSize) / 2,
            top: (size - innerSize) / 2,
            transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] }) }],
            width: innerSize,
          },
        ]}
      >
        <View style={styles.astrolabeInnerAxisOne} />
        <View style={styles.astrolabeInnerAxisTwo} />
      </Animated.View>
      <View style={[styles.astrolabeCrossVertical, { height: size - 40, left: center - 0.5, top: 20 }]} />
      <View style={[styles.astrolabeCrossHorizontal, { left: 20, top: center - 0.5, width: size - 40 }]} />
      <View
        style={[
          styles.astrolabeCore,
          { borderRadius: coreSize / 2, height: coreSize, left: (size - coreSize) / 2, top: (size - coreSize) / 2, width: coreSize },
        ]}
      >
        <Text style={[styles.astrolabeSymbol, { fontSize: coreSize * 0.54 }]}>{symbol}</Text>
      </View>
    </View>
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
  background: { backgroundColor: '#060708', flex: 1, overflow: 'hidden' },
  scene: { flex: 1 },
  star: { backgroundColor: '#d9c89f', borderRadius: 99, opacity: 0.28, position: 'absolute' },
  backdropGlow: { borderWidth: 1, position: 'absolute', shadowOffset: { height: 0, width: 0 } },
  backdropGlowTop: { backgroundColor: 'rgba(168,145,94,0.025)', borderColor: 'rgba(203,181,128,0.09)', borderRadius: 230, height: 460, right: -240, shadowColor: '#b49b66', shadowOpacity: 0.06, shadowRadius: 70, top: -170, width: 460 },
  backdropGlowBottom: { backgroundColor: 'rgba(255,255,255,0.012)', borderColor: 'rgba(255,255,255,0.05)', borderRadius: 240, bottom: -300, height: 480, left: -260, shadowColor: '#ffffff', shadowOpacity: 0.03, shadowRadius: 90, width: 480 },
  backdropGlowReveal: { backgroundColor: 'rgba(183,157,96,0.04)', borderColor: 'rgba(215,190,130,0.12)' },
  backdropArcLarge: { borderColor: 'rgba(209,188,139,0.06)', borderRadius: 270, borderWidth: 1, height: 540, left: -360, position: 'absolute', top: 120, width: 540 },
  backdropArcSmall: { borderColor: 'rgba(255,255,255,0.045)', borderRadius: 130, borderWidth: 1, bottom: 110, height: 260, position: 'absolute', right: -180, width: 260 },
  backdropAxisVertical: { backgroundColor: 'rgba(255,255,255,0.018)', bottom: 0, left: '50%', position: 'absolute', top: 0, width: 1 },
  backdropAxisHorizontal: { backgroundColor: 'rgba(255,255,255,0.014)', height: 1, left: 0, position: 'absolute', right: 0, top: '52%' },
  constellationLine: { backgroundColor: 'rgba(213,196,147,0.1)', height: 1, position: 'absolute', width: 48 },
  constellationNode: { backgroundColor: '#b8a271', borderRadius: 2, height: 3, position: 'absolute', width: 3 },

  astrolabe: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  astrolabeGlow: { backgroundColor: 'rgba(177,151,93,0.012)', borderColor: 'rgba(223,202,146,0.06)', borderWidth: 1, position: 'absolute' },
  astrolabeOuterRing: { borderColor: 'rgba(196,169,109,0.7)', borderWidth: 1, position: 'absolute' },
  astrolabeInnerRing: { borderColor: 'rgba(196,169,109,0.34)', borderWidth: 1, position: 'absolute' },
  astrolabeTick: { backgroundColor: 'rgba(196,169,109,0.38)', height: 1, position: 'absolute', width: 4 },
  astrolabeTickMajor: { backgroundColor: '#bda468', width: 9 },
  astrolabeInnerAxisOne: { backgroundColor: 'rgba(196,169,109,0.24)', height: 1, left: '8%', position: 'absolute', right: '8%', top: '50%', transform: [{ rotate: '27deg' }] },
  astrolabeInnerAxisTwo: { backgroundColor: 'rgba(196,169,109,0.16)', bottom: '8%', left: '50%', position: 'absolute', top: '8%', transform: [{ rotate: '-27deg' }], width: 1 },
  astrolabeCrossVertical: { backgroundColor: 'rgba(196,169,109,0.12)', position: 'absolute', width: 1 },
  astrolabeCrossHorizontal: { backgroundColor: 'rgba(196,169,109,0.12)', height: 1, position: 'absolute' },
  astrolabeCore: { alignItems: 'center', backgroundColor: '#08090a', borderColor: 'rgba(196,169,109,0.62)', borderWidth: 1, justifyContent: 'center', position: 'absolute' },
  astrolabeSymbol: { color: '#cbb477', fontFamily: DISPLAY_FONT, fontWeight: '400' },

  welcomeContent: { flex: 1, justifyContent: 'space-between', paddingBottom: 26, paddingHorizontal: 26, paddingTop: 24 },
  brandRow: { alignItems: 'center', borderBottomColor: 'rgba(255,255,255,0.1)', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 15 },
  brand: { color: '#d2bd86', fontSize: 12, fontWeight: '700', letterSpacing: 4.8 },
  brandMeta: { color: '#676767', fontSize: 8, fontWeight: '700', letterSpacing: 1.25 },
  welcomeCopy: { marginTop: 16 },
  welcomeIndexRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 24 },
  welcomeIndex: { color: '#b49c64', fontFamily: DISPLAY_FONT, fontSize: 38, lineHeight: 40 },
  welcomeIndexRule: { backgroundColor: 'rgba(196,169,109,0.42)', height: 1, marginHorizontal: 14, width: 44 },
  welcomeIndexLabel: { color: '#747474', fontSize: 8, fontWeight: '700', letterSpacing: 2 },
  welcomeTitle: { color: '#f0ede6', fontFamily: DISPLAY_FONT, fontSize: 52, fontWeight: '400', letterSpacing: -1.7, lineHeight: 55 },
  welcomeBody: { color: '#989898', fontSize: 15, lineHeight: 23, marginTop: 22, maxWidth: 300 },
  descentHint: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  descentDot: { backgroundColor: '#77705f', borderRadius: 2, height: 3, marginHorizontal: 10, width: 3 },
  descentText: { color: '#666666', fontSize: 8, fontWeight: '700', letterSpacing: 1.6 },

  progressHeader: { alignItems: 'center', flexDirection: 'row', gap: 14, paddingHorizontal: 24, paddingVertical: 15, zIndex: 10 },
  backButton: { alignItems: 'flex-start', height: 30, justifyContent: 'center', width: 48 },
  back: { color: '#8b8b88', fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
  progressTrack: { backgroundColor: 'rgba(255,255,255,0.09)', flex: 1, height: 1, overflow: 'hidden' },
  progressFill: { backgroundColor: '#b9a064', height: 1 },
  headerSign: { color: '#8b8b88', fontSize: 8, fontWeight: '700', letterSpacing: 1, textAlign: 'right', width: 48 },
  stepContent: { flexGrow: 1, paddingBottom: 30, paddingHorizontal: 26, paddingTop: 14 },
  eyebrow: { color: '#a9915d', fontSize: 9, fontWeight: '800', letterSpacing: 2.4 },
  questionTitle: { color: '#efede7', fontFamily: DISPLAY_FONT, fontSize: 42, fontWeight: '400', letterSpacing: -1.25, lineHeight: 45, marginTop: 11 },
  questionDescription: { color: '#8d8d8b', fontSize: 14, lineHeight: 21, marginTop: 13, maxWidth: 340 },
  answerArea: { flex: 1, justifyContent: 'flex-end', minHeight: 440, paddingTop: 20 },

  signPreview: { alignItems: 'center', alignSelf: 'flex-start', borderLeftColor: '#b49b63', borderLeftWidth: 1, flexDirection: 'row', marginBottom: 16, paddingLeft: 13, paddingVertical: 3 },
  signPreviewSymbol: { color: '#bda66e', fontFamily: DISPLAY_FONT, fontSize: 26, marginRight: 12 },
  signPreviewLabel: { color: '#666664', fontSize: 7, fontWeight: '800', letterSpacing: 1.6 },
  signPreviewName: { color: '#dedbd4', fontFamily: DISPLAY_FONT, fontSize: 17, marginTop: 1 },
  wheelFrame: { backgroundColor: 'rgba(10,11,12,0.9)', borderBottomColor: 'rgba(255,255,255,0.14)', borderBottomWidth: 1, borderTopColor: 'rgba(255,255,255,0.14)', borderTopWidth: 1, flexDirection: 'row', height: 180, overflow: 'hidden', paddingHorizontal: 5, position: 'relative' },
  wheelContent: { paddingVertical: 65 },
  wheelItem: { alignItems: 'center', height: WHEEL_ITEM_HEIGHT, justifyContent: 'center', paddingHorizontal: 3 },
  wheelItemText: { color: '#4f4f4e', fontFamily: DISPLAY_FONT, fontSize: 16 },
  wheelItemTextSelected: { color: '#e9e5db', fontSize: 19 },
  wheelFocus: { backgroundColor: 'rgba(185,160,100,0.025)', borderBottomColor: 'rgba(185,160,100,0.32)', borderBottomWidth: 1, borderTopColor: 'rgba(185,160,100,0.32)', borderTopWidth: 1, height: WHEEL_ITEM_HEIGHT, left: 5, position: 'absolute', right: 5, top: 65 },

  orbitWrap: { alignItems: 'center', marginBottom: 8 },
  timeDial: { alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(8,9,10,0.84)', borderColor: 'rgba(185,160,100,0.36)', borderRadius: 126, borderWidth: 1, justifyContent: 'center', position: 'relative' },
  timeDialInner: { borderColor: 'rgba(255,255,255,0.11)', borderRadius: 83, borderWidth: 1, height: 166, position: 'absolute', width: 166 },
  orbitVertical: { backgroundColor: 'rgba(255,255,255,0.055)', height: 166, position: 'absolute', width: 1 },
  orbitHorizontal: { backgroundColor: 'rgba(255,255,255,0.055)', height: 1, position: 'absolute', width: 166 },
  orbitMarker: { color: '#5c5c5a', fontSize: 6, fontWeight: '800', letterSpacing: 1.1, position: 'absolute' },
  orbitMarkerTop: { top: 14 },
  orbitMarkerRight: { right: 8, top: 121 },
  orbitMarkerBottom: { bottom: 14 },
  orbitMarkerLeft: { left: 9, top: 121 },
  sunKnob: { alignItems: 'center', backgroundColor: '#08090a', borderColor: '#c0a869', borderRadius: 24, borderWidth: 1, height: 48, justifyContent: 'center', position: 'absolute', width: 48 },
  sunCore: { backgroundColor: '#bda467', borderRadius: 5, height: 10, width: 10 },
  timeCenter: { alignItems: 'center' },
  timeValue: { color: '#e8e4dc', fontFamily: DISPLAY_FONT, fontSize: 28, letterSpacing: -0.5 },
  timeWindow: { color: '#9e8856', fontSize: 8, fontWeight: '800', letterSpacing: 1.5, marginTop: 3, textTransform: 'uppercase' },

  coordinateStage: { alignSelf: 'center', backgroundColor: 'rgba(8,9,10,0.62)', borderColor: 'rgba(255,255,255,0.11)', borderWidth: 1, height: 176, marginBottom: 14, overflow: 'hidden', position: 'relative', width: '100%' },
  coordinateHorizontal: { backgroundColor: 'rgba(255,255,255,0.045)', height: 1, left: 0, position: 'absolute', right: 0 },
  coordinateVertical: { backgroundColor: 'rgba(255,255,255,0.045)', bottom: 0, position: 'absolute', top: 0, width: 1 },
  coordinateOrbitOuter: { borderColor: 'rgba(185,160,100,0.28)', borderRadius: 70, borderWidth: 1, height: 140, left: '50%', marginLeft: -70, marginTop: -70, position: 'absolute', top: '50%', width: 140 },
  coordinateOrbitInner: { borderColor: 'rgba(255,255,255,0.1)', borderRadius: 43, borderWidth: 1, height: 86, left: '50%', marginLeft: -43, marginTop: -43, position: 'absolute', top: '50%', width: 86 },
  coordinateCrossHorizontal: { backgroundColor: 'rgba(185,160,100,0.3)', height: 1, left: '28%', position: 'absolute', right: '28%', top: '50%' },
  coordinateCrossVertical: { backgroundColor: 'rgba(185,160,100,0.3)', bottom: '18%', left: '50%', position: 'absolute', top: '18%', width: 1 },
  coordinateTarget: { backgroundColor: '#b9a064', borderRadius: 3, height: 5, left: '50%', marginLeft: -2.5, marginTop: -2.5, position: 'absolute', top: '50%', width: 5 },
  coordinateScan: { backgroundColor: 'rgba(185,160,100,0.2)', bottom: 0, left: '50%', position: 'absolute', top: 0, width: 1 },
  coordinateLabelLeft: { bottom: 8, color: '#555553', fontSize: 6, fontWeight: '700', left: 9, letterSpacing: 1.3, position: 'absolute' },
  coordinateLabelRight: { bottom: 8, color: '#555553', fontSize: 6, fontWeight: '700', letterSpacing: 1.3, position: 'absolute', right: 9 },
  placeField: { alignItems: 'center', backgroundColor: 'rgba(8,9,10,0.9)', borderBottomColor: 'rgba(255,255,255,0.18)', borderBottomWidth: 1, flexDirection: 'row', paddingHorizontal: 4 },
  placePin: { color: '#9f8958', fontSize: 16, marginRight: 10 },
  placeInput: { color: '#e7e3db', flex: 1, fontSize: 16, paddingVertical: 15 },
  citySuggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 10 },
  cityChip: { borderColor: 'rgba(255,255,255,0.11)', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  cityChipText: { color: '#888886', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },

  revealContent: { flex: 1, justifyContent: 'flex-end', paddingBottom: 24, paddingHorizontal: 22 },
  revealTop: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingTop: 10 },
  revealEyebrow: { color: '#a8905b', fontSize: 9, fontWeight: '800', letterSpacing: 2.4, marginBottom: 18 },
  revealCard: { borderTopColor: 'rgba(185,160,100,0.34)', borderTopWidth: 1, paddingHorizontal: 2, paddingTop: 20 },
  revealIntro: { color: '#777775', fontSize: 11, letterSpacing: 0.4, textAlign: 'center' },
  revealName: { color: '#efebe3', fontFamily: DISPLAY_FONT, fontSize: 43, fontWeight: '400', letterSpacing: -1, marginTop: 1, textAlign: 'center' },
  revealMeta: { color: '#a38c59', fontSize: 9, fontWeight: '700', letterSpacing: 1.3, marginTop: 5, textAlign: 'center', textTransform: 'uppercase' },
  divider: { backgroundColor: 'rgba(255,255,255,0.1)', height: 1, marginVertical: 14 },
  profileLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, width: '100%' },
  profileLabel: { color: '#777386', fontSize: 12 },
  profileValue: { color: '#ded9e5', flex: 1, fontSize: 12, fontWeight: '600', marginLeft: 20, textAlign: 'right' },

  primaryButton: { alignItems: 'center', backgroundColor: '#e8e4db', flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, minHeight: 56, paddingHorizontal: 18 },
  primaryButtonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  primaryButtonLabel: { color: '#111212', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  primaryButtonArrow: { color: '#111212', fontSize: 18, fontWeight: '400' },
  textButton: { alignItems: 'center', padding: 13 },
  textButtonLabel: { color: '#aaa4b5', fontSize: 13, fontWeight: '600' },
});
