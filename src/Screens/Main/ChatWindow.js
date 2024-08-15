import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
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
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";

export default function ChatWindow() {
  const route = useRoute();
  const { chatId, recipientId } = route.params;
  const [messages, setMessages] = useState([]);
  const [recipientName, setRecipientName] = useState("");
  const [recipientAvatar, setRecipientAvatar] = useState("");
  const [recipientStatus, setRecipientStatus] = useState("");
  const [userDetails, setUserDetails] = useState({
    _id: "unknown",
    name: "User",
    avatar:
      "https://upload.wikimedia.org/wikipedia/commons/9/99/Exampleavatar.png",
  });
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();

  // Lấy danh sách tin nhắn trong cuộc trò chuyện
  useEffect(() => {
    const fetchMessages = async () => {
      const messagesCollection = collection(
        db,
        "privateChats",
        chatId,
        "messages"
      );
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
            type: data.type,
            status: data.status,
          };
        });
        setMessages(messagesList);
      });

      return () => unsubscribe();
    };

    fetchMessages();
  }, [chatId]);

  // Lấy tên và thông tin người nhận
  useEffect(() => {
    const fetchRecipientData = async () => {
      const recipientDocRef = doc(db, "users", recipientId);
      const recipientDocSnap = await getDoc(recipientDocRef);
      if (recipientDocSnap.exists()) {
        const recipientData = recipientDocSnap.data();
        setRecipientName(recipientData.username);
        setRecipientAvatar(
          recipientData.avatar ||
            "https://upload.wikimedia.org/wikipedia/commons/9/99/Exampleavatar.png"
        );
        setRecipientStatus(recipientData.status || "");
      }
    };

    fetchRecipientData();
  }, [recipientId]);

  // Lấy thông tin người dùng
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

  // Cập nhật tiêu đề của header
  useLayoutEffect(() => {
    const updateHeaderOptions = async () => {
      const isFriend = await checkIfFriends();

      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Image
              source={{
                uri:
                  recipientAvatar ||
                  "https://upload.wikimedia.org/wikipedia/commons/9/99/Exampleavatar.png",
              }}
              style={styles.headerAvatar}
            />
            <View>
              <Text style={styles.headerTitle}>{recipientName}</Text>
              <Text style={styles.headerStatus}>{recipientStatus}</Text>
            </View>
          </View>
        ),
        headerStyle: { backgroundColor: "#891C00" },
        headerTintColor: "#FFFFFF",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("MessagesScreen", { chatId })}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerRight: () =>
          !isFriend ? (
            <TouchableOpacity onPress={handleAddPress} style={styles.addButton}>
              <Entypo name="add-user" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null,
      });
    };

    updateHeaderOptions();
  }, [navigation, recipientAvatar, recipientName, recipientStatus]);

  const checkIfFriends = async () => {
    const user = auth.currentUser;
    if (user) {
      // Lấy danh sách bạn bè của người dùng hiện tại
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userFriends = userData.friends || [];

        // Kiểm tra xem người nhận có trong danh sách bạn bè của người dùng hiện tại không
        const isFriend = userFriends.includes(recipientId);
        return isFriend;
      }
    }
    return false;
  };

  //Dialog xác nhận thêm bạn
  const handleAddPress = () => {
    Alert.alert(
      "Xác nhận",
      "Thêm người này vào danh sách bạn bè?",
      [
        { text: "Không", style: "cancel" },
        { text: "OK", onPress: sendFriendRequest },
      ],
      { cancelable: false }
    );
  };

  // Kiểm tra trạng thái yêu cầu kết bạn đã gửi
  const checkIfRequestSent = async () => {
    const messagesCollection = collection(
      db,
      "privateChats",
      chatId,
      "messages"
    );
    const q = query(messagesCollection, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    const messagesList = snapshot.docs.map((doc) => doc.data());

    return messagesList.some(
      (message) =>
        message.type === "friend_request" &&
        message.user._id === userDetails._id &&
        message.status === "pending"
    );
  };

  // Gửi yêu cầu kết bạn
  const sendFriendRequest = async () => {
    const user = auth.currentUser;
    if (user) {
      const requestSent = await checkIfRequestSent();

      if (requestSent) {
        Alert.alert("Thông báo", "Yêu cầu kết bạn đã được gửi trước đó.");
        return;
      }

      const friendRequestMessage = {
        _id: new Date().getTime().toString(), // Tạo ID tin nhắn duy nhất
        text: "Người dùng yêu cầu kết bạn", // Text tin nhắn
        createdAt: new Date(), // Thời gian gửi yêu cầu
        user: {
          _id: user.uid, // ID của người gửi
          name: userDetails.name || "User", // Đảm bảo có giá trị hợp lệ
          avatar: userDetails.avatar, // Avatar của người gửi
        },
        type: "friend_request", // Loại tin nhắn
        status: "pending", // Trạng thái yêu cầu
      };
      await addDoc(
        collection(db, "privateChats", chatId, "messages"),
        friendRequestMessage
      );
      Alert.alert("Thông báo", "Yêu cầu kết bạn đã được gửi.");
    }
  };

  // Thêm dữ  liệu trò chuyện vào firestore
  const onSend = async (newMessages = []) => {
    const { _id, createdAt, text, user } = newMessages[0];

    // Xác định người tham gia là một mảng của cả hai người dùng
    const participants = [userDetails._id, recipientId];

    await Promise.all([
      // Thêm dữ liệu tin nhắn vào privateChats collection
      addDoc(collection(db, "privateChats", chatId, "messages"), {
        _id,
        text,
        createdAt,
        user,
        type: "message",
      }),
      // thêm dữ liệu tin nhắn vào cả 2 user
      ...participants.map((participant) =>
        addDoc(collection(db, "recentChats", participant, "chats"), {
          chatId,
          text,
          createdAt,
          user: {
            _id: userDetails._id,
            name: userDetails.name,
            avatar: userDetails.avatar,
          },
        })
      ),
    ]);
  };

  // Tùy chỉnh giao diện nút gửi
  const renderSend = (props) => (
    <Send {...props}>
      <View style={styles.sendingContainer}>
        <FontAwesome name="send" size={24} color="#A36659" />
      </View>
    </Send>
  );

  // Tùy chỉnh giao diện bọt tin nhắn
  const renderBubble = (props) => {
    // Kiểm tra nếu tin nhắn là yêu cầu kết bạn và không phải của người gửi hiện tại
    if (
      props.currentMessage.type === "friend_request" &&
      props.currentMessage.user._id !== userDetails._id
    ) {
      return (
        <View style={styles.friendRequestContainer}>
          <Text style={styles.friendRequestText}>
            {props.currentMessage.text}
          </Text>
          <View style={styles.friendRequestButtons}>
            <TouchableOpacity
              style={styles.friendRequestButton}
              onPress={() => handleAcceptFriendRequest(props.currentMessage)}
            >
              <Text style={styles.friendRequestButtonText}>Đồng ý</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.friendRequestButton}
              onPress={() => handleDeclineFriendRequest(props.currentMessage)}
            >
              <Text style={styles.friendRequestButtonText}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Hiển thị bong bóng tin nhắn thông thường nếu không phải là yêu cầu kết bạn
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#63B6D7",
          },
          left: {
            backgroundColor: "#A36659",
          },
        }}
        textStyle={{
          right: {
            color: "#fff",
          },
          left: {
            color: "#fff",
          },
        }}
      />
    );
  };

  // Xử lý chấp nhận yêu cầu kết bạn
  const handleAcceptFriendRequest = async (message) => {
    const user = auth.currentUser;
    if (user) {
      // Cập nhật yêu cầu kết bạn thành 'accepted'
      const messageDocRef = doc(
        db,
        "privateChats",
        chatId,
        "messages",
        message._id
      );
      await updateDoc(messageDocRef, { status: "accepted" });

      // Gửi tin nhắn phản hồi cho người gửi yêu cầu
      const responseMessage = {
        _id: new Date().getTime().toString(), // Tạo ID tin nhắn duy nhất
        text: "Yêu cầu kết bạn đã được chấp nhận", // Text tin nhắn phản hồi
        createdAt: new Date(), // Thời gian gửi tin nhắn phản hồi
        user: {
          _id: user.uid, // ID của người gửi
          name: userDetails.name || "User", // Đảm bảo có giá trị hợp lệ
          avatar: userDetails.avatar, // Avatar của người gửi
        },
        type: "friend_response", // Loại tin nhắn
        status: "accepted", // Trạng thái yêu cầu
      };
      await addDoc(
        collection(db, "privateChats", chatId, "messages"),
        responseMessage
      );

      // Xóa tin nhắn yêu cầu kết bạn
      await deleteDoc(messageDocRef);

      // Cập nhật danh sách bạn bè của người gửi và người nhận
      await updateFriendLists(message.user._id);
    }
  };

  // Xử lý từ chối yêu cầu kết bạn
  const handleDeclineFriendRequest = async (message) => {
    const user = auth.currentUser;
    if (user) {
      // Cập nhật yêu cầu kết bạn thành 'declined'
      const messageDocRef = doc(
        db,
        "privateChats",
        chatId,
        "messages",
        message._id
      );
      await updateDoc(messageDocRef, { status: "declined" });

      // Gửi tin nhắn phản hồi cho người gửi yêu cầu
      const responseMessage = {
        _id: new Date().getTime().toString(), // Tạo ID tin nhắn duy nhất
        text: "Yêu cầu bị từ chối", // Text tin nhắn phản hồi
        createdAt: new Date(), // Thời gian gửi tin nhắn phản hồi
        user: {
          _id: user.uid, // ID của người gửi
          name: userDetails.name || "User", // Đảm bảo có giá trị hợp lệ
          avatar: userDetails.avatar, // Avatar của người gửi
        },
        type: "friend_response", // Loại tin nhắn
        status: "declined", // Trạng thái yêu cầu
      };
      await addDoc(
        collection(db, "privateChats", chatId, "messages"),
        responseMessage
      );

      // Xóa tin nhắn yêu cầu kết bạn
      await deleteDoc(messageDocRef);
    }
  };

  const updateFriendLists = async (friendId) => {
    const user = auth.currentUser;
    if (user) {
      // Cập nhật danh sách bạn bè của người gửi
      const senderDocRef = doc(db, "users", user.uid);
      const senderDocSnap = await getDoc(senderDocRef);
      if (senderDocSnap.exists()) {
        const senderData = senderDocSnap.data();
        const senderFriends = senderData.friends || [];
        if (!senderFriends.includes(friendId)) {
          senderFriends.push(friendId);
          await updateDoc(senderDocRef, { friends: senderFriends });
        }
      }

      // Cập nhật danh sách bạn bè của người nhận
      const recipientDocRef = doc(db, "users", friendId);
      const recipientDocSnap = await getDoc(recipientDocRef);
      if (recipientDocSnap.exists()) {
        const recipientData = recipientDocSnap.data();
        const recipientFriends = recipientData.friends || [];
        if (!recipientFriends.includes(user.uid)) {
          recipientFriends.push(user.uid);
          await updateDoc(recipientDocRef, { friends: recipientFriends });
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={userDetails}
        renderSend={renderSend}
        renderBubble={renderBubble}
        alwaysShowSend
        placeholder="Nhập tin nhắn..."
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerStatus: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  backButton: {
    marginLeft: 10,
  },
  addButton: {
    marginRight: 10,
  },
  sendingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  friendRequestContainer: {
    padding: 10,
    backgroundColor: "#95372B",
    borderRadius: 10,
  },
  friendRequestText: {
    color: "#fff",
    marginBottom: 5,
    fontWeight: "bold",
  },
  friendRequestButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  friendRequestButtonText: {
    color: "#fff",
  },
})