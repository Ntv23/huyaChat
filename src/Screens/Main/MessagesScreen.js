import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  limit,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import CustomHeader from "../../Components/CustomHeader";

export default function MessagesScreen({ navigation }) {
  const [recentChats, setRecentChats] = useState([]);
  const [userAvatars, setUserAvatars] = useState({});
  const [userNames, setUserNames] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const auth = getAuth();
  const db = getFirestore();

  // Tạo chatId
  const createChatId = (user1, user2) => {
    return [user1, user2].sort().join("_");
  };

  // Hook useEffect để lấy danh sách các cuộc trò chuyện gần đây
  useEffect(() => {
    const fetchRecentChats = async () => {
      const user = auth.currentUser;
      if (user) {
        // Lấy collection 'chats' của người dùng hiện tại từ Firestore
        const recentChatsCollection = collection(
          db,
          "recentChats",
          user.uid,
          "chats"
        );
        // Tạo truy vấn để sắp xếp các cuộc trò chuyện theo thời gian tạo giảm dần
        const q = query(recentChatsCollection, orderBy("createdAt", "desc"));

        // Lắng nghe sự thay đổi dữ liệu trong collection
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const chatsList = [];
          const seenUsers = new Set();

          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const recipientId = data.user._id;

            // Thêm cuộc trò chuyện vào danh sách nếu chưa thấy người nhận
            if (!seenUsers.has(recipientId)) {
              seenUsers.add(recipientId);
              chatsList.push({
                ...data,
                _id: doc.id,
                recipientId,
              });
            }
          });

          // Cập nhật danh sách trò chuyện gần đây vào state
          setRecentChats(chatsList);
        });

        // Hủy đăng ký lắng nghe khi component bị hủy
        return () => unsubscribe();
      }
    };

    fetchRecentChats();
  }, [auth.currentUser]);

  // Hook useEffect để lấy thông tin người dùng và tin nhắn cuối cùng
  useEffect(() => {
    const fetchUserDetails = async () => {
      const avatars = {};
      const names = {};
      const messages = {};
      const userIds = new Set(recentChats.map((chat) => chat.recipientId));

      const user = auth.currentUser;
      if (user) {
        // Lấy thông tin user
        const currentUserDocRef = doc(db, "users", user.uid);
        const currentUserDocSnap = await getDoc(currentUserDocRef);
        const currentUserName = currentUserDocSnap.exists()
          ? currentUserDocSnap.data().username
          : "Unknown";

        for (const userId of userIds) {
          const recipientDocRef = doc(db, "users", userId);
          const recipientDocSnap = await getDoc(recipientDocRef);
          if (recipientDocSnap.exists()) {
            const recipientData = recipientDocSnap.data();
            const recipientName = recipientData.username || "Unknown";

            // Bỏ qua nếu tên của trùng với tên của user
            if (recipientName !== currentUserName) {
              avatars[userId] =
                recipientData.avatar ||
                "https://upload.wikimedia.org/wikipedia/commons/9/99/Exampleavatar.png";
              names[userId] = recipientName;

              // Tạo chatId và lấy tin nhắn cuối cùng
              const chatId = createChatId(user.uid, userId);
              const privateChatsRef = collection(
                db,
                "privateChats",
                chatId,
                "messages"
              );
              const q = query(
                privateChatsRef,
                orderBy("createdAt", "desc"),
                limit(1)
              );
              const lastMessageSnapshot = await getDocs(q);
              if (!lastMessageSnapshot.empty) {
                messages[userId] = lastMessageSnapshot.docs[0].data().text;
              } else {
                messages[userId] = "Không có tin nhắn";
              }
            }
          } else {
            console.log(`Không có dữ liệu cho userId: ${userId}`);
          }
        }
      }

      // Cập nhật thông tin người dùng và tin nhắn vào state
      setUserAvatars(avatars);
      setUserNames(names);
      setLastMessages(messages);
    };

    // Gọi hàm fetchUserDetails khi danh sách cuộc trò chuyện gần đây có dữ liệu
    if (recentChats.length) {
      fetchUserDetails();
    }
  }, [recentChats]);

  const handleChatPress = (chat) => {
    const chatId = createChatId(auth.currentUser.uid, chat.recipientId);
    navigation.navigate("ChatWindow", {
      chatId,
      recipientId: chat.recipientId,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleChatPress(item)}
      style={styles.chatItem}
    >
      <Image
        source={{ uri: userAvatars[item.recipientId] }}
        style={styles.avatar}
      />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{userNames[item.recipientId]}</Text>
        <Text style={styles.chatMessage}>{lastMessages[item.recipientId]}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <CustomHeader title="Tin nhắn" />
      <View style={styles.container}>
        <FlatList
          data={recentChats}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    marginTop: 40,
  },
  chatItem: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatMessage: {
    fontSize: 14,
    color: "#555",
  }
})