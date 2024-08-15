import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Icon from "react-native-vector-icons/FontAwesome";
import CustomHeader from "../../Components/CustomHeader";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

const defaultAvatar =
  "https://upload.wikimedia.org/wikipedia/commons/9/99/Exampleavatar.png";

export default function FriendScreen() {
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation(); // Initialize useNavigation

  useEffect(() => {
    const fetchFriends = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const friendsList = userData.friends || [];
          const friendsDetails = await Promise.all(
            friendsList.map(async (friendId) => {
              const friendDocRef = doc(db, "users", friendId);
              const friendDocSnap = await getDoc(friendDocRef);
              if (friendDocSnap.exists()) {
                return { ...friendDocSnap.data(), uid: friendId };
              }
            })
          );
          setFriends(friendsDetails.filter(Boolean));
          setFilteredFriends(friendsDetails.filter(Boolean));
        }
      }
    };

    fetchFriends();
  }, [auth.currentUser]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredFriends(friends);
    } else {
      const query = searchQuery.toLowerCase();
      const results = friends.filter((friend) =>
        friend.username.toLowerCase().includes(query)
      );
      setFilteredFriends(results);
    }
  }, [searchQuery, friends]);

  const createChatId = (user1, user2) => {
    return [user1, user2].sort().join("_");
  };

  const handleFriendPress = (friend) => {
    const chatId = createChatId(auth.currentUser.uid, friend.uid);
    navigation.navigate("ChatWindow", {
      chatId,
      recipientId: friend.uid,
    });
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleFriendPress(item)}
    >
      <Image
        source={{ uri: item.avatar || defaultAvatar }}
        style={styles.avatar}
      />
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <CustomHeader title="Bạn bè" />
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bạn bè..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredFriends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.uid}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    padding: 10,
    marginTop: 100,
  },
  searchInput: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    top: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
  },
})