document.addEventListener("DOMContentLoaded", () => {
  const loginDiv = document.getElementById("loginDiv");
  const managerDiv = document.getElementById("managerDiv");
  const loginBtn = document.getElementById("loginBtn");
  const loginError = document.getElementById("loginError");
  const batteryForm = document.getElementById("batteryForm");
  const batteryTable = document.getElementById("batteryTable").querySelector("tbody");
  const searchInput = document.getElementById("searchInput");

  // Login
  loginBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if(username === LOGIN_USER && password === LOGIN_PASS){
      loginDiv.style.display = "none";
      managerDiv.style.display = "block";
      fetchBatteries();
    } else {
      loginError.style.display = "block";
    }
  });

  // Add battery
  batteryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(batteryForm);
    const data = Object.fromEntries(formData.entries());
    await fetch(BASE_URL + "/add-battery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    batteryForm.reset();
    alert(ADD_MESSAGES[Math.floor(Math.random()*ADD_MESSAGES.length)]);
    fetchBatteries();
  });

  // Fetch batteries
  async function fetchBatteries(){
    const res = await fetch(BASE_URL + "/batteries");
    const batteries = await res.json();
    renderTable(batteries);
  }

  // Render table
  function renderTable(batteries){
    const search = searchInput.value.toLowerCase();
    batteryTable.innerHTML = "";
    batteries.forEach(b => {
      if(!b.reg_number.toLowerCase().includes(search)) return;
      const warrantyDays = b.warranty_start_date ? Math.floor((new Date() - new Date(b.warranty_start_date))/(1000*60*60*24)) : "-";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${b.biker_name}</td>
        <td>${b.phone_number}</td>
        <td>${b.reg_number}</td>
        <td>${b.battery_company}</td>
        <td>${b.battery_type}</td>
        <td>${b.dealer_name}</td>
        <td>${warrantyDays}</td>
        <td>${b.frame_number}</td>
        <td>${b.engine_number}</td>
        <td><button class="btn btn-sm btn-danger">Delete</button></td>
      `;
      tr.querySelector("button").addEventListener("click", async ()=>{
        const pass = prompt("Enter password to delete 🔒:");
        if(pass !== DELETE_PASS) return alert("Wrong password 😅");
        await fetch(BASE_URL + "/delete-battery/" + b._id, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pass })
        });
        alert(DELETE_MESSAGES[Math.floor(Math.random()*DELETE_MESSAGES.length)]);
        fetchBatteries();
      });
      batteryTable.appendChild(tr);
    });
  }

  // Search filter
  searchInput.addEventListener("input", fetchBatteries);
});