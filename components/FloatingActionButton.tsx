import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Vibration, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  interpolate,
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

type MenuItem = {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  color: string;
  route: string;
};

const MENU_ITEMS: (MenuItem & { x: number; y: number })[] = [
  { icon: 'home', label: 'Home', color: '#f59e0b', route: '/(tabs)/home', x: -25, y: -75 },
  { icon: 'credit-card', label: 'Balances', color: '#10b981', route: '/(tabs)/balance', x: -75, y: -25 },
  { icon: 'user-o', label: 'Profile', color: '#8b5cf6', route: '/(tabs)/profile', x: -50, y: -130 },
];

const FAB_SIZE = 52;
const BTN_SIZE = 42;

function OrbitItem({ item, index, isOpen, onNavigate }: { item: typeof MENU_ITEMS[0]; index: number; isOpen: boolean; onNavigate: (route: string) => void }) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    if (isOpen) {
      progress.value = withDelay(
        index * 55,
        withSpring(1, { damping: 13, stiffness: 150, mass: 0.5 })
      );
    } else {
      progress.value = withDelay(
        (MENU_ITEMS.length - 1 - index) * 35,
        withTiming(0, { duration: 180, easing: Easing.in(Easing.cubic) })
      );
    }
  }, [isOpen]);

  const style = useAnimatedStyle(() => {
    const tx = interpolate(progress.value, [0, 1], [0, item.x]);
    const ty = interpolate(progress.value, [0, 1], [0, item.y]);
    const scale = interpolate(progress.value, [0, 0.3, 1], [0, 0.6, 1]);
    const opacity = interpolate(progress.value, [0, 0.15, 1], [0, 0.7, 1]);
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale }],
      opacity,
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.65, 1], [0, 1]);
    return { opacity };
  });

  return (
    <Animated.View style={[{ position: 'absolute', alignItems: 'center' }, style]}>
      <Pressable
        onPress={() => { haptic('light'); onNavigate(item.route); }}
        style={{
          width: BTN_SIZE,
          height: BTN_SIZE,
          borderRadius: BTN_SIZE / 2,
          backgroundColor: item.color,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: item.color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <FontAwesome name={item.icon} size={15} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);
  const fabScale = useSharedValue(1);
  const backdropOpacity = useSharedValue(0);
  const router = useRouter();

  const toggle = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    haptic(next ? 'medium' : 'light');
    rotation.value = withSpring(next ? 45 : 0, { damping: 12, stiffness: 180 });
    fabScale.value = withSpring(next ? 1.1 : 1, { damping: 10, stiffness: 200 });
    backdropOpacity.value = withTiming(next ? 1 : 0, { duration: 250 });
  }, [isOpen]);

  const close = useCallback(() => {
    if (!isOpen) return;
    setIsOpen(false);
    haptic('light');
    rotation.value = withSpring(0, { damping: 14, stiffness: 200 });
    fabScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }, [isOpen]);

  const handleNavigate = useCallback((route: string) => {
    close();
    setTimeout(() => router.push(route as any), 200);
  }, [close, router]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' as const : 'none' as const,
  }));

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 90 }, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <View style={{ position: 'absolute', bottom: 16, right: 20, zIndex: 100 }}>
        {/* Orbit origin = center of FAB */}
        <View style={{ position: 'absolute', left: FAB_SIZE / 2 - BTN_SIZE / 2, top: FAB_SIZE / 2 - BTN_SIZE / 2 }}>
          {MENU_ITEMS.map((item, i) => (
            <OrbitItem key={item.label} item={item} index={i} isOpen={isOpen} onNavigate={handleNavigate} />
          ))}
        </View>

        <Pressable onPress={toggle}>
          <Animated.View
            style={[
              {
                width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_SIZE / 2,
                backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
              },
              fabStyle,
            ]}
          >
            <FontAwesome name="plus" size={22} color="#0A0A0A" />
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
}
