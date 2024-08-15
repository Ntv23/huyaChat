import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../Firebase/firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import styles from "../../Components/authStyle";

const logoImage = require("../../../assets/HuYa1.png");
const loadingAnimation = require("../../../assets/loading.json");

export default function Signin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const findUserEmailByUsername = async (username) => {
    const userDoc = await getDoc(doc(db, "usernames", username));
    if (userDoc.exists()) {
      return userDoc.data().email;
    } else {
      throw new Error("Tài khoản không tồn tại");
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Không được bỏ trống", "Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    try {
      const email = await findUserEmailByUsername(username);
      await signInWithEmailAndPassword(auth, email, password);
      // Lưu tên người dùng vào bộ nhớ cục bộ
      await AsyncStorage.setItem("username", username);
      // Đến trang Home khi đăng nhập thành công
      navigation.navigate("BottomTab");
    } catch (error) {
      Alert.alert("Lỗi", `Lỗi đăng nhập: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logoImage} style={styles.logo} />
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person"
            size={24}
            color="#A36658"
            style={styles.icon}
          />
          <TextInput
            placeholder="Tên đăng nhập"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed"
            size={24}
            color="#A36658"
            style={styles.icon}
          />
          <TextInput
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.link}>Quên mật khẩu</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </View>
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
  )
}
