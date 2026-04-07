  import React, { useState, useCallback } from 'react';
import { Platform, Pressable, Vibration } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

function triggerHaptic(style: 'medium' | 'light') {
  try {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(
        style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
      );
    } else {
      // Android: expo-haptics + vibration fallback
      Haptics.impactAsync(
        style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
      ).catch(() => {
        Vibration.vibrate(style === 'medium' ? 20 : 10);
      });
    }
  } catch {
    Vibration.vibrate(style === 'medium' ? 20 : 10);
  }
}

const PARTICLE_COUNT = 6;
const PARTICLE_COLORS = ['#fcd34d', '#fbbf24', '#f59e0b', '#fde68a', '#fef3c7', '#d97706'];

function StarParticle({ index, trigger }: { index: number; trigger: number }) {
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  React.useEffect(() => {
    if (trigger === 0) return;

    const distance = 18 + Math.random() * 8;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    opacity.value = withSequence(
      withTiming(1, { duration: 50 }),
      withDelay(200, withTiming(0, { duration: 250 }))
    );
    scale.value = withSequence(
      withSpring(1, { damping: 8, stiffness: 300 }),
      withDelay(150, withTiming(0, { duration: 200 }))
    );
    translateX.value = withSpring(targetX, { damping: 10, stiffness: 120, mass: 0.4 });
    translateY.value = withSpring(targetY, { damping: 10, stiffness: 120, mass: 0.4 });

    // Reset after animation
    const timeout = setTimeout(() => {
      translateX.value = withTiming(0, { duration: 0 });
      translateY.value = withTiming(0, { duration: 0 });
    }, 600);

    return () => clearTimeout(timeout);
  }, [trigger]);

  const particleStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return <Animated.View style={particleStyle} />;
}

export default function AnimatedStarButton({ size = 18 }: { size?: number }) {
  const [starred, setStarred] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);

  const starScale = useSharedValue(1);
  const starRotate = useSharedValue(0);
  const starColor = useSharedValue(0); // 0 = unstarred, 1 = starred

  const handlePress = useCallback(() => {
    const newStarred = !starred;
    setStarred(newStarred);

    if (newStarred) {
      // Star animation — bounce + spin + particles
      triggerHaptic('medium');

      starScale.value = withSequence(
        withTiming(0, { duration: 80 }),
        withSpring(1.4, { damping: 6, stiffness: 300, mass: 0.5 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );

      starRotate.value = withSequence(
        withTiming(-15, { duration: 80 }),
        withSpring(0, { damping: 8, stiffness: 150 })
      );

      starColor.value = withTiming(1, { duration: 150 });

      setParticleTrigger((p) => p + 1);
    } else {
      // Unstar — subtle shrink
      triggerHaptic('light');

      starScale.value = withSequence(
        withTiming(0.7, { duration: 100, easing: Easing.in(Easing.cubic) }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );

      starColor.value = withTiming(0, { duration: 200 });
    }
  }, [starred]);

  const starAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: starScale.value },
      { rotate: `${starRotate.value}deg` },
    ],
  }));

  return (
    <Pressable onPress={handlePress} hitSlop={12} style={{ width: size + 16, height: size + 16, alignItems: 'center', justifyContent: 'center' }}>
      {/* Particles */}
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <StarParticle key={i} index={i} trigger={particleTrigger} />
      ))}

      {/* Star icon */}
      <Animated.View style={starAnimStyle}>
        <FontAwesome
          name={starred ? 'star' : 'star-o'}
          size={size}
          color={starred ? '#fbbf24' : '#737373'}
        />
      </Animated.View>
    </Pressable>
  );
}
