import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Accelerometer } from 'expo-sensors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LAYOUT } from '@/constants/layout';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

// Spring config — heavy damping for smooth, premium feel
const SPRING = { damping: 25, stiffness: 80, mass: 0.8 };
const MAX_TILT = 10; // degrees

export default React.memo(function SkeuomorphicCard() {
  const tiltX = useSharedValue(0); // pitch (front/back)
  const tiltY = useSharedValue(0); // roll (left/right)

  useEffect(() => {
    Accelerometer.setUpdateInterval(16); // 60fps sensor reads

    const sub = Accelerometer.addListener(({ x, y }) => {
      // x = left/right tilt (-1 to 1), y = front/back tilt (-1 to 1)
      // Spring to target — runs on JS thread but springs animate on UI thread
      tiltY.value = withSpring(x * MAX_TILT, SPRING);
      tiltX.value = withSpring(-y * MAX_TILT, SPRING);
    });

    return () => sub.remove();
  }, []);

  // 3D perspective tilt — entirely on UI thread
  const cardTiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${tiltX.value}deg` },
      { rotateY: `${tiltY.value}deg` },
    ],
  }));

  // Shine band — slides across card based on tilt
  const shineStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      tiltY.value,
      [-MAX_TILT, MAX_TILT],
      [-LAYOUT.bankCardWidth * 0.6, LAYOUT.bankCardWidth * 1.2],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      Math.abs(tiltY.value) + Math.abs(tiltX.value),
      [0, 3, MAX_TILT],
      [0, 0.08, 0.2],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateX }, { rotate: '20deg' }],
      opacity,
    };
  });

  // Secondary shine — thinner, offset, for depth
  const shine2Style = useAnimatedStyle(() => {
    const translateX = interpolate(
      tiltY.value,
      [-MAX_TILT, MAX_TILT],
      [-LAYOUT.bankCardWidth * 0.3, LAYOUT.bankCardWidth * 1.5],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      Math.abs(tiltY.value),
      [0, 4, MAX_TILT],
      [0, 0.04, 0.12],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateX }, { rotate: '20deg' }],
      opacity,
    };
  });

  // Subtle shadow shift based on tilt
  const shadowStyle = useAnimatedStyle(() => {
    const shadowX = interpolate(tiltY.value, [-MAX_TILT, MAX_TILT], [8, -8]);
    const shadowY = interpolate(tiltX.value, [-MAX_TILT, MAX_TILT], [-4, 12]);
    return {
      shadowOffset: { width: shadowX, height: shadowY },
    };
  });

  // Edge highlight — top/bottom edges glow based on tilt
  const topEdgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(tiltX.value, [-MAX_TILT, 0, MAX_TILT], [0.15, 0, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  const bottomEdgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(tiltX.value, [-MAX_TILT, 0, MAX_TILT], [0, 0, 0.1], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <View style={c.wrapper}>
      <Animated.View style={[c.shadowContainer, shadowStyle]}>
        <Animated.View style={[c.tiltContainer, cardTiltStyle]}>
          <LinearGradient
            colors={['#c4b5a0', '#88c4b8', '#a8d8c8'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={c.card}
          >
            {/* Edge highlights */}
            <Animated.View style={[c.topEdge, topEdgeStyle]} />
            <Animated.View style={[c.bottomEdge, bottomEdgeStyle]} />

            {/* Primary shine band */}
            <Animated.View style={[c.shine, shineStyle]} />

            {/* Secondary shine */}
            <Animated.View style={[c.shine2, shine2Style]} />

            {/* Card content */}
            <View style={c.cardContent}>
              <View style={c.topRow}>
                <Text style={c.bankName}>ADRBank</Text>
                <View style={c.refreshIcon}>
                  <FontAwesome name="refresh" size={16} color="#FFFFFF" />
                </View>
              </View>
              <Text style={c.cardNumber}>8763 1111 2222 0329</Text>
              <View style={c.bottomRow}>
                <View>
                  <Text style={c.label}>Card Holder Name</Text>
                  <Text style={c.value}>ALEX</Text>
                </View>
                <View>
                  <Text style={c.label}>Expired Date</Text>
                  <Text style={c.value}>10/28</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </View>
  );
});

const c = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shadowContainer: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tiltContainer: {
    // Container for the 3D transform
  },
  card: {
    width: LAYOUT.bankCardWidth,
    height: 218,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  shine: {
    position: 'absolute',
    top: -60,
    width: 60,
    height: 340,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 30,
  },
  shine2: {
    position: 'absolute',
    top: -40,
    width: 30,
    height: 300,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  refreshIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    letterSpacing: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  value: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    marginTop: 2,
  },
});
