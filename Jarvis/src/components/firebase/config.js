import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB-g9ywC1dS_SjWosERzlisSJ5Jm6C5vkI",
  authDomain: "jarvis-7726a.firebaseapp.com",
  projectId: "jarvis-7726a",
  storageBucket: "jarvis-7726a.firebasestorage.app",
  messagingSenderId: "849104130733",
  appId: "1:849104130733:web:e1330d477f94d21b986c24"
};

const app = initializeApp(firebaseConfig);

export default app;