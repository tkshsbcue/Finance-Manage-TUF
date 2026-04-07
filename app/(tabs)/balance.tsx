import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path as SvgPath,
  Circle as SvgCircle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Line,
  Rect,
} from 'react-native-svg';
import React, { useMemo, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// --- Header ---
function Header() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <Text style={{ color: '#000000', fontFamily: 'Inter_700Bold', fontSize: 16 }}>P</Text>
        </View>
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: -0.31 }}>PayU</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <Pressable>
          <FontAwesome name="search" size={18} color="#FFFFFF" />
        </Pressable>
        <Pressable>
          <View style={{ position: 'relative' }}>
            <FontAwesome name="bell-o" size={18} color="#FFFFFF" />
            <View style={{ position: 'absolute', top: -4, right: -6, backgroundColor: '#DC2626', borderRadius: 7, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 8, fontFamily: 'Inter_700Bold' }}>2</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ===== CREDIT SCORE GAUGE =====

// SVG uses standard math angles: 0° = right (3 o'clock), goes counter-clockwise
// We want a semi-circle opening upward: left end at ~210°, right end at ~330°
// SVG arc sweep-flag: 0 = CCW, 1 = CW. We draw CW from left to right.

const GW = 300;       // canvas width
const GH = 195;       // canvas height
const GCX = GW / 2;   // center x
const GCY = 155;      // center y (pushed down so arc is in upper portion)
const GR = 110;        // radius
const GSW = 18;        // stroke width
const GAP = 4;         // degrees gap between segments

// Angles in standard SVG degrees (0=right, CW positive)
// We want the arc to go from bottom-left to bottom-right, sweeping over the top
// In SVG: startAngle=150° (lower-left), sweeping CW by 240° to endAngle=30° (lower-right... wait)
// Actually, let's think in terms of SVG's arc:
// - 0° is 3 o'clock
// - 90° is 6 o'clock
// - 180° is 9 o'clock
// - 270° is 12 o'clock
// Our arc goes from ~7 o'clock (210° in clock terms) to ~5 o'clock (330° in clock terms)
// In SVG standard: 7 o'clock = 120°, 5 o'clock = 60°... this gets confusing.
// Let's just use the polar approach directly.

// Using angle measured from positive X-axis, counter-clockwise positive:
// Left end of arc: 215° (below horizontal left)
// Right end of arc: -35° (= 325°, below horizontal right)
// We sweep from 215° down to 325° going clockwise = sweep of 250° CW

const ARC_START_RAD = (215 * Math.PI) / 180;  // left end
const ARC_END_RAD = (-35 * Math.PI) / 180;    // right end
const ARC_TOTAL_DEG = 250;

function toXY(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: GCX + GR * Math.cos(rad),
    y: GCY - GR * Math.sin(rad), // SVG Y is inverted
  };
}

