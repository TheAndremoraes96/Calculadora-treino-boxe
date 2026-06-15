// ============================
// FIREBASE CONFIG
// ============================

const firebaseConfig = {
  apiKey: "AIzaSyCeJTCWuzNHWKB7Q3HgT1RroW-lsSGii7I",
  authDomain: "boxtimer-pro.firebaseapp.com",
  projectId: "boxtimer-pro",
  storageBucket: "boxtimer-pro.firebasestorage.app",
  messagingSenderId: "317922281138",
  appId: "1:317922281138:web:0cb75c7411c40589e12bab"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Serviços Firebase
const auth = firebase.auth();
const db = firebase.firestore();

console.log("Firebase conectado com sucesso!");
