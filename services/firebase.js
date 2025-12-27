// services/firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAgy5KijFeAyXdqirWVuzuVqZny5x8gfTc",
  authDomain: "habits-tracking-30d96.firebaseapp.com",
  projectId: "habits-tracking-30d96",
  storageBucket: "habits-tracking-30d96.firebasestorage.app",
  messagingSenderId: "857172371568",
  appId: "1:857172371568:web:79908beb262f991b4b6cb5",
};

export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
