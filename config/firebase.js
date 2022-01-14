// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAorsrWhR5gUECbYIeO0i6jxgGS25ggtP4",
  authDomain: "bsp-learning-backend.firebaseapp.com",
  projectId: "bsp-learning-backend",
  storageBucket: "bsp-learning-backend.appspot.com",
  messagingSenderId: "230052507064",
  appId: "1:230052507064:web:05d7b6c49d4f5d406eb34d",
  measurementId: "G-JECMBX0BTP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);