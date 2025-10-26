// konfigurasi firebase buat projek ini
const firebaseConfig = {
  apiKey: "AIzaSyBOie85uU9qkFmYfdThO_nMHSd2IjNlre0",
  authDomain: "vvirtual-lab-project-fd049.firebaseapp.com",
  projectId: "virtual-lab-project-fd049",
  storageBucket: "virtual-lab-project-fd049.firebasestorage.app",
  messagingSenderId: "786554435459",
  appId: "1:786554435459:web:ecd41c6e307db531f7a8b6"
};

// inisialisasi firebase
firebase.initializeApp(firebaseConfig);

// bikin variabel buat auth sama database biar gampang dipanggil
const auth = firebase.auth();
const db = firebase.firestore();