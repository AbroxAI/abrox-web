<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Abrox AI — Secure Login</title>
<style>
    body {
        margin: 0;
        padding: 0;
        background: #0a0f24;
        font-family: Arial, sans-serif;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40px;
    }

    .container {
        width: 90%;
        max-width: 420px;
        background: #11182f;
        padding: 25px;
        border-radius: 14px;
        box-shadow: 0px 0px 20px rgba(0,0,0,0.4);
    }

    h2 {
        text-align: center;
        margin-bottom: 20px;
        color: #4CC9F0;
    }

    input {
        width: 100%;
        padding: 14px;
        margin-top: 14px;
        border-radius: 8px;
        border: none;
        font-size: 16px;
        outline: none;
    }

    button {
        width: 100%;
        padding: 14px;
        margin-top: 20px;
        background: #4361EE;
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 18px;
        cursor: pointer;
        font-weight: bold;
    }

    button:hover {
        background: #3b54d3;
    }

    .error {
        margin-top: 15px;
        padding: 10px;
        background: #d62828;
        border-radius: 6px;
        display: none;
    }

    .success {
        margin-top: 15px;
        padding: 10px;
        background: #2a9d8f;
        border-radius: 6px;
        display: none;
    }
</style>
</head>
<body>

<div class="container">
    <h2>Abrox AI Login</h2>

    <input id="uidInput" type="text" placeholder="Enter your UID">
    <input id="passInput" type="password" placeholder="Dashboard Password">

    <button onclick="verify()">Login</button>

    <div id="errorBox" class="error"></div>
    <div id="successBox" class="success"></div>
</div>

<script>
/* ---------------------------
   SETTINGS — NOW CONFIGURED
   --------------------------- */

// Your GitHub files
const SUBSCRIBERS_URL = "https://raw.githubusercontent.com/AbroxAI/abrox-web/main/subscribers.json";
const ENV_URL = "https://raw.githubusercontent.com/AbroxAI/abrox-web/main/.env";

// Redirect on success
const DASHBOARD_URL = "dashboard.html";

/* ---------------------------
       LOGIN FUNCTION
   --------------------------- */

async function verify() {
    const uid = document.getElementById("uidInput").value.trim();
    const pass = document.getElementById("passInput").value.trim();

    const errorBox = document.getElementById("errorBox");
    const successBox = document.getElementById("successBox");

    errorBox.style.display = "none";
    successBox.style.display = "none";

    if (!uid || !pass) {
        error("Please enter UID and Password");
        return;
    }

    try {

        // Fetch subscribers.json from GitHub
        const subs = await fetch(SUBSCRIBERS_URL).then(r => r.json());

        if (!subs[uid]) {
            return error("UID not found in system.");
        }

        // Fetch .env content
        const envText = await fetch(ENV_URL).then(r => r.text());

        const match = envText.match(/DASHBOARD_PASSWORD=(.*)/);
        if (!match) {
            return error("Password configuration missing.");
        }

        const correctPass = match[1].trim();

        // Validate password
        if (pass !== correctPass) {
            return error("Incorrect dashboard password.");
        }

        // Success
        success("Login successful! Redirecting...");
        setTimeout(() => {
            window.location.href = `${DASHBOARD_URL}?uid=${uid}`;
        }, 1200);

    } catch (e) {
        error("Connection error. Ensure GitHub files are public.");
        console.error(e);
    }
}

/* ---------------------------
       UI HELPERS
   --------------------------- */

function error(msg) {
    const box = document.getElementById("errorBox");
    box.innerHTML = msg;
    box.style.display = "block";
}

function success(msg) {
    const box = document.getElementById("successBox");
    box.innerHTML = msg;
    box.style.display = "block";
}
</script>

</body>
</html>
