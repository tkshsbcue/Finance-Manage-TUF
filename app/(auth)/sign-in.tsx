import { useState, useRef, useEffect, useCallback } from 'react';
import { LAYOUT } from '@/constants/layout';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

const AnimatedScrollView = Animated.ScrollView;

export default function SignInScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const onSignInTab = useCallback(() => { Keyboard.dismiss(); setActiveTab('signin'); }, []);
  const onSignUpTab = useCallback(() => { Keyboard.dismiss(); setActiveTab('signup'); }, []);
  const toggleShowPassword = useCallback(() => setShowPassword(p => !p), []);

  // Shared values — all animations run on UI thread
  const arrowScale = useSharedValue(0);
  const arrowOpacity = useSharedValue(0);
  const tabPosition = useSharedValue(0);
  const keyboardPadding = useSharedValue(0);
  const TAB_WIDTH = (LAYOUT.inputWidth - 4) / 2;

  // Keyboard listeners — animate padding on UI thread via shared value
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      keyboardPadding.value = withTiming(e.endCoordinates.height, {
        duration: Platform.OS === 'ios' ? 250 : 200,
        easing: Easing.out(Easing.cubic),
      });
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, Platform.OS === 'ios' ? 50 : 150);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardPadding.value = withTiming(0, {
        duration: Platform.OS === 'ios' ? 250 : 200,
        easing: Easing.out(Easing.cubic),
      });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Tab slide animation
  useEffect(() => {
    tabPosition.value = withSpring(activeTab === 'signin' ? 0 : 1, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });
  }, [activeTab]);

  const tabIndicatorStyle = useAnimatedStyle(() => ({
    left: 2 + tabPosition.value * TAB_WIDTH,
  }));

  const signInTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tabPosition.value, [0, 1], ['#000000', '#a3a3a3']),
  }));

  const signUpTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tabPosition.value, [0, 1], ['#a3a3a3', '#000000']),
  }));

  // Arrow button animation
  useEffect(() => {
    if (passwordFocused && password.length > 0) {
      arrowScale.value = withSpring(1, { damping: 12, stiffness: 180 });
      arrowOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
    } else {
      arrowScale.value = withTiming(0, { duration: 150 });
      arrowOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [passwordFocused, password]);

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: arrowScale.value }],
    opacity: arrowOpacity.value,
  }));

  // Animated spacer that expands when keyboard shows
  const spacerStyle = useAnimatedStyle(() => ({
    height: keyboardPadding.value,
  }));

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();
    router.replace('/(tabs)/home');
  }, [router]);

  const handlePasswordFocus = useCallback(() => {
    setPasswordFocused(true);
  }, []);

  return (
    <LinearGradient
      colors={['rgba(250,250,250,0.05)', 'rgba(38,38,38,0.1)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, backgroundColor: '#0A0A0A' }}
    >
    <SafeAreaView className="flex-1">
      <AnimatedScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bounces={false}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        overScrollMode="never"
      >
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          {/* Top Section - Logo & Welcome */}
          <View className="items-center pt-16 pb-8">
            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-5" style={{ backgroundColor: '#FAFAFA' }}>
              <Text className="text-black text-2xl font-bold">P</Text>
            </View>
            <Text
              className="text-white text-center mb-2"
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 24,
                lineHeight: 32,
                letterSpacing: 0.07,
              }}
            >
              Welcome to PayU
            </Text>
            <Text
              className="text-neutral-400 text-center"
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                lineHeight: 24,
                letterSpacing: -0.31,
              }}
            >
              Send money globally with the real exchange rate
            </Text>
          </View>

          {/* Bottom Card Section */}
          <View
            className="self-center bg-neutral-900 rounded-3xl px-6"
            style={{ maxWidth: LAYOUT.cardWidth, width: '100%', gap: 32, paddingTop: 32, paddingBottom: 48 }}
          >
            {/* Header */}
            <View>
              <Text
                className="text-white mb-1"
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 20,
                  lineHeight: 28,
                  letterSpacing: -0.45,
                }}
              >
                Get started
              </Text>
              <Text
                className="text-neutral-400"
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 16,
                  lineHeight: 24,
                  letterSpacing: -0.31,
                }}
              >
                Sign in to your account or create a new one
              </Text>
            </View>

            {/* Tab Toggle */}
            <View
              className="self-center"
              style={{ width: LAYOUT.inputWidth, height: 36, borderRadius: 14, padding: 2, backgroundColor: '#262626' }}
            >
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: 2,
                    width: TAB_WIDTH,
                    height: 36 - 4,
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                  },
                  tabIndicatorStyle,
                ]}
              />
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Pressable
                  onPress={onSignInTab}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Animated.Text
                    style={[
                      { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.15 },
                      signInTextStyle,
                    ]}
                  >
                    Sign In
                  </Animated.Text>
                </Pressable>
                <Pressable
                  onPress={onSignUpTab}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Animated.Text
                    style={[
                      { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.15 },
                      signUpTextStyle,
                    ]}
                  >
                    Sign Up
                  </Animated.Text>
                </Pressable>
              </View>
            </View>

            {/* Form Fields */}
            <View>
              {/* Email Field */}
              <Text
                className="text-white mb-2"
                style={{ fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 14, letterSpacing: -0.15 }}
              >
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#525252"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="submit"
                className="bg-neutral-800 text-white mb-5"
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 16,
                  lineHeight: 16,
                  letterSpacing: -0.31,
                  width: LAYOUT.inputWidth,
                  height: 36,
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingLeft: 12,
                  paddingRight: 12,
                  borderRadius: 8,
                  borderWidth: 0.53,
                  borderColor: '#404040',
                }}
              />

              {/* Password Field */}
              <Text
                className="text-white mb-2"
                style={{ fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 14, letterSpacing: -0.15 }}
              >
                Password
              </Text>
              <View style={{ position: 'relative' }}>
                <View style={{ width: LAYOUT.inputWidth, position: 'relative' }}>
                  <TextInput
                    ref={passwordRef}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#525252"
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    onFocus={handlePasswordFocus}
                    onBlur={() => setPasswordFocused(false)}
                    className="bg-neutral-800 text-white"
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 16,
                      lineHeight: 16,
                      letterSpacing: -0.31,
                      width: LAYOUT.inputWidth,
                      height: 36,
                      paddingTop: 4,
                      paddingBottom: 4,
                      paddingLeft: 12,
                      paddingRight: 40,
                      borderRadius: 8,
                      borderWidth: 0.53,
                      borderColor: '#404040',
                    }}
                  />
                  <Pressable
                    onPress={toggleShowPassword}
                    hitSlop={8}
                    style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
                  >
                    <FontAwesome
                      name={showPassword ? 'eye-slash' : 'eye'}
                      size={18}
                      color="#737373"
                    />
                  </Pressable>
                </View>

                {/* Arrow submit button - appears when typing password */}
                <Animated.View
                  style={[
                    { position: 'absolute', right: -52, top: 0 },
                    arrowAnimatedStyle,
                  ]}
                >
                  <Pressable
                    onPress={handleSubmit}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#FAFAFA',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FontAwesome name="arrow-right" size={16} color="#0A0A0A" />
                  </Pressable>
                </Animated.View>
              </View>

              {activeTab === 'signin' && (
                <Pressable className="self-end mt-2">
                  <Text
                    className="text-white"
                    style={{ fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.15 }}
                  >
                    Forgot password?
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              unstable_pressDelay={0}
              className="bg-white items-center justify-center self-center"
              style={{ width: LAYOUT.inputWidth, height: 36, borderRadius: 8 }}
            >
              <Text
                className="text-black"
                style={{ fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.15 }}
              >
                {activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
              </Text>
            </Pressable>
          </View>

          {/* Animated spacer — grows/shrinks with keyboard, no re-renders */}
          <Animated.View style={spacerStyle} />
        </Pressable>
      </AnimatedScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
}