// SVG arc from angle A to angle B (degrees, math convention, CCW positive)
// We always draw CW (decreasing angle)
function svgArc(fromDeg: number, toDeg: number) {
  const p1 = toXY(fromDeg);
  const p2 = toXY(toDeg);
  let sweep = fromDeg - toDeg;
  if (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;
  // sweep-flag=1 means CW in SVG (which is decreasing angle in math convention)
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${GR} ${GR} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

const SEGMENTS = [
  { color: '#34d399', fraction: 0.28 },  // teal/green
  { color: '#f472b6', fraction: 0.24 },  // pink
  { color: '#93c5fd', fraction: 0.28 },  // blue
  { color: '#fcd34d', fraction: 0.20 },  // gold
];

function CreditScoreGauge({ score, maxScore = 850 }: { score: number; maxScore?: number }) {
  const normalizedScore = Math.min(Math.max(score / maxScore, 0), 1);
  const progress = useSharedValue(0);
  const gaugeScale = useSharedValue(0.85);
  const gaugeOpacity = useSharedValue(0);

  useEffect(() => {
    gaugeOpacity.value = withTiming(1, { duration: 400 });
    gaugeScale.value = withDelay(100, withSpring(1, { damping: 14, stiffness: 120, mass: 0.8 }));

    progress.value = withDelay(400, withSpring(normalizedScore, {
      damping: 15, stiffness: 40, mass: 1,
    }));

  }, [normalizedScore, score]);

  // Score text derives from the same progress value as the dot — perfectly in sync
  const scoreTextProps = useAnimatedProps(() => ({
    text: `${Math.round(progress.value * maxScore)}`,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: gaugeOpacity.value,
    transform: [{ scale: gaugeScale.value }],
  }));

  // Memoize all static SVG data so it never recalculates
  const { arcs, trackD } = useMemo(() => {
    const totalGaps = GAP * (SEGMENTS.length - 1);
    const usable = ARC_TOTAL_DEG - totalGaps;
    const a: { d: string; color: string }[] = [];
    let cursor = 215;
    for (let i = 0; i < SEGMENTS.length; i++) {
      const sweepDeg = SEGMENTS[i].fraction * usable;
      const endDeg = cursor - sweepDeg;
      a.push({ d: svgArc(cursor, endDeg), color: SEGMENTS[i].color });
      cursor = endDeg - GAP;
    }
    return { arcs: a, trackD: svgArc(215, -35) };
  }, []);

  // Single shared indicator position calc — reused by all circles
  const indicatorProps = useAnimatedProps(() => {
    const angleDeg = 215 - progress.value * ARC_TOTAL_DEG;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      cx: GCX + GR * Math.cos(rad),
      cy: GCY - GR * Math.sin(rad),
    };
  });

  return (
    <View style={{ alignItems: 'center', paddingVertical: 12 }}>
      <Animated.View style={[{ width: GW, height: GH }, containerStyle]}>
        <Svg width={GW} height={GH} viewBox={`0 0 ${GW} ${GH}`}>
          {/* Dotted background track */}
          <SvgPath
            d={trackD}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={GSW + 12}
            fill="none"
            strokeLinecap="butt"
            strokeDasharray="2 7"
          />

          {/* Colored segments */}
          {arcs.map((arc, i) => (
            <SvgPath
              key={i}
              d={arc.d}
              stroke={arc.color}
              strokeWidth={GSW}
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* Indicator — clean knob style */}
          {/* Shadow ring */}
          <AnimatedCircle animatedProps={indicatorProps} r={12} fill="rgba(0,0,0,0.4)" />
          {/* Outer colored ring */}
          <AnimatedCircle animatedProps={indicatorProps} r={10} fill="#0A0A0A" stroke="rgba(255,255,255,0.5)" strokeWidth={2.5} />
          {/* Inner bright dot */}
          <AnimatedCircle animatedProps={indicatorProps} r={4.5} fill="#FFFFFF" />
        </Svg>

        {/* Score number — zero re-renders, UI thread only */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 8, alignItems: 'center' }}>
          <AnimatedTextInput
            animatedProps={scoreTextProps}
            editable={false}
            defaultValue="0"
            style={{
              color: '#FFFFFF',
              fontFamily: 'Inter_700Bold',
              fontSize: 52,
              letterSpacing: -1,
              textAlign: 'center',
              padding: 0,
            }}
          />
        </View>
      </Animated.View>

      <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: -0.31, marginTop: 2 }}>
        Your Credit Score is average
      </Text>
      <Text style={{ color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 4 }}>
        Last Check on 21 Apr
      </Text>
    </View>
  );
}

// ===== BAR CHART =====

const CHART_HEIGHT = 160;
const CHART_WIDTH = 300;
const BAR_DATA = [
  [300, 200, 150],
  [400, 350, 250],
  [900, 300, 200],
  [350, 250, 200],
  [400, 300, 250],
  [350, 280, 200],
  [400, 300, 250],
];
const MAX_VALUE = 1000;
const Y_LABELS = [0, 200, 500, 1000];
const BAR_WIDTH_PX = 10;
const BAR_GAP_PX = 3;
const GROUP_W = BAR_WIDTH_PX * 3 + BAR_GAP_PX * 2;
const GROUP_GAP_PX = (CHART_WIDTH - BAR_DATA.length * GROUP_W) / (BAR_DATA.length + 1);
const FILLS = ['url(#gradTeal)', 'url(#gradGold)', 'url(#gradGray)'];

// Each bar is its own animated component — animates height + y on UI thread
const AnimatedRect = Animated.createAnimatedComponent(Rect);

function AnimatedBar({ x, targetHeight, fill, delay }: { x: number; targetHeight: number; fill: string; delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 80, mass: 0.6 })
    );
  }, []);

  const barProps = useAnimatedProps(() => {
    const h = targetHeight * progress.value;
    return {
      y: CHART_HEIGHT - h,
      height: h,
    };
  });

  return (
    <AnimatedRect
      animatedProps={barProps}
      x={x}
      y={CHART_HEIGHT}
      width={BAR_WIDTH_PX}
      height={0}
      rx={3}
      ry={3}
      fill={fill}
    />
  );
}

