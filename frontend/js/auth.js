/* =========================================================
   SubZen Auth Logic (New Clean Version)
   ========================================================= */

// Import Supabase (module is loaded via supabaseClient.js)
import { supabase } from "./supabaseClient.js";

const emailInput = document.getElementById("authEmail");
const passwordInput = document.getElementById("authPassword");
const messageBox = document.getElementById("authMessage");

/* ---------------------------------------------------------
   HELPER — Show error or success message
--------------------------------------------------------- */
function showMessage(text, color = "#ff6b6b") {
  messageBox.style.color = color;
  messageBox.textContent = text;
}

/* ---------------------------------------------------------
   SIGN IN BUTTON
--------------------------------------------------------- */
document.getElementById("signInBtn")?.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  showMessage("");

  if (!email || !password) return showMessage("Please enter email & password");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return showMessage(error.message);
  }

  // SUCCESS
  showMessage("Signing in...", "#4ca4ff");
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 700);
});

/* ---------------------------------------------------------
   SIGN UP BUTTON
--------------------------------------------------------- */
document.getElementById("signUpBtn")?.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  showMessage("");

  if (!email || !password) return showMessage("Please enter email & password");

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return showMessage(error.message);
  }

  // SUCCESS
  showMessage("Account created! You may now sign in.", "green");
});

/* ---------------------------------------------------------
   GOOGLE OAUTH LOGIN
--------------------------------------------------------- */
document.getElementById("googleBtn")?.addEventListener("click", async () => {

  let redirectUrl = window.location.origin + "/dashboard.html";

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUrl },
  });

  if (error) return showMessage(error.message);
});

/* ---------------------------------------------------------
   AUTO-REDIRECT (If already logged in)
--------------------------------------------------------- */
(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session && window.location.pathname.includes("auth.html")) {
    window.location.href = "dashboard.html";
  }
})();