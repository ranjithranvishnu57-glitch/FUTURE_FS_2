async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;
  const msg = document.getElementById("msg");

  // ===== VALIDATION =====
  if (!email || !password || !confirm) {
    msg.innerText = "All fields required ❌";
    return;
  }

  if (password !== confirm) {
    msg.innerText = "Passwords do not match ❌";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.msg === "Signup success") {
      // 🔥 auto login
      localStorage.setItem("user", email);

      // 🔥 redirect to dashboard
      window.location.href = "index.html";
    } else {
      msg.innerText = data.msg;
    }

  } catch (err) {
    console.error(err);
    msg.innerText = "Server error ❌";
  }
}