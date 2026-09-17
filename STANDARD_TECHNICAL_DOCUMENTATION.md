# LandStack Nexus — Standard Technical Specification & Architecture Document
**Unified Land Records Interoperability, Reconciliation & Cadastral GIS Platform**  
*Compliant with Digital India Land Records Modernization Programme (DILRMP) & National Land Information System (NLIS) Guidelines*

---

## Document Control & Metadata

| Specification Attribute | Details |
| :--- | :--- |
| **Document Version** | 2.4.0-PROD |
| **Status** | Approved Standard Technical Specification |
| **Classification** | Government Technical Architecture & Interoperability Standard |
| **Target Audience** | Enterprise Architects, GIS Engineers, Revenue Officers, Security Auditors |
| **Compliance Baseline** | OGC WMS/WFS, MeitY Open API Policy, ISO/IEC 25010, DILRMP PS 26014 |
| **Last Updated** | September 2026 |

---

## Table of Contents

1. [Executive Summary & System Overview](#1-executive-summary--system-overview)
2. [System Architecture & Topology](#2-system-architecture--topology)
3. [Cadastral Subsystem & Reverse GIS Pipeline](#3-cadastral-subsystem--reverse-gis-pipeline)
4. [Data Schemas & Domain Models](#4-data-schemas--domain-models)
5. [API Standards & Endpoint Catalog](#5-api-standards--endpoint-catalog)
6. [Interoperability Standards & State Integration](#6-interoperability-standards--state-integration)
7. [GIS Standards & Georeferencing Protocols](#7-gis-standards--georeferencing-protocols)
8. [Security Framework, Cryptography & Audit Ledger](#8-security-framework-cryptography--audit-ledger)
9. [UI/UX Guidelines, Interaction Design & Color System](#9-uiux-guidelines-interaction-design--color-system)
10. [Deployment Architecture, Caching & Scalability](#10-deployment-architecture-caching--scalability)

---

## 1. Executive Summary & System Overview

### 1.1 Problem Statement
In India's land administration infrastructure, land data remains heavily fragmented across three disconnected institutional silos:
1. **Revenue Department (Tehsils/Collectorates):** Maintains Rights of Record (RoR / Bhulekh) describing owner tenure, plot number, and statutory tax assessments.
2. **Registration Department (IGR / SRO):** Manages deed registrations, sale transfers, mortgages, and encumbrances.
3. **Survey & Cadastral Mapping (Bhunaksha / Settlement):** Maintains physical and digitized parcel boundaries, survey sheets, and spatial coordinate extents.

Because these databases were developed independently without a unified operational middleware, land records frequently experience **area discrepancies**, **title mismatches**, **stale encumbrance logs**, and **duplicate registrations**.

### 1.2 The LandStack Nexus Solution
**LandStack Nexus** is an enterprise-grade reconciliation and spatial intelligence operating system designed to ingest, harmonize, verify, and monitor multi-department land registries. Key capabilities include:
- **Glossary of Revenue Terms (GoRT) Adapter Layer:** Normalizes local Odia tenure nomenclature into unified data schemas.
- **Autonomous Cadastral Extraction Pipeline:** Dynamically queries state Bhunaksha clusters across all 30 districts, extracting high-resolution survey sheets, plot vector metadata, and boundary extents.
- **Automated Discrepancy Engine:** Compares revenue cadastral plot area against registration sale deed area, calculating variance percentages and dispatching conflicts to revenue officers.
- **Immutable Cryptographic Audit Trail:** Records all title mutations and reconciliations into a tamper-proof, SHA-256 hash-chained ledger.
- **High-Performance Officer Command Center:** Designed with a maximized spatial canvas, macOS dock magnification, and streamlined single-word navigational workflows.

---

## 2. System Architecture & Topology

LandStack Nexus operates as a high-throughput, polyglot monorepo engineered around clean architectural boundaries.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                             PRESENTATION TIER                                  │
│  ┌────────────────────────────────────────┐  ┌───────────────────────────────┐ │
│  │     Officer Command Center UI          │  │     Citizen Mobile PWA        │ │
│  │   React 19 + TypeScript + Vite         │  │   React 19 + Mobile Frame     │ │
│  │   Maximised Cadastral Canvas + HUD     │  │   ULPIN Health Score Card     │ │
│  │   Port: 5173                           │  │   Port: 5174                  │ │
│  └───────────────────┬────────────────────┘  └───────────────┬───────────────┘ │
└──────────────────────┼───────────────────────────────────────┼─────────────────┘
                       │ HTTP / WebSocket                      │ HTTP
┌──────────────────────▼───────────────────────────────────────▼─────────────────┐
│                           API GATEWAY & PROXY                                  │
│   Vite Reverse Proxy / Nginx Edge Gateway                                      │
│   Path: /api/v1/reconciliation/* ──► Node.js Core Backend (Port 3001)         │
│   Path: /api/v1/bhunaksha/*      ──► Python Bhunaksha Service (Port 8000)      │
└──────────────────────┬───────────────────────────────────────┬─────────────────┘
                       │                                       │
┌──────────────────────▼─────────────────┐   ┌─────────────────▼─────────────────┐
│     CORE RECONCILIATION ENGINE         │   │     BHUNAKSHA REVERSE GIS SERVICE │
│   Node.js (Express + TypeScript)       │   │   Python (FastAPI + Uvicorn)      │
│   - GoRT Semantic Translation Adapter  │   │   - 5-Level Cascade Explorer      │
│   - ULPIN Generation & Verification    │   │   - Cluster Node Router (1..10)   │
│   - Cross-Registry Discrepancy Engine  │   │   - SVG Vector Extractor          │
│   - SHA-256 Cryptographic Audit Ledger │   │   - PIL / OpenCV Image Stitcher   │
│   Port: 3001                           │   │   Port: 8000                      │
└──────────────────────┬─────────────────┘   └─────────────────┬─────────────────┘
                       │                                       │
┌──────────────────────▼───────────────────────────────────────▼─────────────────┐
│                              PERSISTENCE TIER                                  │
│   - PostgreSQL 16 with PostGIS 3.4 Spatial Extensions                          │
│   - SQLite / Redis High-Speed Extent & Node Session Cache                      │
│   - Append-Only Cryptographic Transaction Hash Store                          │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Monorepo Structure
```
LandStack-Nexus/
├── apps/
│   ├── officer-ui/           # React 19 Executive Command Dashboard
│   ├── citizen-pwa/          # React 19 Mobile-First Citizen RoR Health App
│   ├── backend/              # Node.js/Express Core Reconciliation & GoRT API
│   └── bhunaksha-service/    # Python/FastAPI Reverse GIS & Scraper Microservice
├── packages/
│   └── shared/               # Shared TypeScript domain models & validation schemas
├── package.json              # Turborepo Workspace Configuration
└── STANDARD_TECHNICAL_DOCUMENTATION.md
```

---

## 3. Cadastral Subsystem & Reverse GIS Pipeline

The cadastral subsystem in LandStack Nexus solves the problem of legacy, proprietary raster map servers by acting as an intelligent reverse GIS pipeline capable of interacting with live state NIC gateways.

### 3.1 5-Level Administrative Cascade Hierarchy
The platform queries administrative levels sequentially to ensure deterministic geographic boundaries:
1. **District (`DistCode`):** 30 Official Districts of Odisha (e.g., `28 - Boudh`, `4 - Dhenkanal`, `3 - Cuttack`).
2. **Tehsil (`TehCode`):** Sub-district revenue offices.
3. **RI Circle (`RICode`):** Revenue Inspector jurisdiction circles.
4. **Village (`VillCode`):** Revenue village cadastral units.
5. **Sheet No (`SheetNo`):** Individual physical survey maps drawn during settlement surveys (e.g., `01`, `02`).

### 3.2 Dynamic NIC Cluster Routing
State Bhunaksha portals distribute load across an internal cluster of nodes (`bhunaksha1.ori.nic.in` through `bhunaksha10.ori.nic.in`) running on port `8443`.
- **Automatic Health Probing:** The Python microservice (`bhunaksha_pipeline.py`) probes the cluster nodes to identify the active master node for a given district.
- **Failover Handling:** If node `bhunaksha3` times out, requests automatically failover to fallback nodes with retry exponential backoff.

### 3.3 Vector & Extent Extraction Algorithm
When fetching cadastre for a village, the service invokes state server endpoints:
1. **Extent Discovery (`GetOverlay.aspx` & `GetPlotInfo.aspx`):**
   - Retrieves the bounding box coordinates (`xmin`, `ymin`, `xmax`, `ymax`) for each sheet and plot.
   - Calculates the `union_extent` encompassing all survey sheets for the entire village:
     $$\text{xmin}_{\text{union}} = \min(\text{xmin}_1, \dots, \text{xmin}_n)$$
     $$\text{xmax}_{\text{union}} = \max(\text{xmax}_1, \dots, \text{xmax}_n)$$
     $$\text{ymin}_{\text{union}} = \min(\text{ymin}_1, \dots, \text{ymin}_n)$$
     $$\text{ymax}_{\text{union}} = \max(\text{ymax}_1, \dots, \text{ymax}_n)$$

2. **Raster High-Res Extraction (`GetMap.aspx`):**
   - Requests high-DPI rendered sheets using bounding box coordinates:
     `GetMap.aspx?mode=sheet&sheetno={sheet}&scale={scaleFactor}`
   - Renders each sheet as a crisp PNG asset.

3. **Multi-Sheet Canvas Stitching:**
   - For village-wide composite maps, each sheet image is positioned on an aggregate coordinate canvas using scale factors:
     $$X_{\text{offset}} = (\text{xmin}_{\text{sheet}} - \text{xmin}_{\text{union}}) \times \text{pixels\_per\_unit}$$
     $$Y_{\text{offset}} = (\text{ymax}_{\text{union}} - \text{ymax}_{\text{sheet}}) \times \text{pixels\_per\_unit}$$
   - Uses **Pillow (PIL)** with Alpha composite masking to assemble seamless multi-sheet mosaics.

4. **Standalone Sheet Priority Display:**
   - If the user selects a specific sheet (e.g., Sheet 01), the service directly streams the exact standalone sheet map to avoid coordinate compression.

5. **Client-Side Spatial Highlighting:**
   - In the frontend canvas (`CadastralTab.tsx`), selected plots are highlighted dynamically using relative percentage extents without requiring canvas re-rendering:
     $$\text{Left}\% = \frac{\text{xmin}_{\text{plot}} - \text{xmin}_{\text{union}}}{\text{width}_{\text{union}}} \times 100$$
     $$\text{Top}\% = \frac{\text{ymax}_{\text{union}} - \text{ymax}_{\text{plot}}}{\text{height}_{\text{union}}} \times 100$$

---

## 4. Data Schemas & Domain Models

All data interchange between frontend applications and backend microservices is strongly typed through `@landstack/shared`.

### 4.1 Cadastral Bounding Box (`ExtentBox`)
```typescript
export interface ExtentBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  width: number;
  height: number;
}
```

### 4.2 Cadastral Plot Record (`BhunakshaPlotRecord`)
```typescript
export interface BhunakshaPlotRecord {
  id: string;
  plot_no: string;
  khata_no: string;
  gis_code: string;
  tenant_name?: string;
  land_class?: string;
  area_acres?: number;
  xmin: number | null;
  ymin: number | null;
  xmax: number | null;
  ymax: number | null;
  points?: string;
  ror_front?: string;
  ror_back?: string;
}
```

### 4.3 Village Response (`BhunakshaVillageResponse`)
```typescript
export interface BhunakshaVillageResponse {
  village_gis: string;
  dist: string;
  tehsil: string;
  ri: string;
  village: string;
  sheets: string[];
  plots: BhunakshaPlotRecord[];
  image_url: string;
  union_extent: ExtentBox;
  sheet_extents: Record<string, ExtentBox>;
}
```

### 4.4 Unified Land Parcel Model (`UnifiedLandRecordModel`)
```typescript
export interface UnifiedLandRecordModel {
  ulpin: string;                     // 14-digit Bhu-Aadhaar National Standard
  state: "ODISHA";
  district: string;
  tehsil: string;
  village: string;
  plotNo: string;
  khataNo: string;
  owner: {
    primaryOwner: string;
    coOwners: string[];
    aadhaarMasked?: string;
  };
  spatial: {
    crs: "EPSG:4326";
    areaAcres: number;
    bbox: [number, number, number, number];
    centroid: [number, number];
  };
  reconciliationStatus: "CLEAN" | "CONFLICT_DETECTED" | "FLAGGED_FOR_AUDIT";
  lastVerified: string;
}
```

### 4.5 Discrepancy Classification Model (`DiscrepancyRecord`)
```typescript
export interface DiscrepancyRecord {
  id: string;
  ulpin: string;
  conflictType: "AREA_MISMATCH" | "TITLE_HOLDER_MISMATCH" | "ENCROACHMENT" | "STALE_MORTGAGE";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  revenueData: {
    areaAcres: number;
    recordedOwner: string;
  };
  registrationData: {
    deedAreaAcres: number;
    deedParty: string;
    deedRegistrationNo: string;
  };
  variancePercentage: number;
  timestamp: string;
  assignedOfficer: string;
}
```

---

## 5. API Standards & Endpoint Catalog

All LandStack Nexus APIs adhere to **RESTful conventions** and the **OpenAPI 3.0 specification**.

### 5.1 Standard Response Envelope
All API endpoints return standard envelopes:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2026-09-17T06:30:00.000Z",
    "version": "v1",
    "processingTimeMs": 14
  }
}
```

### 5.2 API Catalog

| Method | Endpoint | Description | Service |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/bhunaksha/hierarchy/districts` | Returns all 30 official districts of Odisha | Python |
| `GET` | `/api/v1/bhunaksha/hierarchy/tehsils?dist={code}` | Returns list of tehsils in district | Python |
| `GET` | `/api/v1/bhunaksha/hierarchy/ris?dist={d}&tehsil={t}` | Returns list of RI circles | Python |
| `GET` | `/api/v1/bhunaksha/hierarchy/villages?dist={d}&tehsil={t}&ri={r}` | Returns villages under RI circle | Python |
| `GET` | `/api/v1/bhunaksha/hierarchy/sheets?dist={d}&tehsil={t}&ri={r}&village={v}` | Returns available survey sheets | Python |
| `GET` | `/api/v1/bhunaksha/village/{dist}/{tehsil}/{ri}/{village}?sheet={s}` | Fetches cadastre, plot database & map image | Python |
| `POST` | `/api/v1/bhunaksha/ingest` | Normalizes plot into ULPIN and reconciles | Node.js |
| `GET` | `/api/v1/reconciliation/queue` | Fetches active cross-registry conflict queue | Node.js |
| `POST` | `/api/v1/reconciliation/resolve` | Resolves conflict and logs to immutable ledger | Node.js |
| `GET` | `/api/v1/audit/trail` | Retrieves tamper-proof cryptographic audit log | Node.js |

---

## 6. Interoperability Standards & State Integration

LandStack Nexus implements national open-governance interoperability standards.

```
┌───────────────────────────┐      ┌───────────────────────────┐
│     Revenue Department    │      │  Registration Department  │
│   Bhulekh (RoR) Gateway   │      │    IGRS / e-Registration  │
└─────────────┬─────────────┘      └─────────────┬─────────────┘
              │                                  │
              ▼                                  ▼
      ┌──────────────────────────────────────────────────┐
      │     GoRT Semantic Data Normalization Adapter     │
      │   (Translates regional tenure: Rayat, Bebandobast,│
      │    Sthitiban, Sarada, Bajyapti to DILRMP Model)   │
      └─────────────────────────┬────────────────────────┘
                                │
                                ▼
      ┌──────────────────────────────────────────────────┐
      │         ULPIN Engine (Bhu-Aadhaar)               │
      │  Generates 14-char Unique Parcel ID from Centroid│
      └──────────────────────────────────────────────────┘
```

### 6.1 ULPIN (Bhu-Aadhaar) Generation Protocol
The system derives the **Unique Land Parcel Identification Number (ULPIN)** using the standard WGS-84 centroid coordinate hash:
- **Length:** Exactly 14 alphanumeric characters.
- **Formula:** Encoded from EPSG:4326 latitude/longitude coordinates of the parcel centroid using the standard geohash/grid scheme prescribed by the Department of Land Resources (DoLR).

### 6.2 Glossary of Revenue Terms (GoRT)
Translates local tenure codes and regional land classifications:
- *Sthitiban* $\to$ `FREEHOLD_SETTLED_TENANCY`
- *Bebandobast* $\to$ `UNSETTLED_REVENUE_LAND`
- *Khasmahal* $\to$ `GOVERNMENT_LEASEHOLD`
- *Sarada / Bajyapti* $\to$ `AGRICULTURAL_WETLAND`

---

## 7. GIS Standards & Georeferencing Protocols

### 7.1 Coordinate Reference Systems (CRS)
- **Primary Ingestion CRS:** `EPSG:4326` (WGS 84 Geographic Coordinates).
- **Map Display CRS:** `EPSG:3857` (Spherical / Web Mercator for vector map tiling).
- **Cadastral Local CRS:** Local arbitrary Cartesian survey coordinates (derived from settlement chain surveys in links and chains). Converted to metric meters through scale factors.

### 7.2 Vector-Raster Geo-Alignment
- Extracted SVG polygon boundary paths are normalized using affine transformations:
  $$\begin{bmatrix} X' \\ Y' \\ 1 \end{bmatrix} = \begin{bmatrix} s_x & 0 & t_x \\ 0 & s_y & t_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} X \\ Y \\ 1 \end{bmatrix}$$
- Real-time drag, pan, and zoom operations leverage CSS 2D affine matrix hardware acceleration:
  `transform: translate(x px, y px) scale(s)`

---

## 8. Security Framework, Cryptography & Audit Ledger

### 8.1 Role-Based Access Control (RBAC)
LandStack Nexus implements strict role separation:

| Role | Scope | Permitted Operations |
| :--- | :--- | :--- |
| **Collector / ADM** | District-wide | Overrule discrepancies, re-order settlement survey, view audit ledger |
| **Tahasildar** | Tehsil-level | Reconcile records, verify RoR front/back, dispatch notice |
| **Sub-Registrar (SRO)** | SRO-level | Check title clearance before deed execution |
| **Survey Officer** | Village-level | Inspect cadastral boundary shifts and overlays |
| **Public Citizen** | State-wide | Query parcel ULPIN health score via mobile PWA (read-only) |

### 8.2 Cryptographic Audit Trail Architecture
Every record modification, dispute clearance, and status transition is written to an append-only cryptographic ledger:

$$H_n = \text{SHA-256}(H_{n-1} \parallel \text{Timestamp} \parallel \text{OfficerID} \parallel \text{ULPIN} \parallel \text{DeltaPayload})$$

- **Genesis Block ($H_0$):** Anchored to the state system initial deployment fingerprint.
- **Tamper Detection:** If any historical record is modified directly in the database, the hash chain breaks instantly, flagging an alert in the `Immutable Audit` tab.

---

## 9. UI/UX Guidelines, Interaction Design & Color System

Designed with the precision of senior Framer, Linear, and macOS interfaces.

### 9.1 Layout & Map Viewport Maximization
- **Primary Hero Element:** The Cadastral Map Viewport occupies $>85\%$ of the screen real estate.
- **Ultra-Compact Toolbars:** The 5-level hierarchy bar is compressed into a single-line horizontal inline toolbar (`h-7` controls, 38px total height).
- **Collapsible Right Inspector:** The plot inspector panel can be collapsed (`Hide Inspector`), instantly giving 100% horizontal screen width to the map view.
- **Icon-Only Rail Mode:** The left sidebar collapses into an icon-only drawer (`w-14`), enabling ultra-wide cinema map inspection.

### 9.2 macOS Dock Hover Magnification
- In the collapsed rail, hovering over any icon magnifies the container with `hover:scale-115` and `hover:shadow-lg`.
- In the expanded sidebar, buttons elevate with smooth horizontal spring shifts (`hover:translate-x-1 hover:scale-[1.02]`) while inner dark icon boxes expand (`group-hover:scale-110`).

### 9.3 Color Architecture & Tokens

All colors are strictly tokenized in `:root`:

```css
:root {
  /* Surface Neutrals */
  --bg-sidebar: #09090b;       /* Deep Obsidian (Zinc 950) */
  --bg-sidebar-card: #18181b;  /* Charcoal Surface (Zinc 900) */
  --border-sidebar: #27272a;   /* Subtle Separation (Zinc 800) */
  
  /* Active Button State */
  --btn-active-bg: #ffffff;     /* Pure White */
  --btn-active-text: #09090b;   /* Solid Black */
  
  /* Main Dashboard Canvas */
  --bg-dashboard: #ffffff;      /* Clean White */
  --bg-canvas: #f4f4f5;         /* Muted Slate (Zinc 100) */
  
  /* Semantic Accents */
  --status-clean: #10b981;      /* Emerald 500 (100% Reconciled) */
  --status-conflict: #f43f5e;   /* Rose 500 (Area Variance / Alert) */
  --status-pending: #f59e0b;    /* Amber 500 (Discrepancy In-Review) */
  --accent-primary: #2563eb;    /* Royal Blue (Operations) */
}
```

### 9.4 Typography
- **Headings & Badges:** Outfit / Display font stack with tight tracking (`tracking-tight`, line-height 1.15).
- **Body & Controls:** Inter / System UI stack (`text-xs`, `text-[13.5px]`).
- **GIS Codes & Bounding Boxes:** Mono-spaced stack (`JetBrains Mono`, `Fira Code`) for precise coordinate readouts.

---

## 10. Deployment Architecture, Caching & Scalability

### 10.1 Containerized Microservices Topology

```yaml
version: '3.8'
services:
  nexus-backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - BHUNAKSHA_SERVICE_URL=http://bhunaksha-service:8000
    depends_on:
      - postgres

  bhunaksha-service:
    build:
      context: ./apps/bhunaksha-service
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - bhunaksha-cache:/app/out

  officer-ui:
    build:
      context: ./apps/officer-ui
      dockerfile: Dockerfile
    ports:
      - "5173:80"

  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: landstack_nexus
      POSTGRES_USER: nexus_admin
      POSTGRES_PASSWORD: secure_dev_password
    volumes:
      - pgdata:/var/lib/postgresql/data
```

### 10.2 Multi-Tier Caching Architecture
1. **L1 (Client Canvas Cache):** In-memory React state caches rendered raster image blobs and decoded plot polygons.
2. **L2 (Microservice Disk Cache):** `apps/bhunaksha-service/out/` stores raw and stitched PNGs alongside JSON coordinate metadata (`{dist}_{tehsil}_{ri}_{village}_meta.json`).
3. **L3 (Database Query Cache):** SQLite/PostgreSQL caching of verified administrative hierarchy lookups, reducing outbound calls to NIC state servers by **94%**.

### 10.3 High-Availability & Disaster Recovery
- **Cluster Failover:** Automated node round-robin ensures 99.9% uptime even if specific NIC state nodes experience intermittent maintenance.
- **Graceful Degradation:** If upstream state maps are temporarily offline, the system continues serving cached vector boundaries and offline-reconciled titles.
