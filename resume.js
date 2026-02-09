// ===== resume.js (JSON-driven + enhanced Start Menu) =====
let zIndexCounter = 10000;
let CV = null;

// Start menu state
const recentApps = []; // ids
const RECENT_MAX = 4;

// ---------------------------
// Window Management
// ---------------------------
function openWindow(id) {
  const win = document.getElementById(id);
  const wrapper = document.getElementById("desktop-wrapper");
  if (!win || !wrapper) return;

  // open + center
  win.style.visibility = "hidden";
  win.style.display = "block";
  win.style.zIndex = ++zIndexCounter;

  requestAnimationFrame(() => {
    const w = win.offsetWidth;
    const h = win.offsetHeight;
    const rect = wrapper.getBoundingClientRect();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const top = Math.max(rect.top + (rect.height - h) / 2, 10);
    const left = Math.max(rect.left + (rect.width - w) / 2, 10);

    win.style.position = "fixed";
    win.style.top = `${Math.min(top, vh - 30)}px`;
    win.style.left = `${Math.min(left, vw - 30)}px`;
    win.style.visibility = "visible";

    // (Re)animate language bars after About is rendered + opened
    if (id === "about") initLanguageBars();
  });

  // Start menu: track & render recents + open highlights
  trackRecentApp(id);
  renderRecentApps();
  updateStartOpenHighlights();
}

const closeWindow = (id) => {
  const win = document.getElementById(id);
  if (win) win.style.display = "none";
  updateStartOpenHighlights();
};

