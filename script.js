// script.js
const WEB_APP_URL = CONFIG.WEB_APP_URL;

const form = document.getElementById("batteryForm");
const tableBody = document.querySelector("#batteryTable tbody");
const searchInput = document.getElementById("searchInput");

// Submit Form
form.addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(form);
  const params = new URLSearchParams();

  // Map form fields
  params.append("biker_name", formData.get("biker_name"));
  params.append("phone_number", formData.get("phone_number"));
  params.append("reg_number", formData.get("reg_number"));
  params.append("battery_company", formData.get("battery_company"));
  params.append("battery_type", formData.get("battery_type"));
  params.append("dealer_name", formData.get("dealer_name"));
  params.append("warranty_start_date", formData.get("warranty_start_date"));
  params.append("frame_number", formData.get("frame_number"));
  params.append("engine_number", formData.get("engine_number"));

  try {
    const res = await fetch(WEB_APP_URL, { method: "POST", body: params });
    if (res.ok) {
      alert("Battery added successfully!");
      form.reset();
      loadBatteries();
    } else alert("Failed to submit data");
  } catch (err) {
    alert("Error: " + err);
  }
});

// Load Batteries
async function loadBatteries() {
  try {
    const res = await fetch(WEB_APP_URL);
    const data = await res.json();
    renderTable(data);
  } catch (err) {
    console.error("Failed to load batteries:", err);
  }
}

// Render Table
function renderTable(data) {
  const filter = searchInput.value.toLowerCase();
  tableBody.innerHTML = "";

  data
    .filter(row => row["Reg Number"]?.toLowerCase().includes(filter))
    .forEach(row => {
      const warrantyDate = row["Warranty Start Date"] ? new Date(row["Warranty Start Date"]) : null;
      const isActive = warrantyDate && (new Date() - warrantyDate < 365*24*60*60*1000); // 1 year warranty
      const badge = isActive ? '<span class="badge-active">Active</span>' : '<span class="badge-expired">Expired</span>';

      tableBody.innerHTML += `<tr>
        <td data-label="Biker Name">${row["Biker Name"]||""}</td>
        <td data-label="Phone">${row["Phone Number"]||""}</td>
        <td data-label="Reg Number">${row["Reg Number"]||""}</td>
        <td data-label="Battery">${row["Battery Company"]||""}</td>
        <td data-label="Type">${row["Battery Type"]||""}</td>
        <td data-label="Dealer">${row["Dealer Name"]||""}</td>
        <td data-label="Warranty">${row["Warranty Start Date"]||""} ${badge}</td>
        <td data-label="Frame">${row["Frame Number"]||""}</td>
        <td data-label="Engine">${row["Engine Number"]||""}</td>
      </tr>`;
    });
}

// Search filter
searchInput.addEventListener("input", loadBatteries);

// Initial load
loadBatteries();