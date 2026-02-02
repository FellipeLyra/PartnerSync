import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase (PartnerSync)
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
