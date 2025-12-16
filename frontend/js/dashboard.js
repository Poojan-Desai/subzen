/* ============================================================
   SubZen – DASHBOARD LOGIC (FULL VERSION)
   Handles:
   - Supabase session
   - Fetch user plan
   - Upload statement → backend
   - Render pie chart
   - Render subscription list
============================================================ */

import { supabase } from "./supabaseClient.js";

/* ---------------------------
   DOM ELEMENTS
----------------------------*/
const welcomeText = document.getElementById("welcomeText");
const planTag = document.getElementById("planTag");
const uploadsLeftEl = document.getElementById("uploadsLeft");
const totalSpendEl = document.getElementById("totalSpend");
const potentialSavingsEl = document.getElementById("potentialSavings");

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");

const subsContainer = document.getElementById("subsContainer");

/* CHART ELEMENT */
const ctx = document.getElementById("spendingChart")?.getContext("2d");
let spendingChart = null;

/* ---------------------------
   1. LOAD USER SESSION
----------------------------*/
async function loadUserSession() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    window.location.href = "auth.html";
    return;
  }

  const email = data.user.email;
  welcomeText.textContent = `Welcome back, ${email} 👋`;

  /* Determine user's plan */
  const metadata = data.user.user_metadata || {};
  const plan = metadata.plan || "free";
  planTag.textContent = plan.toUpperCase() + " PLAN";
}

/* ---------------------------
   2. LOGOUT
----------------------------*/
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "index.html";
});

/* ---------------------------
   3. UPLOAD STATEMENT → BACKEND
----------------------------*/
uploadBtn?.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please choose a PDF or CSV file.");
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Analyzing...";
  uploadStatus.textContent = "Uploading and analyzing your statement...";

  /* Get user session for token */
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) {
    alert("Missing auth token. Sign in again.");
    window.location.href = "auth.html";
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const apiURL =
    "https://subzen-backend-1.onrender.com/api/analyze-statement?plan=free";

  try {
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await response.json();
    console.log("SERVER RESPONSE:", json);

    if (!json.ok) {
      alert(json.error || "Failed to analyze statement.");
      resetUploadButton();
      return;
    }

    /* Pass results to UI renderer */
    displayResults(json.analysis);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    alert("Server error. Try again later.");
  }

  resetUploadButton();
});

function resetUploadButton() {
  uploadBtn.disabled = false;
  uploadBtn.textContent = "Analyze";
  uploadStatus.textContent = "";
}

/* ---------------------------
   4. RENDER RESULTS IN UI
----------------------------*/
function displayResults(data) {
  if (!data) {
    alert("No analysis returned.");
    return;
  }

  console.log("FINAL DATA:", data);

  /* Update summary cards */
  totalSpendEl.textContent = `$${(data.total_subscription_spend || 0).toFixed(2)}`;
  potentialSavingsEl.textContent = `$${(data.estimated_savings_if_cancel_recommended || 0).toFixed(2)}`;
  uploadsLeftEl.textContent = "0"; 

  /* Subscriptions List */
  subsContainer.innerHTML = "";
  (data.subscriptions || []).forEach((sub) => {
    const item = document.createElement("div");
    item.className = "sub-item";

    item.innerHTML = `
      <h4>${sub.name || "Unknown Subscription"}</h4>
      <div class="price">$${sub.amount?.toFixed(2) || "0.00"}</div>
    `;

    subsContainer.appendChild(item);
  });

  /* Build Chart Data */
  const chartTotals = data.category_totals || {
    subscriptions: 0,
    food_and_drink: 0,
    transportation: 0,
    shopping: 0,
    entertainment: 0,
    other: 0,
  };

  renderSpendingChart(chartTotals);
}

/* ---------------------------
   5. PIE CHART
----------------------------*/
function renderSpendingChart(totals) {
  const labels = [
    "Subscriptions",
    "Food & Drink",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Other",
  ];

  const values = [
    totals.subscriptions || 0,
    totals.food_and_drink || 0,
    totals.transportation || 0,
    totals.shopping || 0,
    totals.entertainment || 0,
    totals.other || 0,
  ];

  if (spendingChart) spendingChart.destroy();

  spendingChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#4ca4ff",
            "#5b6cff",
            "#6a4cff",
            "#ff4cf0",
            "#ff884c",
            "#29ffb8",
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#fff" },
        },
      },
    },
  });
}

/* ---------------------------
   INIT
----------------------------*/
loadUserSession();