const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "cms.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      address TEXT,
      phone TEXT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
    if (err) {
      console.error("Error counting users:", err);
      return;
    }
    if (row.count === 0) {
      const hash = bcrypt.hashSync("admin", 10);
      db.run(
        `INSERT INTO users
          (first_name, last_name, email, address, phone, username, password_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          "Admin",
          "User",
          "admin@example.com",
          "Admin Street 1",
          "0000000000",
          "admin",
          hash,
        ],
        (err2) => {
          if (err2) console.error("Error creating default admin:", err2);
          else
            console.log(
              "Created default admin user (username: admin, password: admin)"
            );
        }
      );
    }
  });
});

module.exports = db;
