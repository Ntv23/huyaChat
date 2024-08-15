import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  getFirestore,
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

export default function RoomDetail() {
  const route = useRoute();
  const { roomId } = route.params;
  const [users, setUsers] = useState([]);
  const [roomName, setRoomName] = useState("");
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : null;

  useEffect(() => {
    const fetchRoomData = async () => {
      const db = getFirestore();
      const roomDocRef = doc(db, "rooms", roomId);

      const roomDocSnap = await getDoc(roomDocRef);
      if (roomDocSnap.exists()) {
        const roomData = roomDocSnap.data();
        setRoomName(roomData.name);
      }
    };

    fetchRoomData();
  }, [roomId]);

  useEffect(() => {
    if (roomName) {
      navigation.setOptions({
        title: roomName,
        headerTitleAlign: "left",
        headerStyle: { backgroundColor: "#89190D" },
        headerTintColor: "#FFFFFF",
        headerLeft: null, // Loại bỏ nút bên trái
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              onPress={handleCommunityChat}
              style={styles.communityButton}
            >
              <Text style={styles.communityButtonText}>Trò chuyện</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLeaveRoom}
              style={styles.leaveRoomButton}
            >
              <Text style={styles.leaveRoomButtonText}>Thoát</Text>
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [navigation, roomName]);

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const roomDocRef = doc(db, "rooms", roomId);

      const unsubscribe = onSnapshot(roomDocRef, async (snapshot) => {
        const roomData = snapshot.data();
        if (roomData) {
          const userDetails = await Promise.all(
            roomData.users.map(async (userId) => {
              const userDocRef = doc(db, "users", userId);
              const userDocSnap = await getDoc(userDocRef);
              return { id: userId, ...userDocSnap.data() };
            })
          );

          // Sắp xếp người dùng theo tên
          const sortedUsers = userDetails.sort((a, b) =>
            a.username.localeCompare(b.username)
          );
          setUsers(sortedUsers);
        }
      });

      return () => unsubscribe();
    };

    fetchUsers();
  }, [roomId]);

  const handleCommunityChat = () => {
    navigation.navigate("CommunityChat", { roomId });
  };

  const handleLeaveRoom = async () => {
    if (!userId) return;

    const db = getFirestore();
    const userDocRef = doc(db, "users", userId);
    const roomDocRef = doc(db, "rooms", roomId);

    try {
      // Xóa người dùng khỏi phòng chat và cập nhật trạng thái currentRoom
      await updateDoc(userDocRef, { currentRoom: "" });
      await updateDoc(roomDocRef, { users: arrayRemove(userId) });

      // Điều hướng về màn hình danh sách phòng chat
      navigation.navigate("RoomList");
    } catch (error) {
      console.error("Lỗi khi rời khỏi phòng:", error);
    }
  };

  const handleChat = (recipientId, recipientName) => {
    if (recipientId === userId) return; // Không cho phép chat với chính mình
    // Tạo chatId cho cuộc trò chuyện giữa hai người
    const chatId = [userId, recipientId].sort().join("_");
    navigation.navigate("ChatWindow", { chatId, recipientId, recipientName });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => handleChat(item.id, item.username)}
    >
      <Image
        source={{
          uri:
            item.avatar ||
            "https://upload.wikimedia.org/wikipedia/commons/9/99/Exampleavatar.png",
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.status}>{item.status || ""}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 5, //khoảng cách dọc giữa các user
    backgroundColor: "transparent",
    borderRadius: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  username: {
    fontSize: 18,
    color: "#333",
  },
  status: {
    fontSize: 16,
    color: "#666",
    textAlign: "right",
  },
  headerRightContainer: {
    flexDirection: "row",
  },
  communityButton: {
    backgroundColor: "#A36658", // Màu nền của nút
    borderRadius: 15, // Bo viền nút
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 15,
    shadowColor: "black", // Màu bóng đổ
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Để tạo hiệu ứng nổi bật trên Android
  },
  communityButtonText: {
    color: "white", // Màu chữ của nút
    fontSize: 16,
    fontStyle: "bold",
  },
  leaveRoomButton: {
    backgroundColor: "#A36658", // Màu nền của nút
    borderRadius: 15, // Bo viền nút
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 15,
    shadowColor: "black", // Màu bóng đổ
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Để tạo hiệu ứng nổi bật trên Android
  },
  leaveRoomButtonText: {
    color: "white", // Màu chữ của nút
    fontSize: 16,
    fontStyle: "bold",
  },
})
