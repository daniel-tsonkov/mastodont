# mastodont
# Command for run:
# Спиране и премахване на старите контейнери
docker-compose down -v

# Изтриване на старата база данни (ако искате fresh start)
rm -f backend/cms.db

# Стартиране наново
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

Basic Syntax<br>
The Markdown elements outlined in the original design document.
https://www.markdownguide.org/basic-syntax/

## Цел на проекта<br>
Симулиране на IT фирма с разиграване на всички позици които биха могли да се ползват.

Екипа се състои от

<pre>
CEO
 ├── Operations / PM
 │     ├── Product Owner
 │     ├── Backend Team Lead
 │     │        ├── Backend Developer (Mid)
 │     │        └── Backend Developer (Junior)
 │     ├── Frontend Team Lead
 │     │        ├── Frontend Developer (Mid)
 │     │        └── Full-stack Developer
 │     ├── DevOps Engineer
 │     ├── QA Team
 │     │        └── QA Engineer
 │     └── Technical Support (L1/L2)
 │
 ├── HR Specialist
 ├── Admin Assistant
 ├── Sales / Account Manager
 └── Digital Marketing Specialist
</pre>

ОПИСАНИЕ НА ВСЯКА ДЛЪЖНОСТ
##### Управление

###### CEO
Взема стратегически решения
Отговаря за финанси, партньори и растеж

##### Project Manager(PM)
 - Планира спринтове
 - Координира екипите
 - Работи с клиенти

##### Product & Design
###### Product Owner
 - Пише user stories
 - Приоритизира backlog
------------------------
#### Разработка

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

###### UI/UX Designer
 - Прототипи, wireframes, дизайн
------------------------
###### HR Specialist
 - Подбор на кадри
 - Управление на процеси, адаптация, култура

##### Sales & Marketing
###### Sales Manager
 - Намира клиенти
 - Договаря сделки

###### Marketing Specialist
 - Реклама, социални мрежи
 - SEO, кампании
