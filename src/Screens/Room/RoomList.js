import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import LottieView from "lottie-react-native";
import CustomHeader from "../../Components/CustomHeader";
import { ImageBackground } from "react-native";

const loadingAnimation = require("../../../assets/loading.json");
const backgroundImage = require("../../../assets/cutegirl.jpg");

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy thông tin người dùng hiện tại
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    } else {
      // Người dùng chưa đăng nhập hoặc không tồn tại
      Alert.alert("Thông báo", "Bạn cần đăng nhập để tham gia phòng chat.");
      return; // Ngừng thực thi nếu người dùng chưa đăng nhập
    }

    const fetchRooms = async () => {
      const db = getFirestore();
      const roomsCollection = collection(db, "rooms");

      try {
        const unsubscribe = onSnapshot(roomsCollection, (snapshot) => {
          const roomsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRooms(roomsList);
        });

        // Cleanup function to unsubscribe from the snapshot listener
        return () => unsubscribe();
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng:", error);
        Alert.alert(
          "Thông báo",
          "Đã xảy ra lỗi khi lấy danh sách phòng. Vui lòng thử lại sau."
        );
      }
    };

    fetchRooms();
  }, [auth.currentUser]);

  const handleJoinRoom = async (roomId) => {
    if (!userId) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để tham gia phòng chat.");
      return;
    }
    setLoading(true); // Bắt đầu loading

    const db = getFirestore();
    const userDocRef = doc(db, "users", userId);
    const roomDocRef = doc(db, "rooms", roomId);

    try {
      // Kiểm tra xem tài liệu người dùng có tồn tại không
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        console.error("Tài liệu người dùng không tồn tại");
        Alert.alert(
          "Thông báo",
          "Tài liệu người dùng không tồn tại. Vui lòng kiểm tra lại."
        );
        setLoading(false); // Kết thúc loading
        return;
      }

      // Cập nhật người dùng vào phòng chat
      await updateDoc(userDocRef, { currentRoom: roomId });
      await updateDoc(roomDocRef, { users: arrayUnion(userId) });

      setLoading(false); // Kết thúc loading
      navigation.navigate("RoomDetail", { roomId });
    } catch (error) {
      console.error("Lỗi khi tham gia phòng:", error);
      Alert.alert(
        "Thông báo",
        "Đã xảy ra lỗi khi tham gia phòng. Vui lòng thử lại sau."
      );
      setLoading(false); // Kết thúc loading
    }
  };

  const renderRoomItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleJoinRoom(item.id)}
    >
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
      ></ImageBackground>
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <CustomHeader title="Giao lưu cộng đồng" />
      <SafeAreaView style={styles.container}>
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoomItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.contentContainer}
        />
        {loading && (
          <View style={styles.loadingOverlay}>
            <LottieView
              source={loadingAnimation}
              autoPlay
              loop
              style={styles.lottie}
            />
            <Text style={styles.loadingText}>Chờ một chút...</Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 20,
    marginTop: 80,
  },
  item: {
    flex: 1,
    padding: 15,
    margin: 10,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#95382B",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  backgroundImage: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 18,
    color: "#95382B",
    fontWeight: "bold",
    padding: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  contentContainer: {
    paddingBottom: 70,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  lottie: {
    width: 50,
    height: 50,
  },
})
