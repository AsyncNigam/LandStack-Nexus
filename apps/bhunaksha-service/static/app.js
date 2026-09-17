/**
 * Odisha Bhunaksha Frontend Application Logic
 * Manages state, cascading hierarchy, Leaflet CRS.Simple canvas,
 * click-to-identify plot hit-testing, and RI batch stitching.
 */

// Application State
const state = {
  dist: null,
  tehsil: null,
  ri: null,
  village: null,
  villageName: "",
  activeMapData: null,
  plots: [],
  map: null,
  imageOverlay: null,
  plotsLayer: null,
  highlightLayer: null,
  riPollInterval: null
};

// DOM Elements
const el = {
  selectDist: document.getElementById("select-dist"),
  selectTehsil: document.getElementById("select-tehsil"),
  selectRI: document.getElementById("select-ri"),
  selectVillage: document.getElementById("select-village"),
  btnStitchVillage: document.getElementById("btn-stitch-village"),
  btnStitchRI: document.getElementById("btn-stitch-ri"),
  
  hudVillageName: document.getElementById("hud-village-name"),
  hudSheetsText: document.getElementById("hud-sheets-text"),
  hudCoords: document.getElementById("hud-coords"),
  inputSearchPlot: document.getElementById("input-search-plot"),
  
  loadingOverlay: document.getElementById("loading-overlay"),
  loadingMessage: document.getElementById("loading-message"),
  
  riProgressSection: document.getElementById("ri-progress-section"),
  riProgressBar: document.getElementById("ri-progress-bar"),
  riProgressCount: document.getElementById("ri-progress-count"),
  riProgressCurrent: document.getElementById("ri-progress-current"),
  
  plotEmptyState: document.getElementById("plot-empty-state"),
  plotDetailsCard: document.getElementById("plot-details-card"),
  detailPlotNo: document.getElementById("detail-plot-no"),
  detailKhataNo: document.getElementById("detail-khata-no"),
  detailLandClass: document.getElementById("detail-land-class"),
  detailArea: document.getElementById("detail-area"),
  detailInfo: document.getElementById("detail-info"),
  btnRorFront: document.getElementById("btn-ror-front"),
  btnRorBack: document.getElementById("btn-ror-back")
};

// ==========================================================================
// 1. Leaflet Map Initialization
// ==========================================================================
function initMap() {
  state.map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -4,
    maxZoom: 3,
    zoomSnap: 0.5,
    attributionControl: false
  });

  state.plotsLayer = L.layerGroup().addTo(state.map);
  state.highlightLayer = L.layerGroup().addTo(state.map);

  // Track cursor position in local sheet coordinates
  state.map.on("mousemove", (e) => {
    if (!state.activeMapData || !state.activeMapData.union_extent) {
      el.hudCoords.textContent = "X: - | Y: -";
      return;
    }
    const ext = state.activeMapData.union_extent;
    const h = ext.canvas_height;
    const ppu = ext.pixels_per_unit || 5.0;

    // Convert Leaflet [lat, lng] -> Canvas [x, y] -> Local map units
    const canvasX = e.latlng.lng;
    const canvasY = h - e.latlng.lat;

    const localX = ext.xmin + (canvasX / ppu);
    const localY = ext.ymax - (canvasY / ppu);

    el.hudCoords.textContent = `X: ${localX.toFixed(1)} | Y: ${localY.toFixed(1)}`;
  });

  // Map Click: Identify plot
  state.map.on("click", async (e) => {
    if (!state.activeMapData || !state.activeMapData.union_extent) return;
    const ext = state.activeMapData.union_extent;
    const h = ext.canvas_height;
    const ppu = ext.pixels_per_unit || 5.0;

    const canvasX = e.latlng.lng;
    const canvasY = h - e.latlng.lat;

    const localX = ext.xmin + (canvasX / ppu);
    const localY = ext.ymax - (canvasY / ppu);

    await hitTestCoordinate(localX, localY);
  });
}

