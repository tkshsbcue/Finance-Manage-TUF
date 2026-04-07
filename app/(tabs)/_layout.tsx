import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// --- Persistent Header (memoized — renders once) ---
const Header = React.memo(function Header() {
  return (
    <View style={h.wrapper}>
      <View style={h.row}>
        <View style={h.left}>
          <View style={h.logo}>
            <Text style={h.logoText}>P</Text>
          </View>
          <Text style={h.brandText}>PayU</Text>
        </View>
        <View style={h.right}>
          <Pressable hitSlop={8}>
            <FontAwesome name="search" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable hitSlop={8}>
            <View style={h.bellWrapper}>
              <FontAwesome name="bell-o" size={18} color="#FFFFFF" />
              <View style={h.badge}>
                <Text style={h.badgeText}>2</Text>
              </View>
            </View>
          </Pressable>
        </View>
      </View>
      <View style={h.divider} />
    </View>
  );
});

const h = StyleSheet.create({
  wrapper: { backgroundColor: '#0A0A0A' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  left: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoText: { color: '#000000', fontFamily: 'Inter_700Bold', fontSize: 16 },
  brandText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: -0.31 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  bellWrapper: { position: 'relative' as const },
  badge: { position: 'absolute' as const, top: -4, right: -6, backgroundColor: '#DC2626', borderRadius: 7, width: 14, height: 14, alignItems: 'center' as const, justifyContent: 'center' as const },
  badgeText: { color: '#FFFFFF', fontSize: 8, fontFamily: 'Inter_700Bold' },
  divider: { height: 0.5, backgroundColor: '#262626', marginHorizontal: 20 },
});

// --- Animated Tab Icon (memoized) ---
const AnimatedTabIcon = React.memo(function AnimatedTabIcon({ name, color, size, focused }: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size: number;
  focused: boolean;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.15, { damping: 10, stiffness: 200, mass: 0.5 });
      translateY.value = withSpring(-2, { damping: 10, stiffness: 200, mass: 0.5 });
    } else {
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 150, easing: Easing.out(Easing.cubic) });
    }
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <FontAwesome name={name} size={size} color={color} />
    </Animated.View>
  );
});

// --- Static tab config objects (created once, never recreated) ---
const TAB_BAR_STYLE = {
  backgroundColor: '#0A0A0A',
  borderTopWidth: 0.5,
  borderTopColor: '#262626',
  elevation: 0,
  shadowOpacity: 0,
  height: 80,
  paddingBottom: 20,
  paddingTop: 10,
} as const;

const TAB_LABEL_STYLE = { fontFamily: 'Inter_500Medium', fontSize: 11 } as const;
const SCENE_STYLE = { backgroundColor: '#0A0A0A' } as const;
const TRANSITION_SPEC = { animation: 'timing' as const, config: { duration: 150 } };
const SAFE_AREA_STYLE = { flex: 1, backgroundColor: '#0A0A0A' } as const;

export default function TabLayout() {
  return (
    <SafeAreaView style={SAFE_AREA_STYLE} edges={['top']}>
      <Header />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#737373',
          tabBarStyle: TAB_BAR_STYLE,
          tabBarLabelStyle: TAB_LABEL_STYLE,
          lazy: false,
          animation: 'fade',
          transitionSpec: TRANSITION_SPEC,
          sceneStyle: SCENE_STYLE,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => <AnimatedTabIcon name="home" size={22} color={color} focused={focused} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="balance"
          options={{
            title: 'Balances',
            tabBarIcon: ({ color, focused }) => <AnimatedTabIcon name="credit-card" size={20} color={color} focused={focused} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => <AnimatedTabIcon name="user-o" size={22} color={color} focused={focused} />,
            headerShown: false,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
