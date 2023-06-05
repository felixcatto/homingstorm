install:
	npm i

start:
	npx remix dev

start-test-server:
	NODE_ENV=test npx gulp startWsServer &
	NODE_ENV=test npx next dev -p 3002

start-prod-server:
	npx remix-serve build

start-ws-server:
	npx gulp startWsServer

start-prod-ws-server:
	node dist/services/webSocketServer/bin.js

build:
	npx remix build

build-wss:
	npx gulp buildWsServer

migrate:
	npx knex migrate:latest

migrate-new:
	npx knex migrate:make $(arg)

migrate-rollback:
	npx knex migrate:rollback

migrate-list:
	npx knex migrate:list

database-build:
	docker build -t homingstorm_database services/database

database-up:
	docker run --rm -d -e POSTGRES_PASSWORD=1 \
	-p 5432:5432 \
	-v homingstorm_database:/var/lib/postgresql/data \
	--name=homingstorm_database \
	homingstorm_database

database-down:
	docker stop homingstorm_database

database-seed:
	npx knex seed:run

database-seed-new:
	npx knex seed:make $(arg)

test:
	NODE_OPTIONS=--experimental-vm-modules npx jest --runInBand

test-file:
	NODE_OPTIONS=--experimental-vm-modules npx jest --runInBand --watch $(arg)

test-e2e:
	NODE_ENV=test make database-seed
	NODE_ENV=test npx cypress open --e2e --browser /usr/bin/google-chrome

test-e2e-headless:
	NODE_ENV=test make database-seed
	NODE_ENV=test npx cypress run

lint:
	npx eslint .
	npx tsc

prettify:
	npx prettier --write .

css-styles:
	npx sass --no-source-map public/css/src/bootstrap-grid.scss public/css/bootstrap-grid.css

caddy-reload-config:
	docker compose exec caddy caddy reload --config="/etc/caddy/Caddyfile"

compose-build:
	docker compose build

compose-up:
	docker compose up -d

compose-down:
	docker compose down

compose-log:
	docker compose logs -f

compose-migrate:
	docker compose exec app make migrate

compose-seed:
	docker compose exec app make database-seed
