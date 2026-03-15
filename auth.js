import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwjCVfhrUCjhdwfhAvWx_Q6HR7bnQWID8",
  authDomain: "framevault-d8c0c.firebaseapp.com",
  projectId: "framevault-d8c0c",
  storageBucket: "framevault-d8c0c.firebasestorage.app",
  messagingSenderId: "883395498006",
  appId: "1:883395498006:web:e523fac89088b1985be537"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Show user name
    document.getElementById('user-name').textContent =
      '👤 ' + (user.displayName || user.email);
  } else {
    // Not logged in redirect to login
    window.location.href = 'login.html';
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});