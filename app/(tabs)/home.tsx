import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LAYOUT } from '@/constants/layout';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import AnimatedStarButton from '@/components/AnimatedStarButton';
import FloatingActionButton from '@/components/FloatingActionButton';
import SkeuomorphicCard from '@/components/SkeuomorphicCard';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

// --- Greeting (memoized — never re-renders) ---
const Greeting = React.memo(function Greeting() {
  return (
    <View style={s.greetingContainer}>
      <Text style={s.greetingTitle}>Hey, Alex</Text>
      <Text style={s.greetingSubtitle}>Manage your multi-currency accounts</Text>
    </View>
  );
});


// --- Expenses Toggle ---
const ExpensesToggle = React.memo(function ExpensesToggle({ activeTab, onTabChange }: { activeTab: 'weekly' | 'monthly'; onTabChange: (tab: 'weekly' | 'monthly') => void }) {
  const tabPosition = useSharedValue(0);

  useEffect(() => {
    tabPosition.value = withSpring(activeTab === 'weekly' ? 0 : 1, { damping: 20, stiffness: 200, mass: 0.8 });
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: 2 + tabPosition.value * ((LAYOUT.inputWidth - 4) / 2),
  }));

  const weeklyTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tabPosition.value, [0, 1], ['#000000', '#a3a3a3']),
  }));

  const monthlyTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tabPosition.value, [0, 1], ['#a3a3a3', '#000000']),
  }));

  const onWeekly = useCallback(() => onTabChange('weekly'), [onTabChange]);
  const onMonthly = useCallback(() => onTabChange('monthly'), [onTabChange]);

  return (
    <View style={s.toggleSection}>
      <Text style={s.expensesTitle}>Your expenses</Text>
      <View style={s.toggleContainer}>
        <Animated.View style={[s.toggleIndicator, indicatorStyle]} />
        <View style={s.toggleRow}>
          <Pressable onPress={onWeekly} style={s.toggleButton}>
            <Animated.Text style={[s.toggleText, weeklyTextStyle]}>Weekly</Animated.Text>
          </Pressable>
          <Pressable onPress={onMonthly} style={s.toggleButton}>
            <Animated.Text style={[s.toggleText, monthlyTextStyle]}>Monthly</Animated.Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

// --- Expense Item (memoized) ---
const ExpenseItem = React.memo(function ExpenseItem({ category, subtitle, amount, gradientColors }: { category: string; subtitle: string; amount: string; gradientColors?: string[] }) {
  const gradientProps = useMemo(() => {
    const colors = gradientColors || (['#171717', '#171717'] as const);
    return {
      colors,
      start: { x: 0, y: 0.5 } as const,
      end: { x: 1, y: 0.5 } as const,
      ...(colors.length === 3 ? { locations: [0, 0.5, 1] as const } : {}),
    };
  }, [gradientColors]);

  return (
    <LinearGradient {...gradientProps as any} style={s.expenseItem}>
      <View style={s.expenseIcon}>
        <FontAwesome name="pie-chart" size={16} color="#737373" />
      </View>
      <View style={s.expenseTextContainer}>
        <Text style={s.expenseCategory}>{category}</Text>
        <Text style={s.expenseSubtitle}>{subtitle}</Text>
      </View>
      <View style={s.starWrapper}>
        <AnimatedStarButton size={18} />
      </View>
      <View style={s.amountBadge}>
        <Text style={s.amountText}>{amount}</Text>
      </View>
    </LinearGradient>
  );
});

// --- Main Screen ---
export default function HomeScreen() {
  const [expenseTab, setExpenseTab] = useState<'weekly' | 'monthly'>('weekly');
  const onTabChange = useCallback((tab: 'weekly' | 'monthly') => setExpenseTab(tab), []);

  return (
    <View style={s.screen}>
      <ScrollView
        style={s.flex1}
        showsVerticalScrollIndicator={false}
        bounces={false}
        removeClippedSubviews
        overScrollMode="never"
      >
        <Greeting />
        <SkeuomorphicCard />
        <View style={s.toggleMargin}>
          <ExpensesToggle activeTab={expenseTab} onTabChange={onTabChange} />
        </View>
        <View style={s.expenseList}>
          <ExpenseItem category="FOOD" subtitle="Lesser than last week" amount="$1000" gradientColors={['#262626', '#0A0A0A']} />
          <ExpenseItem category="TRAVEL" subtitle="More than last week" amount="$4000" gradientColors={['#192D29', '#262626', '#0A0A0A']} />
        </View>
        <View style={s.bottomSpacer} />
      </ScrollView>
      <FloatingActionButton />
    </View>
  );
}

// --- StyleSheet (created once, never recalculated) ---
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A' },
  flex1: { flex: 1 },
  greetingContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greetingTitle: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 28, letterSpacing: -0.45 },
  greetingSubtitle: { color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, letterSpacing: -0.31, marginTop: 4 },
  toggleSection: { paddingHorizontal: 20 },
  expensesTitle: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: -0.31, marginBottom: 14 },
  toggleContainer: { width: LAYOUT.inputWidth, height: 36, borderRadius: 14, padding: 2, backgroundColor: '#262626', alignSelf: 'center' },
  toggleIndicator: { position: 'absolute', top: 2, width: (LAYOUT.inputWidth - 4) / 2, height: 32, borderRadius: 12, backgroundColor: '#FFFFFF' },
  toggleRow: { flex: 1, flexDirection: 'row' },
  toggleButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  toggleMargin: { marginTop: 8 },
  expenseItem: { flexDirection: 'row', alignItems: 'center', width: LAYOUT.cardWidth, height: 85, borderRadius: 14, borderWidth: 0.53, borderColor: '#262626', paddingHorizontal: 18, marginBottom: 10, alignSelf: 'center' },
  expenseIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  expenseTextContainer: { flex: 1 },
  expenseCategory: { color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 24, letterSpacing: -0.31 },
  expenseSubtitle: { color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  starWrapper: { marginRight: 4 },
  amountBadge: { backgroundColor: '#262626', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  amountText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  expenseList: { paddingHorizontal: 20, marginTop: 16 },
  bottomSpacer: { height: 80 },
});