// ---------------------------
// Content Loading
// ---------------------------
async function loadContent() {
  const res = await fetch("content.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load content.json (${res.status})`);
  CV = await res.json();

  if (CV?.site?.title) document.title = CV.site.title;
}

// ---------------------------
// Enhanced Start Menu helpers
// ---------------------------
function safeText(s, fallback = "") {
  return (typeof s === "string" && s.trim().length) ? s : fallback;
}

function trackRecentApp(id) {
  const blacklist = new Set(["welcome-message"]); // don't count the welcome modal
  if (!id || blacklist.has(id)) return;

  const idx = recentApps.indexOf(id);
  if (idx !== -1) recentApps.splice(idx, 1);
  recentApps.unshift(id);
  recentApps.splice(RECENT_MAX, recentApps.length - RECENT_MAX);
}

function renderStartHeader() {
  const avatar = document.getElementById("start-avatar");
  const nameEl = document.getElementById("start-name");
  const roleEl = document.getElementById("start-role");
  const statusEl = document.getElementById("start-status");

  if (!avatar && !nameEl && !roleEl && !statusEl) return;

  // Name: prefer JSON internet headerName, otherwise site.title
  const name =
    CV?.internet?.headerName ||
    CV?.site?.title ||
    "Andrea Sustic";

  // Role: derive from about.profile text, or hard fallback
  const role =
    CV?.startMenu?.role ||
    "Information & Cyber Security";

  // Avatar: prefer favicon, then internet.headerImage, then default
  const avatarSrc =
    CV?.startMenu?.avatar ||
    CV?.site?.favicon ||
    CV?.internet?.headerImage ||
    "img/pfp.png";

  if (nameEl) nameEl.textContent = name;
  if (roleEl) roleEl.textContent = role;
  if (avatar) avatar.src = avatarSrc;

  // Status: static for now, but easy to make dynamic later
  if (statusEl) statusEl.textContent = CV?.startMenu?.status || "● Online";
}

function renderRecentApps() {
  const host = document.getElementById("recent-apps");
  if (!host) return;

  if (recentApps.length === 0) {
    host.innerHTML = `<div class="menu-empty"><em>No recent apps.</em></div>`;
    return;
  }

  const labelMap = {
    about: "About Me",
    experience: "Experience",
    projects: "Projects",
    contact: "Contact",
    notepad: "Notepad",
    "task-manager": "Task Manager",
    "internet-browser": "Internet Explorer"
  };

  host.innerHTML = recentApps
    .map((id) => {
      const label = labelMap[id] || id;
      return `
        <div class="menu-item" role="menuitem" data-app-id="${id}" data-tip="Re-open ${label}"
             onclick="openWindow('${id === "internet-browser" ? "internet-browser" : id}');">
          ${label}
        </div>
      `;
    })
    .join("");
}

function updateStartOpenHighlights() {
  // highlight any menu items referencing visible windows
  const menu = document.getElementById("start-menu");
  if (!menu) return;

  const items = menu.querySelectorAll("[data-app-id]");
  items.forEach((el) => {
    const id = el.getAttribute("data-app-id");
    const win = id ? document.getElementById(id) : null;
    el.classList.toggle("is-open", !!win && isVisible(win));
  });
}

function closeStartMenu() {
  const startMenu = document.getElementById("start-menu");
  if (startMenu) startMenu.classList.add("hidden");
}

function toggleStartMenu() {
  const startMenu = document.getElementById("start-menu");
  if (!startMenu) return;
  startMenu.classList.toggle("hidden");
  if (!startMenu.classList.contains("hidden")) {
    renderStartHeader();
    renderRecentApps();
    updateStartOpenHighlights();
  }
}

// Quick Actions (wired from HTML)
function openCvDownload() {
  // If you add a PDF path later, set CV.startMenu.cvPdf = "info/CV.pdf"
  const pdf = CV?.startMenu?.cvPdf || "info/CV.pdf";
  window.open(pdf, "_blank", "noopener,noreferrer");
  closeStartMenu();
}

function openResumeTxt() {
  // Creates a small "Résumé.txt" on demand using existing JSON
  const name = CV?.internet?.headerName || CV?.site?.title || "Andrea";
  const skills = CV?.about?.skills?.text || "";
  const edu = CV?.about?.education?.html || "";
  const email = CV?.contact?.email?.address || "";
  const li = CV?.contact?.linkedin?.url || "";

  const lines = [
    `${name}`,
    "",
    "Summary:",
    stripHtml((CV?.welcome?.paragraphs || []).join(" ")).trim(),
    "",
    "Education:",
    stripHtml(edu).trim(),
    "",
    "Skills:",
    stripHtml(skills).trim(),
    "",
    "Links:",
    email ? `- Email: ${email}` : "",
    li ? `- LinkedIn: ${li}` : ""
  ].filter(Boolean);

  openNotepadWithText("Résumé.txt", lines.join("\n"));
  closeStartMenu();
}

function openNotepadWithText(title, text) {
  const notepad = document.getElementById("notepad");
  const titleEl = document.getElementById("notepad-title");
  const contentEl = document.getElementById("notepad-content");
  if (!notepad || !titleEl || !contentEl) return;

  titleEl.textContent = `${title} - Notepad`;
  contentEl.textContent = text;

  notepad.style.display = "block";
  notepad.style.zIndex = ++zIndexCounter;

  trackRecentApp("notepad");
  renderRecentApps();
  updateStartOpenHighlights();
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = String(html ?? "");
  return div.textContent || div.innerText || "";
}

// Keyboard support: Win key / Meta opens Start, Esc closes
function setupStartMenuKeyboard() {
  document.addEventListener("keydown", (e) => {
    const startMenu = document.getElementById("start-menu");
    if (!startMenu) return;

    // Escape closes
    if (e.key === "Escape") {
      closeStartMenu();
      return;
    }

    // Windows key / Meta key toggles (best-effort, browser-dependent)
    // Some browsers won't deliver "Meta" alone; also allow Ctrl+Esc like Windows.
    if (e.key === "Meta" || (e.ctrlKey && e.key === "Escape")) {
      e.preventDefault();
      toggleStartMenu();
    }
  });
}

// ---------------------------
// Renderers
// ---------------------------
function renderWelcome() {
  if (!CV?.welcome) return;

  const titleEl = document.getElementById("welcome-title");
  const host = document.getElementById("welcome-content");
  const btn = document.getElementById("welcome-ok");

  if (titleEl) titleEl.textContent = CV.welcome.title || titleEl.textContent;
  if (host) host.innerHTML = (CV.welcome.paragraphs || []).map((p) => `<p>${p}</p>`).join("");
  if (btn) btn.textContent = CV.welcome.button || btn.textContent || "OK";
}

function renderAbout() {
  if (!CV?.about) return;

  const a = CV.about;

  const titleEl = document.getElementById("about-title");
  const host = document.getElementById("about-content");
  if (titleEl) titleEl.textContent = a.windowTitle || titleEl.textContent;
  if (!host) return;

  const languagesHtml = (a.languages?.items || [])
    .map(
      (item) => `
      <div class="lang-item">
        <span class="lang-label">${item.label}</span>
        <div class="language-bar" data-percentage="${item.percentage}">
          <div class="bar-fill"></div>
        </div>
      </div>
    `
    )
    .join("");

  host.innerHTML = `
    <div class="profile-section">
      <img src="${a.profile?.image || ""}" alt="Profile Picture" class="profile-pic">
      <p>${a.profile?.text || ""}</p>
    </div>
    <hr>
    <h3>${a.education?.title || "Education"}</h3>
    <p>${a.education?.html || ""}</p>
    <hr>
    <h3>${a.skills?.title || "Skills"}</h3>
    <p>${a.skills?.text || ""}</p>
    <hr>
    <h3>${a.languages?.title || "Languages"}</h3>
    <div id="language-container">${languagesHtml}</div>
  `;
}

function renderContact() {
  if (!CV?.contact) return;

  const c = CV.contact;
  const titleEl = document.getElementById("contact-title");
  const host = document.getElementById("contact-content");
  if (titleEl) titleEl.textContent = c.windowTitle || titleEl.textContent;
  if (!host) return;

  const emailLabel = c.email?.label || "Contact:";
  const emailAddr = c.email?.address || "";
  const linkedinLabel = c.linkedin?.label || "LinkedIn:";
  const linkedinUrl = c.linkedin?.url || "#";
  const linkedinText = c.linkedin?.text || "LinkedIn";

  host.innerHTML = `
    <div class="profile-section">
      <img src="${c.image || ""}" alt="Profile Picture" class="profile-pic">
      <p>
        ${emailLabel}
        <a href="mailto:${emailAddr}">${emailAddr}</a>
        <br><br>
        ${linkedinLabel}
        <a href="${linkedinUrl}">${linkedinText}</a>
      </p>
    </div>
  `;
}

function renderExplorer(kind) {
  const data = CV?.explorers?.[kind];
  if (!data) return;

  const titleEl = document.getElementById(`${kind}-title`);
  const sidebar = document.getElementById(`${kind}-sidebar`);
  const grid = document.getElementById(`${kind}-grid`);
  const statusL = document.getElementById(`${kind}-status-left`);
  const statusR = document.getElementById(`${kind}-status-right`);

  if (titleEl) titleEl.textContent = data.windowTitle || titleEl.textContent;
  if (!sidebar || !grid) return;

  const items = Array.isArray(data.items) ? data.items : [];

  sidebar.innerHTML = items.map((it) => `<div class="sidebar-item">${it.label}</div>`).join("");

  grid.innerHTML = items
    .map(
      (it) => `
      <div id="${it.id}" class="file" data-kind="${kind}">
        <img src="${it.icon}" alt="${it.label}">
        <span>${it.label}</span>
      </div>
    `
    )
    .join("");

  if (statusL) statusL.textContent = data.statusLeft || `${items.length} items`;
  if (statusR) statusR.textContent = data.statusRight || "";

  grid.querySelectorAll(".file").forEach((file) => {
    file.addEventListener("click", () => openNotepadFromData(kind, file.id));
  });
}

function openNotepadFromData(kind, itemId) {
  const notepad = document.getElementById("notepad");
  const titleEl = document.getElementById("notepad-title");
  const contentEl = document.getElementById("notepad-content");

  const item = CV?.explorers?.[kind]?.items?.find((x) => x.id === itemId);
  if (!item || !notepad || !titleEl || !contentEl) return;

  titleEl.textContent = item.notepadTitle || item.label || "Untitled - Notepad";

  const bullets = (item.bullets || []).map((b) => `<li>${b}</li>`).join("");
  const links = (item.links || [])
    .map((l) => {
      const dl = l.download ? " download" : "";
      const href = l.href || "#";
      const text = l.text || href;
      return `<li><a href="${href}"${dl}>${text}</a></li>`;
    })
    .join("");

  contentEl.innerHTML = `<ul>${bullets}${links}</ul>`;

  notepad.style.display = "block";
  notepad.style.zIndex = ++zIndexCounter;

  trackRecentApp("notepad");
  renderRecentApps();
  updateStartOpenHighlights();
}

// ---------------------------
// Drag Functionality
// ---------------------------
const makeDraggable = (win) => {
  const bar = win.querySelector(".title-bar");
  if (!bar) return;

  let offsetX = 0;
  let offsetY = 0;

  const onMouseMove = (e) => {
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  bar.addEventListener("mousedown", (e) => {
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;

    win.style.zIndex = ++zIndexCounter;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
};

// ---------------------------
// Language Bars
// ---------------------------
const initLanguageBars = () => {
  document.querySelectorAll("#language-container .language-bar").forEach((bar) => {
    const fill = bar.querySelector(".bar-fill");
    const pct = bar.dataset.percentage;
    if (!fill) return;

    fill.style.width = "0%";
    setTimeout(() => {
      fill.style.width = `${pct}%`;
    }, 50);
  });
};

// ---------------------------
// Task Manager
// ---------------------------
function isVisible(win) {
  return (
    win.style.display !== "none" &&
    win.style.visibility !== "hidden" &&
    win.offsetWidth > 0 &&
    win.offsetHeight > 0
  );
}

function populateTaskList() {
  const list = document.getElementById("task-list");
  if (!list) return;

  list.innerHTML = "";

  document.querySelectorAll(".window").forEach((win) => {
    if (isVisible(win)) {
      const titleBar = win.querySelector(".title-bar-text");
      const title = titleBar ? titleBar.textContent : "Unnamed Window";
      const id = win.id;

      const entry = document.createElement("div");
      entry.classList.add("task-entry");
      entry.innerHTML = `
        <span>${title}</span>
        <button onclick="closeWindow('${id}'); populateTaskList();">❌ Close</button>
      `;
      list.appendChild(entry);
    }
  });

  if (list.innerHTML.trim() === "") {
    list.innerHTML = "<em>No open windows.</em>";
  }
}

// ---------------------------
// Clock
// ---------------------------
const updateClock = () => {
  const clock = document.getElementById("taskbar-clock");
  if (!clock) return;

  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ---------------------------
// Virus Effect
// ---------------------------
function triggerVirus() {
  let counter = 0;
  const maxAlerts = 20;
  const interval = setInterval(() => {
    if (counter >= maxAlerts) {
      clearInterval(interval);
      showStopVirusButton();
      return;
    }
    createFakeAlert(`System Error: 0x000${Math.floor(100 + Math.random() * 900)}DEAD`);
    counter++;
  }, 300);
}

function createFakeAlert(message) {
  const alertBox = document.createElement("div");
  alertBox.classList.add("window", "fake-virus-alert", "virus-popup");
  alertBox.style.zIndex = ++zIndexCounter;

  alertBox.innerHTML = `
    <div class="title-bar">
      <div class="title-bar-text">Alert</div>
      <div class="title-bar-controls">
        <button aria-label="Close" onclick="this.closest('.window').remove()">X</button>
      </div>
    </div>
    <div class="window-body"><p>${message}</p></div>
  `;

  document.body.appendChild(alertBox);

  const maxX = Math.max(10, window.innerWidth - 220);
  const maxY = Math.max(10, window.innerHeight - 120);

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  alertBox.style.left = `${x}px`;
  alertBox.style.top = `${y}px`;
  alertBox.style.display = "block";
}

function showStopVirusButton() {
  const button = document.createElement("button");
  button.textContent = "Stop Virus";
  button.className = "stop-virus-button";
  button.onclick = () => {
    document.querySelectorAll(".virus-popup").forEach((el) => el.remove());
    button.remove();
  };
  document.body.appendChild(button);
}

// ---------------------------
// Internet Explorer Window
// ---------------------------
function openInternetWindow() {
  const id = "internet-browser";
  const win = document.getElementById(id);
  const wrapper = document.getElementById("desktop-wrapper");
  if (!win || !wrapper) return;

  win.style.display = "block";
  win.style.visibility = "hidden";
  win.style.zIndex = ++zIndexCounter;

  requestAnimationFrame(() => {
    const w = win.offsetWidth;
    const h = win.offsetHeight;

    const wrapperRect = wrapper.getBoundingClientRect();

    const safeTop = wrapperRect.top + 12;
    const safeLeft = wrapperRect.left + 12;
    const safeRight = wrapperRect.right - 12;
    const safeBottom = wrapperRect.bottom - 12;

    let top = wrapperRect.top + (wrapperRect.height - h) / 2;
    let left = wrapperRect.left + (wrapperRect.width - w) / 2;

    top = Math.min(Math.max(top, safeTop), safeBottom - h);
    left = Math.min(Math.max(left, safeLeft), safeRight - w);

    win.style.position = "fixed";
    win.style.top = `${top}px`;
    win.style.left = `${left}px`;
    win.style.visibility = "visible";
  });

  const loader = document.getElementById("internet-loader");
  const iframe = document.getElementById("internet-iframe");
  if (!loader || !iframe) return;

  loader.style.display = "flex";
  loader.classList.remove("fade-out");
  iframe.style.display = "none";
  iframe.src = "";

  iframe.onload = () => {
    setTimeout(() => {
      loader.style.display = "none";
      iframe.style.display = "block";
    }, 400);
  };

  setTimeout(() => {
    iframe.src = "internet/cv.html";
  }, 300);

  trackRecentApp("internet-browser");
  renderRecentApps();
  updateStartOpenHighlights();
  closeStartMenu();
}

// ---------------------------
// Init
// ---------------------------
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadContent();

    renderWelcome();
    renderAbout();
    renderContact();
    renderExplorer("experience");
    renderExplorer("projects");

    // Start menu header pulls from JSON
    renderStartHeader();
    renderRecentApps();
  } catch (e) {
    console.error(e);
  }

  // Open welcome
  openWindow("welcome-message");

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Draggable windows
  document.querySelectorAll(".window").forEach(makeDraggable);

  // Start menu open/close
  const startButton = document.querySelector(".start-button");
  const startMenu = document.getElementById("start-menu");

  if (startButton && startMenu) {
    startButton.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleStartMenu();
    });

    // Clicking anywhere else closes it
    document.addEventListener("click", (e) => {
      if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
        closeStartMenu();
      }
    });
  }

  // Keyboard shortcuts
  setupStartMenuKeyboard();

  // Bring-to-front behavior + update open highlights
  document.querySelectorAll(".window").forEach((win) => {
    win.addEventListener("mousedown", () => {
      win.style.zIndex = ++zIndexCounter;
      updateStartOpenHighlights();
    });
  });

  // Seed recents based on initial desktop icons (optional)
  // (keeps Recent from being empty on first load)
  // recentApps.push("about", "projects");
  // renderRecentApps();
});
