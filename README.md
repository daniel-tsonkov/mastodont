# mastodont
# Command for run:
docker-compose up --build

Then open http://localhost:3000 in a browser.
Default admin user: username admin, password admin (only stored as hash in SQLite, never returned by the API).

Sources (for used technologies and APIs):

Node.js documentation (platform for backend server)
https://nodejs.org/en/docs

Express framework documentation (routing, middleware)
https://expressjs.com/

SQLite documentation (embedded SQL database)
https://www.sqlite.org/docs.html

sqlite3 Node.js driver documentation
https://github.com/TryGhost/node-sqlite3

bcrypt password hashing (bcryptjs) documentation
https://github.com/dcodeIO/bcrypt.js

CORS middleware for Express (cors) documentation
https://github.com/expressjs/cors

Nginx official image documentation (serving static frontend)
https://hub.docker.com/_/nginx

Docker Compose documentation (multi-container setup)
https://docs.docker.com/compose/
