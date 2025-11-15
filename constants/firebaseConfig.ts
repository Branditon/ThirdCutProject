import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBT2Zro7SPu0pBPA6cSocFXj9D_4jf74WA",
  authDomain: "third-cut-project.firebaseapp.com",
  projectId: "third-cut-project",
  storageBucket: "third-cut-project.firebasestorage.app",
  messagingSenderId: "450164701910",
  appId: "1:450164701910:web:ea4cc223145aad12eb2777"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);