// ==========================================================================
// 2. Cascading Hierarchy APIs
// ==========================================================================
async function loadDistricts() {
  try {
    const res = await fetch("/api/hierarchy/districts");
    const data = await res.json();
    populateSelect(el.selectDist, data, "Select district...");
  } catch (err) {
    console.error("Failed to load districts:", err);
  }
}

async function loadTehsils(dist) {
  try {
    const res = await fetch(`/api/hierarchy/tehsils?dist=${dist}`);
    const data = await res.json();
    populateSelect(el.selectTehsil, data, "Select tehsil...");
    el.selectTehsil.disabled = false;
  } catch (err) {
    console.error("Failed to load tehsils:", err);
  }
}

async function loadRIs(dist, tehsil) {
  try {
    const res = await fetch(`/api/hierarchy/ris?dist=${dist}&tehsil=${tehsil}`);
    const data = await res.json();
    populateSelect(el.selectRI, data, "Select RI...");
    el.selectRI.disabled = false;
  } catch (err) {
    console.error("Failed to load RIs:", err);
  }
}

async function loadVillages(dist, tehsil, ri) {
  try {
    const res = await fetch(`/api/hierarchy/villages?dist=${dist}&tehsil=${tehsil}&ri=${ri}`);
    const data = await res.json();
    populateSelect(el.selectVillage, data, "Select village...");
    el.selectVillage.disabled = false;
    el.btnStitchRI.disabled = false;
  } catch (err) {
    console.error("Failed to load villages:", err);
  }
}

function populateSelect(selectEl, items, placeholder) {
  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.code;
    opt.textContent = `${item.name} (${item.code})`;
    selectEl.appendChild(opt);
  });
}

// ==========================================================================
// 3. Single Village Stitching & Display
// ==========================================================================
async function stitchVillage() {
  if (!state.dist || !state.tehsil || !state.ri || !state.village) return;

  showLoading(`Stitching map sheets for ${state.villageName}...`);
  try {
    const res = await fetch("/api/stitch/village", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dist: state.dist,
        tehsil: state.tehsil,
        ri: state.ri,
        village: state.village
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    state.activeMapData = data;
    renderStitchedMap(data);
  } catch (err) {
    alert(`Failed to stitch village: ${err.message}`);
  } finally {
    hideLoading();
  }
}

function renderStitchedMap(data) {
  const ext = data.union_extent;
  const w = ext.canvas_width;
  const h = ext.canvas_height;
  const bounds = [[0, 0], [h, w]];

  // Clear previous layers
  if (state.imageOverlay) {
    state.map.removeLayer(state.imageOverlay);
  }
  state.plotsLayer.clearLayers();
  state.highlightLayer.clearLayers();

  // Add stitched PNG
  state.imageOverlay = L.imageOverlay(data.image_url, bounds).addTo(state.map);
  state.map.fitBounds(bounds);

  // Update HUD
  el.hudVillageName.textContent = state.villageName || `Village ${state.village}`;
  el.hudSheetsText.textContent = `${data.sheets.length} sheet(s) stitched (${w}×${h} px)`;

  // Render cached plots
  state.plots = data.plots || [];
  renderPlotOverlays(state.plots, ext);
}

function renderPlotOverlays(plots, unionExt) {
  state.plotsLayer.clearLayers();
  const h = unionExt.canvas_height;
  const ppu = unionExt.pixels_per_unit || 5.0;
  const uxmin = unionExt.xmin;
  const uymax = unionExt.ymax;

  plots.forEach(p => {
    if (p.xmin == null || p.ymin == null || p.xmax == null || p.ymax == null) return;
    
    // Transform coordinates
    const pxmin = (p.xmin - uxmin) * ppu;
    const pxmax = (p.xmax - uxmin) * ppu;
    const pymin = (uymax - p.ymax) * ppu;
    const pymax = (uymax - p.ymin) * ppu;

    const rectBounds = [[h - pymax, pxmin], [h - pymin, pxmax]];
    const rect = L.rectangle(rectBounds, {
      color: "#0284c7",
      weight: 1,
      fillColor: "#0284c7",
      fillOpacity: 0.1
    });

    rect.on("mouseover", function() {
      this.setStyle({ fillOpacity: 0.35, color: "#f59e0b" });
    });

    rect.on("mouseout", function() {
      this.setStyle({ fillOpacity: 0.1, color: "#0284c7" });
    });

    rect.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      displayPlotDetails(p, rectBounds);
    });

    state.plotsLayer.addLayer(rect);
  });
}

