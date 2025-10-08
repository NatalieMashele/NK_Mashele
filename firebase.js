import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDwKbfi4DDqmTfQ-h8_iAjWAB_1rhpYMEM",
  authDomain: "shopez-f3bd0.firebaseapp.com",
  projectId: "shopez-f3bd0",
  storageBucket: "shopez-f3bd0.appspot.com",
  messagingSenderId: "679838263811",
  appId: "1:679838263811:web:2042dedb319a4c811d3c36",
  measurementId: "G-95770JT66V",
  databaseURL: "https://shopez-f3bd0-default-rtdb.firebaseio.com/",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);
const realtimeDB = getDatabase(app);

export { app, auth, db, storage, realtimeDB };
