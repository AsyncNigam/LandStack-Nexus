"""
Bhunaksha Odisha End-to-End Pipeline
====================================
1. Discovers hierarchy (Districts -> Tehsils -> RIs -> Villages -> Sheets) dynamically via NIC API.
2. Fetches per-sheet bounding extents via POST getVVVVExtentGeoref.
3. Downloads high-resolution WMS raster maps matching the exact aspect ratio.
4. Mathematically stitches multi-sheet villages into one seamless, unified village map canvas.
5. Grid-samples plot attributes (Plot No, Khata No, Land Classification, Area, RoR links).
6. Persists data to SQLite cache (bhunaksha_cache.db) and GeoJSON.
7. Generates an interactive, standalone HTML Leaflet viewer for instant visual inspection and clicking.
"""

import sys
import os
import time
import re
import json
import sqlite3
import argparse
from typing import Dict, List, Tuple, Optional, Any
import requests
from PIL import Image
import io

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "bhunaksha_cache.db")
OUTPUT_DIR = os.path.join(BASE_DIR, "out")

from bhunaksha_scraper import STATE_CONFIG

# Official District-to-Server routing across the Odisha Bhunaksha NIC cluster
DISTRICT_CLUSTER_MAP: Dict[str, str] = {
    "1": "https://app1bhunakshaodisha.nic.in/bhunaksha",     # Balasore
    "2": "https://app1bhunakshaodisha.nic.in:8443/bhunaksha",# Balangir
    "3": "https://app4bhunakshaodisha.nic.in:8443/bhunaksha",# Cuttack
    "4": "https://bhunakshaodisha.nic.in:8443/bhunaksha",    # Dhenkanal
    "5": "https://app3bhunakshaodisha.nic.in:8443/bhunaksha",# Ganjam
    "6": "https://bhunakshaodisha.nic.in/bhunaksha",         # Kalahandi
    "7": "https://bhunakshaodisha.nic.in:8443/bhunaksha",    # Kendujhar
    "8": "https://app1bhunakshaodisha.nic.in/bhunaksha",     # Koraput
    "9": "https://app1bhunakshaodisha.nic.in:8443/bhunaksha",# Mayurbhanj
    "10": "https://app1bhunakshaodisha.nic.in/bhunaksha",    # Kandhamal
    "11": "https://app2bhunakshaodisha.nic.in/bhunaksha",    # Puri
    "12": "https://app2bhunakshaodisha.nic.in:8443/bhunaksha",# Sambalpur
    "13": "https://bhunakshaodisha.nic.in/bhunaksha",        # Sundargarh
    "14": "https://bhunakshaodisha.nic.in:8443/bhunaksha",   # Angul
    "15": "https://app2bhunakshaodisha.nic.in:8443/bhunaksha",# Bargarh
    "16": "https://app1bhunakshaodisha.nic.in/bhunaksha",    # Bhadrak
    "17": "https://app4bhunakshaodisha.nic.in:8443/bhunaksha",# Jagatsinghpur
    "18": "https://app4bhunakshaodisha.nic.in:8443/bhunaksha",# Jajpur
    "19": "https://bhunakshaodisha.nic.in:8443/bhunaksha",   # Kendrapara
    "20": "https://app3bhunakshaodisha.nic.in/bhunaksha",    # Khordha
    "21": "https://bhunakshaodisha.nic.in/bhunaksha",        # Nuapada
    "22": "https://app2bhunakshaodisha.nic.in/bhunaksha",    # Nayagarh
    "23": "https://app3bhunakshaodisha.nic.in/bhunaksha",    # Sonepur
    "24": "https://app3bhunakshaodisha.nic.in:8443/bhunaksha",# Gajapati
    "25": "https://app1bhunakshaodisha.nic.in:8443/bhunaksha",# Malkangiri
    "26": "https://app3bhunakshaodisha.nic.in/bhunaksha",    # Nabarangpur
    "27": "https://app2bhunakshaodisha.nic.in/bhunaksha",    # Rayagada
    "28": "https://app3bhunakshaodisha.nic.in:8443/bhunaksha",# Boudh
    "29": "https://app4bhunakshaodisha.nic.in:8443/bhunaksha",# Deogarh
    "30": "https://app2bhunakshaodisha.nic.in:8443/bhunaksha",# Jharsuguda
}

