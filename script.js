import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCY5-w3jLyC9iXN8Kh26wGIVia1zGuGwyk",
  authDomain: "gym-management-50b12.firebaseapp.com",
  projectId: "gym-management-50b12",
  storageBucket: "gym-management-50b12.appspot.com",
  messagingSenderId: "202067078338",
  appId: "1:202067078338:web:6ad435b248f3230d7cdf5b",
  measurementId: "G-SNPQXVF7VF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let isSignUp = false;

window.toggleForm = () => {
  isSignUp = !isSignUp;
  document.getElementById("form-title").textContent = isSignUp ? "Sign Up" : "Sign In";
  document.getElementById("action-btn").textContent = isSignUp ? "Sign Up" : "Sign In";
  document.getElementById("toggle-form").innerHTML = isSignUp
    ? `Already have an account? <a href="#" onclick="toggleForm()">Sign In</a>`
    : `Don't have an account? <a href="#" onclick="toggleForm()">Sign Up</a>`;
  document.getElementById("msg").textContent = "";
};

window.handleAuth = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msgEl = document.getElementById("msg");

  if (!email || !password) {
    msgEl.textContent = "Please fill all fields.";
    return;
  }

  msgEl.textContent = "Loading...";

  if (isSignUp) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCred) => {
        sendEmailVerification(userCred.user);
        msgEl.textContent = "Sign Up successful! Please verify your email.";
      })
      .catch((err) => (msgEl.textContent = err.message));
  } else {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCred) => {
        if (!userCred.user.emailVerified) {
          msgEl.textContent = "Please verify your email before signing in.";
          return;
        }

        const user = userCred.user;

        if (email === "vaibhavmalbhage@gmail.com") {
          // Admin user
          window.location.href = "/admin-dashboard.html";
        } else {
          const docRef = doc(db, "gyms", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            window.location.href = "/gym-dashboard.html";
          } else {
            window.location.href = "/create-profile.html";
          }
        }

        msgEl.textContent = "Login successful ✅";
      })
      .catch((err) => (msgEl.textContent = err.message));
  }
};

window.googleSignIn = () => {
  const msgEl = document.getElementById("msg");

  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;

      if (!user.emailVerified) {
        msgEl.textContent = "Please verify your email before signing in.";
        return;
      }

      if (user.email === "vaibhavmalbhage@gmail.com") {
        window.location.href = "/admin-dashboard.html";
      } else {
        const docRef = doc(db, "gyms", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          window.location.href = "/gym-dashboard.html";
        } else {
          window.location.href = "/create-profile.html";
        }
      }

      msgEl.textContent = `Welcome, ${user.displayName}`;
    })
    .catch((error) => {
      msgEl.textContent = error.message;
    });
};

window.forgotPassword = () => {
  const email = prompt("Enter your registered email for password reset:");
  if (email) {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        document.getElementById("msg").textContent =
          "Password reset email sent!";
      })
      .catch((error) => {
        document.getElementById("msg").textContent = error.message;
      });
  }
};
