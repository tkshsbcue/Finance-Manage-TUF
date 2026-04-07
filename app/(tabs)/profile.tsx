import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LAYOUT } from '@/constants/layout';
import { View, Text, ScrollView, Pressable, TextInput, Keyboard, Platform, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FloatingActionButton from '@/components/FloatingActionButton';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

const AnimatedScrollView = Animated.ScrollView;

// --- Profile Avatar (memoized) ---
const ProfileAvatar = React.memo(function ProfileAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <View style={s.avatarContainer}>
      <View style={s.avatarCircle}>
        <Text style={s.avatarText}>{initial}</Text>
      </View>
      <Text style={s.avatarName}>{name}</Text>
    </View>
  );
});

// --- Toggle (memoized) ---
const ProfileToggle = React.memo(function ProfileToggle({ activeTab, onTabChange }: { activeTab: 'preview' | 'edit'; onTabChange: (tab: 'preview' | 'edit') => void }) {
  const tabPosition = useSharedValue(0);

  useEffect(() => {
    tabPosition.value = withSpring(activeTab === 'preview' ? 0 : 1, { damping: 20, stiffness: 200, mass: 0.8 });
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: 2 + tabPosition.value * ((LAYOUT.inputWidth - 4) / 2),
  }));
  const previewStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tabPosition.value, [0, 1], ['#000000', '#a3a3a3']),
  }));
  const editStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tabPosition.value, [0, 1], ['#a3a3a3', '#000000']),
  }));

  const onPreview = useCallback(() => onTabChange('preview'), [onTabChange]);
  const onEdit = useCallback(() => onTabChange('edit'), [onTabChange]);

  return (
    <View style={s.toggleWrapper}>
      <View style={s.toggleContainer}>
        <Animated.View style={[s.toggleIndicator, indicatorStyle]} />
        <View style={s.toggleRow}>
          <Pressable onPress={onPreview} style={s.toggleBtn}>
            <Animated.Text style={[s.toggleText, previewStyle]}>Preview</Animated.Text>
          </Pressable>
          <Pressable onPress={onEdit} style={s.toggleBtn}>
            <Animated.Text style={[s.toggleText, editStyle]}>Edit</Animated.Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

// --- Info Row (memoized) ---
const InfoRow = React.memo(function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label} : <Text style={s.infoValue}>{value}</Text></Text>
    </View>
  );
});

// --- Edit Form ---
const EditForm = React.memo(function EditForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const focusEmail = useCallback(() => emailRef.current?.focus(), []);
  const focusPassword = useCallback(() => passwordRef.current?.focus(), []);
  const focusConfirm = useCallback(() => confirmRef.current?.focus(), []);
  const togglePassword = useCallback(() => setShowPassword(p => !p), []);
  const toggleConfirm = useCallback(() => setShowConfirm(p => !p), []);
  const dismissKeyboard = useCallback(() => Keyboard.dismiss(), []);

  return (
    <View style={s.formContainer}>
      <Text style={s.label}>Full Name</Text>
      <TextInput value={fullName} onChangeText={setFullName} placeholder="Enter your full name" placeholderTextColor="#525252" autoCapitalize="words" returnKeyType="next" onSubmitEditing={focusEmail} submitBehavior="submit" style={[s.input, s.inputMb]} />

      <Text style={s.label}>Email</Text>
      <TextInput ref={emailRef} value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor="#525252" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next" onSubmitEditing={focusPassword} submitBehavior="submit" style={[s.input, s.inputMb]} />

      <Text style={s.label}>Password</Text>
      <View style={[s.passwordWrapper, s.inputMb]}>
        <TextInput ref={passwordRef} value={password} onChangeText={setPassword} placeholder="Create a password" placeholderTextColor="#525252" secureTextEntry={!showPassword} returnKeyType="next" onSubmitEditing={focusConfirm} submitBehavior="submit" style={[s.input, s.inputPaddingRight]} />
        <Pressable onPress={togglePassword} hitSlop={8} style={s.eyeIcon}>
          <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={18} color="#737373" />
        </Pressable>
      </View>

      <Text style={s.label}>Confirm Password</Text>
      <View style={[s.passwordWrapper, s.inputMb28]}>
        <TextInput ref={confirmRef} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm your password" placeholderTextColor="#525252" secureTextEntry={!showConfirm} returnKeyType="done" onSubmitEditing={dismissKeyboard} style={[s.input, s.inputPaddingRight]} />
        <Pressable onPress={toggleConfirm} hitSlop={8} style={s.eyeIcon}>
          <FontAwesome name={showConfirm ? 'eye-slash' : 'eye'} size={18} color="#737373" />
        </Pressable>
      </View>

      <Pressable onPress={dismissKeyboard} style={s.submitButton}>
        <Text style={s.submitText}>Update Details</Text>
      </Pressable>
    </View>
  );
});

