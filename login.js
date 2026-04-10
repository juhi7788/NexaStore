// js/login.js

const firebaseConfig = {
  apiKey: "AIzaSyAyknjeM9e8lvwBeogJvAly4834VpdoHiI",
  authDomain: "nexastore-42d24.firebaseapp.com",
  projectId: "nexastore-42d24",
  appId: "1:671073555026:web:d28e98db87f6070308058b"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Check if admin is already logged in
auth.onAuthStateChanged(user => {
  if (user) {
    window.location.href = "admin.html"; // Redirect to admin dashboard
  }
});

// Login Function
function loginAdmin() {
  const email = document.getElementById('adminEmail').value;
  const pass = document.getElementById('adminPassword').value;
  const errorMsg = document.getElementById('error-msg');
  const btn = document.getElementById('loginBtn');
  
  if(!email || !pass) {
    errorMsg.innerText = "Please fill both email and password!";
    errorMsg.style.display = "block";
    return;
  }

  // Visual feedback
  btn.innerText = "Verifying...";
  errorMsg.style.display = "none";

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      btn.style.background = "#32ff7e";
      btn.innerText = "Access Granted ✓";
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 500);
    })
    .catch((error) => {
      btn.innerText = "Authorize Access →";
      errorMsg.innerText = "Incorrect Email or Password! Access Denied.";
      errorMsg.style.display = "block";
      
      // Shake effect on error (optional nice touch)
      const form = document.querySelector('.login-form');
      form.style.transform = "translateX(5px)";
      setTimeout(() => form.style.transform = "translateX(-5px)", 100);
      setTimeout(() => form.style.transform = "translateX(0)", 200);
    });
}

// Allow pressing 'Enter' to submit
document.getElementById('adminPassword').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      loginAdmin();
    }
});
