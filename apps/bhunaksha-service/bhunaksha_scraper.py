"""
Bhunaksha Odisha scraper - grid-sample plot info + pull raster map per village.

Confirmed working (captured 2026-09) against app3bhunakshaodisha.nic.in:8443:

- ScalarDatahandler?OP=4&state=21&levels=<dist>,<tehsil>,<ri>,<village>,<sheet>,&x=<X>&y=<Y>
    -> click/hit-test. Returns JSON with plotNo, gisCode, info (land class + area),
    plotInfoLinks (ROR front/back page links) when (x,y) falls inside a plot.
    x/y are LOCAL sheet coordinates - NOT lat/lon, NOT real web-mercator meters,
    despite CRS=EPSG:3857 showing up elsewhere in this app (that tag is decorative /
    unreliable here - confirmed by comparing BBOX values against real EPSG:3857 scale).

- rest/MapInfo/getVVVVExtentGeoref?state=21&gisLevels=<dist>,<teh>,<ri>,<vill>,<sheet>,&srs=0
    -> returns {xmin,xmax,ymin,ymax,gisCode,attribution} = the local-coordinate
    bounding box for one village sheet. Use this to size your sampling grid.

- WMS?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=VILLAGE_MAP&STYLES=VILLAGE_MAP
    &state=21&gis_code=<giscode>&CRS=EPSG:3857&WIDTH=..&HEIGHT=..&BBOX=<xmin,ymin,xmax,ymax>
    -> raster PNG of the full village sheet, no plot highlighted. Reuse the SAME
    xmin/ymin/xmax/ymax from getVVVVExtentGeoref as BBOX to get the whole sheet.

Extra confirmed details from real hit responses:
- The xmin/xmax/ymin/ymax in a ScalarDatahandler hit response are that PLOT's own
  local bounding box (not the village's) - once a grid point lands inside a plot,
  every other grid point inside that returned bbox can be skipped without a request.
  scrape_village() below does this.
- response["ID"] (e.g. "ut-zBtJ0QOq0FJBca7ATbw") is the same opaque plot_id used to
  address WMS LAYERS=PLOT_LIST&plot_id=... calls - use ID as the stable per-plot key,
  plotNo is just a human-readable label that may repeat across sheets/villages.
- plotInfoLinks contains ROR Front/Back page hrefs of the form
  http://bhulekh.ori.nic.in/ViewRoR.aspx?DistCode=..&TehCode=..&VillCode=..&KhataNo=..&type=front|back
  - KhataNo here directly links this plot to its textual ownership record on the
  separate Bhulekh portal, no extra lookup needed. extract_khata_and_ror_links()
  below pulls these out.

NOT YET CONFIRMED / TODO before relying on this:
- rest/MapInfo/getPlotAtXY - a second hit-test endpoint seen in the network log but
  its exact query params + response shape haven't been captured yet. May be a cleaner
  alternative to ScalarDatahandler?OP=4 - worth checking both side by side.
- What a MISS looks like: we've only seen ScalarDatahandler responses for clicks that
  landed inside a plot. Click empty space / a gap between plots in the UI and check
  the response - has_data may become "N", or the response may come back empty/error.
  scrape_plot_at_xy() below guesses at this; confirm and adjust before a full run.
- gisCode format confirmed as DD-T-R-VVV-SS (e.g. 28,1,1,2,01 -> "28010100201" and
  28,2,2,81,01 -> "28020208101") - digit widths per segment may not be fixed-width
  across all districts/villages, double check on a village with 3-digit tehsil/RI if
  one exists.
- robots.txt on this domain disallows automated access - this script is unthrottled-
  friendly by default (small sleep) but you're responsible for being reasonable about
  request volume/timing.

No real georeferencing exists in this pipeline - every coordinate here is LOCAL to
that one village sheet. Don't assume consistency across villages; that has to be
solved downstream (village boundary shapefiles / manual control points per village).
"""

import requests
import time
import json
import os
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE = "https://app3bhunakshaodisha.nic.in:8443/bhunaksha"
STATE = "21"  # Odisha

_ROR_RE = re.compile(
    r"ViewRoR\.aspx\?DistCode=(\d+)&TehCode=(\d+)&VillCode=(\d+)&KhataNo=(\d+)&type=(front|back)"
)


