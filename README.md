<div align="center">

# 🏛️ LandStack Nexus

### Land Registry Reconciliation Platform

**"Integration tells us what records contain. Reconciliation tells us whether we can trust them."**

*Smart India Hackathon 2026 — PS 26014: Digital Land Records Interoperability*

---

![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-3.4-5CAD4A)
![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?logo=turborepo)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## 🎯 Problem Statement

India's land records are fragmented across **Revenue**, **Registration**, and **Municipal** departments — each maintaining independent, often contradictory databases. A single parcel can have mismatched owners, conflicting areas, and stale records across systems. LandStack Nexus bridges these silos by **ingesting**, **normalising**, and **reconciling** multi-department land data through the GoRT (Glossary of Revenue Terms) semantic adapter framework.

## 🏗️ Architecture

```
┌──────────────┐    ┌──────────────┐    ┌─────────────────────┐
│  Citizen PWA │    │   Officer    │    │  State APIs (Mock)  │
│  (Mobile)    │    │  Dashboard   │    │  OD / TN / PB       │
│  :5174       │    │  :5173       │    │                     │
└──────┬───────┘    └──────┬───────┘    └──────────┬──────────┘
       │                   │                       │
       └───────────┬───────┘                       │
                   ▼                               ▼
          ┌────────────────────────────────────────────┐
          │      Express API Server (:3000)             │
          │  GoRT Adapters → Conflict Engine → Audit    │
          └────────────────────┬───────────────────────┘
                               ▼
                ┌──────────────────────────┐
                │  PostgreSQL 16 + PostGIS │
                │  6 Tables • EPSG:4326    │
                └──────────────────────────┘
```

## 📁 Monorepo Structure

```
landstack-nexus/
├── apps/
│   ├── backend/          # Node.js + Express + TypeScript
│   │   └── src/
│   │       ├── adapters/       # GoRT semantic adapters (OD, TN, PB)
│   │       ├── engine/         # Conflict detection engine
│   │       ├── routes/         # REST API endpoints
│   │       ├── mock-data/      # Scenario JSON payloads
│   │       ├── db.ts           # PostgreSQL connection pool
│   │       ├── schema.sql      # DDL for all 6 tables
│   │       └── seed.ts         # PostGIS parcel seeder
│   ├── officer-ui/       # React + Vite + Tailwind (Desktop GIS)
│   │   └── src/
│   │       └── components/     # Dashboard, MapViewer, Sidebar, EvidenceCard
│   └── citizen-pwa/      # React + Vite + Tailwind + PWA (Mobile)
│       └── src/
│           └── components/     # SearchScreen, ReadinessCard
├── packages/
│   └── shared/           # TypeScript types & interfaces
├── docs/
│   └── Standard_Technical_Document.md
├── docker-compose.yml          # PostGIS dev database
├── docker-compose.prod.yml     # Production multi-service stack
├── turbo.json
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- npm 9+

### 1. Clone & Install

```bash
git clone https://github.com/your-team/landstack-nexus.git
cd landstack-nexus
npm install
```

### 2. Start the Database

```bash
docker compose up -d
```

This starts PostgreSQL 16 + PostGIS 3.4 on port `5432`.

### 3. Seed the Database

```bash
npm run seed --workspace=@landstack/backend
```

This inserts 3 cadastral parcels with PostGIS polygons (Odisha, Tamil Nadu, Punjab).

### 4. Start All Apps

```bash
npm run dev
```

Turborepo starts all 3 apps simultaneously:

| App | URL | Description |
|---|---|---|
| Backend API | http://localhost:3000 | Express + PostgreSQL |
| Officer Dashboard | http://localhost:5173 | MapLibre map + conflict queue |
| Citizen PWA | http://localhost:5174 | Mobile ULPIN search |

### 5. Verify

```bash
npm run test:api --workspace=@landstack/backend
```

## 🧪 Demo Scenarios

| ULPIN | State | Scenario | Expected Score |
|---|---|---|---|
| `OD-101-0001` | Odisha | ✅ Clean — all records match | 100 |
| `TN-202-0001` | Tamil Nadu | ⚠️ Area conflict (1.20 vs 1.50 acre) | 75 |
| `PB-303-0001` | Punjab | 🔴 Ownership mismatch | 50 |

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/v1/ingest/:department` | Ingest state payload |
| `GET` | `/api/v1/conflicts` | List unresolved conflicts |
| `POST` | `/api/v1/conflicts/:id/resolve` | Resolve conflict (transactional) |
| `GET` | `/api/v1/parcels/geojson` | GeoJSON FeatureCollection |
| `GET` | `/api/v1/parcels/:ulpin` | Full parcel profile |

## 🔐 Security

- **Parameterised queries** — all DB operations use `$1, $2` placeholders
- **Transactional audit** — `BEGIN`/`COMMIT`/`ROLLBACK` wraps every resolution
- **Immutable logs** — `audit_logs` table is append-only
- **CORS** — configured for frontend origins

## 📄 Documentation

- [`docs/Standard_Technical_Document.md`](docs/Standard_Technical_Document.md) — Full 9-section technical specification

## 📜 License

MIT — Built for Smart India Hackathon 2026

---

<div align="center">
<sub>Built with ❤️ for Digital India • DILRMP 3.0 Aligned • Bhu-Aadhaar Compatible</sub>
</div>
