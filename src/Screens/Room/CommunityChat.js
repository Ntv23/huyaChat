import React, { useState, useEffect } from "react";
import { View, SafeAreaView, StyleSheet, Text, Image } from "react-native";
import { GiftedChat, Send, Bubble } from "react-native-gifted-chat";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function CommunityChat({ route }) {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [userDetails, setUserDetails] = useState({
    _id: "unknown",
    name: "User",
    avatar:
      "https://upload.wikimedia.org/wikipedia/commons/9/99/Exampleavatar.png",
  });
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesCollection = collection(db, "rooms", roomId, "messages");
      const q = query(messagesCollection, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.text,
            createdAt: data.createdAt.toDate(),
            user: {
              _id: data.user._id,
              name: data.user.name,
              avatar: data.user.avatar,
            },
          };
        });
        setMessages(messagesList);
      });

      return () => unsubscribe();
    };

    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    const fetchRoomName = async () => {
      const roomDocRef = doc(db, "rooms", roomId);
      const roomDocSnap = await getDoc(roomDocRef);
      if (roomDocSnap.exists()) {
        setRoomName(roomDocSnap.data().name);
      }
    };

    fetchRoomName();
  }, [roomId]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserDetails({
            _id: user.uid,
            name: userData.username || user.displayName || "User",
            avatar:
              userData.avatar ||
              user.photoURL ||
              "https://upload.wikimedia.org/wikipedia/commons/9/99/Exampleavatar.png",
          });
        }
      }
    };

    fetchUserDetails();
  }, [auth.currentUser]);

  useEffect(() => {
    if (roomName) {
      navigation.setOptions({
        headerStyle: { backgroundColor: "#891C00" },
        headerTintColor: "#FFFFFF",
        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>{roomName}</Text>
          </View>
        ),
        headerLeft: () => (
          <Ionicons
            name="arrow-back-outline"
            size={24}
            color="#fff"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          />
        ),
      });
    }
  }, [navigation, roomName]);

  const onSend = async (newMessages = []) => {
    const { _id, createdAt, text, user } = newMessages[0];

    await addDoc(collection(db, "rooms", roomId, "messages"), {
      _id,
      text,
      createdAt,
      user,
    });
  };

  const renderSend = (props) => (
    <Send {...props}>
      <View style={styles.sendingContainer}>
        <FontAwesome name="send" size={24} color="#A36659" />
      </View>
    </Send>
  );

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#63B6D7",
          borderRadius: 15,
          padding: 10,
          margin: 5,
          flex: 1,
        },
        left: {
          backgroundColor: "#A36659",
          borderRadius: 15,
          padding: 10,
          margin: 5,
          flex: 1,
        },
      }}
      textStyle={{
        right: {
          color: "#fff",
          fontSize: 16,
        },
        left: {
          color: "#fff",
          fontSize: 16,
        },
      }}
      renderUsername={() => (
        <Text
          style={styles.usernameText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {props.currentMessage.user.name}
        </Text>
      )}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        renderUsernameOnMessage={true}
        user={userDetails}
        renderSend={renderSend}
        renderBubble={renderBubble}
        placeholder="Nhập tin nhắn..."
        alwaysShowSend
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    marginBottom: 90,
  },
  sendingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 5,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginLeft: 15,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  usernameText: {
    color: "#000", // Thay đổi màu sắc của tên người dùng
    paddingLeft: 10,
    fontSize: 14,
    maxWidth: "100%", // Giới hạn chiều rộng tên người dùng
  },
})
