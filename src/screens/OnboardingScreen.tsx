import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AstrologicalGlobe } from '../components/AstrologicalGlobe';
import { AppProfile, BirthTimeWindow } from '../types/profile';
import { getZodiacSign, toLocalDateString } from '../utils/astrology';
import { Coordinates, GlobeSelection } from '../utils/geo';

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
const TOTAL_STEPS = 4;
const DISPLAY_FONT = Platform.select({ android: 'serif', default: 'serif', ios: 'Didot' });
const ZODIAC_GLYPHS = ['♈︎', '♉︎', '♊︎', '♋︎', '♌︎', '♍︎', '♎︎', '♏︎', '♐︎', '♑︎', '♒︎', '♓︎'];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [transitionTarget, setTransitionTarget] = useState<number | null>(null);
  const [sceneHeight, setSceneHeight] = useState(windowHeight - 60);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(14);
  const [year, setYear] = useState(CURRENT_YEAR - 25);
  const [birthHour, setBirthHour] = useState(12);
  const [birthMinute, setBirthMinute] = useState(0);
  const [birthTimeWindow, setBirthTimeWindow] = useState<BirthTimeWindow | null>('Afternoon');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthCoordinates, setBirthCoordinates] = useState<Coordinates | null>(null);
  const verticalProgress = useRef(new Animated.Value(0)).current;
  const transitionDirection = useRef<1 | -1>(1);
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
    transitionDirection.current = nextStep > step ? 1 : -1;
    verticalProgress.setValue(0);
    setTransitionTarget(nextStep);

    requestAnimationFrame(() => {
      Animated.timing(verticalProgress, {
        duration: 680,
        easing: Easing.inOut(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }).start(() => {
        setStep(nextStep);
        setTransitionTarget(null);
        verticalProgress.setValue(0);
        isTransitioning.current = false;
      });
    });
  }

  function updateBirthTime(hour: number | null, minute = 0) {
    if (hour === null) {
      setBirthTimeWindow(null);
      return;
    }

    setBirthHour(hour);
    setBirthMinute(minute);
    setBirthTimeWindow(timeWindowForHour(hour));
  }

  async function finish() {
    await onComplete({
      birthCoordinates,
      birthDate: toLocalDateString(birthDate),
      birthPlace: birthPlace.trim() || null,
      birthTime: birthTimeWindow ? toStoredTime(birthHour, birthMinute) : null,
      birthTimeWindow,
      createdAt: new Date().toISOString(),
      zodiacSignId: sign.id,
    });
  }

  function renderStep(stepNumber: number) {
    if (stepNumber === 0) return <WelcomeStep onContinue={() => transitionTo(1)} />;
    if (stepNumber === 1) {
      return (
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
      );
    }
    if (stepNumber === 2) {
      return (
        <TimeOrbitStep
          hour={birthHour}
          minute={birthMinute}
          onChange={updateBirthTime}
          onContinue={() => transitionTo(3)}
          value={birthTimeWindow}
        />
      );
    }
    if (stepNumber === 3) {
      return (
        <PlaceGlobeStep
          onContinue={() => transitionTo(4)}
          onSkip={() => {
            setBirthCoordinates(null);
            setBirthPlace('');
            transitionTo(4);
          }}
          onSelection={(selection) => {
            setBirthCoordinates({ latitude: selection.latitude, longitude: selection.longitude });
            setBirthPlace(`${selection.city.name}, ${selection.city.country}`);
          }}
          value={birthPlace}
        />
      );
    }

    return (
      <RevealStep
        birthDate={birthDate}
        birthPlace={birthPlace}
        birthHour={birthHour}
        birthMinute={birthMinute}
        birthTimeWindow={birthTimeWindow}
        onFinish={() => void finish()}
        sign={sign}
      />
    );
  }

  return (
    <View style={styles.background}>
      <CosmicBackdrop reveal={(transitionTarget ?? step) === 4} />

      <View style={styles.progressSlot}>
        {(transitionTarget ?? step) > 0 ? (
          <ProgressHeader
            currentStep={transitionTarget ?? step}
            onBack={() => transitionTo(step - 1)}
          />
        ) : null}
      </View>

      <View
        onLayout={(event) => setSceneHeight(event.nativeEvent.layout.height)}
        style={styles.sceneViewport}
      >
        <Animated.View
          pointerEvents={transitionTarget === null ? 'auto' : 'none'}
          style={[
            styles.transitionScene,
            transitionTarget !== null && {
              transform: [{
                translateY: verticalProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -transitionDirection.current * sceneHeight],
                }),
              }],
            },
          ]}
        >
          {renderStep(step)}
        </Animated.View>

        {transitionTarget !== null ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.transitionScene,
              {
                transform: [{
                  translateY: verticalProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [transitionDirection.current * sceneHeight, 0],
                  }),
                }],
              },
            ]}
          >
            {renderStep(transitionTarget)}
          </Animated.View>
        ) : null}

        {transitionTarget !== null ? (
          <DepthTrails direction={transitionDirection.current} progress={verticalProgress} />
        ) : null}
      </View>
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
  }, [items.length]);

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
        onScrollEndDrag={(event) => {
          if (Math.abs(event.nativeEvent.velocity?.y ?? 0) < 0.05) {
            settle(event.nativeEvent.contentOffset.y);
          }
        }}
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
  minute,
  onChange,
  onContinue,
  value,
}: {
  hour: number;
  minute: number;
  onChange: (hour: number | null, minute?: number) => void;
  onContinue: () => void;
  value: BirthTimeWindow | null;
}) {
  const { height, width } = useWindowDimensions();
  const dialSize = Math.min(width - 72, height < 700 ? 160 : height < 780 ? 190 : height < 850 ? 218 : 238);
  const center = dialSize / 2;
  const isPm = hour >= 12;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;
  const hourHandRotation = useRef(new Animated.Value(hourAngle)).current;
  const minuteHandRotation = useRef(new Animated.Value(minuteAngle)).current;
  const tickRadius = center - 14;
  const zodiacRadius = center - 31;
  const numeralRadius = Math.max(30, center - 58);
  const hourOnClock = hour % 12 || 12;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(hourHandRotation, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
        toValue: hourAngle,
        useNativeDriver: true,
      }),
      Animated.timing(minuteHandRotation, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
        toValue: minuteAngle,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hourAngle, hourHandRotation, minuteAngle, minuteHandRotation]);

  return (
    <View style={styles.timeStepContent}>
      <View>
        <Text style={styles.eyebrow}>02  /  TIME</Text>
        <Text style={styles.questionTitle}>Your birth time</Text>
        <Text style={styles.questionDescription}>
          Scroll each wheel to the closest time you know. Five-minute precision is enough.
        </Text>
      </View>

      <View style={styles.timeInteraction}>
        <View pointerEvents="none" style={styles.orbitWrap}>
          <View style={[styles.timeDial, { borderRadius: center, height: dialSize, width: dialSize }]}>
          <View style={[styles.clockInnerRing, { borderRadius: dialSize * 0.39, height: dialSize * 0.78, left: dialSize * 0.11, top: dialSize * 0.11, width: dialSize * 0.78 }]} />
          <View style={[styles.clockCenterRing, { borderRadius: dialSize * 0.25, height: dialSize * 0.5, left: dialSize * 0.25, top: dialSize * 0.25, width: dialSize * 0.5 }]} />

          {Array.from({ length: 60 }, (_, index) => {
            const angle = (index / 60) * Math.PI * 2 - Math.PI / 2;
            const isHour = index % 5 === 0;
            return (
              <View
                key={`tick-${index}`}
                style={[
                  styles.clockTick,
                  isHour && styles.clockTickHour,
                  {
                    left: center + Math.cos(angle) * tickRadius - (isHour ? 5 : 2),
                    top: center + Math.sin(angle) * tickRadius,
                    transform: [{ rotate: `${index * 6 + 90}deg` }],
                  },
                ]}
              />
            );
          })}

          {ZODIAC_GLYPHS.map((glyph, index) => {
            const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
            return (
              <Text
                key={glyph}
                style={[
                  styles.clockZodiac,
                  {
                    left: center + Math.cos(angle) * zodiacRadius - 9,
                    top: center + Math.sin(angle) * zodiacRadius - 10,
                  },
                ]}
              >
                {glyph}
              </Text>
            );
          })}

          {[12, 3, 6, 9].map((number, index) => {
            const angle = (index / 4) * Math.PI * 2 - Math.PI / 2;
            return (
              <Text
                key={number}
                style={[
                  styles.clockNumeral,
                  {
                    left: center + Math.cos(angle) * numeralRadius - 9,
                    top: center + Math.sin(angle) * numeralRadius - 9,
                  },
                ]}
              >
                {number}
              </Text>
            );
          })}

          <Animated.View
            style={[
              styles.clockHandLayer,
              {
                height: dialSize,
                transform: [{ rotate: hourHandRotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }],
                width: dialSize,
              },
            ]}
          >
            <View style={[styles.clockHourHand, { height: dialSize * 0.2, left: center - 1, top: dialSize * 0.3 }]} />
          </Animated.View>
          <Animated.View
            style={[
              styles.clockHandLayer,
              {
                height: dialSize,
                transform: [{ rotate: minuteHandRotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }],
                width: dialSize,
              },
            ]}
          >
            <View style={[styles.clockMinuteHand, { height: dialSize * 0.29, left: center - 0.5, top: dialSize * 0.21 }]} />
          </Animated.View>
          <View style={styles.timeCenter}>
            <Text style={styles.timeValue}>{formatExactTime(hour, minute)}</Text>
            <Text style={styles.timeWindow}>{value ?? 'Unknown'}</Text>
          </View>
          <View style={[styles.clockPin, { left: center - 4, top: center - 4 }]} />
          </View>
        </View>

        <View style={styles.timeWheelSection}>
          <View style={styles.timeWheelLabels}>
            <Text style={[styles.timeWheelLabel, { flex: 1 }]}>HOUR</Text>
            <Text style={[styles.timeWheelLabel, { flex: 1 }]}>MINUTE</Text>
            <Text style={[styles.timeWheelLabel, { flex: 0.82 }]}>PERIOD</Text>
          </View>
          <View style={styles.timeWheelFrame}>
            <View pointerEvents="none" style={styles.timeWheelFocus} />
            <TimeWheelPicker
              accessibilityLabel="Birth hour"
              flex={1}
              items={Array.from({ length: 12 }, (_, index) => String(index + 1))}
              onChange={(index) => onChange((index + 1) % 12 + (isPm ? 12 : 0), minute)}
              selectedIndex={hourOnClock - 1}
            />
            <TimeWheelPicker
              accessibilityLabel="Birth minute"
              flex={1}
              items={Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'))}
              onChange={(index) => onChange(hour, index * 5)}
              selectedIndex={minute / 5}
            />
            <TimeWheelPicker
              accessibilityLabel="AM or PM"
              flex={0.82}
              items={['AM', 'PM']}
              onChange={(index) => onChange((hour % 12) + (index === 1 ? 12 : 0), minute)}
              selectedIndex={isPm ? 1 : 0}
            />
          </View>
        </View>

        <View>
          <PrimaryButton label={`Use ${formatExactTime(hour, minute)}`} onPress={onContinue} />
          <Pressable
            onPress={() => {
              onChange(null);
              onContinue();
            }}
            style={styles.textButton}
          >
            <Text style={styles.textButtonLabel}>I don’t know my birth time</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const TIME_WHEEL_ITEM_HEIGHT = 42;

function TimeWheelPicker({
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
      scrollRef.current?.scrollTo({ animated: false, y: selectedIndex * TIME_WHEEL_ITEM_HEIGHT });
    });
  }, [items.length]);

  function settle(offsetY: number) {
    const index = Math.max(0, Math.min(items.length - 1, Math.round(offsetY / TIME_WHEEL_ITEM_HEIGHT)));
    onChange(index);
  }

  return (
    <View style={{ flex }}>
      <ScrollView
        accessibilityLabel={accessibilityLabel}
        bounces={false}
        contentContainerStyle={styles.timeWheelContent}
        decelerationRate="fast"
        directionalLockEnabled
        nestedScrollEnabled
        onMomentumScrollEnd={(event) => settle(event.nativeEvent.contentOffset.y)}
        onScroll={(event) => {
          const index = Math.max(
            0,
            Math.min(items.length - 1, Math.round(event.nativeEvent.contentOffset.y / TIME_WHEEL_ITEM_HEIGHT)),
          );
          if (index !== selectedIndex) onChange(index);
        }}
        onScrollEndDrag={(event) => {
          if (Math.abs(event.nativeEvent.velocity?.y ?? 0) < 0.05) {
            settle(event.nativeEvent.contentOffset.y);
          }
        }}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        snapToAlignment="start"
        snapToInterval={TIME_WHEEL_ITEM_HEIGHT}
      >
        {items.map((item, index) => (
          <View key={item} style={styles.timeWheelItem}>
            <Text style={[styles.timeWheelItemText, index === selectedIndex && styles.timeWheelItemTextSelected]}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function PlaceGlobeStep({
  onContinue,
  onSkip,
  onSelection,
  value,
}: {
  onContinue: () => void;
  onSkip: () => void;
  onSelection: (selection: GlobeSelection) => void;
  value: string;
}) {
  const { height, width } = useWindowDimensions();
  const [globeArea, setGlobeArea] = useState({ height: 0, width: 0 });
  const maximumGlobeSize = width >= 430 ? 370 : width >= 390 ? 350 : 326;
  const globeSize = Math.floor(Math.min(
    globeArea.width || width - 36,
    globeArea.height ? Math.max(270, globeArea.height - 104) : height < 740 ? 300 : 340,
    maximumGlobeSize,
  ));

  return (
    <View style={styles.placeStepContent}>
      <View>
        <Text style={styles.eyebrow}>03  /  PLACE</Text>
        <Text style={styles.questionTitle}>Your birthplace</Text>
        <Text style={styles.questionDescription}>
          Rotate Earth until the gold target rests over your birthplace. Pinch to change altitude.
        </Text>
      </View>

      <View
        onLayout={(event) => {
          const { height: areaHeight, width: areaWidth } = event.nativeEvent.layout;
          setGlobeArea((current) => (
            current.height === areaHeight && current.width === areaWidth
              ? current
              : { height: areaHeight, width: areaWidth }
          ));
        }}
        style={styles.placeGlobeArea}
      >
        <AstrologicalGlobe onSelectionChange={onSelection} size={globeSize} />

        <View>
          {value ? <PrimaryButton label={`Use ${value}`} onPress={onContinue} /> : null}
          <Pressable onPress={onSkip} style={styles.textButton}>
            <Text style={styles.textButtonLabel}>{value ? 'Choose without birthplace' : 'Skip for now'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function RevealStep({
  birthDate,
  birthHour,
  birthMinute,
  birthPlace,
  birthTimeWindow,
  onFinish,
  sign,
}: {
  birthDate: Date;
  birthHour: number;
  birthMinute: number;
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
        <ProfileLine
          label="Time"
          value={birthTimeWindow ? `${formatExactTime(birthHour, birthMinute)} · ${birthTimeWindow}` : 'Not provided'}
        />
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

function DepthTrails({
  direction,
  progress,
}: {
  direction: 1 | -1;
  progress: Animated.Value;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.depthTrail,
            {
              left: `${9 + index * 14}%`,
              opacity: progress.interpolate({
                inputRange: [0, 0.18, 0.72, 1],
                outputRange: [0, 0.38, 0.22, 0],
              }),
              transform: [{
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [direction * 260 + index * 18, -direction * 460 - index * 22],
                }),
              }],
            },
          ]}
        />
      ))}
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

function formatExactTime(hour: number, minute: number) {
  const hourOnClock = hour % 12 || 12;
  return `${hourOnClock}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function toStoredTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: { backgroundColor: '#060708', flex: 1, overflow: 'hidden' },
  progressSlot: { height: 60, zIndex: 20 },
  sceneViewport: { flex: 1, overflow: 'hidden', position: 'relative' },
  transitionScene: { ...StyleSheet.absoluteFillObject },
  depthTrail: { backgroundColor: 'rgba(218,202,163,0.72)', borderRadius: 2, height: 110, position: 'absolute', top: '50%', width: 1 },
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

  timeStepContent: { flex: 1, paddingBottom: 18, paddingHorizontal: 26, paddingTop: 14 },
  timeInteraction: { flex: 1, justifyContent: 'space-between', paddingTop: 10 },
  orbitWrap: { alignItems: 'center', marginBottom: 8 },
  timeDial: { alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(7,8,9,0.95)', borderColor: 'rgba(193,167,104,0.55)', borderWidth: 1, justifyContent: 'center', position: 'relative' },
  clockInnerRing: { borderColor: 'rgba(193,167,104,0.18)', borderWidth: 1, position: 'absolute' },
  clockCenterRing: { borderColor: 'rgba(255,255,255,0.075)', borderWidth: 1, position: 'absolute' },
  clockTick: { backgroundColor: 'rgba(255,255,255,0.18)', height: 1, position: 'absolute', width: 4 },
  clockTickHour: { backgroundColor: 'rgba(193,167,104,0.72)', width: 10 },
  clockZodiac: { color: '#806f49', fontFamily: DISPLAY_FONT, fontSize: 12, height: 20, position: 'absolute', textAlign: 'center', width: 18 },
  clockNumeral: { color: '#77746d', fontFamily: DISPLAY_FONT, fontSize: 11, height: 18, position: 'absolute', textAlign: 'center', width: 18 },
  clockHandLayer: { left: 0, position: 'absolute', top: 0 },
  clockHourHand: { backgroundColor: '#d4c08b', position: 'absolute', width: 2 },
  clockMinuteHand: { backgroundColor: '#8b7a52', position: 'absolute', width: 1 },
  timeCenter: { alignItems: 'center', backgroundColor: '#08090a', borderColor: 'rgba(193,167,104,0.23)', borderRadius: 46, borderWidth: 1, justifyContent: 'center', minHeight: 82, minWidth: 92, paddingHorizontal: 9, position: 'absolute' },
  timeValue: { color: '#eee9df', fontFamily: DISPLAY_FONT, fontSize: 22, letterSpacing: -0.35 },
  timeWindow: { color: '#8f7b4e', fontSize: 7, fontWeight: '800', letterSpacing: 1.35, marginTop: 3, textTransform: 'uppercase' },
  clockPin: { backgroundColor: '#d8c38a', borderColor: '#08090a', borderRadius: 4, borderWidth: 2, height: 8, position: 'absolute', width: 8 },
  timeWheelSection: { marginTop: 4 },
  timeWheelLabels: { flexDirection: 'row', paddingBottom: 7, paddingHorizontal: 6 },
  timeWheelLabel: { color: '#585856', fontSize: 7, fontWeight: '800', letterSpacing: 1.35, textAlign: 'center' },
  timeWheelFrame: { backgroundColor: 'rgba(8,9,10,0.96)', borderBottomColor: 'rgba(255,255,255,0.14)', borderBottomWidth: 1, borderTopColor: 'rgba(255,255,255,0.14)', borderTopWidth: 1, flexDirection: 'row', height: 126, overflow: 'hidden', position: 'relative' },
  timeWheelFocus: { backgroundColor: 'rgba(193,167,104,0.035)', borderBottomColor: 'rgba(193,167,104,0.32)', borderBottomWidth: 1, borderTopColor: 'rgba(193,167,104,0.32)', borderTopWidth: 1, height: TIME_WHEEL_ITEM_HEIGHT, left: 4, position: 'absolute', right: 4, top: 42 },
  timeWheelContent: { paddingVertical: 42 },
  timeWheelItem: { alignItems: 'center', height: TIME_WHEEL_ITEM_HEIGHT, justifyContent: 'center' },
  timeWheelItemText: { color: '#50504e', fontFamily: DISPLAY_FONT, fontSize: 17 },
  timeWheelItemTextSelected: { color: '#eee9df', fontSize: 22 },

  placeStepContent: { flex: 1, paddingBottom: 18, paddingHorizontal: 18, paddingTop: 14 },
  placeGlobeArea: { flex: 1, justifyContent: 'space-between', paddingTop: 12 },

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