ALL_CLUSTER_SERVERS: List[str] = [
    "https://app3bhunakshaodisha.nic.in:8443/bhunaksha",
    "https://app4bhunakshaodisha.nic.in:8443/bhunaksha",
    "https://app2bhunakshaodisha.nic.in:8443/bhunaksha",
    "https://app1bhunakshaodisha.nic.in:8443/bhunaksha",
    "https://bhunakshaodisha.nic.in:8443/bhunaksha",
    "https://app1bhunakshaodisha.nic.in/bhunaksha",
    "https://app2bhunakshaodisha.nic.in/bhunaksha",
    "https://app3bhunakshaodisha.nic.in/bhunaksha",
    "https://bhunakshaodisha.nic.in/bhunaksha",
]

def get_cluster_url(state_id: str, dist: str) -> str:
    """Return the authoritative server for a given state and district code."""
    config = STATE_CONFIG.get(state_id, STATE_CONFIG["OD"])
    if state_id == "OD":
        return DISTRICT_CLUSTER_MAP.get(str(dist).strip(), config["base"])
    return config["base"]

_ROR_RE = re.compile(
    r"ViewRoR\.aspx\?DistCode=(\d+)&TehCode=(\d+)&VillCode=(\d+)&KhataNo=(\d+)&type=(front|back)"
)

# Shared requests session with proper browser headers
session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
})
session.verify = False


