// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLZ-vvypRfbsylu0EswwKYZpiXl5FEfY4",
  authDomain: "tdfilexfer.firebaseapp.com",
  projectId: "tdfilexfer",
  storageBucket: "tdfilexfer.appspot.com",
  messagingSenderId: "543726519973",
  appId: "1:543726519973:web:c22cc3ffda19d2516c6f4c",
  measurementId: "G-4H3NJ5XM47",
  databaseURL: "https://tdfilexfer-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getDatabase(app);

window.db = db;
window.ref = ref;
window.set = set;
window.get = get;
window.remove = remove;