import { Stack } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { Pressable, Text, TextInput, View, ScrollView } from "react-native";
import { io } from "socket.io-client";

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
      <View className="justify-center h-full items-center">
        <Stack.Screen options={{ headerTitle: "Login" }} />
        <View className="bg-orange-400 rounded-md p-5 items-center">
          <Text className="mb-1 text-lg text-orange-900">Enter Your Name</Text>
          <TextInput
            className="my-1 border-2 border-orange-900 rounded-md w-52 px-2 text-lg text-orange-900"
            placeholder="username..."
            defaultValue={userInput}
            onChangeText={(value) => setUserInput(value)}
          />
          <Pressable
            onPress={() => handleJoin()}
            className="bg-orange-700 rounded-md w-full mt-1"
          >
            <Text className="mx-2 my-1 text-lg">Join</Text>
          </Pressable>
        </View>
      </View>
    );
  }
  if (chatArea) {
    return (
      <View className="h-full w-full justify-between">
        <Stack.Screen
          options={{
            headerTitle: room.username,
            headerLeft: () => (
              <Text
                onPress={() => setChatArea(false)}
                style={{
                  paddingRight: 20,
                }}
              >
                Back
              </Text>
            ),
          }}
        />
        <ScrollView
          ref={scrollViewRef}
          className="w-full mt-2"
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
                  <Text
                    className={
                      item.sender.username === user.username
                        ? "w-full text-right text-[10px]"
                        : "w-full text-left text-[10px]"
                    }
                  >
                    {item.sender.username === user.username
                      ? "You"
                      : user.username}
                  </Text>
                  <View
                    className={
                      item.sender.username === user?.username
                        ? "bg-green-400 p-3 rounded-l-lg rounded-tr-lg"
                        : "bg-gray-300 p-3 rounded-r-lg rounded-tl-lg"
                    }
                  >
                    <Text>{item.message}</Text>
                  </View>
                </View>
              );
            }
          })}
        </ScrollView>
        <View className="flex-row w-[80%] justify-between">
          <View className="w-full">
            <TextInput
              className="border-2 p-5 "
              placeholder="Type here..."
              value={chatInput}
              onChangeText={(value) => setChatInput(value)}
            />
          </View>
          <View className="justify-center items-center w-[25%] border-2">
            <Pressable onPress={() => sendMessage()}>
              <Text>Send</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View>
      <Stack.Screen options={{ headerTitle: "Friends" }} />
      <Text className="text-2xl p-5">Hello {user.username}</Text>
      {users.map((u, i) => {
        if (u.userId != user.userId) {
          return (
            <View key={i} className="py-3 px-5">
              <Text
                className="bg-orange-300 p-6 border-2 rounded-[20px]"
                onPress={() => connectRoom(u)}
              >
                <Text className="text-xl">{u?.username}</Text>
              </Text>
            </View>
          );
        }
      })}
    </View>
  );
};

export default indexPage;
