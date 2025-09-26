import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBes4LSPUFcC55kd9SEIrtPeq9j_E2JWUM",
  authDomain: "vitadoc-d7115.firebaseapp.com",
  projectId: "vitadoc-d7115",
  storageBucket: "vitadoc-d7115.firebasestorage.app",
  messagingSenderId: "133394458137",
  appId: "1:133394458137:web:162dab36ced0da1150ec88",
  measurementId: "G-VXETY7KWSL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };