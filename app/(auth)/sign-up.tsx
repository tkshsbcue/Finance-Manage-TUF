import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white">Sign Up</Text>

        {/* Placeholder - content will be added later */}

        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          className="mt-8 w-full py-4 rounded-xl bg-primary-600 items-center"
        >
          <Text className="text-white font-semibold text-base">Sign Up</Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          className="mt-4"
        >
          <Text className="text-primary-600 text-sm">
            Already have an account? <Text className="font-semibold">Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
