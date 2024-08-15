import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  Modal,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
  Button,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth, db, database } from "../../Firebase/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { ref as databaseRef, set, get } from "firebase/database";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [avatar, setImage] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Exampleavatar.png"
  );
  const [user, setUser] = useState({
    username: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [imageContent, setimageContent] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Exampleavatar.png"
  );
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [postContent, setPostContent] = useState("");

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Quyền bị từ chối",
            "Bạn cần cấp quyền cho máy ảnh để chụp ảnh."
          );
        }
      }
    })();

    const getUserData = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        if (username) {
          setUser((prevUser) => ({ ...prevUser, username }));
        }
        const userId = auth.currentUser.uid;

        // Lấy dữ liệu từ Firestore
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.avatar) {
            setImage(userData.avatar);
          }
          if (userData.status) {
            setUser((prevUser) => ({ ...prevUser, status: userData.status }));
          }
        }
      } catch (error) {
        Alert.alert(
          "Lỗi",
          `Không thể tìm nạp dữ liệu người dùng: ${error.message}`
        );
      }
    };

    getUserData();
  }, []);

  const uploadImage = async (uri) => {
    setLoading(true);
    try {
      const storage = getStorage();
      const response = await fetch(uri);
      const blob = await response.blob();
      const userId = auth.currentUser.uid;
      const imageRef = storageRef(storage, `avatars/${userId}`);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      setImage(downloadURL);

      const avatarRef = databaseRef(database, `users/${userId}/avatar`);
      await set(avatarRef, downloadURL);

      // Lưu URL avatar vào Firestore
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, { avatar: downloadURL }, { merge: true });
    } catch (error) {
      Alert.alert("Lỗi", `Không thể upload ảnh: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0]?.uri;
      if (uri) {
        await uploadImage(uri);
      } else {
        Alert.alert("Lỗi", "Không có URL hình ảnh.");
      }
    } else {
      Alert.alert("Huỷ", "Không có hình ảnh nào được chọn.");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền bị từ chối",
        "Bạn cần cấp quyền cho máy ảnh để chụp ảnh."
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0]?.uri;
      if (uri) {
        await uploadImage(uri);
      } else {
        Alert.alert("Lỗi", "Không có URL hình ảnh.");
      }
    } else {
      Alert.alert("Huỷ", "Không có hình ảnh nào được chụp.");
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      "Thay ảnh đại diện",
      "",
      [
        { text: "Huỷ", style: "cancel" },
        { text: "Chọn từ thư viện", onPress: pickImage },
        { text: "Chụp ảnh", onPress: takePhoto },
      ],
      { cancelable: true }
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Signin");
    } catch (error) {
      console.error("Lỗi: ", error);
    }
  };

  const handleSettings = () => {
    navigation.navigate("SettingScreen");
  };

  const handleSaveStatus = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, { status: newStatus }, { merge: true });
      setUser((prevUser) => ({ ...prevUser, status: newStatus }));
      setModalVisible(false);
      Alert.alert("Thành công", "Cập nhật trạng thái thành công!");
    } catch (error) {
      Alert.alert("Lỗi", `Không thể cập nhật trạng thái: ${error.message}`);
    }
  };

  const handleEditStatus = () => {
    setNewStatus(user.status);
    setModalVisible(true);
  };

  const handleDeleteStatus = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, { status: "" }, { merge: true });
      setUser((prevUser) => ({ ...prevUser, status: "" }));
      setModalVisible(false);
      Alert.alert("Thành công", "Xóa trạng thái thành công!");
    } catch (error) {
      Alert.alert("Lỗi", `Không thể xóa trạng thái: ${error.message}`);
    }
  };

  const handlePostContent = async () => {
    setPostContent("");
    Alert.alert("Thông báo", `Đã đăng bài thành công`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
            <Icon name="settings" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Icon name="logout" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.statusContainer}
          onPress={handleEditStatus}
        >
          <Text style={styles.status}>
            {user.status || "Chỉnh sửa trạng thái"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.avatarBox}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleChangeAvatar}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#fff"
              style={styles.loadingOverlay}
            />
          ) : (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          )}
        </TouchableOpacity>
        <Text style={styles.username}>{user.username}</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.postButton}
          onPress={() => setPostModalVisible(true)}
        >
          <Text style={styles.postButtonText}>Đăng bài</Text>
        </TouchableOpacity>
        <View style={styles.innercontent}>
          <Image
            source={{ uri: imageContent }}
            style={styles.ImageContent}
            resizeMode="contain"
          />
          <Text style={styles.textContent}>
            {postContent || "Random content here..."}
          </Text>
        </View>
        <View style={styles.innercontent}>
          <Image
            source={{ uri: imageContent }}
            style={styles.ImageContent}
            resizeMode="contain"
          />
          <Text style={styles.textContent}>More random content...</Text>
        </View>
        <View style={styles.innercontent}>
          <Image
            source={{ uri: imageContent }}
            style={styles.ImageContent}
            resizeMode="contain"
          />
          <Text style={styles.textContent}>Even more random content...</Text>
        </View>
      </ScrollView>

      {/* Modal đăng bài */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={postModalVisible}
        onRequestClose={() => setPostModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Nhập nội dung bài đăng..."
              placeholderTextColor="#aaa"
              value={postContent}
              onChangeText={setPostContent}
              style={styles.textInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.button}
                onPress={handlePostContent}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Đăng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={handleDeleteStatus}
              >
                <Text style={styles.buttonText}>Thêm ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setPostModalVisible(false)}
              >
                <Text style={styles.buttonText}>Huỷ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal sửa trạng thái */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.statusInput}
              placeholder="Nhập trạng thái mới"
              placeholderTextColor="#aaa"
              value={newStatus}
              onChangeText={setNewStatus}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSaveStatus}
              >
                <Text style={styles.buttonText}>Cập nhật</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={handleDeleteStatus}
              >
                <Text style={styles.buttonText}>Xóa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Huỷ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  header: {
    height: 200,
    backgroundColor: "#89190D",
    borderBottomWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute", // Đặt thành absolute để header không bị ảnh hưởng bởi các phần tử khác
    top: 0, // Đặt phần trên cùng của header trùng với viền trên của màn hình
    left: 0,
    right: 0,
    zIndex: 1, // Đảm bảo rằng header nằm trên các phần tử khác
    borderBottomLeftRadius: 50, // Bỏ bo tròn góc dưới bên trái
    borderBottomRightRadius: 50, // Bo tròn góc trên bên phải
  },
  headerIcons: {
    position: "absolute",
    top: 50,
    right: 10,
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
  },
  statusContainer: {
    marginBottom: 30,
    alignItems: "center",
    width: "100%",
  },
  status: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  avatarBox: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1, // Nằm lớp trên
    marginTop: 175,
  },
  avatarContainer: {
    position: "absolute",
    bottom: -70, // Điều chỉnh vị trí của avatar để phù hợp với chiều cao mới của header
    borderRadius: 80,
    overflow: "hidden",
    alignItems: "center",
    width: 150,
    height: 150,
    zIndex: 1, // Nằm lớp trên
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 80,
  },
  username: {
    position: "absolute",
    bottom: -105,
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    backgroundColor: "#89190D",
    borderRadius: 10,
    paddingHorizontal: 10, // Tạo khoảng cách ngang giữa văn bản và biên nền
    paddingVertical: 5, // Tạo khoảng cách dọc giữa văn bản và biên nền
    borderWidth: Platform.OS === "ios" ? 2 : 0, // Add border cho iOS
    borderColor: "#fff",
  },
  content: {
    marginTop: 10,
    flex: 1,
    padding: 20,
    width: "100%",
  },
  innercontent: {
    width: "100%",
    alignItems: "center",
    borderColor: "#A36659",
    borderWidth: 2,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    flex: 1,
  },
  ImageContent: {
    width: "100%",
    height: 300,
    marginBottom: 10,
  },
  textContent: {
    fontSize: 14,
    textAlign: "left",
    width: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#891C00",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    elevation: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    padding: 10,
    borderRadius: 10,
    margin: 5,
    elevation: 3,
    backgroundColor: "#A36658",
  },
  buttonText: {
    color: "#fff",
  },
  postButton: {
    backgroundColor: "#95382B",
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
    height: 30,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
})
