const titles={dashboard:"Dashboard",profile:"Company Profile",products:"Products",orders:"Purchase Orders",delivery:"Delivery",payments:"Payments",notifications:"Notifications",support:"Support",vendors:"Vendors"};

const DEFAULT_ACCOUNTS={
  admin:{email:"admin@dafa.local",password:"admin123",role:"admin",name:"DAFA Admin",initials:"AD"},
  "V-00124":{email:"vendor@abcsupplies.local",password:"vendor123",role:"vendor",name:"ABC Supplies",vendorId:"V-00124",initials:"AB",contact:"Ahmad Bin Bakar",company:"ABC Supplies Sdn. Bhd."}
};

let loginRole="admin", currentUser=null;
let accounts=loadAccounts();

document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.page)));

function loadAccounts(){
  try{
    const saved=JSON.parse(localStorage.getItem("dafaAccounts")||"null");
    if(saved && saved.admin && saved["V-00124"]) return {...DEFAULT_ACCOUNTS,...saved};
  }catch(e){}
  return {...DEFAULT_ACCOUNTS};
}
function saveAccounts(){localStorage.setItem("dafaAccounts",JSON.stringify(accounts));}
function selectLoginRole(role){
  loginRole=role;
  document.querySelectorAll(".role-btn").forEach(b=>b.classList.toggle("active",b.dataset.role===role));
  document.getElementById("loginError").textContent="";
  document.getElementById("demoText").textContent=role==="admin"?"Admin: admin@dafa.local / admin123":"Vendor: use your vendor account credentials";
}
function handleLogin(e){
  e.preventDefault();
  const email=document.getElementById("loginEmail").value.trim().toLowerCase(), password=document.getElementById("loginPassword").value;
  const account=Object.values(accounts).find(a=>a.role===loginRole && a.email.toLowerCase()===email && a.password===password);
  if(!account){document.getElementById("loginError").textContent="Invalid login details.";return false;}
  currentUser={...account};
  sessionStorage.setItem("dafaUser",JSON.stringify(currentUser));
  applyUserAccess(); showPage("dashboard"); return false;
}
function restoreSession(){
  try{const saved=JSON.parse(sessionStorage.getItem("dafaUser")||"null"); if(saved){accounts=loadAccounts(); const fresh=Object.values(accounts).find(a=>a.email===saved.email&&a.role===saved.role); if(fresh){currentUser={...fresh};applyUserAccess();}}}catch(e){}
}
function applyUserAccess(){
  if(!currentUser)return;
  document.body.classList.add("authenticated");
  document.body.classList.toggle("admin-mode",currentUser.role==="admin");
  document.getElementById("roleBadge").textContent=currentUser.role==="admin"?"Admin":"Vendor";
  document.getElementById("portalLabel").textContent=currentUser.role==="admin"?"Admin Portal":"Vendor Portal";
  const name=currentUser.role==="admin"?"DAFA Admin":currentUser.name;
  document.getElementById("welcomeVendorName").textContent=name;
  document.getElementById("sidebarVendorName").textContent=name;
  document.getElementById("sidebarVendorId").textContent=currentUser.role==="admin"?"Administrator":"Vendor ID: "+currentUser.vendorId;
  const initials=currentUser.role==="admin"?"AD":currentUser.initials;
  document.getElementById("sidebarAvatar").textContent=initials; document.getElementById("topAvatar").textContent=initials;
  if(currentUser.role==="vendor") applyVendorScope();
}
function applyVendorScope(){
  // Existing displayed figures belong to V-00124. New vendor accounts intentionally see an empty workspace.
  const hasSeedData=currentUser.vendorId==="V-00124";
  document.querySelectorAll("[data-vendor-id]").forEach(el=>el.style.display=(el.dataset.vendorId===currentUser.vendorId)?"":"none");
  document.body.classList.toggle("empty-vendor",!hasSeedData);
}
function showPage(page){
  if(!currentUser)return;
  if(page==="vendors" && currentUser.role!=="admin"){toast("Access denied — vendors can only view their own account.");return;}
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const target=document.getElementById(page); if(!target)return;
  target.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  document.getElementById("pageTitle").textContent=titles[page]||"Dashboard";
  window.scrollTo({top:0,behavior:"smooth"});
  if(window.innerWidth<720)document.querySelector(".sidebar").classList.remove("open");
}
function toggleSidebar(){document.querySelector(".sidebar").classList.toggle("open")}
function openModal(){if(currentUser?.role!=="vendor"){toast("Only vendors can add products.");return}document.getElementById("modal").classList.add("show")}
function closeModal(){document.getElementById("modal").classList.remove("show")}
function openVendorModal(){if(currentUser?.role!=="admin"){toast("Admin access only.");return}document.getElementById("vendorModal").classList.add("show");document.getElementById("vendorCreateError").textContent=""}
function closeVendorModal(){document.getElementById("vendorModal").classList.remove("show")}
function createVendor(){
  const name=document.getElementById("newVendorName").value.trim(), vendorId=document.getElementById("newVendorId").value.trim().toUpperCase(), email=document.getElementById("newVendorEmail").value.trim().toLowerCase(), password=document.getElementById("newVendorPassword").value, contact=document.getElementById("newVendorContact").value.trim(), initials=(document.getElementById("newVendorInitials").value.trim()||name.split(/\\s+/).map(x=>x[0]).join("").slice(0,3)).toUpperCase();
  const err=document.getElementById("vendorCreateError");
  if(!name||!vendorId||!email||!password){err.textContent="Please complete company, Vendor ID, email and password.";return;}
  if(accounts[vendorId]||Object.values(accounts).some(a=>a.email===email)){err.textContent="Vendor ID or email already exists.";return;}
  accounts[vendorId]={email,password,role:"vendor",name,vendorId,initials,contact,company:name}; saveAccounts();
  renderVendorRows(); closeVendorModal(); toast("Vendor account created successfully.");
  ["newVendorName","newVendorId","newVendorEmail","newVendorPassword","newVendorContact","newVendorInitials"].forEach(id=>document.getElementById(id).value="");
}
function renderVendorRows(){
  const tbody=document.querySelector("#vendorTable tbody"); if(!tbody)return;
  tbody.innerHTML=Object.values(accounts).filter(a=>a.role==="vendor").map(a=>`<tr><td><b>${escapeHtml(a.name)}</b><small>${escapeHtml(a.company||a.name)}</small></td><td>${escapeHtml(a.vendorId)}</td><td>${escapeHtml(a.contact||"—")}</td><td><span class="pill delivered">Approved</span></td></tr>`).join("");
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.style.opacity=1;t.style.transform="translateY(0)";setTimeout(()=>{t.style.opacity=0;t.style.transform="translateY(10px)"},2600)}
function saveProfile(){toast("Company profile saved successfully.")}
function sendSupport(){toast("Your message has been sent to DAFA Admin.")}
function logout(ask=true){if(!ask||confirm("Log out of DAFA System?")){sessionStorage.removeItem("dafaUser");currentUser=null;document.body.classList.remove("authenticated","admin-mode","empty-vendor");document.getElementById("loginForm").reset();selectLoginRole("admin")}}
function filterTable(q,id){document.querySelectorAll("#"+id+" tbody tr").forEach(r=>r.style.display=r.innerText.toLowerCase().includes(q.toLowerCase())?"":"none")}
window.addEventListener("click",e=>{if(e.target===document.getElementById("modal"))closeModal();if(e.target===document.getElementById("vendorModal"))closeVendorModal()});
renderVendorRows(); restoreSession();
