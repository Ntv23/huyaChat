import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDZqjvB3ieo8jk-8EDKeBZaxoPIzIgempY",
  authDomain: "huya-chat.firebaseapp.com",
  databaseURL: "https://huya-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "huya-chat",
  storageBucket: "huya-chat.appspot.com",
  messagingSenderId: "643344764416",
  appId: "1:643344764416:web:b0680fc96aeaac88d8d2e5",
  measurementId: "G-1JGE76JQRH"
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Auth với AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Khởi tạo Firestore
const db = getFirestore(app);
// Khởi tạo Realtime Database
const database = getDatabase(app);

export { auth, db, database  };
