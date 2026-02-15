const API_URL = "http://localhost:4000";

// DOM Elements
const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const currentUsernameEl = document.getElementById("current-username");
const currentUserRoleEl = document.getElementById("current-user-role");
const logoutBtn = document.getElementById("logout-btn");

// Sidebar elements
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarToggle = document.getElementById("sidebarToggle");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navItems = document.querySelectorAll(".nav-item");
const navUsers = document.getElementById("nav-users");
const navSettings = document.getElementById("nav-settings");
const usersView = document.getElementById("users-view");
const settingsView = document.getElementById("settings-view");
const currentViewTitle = document.getElementById("currentViewTitle");

// User form elements
const userForm = document.getElementById("user-form");
const userFormError = document.getElementById("user-form-error");
const resetFormBtn = document.getElementById("reset-form-btn");
const usersTableBody = document.getElementById("users-table-body");
const formTitle = document.getElementById("form-title");
const addUserBtn = document.getElementById("add-user-btn");
const roleSelect = document.getElementById("role-select");

// Password change elements
const passwordChangeForm = document.getElementById("password-change-form");
const currentPassword = document.getElementById("current-password");
const newPassword = document.getElementById("new-password");
const confirmPassword = document.getElementById("confirm-password");
const changePasswordBtn = document.getElementById("change-password-btn");
const passwordMessage = document.getElementById("password-message");
const passwordStrength = document.getElementById("password-strength");
const strengthBar = document.getElementById("strength-bar");
const strengthText = document.getElementById("strength-text");

// Roles management elements
const roleSelectManage = document.getElementById("role-select-manage");
const deleteRoleBtn = document.getElementById("delete-role-btn");
const roleDeleteMessage = document.getElementById("role-delete-message");
const newRoleName = document.getElementById("new-role-name");
const newRoleDescription = document.getElementById("new-role-description");
const addRoleBtn = document.getElementById("add-role-btn");
const roleAddMessage = document.getElementById("role-add-message");
const rolesTableBody = document.getElementById("roles-table-body");

// Settings elements
const themeRadios = document.querySelectorAll('input[name="theme-preference"]');
const itemsPerPage = document.getElementById("items-per-page");
const sessionUsername = document.getElementById("session-username");
const sessionRole = document.getElementById("session-role");
const currentUserId = document.getElementById("current-user-id");
const apiStatus = document.getElementById("api-status");
const loginTimeSpan = document.getElementById("login-time");

let currentUser = null;
let loginTime = null;
let roles = []; // Cache for roles

// ========== UTILITY FUNCTIONS ==========
function showToast(message, type = "success") {
  const toastContainer = document.querySelector(".toast-container");
  const toastId = "toast-" + Date.now();

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.id = toastId;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi bi-${type === "success" ? "check-circle" : "exclamation-triangle"} me-2"></i>
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  if (typeof bootstrap !== "undefined") {
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove();
    });
  }
}

// Password strength checker
function checkPasswordStrength(password) {
  let strength = 0;
  let feedback = "";

  if (password.length >= 6) strength += 20;
  if (password.length >= 8) strength += 10;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

  if (strength < 30) feedback = "Weak";
  else if (strength < 60) feedback = "Fair";
  else if (strength < 80) feedback = "Good";
  else feedback = "Strong";

  return { strength, feedback };
}

// ========== ROLES API FUNCTIONS ==========
async function loadRoles() {
  try {
    const res = await fetch(`${API_URL}/api/roles`);
    if (!res.ok) throw new Error("Failed to load roles");
    roles = await res.json();
    return roles;
  } catch (err) {
    console.error("Error loading roles:", err);
    showToast("Failed to load roles", "danger");
    return [];
  }
}

