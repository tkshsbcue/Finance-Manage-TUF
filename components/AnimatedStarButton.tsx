import React, { useState, useCallback, useMemo } from 'react';
import { TouchableOpacity, Vibration, StyleSheet } from 'react-native';
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

function haptic(style: 'medium' | 'light') {
  try {
    Haptics.impactAsync(
      style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    ).catch(() => Vibration.vibrate(style === 'medium' ? 20 : 10));
  } catch {
    Vibration.vibrate(style === 'medium' ? 20 : 10);
  }
}

const PARTICLE_COUNT = 5;
const PARTICLE_COLORS = ['#fcd34d', '#fbbf24', '#f59e0b', '#fde68a', '#d97706'];

// Memoized particle — each instance only re-renders when trigger changes
const StarParticle = React.memo(function StarParticle({ index, trigger }: { index: number; trigger: number }) {
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (trigger === 0) return;
    const dist = 16 + Math.random() * 6;
    opacity.value = withSequence(withTiming(1, { duration: 40 }), withDelay(180, withTiming(0, { duration: 200 })));
    translateX.value = withSpring(Math.cos(angle) * dist, { damping: 12, stiffness: 140, mass: 0.3 });
    translateY.value = withSpring(Math.sin(angle) * dist, { damping: 12, stiffness: 140, mass: 0.3 });
    const t = setTimeout(() => {
      translateX.value = withTiming(0, { duration: 0 });
      translateY.value = withTiming(0, { duration: 0 });
    }, 500);
    return () => clearTimeout(t);
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return <Animated.View style={[pStyles.particle, { backgroundColor: PARTICLE_COLORS[index] }, style]} />;
});

const pStyles = StyleSheet.create({
  particle: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5 },
});

export default React.memo(function AnimatedStarButton({ size = 18 }: { size?: number }) {
  const [starred, setStarred] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const starScale = useSharedValue(1);
  const starRotate = useSharedValue(0);

  const containerStyle = useMemo(() => ({
    width: size + 16, height: size + 16, alignItems: 'center' as const, justifyContent: 'center' as const,
  }), [size]);

  const handlePress = useCallback(() => {
    const next = !starred;
    setStarred(next);
    if (next) {
      haptic('medium');
      starScale.value = withSequence(withTiming(0, { duration: 60 }), withSpring(1.3, { damping: 6, stiffness: 300, mass: 0.4 }), withSpring(1, { damping: 10, stiffness: 200 }));
      starRotate.value = withSequence(withTiming(-12, { duration: 60 }), withSpring(0, { damping: 8, stiffness: 150 }));
      setParticleTrigger(p => p + 1);
    } else {
      haptic('light');
      starScale.value = withSequence(withTiming(0.75, { duration: 80, easing: Easing.in(Easing.cubic) }), withSpring(1, { damping: 12, stiffness: 200 }));
    }
  }, [starred]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }, { rotate: `${starRotate.value}deg` }],
  }));

  // Memoize particle array so it doesn't recreate on every render
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => <StarParticle key={i} index={i} trigger={particleTrigger} />
  ), [particleTrigger]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} delayPressIn={0} hitSlop={12} style={containerStyle}>
      {particles}
      <Animated.View style={animStyle}>
        <FontAwesome name={starred ? 'star' : 'star-o'} size={size} color={starred ? '#fbbf24' : '#737373'} />
      </Animated.View>
    </TouchableOpacity>
  );
});
