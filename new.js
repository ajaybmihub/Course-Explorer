// ═══════════════════════════════════════════════════════════
//  TRACK CONFIG
// ═══════════════════════════════════════════════════════════
const TRACKS = [
  { name: "JEE / NEET Track", file: "JEE NEET Track.json",    icon: "ic-atom",        color: "ic-blue",   type: "exam" },
  { name: "Banking Track",    file: "Banking Track.json",      icon: "ic-bank",        color: "ic-green",  type: "exam" },
  { name: "Govt Exams Track", file: "Govt Exams Track.json",   icon: "ic-institution", color: "ic-orange", type: "exam" },
  { name: "Tech Track",       file: "tech track.json",         icon: "ic-cpu",         color: "ic-purple", type: "tech" },
];

// ═══════════════════════════════════════════════════════════
//  CATEGORY ICON / COLOUR CONFIG
// ═══════════════════════════════════════════════════════════
const CATEGORY_CONFIG = {
  "JEE — Joint Entrance Examination":              { icon: "ic-atom",        color: "ic-blue"   },
  "NEET — National Eligibility cum Entrance Test": { icon: "ic-stethoscope", color: "ic-green"  },
  "Banking":          { icon: "ic-bank",        color: "ic-green"  },
  "UPSC":             { icon: "ic-institution", color: "ic-orange" },
  "SSC":              { icon: "ic-award",       color: "ic-yellow" },
  "Railways":         { icon: "ic-train",       color: "ic-yellow" },
  "Defence":          { icon: "ic-shield",      color: "ic-red"    },
  "Insurance":        { icon: "ic-coins",       color: "ic-teal"   },
  "PSU":              { icon: "ic-gear",        color: "ic-indigo" },
  "State PSC":        { icon: "ic-layers",      color: "ic-orange" },
  "State PSC / State Exams": { icon: "ic-layers", color: "ic-orange" },
  "Teaching":         { icon: "ic-courses",     color: "ic-yellow" },
  "Judiciary":        { icon: "ic-briefcase",   color: "ic-teal"   },
  "Healthcare":       { icon: "ic-heartpulse",  color: "ic-green"  },
  "Central Police":   { icon: "ic-shield",      color: "ic-red"    },
  "Technical":        { icon: "ic-wrench",      color: "ic-indigo" },
  "State Generic":    { icon: "ic-globe",       color: "ic-purple" },
  "Other":            { icon: "ic-layers",      color: "ic-purple" },
  "DSA — Data Structures & Algorithms": { icon: "ic-layers", color: "ic-purple" },
  "Domain-Based":     { icon: "ic-cpu",         color: "ic-indigo" },
};

function getCfg(category) {
  if (CATEGORY_CONFIG[category]) return CATEGORY_CONFIG[category];
  const lower = category.toLowerCase();
  if (lower.includes('jee'))      return { icon: "ic-atom",        color: "ic-blue"   };
  if (lower.includes('neet'))     return { icon: "ic-stethoscope", color: "ic-green"  };
  if (lower.includes('bank'))     return { icon: "ic-bank",        color: "ic-green"  };
  if (lower.includes('upsc'))     return { icon: "ic-institution", color: "ic-orange" };
  if (lower.includes('ssc'))      return { icon: "ic-award",       color: "ic-yellow" };
  if (lower.includes('rail'))     return { icon: "ic-train",       color: "ic-yellow" };
  if (lower.includes('defence'))  return { icon: "ic-shield",      color: "ic-red"    };
  if (lower.includes('insur'))    return { icon: "ic-coins",       color: "ic-teal"   };
  if (lower.includes('psu'))      return { icon: "ic-gear",        color: "ic-indigo" };
  if (lower.includes('state'))    return { icon: "ic-layers",      color: "ic-orange" };
  if (lower.includes('tech'))     return { icon: "ic-cpu",         color: "ic-indigo" };
  if (lower.includes('polic'))    return { icon: "ic-shield",      color: "ic-red"    };
  return { icon: "ic-globe", color: "ic-purple" };
}

// ═══════════════════════════════════════════════════════════
//  DOM REFS
// ═══════════════════════════════════════════════════════════
const tabsContainer = document.getElementById('tabs-container');
const contentArea   = document.getElementById('content-area');

// ═══════════════════════════════════════════════════════════
//  APP STATE
// ═══════════════════════════════════════════════════════════
const loadedData = {};