async function populateRoleDropdowns() {
  const roles = await loadRoles();

  // Populate user form role select
  if (roleSelect) {
    roleSelect.innerHTML = '<option value="">Select role...</option>';
    roles.forEach((role) => {
      const option = document.createElement("option");
      option.value = role.id;
      option.textContent = role.name;
      roleSelect.appendChild(option);
    });
  }

  // Populate role management select
  if (roleSelectManage) {
    roleSelectManage.innerHTML = '<option value="">Select a role...</option>';
    roles.forEach((role) => {
      const option = document.createElement("option");
      option.value = role.id;
      option.textContent = `${role.name}${role.description ? " - " + role.description : ""}`;
      roleSelectManage.appendChild(option);
    });
  }

  // Populate roles table
  if (rolesTableBody) {
    if (roles.length === 0) {
      rolesTableBody.innerHTML =
        '<tr><td colspan="4" class="text-center py-3">No roles found</td></tr>';
    } else {
      rolesTableBody.innerHTML = "";
      roles.forEach((role) => {
        const tr = document.createElement("tr");
        const createdDate = role.created_at
          ? new Date(role.created_at).toLocaleDateString()
          : "N/A";

        tr.innerHTML = `
          <td>${role.id}</td>
          <td><span class="badge bg-info">${role.name}</span></td>
          <td>${role.description || "-"}</td>
          <td>${createdDate}</td>
        `;
        rolesTableBody.appendChild(tr);
      });
    }
  }

  return roles;
}

// ========== LOGIN FUNCTIONS ==========
function showLogin() {
  currentUser = null;
  loginView.classList.remove("d-none");
  appView.classList.add("d-none");
  loginError.textContent = "";

  setTimeout(() => {
    document.getElementById("login-username").focus();
  }, 100);
}

async function showApp() {
  loginView.classList.add("d-none");
  appView.classList.remove("d-none");
  loginError.textContent = "";
  loginTime = new Date();

  if (currentUser) {
    // Update all user info displays
    currentUsernameEl.textContent = currentUser.username;
    if (sessionUsername) sessionUsername.textContent = currentUser.username;
    if (sessionRole)
      sessionRole.textContent = currentUser.role_name || "Administrator";
    if (currentUserId) currentUserId.textContent = currentUser.id;

    // Update login time
    if (loginTimeSpan) {
      loginTimeSpan.textContent = loginTime.toLocaleTimeString();
    }
  }

  // Load roles and populate dropdowns
  await populateRoleDropdowns();

  // Check API status
  checkApiStatus();

  // Load users
  loadUsers();

  // Show users view by default
  showView("users");
}

async function checkApiStatus() {
  try {
    const res = await fetch(`${API_URL}/api/users`, { method: "HEAD" });
    if (apiStatus) {
      apiStatus.textContent = "Connected";
      apiStatus.className = "badge bg-success";
    }
  } catch (err) {
    if (apiStatus) {
      apiStatus.textContent = "Disconnected";
      apiStatus.className = "badge bg-danger";
    }
  }
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
    document.getElementById("login-password").value = "";
    showApp();
    showToast(`Welcome back, ${currentUser.first_name}!`, "success");
  } catch (err) {
    console.error(err);
    loginError.textContent = "Cannot reach backend API";
  }
});

logoutBtn.addEventListener("click", () => {
  showLogin();
  closeSidebar();
  showToast("Logged out successfully", "info");
});

// ========== SIDEBAR FUNCTIONS ==========
function toggleSidebar() {
  sidebar.classList.toggle("active");
  sidebarOverlay.classList.toggle("active");
}

function closeSidebar() {
  sidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
}

function showView(viewName) {
  navItems.forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.view === viewName) {
      item.classList.add("active");
    }
  });

  if (viewName === "users") {
    usersView.classList.remove("d-none");
    settingsView.classList.add("d-none");
    currentViewTitle.textContent = "Users";
    loadUsers();
  } else if (viewName === "settings") {
    usersView.classList.add("d-none");
    settingsView.classList.remove("d-none");
    currentViewTitle.textContent = "Settings";
    // Refresh roles when showing settings
    populateRoleDropdowns();
  }

  closeSidebar();
}

