# Testing Guide

This guide explains how to run all tests locally and inside Docker, including unit/controller tests and integration tests that use Postgres via Prisma.

## Table of contents
- Prerequisites
- Environment variables
- Quick start
- Run all tests locally (host)
- Run only integration tests (host)
- Run tests inside Docker
- Prisma commands
- CI overview
- Troubleshooting
- FAQ

## Prerequisites
- Node.js and npm installed (for host runs)
- Docker Desktop running (for Postgres and/or containerized runs)
- Project dependencies installed

```bash
npm ci
```

## Environment variables

Prisma uses `DOCKER_DATABASE_URL` from your environment and from `prisma/schema.prisma`.

Use the correct host depending on where you execute commands from:

- Host-mode (run commands from your Mac/PC shell):
  ```bash
  export DOCKER_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kucompany_test?schema=public"
  ```

- Container-mode (run commands inside a compose service on the same network as Postgres):
  ```bash
  export DOCKER_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/kucompany_test?schema=public"
  ```

Important: the hostname `postgres` only resolves between containers on the same Docker network. From your host shell, always use `localhost`.



## Run all tests locally (host)

1) Start Postgres:
```bash
docker compose up -d postgres
```

2) Set DB URL for host-mode and apply migrations (dev flow):
```bash
export DOCKER_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kucompany_test?schema=public"
npx prisma migrate dev --schema=prisma/schema.prisma
```

3) Run the full test suite:
```bash
npm run test
```


## Run tests inside Docker (container-mode)

Execute tests inside your app container (shares the compose network so `postgres` host works):

- If the app service is already running:
```bash
docker compose exec <app_service_name> npm test
```

- One-off container run:
```bash
docker compose run --rm <app_service_name> sh -c "npm ci && npm test"
```

Run migrations inside the container first if needed:
```bash
docker compose exec <app_service_name> npx prisma migrate dev --schema=prisma/schema.prisma
```

Find the service/container name:
```bash
docker compose ps
# or
docker ps
```

Common mistake:
```bash
docker exec npm run test   # ❌ fails — ‘npm’ is not a container name
docker exec -it <container_name> npm run test   # ✅ correct
```

## Prisma commands

- Dev migrations (interactive):
```bash
npx prisma migrate dev --schema=prisma/schema.prisma
```

- Deploy migrations (non-interactive, recommended for CI/integration):
```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

- Reset DB (destructive; test-only):
```bash
npx prisma migrate reset --force --schema=prisma/schema.prisma
```

## CI overview

- Unit/Controller job:
  - Runs `npm test` with the DB URL cleared so integration specs auto-skip.
- Integration job:
  - Launches a Postgres service (GitHub Actions `services`).
  - Sets a DB URL (usually `localhost:5432` in Actions).

Store secrets (DB URL, JWT keys, etc.) in GitHub Secrets. Don’t commit a real `.env`.

## Troubleshooting

- P1001: Can't reach database server at `postgres:5432`
  - You’re running from host but using `postgres` as host. Switch to `localhost` in `DOCKER_DATABASE_URL`, or run the command inside a container on the compose network.

- Cannot find module 'migrate'
  - Use Prisma CLI:
    - `npx prisma migrate dev`
    - `npx prisma migrate deploy`

- Integration tests start during unit-only runs
  - Ensure `DOCKER_DATABASE_URL` is unset if you want to skip integration: `unset DOCKER_DATABASE_URL`.

- DB not ready / port conflicts
  - Check the container:
    ```bash
    docker compose ps
    docker port <postgres_container_name> 5432
    ```
  - Optionally wait for DB readiness (`pg_isready`) before migrations/tests.

## FAQ

- Why do controller tests work without starting the Express server?
  - Supertest calls the Express app function directly; no `app.listen()` or port binding is needed.

- Should I run tests from host or inside Docker?
  - CI: run tests on the runner with a containerized DB service (recommended).
  - Local dev: host-mode is faster and simpler; container-mode matches network conditions in CI. Use whichever your team prefers.

- Which DB URL should I use locally?
  - From host: `localhost:5432`
  - From inside container: `postgres:5432`

- Why `--runInBand` for integration?
  - Avoids multiple Jest workers competing for DB connections and causing flakiness.
