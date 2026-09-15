-- ═══════════════════════════════════════════════════════════════════
-- LandStack Nexus — Core Schema
-- PostgreSQL 16 + PostGIS 3.4
-- ═══════════════════════════════════════════════════════════════════

-- Enable PostGIS extension (idempotent)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── 1. Parcels ─────────────────────────────────────────────────────
-- Central land-parcel registry keyed by the 14-char ULPIN.

CREATE TABLE IF NOT EXISTS parcels (
  ulpin          VARCHAR(14)  PRIMARY KEY,
  source_state   VARCHAR(50)  NOT NULL,
  geom           GEOMETRY(Polygon, 4326),
  area_sqm       NUMERIC(12, 2),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Spatial index for geospatial queries (containment, intersection, etc.)
CREATE INDEX IF NOT EXISTS idx_parcels_geom
  ON parcels USING GIST (geom);

-- ─── 2. RoR (Record of Rights) from Revenue Dept ───────────────────

CREATE TABLE IF NOT EXISTS ror_records (
  id             SERIAL       PRIMARY KEY,
  ulpin          VARCHAR(14)  NOT NULL REFERENCES parcels(ulpin) ON DELETE CASCADE,
  owner_name     VARCHAR(200) NOT NULL,
  area_acre      NUMERIC(10, 4),
  khata_no       VARCHAR(50),
  plot_no        VARCHAR(50),
  last_updated   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  source_dept    VARCHAR(50)  NOT NULL DEFAULT 'Revenue'
);

-- ─── 3. Registration Records from Sub-Registrar ────────────────────

CREATE TABLE IF NOT EXISTS registration_records (
  id             SERIAL       PRIMARY KEY,
  ulpin          VARCHAR(14)  NOT NULL REFERENCES parcels(ulpin) ON DELETE CASCADE,
  owner_name     VARCHAR(200) NOT NULL,
  area_acre      NUMERIC(10, 4),
  deed_no        VARCHAR(100),
  registered_on  DATE,
  source_dept    VARCHAR(50)  NOT NULL DEFAULT 'Sub-Registrar'
);

-- ─── 4. Tax Records from Municipality ──────────────────────────────

CREATE TABLE IF NOT EXISTS tax_records (
  id             SERIAL       PRIMARY KEY,
  ulpin          VARCHAR(14)  NOT NULL REFERENCES parcels(ulpin) ON DELETE CASCADE,
  owner_name     VARCHAR(200) NOT NULL,
  tax_due        NUMERIC(12, 2),
  last_paid_on   DATE,
  source_dept    VARCHAR(50)  NOT NULL DEFAULT 'Municipality'
);

-- ─── 5. Conflicts ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conflicts (
  id                SERIAL       PRIMARY KEY,
  ulpin             VARCHAR(14)  NOT NULL REFERENCES parcels(ulpin) ON DELETE CASCADE,
  conflict_type     VARCHAR(100) NOT NULL,
  field_values      JSONB        NOT NULL DEFAULT '{}',
  source_timestamps JSONB        NOT NULL DEFAULT '{}',
  severity          VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
  status            VARCHAR(20)  NOT NULL DEFAULT 'UNRESOLVED',
  detected_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ
);

-- ─── 6. Audit Logs ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id             SERIAL       PRIMARY KEY,
  conflict_id    INTEGER      NOT NULL REFERENCES conflicts(id) ON DELETE CASCADE,
  action_by      VARCHAR(100) NOT NULL,
  action_type    VARCHAR(50)  NOT NULL,
  old_state      JSONB,
  new_state      JSONB,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