navUsers.addEventListener("click", (e) => {
  e.preventDefault();
  showView("users");
});

navSettings.addEventListener("click", (e) => {
  e.preventDefault();
  showView("settings");
});

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", toggleSidebar);
}

if (sidebarToggle) {
  sidebarToggle.addEventListener("click", closeSidebar);
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", closeSidebar);
}

// ========== PASSWORD CHANGE ==========
if (passwordChangeForm) {
  newPassword.addEventListener("input", () => {
    const password = newPassword.value;

    if (password.length > 0) {
      passwordStrength.classList.remove("d-none");
      const { strength, feedback } = checkPasswordStrength(password);

      strengthBar.style.width = `${strength}%`;
      strengthBar.className = "progress-bar";

      if (strength < 30) {
        strengthBar.classList.add("bg-danger");
        strengthText.textContent = "Weak password";
        strengthText.className = "text-danger";
      } else if (strength < 60) {
        strengthBar.classList.add("bg-warning");
        strengthText.textContent = "Fair password";
        strengthText.className = "text-warning";
      } else if (strength < 80) {
        strengthBar.classList.add("bg-info");
        strengthText.textContent = "Good password";
        strengthText.className = "text-info";
      } else {
        strengthBar.classList.add("bg-success");
        strengthText.textContent = "Strong password";
        strengthText.className = "text-success";
      }
    } else {
      passwordStrength.classList.add("d-none");
    }
  });

  passwordChangeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    passwordMessage.innerHTML = "";
    passwordMessage.className = "mt-3 small";

    const current = currentPassword.value;
    const newPwd = newPassword.value;
    const confirm = confirmPassword.value;

    if (!current || !newPwd || !confirm) {
      passwordMessage.innerHTML =
        '<i class="bi bi-exclamation-triangle me-1"></i>All fields are required';
      passwordMessage.classList.add("text-danger");
      return;
    }

    if (newPwd !== confirm) {
      passwordMessage.innerHTML =
        '<i class="bi bi-exclamation-triangle me-1"></i>New passwords do not match';
      passwordMessage.classList.add("text-danger");
      return;
    }

    if (newPwd.length < 6) {
      passwordMessage.innerHTML =
        '<i class="bi bi-exclamation-triangle me-1"></i>New password must be at least 6 characters long';
      passwordMessage.classList.add("text-danger");
      return;
    }

    if (current === newPwd) {
      passwordMessage.innerHTML =
        '<i class="bi bi-exclamation-triangle me-1"></i>New password must be different from current password';
      passwordMessage.classList.add("text-danger");
      return;
    }

    changePasswordBtn.disabled = true;
    changePasswordBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';

    try {
      const res = await fetch(
        `${API_URL}/api/users/${currentUser.id}/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: current,
            newPassword: newPwd,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      passwordMessage.innerHTML =
        '<i class="bi bi-check-circle me-1"></i>Password updated successfully!';
      passwordMessage.classList.add("text-success");

      currentPassword.value = "";
      newPassword.value = "";
      confirmPassword.value = "";
      passwordStrength.classList.add("d-none");

      showToast("Password updated successfully!", "success");
    } catch (err) {
      console.error(err);
      passwordMessage.innerHTML = `<i class="bi bi-exclamation-triangle me-1"></i>${err.message}`;
      passwordMessage.classList.add("text-danger");
      showToast(err.message, "danger");
    } finally {
      changePasswordBtn.disabled = false;
      changePasswordBtn.innerHTML =
        '<i class="bi bi-check-circle me-2"></i>Update Password';
    }
  });
}

// ========== ROLES MANAGEMENT ==========
// Handle role selection in management dropdown
if (roleSelectManage) {
  roleSelectManage.addEventListener("change", (e) => {
    const selectedRoleId = e.target.value;

    if (selectedRoleId) {
      deleteRoleBtn.disabled = false;

      // Check if it's the admin role (ID 1)
      if (selectedRoleId == 1) {
        roleDeleteMessage.innerHTML =
          '<span class="text-warning"><i class="bi bi-exclamation-triangle me-1"></i>Admin role cannot be deleted</span>';
        deleteRoleBtn.disabled = true;
      } else {
        // Check if role is assigned to any users
        const assignedUsers = []; // This should be checked via API
        roleDeleteMessage.innerHTML = "";
        deleteRoleBtn.disabled = false;
      }
    } else {
      deleteRoleBtn.disabled = true;
      roleDeleteMessage.innerHTML = "";
    }
  });
}

// Delete role
if (deleteRoleBtn) {
  deleteRoleBtn.addEventListener("click", async () => {
    const roleId = roleSelectManage.value;
    const roleName =
      roleSelectManage.options[roleSelectManage.selectedIndex]?.text.split(
        " - ",
      )[0];

    if (!roleId) return;

    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    deleteRoleBtn.disabled = true;
    deleteRoleBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';

    try {
      const res = await fetch(`${API_URL}/api/roles/${roleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete role");
      }

      // Refresh roles
      await populateRoleDropdowns();

      // Reset selection
      roleSelectManage.value = "";
      deleteRoleBtn.disabled = true;
      roleDeleteMessage.innerHTML = "";

      showToast(`Role "${roleName}" deleted successfully`, "success");
    } catch (err) {
      console.error(err);
      roleDeleteMessage.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-triangle me-1"></i>${err.message}</span>`;
      showToast(err.message, "danger");
    } finally {
      deleteRoleBtn.innerHTML = '<i class="bi bi-trash me-2"></i>Delete';
    }
  });
}

