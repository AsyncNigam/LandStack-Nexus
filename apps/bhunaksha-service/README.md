# Odisha Bhunaksha Cadastral Map Scraper & Multi-Sheet Stitcher

An end-to-end Python pipeline and web application for reverse-engineering, crawling, mathematically stitching, and inspecting cadastral land records and village maps from the Odisha Bhunaksha portal (pp3bhunakshaodisha.nic.in:8443).

---

## Key Features

1. **Dynamic Administrative Hierarchy Discovery**
   - Traverses District -> Tehsil -> Revenue Inspector (RI) Circle -> Village -> Sheets directly via the government NIC REST API.
2. **Mathematical Multi-Sheet Map Stitching**
   - Overcomes the single-sheet limitation of the government portal.
   - Computes the union bounding box across all village sheets.
   - Accurately aligns and composites raster sheets onto a single unified high-resolution PNG using local survey coordinates and Y-axis inversion.
3. **Automated Plot Attribute Extraction (Grid Sampling)**
   - Samples spatial coordinates across each sheet extent.
   - Extracts Plot Number, Khata Number, Land Classification, Area in Acres, and direct Record of Rights (RoR) front/back document links from the Odisha Bhulekh portal (hulekh.ori.nic.in).
   - Implements bounding-box skipping optimization to minimize server hits by 85–95%.
4. **Local SQLite Persistence & Caching**
   - Stores all scraped village extents and plot records in hunaksha_cache.db with indexed spatial queries for sub-millisecond lookups.
5. **Interactive Standalone Leaflet Viewer & FastAPI Server**
   - Automatically generates standalone offline HTML viewers (out/*_viewer.html) with pan/zoom and plot inspection overlays.
   - Includes a full-featured FastAPI web application (server.py) with cascading dropdowns, interactive click-to-identify plot hit-testing, and background batch-stitching for entire RI circles.

---

## Project Structure

`
bhunaksha_scrapper/
├── bhunaksha_pipeline.py     # Core pipeline: hierarchy discovery, WMS fetcher, stitcher, scraper, CLI
├── server.py                 # FastAPI backend server with REST API and background batch jobs
├── bhunaksha_scraper.py      # Standalone prototype / reference implementation
├── bhunaksha_cache.db        # SQLite database storing cached villages and plot records
├── requirements.txt          # Python package dependencies
├── AI_CONTEXT.md             # Deep technical context and architectural guide for AI agents
├── README.md                 # Project documentation and quickstart guide
├── .cursorrules              # AI coding agent rules and operational constraints
├── static/                   # Frontend assets for the web application
│   ├── index.html            # Web interface with dual-panel layout and map HUD
│   ├── app.css               # Styling for sidebar, HUD, and plot details card
│   └── app.js                # Frontend state, Leaflet L.CRS.Simple map, and API handlers
└── out/                      # Generated artifacts
    ├── *_stitched.png        # Stitched high-resolution village raster maps
    ├── *_meta.json           # Village bounding box and sheet extent metadata
    ├── *_viewer.html         # Self-contained offline interactive Leaflet map viewers
    └── sheets/               # Raw downloaded individual sheet rasters
`

---

## Quick Start

### 1. Installation

Ensure Python 3.10+ is installed, then install the required dependencies:

`ash
pip install -r requirements.txt
`

### 2. Command-Line Interface (CLI)

The hunaksha_pipeline.py script provides full command-line control:

#### Explore Administrative Hierarchy
`ash
# List all districts
python bhunaksha_pipeline.py --list-districts

# List tehsils in District 28 (Boudh)
python bhunaksha_pipeline.py --list-tehsils 28

# List RIs in District 28, Tehsil 2 (Kantamal)
python bhunaksha_pipeline.py --list-ris 28 2

# List villages in District 28, Tehsil 2, RI 2
python bhunaksha_pipeline.py --list-villages 28 2 2
`

#### Fetch & Stitch a Village
`ash
# Stitch all sheets for Village 81 (District 28, Tehsil 2, RI 2) without plot scraping:
python bhunaksha_pipeline.py --village 28 2 2 81 --no-plots

# End-to-end: Stitch sheets AND grid-sample all plots:
python bhunaksha_pipeline.py --village 28 2 2 81 --step 25.0
`

### 3. Launch the Web Application

To run the interactive web interface and REST API:

`ash
python server.py
`

Open your browser and navigate to:
`
http://localhost:8000
`

From the web UI, you can:
- Select District -> Tehsil -> RI -> Village from cascading dropdowns.
- Click **Stitch Village Map** to dynamically fetch, stitch, and display the map.
- Click **Stitch Entire RI** to queue a background job that stitches all villages in that RI circle with live progress tracking.
- Click anywhere on the map to inspect plot numbers, area, land classification, and open Bhulekh RoR links.

---

## Database Queries

The scraped data is saved to hunaksha_cache.db. You can query it using sqlite3 or any database tool:

`sql
-- View scraped plots for a specific village
SELECT plot_no, khata_no, info, ror_front 
FROM plots 
WHERE gis_code LIKE '280202081%' 
LIMIT 20;

-- Count total cached plots
SELECT COUNT(*) FROM plots;
`

---

## Reverse Engineering Notes & Ethics

- **Coordinate System**: Bounding boxes returned by the portal (xmin, ymin, xmax, ymax) are in **local cadastral survey units**, NOT real-world GPS coordinates (EPSG:4326) or Web Mercator (EPSG:3857). The CRS=EPSG:3857 query parameter sent to WMS is decorative.
- **Ethics & Throttling**: The pipeline includes polite headers and request throttling. When running large batch extractions, ensure moderate step intervals and reasonable sleep delays to avoid placing excessive load on government servers.
