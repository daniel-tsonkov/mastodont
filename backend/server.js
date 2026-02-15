const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

// ========== LOGIN ENDPOINT (актуализиран с роля) ==========
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  db.get(
    `SELECT users.*, roles.name as role_name, roles.description as role_description 
     FROM users 
     LEFT JOIN roles ON users.role_id = roles.id 
     WHERE users.username = ?`,
    [username],
    (err, user) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = bcrypt.compareSync(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Не връщаме password_hash
      const { password_hash, ...safeUser } = user;
      res.json({ user: safeUser });
    },
  );
});

// ========== ROLES ENDPOINTS ==========

// GET /api/roles - Всички роли
app.get("/api/roles", (req, res) => {
  db.all(
    `SELECT id, name, description, created_at 
     FROM roles 
     ORDER BY id ASC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    },
  );
});

// GET /api/roles/:id - Единична роля
app.get("/api/roles/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT id, name, description, created_at 
     FROM roles 
     WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!row) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(row);
    },
  );
});

// POST /api/roles - Създаване на нова роля
app.post("/api/roles", (req, res) => {
  const { name, description } = req.body || {};

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: "Role name is required" });
  }

  // Проверка за уникалност
  db.get(
    "SELECT id FROM roles WHERE name = ?",
    [name.trim()],
    (err, existing) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (existing) {
        return res
          .status(400)
          .json({ error: "Role with this name already exists" });
      }

      db.run(
        `INSERT INTO roles (name, description, created_at, updated_at)
       VALUES (?, ?, datetime('now'), datetime('now'))`,
        [name.trim(), description || null],
        function (err) {
          if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ error: "Database error" });
          }

          db.get(
            `SELECT id, name, description, created_at 
           FROM roles WHERE id = ?`,
            [this.lastID],
            (err2, row) => {
              if (err2) {
                console.error("DB error:", err2);
                return res.status(500).json({ error: "Database error" });
              }
              res.status(201).json(row);
            },
          );
        },
      );
    },
  );
});

// PUT /api/roles/:id - Обновяване на роля
app.put("/api/roles/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body || {};

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: "Role name is required" });
  }

  // Проверка дали ролята съществува
  db.get("SELECT id FROM roles WHERE id = ?", [id], (err, role) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Проверка за уникалност на името (без текущата роля)
    db.get(
      "SELECT id FROM roles WHERE name = ? AND id != ?",
      [name.trim(), id],
      (err, existing) => {
        if (err) {
          console.error("DB error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (existing) {
          return res
            .status(400)
            .json({ error: "Role with this name already exists" });
        }

        db.run(
          `UPDATE roles 
         SET name = ?, description = ?, updated_at = datetime('now')
         WHERE id = ?`,
          [name.trim(), description || null, id],
          function (err) {
            if (err) {
              console.error("DB error:", err);
              return res.status(500).json({ error: "Database error" });
            }

            db.get(
              `SELECT id, name, description, created_at 
             FROM roles WHERE id = ?`,
              [id],
              (err2, row) => {
                if (err2) {
                  console.error("DB error:", err2);
                  return res.status(500).json({ error: "Database error" });
                }
                res.json(row);
              },
            );
          },
        );
      },
    );
  });
});

// DELETE /api/roles/:id - Изтриване на роля
app.delete("/api/roles/:id", (req, res) => {
  const { id } = req.params;

  // Проверка дали ролята се използва от потребители
  db.get(
    "SELECT COUNT(*) AS count FROM users WHERE role_id = ?",
    [id],
    (err, row) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (row.count > 0) {
        return res.status(400).json({
          error:
            "Cannot delete role that is assigned to users. Please reassign users first.",
        });
      }

      // Защита на admin ролята (ID 1)
      if (id == 1) {
        return res
          .status(400)
          .json({ error: "Cannot delete the default admin role" });
      }

      db.run("DELETE FROM roles WHERE id = ?", [id], function (err) {
        if (err) {
          console.error("DB error:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.status(204).send();
      });
    },
  );
});

// ========== USERS ENDPOINTS (актуализирани с роли) ==========

// Get user by ID
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT users.id, users.first_name, users.last_name, users.email, 
            users.address, users.phone, users.username, users.role_id,
            roles.name as role_name
     FROM users 
     LEFT JOIN roles ON users.role_id = roles.id
     WHERE users.id = ?`,
    [id],
    (err, user) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    },
  );
});

// List all users (with role info)
app.get("/api/users", (req, res) => {
  db.all(
    `SELECT users.id, users.first_name, users.last_name, users.email, 
            users.address, users.phone, users.username, users.role_id,
            roles.name as role_name
     FROM users
     LEFT JOIN roles ON users.role_id = roles.id
     ORDER BY users.id ASC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    },
  );
});

// Create user (with role)
app.post("/api/users", (req, res) => {
  const {
    first_name,
    last_name,
    email,
    address,
    phone,
    username,
    password,
    role_id,
  } = req.body || {};

  if (!first_name || !last_name || !email || !username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const userRoleId = role_id || 4; // Default to 'viewer' (ID 4)

  db.run(
    `INSERT INTO users
      (first_name, last_name, email, address, phone, username, password_hash, role_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      email,
      address || "",
      phone || "",
      username,
      password_hash,
      userRoleId,
    ],
    function (err) {
      if (err) {
        console.error("DB error:", err);
        return res
          .status(500)
          .json({ error: "Database error or duplicate email/username" });
      }

      db.get(
        `SELECT users.id, users.first_name, users.last_name, users.email, 
                users.address, users.phone, users.username, users.role_id,
                roles.name as role_name
         FROM users 
         LEFT JOIN roles ON users.role_id = roles.id
         WHERE users.id = ?`,
        [this.lastID],
        (err2, row) => {
          if (err2) {
            console.error("DB error:", err2);
            return res.status(500).json({ error: "Database error" });
          }
          res.status(201).json(row);
        },
      );
    },
  );
});

// Update user (with role)
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    address,
    phone,
    username,
    password,
    role_id,
  } = req.body || {};

  if (!first_name || !last_name || !email || !username) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let sql = `
    UPDATE users
    SET first_name = ?, last_name = ?, email = ?, address = ?, phone = ?, username = ?, role_id = ?
  `;
  const params = [
    first_name,
    last_name,
    email,
    address || "",
    phone || "",
    username,
    role_id || 4,
  ];

  if (password) {
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }
    const password_hash = bcrypt.hashSync(password, 10);
    sql += `, password_hash = ?`;
    params.push(password_hash);
  }

  sql += ` WHERE id = ?`;
  params.push(id);

  db.run(sql, params, function (err) {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    db.get(
      `SELECT users.id, users.first_name, users.last_name, users.email, 
              users.address, users.phone, users.username, users.role_id,
              roles.name as role_name
       FROM users 
       LEFT JOIN roles ON users.role_id = roles.id
       WHERE users.id = ?`,
      [id],
      (err2, row) => {
        if (err2) {
          console.error("DB error:", err2);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(row);
      },
    );
  });
});

// Delete user
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(204).send();
  });
});

// Change password endpoint
app.post("/api/users/:id/change-password", (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current password and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "New password must be at least 6 characters long" });
  }

  db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValid = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 10);

    db.run(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [newPasswordHash, id],
      function (err) {
        if (err) {
          console.error("DB error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          success: true,
          message: "Password updated successfully",
        });
      },
    );
  });
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
