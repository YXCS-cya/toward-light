# Toward Light

Toward Light is a full-stack journaling platform that helps users record life stories, label emotions/events, and receive AI-assisted reflection.

The system is split into three runtime services:

- **Frontend** (`frontend/`): React + Vite single-page app.
- **Backend** (`backend/`): Spring Boot API (auth, stories, dictionaries, guide cards, analytics).
- **AI Service** (`ai-service/`): FastAPI service for embedding, semantic search, and story analysis.

Message-driven synchronization (RabbitMQ) keeps the vector index in sync whenever stories are created/updated/deleted.

---

## 1) Product capabilities

- JWT login and authenticated story management.
- Emotion and event tagging for each story.
- Guided writing prompts by emotion/event combination.
- Story list, detail, edit, and soft delete.
- AI analysis for each story:
  - standard request/response analysis
  - streaming analysis via SSE
- Semantic search across a user’s own stories (FAISS vector retrieval).
- Basic analytics (emotion and event distributions).

---

## 2) High-level architecture

```text
React Frontend (5173)
        |
        v
Spring Boot Backend (8081)
  - Auth (JWT)
  - Story CRUD
  - Dict / Guide / Analytics
  - Calls AI Service HTTP API
  - Publishes story events to RabbitMQ
        |
        +--> RabbitMQ queue: lightwards.test.queue
        |         |
        |         v
        |   Python Consumer -> embedding -> FAISS index
        |
        +--> FastAPI AI Service (8000)
              - /semantic-search
              - /analyze-story
              - /analyze-story-stream

MySQL (3307 mapped -> 3306 in container) stores users/stories/dictionaries.
```

---

## 3) Repository structure

```text
.
├── backend/              # Spring Boot service
├── frontend/             # React + TypeScript UI
├── ai-service/           # FastAPI + consumer + FAISS logic
├── infra/
│   ├── docker-compose.yml
│   └── 02_seed.sql       # dictionary + test user seed data
└── docs/
    └── dev-start-checklist.md
```

---

## 4) Tech stack

- **Frontend**: React 19, TypeScript, Vite, Axios, React Router.
- **Backend**: Java 17, Spring Boot 3, Spring Web, Spring Data JPA, RabbitMQ, JWT (JJWT), MySQL.
- **AI service**: Python, FastAPI, Uvicorn, Pika, FAISS, OpenAI-compatible clients.
- **Infrastructure**: Docker Compose (MySQL + RabbitMQ).

---

## 5) Local setup

## Prerequisites

- Docker + Docker Compose
- Java 17+
- Maven (or use `./mvnw`)
- Node.js 18+
- Python 3.10+

## Step A: start infrastructure

From repository root:

```bash
docker compose -f infra/docker-compose.yml up -d
```

This brings up:

- MySQL at `localhost:3307` (container 3306)
- RabbitMQ at `localhost:5672`
- RabbitMQ Management UI at `http://localhost:15672` (`guest/guest`)

> Note: `infra/docker-compose.yml` mounts `./mysql` for init scripts. Ensure your local compose context contains required SQL init files if you expect automatic schema/data creation.

## Step B: run backend

```bash
cd backend
./mvnw spring-boot:run
```

Default backend URL: `http://localhost:8081`

## Step C: prepare and run AI service

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `ai-service/.env` with at least:

```env
# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_QUEUE=lightwards.test.queue

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=lightwards

# LLM/Embedding providers
DASHSCOPE_API_KEY=your_dashscope_key
DEEPSEEK_API_KEY=your_deepseek_key

# Optional overrides
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DEEPSEEK_BASE_URL=https://api.deepseek.com
EMBEDDING_MODEL=text-embedding-v3
DEEPSEEK_MODEL=deepseek-chat
```

Run FastAPI:

```bash
python -m uvicorn app.main:app --reload
```

Run RabbitMQ consumer (separate terminal):

```bash
python run_consumer.py
```

## Step D: run frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8081
```

Start dev server:

```bash
npm run dev
```

Default frontend URL: `http://localhost:5173`

---

## 6) Seed data and test login

`infra/02_seed.sql` inserts:

- emotion dictionary rows
- event dictionary rows
- test user (`username: test`)

If your schema + seed scripts are loaded, you can log in with the seeded account and start creating stories.

---

## 7) Core API surface

### Auth

- `POST /auth/login`
- `GET /auth/me`

### Stories

- `POST /api/stories`
- `GET /api/stories`
- `GET /api/stories/{id}`
- `PUT /api/stories/{id}`
- `DELETE /api/stories/{id}`
- `POST /api/stories/semantic-search`
- `GET /api/stories/{id}/ai-analysis`
- `GET /api/stories/{id}/ai-analysis/stream` (SSE)

### Guide / Dictionary / Analytics

- `GET /api/guide/questions`
- `GET /api/dict/emotions`
- `GET /api/dict/events`
- `GET /api/analytics/emotions`
- `GET /api/analytics/events`
- `GET /api/analytics/emotion-event`

### AI Service (called by backend)

- `GET /health`
- `POST /semantic-search`
- `POST /analyze-story`
- `POST /analyze-story-stream`

---

## 8) Development workflow notes

Typical startup sequence for full functionality:

1. MySQL + RabbitMQ
2. Spring Boot backend
3. Python consumer
4. FastAPI AI service
5. Frontend

When a story changes, backend publishes a queue event. Consumer recalculates embeddings and updates FAISS index so semantic search can find new/updated content.

---

## 9) Known caveats

- Several default secrets/passwords are development-only and should be replaced for production.
- AI-related features require valid provider API keys.
- Backend currently allows CORS for local frontend origins (`localhost:5173` / `127.0.0.1:5173`).
- Because story deletion is soft-delete, search consistency depends on consumer/event processing timing.

---

## 10) Suggested production hardening

- Move all secrets to a secure secret manager.
- Use managed RabbitMQ/MySQL with backups.
- Add migrations (Flyway/Liquibase) for deterministic schema evolution.
- Add observability (structured logs, metrics, tracing).
- Add CI checks for Java/Python/Frontend tests and linting.
- Add retry/dead-letter handling for message failures.

