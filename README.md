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

Цел на проекта
Симулиране на IT фирма с разиграване на всички позици които биха могли да се ползват.

Екипа се състои от

CEO
 ├── Operations / PM<br>
 │     ├── Product Owner<br>
 │     ├── Backend Team Lead<br>
 │     │        ├── Backend Developer (Mid)<br>
 │     │        └── Backend Developer (Junior)<br>
 │     ├── Frontend Team Lead<br>
 │     │        ├── Frontend Developer (Mid)<br>
 │     │        └── Full-stack Developer<br>
 │     ├── DevOps Engineer<br>
 │     ├── QA Team<br>
 │     │        └── QA Engineer<br>
 │     └── Technical Support (L1/L2)<br>
 │<br>
 ├── HR Specialist<br>
 ├── Admin Assistant<br>
 ├── Sales / Account Manager<br>
 └── Digital Marketing Specialist<br>

ОПИСАНИЕ НА ВСЯКА ДЛЪЖНОСТ
##### Управление

###### CEO
Взема стратегически решения
Отговаря за финанси, партньори и растеж

##### Project Manager
 - Планира спринтове
 - Координира екипите
 - Работи с клиенти

###### HR Specialist
 - Подбор на кадри
 - Управление на процеси, адаптация, култура
------------------------
##### Разработка

###### Backend Developers
 - Работят по логика, API, бази данни
 - Senior → архитектурни решения

###### Frontend Developers
 - Изграждат UI, работят с React/Vue/Angular

###### Full-stack Developer
 - Покрива едновременно front + back

###### DevOps Engineer
 - CI/CD
 - Инфраструктура
 - Kubernetes / Docker
------------------------
##### QA
###### QA Engineer
 - Тества системата
 - Пише автоматизирани тестове (по възможност)
------------------------
##### Support
###### Technical Support L1/L2
 - Помощ за клиенти
 - Диагностика на проблеми
------------------------
##### Product & Design
###### Product Owner
 - Пише user stories
 - Приоритизира backlog

###### UI/UX Designer
 - Прототипи, wireframes, дизайн
------------------------
##### Sales & Marketing
###### Sales Manager
 - Намира клиенти
 - Договаря сделки

###### Marketing Specialist
 - Реклама, социални мрежи
 - SEO, кампании
