const API_URL = "http://localhost:4000";

const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const currentUsernameEl = document.getElementById("current-username");
const logoutBtn = document.getElementById("logout-btn");

const userForm = document.getElementById("user-form");
const userFormError = document.getElementById("user-form-error");
const resetFormBtn = document.getElementById("reset-form-btn");
const usersTableBody = document.getElementById("users-table-body");

let currentUser = null;

function showLogin() {
  currentUser = null;
  currentUsernameEl.textContent = "";
  loginView.classList.remove("d-none");
  appView.classList.add("d-none");
  loginError.textContent = "";
}

function showApp() {
  loginView.classList.add("d-none");
  appView.classList.remove("d-none");
  loginError.textContent = "";
  loadUsers();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      loginError.textContent = data.error || "Login failed";
      return;
    }

    const data = await res.json();
    currentUser = data.user;
    currentUsernameEl.textContent = currentUser.username;
    document.getElementById("login-password").value = "";
    showApp();
  } catch (err) {
    console.error(err);
    loginError.textContent = "Cannot reach backend API";
  }
});

logoutBtn.addEventListener("click", () => {
  showLogin();
});

async function loadUsers() {
  usersTableBody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  try {
    const res = await fetch(`${API_URL}/api/users`);
    if (!res.ok) {
      usersTableBody.innerHTML =
        '<tr><td colspan="7">Error loading users</td></tr>';
      return;
    }
    const users = await res.json();
    renderUsers(users);
  } catch (err) {
    console.error(err);
    usersTableBody.innerHTML =
      '<tr><td colspan="7">Cannot reach backend API</td></tr>';
  }
}

function renderUsers(users) {
  if (!users.length) {
    usersTableBody.innerHTML = '<tr><td colspan="7">No users yet</td></tr>';
    return;
  }

  usersTableBody.innerHTML = "";
  users.forEach((u, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${u.first_name} ${u.last_name}</td>
      <td>${u.email}</td>
      <td>${u.address || ""}</td>
      <td>${u.phone || ""}</td>
      <td>${u.username}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1">Edit</button>
        <button class="btn btn-sm btn-outline-danger">Delete</button>
      </td>
    `;

    const [editBtn, deleteBtn] = tr.querySelectorAll("button");

    editBtn.addEventListener("click", () => {
      fillFormForEdit(u);
    });

    deleteBtn.addEventListener("click", () => {
      if (confirm("Delete this user?")) {
        deleteUser(u.id);
      }
    });

    usersTableBody.appendChild(tr);
  });
}

function fillFormForEdit(user) {
  document.getElementById("user-id").value = user.id;
  document.getElementById("first-name").value = user.first_name;
  document.getElementById("last-name").value = user.last_name;
  document.getElementById("email").value = user.email;
  document.getElementById("address").value = user.address || "";
  document.getElementById("phone").value = user.phone || "";
  document.getElementById("username").value = user.username;
  document.getElementById("password").value = "";
  userFormError.textContent = "";
}

async function deleteUser(id) {
  try {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 204) {
      alert("Error deleting user");
      return;
    }
    loadUsers();
  } catch (err) {
    console.error(err);
    alert("Cannot reach backend API");
  }
}

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  userFormError.textContent = "";

  const id = document.getElementById("user-id").value;
  const first_name = document.getElementById("first-name").value.trim();
  const last_name = document.getElementById("last-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!first_name || !last_name || !email || !username) {
    userFormError.textContent =
      "First name, last name, email and username are required";
    return;
  }

  const payload = {
    first_name,
    last_name,
    email,
    address,
    phone,
    username,
  };
  if (password) {
    payload.password = password;
  }

  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/api/users/${id}` : `${API_URL}/api/users`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      userFormError.textContent = data.error || "Error saving user";
      return;
    }

    await res.json();
    clearForm();
    loadUsers();
  } catch (err) {
    console.error(err);
    userFormError.textContent = "Cannot reach backend API";
  }
});

function clearForm() {
  document.getElementById("user-id").value = "";
  document.getElementById("first-name").value = "";
  document.getElementById("last-name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("address").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  userFormError.textContent = "";
}

resetFormBtn.addEventListener("click", () => {
  clearForm();
});

// Initial state
showLogin();