# ---------------------------------------------------------------------------
# 1. Database Initialization
# ---------------------------------------------------------------------------
def init_db(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS villages (
                gis_code TEXT PRIMARY KEY,
                dist TEXT, tehsil TEXT, ri TEXT, village TEXT, sheet TEXT,
                xmin REAL, ymin REAL, xmax REAL, ymax REAL,
                png_path TEXT,
                scraped_at TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS plots (
                id TEXT PRIMARY KEY,
                gis_code TEXT,
                plot_no TEXT,
                khata_no TEXT,
                ror_front TEXT,
                ror_back TEXT,
                info TEXT,
                xmin REAL, ymin REAL, xmax REAL, ymax REAL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS hierarchy_cache (
                level INTEGER,
                codes TEXT,
                json_data TEXT,
                updated_at TEXT,
                PRIMARY KEY(level, codes)
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_plots_gis ON plots(gis_code)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_plots_plotno ON plots(gis_code, plot_no)")
    return conn


# ---------------------------------------------------------------------------
# 2. Hierarchy Discovery APIs
# ---------------------------------------------------------------------------
def fetch_levels(state_id: str, level: int, codes: str = "") -> List[Dict[str, Any]]:
    """
    Query the NIC ListsAfterLevel endpoint dynamically across the cluster.
    level 0: Districts (codes="")
    level 1: Tehsils (codes="dist,")
    level 2: RIs (codes="dist,tehsil,")
    level 3: Villages (codes="dist,tehsil,ri,")
    level 4: Sheets (codes="dist,tehsil,ri,village,")
    """
    clean_codes = codes.strip()
    parts = [p for p in clean_codes.split(",") if p]
    dist = parts[0] if parts else "28"

    # 1. Check local persistent SQLite cache
    try:
        conn = init_db()
        row = conn.execute(
            "SELECT json_data FROM hierarchy_cache WHERE level = ? AND codes = ?",
            (level, clean_codes)
        ).fetchone()
        conn.close()
        if row and row[0]:
            cached_list = json.loads(row[0])
            if isinstance(cached_list, list) and len(cached_list) > 0:
                return cached_list
    except Exception as e:
        print(f"[-] Cache check failed: {e}")

    # 2. Query cluster servers starting with the district's dedicated host
    primary_server = get_cluster_url(state_id, dist)
    
    if state_id == "OD":
        servers_to_try = [primary_server] + [s for s in ALL_CLUSTER_SERVERS if s != primary_server]
    else:
        servers_to_try = [primary_server]

    config = STATE_CONFIG.get(state_id, STATE_CONFIG["OD"])

    for base_url in servers_to_try:
        url = f"{base_url}/rest/Levels/ListsAfterLevel"
        payload = {
            "state": config["code"],
            "level": str(level),
            "codes": clean_codes
        }
        try:
            r = session.post(url, data=payload, timeout=6)
            if r.status_code == 200:
                data = r.json()
                if isinstance(data, list) and len(data) > 0 and isinstance(data[0], list) and len(data[0]) > 0:
                    result = data[0]
                    # Cache successful result
                    try:
                        c_conn = init_db()
                        with c_conn:
                            c_conn.execute(
                                "INSERT OR REPLACE INTO hierarchy_cache (level, codes, json_data, updated_at) VALUES (?, ?, ?, datetime('now'))",
                                (level, clean_codes, json.dumps(result, ensure_ascii=False))
                            )
                        c_conn.close()
                    except Exception:
                        pass
                    return result
        except Exception:
            continue

    return []


# Official 30 Odisha Districts as per Bhunaksha Government Portal
ALL_ODISHA_DISTRICTS = [
    {"code": "1", "name": "ବାଲେଶ୍ବର"},
    {"code": "2", "name": "ବଲାଙ୍ଗିର"},
    {"code": "3", "name": "କଟକ"},
    {"code": "4", "name": "ଢେଙ୍କାନାଳ"},
    {"code": "5", "name": "ଗଞ୍ଜାମ"},
    {"code": "6", "name": "କଳାହାଣ୍ଡି"},
    {"code": "7", "name": "କେନ୍ଦୁଝର"},
    {"code": "8", "name": "କୋରାପୁଟ"},
    {"code": "9", "name": "ମୟୂରଭଞ୍ଜ"},
    {"code": "10", "name": "କନ୍ଧମାଳ"},
    {"code": "11", "name": "ପୁରୀ"},
    {"code": "12", "name": "ସମ୍ବଲପୁର"},
    {"code": "13", "name": "ସୁନ୍ଦରଗଡ଼"},
    {"code": "14", "name": "ଅନୁଗୋଳ."},
    {"code": "15", "name": "ବରଗଡ଼"},
    {"code": "16", "name": "ଭଦ୍ରକ"},
    {"code": "17", "name": "ଜଗତସିଂହପୁର"},
    {"code": "18", "name": "ଯାଜପୁର"},
    {"code": "19", "name": "କେନ୍ଦ୍ରାପଡ଼ା"},
    {"code": "20", "name": "ଖୋର୍ଦ୍ଧା"},
    {"code": "21", "name": "ନୂଆପଡ଼ା"},
    {"code": "22", "name": "ନୟାଗଡ଼"},
    {"code": "23", "name": "ସୋନପୁର"},
    {"code": "24", "name": "ଗଜପତି"},
    {"code": "25", "name": "ମାଲକାନଗିରି"},
    {"code": "26", "name": "ନବରଙ୍ଗପୁର"},
    {"code": "27", "name": "ରାୟଗଡ଼ା"},
    {"code": "28", "name": "ବୌଦ୍ଧ"},
    {"code": "29", "name": "ଦେବଗଡ଼"},
    {"code": "30", "name": "ଝାରସୁଗୁଡ଼ା"},
]


def get_districts(state_id: str) -> List[Dict[str, str]]:
    if state_id == "OD":
        return ALL_ODISHA_DISTRICTS
    raw = fetch_levels(state_id, 0, "")
    return [{"code": item["code"], "name": item["value"]} for item in raw]


def get_tehsils(state_id: str, dist: str) -> List[Dict[str, str]]:
    raw = fetch_levels(state_id, 1, f"{dist},")
    return [{"code": item["code"], "name": item["value"]} for item in raw]


def get_ris(state_id: str, dist: str, tehsil: str) -> List[Dict[str, str]]:
    raw = fetch_levels(state_id, 2, f"{dist},{tehsil},")
    return [{"code": item["code"], "name": item["value"]} for item in raw]


def get_villages(state_id: str, dist: str, tehsil: str, ri: str) -> List[Dict[str, str]]:
    raw = fetch_levels(state_id, 3, f"{dist},{tehsil},{ri},")
    return [{"code": item["code"], "name": item["value"]} for item in raw]


def get_sheets(state_id: str, dist: str, tehsil: str, ri: str, village: str) -> List[str]:
    raw = fetch_levels(state_id, 4, f"{dist},{tehsil},{ri},{village},")
    sheets = [item["code"] for item in raw if item.get("code")]
    if not sheets:
        sheets = ["01"]  # Default fallback
    return sheets


# ---------------------------------------------------------------------------
# 3. Sheet Extent & WMS Map Retrieval
# ---------------------------------------------------------------------------
def get_sheet_extent(state_id: str, dist: str, tehsil: str, ri: str, village: str, sheet: str) -> Optional[Dict[str, Any]]:
    """Fetch the local coordinate bounding box for one village sheet via POST."""
    config = STATE_CONFIG.get(state_id, STATE_CONFIG["OD"])
    levels = f"{dist},{tehsil},{ri},{village},{sheet},"
    base_url = get_cluster_url(state_id, dist)
    url = f"{base_url}/rest/MapInfo/getVVVVExtentGeoref"
    payload = {"state": config["code"], "gisLevels": levels, "srs": "0"}
    for attempt in range(3):
        try:
            r = session.post(url, data=payload, timeout=25)
            r.raise_for_status()
            data = r.json()
            # Ensure required keys exist
            if "xmin" in data and "xmax" in data and "ymin" in data and "ymax" in data:
                return data
        except Exception as e:
            if attempt == 2:
                print(f"[!] Failed to get extent for sheet {sheet}: {e}")
                return None
            time.sleep(1.0)
    return None


def get_sheet_map_png(state_id: str, dist: str, gis_code: str, extent: Dict[str, Any], pixels_per_unit: float = 5.0) -> Tuple[bytes, int, int]:
    """Download the raster village sheet PNG sized to match the real aspect ratio."""
    config = STATE_CONFIG.get(state_id, STATE_CONFIG["OD"])
    width = max(1, round((extent["xmax"] - extent["xmin"]) * pixels_per_unit))
    height = max(1, round((extent["ymax"] - extent["ymin"]) * pixels_per_unit))
    bbox = f"{extent['xmin']},{extent['ymin']},{extent['xmax']},{extent['ymax']}"
    
    base_url = get_cluster_url(state_id, dist)
    url = f"{base_url}/WMS"
    params = {
        "SERVICE": "WMS",
        "VERSION": "1.3.0",
        "REQUEST": "GetMap",
        "FORMAT": "image/png",
        "TRANSPARENT": "true",
        "LAYERS": "VILLAGE_MAP",
        "STYLES": "VILLAGE_MAP",
        "state": config["code"],
        "gis_code": gis_code,
        "CRS": "EPSG:3857",
        "WIDTH": str(width),
        "HEIGHT": str(height),
        "BBOX": bbox,
    }
    r = session.get(url, params=params, timeout=40)
    r.raise_for_status()
    return r.content, width, height


# ---------------------------------------------------------------------------
# 4. Multi-Sheet Stitching Engine
# ---------------------------------------------------------------------------
def stitch_village_sheets(
    state_id: str, dist: str, tehsil: str, ri: str, village: str, sheets: List[str],
    pixels_per_unit: float = 5.0, out_dir: str = OUTPUT_DIR
) -> Tuple[str, Dict[str, float], Dict[str, Dict[str, Any]]]:
    """
    Fetch all sheets for a village, align them on a shared coordinate canvas,
    and save the combined high-resolution village map PNG.
    """
    os.makedirs(out_dir, exist_ok=True)
    extents = {}
    tiles = {}

    print(f"[*] Processing {len(sheets)} sheet(s) for Village {village} (Sheets: {', '.join(sheets)})...")
    for sheet in sheets:
        ext = get_sheet_extent(state_id, dist, tehsil, ri, village, sheet)
        if not ext:
            print(f"[-] Warning: Extent not found for sheet {sheet}, skipping.")
            continue
        extents[sheet] = ext
        gis_code = ext.get("gisCode", f"{dist}{tehsil}{ri}{village}{sheet}")
        png_bytes, w, h = get_sheet_map_png(state_id, dist, gis_code, ext, pixels_per_unit)
        tiles[sheet] = (png_bytes, w, h)
        print(f"    - Sheet {sheet}: {w}x{h} px, BBOX=({ext['xmin']:.1f}, {ext['ymin']:.1f}) -> ({ext['xmax']:.1f}, {ext['ymax']:.1f})")

    if not extents:
        raise ValueError(f"No valid sheets could be fetched for village {village}")

    union_xmin = min(e["xmin"] for e in extents.values())
    union_xmax = max(e["xmax"] for e in extents.values())
    union_ymin = min(e["ymin"] for e in extents.values())
    union_ymax = max(e["ymax"] for e in extents.values())

    canvas_w = round((union_xmax - union_xmin) * pixels_per_unit)
    canvas_h = round((union_ymax - union_ymin) * pixels_per_unit)
    print(f"[*] Creating unified canvas: {canvas_w}x{canvas_h} px (PPU={pixels_per_unit})...")
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 0))

    for sheet, ext in extents.items():
        png_bytes, w, h = tiles[sheet]
        tile_img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
        offset_x = round((ext["xmin"] - union_xmin) * pixels_per_unit)
        offset_y = round((union_ymax - ext["ymax"]) * pixels_per_unit)
        canvas.paste(tile_img, (offset_x, offset_y), tile_img)

    village_gis = f"{dist}_{tehsil}_{ri}_{village}"
    out_img_path = os.path.join(out_dir, f"{village_gis}_stitched.png")
    canvas.save(out_img_path, "PNG")
    print(f"[+] Saved stitched village map: {out_img_path}")

    union_extent = {
        "xmin": union_xmin, "ymin": union_ymin,
        "xmax": union_xmax, "ymax": union_ymax,
        "canvas_width": canvas_w, "canvas_height": canvas_h,
        "pixels_per_unit": pixels_per_unit
    }

    # Save metadata JSON
    meta_path = os.path.join(out_dir, f"{village_gis}_meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump({
            "village_gis": village_gis,
            "dist": dist, "tehsil": tehsil, "ri": ri, "village": village,
            "sheets": sheets,
            "union_extent": union_extent,
            "sheet_extents": extents
        }, f, indent=2, ensure_ascii=False)

    return out_img_path, union_extent, extents


def fetch_single_sheet_map(
    state_id: str, dist: str, tehsil: str, ri: str, village: str, sheet: str,
    pixels_per_unit: float = 4.0, out_dir: str = OUTPUT_DIR
) -> Tuple[str, Dict[str, Any], Dict[str, Any]]:
    """
    Fetch a single sheet map for a village without stitching/combining.
    Saves the standalone sheet PNG and metadata.
    """
    os.makedirs(out_dir, exist_ok=True)
    ext = get_sheet_extent(state_id, dist, tehsil, ri, village, sheet)
    if not ext:
        raise ValueError(f"Could not retrieve extent for District {dist}, Tehsil {tehsil}, Village {village}, Sheet {sheet}")

    gis_code = ext.get("gisCode", f"{dist}{tehsil}{ri}{village}{sheet}")
    png_bytes, w, h = get_sheet_map_png(state_id, dist, gis_code, ext, pixels_per_unit)

    sheet_gis = f"{dist}_{tehsil}_{ri}_{village}_{sheet}"
    out_img_path = os.path.join(out_dir, f"{sheet_gis}.png")
    with open(out_img_path, "wb") as f:
        f.write(png_bytes)

    sheet_extent = {
        "xmin": ext["xmin"],
        "ymin": ext["ymin"],
        "xmax": ext["xmax"],
        "ymax": ext["ymax"],
        "width": ext["xmax"] - ext["xmin"],
        "height": ext["ymax"] - ext["ymin"],
        "canvas_width": w,
        "canvas_height": h,
        "pixels_per_unit": pixels_per_unit,
        "gis_code": gis_code,
        "sheet": sheet,
    }

    meta_path = os.path.join(out_dir, f"{sheet_gis}_meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump({
            "sheet_gis": sheet_gis,
            "dist": dist,
            "tehsil": tehsil,
            "ri": ri,
            "village": village,
            "sheet": sheet,
            "union_extent": sheet_extent,
            "sheet_extent": sheet_extent,
        }, f, indent=2, ensure_ascii=False)

    print(f"[+] Saved standalone sheet map: {out_img_path} ({w}x{h} px)")
    return out_img_path, sheet_extent, {sheet: ext}


