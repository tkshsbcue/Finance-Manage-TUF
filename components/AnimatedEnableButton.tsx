import React, { useState, useCallback } from 'react';
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
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

function haptic(style: 'medium' | 'light') {
  try {
    Haptics.impactAsync(style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light)
      .catch(() => Vibration.vibrate(15));
  } catch { Vibration.vibrate(15); }
}

export default React.memo(function AnimatedEnableButton() {
  const [enabled, setEnabled] = useState(false);
  const buttonScale = useSharedValue(1);
  const progress = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const widthAnim = useSharedValue(85);

  const handlePress = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    if (next) {
      haptic('medium');
      buttonScale.value = withSequence(withTiming(0.85, { duration: 80 }), withSpring(1.05, { damping: 8, stiffness: 250, mass: 0.5 }), withSpring(1, { damping: 12, stiffness: 200 }));
      progress.value = withSpring(1, { damping: 14, stiffness: 120 });
      iconRotation.value = withTiming(90, { duration: 200, easing: Easing.out(Easing.cubic) });
      checkScale.value = withDelay(150, withSpring(1, { damping: 10, stiffness: 200 }));
      widthAnim.value = withSpring(95, { damping: 14, stiffness: 140 });
    } else {
      haptic('light');
      buttonScale.value = withSequence(withTiming(0.9, { duration: 80 }), withSpring(1, { damping: 12, stiffness: 200 }));
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
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: progress.value,
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} delayPressIn={0}>
      <Animated.View style={[e.container, containerStyle]}>
        <Animated.View style={e.iconBox}>
          <Animated.View style={[e.iconAbsolute, plusStyle]}>
            <FontAwesome name="plus" size={11} color="#FFFFFF" />
          </Animated.View>
          <Animated.View style={[e.iconAbsolute, checkStyle]}>
            <FontAwesome name="check" size={11} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>
        <Animated.Text style={e.text}>{enabled ? 'Enabled' : 'Enable'}</Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

const e = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8, paddingVertical: 6, gap: 5, overflow: 'hidden' },
  iconBox: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  iconAbsolute: { position: 'absolute' },
  text: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFF' },
});