// ==========================================================================
// 4. Plot Hit-Testing & Inspection
// ==========================================================================
async function hitTestCoordinate(x, y) {
  try {
    const url = `/api/plot/hit?dist=${state.dist}&tehsil=${state.tehsil}&ri=${state.ri}&village=${state.village}&x=${x}&y=${y}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.plot_no) {
      // Calculate plot bounding box on canvas
      const ext = state.activeMapData.union_extent;
      const h = ext.canvas_height;
      const ppu = ext.pixels_per_unit || 5.0;

      const pxmin = (data.xmin - ext.xmin) * ppu;
      const pxmax = (data.xmax - ext.xmin) * ppu;
      const pymin = (ext.ymax - data.ymax) * ppu;
      const pymax = (ext.ymax - data.ymin) * ppu;
      const rectBounds = [[h - pymax, pxmin], [h - pymin, pxmax]];

      displayPlotDetails(data, rectBounds);
    } else {
      clearPlotDetails();
    }
  } catch (err) {
    console.error("Hit-test failed:", err);
  }
}

function displayPlotDetails(plot, rectBounds) {
  el.plotEmptyState.classList.add("hidden");
  el.plotDetailsCard.classList.remove("hidden");

  el.detailPlotNo.textContent = plot.plot_no || "-";
  el.detailKhataNo.textContent = plot.khata_no || "N/A";
  el.detailLandClass.textContent = plot.land_class || "N/A";
  el.detailArea.textContent = plot.area_acres != null ? `${plot.area_acres} Acres` : "N/A";
  el.detailInfo.textContent = (plot.info || "").trim() || "No ownership records available for this plot.";

  // RoR Links
  if (plot.ror_front) {
    el.btnRorFront.href = plot.ror_front;
    el.btnRorFront.style.display = "inline-flex";
  } else {
    el.btnRorFront.style.display = "none";
  }

  if (plot.ror_back) {
    el.btnRorBack.href = plot.ror_back;
    el.btnRorBack.style.display = "inline-flex";
  } else {
    el.btnRorBack.style.display = "none";
  }

  // Highlight rectangle
  state.highlightLayer.clearLayers();
  if (rectBounds) {
    const highlight = L.rectangle(rectBounds, {
      color: "#d97706",
      weight: 2.5,
      fillColor: "#f59e0b",
      fillOpacity: 0.25
    });
    state.highlightLayer.addLayer(highlight);
  }
}

function clearPlotDetails() {
  el.plotEmptyState.classList.remove("hidden");
  el.plotDetailsCard.classList.add("hidden");
  state.highlightLayer.clearLayers();
}

// ==========================================================================
// 5. Plot Quick Search
// ==========================================================================
el.inputSearchPlot.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = el.inputSearchPlot.value.trim();
    if (!query || !state.plots.length) return;

    const match = state.plots.find(p => String(p.plot_no) === query || String(p.plot_no).includes(query));
    if (match && state.activeMapData) {
      const ext = state.activeMapData.union_extent;
      const h = ext.canvas_height;
      const ppu = ext.pixels_per_unit || 5.0;

      const pxmin = (match.xmin - ext.xmin) * ppu;
      const pxmax = (match.xmax - ext.xmin) * ppu;
      const pymin = (ext.ymax - match.ymax) * ppu;
      const pymax = (ext.ymax - match.ymin) * ppu;
      const rectBounds = [[h - pymax, pxmin], [h - pymin, pxmax]];

      displayPlotDetails(match, rectBounds);
      state.map.fitBounds(rectBounds, { maxZoom: 1, padding: [100, 100] });
    } else {
      alert(`Plot number "${query}" not found in current cached plots.`);
    }
  }
});

// ==========================================================================
// 6. Batch RI Stitching
// ==========================================================================
async function startStitchRI() {
  if (!state.dist || !state.tehsil || !state.ri) return;

  const confirmed = confirm("Are you sure you want to stitch all villages in this RI? This will download and stitch every village sheet.");
  if (!confirmed) return;

  el.riProgressSection.classList.remove("hidden");
  el.riProgressBar.style.width = "0%";
  el.riProgressCount.textContent = "Starting...";
  el.riProgressCurrent.textContent = "Dispatching background job...";

  try {
    const res = await fetch("/api/stitch/ri", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dist: state.dist, tehsil: state.tehsil, ri: state.ri })
    });
    const data = await res.json();
    pollRIJob(data.job_id);
  } catch (err) {
    alert(`Failed to start RI batch job: ${err.message}`);
  }
}

function pollRIJob(jobId) {
  if (state.riPollInterval) clearInterval(state.riPollInterval);

  state.riPollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/stitch/ri/status?job_id=${jobId}`);
      const job = await res.json();

      if (job.total_villages > 0) {
        const pct = Math.round((job.current_index / job.total_villages) * 100);
        el.riProgressBar.style.width = `${pct}%`;
        el.riProgressCount.textContent = `${job.current_index} / ${job.total_villages}`;
        el.riProgressCurrent.textContent = job.current_village || "Processing...";
      }

      if (job.status === "completed" || job.status === "failed") {
        clearInterval(state.riPollInterval);
        el.riProgressBar.style.width = "100%";
        el.riProgressCurrent.textContent = job.status === "completed" 
          ? `Finished! Stitched ${job.completed.length} villages.`
          : `Failed: ${job.error || "Unknown error"}`;
      }
    } catch (err) {
      console.error("Error polling RI status:", err);
    }
  }, 1500);
}

