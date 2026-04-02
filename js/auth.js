// Login / logout
// Passwords are injected at deploy time via the __CONFIG__ global set in index.html
const PASSWORD = __CONFIG__.loginPassword;
const ADMIN_PASSWORD = __CONFIG__.adminPassword;

function isAdmin() {
    return sessionStorage.getItem("accessLevel") === "admin";
}

function applyAccessLevel() {
    document.querySelectorAll(".admin-only").forEach(el => {
        el.classList.toggle("admin-hidden", !isAdmin());
    });
}

function submitLogin() {
    const input = document.getElementById("login-password").value;
    if (input === ADMIN_PASSWORD) {
        sessionStorage.setItem("authenticated", "true");
        sessionStorage.setItem("accessLevel", "admin");
        document.getElementById("login-overlay").classList.add("hidden");
        document.getElementById("login-password").value = "";
        document.getElementById("login-error").textContent = "";
        applyAccessLevel();
    } else if (input === PASSWORD) {
        sessionStorage.setItem("authenticated", "true");
        sessionStorage.setItem("accessLevel", "readonly");
        document.getElementById("login-overlay").classList.add("hidden");
        document.getElementById("login-password").value = "";
        document.getElementById("login-error").textContent = "";
        applyAccessLevel();
    } else {
        document.getElementById("login-error").textContent =
            "Incorrect password. Please try again.";
        document.getElementById("login-password").value = "";
        document.getElementById("login-password").focus();
    }
}

function logout() {
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("accessLevel");
    document.getElementById("login-overlay").classList.remove("hidden");
    document.getElementById("login-password").focus();
}

// Check auth on load
if (sessionStorage.getItem("authenticated") === "true") {
    document.getElementById("login-overlay").classList.add("hidden");
    applyAccessLevel();
} else {
    document.getElementById("login-password").focus();
}
