const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "cms.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Таблица за потребители
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      address TEXT,
      phone TEXT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role_id INTEGER DEFAULT 1,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    )
  `);

  // НОВА ТАБЛИЦА ЗА РОЛИ
  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Добавяне на колона role_id в users таблицата (ако не съществува)
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error("Error checking users table schema:", err);
      return;
    }

    const hasRoleId = columns.some((col) => col.name === "role_id");
    if (!hasRoleId) {
      db.run(
        "ALTER TABLE users ADD COLUMN role_id INTEGER DEFAULT 1",
        (err) => {
          if (err) {
            console.error("Error adding role_id column:", err);
          } else {
            console.log("Added role_id column to users table");
          }
        },
      );
    }
  });

  // Добавяне на FOREIGN KEY constraint (SQLite поддържа FOREIGN KEY само ако е включено)
  db.run("PRAGMA foreign_keys = ON");

  // Инициализиране на default роли
  db.get("SELECT COUNT(*) AS count FROM roles", (err, row) => {
    if (err) {
      console.error("Error counting roles:", err);
      return;
    }

    if (row.count === 0) {
      // Вмъкване на стандартни роли
      const defaultRoles = [
        ["admin", "Full system access with all permissions"],
        ["manager", "Can manage users and content"],
        ["editor", "Can edit content but not manage users"],
        ["viewer", "Read-only access"],
      ];

      const stmt = db.prepare(
        "INSERT INTO roles (name, description) VALUES (?, ?)",
      );

      defaultRoles.forEach((role) => {
        stmt.run(role, (err) => {
          if (err) console.error(`Error creating role ${role[0]}:`, err);
        });
      });

      stmt.finalize();
      console.log("Created default roles");
    }
  });

  // Създаване на admin потребител (ако няма)
  db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
    if (err) {
      console.error("Error counting users:", err);
      return;
    }
    if (row.count === 0) {
      const hash = bcrypt.hashSync("admin", 10);

      // Вземане на admin role ID
      db.get("SELECT id FROM roles WHERE name = ?", ["admin"], (err, role) => {
        const roleId = role ? role.id : 1;

        db.run(
          `INSERT INTO users
            (first_name, last_name, email, address, phone, username, password_hash, role_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            "Admin",
            "User",
            "admin@example.com",
            "Admin Street 1",
            "0000000000",
            "admin",
            hash,
            roleId,
          ],
          (err2) => {
            if (err2) console.error("Error creating default admin:", err2);
            else
              console.log(
                "Created default admin user (username: admin, password: admin)",
              );
          },
        );
      });
    }
  });
});

module.exports = db;