// ==========================================================================
// 7. Event Listeners
// ==========================================================================
el.selectDist.addEventListener("change", (e) => {
  state.dist = e.target.value;
  state.tehsil = null;
  state.ri = null;
  state.village = null;

  el.selectTehsil.disabled = true;
  el.selectRI.disabled = true;
  el.selectVillage.disabled = true;
  el.btnStitchVillage.disabled = true;
  el.btnStitchRI.disabled = true;

  if (state.dist) loadTehsils(state.dist);
});

el.selectTehsil.addEventListener("change", (e) => {
  state.tehsil = e.target.value;
  state.ri = null;
  state.village = null;

  el.selectRI.disabled = true;
  el.selectVillage.disabled = true;
  el.btnStitchVillage.disabled = true;
  el.btnStitchRI.disabled = true;

  if (state.dist && state.tehsil) loadRIs(state.dist, state.tehsil);
});

el.selectRI.addEventListener("change", (e) => {
  state.ri = e.target.value;
  state.village = null;

  el.selectVillage.disabled = true;
  el.btnStitchVillage.disabled = true;

  if (state.dist && state.tehsil && state.ri) {
    loadVillages(state.dist, state.tehsil, state.ri);
  }
});

el.selectVillage.addEventListener("change", (e) => {
  state.village = e.target.value;
  const opt = e.target.options[e.target.selectedIndex];
  state.villageName = opt ? opt.text : "";
  el.btnStitchVillage.disabled = !state.village;
});

el.btnStitchVillage.addEventListener("click", stitchVillage);
el.btnStitchRI.addEventListener("click", startStitchRI);

function showLoading(msg) {
  el.loadingMessage.textContent = msg;
  el.loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
  el.loadingOverlay.classList.add("hidden");
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadDistricts();
});
