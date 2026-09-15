# Standard Technical Document
## LandStack Nexus — Land Registry Reconciliation Platform
### SIH Problem Statement: PS 26014 — Digital Land Records Interoperability
### Version 1.0 | September 2026

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Data Schemas](#2-data-schemas)
3. [API Standards](#3-api-standards)
4. [Interoperability Standards](#4-interoperability-standards)
5. [GIS Standards](#5-gis-standards)
6. [Security Framework](#6-security-framework)
7. [UI/UX Guidelines](#7-uiux-guidelines)
8. [Color Schema](#8-color-schema)
9. [Deployment & Scalability](#9-deployment--scalability)

---

## 1. System Architecture

LandStack Nexus employs a **three-tier microservice architecture** aligned with DILRMP 3.0 guidelines for Digital India Land Records Modernisation Programme interoperability.

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                       PRESENTATION TIER                          │
│  ┌─────────────────────┐    ┌──────────────────────────────┐    │
│  │   Officer Dashboard  │    │      Citizen PWA (Mobile)    │    │
│  │   React + Vite       │    │      React + Vite + PWA     │    │
│  │   MapLibre GL (GIS)  │    │      Mobile-First UI        │    │
│  │   Port: 5173         │    │      Port: 5174             │    │
│  └──────────┬──────────┘    └──────────────┬───────────────┘    │
│             │         Vite Proxy /api       │                    │
├─────────────┼──────────────────────────────┼────────────────────┤
│             ▼                              ▼                     │
│                      APPLICATION TIER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Node.js + Express + TypeScript               │   │
│  │                     Port: 3000                            │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐ │   │
│  │  │ GoRT     │  │  Conflict    │  │ Audit & Resolution │ │   │
│  │  │ Adapters │  │  Engine      │  │ Controller         │ │   │
│  │  └──────────┘  └──────────────┘  └────────────────────┘ │   │
│  └──────────────────────────┬───────────────────────────────┘   │
├─────────────────────────────┼───────────────────────────────────┤
│                             ▼                                    │
│                      PERSISTENCE TIER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         PostgreSQL 16 + PostGIS 3.4 (Docker)             │   │
│  │         6 Tables • EPSG:4326 • JSONB Audit Logs          │   │
│  │         Port: 5432                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| Backend Runtime | Node.js 20 LTS + TypeScript 5.7 | Type safety, async I/O for concurrent state API polling |
| Web Framework | Express 4.21 | Lightweight, widely audited, GOI procurement compatible |
| Database | PostgreSQL 16 + PostGIS 3.4 | Open-source spatial RDBMS, OGC compliant |
| Officer Frontend | React 19 + Vite 6 + TailwindCSS 4 | Component reuse, HMR, utility-first CSS |
| Citizen Frontend | React 19 + Vite 6 + PWA | Offline-first mobile web app |
| GIS Renderer | MapLibre GL JS (OSM tiles) | Open-source, no vendor lock-in (replaces Google Maps) |
| Monorepo | Turborepo + NPM Workspaces | Parallel builds, shared type packages |
| Containerisation | Docker + Docker Compose | Reproducible deployments for MeghRaj GI Cloud |

---

## 2. Data Schemas

All tables use `CREATE TABLE IF NOT EXISTS` for idempotent schema initialisation.

### 2.1 `parcels` — Cadastral Boundary Registry

| Column | Type | Constraints | Description |
|---|---|---|---|
| `ulpin` | `VARCHAR(14)` | `PRIMARY KEY` | Unique Land Parcel Identification Number (Bhu-Aadhaar) |
| `source_state` | `VARCHAR(10)` | `NOT NULL` | ISO-style state code (OD, TN, PB) |
| `geom` | `GEOMETRY(Polygon, 4326)` | — | PostGIS polygon in WGS 84 |
| `area_sqm` | `NUMERIC` | — | Surveyed area in square metres |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |

### 2.2 `ror_records` — Revenue Department (Record of Rights)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-increment identifier |
| `ulpin` | `VARCHAR(14)` | `FK → parcels(ulpin)` | Parcel reference |
| `owner_name` | `VARCHAR(255)` | `NOT NULL` | Tenure holder name (normalised uppercase) |
| `area_acre` | `NUMERIC` | — | Land extent in acres |
| `khata_no` | `VARCHAR(100)` | — | State-specific RoR identifier |
| `last_updated` | `TIMESTAMPTZ` | — | Last update from state API |

### 2.3 `registration_records` — Sub-Registrar Department

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-increment identifier |
| `ulpin` | `VARCHAR(14)` | `FK → parcels(ulpin)` | Parcel reference |
| `owner_name` | `VARCHAR(255)` | `NOT NULL` | Registered owner name |
| `area_acre` | `NUMERIC` | — | Registered area in acres |
| `deed_no` | `VARCHAR(100)` | — | Registration deed number |
| `registered_on` | `TIMESTAMPTZ` | — | Deed registration date |

### 2.4 `tax_records` — Municipal Tax Department

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-increment identifier |
| `ulpin` | `VARCHAR(14)` | `FK → parcels(ulpin)` | Parcel reference |
| `owner_name` | `VARCHAR(255)` | `NOT NULL` | Tax assessment holder |
| `tax_due` | `NUMERIC` | `DEFAULT 0` | Outstanding dues (₹) |
| `last_paid_on` | `TIMESTAMPTZ` | — | Last payment date |

### 2.5 `conflicts` — Discrepancy Detection Log

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Conflict identifier |
| `ulpin` | `VARCHAR(14)` | `FK → parcels(ulpin)` | Affected parcel |
| `conflict_type` | `VARCHAR(100)` | `NOT NULL` | OWNERSHIP / AREA / FRESHNESS |
| `field_values` | `JSONB` | `DEFAULT '{}'` | Conflicting values from both sources |
| `source_timestamps` | `JSONB` | `DEFAULT '{}'` | Timestamps of source records |
| `severity` | `VARCHAR(20)` | `DEFAULT 'MEDIUM'` | HIGH / MEDIUM / LOW |
| `status` | `VARCHAR(20)` | `DEFAULT 'UNRESOLVED'` | UNRESOLVED / RESOLVED |
| `detected_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Engine detection time |
| `resolved_at` | `TIMESTAMPTZ` | — | Officer resolution time |
| `resolution_note` | `TEXT` | — | Officer's resolution justification |

### 2.6 `audit_logs` — Immutable State Change Ledger

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Log entry identifier |
| `conflict_id` | `INTEGER` | `FK → conflicts(id)` | Associated conflict |
| `action_by` | `VARCHAR(100)` | `NOT NULL` | Officer ID performing action |
| `action_type` | `VARCHAR(100)` | `NOT NULL` | MANUAL_RESOLUTION / AUTO_RESOLVE |
| `old_state` | `JSONB` | — | Full conflict snapshot before change |
| `new_state` | `JSONB` | — | Full conflict snapshot after change |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Timestamp of action |

---

## 3. API Standards

All endpoints follow **RESTful** design principles and return JSON payloads conforming to the `ApiResponse<T>` envelope:

```json
{
  "success": true | false,
  "data": T | null,
  "message": "Human-readable status message"
}
```

### 3.1 Endpoint Inventory

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Health check + DB connectivity | Public |
| `POST` | `/api/v1/ingest/:department` | Ingest raw state payload | Service |
| `GET` | `/api/v1/conflicts` | List unresolved conflicts | Officer |
| `POST` | `/api/v1/conflicts/:id/resolve` | Resolve conflict (transactional) | Officer |
| `GET` | `/api/v1/parcels/geojson` | GeoJSON FeatureCollection | Public |
| `GET` | `/api/v1/parcels/:ulpin` | Full parcel profile | Citizen |

### 3.2 OpenAPI 3.0 Compliance

All endpoints are designed for OpenAPI 3.0 specification generation. Request/response schemas are derived from TypeScript interfaces in `packages/shared`, ensuring contract-first API development. Parameterised queries (`$1, $2, ...`) are used throughout to prevent SQL injection.

### 3.3 Error Handling

| HTTP Code | Meaning | Example |
|---|---|---|
| `200` | Success | Conflict resolved |
| `201` | Created | Record ingested |
| `400` | Bad Request | Invalid department or unsupported state |
| `404` | Not Found | ULPIN does not exist |
| `409` | Conflict | FK violation or double-resolution |
| `500` | Server Error | Transaction rollback |
| `503` | Unavailable | Database unreachable |

---

## 4. Interoperability Standards

### 4.1 GoRT — Glossary of Revenue Terms

The GoRT Semantic Adapter Layer normalises heterogeneous state revenue terminology into a canonical `CommonParcelModel`. This addresses the fundamental challenge identified in DILRMP 3.0: **no two Indian states use the same field names for land records**.

| GoRT Canonical Field | Odisha Term | Tamil Nadu Term | Punjab Term |
|---|---|---|---|
| `ulpin` | Generated from `khata_no` | Generated from `survey_no` | Generated from `khasra_no` |
| `tenure_holder` | `owner_name` | `pattadhar_name` | `owner_name` |
| `extent` | `area` (acre) | `extent` (varies) | `area` (varies) |
| `parcel_id` | `khata_no` | `survey_no` | `khasra_no` |

### 4.2 Adapter Pipeline

```
State API Payload (Raw JSON)
        │
        ▼
   GoRT Adapter (e.g., normalizeOdishaData)
   ├── Field mapping (state terms → canonical)
   ├── Area normalisation (hectare/sqft/sqm → acre)
   └── ULPIN generation (state code + identifier)
        │
        ▼
   CommonParcelModel (Canonical)
        │
        ▼
   PostgreSQL INSERT (parameterised)
```

### 4.3 ULPIN Format

The Unique Land Parcel Identification Number follows the Bhu-Aadhaar specification:

```
Format: {STATE_CODE}-{YEAR}-{IDENTIFIER}
Example: OD-2026-KH101
Length:  14 characters (padded)
```

---

## 5. GIS Standards

### 5.1 Spatial Reference System

- **CRS**: EPSG:4326 (WGS 84) — global standard for GPS coordinates
- **Storage**: PostGIS `GEOMETRY(Polygon, 4326)` with `ST_SetSRID`
- **Exchange**: GeoJSON (RFC 7946) via `ST_AsGeoJSON(geom)`

### 5.2 OGC Compliance

| Standard | Implementation |
|---|---|
| **WMS** (Web Map Service) | MapLibre GL renders OSM raster tiles via XYZ tiling scheme |
| **WFS** (Web Feature Service) | `/api/v1/parcels/geojson` serves OGC-compliant GeoJSON FeatureCollection |
| **ISO 19125** (Simple Features) | PostGIS spatial functions (`ST_GeomFromGeoJSON`, `ST_AsGeoJSON`) |
| **ISO 19152** (LADM) | `parcels` table aligns with Land Administration Domain Model spatial unit |

### 5.3 Spatial Operations

```sql
-- Ingestion: GeoJSON → PostGIS geometry
ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)

-- Retrieval: PostGIS geometry → GeoJSON
ST_AsGeoJSON(geom) AS geometry

-- Bounding box calculation performed client-side via MapLibre GL LngLatBounds
```

### 5.4 Map Rendering

- **Tile Provider**: OpenStreetMap (open-source, no API key required)
- **Renderer**: MapLibre GL JS (WebGL-based, fork of Mapbox GL — no proprietary dependency)
- **Layers**: Parcel fill (semi-transparent), parcel outline (solid border), interactive popups

---

## 6. Security Framework

### 6.1 Role-Based Access Control (RBAC)

| Role | Access Level | Permissions |
|---|---|---|
| **Citizen** | Public | Search ULPIN, view Transaction Readiness Score |
| **Officer** | Authenticated | View map, review conflicts, resolve discrepancies |
| **Admin** | Superuser | Full CRUD, audit log access, system configuration |
| **Service** | Machine-to-Machine | Data ingestion from state APIs |

### 6.2 Immutable Audit Trail

Every conflict resolution is wrapped in a PostgreSQL `BEGIN`/`COMMIT` transaction:

```
BEGIN
  → SELECT current state (old_state snapshot)
  → UPDATE conflict status to RESOLVED
  → INSERT audit_log with old_state + new_state JSONB
COMMIT
```

**If any step fails, the entire transaction is rolled back.** The `audit_logs` table is append-only by application design — no `UPDATE` or `DELETE` queries are issued against it.

### 6.3 Data Protection

| Measure | Implementation |
|---|---|
| SQL Injection Prevention | All queries use parameterised placeholders (`$1, $2`) |
| CORS | Configured via `cors()` middleware |
| Input Validation | Department and state_code whitelist checking |
| Connection Pooling | `pg.Pool` with automatic error handling and reconnection |
| Environment Variables | Database credentials stored in `.env` (excluded from VCS via `.gitignore`) |

---

## 7. UI/UX Guidelines

### 7.1 Officer Dashboard (Desktop-First)

The Officer Dashboard is designed for **desktop GIS workstations** used in government offices:

- **Layout**: Full-screen split — sidebar (384px) + map (remaining)
- **Sidebar**: Scrollable discrepancy queue with severity-coded badges
- **Map**: MapLibre GL JS with parcel polygon overlays and click-to-inspect popups
- **Evidence Card**: Floating overlay with side-by-side department data comparison
- **AI Banner**: Simulated Sentinel-2 NDVI change detection alert for AREA conflicts
- **Resolution Flow**: Inline textarea → POST to transactional API → sidebar auto-refresh

### 7.2 Citizen PWA (Mobile-First)

The Citizen Portal is a Progressive Web App optimised for **low-bandwidth rural mobile access**:

- **Container**: `max-w-md mx-auto` — locked to mobile viewport width on desktop
- **Search**: Single ULPIN input with prominent CTA button
- **Results**: Transaction Readiness Score (100/75/50) with colour-coded ring
- **Status List**: Divided `<ul>` with emoji indicators (✅/⚠️) and soft pill badges
- **Disclaimer**: Mandatory legal notice — "NOT a legal certification of title"
- **Offline**: Service worker via `vite-plugin-pwa` for app-shell caching

### 7.3 Typography

- **Font Stack**: System UI (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto`)
- **Monospace**: Used for ULPIN display (`font-mono`)
- **Scale**: `text-xs` (11px) for labels, `text-sm` (14px) for body, `text-lg`+ for headers

---

## 8. Color Schema

### 8.1 Primary Palette

| Token | Hex Code | Usage |
|---|---|---|
| Primary Blue | `#1d4ed8` | Parcel outlines, primary actions |
| Primary Blue (Fill) | `#3b82f6` | Parcel fill (40% opacity) |
| Indigo 600 | `#4f46e5` | Resolve buttons, active states |
| Indigo 950 | `#1e1b4b` | Selected sidebar item background |

### 8.2 Severity / Status Palette

| Token | Hex Code | Usage |
|---|---|---|
| Success Green | `#22c55e` | Score 100, confirmed badges |
| Success Green (Light) | `#dcfce7` | Green badge background |
| Warning Amber | `#f59e0b` | Score 75, variance flagged |
| Warning Amber (Light) | `#fef3c7` | Amber badge background |
| Alert Red | `#ef4444` | Score 50, HIGH severity |
| Alert Red (Light) | `#fee2e2` | Red badge background |

### 8.3 Neutral Palette

| Token | Hex Code | Usage |
|---|---|---|
| Background (Dark) | `#030712` | Officer Dashboard (`gray-950`) |
| Background (Light) | `#f9fafb` | Citizen PWA (`gray-50`) |
| Card Surface | `#111827` | Dark cards (`gray-900`) |
| Card Surface (Light) | `#ffffff` | Light cards |
| Text Primary | `#f9fafb` | Dark theme text |
| Text Secondary | `#6b7280` | Muted labels |

### 8.4 AI Banner Palette

| Token | Hex Code | Usage |
|---|---|---|
| AI Green | `#22c55e` | NDVI analysis text |
| AI Background | `#0f172a` | Terminal-style dark background |
| Confidence Bar | `#16a34a → #4ade80` | Gradient progress bar |

---

## 9. Deployment & Scalability

### 9.1 Container Architecture

LandStack Nexus is fully containerised for deployment on **MeghRaj (GI Cloud)**, the Government of India's cloud infrastructure.

```yaml
Services:
  db:       postgis/postgis:16-3.4      # Spatial database
  backend:  node:20-alpine              # API server
  officer:  nginx:alpine                # Static SPA serving
  citizen:  nginx:alpine                # Static PWA serving
```

### 9.2 Stateless Backend

The Express API server is **fully stateless** — all session/state is stored in PostgreSQL. This enables:

- Horizontal scaling via Kubernetes pods behind a load balancer
- Zero-downtime rolling deployments
- Auto-scaling based on ingestion API request volume

### 9.3 Database Scalability

| Strategy | Implementation |
|---|---|
| Connection Pooling | `pg.Pool` with configurable pool size |
| Read Replicas | PostgreSQL streaming replication for read-heavy GeoJSON queries |
| Spatial Indexing | PostGIS GIST indexes on `geom` column for sub-millisecond spatial queries |
| Schema Idempotency | `CREATE TABLE IF NOT EXISTS` for safe redeployments |

### 9.4 Production Checklist

- [ ] Configure `DATABASE_URL` with managed PostgreSQL (e.g., NIC Cloud SQL)
- [ ] Enable HTTPS via reverse proxy (Nginx / Traefik)
- [ ] Set `NODE_ENV=production` for Express security hardening
- [ ] Enable PostGIS GIST spatial indexes
- [ ] Configure RBAC JWT tokens for officer authentication
- [ ] Set up Prometheus + Grafana for API monitoring
- [ ] Enable pg_cron for scheduled conflict re-scans

---

## Appendix A: Abbreviations

| Abbreviation | Full Form |
|---|---|
| ULPIN | Unique Land Parcel Identification Number |
| GoRT | Glossary of Revenue Terms |
| DILRMP | Digital India Land Records Modernisation Programme |
| DoLR | Department of Land Resources |
| RoR | Record of Rights |
| LADM | Land Administration Domain Model (ISO 19152) |
| OGC | Open Geospatial Consortium |
| PWA | Progressive Web Application |
| RBAC | Role-Based Access Control |
| NDVI | Normalized Difference Vegetation Index |
| GI Cloud | Government of India Cloud (MeghRaj) |

---

*Document prepared for Smart India Hackathon 2026 — Problem Statement PS 26014*
*Team: LandStack Nexus | Version 1.0 | September 2026*
