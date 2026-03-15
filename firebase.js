import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

// Tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.getElementById('login-form').classList.toggle('hidden', target !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', target !== 'register');
    document.getElementById('auth-error').classList.add('hidden');
  });
});

// Password toggle functionality
document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
button.innerHTML = isPassword
  ? '<img src="hide.png" class="eye-icon" />'
  : '<img src="visible.png" class="eye-icon" />';
  });
});

function showError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

// Email login
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'index.html';
  } catch (err) {
    showError('Invalid email or password.');
  }
});

// Email register
document.getElementById('register-btn').addEventListener('click', async () => {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    window.location.href = 'index.html';
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      showError('Email already in use.');
    } else if (err.code === 'auth/weak-password') {
      showError('Password must be at least 6 characters.');
    } else {
      showError('Something went wrong. Try again.');
    }
  }
});

// Google login
document.getElementById('google-login-btn').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = 'index.html';
  } catch (err) {
    showError('Google sign-in failed. Try again.');
  }
});

// Google register
document.getElementById('google-register-btn').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = 'index.html';
  } catch (err) {
    showError('Google sign-in failed. Try again.');
  }
});