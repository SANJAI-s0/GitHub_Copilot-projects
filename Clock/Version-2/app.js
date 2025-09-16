// ---- Persistence ----
const STORAGE_KEY = "worldclock-v3";
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function loadState() {
  let d = localStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : { clocks: [], is24h: false };
}

// ---- UI State ----
let state = loadState();

// ---- DOM References ----
const grid = document.getElementById("clocks-grid");
const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const addBtn = document.getElementById("add-btn");
const toggle24h = document.getElementById("toggle-24h");
const toggleDark = document.getElementById("toggle-dark");
const titleEl = document.getElementById("title");

// ---- Utility ----
function getFlagEmoji(country) {
  // Use flagcdn.com for country flags, fallback to emoji
  const code = country && country.match(/[A-Za-z]{2,}/)
    ? country
      .replace(/&.+;/, '') // remove & or special
      .replace(/[^A-Za-z ]/g, '')
      .trim()
      .split(' ').pop() // last word
    : '';
  if (!code) return '';
  // Map country names to ISO codes for some special cases
  const isoMap = {
    'USA': 'us', 'UK': 'gb', 'United Kingdom': 'gb', 'Côte d’Ivoire': 'ci', 'South Korea': 'kr', 'North Korea': 'kp',
    'Vatican City': 'va', 'UAE': 'ae', 'Russia': 'ru', 'Palestine': 'ps', 'Czechia': 'cz', 'Vietnam': 'vn', 'Laos': 'la',
    'Ivory Coast': 'ci', 'Saint Martin': 'mf', 'Sint Maarten': 'sx', 'Kosovo': 'xk', 'Curacao': 'cw',
    'Hong Kong': 'hk', 'Macau': 'mo', 'Taiwan': 'tw', 'Timor-Leste': 'tl', 'United States': 'us',
    'Antigua & Barbuda': 'ag', 'Saint Kitts & Nevis': 'kn', 'Saint Lucia': 'lc', 'Saint Pierre & Miquelon': 'pm',
    'Saint Vincent & the Grenadines': 'vc', 'Trinidad & Tobago': 'tt', 'Sao Tome & Principe': 'st',
    'Bosnia & Herzegovina': 'ba', 'North Macedonia': 'mk', 'South Sudan': 'ss'
  };
  let cc = (isoMap[country] || code)
    .replace(/ /g, '_')
    .toLowerCase()
    .slice(0,2);
  // Use flagcdn.com PNG
  return `<img class="suggestion-flag" src="https://flagcdn.com/24x18/${cc}.png" alt="${country} flag" onerror="this.style.display='none'">`;
}

function getCityMatch(q) {
  if (!q) return [];
  let t = q.trim().toLowerCase();
  // Fuzzy match city, zone, or country (partial search)
  return CITIES.filter(
    c =>
      c.city.toLowerCase().includes(t) ||
      c.zone.toLowerCase().includes(t) ||
      (c.country && c.country.toLowerCase().includes(t))
  ).slice(0, 20);
}
function findCityObj(val) {
  let t = val.trim().toLowerCase();
  return CITIES.find(
    c =>
      c.city.toLowerCase() === t ||
      c.zone.toLowerCase() === t
  );
}
function cityDisplay(c) {
  return `${c.city} (${c.country})`;
}
function genId(zone) {
  return zone.replace(/[\/_]/g, "-");
}
function isDarkMode() {
  return document.documentElement.classList.contains("dark");
}

