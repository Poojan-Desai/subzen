/* ================================================
   SubZen • HISTORY PAGE LOGIC
   ================================================ */

import { supabase } from "./supabaseClient.js";

const historyContainer = document.getElementById("historyContent");
const emptyState = document.getElementById("emptyState");

/* ------------------------------------
   1. Check user session
------------------------------------ */
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Not logged in → go to login page
    window.location.href = "auth.html";
    return null;
  }

  return session.user;
}

/* ------------------------------------
   2. Fetch scan history from backend
------------------------------------ */
async function fetchHistory() {
  try {
    const res = await fetch("https://subzen-backend-1.onrender.com/history", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to load history");
    }

    const data = await res.json();
    return data.history || [];
  } catch (err) {
    console.error("History fetch error:", err);
    return [];
  }
}

/* ------------------------------------
   3. Build a single row item
------------------------------------ */
function createHistoryRow(item) {
  const div = document.createElement("div");
  div.classList.add("history-row");

  div.innerHTML = `
    <span class="file-name">${item.fileName || "Unknown File"}</span>
    <span>${item.date || "—"}</span>
    <span class="spend">\$${item.totalSpend || 0}</span>
  `;

  return div;
}

/* ------------------------------------
   4. Render all history items
------------------------------------ */
async function renderHistory() {
  const user = await checkAuth();
  if (!user) return;

  const history = await fetchHistory();

  if (history.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  history.forEach(item => {
    const row = createHistoryRow(item);
    historyContainer.appendChild(row);
  });
}

/* ------------------------------------
   5. Start
------------------------------------ */
renderHistory();