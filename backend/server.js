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

// Login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
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

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser });
  });
});

// Get user by ID (for password change verification)
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT id, first_name, last_name, email, address, phone, username
     FROM users WHERE id = ?`,
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

// CHANGE PASSWORD ENDPOINT
app.post("/api/users/:id/change-password", (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body || {};

  // Валидация
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current password and new password are required" });
  }

  // Проверка за дължина на новата парола
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "New password must be at least 6 characters long" });
  }

  // Вземане на потребителя от базата
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Проверка на текущата парола
    const isValid = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Хеширане на новата парола
    const newPasswordHash = bcrypt.hashSync(newPassword, 10);

    // Обновяване в базата
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

// List users
app.get("/api/users", (req, res) => {
  db.all(
    `SELECT id, first_name, last_name, email, address, phone, username
     FROM users
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

// Create user
app.post("/api/users", (req, res) => {
  const { first_name, last_name, email, address, phone, username, password } =
    req.body || {};

  if (!first_name || !last_name || !email || !username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users
      (first_name, last_name, email, address, phone, username, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      email,
      address || "",
      phone || "",
      username,
      password_hash,
    ],
    function (err) {
      if (err) {
        console.error("DB error:", err);
        return res
          .status(500)
          .json({ error: "Database error or duplicate email/username" });
      }

      db.get(
        `SELECT id, first_name, last_name, email, address, phone, username
         FROM users WHERE id = ?`,
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

// Update user
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, address, phone, username, password } =
    req.body || {};

  if (!first_name || !last_name || !email || !username) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const params = [
    first_name,
    last_name,
    email,
    address || "",
    phone || "",
    username,
  ];
  let sql = `
    UPDATE users
    SET first_name = ?, last_name = ?, email = ?, address = ?, phone = ?, username = ?
  `;

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
      `SELECT id, first_name, last_name, email, address, phone, username
       FROM users WHERE id = ?`,
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

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
