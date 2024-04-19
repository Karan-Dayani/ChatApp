import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

const settingsPage = () => {
  const params = useLocalSearchParams();
  console.log(params);
  return (
    <View className="bg-teal-100 h-screen">
      <Stack.Screen
        options={{
          headerTitle: "Settings",
          headerStyle: {
            backgroundColor: "rgb(153 246 228)",
          },
          headerTintColor: "rgb(19 78 74)",
          headerShadowVisible: false,
        }}
      />
      <View className="p-4">
        <Text className="text-2xl text-teal-800">Hello, {params.username}</Text>
        <View className="w-full items-end">
          <Pressable className="rounded-sm mt-2 bg-teal-400">
            <Text className="mx-2 my-1 text-xl text-teal-900">Log Out</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default settingsPage;
