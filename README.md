# ⚔ Corporate War Room

Command-and-control platform for real-time incident management.

**Stack:** React (Vite) · Node.js / Express · Socket.io · Redis Pub/Sub · MongoDB Atlas

---

## Project Structure

```
corporate-warroom/
├── client/                     # Vite + React frontend
│   ├── src/
│   │   ├── components/         # UI pages & elements
│   │   ├── context/            # AuthContext, IncidentContext
│   │   ├── hooks/              # useSocket, useAuth
│   │   ├── services/           # Axios API wrappers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
└── server/                     # Node.js + Express backend
    ├── src/
    │   ├── config/             # db.js (Mongo), redis.js
    │   ├── middleware/         # auth.js, errorHandler.js
    │   ├── models/             # User.js, Incident.js
    │   ├── routes/             # auth.js, incidents.js
    │   ├── services/           # authService, incidentService, logger
    │   ├── sockets/            # socketManager.js (Redis ↔ Socket.io bridge)
    │   └── app.js
    ├── .env.example
    └── package.json
```

---

## Quick Start

### 1 · Prerequisites
- Node.js ≥ 18
- Redis (local or Upstash)
- MongoDB Atlas cluster

### 2 · Server setup
```bash
cd server
cp .env.example .env          # fill in MONGO_URI, REDIS_URL, JWT_SECRET
npm install
npm run dev
```

### 3 · Client setup
```bash
cd client
cp .env.example .env          # set VITE_API_URL=http://localhost:4000
npm install
npm run dev
```

---

## Real-time Architecture

```
Browser A              Browser B
    │                      │
    └──── Socket.io ───────┘
                │
          Node instance 1 ──── Redis PUBLISH ──── Redis Pub/Sub channel
          Node instance 2 ──── Redis SUBSCRIBE ──────────────────────┘
                                     │
                               Fan-out to all
                             connected sockets
```

Every `incidentService` mutation publishes an event to `warroom:incidents`.
The subscriber client in each server instance receives it and broadcasts
the event to all Socket.io clients via `io.to('warroom').emit(...)`.
This makes the architecture **horizontally scalable** from day one.

---

## Environment Variables

| Variable         | Side   | Description                        |
|-----------------|--------|------------------------------------|
| `MONGO_URI`     | Server | MongoDB Atlas connection string    |
| `REDIS_URL`     | Server | Redis connection URL               |
| `JWT_SECRET`    | Server | Secret for signing JWTs            |
| `JWT_EXPIRES_IN`| Server | Token lifetime (default `8h`)      |
| `PORT`          | Server | HTTP port (default `4000`)         |
| `CLIENT_ORIGIN` | Server | CORS origin for the client         |
| `VITE_API_URL`  | Client | Backend base URL                   |

---

## Deployment (AWS / GCP)

### Server
```bash
# Build step is a no-op for Node.js; just set NODE_ENV
NODE_ENV=production npm start
```
Deploy with **Elastic Beanstalk**, **Cloud Run**, or any container runtime.
Use **ElastiCache (Redis)** on AWS or **Memorystore** on GCP.

### Client
```bash
cd client && npm run build     # outputs to client/dist/
```
Serve `dist/` via **S3 + CloudFront**, **GCS + Cloud CDN**, or **Vercel/Netlify**.

---

## API Reference

| Method | Endpoint                          | Auth | Description              |
|--------|-----------------------------------|------|--------------------------|
| POST   | `/api/auth/register`              | —    | Create account           |
| POST   | `/api/auth/login`                 | —    | Get JWT                  |
| GET    | `/api/auth/me`                    | JWT  | Current user             |
| GET    | `/api/incidents`                  | JWT  | List (filter by query)   |
| POST   | `/api/incidents`                  | JWT  | Create incident          |
| GET    | `/api/incidents/:id`              | JWT  | Get single incident      |
| PATCH  | `/api/incidents/:id`              | JWT  | Update incident          |
| POST   | `/api/incidents/:id/updates`      | JWT  | Append situation update  |
| DELETE | `/api/incidents/:id`              | JWT + COMMANDER/ADMIN | Delete |

---

## Socket.io Events

| Event                   | Direction        | Payload         |
|-------------------------|------------------|-----------------|
| `INCIDENT_CREATED`      | Server → Client  | Incident object |
| `INCIDENT_UPDATED`      | Server → Client  | Incident object |
| `INCIDENT_UPDATE_ADDED` | Server → Client  | Incident object |
| `INCIDENT_DELETED`      | Server → Client  | `{ _id }`       |
| `JOIN_INCIDENT`         | Client → Server  | `incidentId`    |
| `LEAVE_INCIDENT`        | Client → Server  | `incidentId`    |
