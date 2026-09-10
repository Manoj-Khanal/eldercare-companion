const app = {
  get(key, fallback = []) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
};

function renderShell() {
  const header = document.getElementById("site-header");

  if (header) {
    header.className = "site-header";

    const user = app.get("eldercareUser", null);

    let authButtons = "";

    if (user) {
      authButtons = `
        <span class="nav-user">
          Welcome, ${app.escape(user.name)}
        </span>
        <button class="btn btn-light" id="logoutBtn">Logout</button>
      `;
    } else {
      authButtons = `
        <a class="btn btn-light" href="login.html">Login</a>
        <a class="btn" style="background:#ffd21c;color:#111" href="register.html">Register</a>
      `;
    }

    header.innerHTML = `
      <div class="container nav">

        <a class="brand" href="index.html">
          <span class="brand-logo">❤</span>
          <span>ElderCare Companion</span>
        </a>

        <button class="menu-btn" id="menuBtn">☰</button>

        <nav class="nav-links" id="navLinks">
          <a href="index.html">Home</a>
          <a href="about.html">About</a>
          <a href="services.html">Services</a>
          <a href="contact.html">Contact</a>
          <a href="dashboard.html">Dashboard</a>
        </nav>

        <div class="nav-actions">
          ${authButtons}
        </div>

      </div>
    `;

    document.getElementById("menuBtn")?.addEventListener("click", () => {
      document.getElementById("navLinks")?.classList.toggle("open");
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem("eldercareUser");
      window.location.href = "index.html";
    });
  }

  const footer = document.getElementById("site-footer");

  if (footer) {
    footer.className = "site-footer";

    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">

          <div>
            <h3>ElderCare Companion</h3>
            <p>
              A student project designed to make everyday elder care
              more organized and accessible.
            </p>
          </div>

          <div>
            <h3>Explore</h3>
            <a href="about.html">About</a>
            <a href="services.html">Services</a>
            <a href="dashboard.html">Dashboard</a>
          </div>

          <div>
            <h3>Care</h3>
            <a href="medicines.html">Medicines</a>
            <a href="appointments.html">Appointments</a>
            <a href="health-records.html">Health Records</a>
            <a href="emergency.html">Emergency SOS</a>
          </div>

        </div>

        <div class="copyright">
          © 2026 ElderCare Companion • Full Stack Development Project
        </div>
      </div>
    `;
  }
}

function initAuth() {

  // =========================
  // REGISTER
  // =========================

  const reg = document.getElementById("registerForm");

  if (reg) {

    reg.addEventListener("submit", async (e) => {

      e.preventDefault();

      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim().toLowerCase();
      const phone = document.getElementById("regPhone").value.trim();
      const role = document.getElementById("regRole").value;
      const password = document.getElementById("regPassword").value;
      const confirm = document.getElementById("regConfirm").value;
      const status = document.getElementById("registerStatus");

      // Check passwords
      if (password !== confirm) {
        status.textContent = "Passwords do not match.";
        status.style.color = "#c62828";
        return;
      }

      try {

        status.textContent = "Creating your account...";
        status.style.color = "#555";

        const response = await fetch(
          "http://localhost:8080/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: name,
              email: email,
              password: password,
              phone: phone,
              role: role
            })
          }
        );

        if (!response.ok) {

          let message = "Registration failed.";

          try {
            const errorData = await response.json();
            message = errorData.message || message;
          } catch {}

          throw new Error(message);
        }

        const user = await response.json();

        console.log("Registration successful:", user);

        status.textContent =
          "Account created successfully! Redirecting to login...";

        status.style.color = "#2e8b57";

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1000);

      } catch (error) {

        console.error("Registration error:", error);

        status.textContent =
          error.message || "Unable to connect to the server.";

        status.style.color = "#c62828";
      }

    });
  }


  // =========================
  // LOGIN
  // =========================

  const login = document.getElementById("loginForm");

  if (login) {

    login.addEventListener("submit", async (e) => {

      e.preventDefault();

      const email =
        document.getElementById("loginEmail").value.trim().toLowerCase();

      const password =
        document.getElementById("loginPassword").value;

      const status =
        document.getElementById("loginStatus");

      try {

        status.textContent = "Logging in...";
        status.style.color = "#555";

        const response = await fetch(
          "http://localhost:8080/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: email,
              password: password
            })
          }
        );

        if (!response.ok) {

          let message = "Invalid email or password.";

          try {
            const errorData = await response.json();
            message = errorData.message || message;
          } catch {}

          throw new Error(message);
        }

        const user = await response.json();

        console.log("Login successful:", user);

        // Save logged-in user
        localStorage.setItem(
          "eldercareUser",
          JSON.stringify(user)
        );

        status.textContent = "Login successful!";
        status.style.color = "#2e8b57";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 500);

      } catch (error) {

        console.error("Login error:", error);

        status.textContent =
          error.message || "Unable to connect to the server.";

        status.style.color = "#c62828";
      }

    });
  }
}

function initDashboard() {

  const user = app.get("eldercareUser", null);

  const name = document.getElementById("dashboardName");

  if (name) {
    name.textContent = user?.name || "Guest";
  }

  const medicines = app.get("ec_medicines");
  const appointments = app.get("ec_appointments");
  const records = app.get("ec_records");

  document
    .getElementById("medicineCount")
    ?.replaceChildren(String(medicines.length));

  document
    .getElementById("appointmentCount")
    ?.replaceChildren(String(appointments.length));

  document
    .getElementById("recordCount")
    ?.replaceChildren(String(records.length));
}

function initMedicines() {
  const form = document.getElementById("medicineForm");
  const list = document.getElementById("medicineList");
  if (!form || !list) return;
  function render() {
    const items = app.get("ec_medicines");
    document.getElementById("medicineEmpty").textContent = items.length ? "" : "No medicines added yet.";
    list.innerHTML = items.map((x,i)=>`
      <div class="item"><div><h3>${app.escape(x.name)}</h3><p>${app.escape(x.dosage)} • ${app.escape(x.frequency)} • ${app.escape(x.time)}</p></div>
      <button class="delete-btn" data-delete="${i}">Delete</button></div>`).join("");
    list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{ const a=app.get("ec_medicines"); a.splice(Number(b.dataset.delete),1); app.set("ec_medicines",a); render(); });
  }
  form.addEventListener("submit",e=>{e.preventDefault(); const a=app.get("ec_medicines"); a.push({name:medName.value.trim(),dosage:medDosage.value.trim(),time:medTime.value,frequency:medFrequency.value}); app.set("ec_medicines",a); form.reset(); render();});
  render();
}

function initAppointments() {
  const form = document.getElementById("appointmentForm");
  const list = document.getElementById("appointmentList");
  if (!form || !list) return;
  function render() {
    const items = app.get("ec_appointments");
    document.getElementById("appointmentEmpty").textContent = items.length ? "" : "No appointments added yet.";
    list.innerHTML = items.map((x,i)=>`
      <div class="item"><div><h3>${app.escape(x.doctor)}</h3><p>${app.escape(x.date)} at ${app.escape(x.time)} • ${app.escape(x.purpose)}</p></div>
      <button class="delete-btn" data-delete="${i}">Delete</button></div>`).join("");
    list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{ const a=app.get("ec_appointments"); a.splice(Number(b.dataset.delete),1); app.set("ec_appointments",a); render(); });
  }
  form.addEventListener("submit",e=>{e.preventDefault(); const a=app.get("ec_appointments"); a.push({doctor:appDoctor.value.trim(),date:appDate.value,time:appTime.value,purpose:appPurpose.value.trim()}); app.set("ec_appointments",a); form.reset(); render();});
  render();
}

function initRecords() {
  const form = document.getElementById("recordForm");
  const list = document.getElementById("recordList");
  if (!form || !list) return;
  function render() {
    const items = app.get("ec_records");
    document.getElementById("recordEmpty").textContent = items.length ? "" : "No records added yet.";
    list.innerHTML = items.map((x,i)=>`
      <div class="item"><div><h3>${app.escape(x.date)}</h3><p>BP: ${app.escape(x.bp || "—")} • Sugar: ${app.escape(x.sugar || "—")} • Weight: ${app.escape(x.weight || "—")}</p><p>${app.escape(x.notes || "")}</p></div>
      <button class="delete-btn" data-delete="${i}">Delete</button></div>`).join("");
    list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{ const a=app.get("ec_records"); a.splice(Number(b.dataset.delete),1); app.set("ec_records",a); render(); });
  }
  form.addEventListener("submit",e=>{e.preventDefault(); const a=app.get("ec_records"); a.push({date:recordDate.value,bp:recordBP.value.trim(),sugar:recordSugar.value.trim(),weight:recordWeight.value.trim(),notes:recordNotes.value.trim()}); app.set("ec_records",a); form.reset(); render();});
  render();
}

function initEmergency() {
  const form = document.getElementById("contactFormEmergency");
  const list = document.getElementById("contactList");
  const sos = document.getElementById("sosButton");
  if (sos) sos.addEventListener("click",()=>{ document.getElementById("sosStatus").textContent="SOS activated in demo mode. Contact your trusted person or local emergency service."; });
  if (!form || !list) return;
  function render() {
    const items=app.get("ec_contacts");
    document.getElementById("contactEmpty").textContent=items.length?"":"No contacts added yet.";
    list.innerHTML=items.map((x,i)=>`<div class="item"><div><h3>${app.escape(x.name)}</h3><p>${app.escape(x.relation)} • ${app.escape(x.phone)}</p></div><button class="delete-btn" data-delete="${i}">Delete</button></div>`).join("");
    list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{const a=app.get("ec_contacts");a.splice(Number(b.dataset.delete),1);app.set("ec_contacts",a);render();});
  }
  form.addEventListener("submit",e=>{e.preventDefault();const a=app.get("ec_contacts");a.push({name:ecName.value.trim(),relation:ecRelation.value.trim(),phone:ecPhone.value.trim()});app.set("ec_contacts",a);form.reset();render();});
  render();
}

function initContact() {
  const form=document.getElementById("contactForm");
  if(form) form.addEventListener("submit",e=>{e.preventDefault();const s=document.getElementById("contactStatus");s.textContent="Thank you. Your message has been saved in this frontend demo.";form.reset();});
}

renderShell();
initAuth();
initDashboard();
initMedicines();
initAppointments();
initRecords();
initEmergency();
initContact();
