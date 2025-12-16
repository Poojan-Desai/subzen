/* ============================================================
   SubZen — Settings Logic
   Handles user account info, dark mode, notifications, logout.
   ============================================================ */

import { supabase } from "./supabaseClient.js";

/* -------------------------------
   AUTO-REDIRECT IF NOT LOGGED IN
---------------------------------- */
async function checkAuth() {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    window.location.href = "auth.html";
  }
  return data.user;
}

const userEmailLabel = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

/* -------------------------------
   LOAD USER INFO
---------------------------------- */
async function loadUserInfo() {
  const user = await checkAuth();

  if (user && user.email) {
    userEmailLabel.textContent = user.email;
  }
}

/* -------------------------------
   LOGOUT
---------------------------------- */
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "auth.html";
});

/* -------------------------------
   DARK MODE TOGGLE
---------------------------------- */
const darkToggle = document.getElementById("darkModeToggle");

function applyDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

darkToggle.addEventListener("change", () => {
  const enabled = darkToggle.checked;
  localStorage.setItem("subzen_dark_mode", enabled ? "1" : "0");
  applyDarkMode(enabled);
});

/* Load saved preference */
const savedDark = localStorage.getItem("subzen_dark_mode") === "1";
darkToggle.checked = savedDark;
applyDarkMode(savedDark);

/* -------------------------------
   NOTIFICATION TOGGLE
---------------------------------- */
const notifyToggle = document.getElementById("notificationsToggle");

notifyToggle.addEventListener("change", () => {
  const enabled = notifyToggle.checked;
  localStorage.setItem("subzen_notifications", enabled ? "1" : "0");
});

/* Load saved preference */
notifyToggle.checked =
  localStorage.getItem("subzen_notifications") === "1";

/* -------------------------------
   INIT
---------------------------------- */
loadUserInfo();