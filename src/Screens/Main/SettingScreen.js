import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import LottieView from "lottie-react-native";

const loadingAnimation = require("../../../assets/loading.json");

export default function SettingScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalInfoVisible, setModalInfoVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Không được bỏ trống", "Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không trùng nhau");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      // Gọi hàm cập nhật đến firebase
      await reauthenticateWithCredential(user, credential);

      // cập nhật password
      await updatePassword(user, newPassword);
      Alert.alert("Thành công", "Đổi mật khẩu thành công.");
      setModalVisible(false);
    } catch (error) {
      console.error("Lỗi:", error);
      Alert.alert("Lỗi", "Mật khẩu cũ không đúng hoặc có lỗi khác.");
    } finally {
      setLoading(false);
    }
  };

  const handleCallPress = () => {
    let phoneNumber = "tel:+84919904939";
    Linking.openURL(phoneNumber).catch((err) => console.error("Error:", err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.buttonOpenModal}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonOpenModalText}>Đổi mật khẩu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonOpenModal}
          onPress={() => setModalInfoVisible(true)}
        >
          <Text style={styles.buttonOpenModalText}>Thông tin ứng dụng</Text>
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thay đổi mật khẩu</Text>
              <TextInput
                placeholder="Mật khẩu cũ"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={styles.input}
              />
              <TextInput
                placeholder="Mật khẩu mới"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
              />
              <TextInput
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#aaa"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleChangePassword}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Huỷ</Text>
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
            </View>
          </View>
        </Modal>

        <Modal
          transparent={true}
          visible={isModalInfoVisible}
          animationType="slide"
          onRequestClose={() => setModalInfoVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thông tin</Text>
              <Text style={styles.modalText}>
                Ứng dụng này được thiết kế để mang lại trải nghiệm chat đơn
                giản, và là một dự án học tập nhằm cải thiện kỹ năng lập trình
                và phát triển ứng dụng di động.
                {"\n\n"}
                Nếu bạn gặp bất kỳ sự cố nào trong quá trình sử dụng ứng dụng,
                vui lòng liên hệ với chúng tôi qua email: ngthaovy23@gmail.com.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCallPress}
                >
                  <Text style={styles.buttonText}>Liên hệ chúng tôi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setModalInfoVisible(false)}
                >
                  <Text style={styles.buttonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  buttonOpenModal: {
    backgroundColor: "#95382B",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 200, // Đảm bảo nút có độ rộng đều nhau
    height: 40,
    marginVertical: 10, // Khoảng cách giữa các nút
  },
  buttonOpenModalText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent
    borderRadius: 15,
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#891C00",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: "100%",
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    padding: 10,
    margin: 5,
    backgroundColor: "#A36658",
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  modalText: {
    color: "#fff",
    textAlign: "center",
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