def extract_khata_and_ror_links(plot_info_links_html):
    """Pull KhataNo + direct ROR front/back URLs out of a plotInfoLinks HTML blob."""
    matches = _ROR_RE.findall(plot_info_links_html or "")
    if not matches:
        return None
    dist, teh, vill, khata, _ = matches[0]
    return {
        "khata_no": khata,
        "ror_front": f"http://bhulekh.ori.nic.in/ViewRoR.aspx?DistCode={dist}&TehCode={teh}&VillCode={vill}&KhataNo={khata}&type=front",
        "ror_back": f"http://bhulekh.ori.nic.in/ViewRoR.aspx?DistCode={dist}&TehCode={teh}&VillCode={vill}&KhataNo={khata}&type=back",
    }

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (research / civic data use)",
})


def get_extent(dist, tehsil, ri, village, sheet="01"):
    """Fetch the local-coordinate bounding box for one village sheet."""
    levels = f"{dist},{tehsil},{ri},{village},{sheet},"
    r = session.post(
        f"{BASE}/rest/MapInfo/getVVVVExtentGeoref",
        data={"state": STATE, "gisLevels": levels, "srs": "0"},
        timeout=20,
    )
    r.raise_for_status()
    return r.json()


def get_plot_at_xy(dist, tehsil, ri, village, sheet, x, y):
    """Hit-test a single (x, y) point in local sheet coords -> plot info dict or None."""
    levels = f"{dist},{tehsil},{ri},{village},{sheet},"
    r = session.get(
        f"{BASE}/ScalarDatahandler",
        params={"OP": "4", "state": STATE, "levels": levels, "x": x, "y": y},
        timeout=20,
    )
    if r.status_code != 200 or not r.text.strip():
        return None
    try:
        data = r.json()
    except ValueError:
        return None
    # TODO: confirm what a genuine miss looks like and tighten this check
    if not data or "plotNo" not in data:
        return None
    return data


def get_village_map_png(gis_code, extent, pixels_per_unit=5.0):
    """
    Pull the raster village sheet as PNG, sized to MATCH the extent's real aspect
    ratio (pixels_per_unit units of local-coordinate space per pixel) instead of a
    fixed square canvas - a fixed WIDTH/HEIGHT regardless of extent shape distorts
    non-square sheets and breaks any later attempt to align sheets by coordinate.
    Returns (png_bytes, width_px, height_px).
    """
    width = max(1, round((extent["xmax"] - extent["xmin"]) * pixels_per_unit))
    height = max(1, round((extent["ymax"] - extent["ymin"]) * pixels_per_unit))
    bbox = f"{extent['xmin']},{extent['ymin']},{extent['xmax']},{extent['ymax']}"
    r = session.get(
        f"{BASE}/WMS",
        params={
            "SERVICE": "WMS",
            "VERSION": "1.3.0",
            "REQUEST": "GetMap",
            "FORMAT": "image/png",
            "TRANSPARENT": "true",
            "LAYERS": "VILLAGE_MAP",
            "STYLES": "VILLAGE_MAP",
            "state": STATE,
            "gis_code": gis_code,
            "CRS": "EPSG:3857",
            "WIDTH": width,
            "HEIGHT": height,
            "BBOX": bbox,
        },
        timeout=30,
    )
    r.raise_for_status()
    return r.content, width, height


