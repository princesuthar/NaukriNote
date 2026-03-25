// Firebase app initialization and service exports for authentication and Firestore.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwAZHfUyTgGPPyNgI76sRkyHMWSYZMTVs",
  authDomain: "nokrinote.firebaseapp.com",
  projectId: "nokrinote",
  storageBucket: "nokrinote.firebasestorage.app",
  messagingSenderId: "990539364922",
  appId: "1:990539364922:web:409d960b7da6c8f8225303",
  measurementId: "G-Q8V5WFKSNK"
};
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
