// testLogin.js
const LOGIN_USER = "BATTERY";
const LOGIN_PASS = "BT123456789";

// simulate input
const usernameInput = "BATTERY";
const passwordInput = "BT123456789";

if(usernameInput === LOGIN_USER && passwordInput === LOGIN_PASS){
    console.log("✅ Login success");
} else {
    console.log("❌ Login failed");
}