# ---------------------------------------------------------------------------
# 5. Plot Scraping & Info Parsing
# ---------------------------------------------------------------------------
def extract_khata_and_ror_links(plot_info_links_html: str) -> Optional[Dict[str, str]]:
    matches = _ROR_RE.findall(plot_info_links_html or "")
    if not matches:
        return None
    d, t, v, khata, _ = matches[0]
    return {
        "khata_no": khata,
        "ror_front": f"http://bhulekh.ori.nic.in/ViewRoR.aspx?DistCode={d}&TehCode={t}&VillCode={v}&KhataNo={khata}&type=front",
        "ror_back": f"http://bhulekh.ori.nic.in/ViewRoR.aspx?DistCode={d}&TehCode={t}&VillCode={v}&KhataNo={khata}&type=back",
    }


def parse_plot_info(info_html: str) -> Dict[str, Any]:
    """Extract land classification and area from the HTML snippet."""
    res = {"land_class": None, "area_acres": None}
    if not info_html:
        return res
    m_class = re.search(r"Land Class[^:]*:</b>([^<]+)", info_html)
    if m_class:
        res["land_class"] = m_class.group(1).strip()
    m_area = re.search(r"Area[^:]*:</b>([\d\.]+)", info_html)
    if m_area:
        try:
            res["area_acres"] = float(m_area.group(1).strip())
        except ValueError:
            pass
    return res