// --- Preview Content (memoized) ---
const PreviewContent = React.memo(function PreviewContent() {
  return (
    <>
      <InfoRow label="Total spendings" value="$2000" />
      <InfoRow label="Email" value="alex@gmail.com" />
      <InfoRow label="Balance" value="$20000" />
    </>
  );
});

// --- Main Screen ---
export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const scrollRef = useRef<Animated.ScrollView>(null);
  const keyboardPadding = useSharedValue(0);
  const onTabChange = useCallback((tab: 'preview' | 'edit') => setActiveTab(tab), []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      keyboardPadding.value = withTiming(e.endCoordinates.height, { duration: 220, easing: Easing.out(Easing.cubic) });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), Platform.OS === 'ios' ? 250 : 280);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardPadding.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
    });

    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const spacerStyle = useAnimatedStyle(() => ({ height: keyboardPadding.value }));

  return (
    <View style={s.screen}>
      <AnimatedScrollView
        ref={scrollRef}
        style={s.flex1}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        removeClippedSubviews
        overScrollMode="never"
      >
        <Pressable onPress={Keyboard.dismiss} style={s.flex1}>
          <ProfileAvatar name="Alex yu" />
          <ProfileToggle activeTab={activeTab} onTabChange={onTabChange} />
          {activeTab === 'preview' ? <PreviewContent /> : <EditForm />}
        </Pressable>
        <Animated.View style={spacerStyle} />
      </AnimatedScrollView>
      <FloatingActionButton />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A' },
  flex1: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  avatarContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 0.53, borderColor: '#404040' },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  avatarName: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: -0.31 },
  toggleWrapper: { paddingHorizontal: 20, marginBottom: 24 },
  toggleContainer: { width: LAYOUT.inputWidth, height: 36, borderRadius: 14, padding: 2, backgroundColor: '#262626', alignSelf: 'center' },
  toggleIndicator: { position: 'absolute', top: 2, width: (LAYOUT.inputWidth - 4) / 2, height: 32, borderRadius: 12, backgroundColor: '#FFFFFF' },
  toggleRow: { flex: 1, flexDirection: 'row' },
  toggleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.15 },
  infoRow: { width: LAYOUT.inputWidth, alignSelf: 'center', marginBottom: 16 },
  infoLabel: { color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  infoValue: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
  formContainer: { alignItems: 'center' },
  label: { color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 14, letterSpacing: -0.15, marginBottom: 8, width: LAYOUT.inputWidth, alignSelf: 'center' },
  input: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 16, letterSpacing: -0.31, color: '#FFFFFF', width: LAYOUT.inputWidth, height: 36, paddingTop: 4, paddingBottom: 4, paddingLeft: 12, paddingRight: 12, borderRadius: 8, borderWidth: 0.53, borderColor: '#404040', backgroundColor: '#171717', alignSelf: 'center' },
  inputMb: { marginBottom: 20 },
  inputMb28: { marginBottom: 28 },
  inputPaddingRight: { paddingRight: 40 },
  passwordWrapper: { width: LAYOUT.inputWidth, position: 'relative', alignSelf: 'center' },
  eyeIcon: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  submitButton: { width: LAYOUT.inputWidth, height: 36, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  submitText: { color: '#000000', fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.15 },
});
