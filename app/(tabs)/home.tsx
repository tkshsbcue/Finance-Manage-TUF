import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AnimatedStarButton from '@/components/AnimatedStarButton';
import FloatingActionButton from '@/components/FloatingActionButton';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useEffect } from 'react';

// --- Greeting ---
function Greeting() {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
      <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 28, letterSpacing: -0.45 }}>Hey, Alex</Text>
      <Text style={{ color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, letterSpacing: -0.31, marginTop: 4 }}>
        Manage your multi-currency accounts
      </Text>
    </View>
  );
}

// --- Bank Card ---
function BankCard() {
  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
      <LinearGradient
        colors={['#c4b5a0', '#88c4b8', '#a8d8c8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 343,
          height: 218,
          borderRadius: 20,
          padding: 24,
          justifyContent: 'space-between',
          alignSelf: 'center',
        }}
      >
        {/* Top row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>ADRBank</Text>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesome name="refresh" size={16} color="#FFFFFF" />
          </View>
        </View>

        {/* Card Number */}
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: 2 }}>
          8763 1111 2222 0329
        </Text>

        {/* Bottom row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular', fontSize: 11 }}>Card Holder Name</Text>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 14, marginTop: 2 }}>ALEX</Text>
          </View>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular', fontSize: 11 }}>Expired Date</Text>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 14, marginTop: 2 }}>10/28</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// --- Expenses Toggle ---
function ExpensesToggle({ activeTab, onTabChange }: { activeTab: 'weekly' | 'monthly'; onTabChange: (tab: 'weekly' | 'monthly') => void }) {
  const tabPosition = useSharedValue(0);
  const TAB_WIDTH = (349 - 4) / 2;

  useEffect(() => {
    tabPosition.value = withSpring(activeTab === 'weekly' ? 0 : 1, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: 2 + tabPosition.value * TAB_WIDTH,
  }));

  const weeklyTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tabPosition.value, [0, 1], ['#000000', '#a3a3a3']),
  }));

  const monthlyTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tabPosition.value, [0, 1], ['#a3a3a3', '#000000']),
  }));

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: -0.31, marginBottom: 14 }}>
        Your expenses
      </Text>
      <View style={{ width: 349, height: 36, borderRadius: 14, padding: 2, backgroundColor: '#262626', alignSelf: 'center' }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 2,
              width: TAB_WIDTH,
              height: 32,
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
            },
            indicatorStyle,
          ]}
        />
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Pressable onPress={() => onTabChange('weekly')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.Text style={[{ fontFamily: 'Inter_500Medium', fontSize: 14 }, weeklyTextStyle]}>
              Weekly
            </Animated.Text>
          </Pressable>
          <Pressable onPress={() => onTabChange('monthly')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.Text style={[{ fontFamily: 'Inter_500Medium', fontSize: 14 }, monthlyTextStyle]}>
              Monthly
            </Animated.Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// --- Expense Item ---
function ExpenseItem({ category, subtitle, amount, gradientColors }: { category: string; subtitle: string; amount: string; gradientColors?: string[] }) {
  const wrapperProps = gradientColors
    ? { colors: gradientColors, start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 }, ...(gradientColors.length === 3 ? { locations: [0, 0.5, 1] } : {}) }
    : {};
  return (
    <LinearGradient
      {...wrapperProps as any}
      colors={gradientColors || ['#171717', '#171717']}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: 398,
        height: 85,
        borderRadius: 14,
        borderWidth: 0.53,
        borderColor: '#262626',
        paddingHorizontal: 18,
        marginBottom: 10,
        alignSelf: 'center',
      }}
    >
      {/* Icon */}
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
        <FontAwesome name="pie-chart" size={16} color="#737373" />
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 24, letterSpacing: -0.31 }}>{category}</Text>
        <Text style={{ color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
      </View>

      {/* Star */}
      <View style={{ marginRight: 4 }}>
        <AnimatedStarButton size={18} />
      </View>

      {/* Amount */}
      <View style={{ backgroundColor: '#262626', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 }}>
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>{amount}</Text>
      </View>
    </LinearGradient>
  );
}

// --- FAB ---

// --- Main Screen ---
export default function HomeScreen() {
  const [expenseTab, setExpenseTab] = useState<'weekly' | 'monthly'>('weekly');

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Greeting />
        <BankCard />

        <View style={{ marginTop: 8 }}>
          <ExpensesToggle activeTab={expenseTab} onTabChange={setExpenseTab} />
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ExpenseItem category="FOOD" subtitle="Lesser than last week" amount="$1000" gradientColors={['#262626', '#0A0A0A']} />
          <ExpenseItem category="TRAVEL" subtitle="More than last week" amount="$4000" gradientColors={['#192D29', '#262626', '#0A0A0A']} />
        </View>

        {/* Bottom spacing for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      <FloatingActionButton />
    </View>
  );
}
