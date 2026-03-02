// LOGIN
function login(){
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if(username === LOGIN_USER && password === LOGIN_PASS){
    document.getElementById("loginCard").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    loadBatteries();
  } else {
    document.getElementById("error").innerText = "Wrong credentials";
  }
}

// ADD BATTERY
document.getElementById("batteryForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  try {
    const res = await fetch("/api/add-battery", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if(res.ok){
      showToast("Battery Added ✅");
      e.target.reset();
      document.getElementById("battery_sent_date").value = new Date().toISOString().split("T")[0];
      loadBatteries();
    } else {
      showToast(result.error || "Add Failed ❌", false);
    }
  } catch(err) {
    showToast(err.message || "Add Failed ❌", false);
  }
});

// LOAD BATTERIES
async function loadBatteries(){
  try {
    const res = await fetch("/api/batteries");
    const batteries = await res.json();
    const body = document.getElementById("tableBody");
    body.innerHTML = "";

    batteries.forEach(b => {
      body.innerHTML += `
        <tr>
          <td>${b.id || ""}</td>
          <td>${b.customer_name || ""}</td>
          <td>${b.phone_number || ""}</td>
          <td>${b.reg_number || ""}</td>
          <td>${b.battery_company || ""}</td>
          <td>${b.battery_sent_date ? b.battery_sent_date.split("T")[0] : ""}</td>
          <td>${b.dealer_name || ""}</td>
          <td>${b.frame_number || ""}</td>
          <td>${b.engine_number || ""}</td>
          <td>${b.warranty_status || "Pending"}</td>
          <td>${b.warranty_reason || ""}</td>
          <td><button onclick="deleteBattery(${b.id})">X</button></td>
        </tr>
      `;
    });
  } catch(err) {
    showToast(err.message || "Failed to load batteries ❌", false);
  }
}

// DELETE BATTERY
async function deleteBattery(id){
  const pass = prompt("Enter delete password");
  if(!pass) return;
  
  try {
    const res = await fetch("/api/delete-battery/" + id, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({password: pass})
    });
    const result = await res.json();
    if(res.ok){
      showToast("Battery deleted ✅");
      loadBatteries();
    } else {
      showToast(result.error || "Delete failed ❌", false);
    }
  } catch(err) {
    showToast(err.message || "Delete failed ❌", false);
  }
}

// TOAST FUNCTION
function showToast(msg, success=true){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.background = success ? "#28a745" : "#dc3545";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}
