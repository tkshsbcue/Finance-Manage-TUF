import React, { useState, useCallback } from 'react';
import { Pressable, Platform, Vibration } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

function haptic(style: 'medium' | 'light') {
  try {
    Haptics.impactAsync(
      style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    ).catch(() => Vibration.vibrate(15));
  } catch {
    Vibration.vibrate(15);
  }
}

export default function AnimatedEnableButton() {
  const [enabled, setEnabled] = useState(false);

  const buttonScale = useSharedValue(1);
  const progress = useSharedValue(0); // 0 = not enabled, 1 = enabled
  const iconRotation = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const widthAnim = useSharedValue(85); // starting width for "+ Enable"

  const handlePress = useCallback(() => {
    const next = !enabled;
    setEnabled(next);

    if (next) {
      // Enable animation
      haptic('medium');

      // Button squish + bounce
      buttonScale.value = withSequence(
        withTiming(0.85, { duration: 80 }),
        withSpring(1.05, { damping: 8, stiffness: 250, mass: 0.5 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );

      // Slide progress to enabled state
      progress.value = withSpring(1, { damping: 14, stiffness: 120 });

      // Plus icon rotates and shrinks out, check scales in
      iconRotation.value = withTiming(90, { duration: 200, easing: Easing.out(Easing.cubic) });
      checkScale.value = withDelay(150, withSpring(1, { damping: 10, stiffness: 200 }));

      // Width expands slightly for "Enabled"
      widthAnim.value = withSpring(95, { damping: 14, stiffness: 140 });

    } else {
      // Disable animation
      haptic('light');

      buttonScale.value = withSequence(
        withTiming(0.9, { duration: 80 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );

      progress.value = withSpring(0, { damping: 14, stiffness: 120 });
      iconRotation.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
      checkScale.value = withTiming(0, { duration: 150 });
      widthAnim.value = withSpring(85, { damping: 14, stiffness: 140 });
    }
  }, [enabled]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    width: widthAnim.value,
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#262626', '#10b981']),
  }));

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
    opacity: 1 - progress.value,
    position: 'absolute' as const,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: progress.value,
    position: 'absolute' as const,
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], ['#FFFFFF', '#FFFFFF']),
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            paddingVertical: 6,
            gap: 5,
            overflow: 'hidden',
          },
          containerStyle,
        ]}
      >
        {/* Icon container */}
        <Animated.View style={{ width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={plusStyle}>
            <FontAwesome name="plus" size={11} color="#FFFFFF" />
          </Animated.View>
          <Animated.View style={checkStyle}>
            <FontAwesome name="check" size={11} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>

        {/* Text */}
        <Animated.Text style={[{ fontFamily: 'Inter_500Medium', fontSize: 13 }, textStyle]}>
          {enabled ? 'Enabled' : 'Enable'}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}
