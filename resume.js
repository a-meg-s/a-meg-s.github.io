// ===== resume.js (JSON-driven) =====
let zIndexCounter = 10000;
let CV = null;

// ---------------------------
// Window Management
// ---------------------------
function openWindow(id) {
  const win = document.getElementById(id);
  const wrapper = document.getElementById("desktop-wrapper");
  if (!win || !wrapper) return;

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
}

const closeWindow = (id) => {
  const win = document.getElementById(id);
  if (win) win.style.display = "none";
};

// ---------------------------
// Content Loading
// ---------------------------
async function loadContent() {
  const res = await fetch("content.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load content.json (${res.status})`);
  CV = await res.json();

  // Optional: set document title / favicon from JSON if you want
  if (CV?.site?.title) document.title = CV.site.title;

  // NOTE: Changing favicon dynamically is optional; leaving your existing <link> is fine.
  // If you want to set it:
  // if (CV?.site?.favicon) {
  //   const link = document.querySelector('link[rel="icon"]');
  //   if (link) link.href = CV.site.favicon;
  // }
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
  // kind: "experience" | "projects"
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

  // Bind clicks -> Notepad content from JSON
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

  // Title bar is ~30px; give a little extra breathing room
  const safeTop = wrapperRect.top + 12;
  const safeLeft = wrapperRect.left + 12;
  const safeRight = wrapperRect.right - 12;
  const safeBottom = wrapperRect.bottom - 12;

  // Center in wrapper
  let top = wrapperRect.top + (wrapperRect.height - h) / 2;
  let left = wrapperRect.left + (wrapperRect.width - w) / 2;

  // Clamp so nothing clips
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
  } catch (e) {
    console.error(e);
  }

  openWindow("welcome-message");

  updateClock();
  setInterval(updateClock, 1000);

  document.querySelectorAll(".window").forEach(makeDraggable);

  const startButton = document.querySelector(".start-button");
  const startMenu = document.getElementById("start-menu");

  if (startButton && startMenu) {
    startButton.addEventListener("click", (e) => {
      e.stopPropagation();
      startMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
        startMenu.classList.add("hidden");
      }
    });
  }

  document.querySelectorAll(".window").forEach((win) => {
    win.addEventListener("mousedown", () => {
      win.style.zIndex = ++zIndexCounter;
    });
  });
});
