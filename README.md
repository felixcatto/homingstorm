# Description

SPA app using NextJs + TypeScript + Postgress. Traditional CRUD blog with ability to add articles, tags and comments. Also have users, authentification and the ability to send messages to other users in chat mode. Live demo - https://rainoffire.ru

### Features

- HTTPS
- Chat on Websockets
- One button deploy \*. So you need only Docker and Git installed on server. Node, Postgress and Caddy will be handled via Docker
- Database migrations
- Backend API tests via Jest. Frontend unit / e2e tests via ReactTestingLibrary / Cypress
- Notable techs - NextJs, TypeScript, ObjectionOrm, WebSockets, CSS Modules, Tailwind, Docker, Postgress, Caddy

### Commands

_Development_

```
git clone https://github.com/felixcatto/homingstorm.git
cd homingstorm
make install         # only first time, install node packages
make database-build  # only first time, download database image
make database-up
make migrate         # only first time, create database structure
make database-seed   # only first time, for prepopulate database
make start
```

then go to `http://localhost:3000`

_Deploy_

```
git clone https://github.com/felixcatto/homingstorm.git
cd homingstorm
make compose-build
make compose-up
make compose-migrate # only first time, create database structure
make compose-seed    # only first time, for prepopulate database
```

then go to `http://localhost/`
