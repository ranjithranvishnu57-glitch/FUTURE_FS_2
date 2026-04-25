console.log("JS LOADED 🔥");

const API = "http://localhost:5000/leads";
let leadsData = [];
let chartInstance;

// ===== SAFE LOAD =====
window.addEventListener("DOMContentLoaded", () => {
  init();
});

async function init() {
  try {
    await load();
  } catch (err) {
    console.error("INIT ERROR:", err);
  }
}

// ===== LOAD DATA =====
async function load() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    console.log("DATA:", data);

    leadsData = data;

    renderTable(data);
    renderDashboard(data);
    renderReports(data);

  } catch (err) {
    console.error("LOAD ERROR:", err);
  }
}

// ===== TABLE =====
function renderTable(data) {
  const table = document.getElementById("table");
  if (!table) return;

  table.innerHTML = "";

  data.forEach(l => {
    table.innerHTML += `
      <tr>
        <td>${l.name}</td>
        <td>${l.status}</td>
        <td>${l.followUp || "-"}</td>
        <td><button onclick="del('${l._id}')">Delete</button></td>
      </tr>
    `;
  });
}

// ===== DASHBOARD =====
function renderDashboard(data) {
  if (!document.getElementById("total")) return;

  let converted = data.filter(l => l.status === "Converted").length;

  document.getElementById("total").innerText = data.length;
  document.getElementById("converted").innerText = converted;
  document.getElementById("pending").innerText = data.length - converted;

  // ===== TODAY FOLLOW =====
  const today = new Date().toISOString().slice(0,10);
  let todayCount = data.filter(l => l.followUp?.slice(0,10) === today).length;
  document.getElementById("todayFollow").innerText = todayCount;

  // ===== 🔥 RECENT LEADS FIX =====
  const recentTable = document.getElementById("recentTable");
  if (!recentTable) return;

  recentTable.innerHTML = "";

  // latest 5 leads (last added)
  data.reverse().forEach(l => {
    const date = l._id ? l._id.substring(0,8) : "-"; // fallback date

    recentTable.innerHTML += `
      <tr onclick="showSection('leads')">
        <td>${l.name}</td>
        <td>${l.status}</td>
        <td>${l.followUp || "-"}</td>
        <td>${l.phone || "-"}</td>
      </tr>
    `;
  });
}

// ===== REPORTS =====
function renderReports(data) {
  // ===== COUNTS =====
  let total = data.length;
  let converted = data.filter(l => l.status === "Converted").length;
  let contacted = data.filter(l => l.status === "Contacted").length;
  let pending = total - converted;

  // ===== UI UPDATE =====
  document.getElementById("r-total").innerText = total;
  document.getElementById("r-converted").innerText = converted;
  document.getElementById("r-pending").innerText = pending;

  // conversion %

  let rate = total ? ((converted / total) * 100).toFixed(1) : 0;
  document.getElementById("conversionRate").innerText = rate + "%";

  // ===== STATUS LIST =====

  const statusList = document.getElementById("statusList");
  statusList.innerHTML = `
    <li>New: ${data.filter(l => l.status === "New").length}</li>
    <li>Contacted: ${contacted}</li>
    <li>Converted: ${converted}</li>
  `;

  // ===== FOLLOW UP =====

  const today = new Date().toISOString().slice(0,10);
  let todayCount = 0;
  let upcoming = 0;

  data.forEach(l => {
    if (l.followUp) {
      const d = l.followUp.slice(0,10);
      if (d === today) todayCount++;
      else if (d > today) upcoming++;
    }
  });

  document.getElementById("reportFollow").innerHTML = `
    <li>Today: ${todayCount}</li>
    <li>Upcoming: ${upcoming}</li>
  `;


  // ===== CHART =====

  const chartEl = document.getElementById("statusChart");

  const counts = {
    New: data.filter(l => l.status === "New").length,
    Contacted: contacted,
    Converted: converted
  };

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartEl, {
    type: "pie",
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts)
      }]
    }
  });
}

// ===== ADD =====

async function addLead() {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        status: document.getElementById("status").value,
        followUp: document.getElementById("followUp").value
      })
    });

    const data = await res.json();
    console.log("Response:", data);

    if (!res.ok) {
      throw new Error(data.error || "Failed to add lead");
    }

    closeModal();
    load();

  } catch (err) {
    console.error("ADD ERROR:", err);
    alert("Failed to add lead ❌");
  }
}

// ===== DELETE =====
async function del(id) {
  await fetch(API + "/" + id, { method: "DELETE" });
  load();
}

// ===== MODAL =====
function openModal() {
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// ===== SEARCH =====
window.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase().trim();

    // empty na full table
    if (value === "") {
      renderTable(leadsData);
      return;
    }

    const filtered = leadsData.filter(l =>
      (l.name && l.name.toLowerCase().includes(value)) ||
      (l.email && l.email.toLowerCase().includes(value)) ||
      (l.phone && l.phone.toLowerCase().includes(value)) ||
      (l.status && l.status.toLowerCase().includes(value))
    );

    renderTable(filtered);
  });
});


function toggleProfile(e) {
  e.stopPropagation(); // 🔥 important

  const menu = document.getElementById("profileMenu");

  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}

// click outside close
document.addEventListener("click", function () {
  const menu = document.getElementById("profileMenu");
  if (menu) menu.style.display = "none";
});

function filterLeads() {
  const value = document.getElementById("filter").value;

  // All select pannina full data
  if (value === "") {
    renderTable(leadsData);
    return;
  }

  // specific filter
  const filtered = leadsData.filter(l => l.status === value);

  renderTable(filtered);
}

// ===== SETTINGS & LOGOUT =====

function logout() {
  localStorage.removeItem("user");
  localStorage.clear();
  window.location.href = "login.html";
}

async function forgotPassword() {
  const res = await fetch("http://localhost:5000/forgot", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: email.value,
      newPassword: newPassword.value
    })
  });

  const data = await res.json();
  alert(data.msg);
}

form.addEventListener("submit", (e) => {
  e.preventDefault(); // 🔥 MUST
});

fetch(`${API}/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: email.value,
    password: password.value
  })
})
.then(res => res.json())
.then(data => {
  console.log(data);
  msg.innerText = data.msg; // 👈 display
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.log(err));