// ═══════════════════════════════════════════════════════════
//  FETCH ALL JSON FILES IN PARALLEL
// ═══════════════════════════════════════════════════════════
async function loadAllTracks() {
  showLoader();
  const fetches = TRACKS.map(async (track) => {
    try {
      const res = await fetch(track.file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      loadedData[track.name] = data;
    } catch (err) {
      console.error(`Failed to load ${track.file}:`, err);
      loadedData[track.name] = [];
    }
  });
  await Promise.all(fetches);
  init();
}

// ═══════════════════════════════════════════════════════════
//  LOADER
// ═══════════════════════════════════════════════════════════
function showLoader() {
  contentArea.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;flex:1;flex-direction:column;gap:16px;color:var(--text-muted);">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="animation:spin 1s linear infinite;">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <span style="font-size:14px;font-weight:600;">Loading tracks…</span>
    </div>
  `;
  if (!document.getElementById('spin-style')) {
    const s = document.createElement('style');
    s.id = 'spin-style';
    s.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const trackParam = urlParams.get('track');

  let activeTrack = TRACKS[0];
  if (trackParam) {
    const found = TRACKS.find(t => t.name === trackParam);
    if (found) activeTrack = found;
  }

  renderTabs(activeTrack.name);

  if (activeTrack.type === 'tech') {
    renderTechTrack(loadedData[activeTrack.name] || []);
  } else {
    renderExamTrack(activeTrack.name, loadedData[activeTrack.name] || []);
  }
}

// ═══════════════════════════════════════════════════════════
//  RENDER TABS
// ═══════════════════════════════════════════════════════════
function renderTabs(activeTrackName) {
  tabsContainer.innerHTML = '';
  TRACKS.forEach((track) => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${track.name === activeTrackName ? 'active' : ''}`;
    btn.dataset.track = track.name;
    btn.onclick = () => switchTab(track, btn);
    btn.innerHTML = `<svg class="tab-icon"><use href="#${track.icon}"/></svg>${track.name}`;
    tabsContainer.appendChild(btn);
  });
}

