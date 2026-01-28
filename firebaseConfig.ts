import { initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do seu projeto Firebase (PartnerSync)
const firebaseConfig = {
  apiKey: "AIzaSyAIDaTs94vlc-p0PKX7esuEf28ee3XTP2Q",
  authDomain: "partnersync-9e3e0.firebaseapp.com",
  projectId: "partnersync-9e3e0",
  storageBucket: "partnersync-9e3e0.firebasestorage.app",
  messagingSenderId: "578417109196",
  appId: "1:578417109196:web:0faa9f6b394e286e6a3a69",
  measurementId: "G-FK9ST3C0LJ"
};

// Inicializa o Firebase
let app;
let auth;
let db;
let googleProvider;

try {
    app = initializeApp(firebaseConfig);
    auth = firebaseAuth.getAuth(app);
    db = getFirestore(app);
    googleProvider = new firebaseAuth.GoogleAuthProvider();
} catch (error) {
    console.error("Erro ao inicializar Firebase. Verifique se as chaves estão corretas.", error);
}

export { auth, db, googleProvider };