def get_plot_at_xy(dist: str, tehsil: str, ri: str, village: str, sheet: str, x: float, y: float) -> Optional[Dict[str, Any]]:
    levels = f"{dist},{tehsil},{ri},{village},{sheet},"
    url = f"{BASE_URL}/ScalarDatahandler"
    params = {"OP": "4", "state": STATE_CODE, "levels": levels, "x": str(x), "y": str(y)}
    try:
        r = session.get(url, params=params, timeout=15)
        if r.status_code != 200 or not r.text.strip():
            return None
        data = r.json()
        if data and "plotNo" in data and "ID" in data:
            return data
    except Exception:
        pass
    return None


def scrape_sheet_plots(
    dist: str, tehsil: str, ri: str, village: str, sheet: str,
    extent: Dict[str, Any], grid_step: float = 20.0, max_plots: Optional[int] = None
) -> Dict[str, Dict[str, Any]]:
    """Grid sample a single sheet to find plots."""
    plots = {}
    found_bboxes = []

    def already_covered(px, py):
        return any(bx0 <= px <= bx1 and by0 <= py <= by1 for bx0, by0, bx1, by1 in found_bboxes)

    x = extent["xmin"]
    while x <= extent["xmax"]:
        y = extent["ymin"]
        while y <= extent["ymax"]:
            if already_covered(x, y):
                y += grid_step
                continue

            info = get_plot_at_xy(dist, tehsil, ri, village, sheet, x, y)
            if info and "ID" in info:
                pid = info["ID"]
                if pid not in plots:
                    ror = extract_khata_and_ror_links(info.get("plotInfoLinks", ""))
                    if ror:
                        info["khata_ror"] = ror
                    parsed = parse_plot_info(info.get("info", ""))
                    info["parsed_info"] = parsed
                    plots[pid] = info
                    print(f"      [+] Found Plot {info.get('plotNo')}: Khata {ror.get('khata_no') if ror else 'N/A'}, Class: {parsed.get('land_class')}")
                    if max_plots and len(plots) >= max_plots:
                        return plots

                found_bboxes.append((info["xmin"], info["ymin"], info["xmax"], info["ymax"]))
            y += grid_step
            time.sleep(0.04)  # Respect server load
        x += grid_step
    return plots