// ═══════════════════════════════════════════════════════════
//  RENDER — EXAM-BASED TRACKS
// ═══════════════════════════════════════════════════════════
function renderExamTrack(trackName, rawItems) {
  const items = rawItems.filter(d => d["Track Name"] === trackName);

  if (!items.length) {
    contentArea.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;flex:1;color:var(--text-muted);font-size:14px;font-weight:600;">
        No data available for ${trackName}.
      </div>`;
    return;
  }

  const categories = [...new Set(items.map(d => d["Category"]))];

  // ── Left sidebar ──
  let html = `<div class="tab-body"><div class="cat-list"><div class="cat-group-label">Categories</div>`;

  categories.forEach((cat, i) => {
    const catItems = items.filter(d => d["Category"] === cat);
    const cfg = getCfg(cat);
    html += `
      <div class="cat-item ${i === 0 ? 'active' : ''}" onclick="switchCat(this,'${safeid(trackName + '-' + cat)}')">
        <div class="cat-item-left">
          <div class="cat-icon-wrap ${cfg.color}"><svg><use href="#${cfg.icon}"/></svg></div>
          <div>
            <div class="cat-name">${cat}</div>
            <div class="cat-sub-count">${catItems.length} exam${catItems.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <span class="cat-arrow"><svg width="12" height="12"><use href="#ic-chevron"/></svg></span>
      </div>`;
  });
  html += `</div>`; // end cat-list

  // ── Panels ──
  categories.forEach((cat, i) => {
    const catItems = items.filter(d => d["Category"] === cat);
    const cfg = getCfg(cat);
    const panelId = safeid(trackName + '-' + cat);
    const isStatePSC = cat === 'State PSC / State Exams' || cat === 'State PSC';

    html += `<div class="sub-panel ${i === 0 ? 'active' : ''} ${isStatePSC ? 'sub-panel--state' : ''}" id="${panelId}">`;

    if (isStatePSC) {
      // ─── STATE PSC: two-level state grid → exam cards ───
      const stateMap = new Map();
      catItems.forEach(exam => {
        const name = exam["Exam Name"] || '';
        const dashIdx = name.indexOf(' - ');
        const stateName = dashIdx > -1 ? name.substring(0, dashIdx) : name;
        if (!stateMap.has(stateName)) stateMap.set(stateName, []);
        stateMap.get(stateName).push(exam);
      });
      const states = [...stateMap.keys()];

      // Panel header
      html += `
        <div class="sub-panel-header">
          <div class="sub-panel-icon ${cfg.color}"><svg><use href="#${cfg.icon}"/></svg></div>
          <div>
            <div class="sub-panel-title">State PSC / State Exams</div>
            <div class="sub-panel-desc">${states.length} states · ${catItems.length} exams</div>
          </div>
          <div class="sub-panel-count">${states.length} States</div>
        </div>`;

      // State wrap (scrollable area)
      html += `<div class="state-wrap" id="sw-${panelId}">`;

      // State search
      html += `
        <div class="state-search-wrap">
          <span class="sstate-ico"><svg width="14" height="14"><use href="#ic-globe"/></svg></span>
          <input class="state-search" type="text" placeholder="Search state…" oninput="filterStates(this,'${panelId}')">
        </div>`;

      // State button grid
      html += `<div class="sgrid" id="sgrid-${panelId}">`;
      states.forEach(state => {
        const count = stateMap.get(state).length;
        html += `
          <button class="sbtn" data-state="${state}" onclick="openState('${panelId}','${safeid(state)}','${state.replace(/'/g, "\\'")}')">
            <div class="sbtn-icon ic-orange"><svg width="12" height="12"><use href="#ic-globe"/></svg></div>
            <div>
              <div class="sbn">${state}</div>
              <div class="sbc">${count} exams</div>
            </div>
          </button>`;
      });
      html += `</div>`; // end sgrid

      // Per-state exam panels (hidden by default)
      states.forEach(state => {
        const stateExams = stateMap.get(state);
        const stateId = safeid(state);
        html += `
          <div class="state-exam-panel hidden" id="sep-${panelId}-${stateId}">
            <div class="se-head">
              <div class="sub-panel-icon ic-orange" style="width:32px;height:32px;flex-shrink:0;"><svg><use href="#ic-globe"/></svg></div>
              <div class="se-title">${state}</div>
              <div class="se-badge">${stateExams.length} exams</div>
              <button class="se-back" onclick="closeState('${panelId}')">
                <svg width="12" height="12" style="transform:rotate(180deg);display:block;"><use href="#ic-chevron"/></svg>
                Back to States
              </button>
            </div>
            <div class="state-search-wrap">
              <span class="sstate-ico"><svg width="14" height="14"><use href="#ic-globe"/></svg></span>
              <input class="state-search" type="text" placeholder="Search exams…" oninput="filterStateExams(this,'sep-${panelId}-${stateId}')">
            </div>
            <div class="egrid">`;

        stateExams.forEach((exam, idx) => {
          // Strip "StateName - " prefix from display name
          const rawName = exam["Exam Name"] || '';
          const prefix = state + ' - ';
          const displayName = rawName.startsWith(prefix) ? rawName.slice(prefix.length) : rawName;
          const qc   = exam["Question Count"];
          const yr   = exam["Year"];
          const hasQ = qc && qc.trim() !== '';
          const hasY = yr && yr.trim() !== '';
          const delay = (Math.min(idx, 12) * 0.025).toFixed(3);

          html += `
            <a class="ecard" href="#" style="animation-delay:${delay}s">
              <div class="eico ${cfg.color}"><svg width="17" height="17"><use href="#${cfg.icon}"/></svg></div>
              <div class="ebody">
                <div class="ename">${displayName}</div>
                <div class="emeta">
                  <span class="econd">${exam["Conducting Body"] || ''}</span>
                  <span class="etag tg-orange">${exam["Level"] || 'State'}</span>
                </div>
                <div class="epills">
                  <span class="epill">${exam["Eligibility"] || 'Varies'}</span>
                  <span class="epill">${exam["Frequency"] || 'Varies'}</span>
                </div>
                ${hasQ ? `
                <div class="prog-wrap">
                  <div class="prog-info">
                    <span class="p-cnt">${qc}</span>
                    ${hasY ? `<span class="p-yr">${yr}</span>` : ''}
                  </div>
                  <div class="prog-bar"><div class="prog-fill" style="width:100%"></div></div>
                </div>` : ''}
              </div>
              <div class="earrow"><svg width="7" height="7"><use href="#ic-chevron"/></svg></div>
            </a>`;
        });

        html += `</div></div>`; // end egrid + state-exam-panel
      });

      html += `</div>`; // end state-wrap

    } else {
      // ─── STANDARD CATEGORY PANEL ───
      html += `
        <div class="sub-panel-header">
          <div class="sub-panel-icon ${cfg.color}"><svg><use href="#${cfg.icon}"/></svg></div>
          <div>
            <div class="sub-panel-title">${cat}</div>
            <div class="sub-panel-desc">${catItems.length} exam${catItems.length !== 1 ? 's' : ''} in this category</div>
          </div>
          <div class="sub-panel-count">${catItems.length} exams</div>
        </div>
        <div class="sub-grid">`;

      catItems.forEach(exam => {
        const qc   = exam["Question Count"];
        const yr   = exam["Year"];
        const hasQ = qc && qc.trim() !== '';
        const hasY = yr && yr.trim() !== '';
        html += `
          <a class="sub-card" href="#">
            <div class="sub-card-header">
              <div class="sub-card-icon ${cfg.color}"><svg><use href="#${cfg.icon}"/></svg></div>
              <div class="sub-card-body">
                <div class="sub-card-name">${exam["Exam Name"] || '—'}</div>
                <div class="sub-card-tag">${exam["Conducting Body"] || ''}</div>
              </div>
              <div class="sub-card-arrow"><svg><use href="#ic-chevron"/></svg></div>
            </div>
            <div class="sub-card-details">
              <div class="detail-item">
                <span class="detail-label">Eligibility</span>
                <span class="detail-value">${exam["Eligibility"] || '—'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Frequency</span>
                <span class="detail-value">${exam["Frequency"] || '—'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Questions</span>
                <span class="detail-value ${hasQ ? 'has-data' : ''}">${hasQ ? qc : '—'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Year Range</span>
                <span class="detail-value ${hasY ? 'has-data' : ''}">${hasY ? yr : '—'}</span>
              </div>
            </div>
          </a>`;
      });

      html += `</div>`; // end sub-grid
    }

    html += `</div>`; // end sub-panel
  });

  html += `</div>`; // end tab-body
  contentArea.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════
//  RENDER — TECH TRACK
// ═══════════════════════════════════════════════════════════
function renderTechTrack(rawItems) {
  const items = rawItems.filter(d =>
    d["Track Name"] === "Tech Track" &&
    d["Topics and Domain Covered"] &&
    d["Topics and Domain Covered"] !== "Topics and Domain Covered"
  );

  const topicMap = new Map();
  items.forEach(d => {
    const key = `${d["Category"]}|${d["Topics and Domain Covered"]}`;
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        category: d["Category"],
        topic: d["Topics and Domain Covered"],
        questionCount: d["Question Count"] || '',
        subDomains: [],
      });
    }
    const entry = topicMap.get(key);
    const sd = (d["Sub-Domain"] || '').trim();
    if (sd && sd !== 'NO Sub-Domain' && !entry.subDomains.includes(sd)) {
      entry.subDomains.push(sd);
    }
    if (!entry.questionCount && d["Question Count"]) {
      entry.questionCount = d["Question Count"];
    }
  });

  const topics = [...topicMap.values()];
  const categories = [...new Set(topics.map(t => t.category))];

  let html = `<div class="tab-body"><div class="cat-list"><div class="cat-group-label">Sections</div>`;

  categories.forEach((cat, i) => {
    const topicsInCat = topics.filter(t => t.category === cat);
    const cfg = getCfg(cat);
    html += `
      <div class="cat-item ${i === 0 ? 'active' : ''}" onclick="switchCat(this,'${safeid('tech-' + cat)}')">
        <div class="cat-item-left">
          <div class="cat-icon-wrap ${cfg.color}"><svg><use href="#${cfg.icon}"/></svg></div>
          <div>
            <div class="cat-name">${cat}</div>
            <div class="cat-sub-count">${topicsInCat.length} topics</div>
          </div>
        </div>
        <span class="cat-arrow"><svg width="12" height="12"><use href="#ic-chevron"/></svg></span>
      </div>`;
  });
  html += `</div>`;

  categories.forEach((cat, i) => {
    const topicsInCat = topics.filter(t => t.category === cat);
    const cfg = getCfg(cat);
    const panelId = safeid('tech-' + cat);
    html += `
      <div class="sub-panel ${i === 0 ? 'active' : ''}" id="${panelId}">
        <div class="sub-panel-header">
          <div class="sub-panel-icon ${cfg.color}"><svg><use href="#${cfg.icon}"/></svg></div>
          <div>
            <div class="sub-panel-title">${cat}</div>
            <div class="sub-panel-desc">${topicsInCat.length} topics in this section</div>
          </div>
          <div class="sub-panel-count">${topicsInCat.length} topics</div>
        </div>
        <div class="sub-grid">`;

    topicsInCat.forEach(t => {
      const hasQ = t.questionCount && t.questionCount.trim() !== '';
      const subLabel = t.subDomains.length ? t.subDomains.join(', ') : null;
      html += `
        <a class="sub-card" href="#">
          <div class="sub-card-header">
            <div class="sub-card-icon ${cfg.color}"><svg><use href="#${cfg.icon}"/></svg></div>
            <div class="sub-card-body">
              <div class="sub-card-name">${t.topic}</div>
              ${subLabel ? `<div class="sub-card-tag">${subLabel}</div>` : ''}
            </div>
            <div class="sub-card-arrow"><svg><use href="#ic-chevron"/></svg></div>
          </div>
          <div class="sub-card-details" style="grid-template-columns:1fr;">
            <div class="detail-item">
              <span class="detail-label">Questions</span>
              <span class="detail-value ${hasQ ? 'has-data' : ''}">${hasQ ? t.questionCount : '—'}</span>
            </div>
          </div>
        </a>`;
    });

    html += `</div></div>`;
  });

  html += `</div>`;
  contentArea.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════
//  INTERACTIONS — TABS & CATEGORIES
// ═══════════════════════════════════════════════════════════
window.switchTab = function(track, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const data = loadedData[track.name] || [];
  if (track.type === 'tech') {
    renderTechTrack(data);
  } else {
    renderExamTrack(track.name, data);
  }
};

window.switchCat = function(item, panelId) {
  const catList = item.closest('.cat-list');
  catList.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
  item.classList.add('active');
  const tabBody = catList.closest('.tab-body');
  tabBody.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.classList.add('active');
    panel.querySelectorAll('.sub-card, .ecard').forEach(c => {
      c.style.animation = 'none';
      void c.offsetHeight;
      c.style.animation = '';
    });
  }
};

// ═══════════════════════════════════════════════════════════
//  INTERACTIONS — STATE PSC DRILL-DOWN
// ═══════════════════════════════════════════════════════════
window.openState = function(panelId, stateId, stateName) {
  const wrap = document.getElementById(`sw-${panelId}`);
  // Hide the state grid + search
  wrap.querySelector('.sgrid').classList.add('hidden');
  wrap.querySelector('.state-search-wrap').classList.add('hidden');
  // Show the state's exam panel
  const sep = document.getElementById(`sep-${panelId}-${stateId}`);
  if (sep) {
    sep.classList.remove('hidden');
    // Re-trigger card animations
    sep.querySelectorAll('.ecard').forEach(c => {
      c.style.animation = 'none';
      void c.offsetHeight;
      c.style.animation = '';
    });
  }
};

window.closeState = function(panelId) {
  const wrap = document.getElementById(`sw-${panelId}`);
  // Hide all exam panels
  wrap.querySelectorAll('.state-exam-panel').forEach(p => p.classList.add('hidden'));
  // Restore state grid
  wrap.querySelector('.sgrid').classList.remove('hidden');
  wrap.querySelector('.state-search-wrap').classList.remove('hidden');
  // Clear any search text
  const searchInput = wrap.querySelector('.state-search-wrap .state-search');
  if (searchInput) { searchInput.value = ''; filterStates(searchInput, panelId); }
};

window.filterStates = function(input, panelId) {
  const q = input.value.toLowerCase();
  const grid = document.getElementById(`sgrid-${panelId}`);
  if (!grid) return;
  grid.querySelectorAll('.sbtn').forEach(btn => {
    const name = (btn.dataset.state || '').toLowerCase();
    btn.style.display = name.includes(q) ? '' : 'none';
  });
};

window.filterStateExams = function(input, sepId) {
  const q = input.value.toLowerCase();
  const sep = document.getElementById(sepId);
  if (!sep) return;
  sep.querySelectorAll('.ecard').forEach(card => {
    const name = (card.querySelector('.ename')?.textContent || '').toLowerCase();
    card.style.display = name.includes(q) ? '' : 'none';
  });
};

// ═══════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════
function safeid(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '-');
}

// ═══════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════
loadAllTracks();