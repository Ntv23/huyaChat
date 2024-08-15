import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../Firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import LottieView from "lottie-react-native";
import styles from "../../Components/authStyle";

const logoImage = require("../../../assets/HuYa1.png");
const loadingAnimation = require("../../../assets/loading.json");

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Không được bỏ trống", "Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu và xác nhận mật khẩu không trùng nhau.");
      return;
    }
    setLoading(true);
    try {
      // Kiểm tra xem email đã tồn tại chưa
      const emailQuery = await getDoc(doc(db, "emails", email));
      if (emailQuery.exists()) {
        Alert.alert("Đăng ký không thành công", "Email đã được đăng ký.");
        setLoading(false);
        return;
      }

      // Kiểm tra xem username đã tồn tại chưa
      const usernameQuery = await getDoc(doc(db, "usernames", username));
      if (usernameQuery.exists()) {
        Alert.alert("Đăng ký không thành công", "Tên đăng nhập đã tồn tại.");
        setLoading(false);
        return;
      }

      // Tạo người dùng mới
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Lưu thông tin người dùng vào Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
      });

      // Lưu email để kiểm tra trùng lặp
      await setDoc(doc(db, "emails", email), {
        username: username,
      });

      // Lưu username để kiểm tra trùng lặp
      await setDoc(doc(db, "usernames", username), {
        email: email,
      });

      Alert.alert(
        "Đăng ký thành công",
        "Bạn đã đăng ký thành công. Vui lòng đăng nhập.",
        [{ text: "OK", onPress: () => navigation.navigate("Signin") }]
      );
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
            color="#A36659"
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
          <Ionicons name="mail" size={24} color="#A36659" style={styles.icon} />
          <TextInput
            placeholder="Nhập email của bạn"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed"
            size={24}
            color="#A36659"
            style={styles.icon}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed"
            size={24}
            color="#A36659"
            style={styles.icon}
          />
          <TextInput
            placeholder="Nhập lại Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Signin")}>
          <Text style={styles.link}>Đã có tài khoản? Đăng nhâp</Text>
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