# ---------------------------------------------------------------------------
# 6. Interactive HTML Viewer Generation
# ---------------------------------------------------------------------------
def generate_interactive_viewer(
    village_gis: str, img_filename: str, union_extent: Dict[str, float],
    plots: List[Dict[str, Any]], out_dir: str = OUTPUT_DIR
) -> str:
    """Generate a self-contained Leaflet HTML viewer with clickable plots."""
    w = union_extent["canvas_width"]
    h = union_extent["canvas_height"]
    ppu = union_extent["pixels_per_unit"]
    uxmin = union_extent["xmin"]
    uymax = union_extent["ymax"]

    # Transform plot coordinates to canvas pixel coordinates
    features = []
    for p in plots:
        pxmin = round((p["xmin"] - uxmin) * ppu)
        pxmax = round((p["xmax"] - uxmin) * ppu)
        pymin = round((uymax - p["ymax"]) * ppu)
        pymax = round((uymax - p["ymin"]) * ppu)
        features.append({
            "plot_no": p.get("plot_no") or p.get("plotNo"),
            "khata_no": p.get("khata_no"),
            "land_class": p.get("land_class"),
            "area_acres": p.get("area_acres"),
            "ror_front": p.get("ror_front"),
            "ror_back": p.get("ror_back"),
            "bbox_px": [pxmin, pymin, pxmax, pymax],
            "center_px": [(pxmin + pxmax) / 2, (pymin + pymax) / 2]
        })

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Odisha Bhunaksha - Stitched Village Map ({village_gis})</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html {{ margin: 0; padding: 0; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; }}
    #header {{ position: absolute; top: 12px; left: 60px; z-index: 1000; background: rgba(15, 23, 42, 0.9); padding: 10px 18px; border-radius: 8px; border: 1px solid #334155; }}
    #header h1 {{ margin: 0; font-size: 16px; font-weight: 600; color: #38bdf8; }}
    #header p {{ margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }}
    #map {{ width: 100%; height: 100%; background: #1e293b; }}
    .leaflet-popup-content {{ font-family: inherit; font-size: 13px; line-height: 1.5; color: #0f172a; }}
    .btn {{ display: inline-block; padding: 4px 10px; margin-top: 6px; margin-right: 4px; font-size: 11px; font-weight: 500; text-decoration: none; border-radius: 4px; background: #0284c7; color: white; }}
    .btn:hover {{ background: #0369a1; }}
  </style>
</head>
<body>
  <div id="header">
    <h1>Odisha Village Cadastral Map: {village_gis}</h1>
    <p>Stitched Resolution: {w} × {h} px | Plots Extracted: {len(features)}</p>
  </div>
  <div id="map"></div>
  <script>
    var w = {w};
    var h = {h};
    var map = L.map('map', {{
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 2
    }});

    var bounds = [[0, 0], [h, w]];
    var image = L.imageOverlay('{img_filename}', bounds).addTo(map);
    map.fitBounds(bounds);

    var plotsData = {json.dumps(features)};

    plotsData.forEach(function(p) {{
      var b = p.bbox_px;
      // Leaflet CRS.Simple: [y, x] where y is inverted from top
      var rectBounds = [[h - b[3], b[0]], [h - b[1], b[2]]];
      var rect = L.rectangle(rectBounds, {{
        color: "#38bdf8",
        weight: 1.5,
        fillColor: "#0284c7",
        fillOpacity: 0.15
      }}).addTo(map);

      var popupHtml = '<b>Plot No:</b> ' + (p.plot_no || 'N/A') + '<br>' +
                      '<b>Khata No:</b> ' + (p.khata_no || 'N/A') + '<br>' +
                      '<b>Classification:</b> ' + (p.land_class || 'N/A') + '<br>' +
                      '<b>Area:</b> ' + (p.area_acres ? p.area_acres + ' Acres' : 'N/A') + '<br>';
      if (p.ror_front) {{
        popupHtml += '<a class="btn" target="_blank" href="' + p.ror_front + '">RoR Front</a>';
      }}
      if (p.ror_back) {{
        popupHtml += '<a class="btn" target="_blank" href="' + p.ror_back + '">RoR Back</a>';
      }}

      rect.bindPopup(popupHtml);
      rect.on('mouseover', function() {{ this.setStyle({{ fillOpacity: 0.4, color: '#f59e0b' }}); }});
      rect.on('mouseout', function() {{ this.setStyle({{ fillOpacity: 0.15, color: '#38bdf8' }}); }});
    }});
  </script>
</body>
</html>"""
    out_html = os.path.join(out_dir, f"{village_gis}_viewer.html")
    with open(out_html, "w", encoding="utf-8") as f:
        f.write(html_content)
    return out_html


# ---------------------------------------------------------------------------
# 7. Complete End-to-End Orchestrator
# ---------------------------------------------------------------------------
def process_village_end_to_end(
    dist: str, tehsil: str, ri: str, village: str,
    pixels_per_unit: float = 5.0, grid_step: float = 20.0,
    scrape_plots: bool = True, out_dir: str = OUTPUT_DIR
) -> Dict[str, Any]:
    """
    1. Discovers all sheets for the village automatically.
    2. Stitches sheets into a unified high-resolution map image.
    3. Grid-samples plots across sheets and stores them into SQLite.
    4. Generates an interactive web viewer.
    """
    village_gis = f"{dist}_{tehsil}_{ri}_{village}"
    print(f"\n=======================================================")
    print(f"🚀 Processing Village: {village_gis}")
    print(f"=======================================================")

    # 1. Discover sheets
    sheets = get_sheets(dist, tehsil, ri, village)
    print(f"[+] Auto-detected {len(sheets)} sheet(s): {sheets}")

    # 2. Stitch map sheets
    img_path, union_extent, extents = stitch_village_sheets(
        dist, tehsil, ri, village, sheets, pixels_per_unit=pixels_per_unit, out_dir=out_dir
    )

    all_plots = []
    conn = init_db()

    # If already cached in SQLite, retrieve existing plots
    village_gis_prefix = f"{dist}{tehsil}{ri}{village}"
    db_rows = conn.execute(
        "SELECT id, gis_code, plot_no, khata_no, ror_front, ror_back, info, xmin, ymin, xmax, ymax FROM plots WHERE gis_code LIKE ? OR gis_code LIKE ?",
        (f"{village_gis_prefix}%", f"{dist}{int(tehsil):02d}{int(ri):02d}{int(village):03d}%")
    ).fetchall()

    if db_rows and not scrape_plots:
        print(f"[+] Loaded {len(db_rows)} plot(s) from local cache database.")
        cols = ["id", "gis_code", "plot_no", "khata_no", "ror_front", "ror_back", "info", "xmin", "ymin", "xmax", "ymax"]
        for r in db_rows:
            d = dict(zip(cols, r))
            parsed = parse_plot_info(d.get("info", ""))
            d["land_class"] = parsed.get("land_class")
            d["area_acres"] = parsed.get("area_acres")
            all_plots.append(d)

    elif scrape_plots:
        print(f"[*] Extracting plots across {len(sheets)} sheet(s)...")
        for sheet in sheets:
            ext = extents.get(sheet)
            if not ext:
                continue
            print(f"  -> Sampling Sheet {sheet} (step={grid_step})...")
            sheet_plots = scrape_sheet_plots(dist, tehsil, ri, village, sheet, ext, grid_step=grid_step)
            gis_code = ext.get("gisCode", f"{dist}{tehsil}{ri}{village}{sheet}")

            # Save to SQLite
            with conn:
                for pid, p in sheet_plots.items():
                    ror = p.get("khata_ror", {})
                    conn.execute("""
                        INSERT OR REPLACE INTO plots 
                        (id, gis_code, plot_no, khata_no, ror_front, ror_back, info, xmin, ymin, xmax, ymax)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        pid, gis_code, p.get("plotNo"), ror.get("khata_no"),
                        ror.get("ror_front"), ror.get("ror_back"),
                        p.get("info"), p.get("xmin"), p.get("ymin"), p.get("xmax"), p.get("ymax")
                    ))
            all_plots.extend(sheet_plots.values())
    conn.close()

    # 3. Generate Interactive Leaflet Viewer
    img_basename = os.path.basename(img_path)
    viewer_path = generate_interactive_viewer(village_gis, img_basename, union_extent, all_plots, out_dir=out_dir)
    print(f"[+] Interactive viewer generated: {viewer_path}")

    return {
        "village_gis": village_gis,
        "sheets": sheets,
        "stitched_image": img_path,
        "viewer_html": viewer_path,
        "union_extent": union_extent,
        "plots_count": len(all_plots)
    }


# ---------------------------------------------------------------------------
# 8. Command Line Interface
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Odisha Bhunaksha End-to-End Scraper & Stitcher")
    parser.add_argument("--list-districts", action="store_true", help="List all districts")
    parser.add_argument("--list-tehsils", type=str, metavar="DIST", help="List tehsils for a district")
    parser.add_argument("--list-ris", nargs=2, metavar=("DIST", "TEHSIL"), help="List RIs for a tehsil")
    parser.add_argument("--list-villages", nargs=3, metavar=("DIST", "TEHSIL", "RI"), help="List villages for an RI")
    parser.add_argument("--village", nargs=4, metavar=("DIST", "TEHSIL", "RI", "VILLAGE"),
                        help="Fetch, stitch, and extract an entire village end-to-end")
    parser.add_argument("--no-plots", action="store_true", help="Skip plot scraping and only stitch the map")
    parser.add_argument("--step", type=float, default=25.0, help="Grid step size for plot sampling (default: 25)")

    args = parser.parse_args()

    if args.list_districts:
        dists = get_districts()
        print(f"\n--- Available Districts ({len(dists)}) ---")
        for d in dists:
            print(f"  Code: {d['code']:<4} Name: {d['name']}")
        return

    if args.list_tehsils:
        tehsils = get_tehsils(args.list_tehsils)
        print(f"\n--- Tehsils for District {args.list_tehsils} ({len(tehsils)}) ---")
        for t in tehsils:
            print(f"  Code: {t['code']:<4} Name: {t['name']}")
        return

    if args.list_ris:
        d, t = args.list_ris
        ris = get_ris(d, t)
        print(f"\n--- RIs for District {d}, Tehsil {t} ({len(ris)}) ---")
        for r in ris:
            print(f"  Code: {r['code']:<4} Name: {r['name']}")
        return

    if args.list_villages:
        d, t, r = args.list_villages
        villages = get_villages(d, t, r)
        print(f"\n--- Villages for District {d}, Tehsil {t}, RI {r} ({len(villages)}) ---")
        for v in villages:
            print(f"  Code: {v['code']:<6} Name: {v['name']}")
        return

    if args.village:
        d, t, r, v = args.village
        process_village_end_to_end(
            dist=d, tehsil=t, ri=r, village=v,
            scrape_plots=not args.no_plots,
            grid_step=args.step
        )
        return

    # Default test run: Boudh (28), Kantamal (2), Kantamal (2), Village 81
    print("No arguments provided. Running default demonstration for Kantamal (Village 81)...")
    process_village_end_to_end(
        dist="28", tehsil="2", ri="2", village="81",
        scrape_plots=False  # quick demonstration of auto-detection + stitching + viewer
    )


if __name__ == "__main__":
    main()
