import { Stack, router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { io } from "socket.io-client";
import { EvilIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const ENDPOINT = "http://192.168.0.111:3000";
let socket;

const generateUUID = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36);
  return timestamp + "-" + randomStr;
};

const indexPage = () => {
  const [userInput, setUserInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [user, setUser] = useState({
    username: "",
    userId: "",
    roomId: "",
    socketId: "",
  });
  const [users, setUsers] = useState([]);
  const [room, setRoom] = useState();
  const [chatArea, setChatArea] = useState(false);
  const [chat, setChat] = useState([]);
  const scrollViewRef = useRef();

  const handleJoin = () => {
    setUser({ ...user, username: userInput, userId: generateUUID() });
  };

  const connectRoom = (data) => {
    setRoom(data);
    setChatArea(true);
  };

  const sendMessage = () => {
    console.log("hit");
    socket.emit("send-message", {
      sender: user,
      reciver: room,
      message: chatInput,
    });
    setChatInput("");
    scrollViewRef.current.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    if (user.username) {
      socket = io(ENDPOINT, { query: { ...user } });
      socket.on("first-message", (data) => {
        console.log(data);
      });
      socket.on("user-connected", (data) => {
        setUsers(data);
      });
      socket.on("user-disconnected", (data) => {
        setUsers(data);
      });
      socket.on("chat-message", (data) => {
        setChat((prev) => [...prev, data]);
        scrollViewRef.current.scrollToEnd({ animated: true });
      });
    }
  }, [user]);

  if (!user.username) {
    return (
      <View className="pt-48 h-screen bg-teal-100 items-center">
        <Stack.Screen
          options={{
            headerTitle: "Login",
            headerStyle: {
              backgroundColor: "rgb(153 246 228)",
            },
            headerTintColor: "rgb(19 78 74)",
            headerShadowVisible: false,
          }}
        />
        <View className="rounded-md p-5 items-center w-full">
          <Text className="mb-1 text-2xl text-teal-900">Enter Your Name</Text>
          <TextInput
            className="w-full my-1 border-2 border-teal-900 rounded-md px-2 text-2xl text-teal-900"
            defaultValue={userInput}
            onChangeText={(value) => setUserInput(value)}
          />
          <View className="items-end w-full">
            <Pressable
              onPress={() => handleJoin()}
              className="rounded-sm mt-2 bg-teal-400"
            >
              <Text className="mx-2 my-1 text-2xl text-teal-900">Join</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }
  if (chatArea) {
    return (
      <View className="h-full w-full justify-between bg-teal-100">
        <Stack.Screen
          options={{
            headerTitle: room.username,
            headerLeft: () => (
              // <Text
              //   onPress={() => setChatArea(false)}
              //   style={{
              //     paddingRight: 20,
              //   }}
              // >
              //   Back
              // </Text>
              <Ionicons
                name="arrow-back"
                size={24}
                color="rgb(19 78 74)"
                onPress={() => setChatArea(false)}
                style={{
                  paddingRight: 20,
                }}
              />
            ),
          }}
        />
        <ScrollView
          ref={scrollViewRef}
          className="w-full"
          showsVerticalScrollIndicator={false}
        >
          {chat.map((item, index) => {
            if (
              item.sender.userId == room.userId ||
              item.reciver.userId == room.userId
            ) {
              return (
                <View
                  className={
                    item.sender.username === user?.username
                      ? "items-end my-1 mx-5"
                      : "items-start my-1 mx-5"
                  }
                  key={index}
                >
                  {/* <Text
                    className={
                      item.sender.username === user.username
                        ? "w-full text-right text-[10px]"
                        : "w-full text-left text-[10px]"
                    }
                  >
                    {item.sender.username === user.username
                      ? "You"
                      : user.username}
                  </Text> */}
                  <View
                    className={
                      item.sender.username === user?.username
                        ? "bg-teal-400 p-3 rounded-l-lg rounded-tr-lg"
                        : "bg-teal-300 p-3 rounded-r-lg rounded-tl-lg"
                    }
                  >
                    <Text className="text-md text-teal-950">
                      {item.message}
                    </Text>
                  </View>
                </View>
              );
            }
          })}
        </ScrollView>
        <View className="flex-row w-full justify-between mb-4 divide-x px-4 h-12 divide-teal-700">
          <View className="w-3/4">
            <TextInput
              className="bg-teal-200 rounded-l-lg px-2 h-full text-teal-800 text-lg"
              placeholder="Message..."
              value={chatInput}
              onChangeText={(value) => setChatInput(value)}
            />
          </View>
          <View className="justify-center items-center w-1/4 bg-teal-200 rounded-r-lg">
            <Pressable onPress={() => sendMessage()}>
              <MaterialIcons name="send" size={28} color="rgb(15 118 110)" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View className="bg-teal-100 h-full pb-4">
      <Stack.Screen
        options={{
          headerTitle: "Chat App",
          headerLeft: () => {},
          headerRight: () => (
            <Ionicons
              name="settings-outline"
              size={24}
              color="rgb(17 94 89)"
              onPress={() => {
                router.push({
                  pathname: "/settings",
                  params: user,
                });
              }}
            />
          ),
        }}
      />
      {/* <Text className="text-2xl p-5 text-teal-900">Hello, {user.username}</Text> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="divide-y divide-teal-800"
      >
        {users.map((u, i) => {
          if (u.userId != user.userId) {
            return (
              <Pressable
                key={i}
                className="flex-row items-center pl-4"
                onPress={() => connectRoom(u)}
              >
                <EvilIcons name="user" size={50} color="rgb(17 94 89)" />
                <Text className="bg-teal-100 p-4">
                  <Text className="text-2xl text-teal-800">{u?.username}</Text>
                </Text>
              </Pressable>
            );
          }
        })}
      </ScrollView>
    </View>
  );
};

export default indexPage;