function BarChart() {
  const chartOpacity = useSharedValue(0);

  useEffect(() => {
    chartOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const chartStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
  }));

  // Precompute bar layout
  const bars = useMemo(() => {
    const result: { x: number; height: number; fill: string; delay: number; key: string }[] = [];
    BAR_DATA.forEach((group, gi) => {
      const groupX = GROUP_GAP_PX + gi * (GROUP_W + GROUP_GAP_PX);
      group.forEach((value, bi) => {
        const x = groupX + bi * (BAR_WIDTH_PX + BAR_GAP_PX);
        const h = (value / MAX_VALUE) * CHART_HEIGHT;
        // Stagger: each group delayed by 60ms, each bar within group by 30ms
        const delay = 200 + gi * 60 + bi * 30;
        result.push({ x, height: h, fill: FILLS[bi], delay, key: `${gi}-${bi}` });
      });
    });
    return result;
  }, []);

  return (
    <Animated.View style={[{ paddingHorizontal: 20, marginTop: 16 }, chartStyle]}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 36, height: CHART_HEIGHT, justifyContent: 'space-between', paddingBottom: 4 }}>
          {[...Y_LABELS].reverse().map((label) => (
            <Text key={label} style={{ color: '#525252', fontFamily: 'Inter_400Regular', fontSize: 10, textAlign: 'right' }}>
              ${label}
            </Text>
          ))}
        </View>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            <Defs>
              <SvgLinearGradient id="gradTeal" x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0" stopColor="#1a5c4a" />
                <Stop offset="1" stopColor="#34d399" />
              </SvgLinearGradient>
              <SvgLinearGradient id="gradGold" x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0" stopColor="#5c4a1a" />
                <Stop offset="1" stopColor="#fcd34d" />
              </SvgLinearGradient>
              <SvgLinearGradient id="gradGray" x1="0" y1="1" x2="0" y2="0">
                <Stop offset="0" stopColor="#2a2a2a" />
                <Stop offset="1" stopColor="#4a4a4a" />
              </SvgLinearGradient>
            </Defs>

            {Y_LABELS.map((label, i) => {
              const y = CHART_HEIGHT - (label / MAX_VALUE) * CHART_HEIGHT;
              return (
                <Line key={`grid-${i}`} x1={0} y1={y} x2={CHART_WIDTH} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} strokeDasharray="4 4" />
              );
            })}

            {bars.map((bar) => (
              <AnimatedBar key={bar.key} x={bar.x} targetHeight={bar.height} fill={bar.fill} delay={bar.delay} />
            ))}
          </Svg>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <Text style={{ color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 13 }}>
          Current margin: April Spendings
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#10b981', fontFamily: 'Inter_500Medium', fontSize: 13 }}>$350.00</Text>
          <Text style={{ color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 13 }}>  /  </Text>
          <Text style={{ color: '#3b82f6', fontFamily: 'Inter_500Medium', fontSize: 13 }}>$640.00</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ===== CURRENCY ITEM =====

function CurrencyItem({ code, name, flag }: { code: string; name: string; flag: string }) {
  return (
    <LinearGradient
      colors={['#262626', '#0A0A0A']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: 398,
        height: 85,
        borderRadius: 14,
        borderWidth: 0.53,
        borderColor: '#262626',
        paddingHorizontal: 16,
        gap: 8,
        alignSelf: 'center',
        marginBottom: 10,
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Text style={{ fontSize: 18 }}>{flag}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 24, letterSpacing: -0.31 }}>{code}</Text>
        <Text style={{ color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 }}>{name}</Text>
      </View>
      <Pressable style={{ marginRight: 14 }}>
        <FontAwesome name="star-o" size={18} color="#737373" />
      </Pressable>
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#262626',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 6,
          gap: 4,
        }}
      >
        <FontAwesome name="plus" size={11} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 13 }}>Enable</Text>
      </Pressable>
    </LinearGradient>
  );
}

// ===== FAB =====

function FloatingActionButton() {
  return (
    <Pressable
      style={{
        position: 'absolute',
        bottom: 16,
        right: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <FontAwesome name="plus" size={22} color="#0A0A0A" />
    </Pressable>
  );
}

// ===== MAIN SCREEN =====

export default function BalanceScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Header />
        <View style={{ height: 0.5, backgroundColor: '#262626', marginHorizontal: 20 }} />

        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 28, letterSpacing: -0.45 }}>
            Your Balances
          </Text>
          <Text style={{ color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, letterSpacing: -0.31, marginTop: 4 }}>
            Manage your multi-currency accounts
          </Text>
        </View>

        <CreditScoreGauge score={660} />

        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: -0.31 }}>
            Available Currencies
          </Text>
        </View>

        <CurrencyItem code="CAD" name="Canadian Dollar" flag="🇨🇦" />

        <BarChart />

        <View style={{ height: 80 }} />
      </ScrollView>

      <FloatingActionButton />
    </SafeAreaView>
  );
}
