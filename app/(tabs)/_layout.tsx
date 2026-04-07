import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

// Animated tab icon with scale bounce on active
function AnimatedTabIcon({ name, color, size, focused }: {
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
      scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
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
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#737373',
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopWidth: 0.5,
          borderTopColor: '#262626',
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
        animation: 'fade',
        sceneStyle: { backgroundColor: '#0A0A0A' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="home" size={22} color={color} focused={focused} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="balance"
        options={{
          title: 'Balances',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="credit-card" size={20} color={color} focused={focused} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="user-o" size={22} color={color} focused={focused} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
