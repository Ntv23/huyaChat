import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../Firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import styles from "../../Components/authStyle";

const logoImage = require("../../../assets/HuYa1.png");
const loadingAnimation = require("../../../assets/loading.json");

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handlePasswordReset = async () => {
    if (!email || !username) {
      Alert.alert(
        "Không được bỏ trống",
        "Vui lòng nhập cả tên đăng nhập và email."
      );
      return;
    }

    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "usernames", username));
      if (userDoc.exists()) {
        const storedEmail = userDoc.data().email;
        if (storedEmail === email) {
          await sendPasswordResetEmail(auth, email);
          Alert.alert(
            "Thành công",
            "Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn."
          );
          navigation.navigate("Signin"); // Quay lại màn hình đăng nhập
        } else {
          Alert.alert("Lỗi", "Email không khớp với tên đăng nhập.");
        }
      } else {
        Alert.alert("Lỗi", "Tên đăng nhập không tồn tại.");
      }
    } catch (error) {
      Alert.alert("Lỗi", `Có lỗi xảy ra: ${error.message}`);
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
        <TouchableOpacity
          style={styles.button}
          onPress={handlePasswordReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Gửi yêu cầu khôi phục</Text>
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
          <Text style={styles.loadingText}>Đang gửi yêu cầu...</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}