// ---- Suggestion Dropdown ----
let suggestIdx = -1;
search.addEventListener("input", e => {
  let q = search.value;
  let matches = getCityMatch(q);
  suggestions.innerHTML = "";
  if (!q || matches.length === 0) {
    suggestions.classList.add("hidden");
    return;
  }
  matches.forEach((c, idx) => {
    let li = document.createElement("li");
    li.className = "px-4 py-2 cursor-pointer hover:bg-cyan-800/60 flex items-center";
    li.innerHTML = `${getFlagEmoji(c.country)}<span>${cityDisplay(c)} <span class="text-xs ml-2 text-cyan-400/70">${c.zone}</span></span>`;
    li.addEventListener("mousedown", () => {
      search.value = c.city;
      suggestions.classList.add("hidden");
      search.focus();
    });
    suggestions.appendChild(li);
  });
  suggestions.classList.remove("hidden");
  suggestIdx = -1;
});
// Keyboard navigation for suggestions
search.addEventListener("keydown", e => {
  let items = Array.from(suggestions.children);
  if(!items.length) return;
  if(e.key === "ArrowDown") {
    suggestIdx = (suggestIdx + 1) % items.length;
    items.forEach(i=>i.classList.remove("bg-cyan-800/60"));
    items[suggestIdx].classList.add("bg-cyan-800/60");
    e.preventDefault();
  } else if(e.key === "ArrowUp") {
    suggestIdx = (suggestIdx - 1 + items.length) % items.length;
    items.forEach(i=>i.classList.remove("bg-cyan-800/60"));
    items[suggestIdx].classList.add("bg-cyan-800/60");
    e.preventDefault();
  } else if(e.key === "Enter" && suggestIdx > -1) {
    search.value = items[suggestIdx].textContent.replace(/\s?\(.+$/, "");
    suggestions.classList.add("hidden");
    addBtn.focus();
    e.preventDefault();
  }
});
document.addEventListener("click", e => {
  if (!search.contains(e.target) && !suggestions.contains(e.target)) {
    suggestions.classList.add("hidden");
  }
});

// ---- Add Clock ----
function handleAddClock() {
  let val = search.value.trim();
  let c = CITIES.find(ci => ci.city.toLowerCase() === val.toLowerCase() || ci.zone.toLowerCase() === val.toLowerCase());
  if (!c) {
    // Try partial match
    let matches = getCityMatch(val);
    if (matches.length) c = matches[0];
  }
  if (!c) {
    search.classList.add("ring-2", "ring-red-500");
    setTimeout(()=>search.classList.remove("ring-2", "ring-red-500"), 1000);
    return;
  }
  // Avoid duplicates
  if (state.clocks.some(z => z.zone === c.zone)) {
    search.value = "";
    return;
  }
  state.clocks.push({ city: c.city, zone: c.zone, country: c.country });
  saveState(state);
  search.value = "";
  renderClocks(true, c.zone); // Animate last added
}
addBtn.addEventListener("click", handleAddClock);
search.addEventListener("keypress", e => {
  if (e.key === "Enter") handleAddClock();
});

// ---- Remove Clock ----
function removeClock(zone) {
  let idx = state.clocks.findIndex(c => c.zone === zone);
  if (idx > -1) {
    // Animate out
    let el = document.getElementById("clock-" + genId(zone));
    gsap.to(el, { opacity: 0, y: 40, duration: 0.25, onComplete: () => {
      state.clocks.splice(idx,1);
      saveState(state);
      renderClocks();
    }});
  }
}

// ---- 12h/24h Toggle ----
toggle24h.checked = state.is24h;
toggle24h.addEventListener("change", () => {
  state.is24h = toggle24h.checked;
  saveState(state);
  renderClocks();
});

// ---- Dark/Light Mode Toggle ----
function setDarkMode(on) {
  document.documentElement.classList.toggle("dark", on);
  document.getElementById("moon").style.display = on ? "none" : "";
  document.getElementById("sun").style.display = on ? "" : "none";
}
// Initial mode
let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setDarkMode(localStorage.getItem("worldclock-dark") === "1" || (!("worldclock-dark" in localStorage) && prefersDark));
toggleDark.addEventListener("click", () => {
  let on = !isDarkMode();
  setDarkMode(on);
  localStorage.setItem("worldclock-dark", on ? "1" : "0");
});

// ---- Clock Rendering ----
let clockTimers = [];
function renderClocks(animateNew=false, newlyAddedZone="") {
  clockTimers.forEach(t => clearInterval(t));
  clockTimers = [];
  grid.innerHTML = "";
  if (!state.clocks.length) {
    let empty = document.createElement("div");
    empty.className = "col-span-full text-center text-cyan-400/60 py-10 italic";
    empty.innerHTML = "No clocks added. Search and add cities above!";
    grid.appendChild(empty);
    return;
  }
  state.clocks.forEach(({city,zone,country},i) => {
    let id = "clock-" + genId(zone);
    let card = document.createElement("div");
    card.className = `gsap-pop glass dark:glass-dark rounded-xl p-5 shadow-neon flex flex-col justify-between items-center relative group transition duration-200 select-none`;
    card.id = id;
    // Remove button
    let rmv = document.createElement("button");
    rmv.title = "Remove";
    rmv.className = "absolute top-2 right-2 opacity-70 group-hover:opacity-100 text-cyan-200 hover:text-red-400 text-xl font-bold transition-all";
    rmv.innerHTML = "&#10060;";
    rmv.addEventListener("click", ()=>removeClock(zone));
    card.appendChild(rmv);
    // City + flag
    let cityEl = document.createElement("div");
    cityEl.className = "text-2xl md:text-3xl font-bold mb-2 text-cyan-100 tracking-wide text-center drop-shadow flex items-center gap-2";
    cityEl.innerHTML = getFlagEmoji(country) + `<span>${city}</span>`;
    card.appendChild(cityEl);
    // Digital clock
    let timeEl = document.createElement("div");
    timeEl.className = "digital-time text-3xl md:text-4xl font-mono font-extrabold glow time-glow mb-1 transition-all";
    card.appendChild(timeEl);
    // Date
    let dateEl = document.createElement("div");
    dateEl.className = "text-md md:text-lg font-medium text-cyan-300/90 mb-2";
    card.appendChild(dateEl);
    // Country
    if (country) {
      let ct = document.createElement("div");
      ct.className = "text-xs text-cyan-400/70";
      ct.textContent = country;
      card.appendChild(ct);
    }
    // Timezone
    let zoneEl = document.createElement("div");
    zoneEl.className = "text-xs text-cyan-300/50 mt-1";
    zoneEl.textContent = zone;
    card.appendChild(zoneEl);
    grid.appendChild(card);
    if (animateNew && zone === newlyAddedZone) {
      gsap.fromTo(card, {opacity:0, scale:0.92, y:40}, {opacity:1, scale:1, y:0, duration:0.50, ease:"back.out(1.7)"});
    } else {
      gsap.fromTo(card, {opacity:0, scale:0.95, y:16}, {opacity:1, scale:1, y:0, delay:0.04*i, duration:0.45, ease:"power2.out"});
    }
    function updateClock() {
      let now = new Date();
      let opts = {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: !state.is24h, timeZone: zone
      };
      let timeStr = new Intl.DateTimeFormat('en-US', opts).format(now);
      timeEl.textContent = timeStr;
      gsap.to(timeEl, {
        keyframes: [
          { textShadow: "0 0 16px #0ff0fc, 0 0 24px #818cf8", filter: "brightness(1.18)", duration:0.18, ease:"power1.inOut" },
          { textShadow: "0 0 8px #0ff0fc, 0 0 20px #818cf8", filter:"brightness(1)", duration:0.5, ease:"power1.inOut"}
        ]
      });
      let dateFmt = new Intl.DateTimeFormat('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        timeZone: zone
      });
      dateEl.textContent = dateFmt.format(now);
    }
    updateClock();
    let t = setInterval(updateClock, 1000);
    clockTimers.push(t);
  });
}

// ---- GSAP Animations ----
window.addEventListener("DOMContentLoaded", ()=>{
  gsap.fromTo("#title", {opacity:0, scale:0.8, y:-32}, {opacity:1, scale:1, y:0, duration:0.9, ease:"expo.out"});
  document.querySelectorAll("footer a").forEach(a => {
    a.addEventListener("mouseenter", e => {
      gsap.to(a, {scale:1.16, textShadow:"0 0 8px #0ff0fc", duration:0.18});
    });
    a.addEventListener("mouseleave", e => {
      gsap.to(a, {scale:1, textShadow:"none", duration:0.18});
    });
  });
  renderClocks();
});