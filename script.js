function login(){
  if(
    document.getElementById("username").value === LOGIN_USER &&
    document.getElementById("password").value === LOGIN_PASS
  ){
    document.getElementById("loginCard").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    loadBatteries();
  } else {
    document.getElementById("error").innerText = "Wrong credentials";
  }
}

document.getElementById("batteryForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  await fetch("/add-battery", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  });

  e.target.reset();
  loadBatteries();
});

async function loadBatteries(){
  const res = await fetch("/batteries");
  const batteries = await res.json();

  const body = document.getElementById("tableBody");
  body.innerHTML="";

  batteries.forEach(b=>{
    body.innerHTML+=`
      <tr>
        <td>${b.biker_name}</td>
        <td>${b.reg_number}</td>
        <td>${b.battery_company}</td>
        <td><button onclick="deleteBattery(${b.id})">X</button></td>
      </tr>
    `;
  });
}

async function deleteBattery(id){
  const pass = prompt("Enter delete password");
  if(pass!==DELETE_PASS) return alert("Wrong password");

  await fetch("/delete-battery/"+id,{
    method:"DELETE",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({password:pass})
  });

  loadBatteries();
}