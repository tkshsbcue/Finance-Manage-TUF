import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

// --- Persistent Header (renders once, never fades) ---
function Header() {
  return (
    <View style={{ backgroundColor: '#0A0A0A' }}>
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
      <View style={{ height: 0.5, backgroundColor: '#262626', marginHorizontal: 20 }} />
    </View>
  );
}

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
      <Header />
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
          lazy: false,
          animation: 'fade',
          transitionSpec: {
            animation: 'timing',
            config: { duration: 150 },
          },
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
    </SafeAreaView>
  );
}