// Add new role
if (addRoleBtn) {
  addRoleBtn.addEventListener("click", async () => {
    const name = newRoleName.value.trim();
    const description = newRoleDescription.value.trim();

    if (!name) {
      roleAddMessage.innerHTML =
        '<span class="text-danger"><i class="bi bi-exclamation-triangle me-1"></i>Role name is required</span>';
      return;
    }

    addRoleBtn.disabled = true;
    addRoleBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';

    try {
      const res = await fetch(`${API_URL}/api/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create role");
      }

      // Clear inputs
      newRoleName.value = "";
      newRoleDescription.value = "";
      roleAddMessage.innerHTML = `<span class="text-success"><i class="bi bi-check-circle me-1"></i>Role "${name}" created successfully</span>`;

      // Refresh roles
      await populateRoleDropdowns();

      showToast(`Role "${name}" created successfully`, "success");
    } catch (err) {
      console.error(err);
      roleAddMessage.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-triangle me-1"></i>${err.message}</span>`;
      showToast(err.message, "danger");
    } finally {
      addRoleBtn.disabled = false;
      addRoleBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add';
    }
  });
}

// ========== USERS FUNCTIONS ==========
async function loadUsers() {
  usersTableBody.innerHTML =
    '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm me-2"></div>Loading...</td></tr>';
  try {
    const res = await fetch(`${API_URL}/api/users`);
    if (!res.ok) {
      throw new Error("Failed to load users");
    }
    const users = await res.json();
    renderUsers(users);
  } catch (err) {
    console.error(err);
    usersTableBody.innerHTML =
      '<tr><td colspan="6" class="text-center text-danger py-4">Cannot reach backend API</td></tr>';
    showToast("Failed to load users", "danger");
  }
}

function renderUsers(users) {
  if (!users.length) {
    usersTableBody.innerHTML =
      '<tr><td colspan="6" class="text-center py-4">No users yet</td></tr>';
    return;
  }

  usersTableBody.innerHTML = "";
  users.forEach((u, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${u.first_name} ${u.last_name}</strong></td>
      <td>${u.email}</td>
      <td>${u.username}</td>
      <td><span class="badge ${u.role_name === "admin" ? "bg-danger" : "bg-info"}">${u.role_name || "Unknown"}</span></td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary edit-btn" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger delete-btn" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;

    const editBtn = tr.querySelector(".edit-btn");
    const deleteBtn = tr.querySelector(".delete-btn");

    editBtn.addEventListener("click", () => {
      fillFormForEdit(u);
    });

    deleteBtn.addEventListener("click", () => {
      if (
        confirm(
          `Are you sure you want to delete ${u.first_name} ${u.last_name}?`,
        )
      ) {
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

  // Set role select
  if (roleSelect && user.role_id) {
    roleSelect.value = user.role_id;
  }

  userFormError.textContent = "";
  formTitle.textContent = "Edit User";

  document
    .getElementById("user-form-card")
    .scrollIntoView({ behavior: "smooth" });
}

function clearForm() {
  document.getElementById("user-id").value = "";
  document.getElementById("first-name").value = "";
  document.getElementById("last-name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("address").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  if (roleSelect) roleSelect.value = "";
  userFormError.textContent = "";
  formTitle.textContent = "Add New User";
}

resetFormBtn.addEventListener("click", clearForm);

if (addUserBtn) {
  addUserBtn.addEventListener("click", () => {
    clearForm();
    document
      .getElementById("user-form-card")
      .scrollIntoView({ behavior: "smooth" });
  });
}

async function deleteUser(id) {
  try {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 204) {
      throw new Error("Error deleting user");
    }
    loadUsers();
    showToast("User deleted successfully", "success");
  } catch (err) {
    console.error(err);
    showToast("Cannot delete user", "danger");
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
  const role_id = roleSelect ? roleSelect.value : null;

  if (!first_name || !last_name || !email || !username) {
    userFormError.textContent =
      "First name, last name, email and username are required";
    return;
  }

  if (!role_id && !id) {
    userFormError.textContent = "Please select a role";
    return;
  }

  const payload = {
    first_name,
    last_name,
    email,
    address,
    phone,
    username,
    role_id: role_id || 4, // Default to viewer
  };

  if (password) {
    if (password.length < 6) {
      userFormError.textContent = "Password must be at least 6 characters long";
      return;
    }
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
      throw new Error(data.error || "Error saving user");
    }

    await res.json();
    clearForm();
    loadUsers();
    showToast(`User ${id ? "updated" : "created"} successfully`, "success");
  } catch (err) {
    console.error(err);
    userFormError.textContent = err.message;
    showToast(err.message, "danger");
  }
});

// ========== SETTINGS FUNCTIONS ==========
// Theme preference radios
themeRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const theme = e.target.value;
    if (theme === "light") {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("cms-theme", "light");
      showToast("Light theme activated", "info");
    } else if (theme === "dark") {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("cms-theme", "dark");
      showToast("Dark theme activated", "info");
    } else if (theme === "system") {
      localStorage.removeItem("cms-theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark-theme");
      } else {
        document.documentElement.classList.remove("dark-theme");
      }
      showToast("System theme activated", "info");
    }
  });
});

// Initialize theme radios based on current theme
function initThemeRadios() {
  const savedTheme = localStorage.getItem("cms-theme");
  if (savedTheme === "light") {
    document.getElementById("theme-light").checked = true;
  } else if (savedTheme === "dark") {
    document.getElementById("theme-dark").checked = true;
  } else {
    document.getElementById("theme-system").checked = true;
  }
}

// Items per page
if (itemsPerPage) {
  itemsPerPage.addEventListener("change", (e) => {
    localStorage.setItem("items-per-page", e.target.value);
    showToast(`Items per page set to ${e.target.value}`, "info");
  });

  const savedItems = localStorage.getItem("items-per-page");
  if (savedItems) {
    itemsPerPage.value = savedItems;
  }
}

// ========== INITIALIZATION ==========
initThemeRadios();
showLogin();
