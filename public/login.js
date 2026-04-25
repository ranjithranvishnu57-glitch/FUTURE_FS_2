const API = "https://future-fs-2-dgqq.onrender.com";

// Elements
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const msg = document.getElementById("msg");

// Show message
function showMessage(text, color = "red") {
  msg.innerText = text;
  msg.style.color = color;
}

// Loading state
function setLoading(isLoading) {
  const btn = document.querySelector("button");
  btn.disabled = isLoading;
  btn.innerText = isLoading ? "Logging in..." : "Login";
}

// Login
async function login() {
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  // Basic validation
  if (!email || !password) {
    return showMessage("Please fill all fields ❌");
  }

  try {
    setLoading(true);

    const res = await fetch(API + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Invalid credentials ❌");
    }

    // ✅ Save user + token
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    showMessage("✅ Login successful!", "green");

    // Redirect
    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);

  } catch (err) {
    showMessage("❌ " + err.message);
  } finally {
    setLoading(false);
  }
}

// Enter key support
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    login();
  }
});

async function login() {
  const res = await fetch("https://future-fs-2-dgqq.onrender.com", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();

  if (data.user) {
    localStorage.setItem("user", data.user.email);
    window.location.href = "index.html";
  } else {
    alert(data.msg);
  }
}