def stitch_village_sheets(dist, tehsil, ri, village, sheets, pixels_per_unit=5.0,
                           out_path="stitched_village.png"):
    """
    Combine multiple sheets of the SAME village into one image, using their
    getVVVVExtentGeoref bounding boxes to position each sheet correctly.

    ONLY valid if the sheets actually share one coordinate space (confirm by
    comparing extents first - contiguous/adjacent ranges = shared space, all
    starting near 0 independently = NOT shared, don't use this). Do not assume
    this holds across sheets from DIFFERENT villages.
    """
    from PIL import Image
    import io

    extents = {}
    tiles = {}
    for sheet in sheets:
        ext = get_extent(dist, tehsil, ri, village, sheet)
        extents[sheet] = ext
        gis_code = ext.get("gisCode", f"{dist}{tehsil}{ri}{village}{sheet}")
        png_bytes, w, h = get_village_map_png(gis_code, ext, pixels_per_unit)
        tiles[sheet] = (png_bytes, w, h)
        print(f"sheet {sheet}: extent={ext}, size={w}x{h}px")

    union_xmin = min(e["xmin"] for e in extents.values())
    union_xmax = max(e["xmax"] for e in extents.values())
    union_ymin = min(e["ymin"] for e in extents.values())
    union_ymax = max(e["ymax"] for e in extents.values())

    canvas_w = round((union_xmax - union_xmin) * pixels_per_unit)
    canvas_h = round((union_ymax - union_ymin) * pixels_per_unit)
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 0))

    for sheet, ext in extents.items():
        png_bytes, w, h = tiles[sheet]
        tile_img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
        offset_x = round((ext["xmin"] - union_xmin) * pixels_per_unit)
        offset_y = round((union_ymax - ext["ymax"]) * pixels_per_unit)  # flip: y grows up in map space, down in image space
        canvas.paste(tile_img, (offset_x, offset_y), tile_img)

    canvas.save(out_path)
    union_extent = {"xmin": union_xmin, "ymin": union_ymin, "xmax": union_xmax, "ymax": union_ymax}
    print(f"stitched {len(sheets)} sheets -> {out_path} ({canvas_w}x{canvas_h}px), union extent: {union_extent}")
    return out_path, union_extent


def scrape_village(dist, tehsil, ri, village, sheet="01", grid_step=15, out_dir="out"):
    """
    Grid-sample a village sheet for plots + pull its raster map.
    grid_step is in local sheet units - tune based on plot density (smaller step =
    more requests but won't skip small plots). Watch the plot count you get back
    against the visible plot numbers on the UI map to calibrate step size.
    """
    os.makedirs(out_dir, exist_ok=True)
    gis_code = f"{dist}{tehsil}{ri}{village}{sheet}"

    extent = get_extent(dist, tehsil, ri, village, sheet)
    print(f"[{gis_code}] extent: {extent}")

    png, _w, _h = get_village_map_png(extent["gisCode"], extent)
    with open(f"{out_dir}/{gis_code}.png", "wb") as f:
        f.write(png)

    plots = {}          # keyed by ID (stable), not plotNo (human label, may repeat)
    found_bboxes = []   # [(xmin,ymin,xmax,ymax), ...] of plots already captured

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
                if info["ID"] not in plots:
                    ror = extract_khata_and_ror_links(info.get("plotInfoLinks", ""))
                    if ror:
                        info["khata_ror"] = ror
                    plots[info["ID"]] = info
                found_bboxes.append((info["xmin"], info["ymin"], info["xmax"], info["ymax"]))
            y += grid_step
            time.sleep(0.05)  # be polite - tune this, robots.txt disallows automation
        x += grid_step

    with open(f"{out_dir}/{gis_code}_plots.json", "w", encoding="utf-8") as f:
        json.dump(plots, f, ensure_ascii=False, indent=2)

    print(f"[{gis_code}] found {len(plots)} plots")
    return extent, plots


# ---------------------------------------------------------------------------
# Cache layer - fetch-on-demand instead of bulk-scraping the whole state.
# Odisha has 50,000+ villages; grid-sampling all of them upfront would be an
# enormous request volume against a server whose robots.txt disallows
# automation. Only scrape a village the first time something actually asks
# for it, then serve from cache after that.
# ---------------------------------------------------------------------------
import sqlite3

DB_PATH = "bhunaksha_cache.db"
STALE_AFTER_DAYS = 90  # re-scrape a village if our cached copy is older than this


