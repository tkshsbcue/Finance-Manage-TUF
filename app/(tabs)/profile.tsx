import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

// --- Header ---
function Header() {
  return (
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
  );
}

// --- Profile Avatar ---
function ProfileAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 0.53, borderColor: '#404040' }}>
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>{initial}</Text>
      </View>
      <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: -0.31 }}>{name}</Text>
    </View>
  );
}

// --- Preview / Edit Toggle ---
function ProfileToggle({ activeTab, onTabChange }: { activeTab: 'preview' | 'edit'; onTabChange: (tab: 'preview' | 'edit') => void }) {
  const tabPosition = useSharedValue(0);
  const TAB_WIDTH = (349 - 4) / 2;

  useEffect(() => {
    tabPosition.value = withSpring(activeTab === 'preview' ? 0 : 1, {
      damping: 20, stiffness: 200, mass: 0.8,
    });
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: 2 + tabPosition.value * TAB_WIDTH,
  }));

  const previewTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tabPosition.value, [0, 1], ['#000000', '#a3a3a3']),
  }));

  const editTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tabPosition.value, [0, 1], ['#a3a3a3', '#000000']),
  }));

  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
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
          <Pressable onPress={() => onTabChange('preview')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.Text style={[{ fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.15 }, previewTextStyle]}>
              Preview
            </Animated.Text>
          </Pressable>
          <Pressable onPress={() => onTabChange('edit')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.Text style={[{ fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.15 }, editTextStyle]}>
              Edit
            </Animated.Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// --- Info Row ---
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
      <Text style={{ color: '#737373', fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 }}>
        {label} : <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }}>{value}</Text>
      </Text>
    </View>
  );
}

// --- Edit Form ---
function EditForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const inputStyle = {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: -0.31,
    color: '#FFFFFF',
    width: 349,
    height: 36,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 8,
    borderWidth: 0.53,
    borderColor: '#404040',
    backgroundColor: '#171717',
  };

  const labelStyle = {
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: -0.15,
    marginBottom: 8,
  };

  return (
    <View style={{ paddingHorizontal: 20 }}>
      {/* Full Name */}
      <Text style={labelStyle}>Full Name</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter your full name"
        placeholderTextColor="#525252"
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        submitBehavior="submit"
        style={{ ...inputStyle, marginBottom: 20 }}
      />

      {/* Email */}
      <Text style={labelStyle}>Email</Text>
      <TextInput
        ref={emailRef}
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
        style={{ ...inputStyle, marginBottom: 20 }}
      />

      {/* Password */}
      <Text style={labelStyle}>Password</Text>
      <View style={{ width: 349, position: 'relative', marginBottom: 20 }}>
        <TextInput
          ref={passwordRef}
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          placeholderTextColor="#525252"
          secureTextEntry={!showPassword}
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          submitBehavior="submit"
          style={{ ...inputStyle, paddingRight: 40 }}
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={8}
          style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
        >
          <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={18} color="#737373" />
        </Pressable>
      </View>

      {/* Confirm Password */}
      <Text style={labelStyle}>Confirm Password</Text>
      <View style={{ width: 349, position: 'relative', marginBottom: 28 }}>
        <TextInput
          ref={confirmRef}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          placeholderTextColor="#525252"
          secureTextEntry={!showConfirm}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          style={{ ...inputStyle, paddingRight: 40 }}
        />
        <Pressable
          onPress={() => setShowConfirm(!showConfirm)}
          hitSlop={8}
          style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
        >
          <FontAwesome name={showConfirm ? 'eye-slash' : 'eye'} size={18} color="#737373" />
        </Pressable>
      </View>

      {/* Update Button */}
      <Pressable
        onPress={() => Keyboard.dismiss()}
        style={{
          width: 349,
          height: 36,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        }}
      >
        <Text style={{ color: '#000000', fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.15 }}>
          Update Details
        </Text>
      </Pressable>
    </View>
  );
}

// --- FAB ---
function FloatingActionButton() {
  return (
    <Pressable
      style={{
        position: 'absolute',
        bottom: 16,
        right: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <FontAwesome name="plus" size={22} color="#0A0A0A" />
    </Pressable>
  );
}

// --- Main Screen ---
const AnimatedScrollView = Animated.ScrollView;

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const scrollRef = useRef<Animated.ScrollView>(null);
  const keyboardPadding = useSharedValue(0);

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
      }, Platform.OS === 'ios' ? 280 : 300);
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

  const spacerStyle = useAnimatedStyle(() => ({
    height: keyboardPadding.value,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <AnimatedScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          <Header />
          <View style={{ height: 0.5, backgroundColor: '#262626', marginHorizontal: 20 }} />

          <ProfileAvatar name="Alex yu" />
          <ProfileToggle activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'preview' ? (
            <>
              <InfoRow label="Total spendings" value="$2000" />
              <InfoRow label="Email" value="alex@gmail.com" />
              <InfoRow label="Balance" value="$20000" />
            </>
          ) : (
            <EditForm />
          )}
        </Pressable>

        <Animated.View style={spacerStyle} />
      </AnimatedScrollView>

      <FloatingActionButton />
    </SafeAreaView>
  );
}