def init_db(db_path=DB_PATH):
    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS villages (
            gis_code TEXT PRIMARY KEY,
            district TEXT, tehsil TEXT, ri TEXT, village TEXT, sheet TEXT,
            xmin REAL, ymin REAL, xmax REAL, ymax REAL,
            png_path TEXT,
            scraped_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS plots (
            id TEXT PRIMARY KEY,           -- the opaque plot ID from ScalarDatahandler
            gis_code TEXT,                 -- FK -> villages.gis_code
            plot_no TEXT,
            khata_no TEXT,
            ror_front TEXT,
            ror_back TEXT,
            info TEXT,
            xmin REAL, ymin REAL, xmax REAL, ymax REAL,
            FOREIGN KEY (gis_code) REFERENCES villages(gis_code)
        )
    """)
    conn.commit()
    return conn


def get_or_fetch_village(dist, tehsil, ri, village, sheet="01", db_path=DB_PATH,
                          out_dir="out", grid_step=15, force=False):
    """
    Cache-first lookup: return cached village+plot data if we have a recent copy,
    otherwise scrape it live and store the result. This is the function your
    Data India backend should actually call per user location - not scrape_village()
    directly, and never a bulk loop over every village in the state.
    """
    conn = init_db(db_path)
    gis_code = f"{dist}{tehsil}{ri}{village}{sheet}"

    if not force:
        row = conn.execute(
            "SELECT scraped_at, png_path FROM villages WHERE gis_code = ?", (gis_code,)
        ).fetchone()
        if row:
            scraped_at, png_path = row
            age_days = (time.time() - float(scraped_at)) / 86400
            if age_days < STALE_AFTER_DAYS:
                plot_rows = conn.execute(
                    "SELECT * FROM plots WHERE gis_code = ?", (gis_code,)
                ).fetchall()
                cols = [d[0] for d in conn.execute("SELECT * FROM plots LIMIT 0").description]
                plots = [dict(zip(cols, r)) for r in plot_rows]
                conn.close()
                return {"gis_code": gis_code, "png_path": png_path, "plots": plots, "source": "cache"}

    # Not cached / stale / forced -> scrape live
    extent, plots = scrape_village(dist, tehsil, ri, village, sheet, grid_step, out_dir)
    png_path = f"{out_dir}/{gis_code}.png"

    conn.execute("DELETE FROM villages WHERE gis_code = ?", (gis_code,))
    conn.execute("DELETE FROM plots WHERE gis_code = ?", (gis_code,))
    conn.execute(
        "INSERT INTO villages VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        (gis_code, dist, tehsil, ri, village, sheet,
         extent["xmin"], extent["ymin"], extent["xmax"], extent["ymax"],
         png_path, str(time.time())),
    )
    for pid, p in plots.items():
        ror = p.get("khata_ror", {})
        conn.execute(
            "INSERT INTO plots VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (pid, gis_code, p.get("plotNo"), ror.get("khata_no"),
             ror.get("ror_front"), ror.get("ror_back"), p.get("info"),
             p.get("xmin"), p.get("ymin"), p.get("xmax"), p.get("ymax")),
        )
    conn.commit()
    conn.close()

    return {"gis_code": gis_code, "png_path": png_path,
            "plots": list(plots.values()), "source": "live"}


def scrape_district(dist, village_list, db_path=DB_PATH, out_dir="out",
                     grid_step=15, delay_between_villages=3):
    """
    village_list: list of (tehsil, ri, village, sheet) tuples for every village
    in this district. Get this from the Tehsil/RI/Village dropdown-population
    endpoints (not yet captured - see conversation) rather than guessing codes.

    Runs get_or_fetch_village() for each one - skips anything already cached
    and not stale, keeps going past individual failures (logs and continues,
    doesn't kill the whole run), and pauses between villages (separate from the
    smaller per-request sleep inside scrape_village) to keep total load on the
    server reasonable across a run covering hundreds of villages.
    """
    results = []
    errors = []
    for i, (tehsil, ri, village, sheet) in enumerate(village_list, 1):
        gis_code = f"{dist}{tehsil}{ri}{village}{sheet}"
        try:
            res = get_or_fetch_village(dist, tehsil, ri, village, sheet,
                                        db_path=db_path, out_dir=out_dir,
                                        grid_step=grid_step)
            results.append(res)
            print(f"[{i}/{len(village_list)}] {gis_code}: "
                  f"{res['source']}, {len(res['plots'])} plots")
        except Exception as e:
            print(f"[{i}/{len(village_list)}] {gis_code}: FAILED - {e}")
            errors.append((gis_code, str(e)))
        if res.get("source") == "live":
            time.sleep(delay_between_villages)  # only pause after a real scrape, not cache hits

    print(f"\nDone. {len(results)} villages processed, {len(errors)} failed.")
    if errors:
        print("Failed villages:", errors)
    return results, errors


if __name__ == "__main__":
    result = get_or_fetch_village(dist="28", tehsil="2", ri="2", village="81", sheet="01")
    print(f"source={result['source']}, plots={len(result['plots'])}")
