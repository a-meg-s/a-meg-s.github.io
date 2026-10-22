// ===== resume.js: desktop shell (Windows 98 look) =====
// Shared pieces used by mobile.js: window.CVSite (content loader + helpers).
"use strict";

(function () {
  const CVSite = {
    data: null,
    async load() {
      if (this.data) return this.data;
      const res = await fetch("content.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load content.json (${res.status})`);
      this.data = await res.json();
      if (this.data?.site?.title) document.title = this.data.site.title;
      return this.data;
    },
    esc(s) {
      return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },
    stripHtml(html) {
      const div = document.createElement("div");
      div.innerHTML = String(html ?? "");
      return div.textContent || "";
    },
    isPhone() {
      return window.matchMedia("(max-width: 759px)").matches;
    },
    reducedMotion() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },
    // Only http(s) and mailto links are rendered as links.
    safeHref(href) {
      const h = String(href ?? "").trim();
      if (/^(https?:\/\/|mailto:)/i.test(h)) return h;
      if (/^[a-z0-9_./-]+$/i.test(h) && !h.startsWith("/") && !h.includes("..")) return h;
      return "#";
    },
    mailtoCv(contact) {
      const req = contact?.cvRequest || {};
      const addr = contact?.email?.address || "";
      const subject = encodeURIComponent(req.subject || "CV request");
      const body = encodeURIComponent(req.body || "");
      return `mailto:${addr}?subject=${subject}&body=${body}`;
    },
    // Fake alert messages for the "virus" prank. Shared by desktop and phone.
    alertPool: [
      "battery 1%",
      "this is fine",
      "modem on fire",
      "SIM not found",
      "ACCESS DENIED",
      "0x0DEAD: stack smashed",
      "memory leak detected, bucket needed",
      "keyboard not found, press F1 to continue",
      "rm -rf / ... are you sure? (y)",
      "mouse has escaped",
      "printer is jealous of the scanner",
      "sudo make me a sandwich",
      "certificate expired in 1999",
      "firewall is now a fireplace",
      "dial-up carrier lost, please scream into modem",
      "have you tried turning it off and on again",
      "password is 'password'",
      "downloading more RAM ...",
      "coffee.exe has stopped responding",
      "port 1337 open, probably fine",
      "antivirus is on a coffee break",
      "unexpected ; on line 1",
      "cookies deleted, crumbs remain",
      "the cloud is just someone else's computer",
      "core dumped on the floor",
      "CPU is thinking about it",
      "404: motivation not found",
      "Y2K was postponed to tonight",
      "hard drive is now a soft drive",
      "task failed successfully",
      "please insert disk 2 of 1",
      "fan speed: maximum drama",
      "your toaster has joined the botnet",
      "hacker voice: I'm in",
      "null pointer, pointing at you",
      "ransomware installed. just kidding. unless?",
      "packet lost, last seen near router",
      "incognito mode is not that incognito",
      "update available: 1 of 847",
      "backup completed (to /dev/null)",
      "the intern touched production",
      "AI assistant has become self-aware, asks for coffee",
      "two-factor: please also send a fax",
      "scanning for viruses ... found 1, it's this one",
      "this popup is powered by your CPU fan",
      "encryption key stored under the keyboard",
      "pentest complete: everything is a finding",
      "red team won, blue team ordered pizza",
      "nmap says hi",
      "your IP is 127.0.0.1, we are coming",
      "shell obtained, no shell found",
      "report due yesterday",
      "clipboard contains your password, probably",
      "Windows has encountered a problem and needs to close.",
      "This program has performed an illegal operation and will be shut down.",
      "Explorer caused an invalid page fault in module KERNEL32.DLL at 0167:BFF9A5D0.",
      "A fatal exception 0E has occurred at 0028:C0011E36.",
      "Not enough memory to complete this operation.",
      "Your system is low on virtual memory.",
      "Error 0x80070057: The parameter is incorrect.",
      "The application failed to initialize properly (0xc0000135).",
      "A required .DLL file, MSVCRT.DLL, was not found.",
      "NTLDR is missing. Press any key to restart.",
      "General protection fault in module USER.EXE.",
      "Abort, Retry, Fail?",
      "Keyboard error or no keyboard present.",
      "Disk C: is full. Delete some files and try again.",
      "Unhandled exception at 0x7C812AFB in winlogon.exe.",
      "The system is dangerously low on resources.",
      "Connection reset by peer.",
      "No route to host.",
      "Buffer overrun detected. The program cannot safely continue.",
      "Stack overflow at line 0.",
      "Windows Update failed: 0x8024402C.",
      "A device attached to the system is not functioning.",
      "Unable to locate DLL: WSOCK32.DLL",
      "Access violation at address 0040B1F2. Read of address 00000000.",
      "The network path was not found.",
      "Certificate validation failed: self-signed by 'definitely-microsoft'.",
      "Credential Manager stopped responding."
    ],
    alertTitles: ["Alert", "Warning", "Critical", "Totally Legit Antivirus", "System", "Oops", "Error", "Windows", "Explorer"],
    _alertQueue: [],
    nextAlert() {
      if (!this._alertQueue.length) {
        this._alertQueue = this.alertPool.slice();
        for (let i = this._alertQueue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this._alertQueue[i], this._alertQueue[j]] = [this._alertQueue[j], this._alertQueue[i]];
        }
      }
      return this._alertQueue.pop();
    },
    nextAlertTitle() {
      return this.alertTitles[Math.floor(Math.random() * this.alertTitles.length)];
    },
    resumeText(CV) {
      const site = CV?.site || {};
      const about = CV?.about || {};
      const lines = [];
      lines.push(site.name || site.title || "Andrea Megan Sustic");
      if (site.role) lines.push(site.role + (site.location ? `, ${site.location}` : ""));
      lines.push("");
      lines.push("Summary");
      lines.push(this.stripHtml((CV?.welcome?.paragraphs || [])[0] || "").trim());
      lines.push("");
      lines.push("Experience");
      (CV?.explorers?.experience?.items || []).forEach((it) => {
        lines.push(`- ${this.stripHtml(it.notepadTitle || it.label)}${it.meta ? ` (${it.meta})` : ""}`);
      });
      lines.push("");
      lines.push("Education");
      lines.push(this.stripHtml(about.education?.html || "").replace(/\s*\n\s*/g, "\n").trim());
      (about.awards?.items || []).forEach((a) => {
        lines.push(`- ${this.stripHtml(a.name)}`);
      });
      lines.push("");
      lines.push("Skills");
      lines.push(this.stripHtml(about.skills?.text || ""));
      lines.push("");
      lines.push("Languages");
      (about.languages?.items || []).forEach((l) => lines.push(`- ${l.label}`));
      lines.push("");
      lines.push("Contact");
      if (CV?.contact?.email?.address) lines.push(`- Email: ${CV.contact.email.address}`);
      if (CV?.contact?.linkedin?.url) lines.push(`- LinkedIn: ${CV.contact.linkedin.url}`);
      return lines.join("\n");
    }
  };
  window.CVSite = CVSite;
})();

(function () {
  const CVSite = window.CVSite;
  let CV = null;
  let zIndexCounter = 10000;

  const recentApps = [];
  const RECENT_MAX = 4;
  const windowOrder = []; // ids, last = top-most

  const LABELS = {
    about: "About Me",
    experience: "Experience",
    projects: "Projects",
    contact: "Contact",
    notepad: "Notepad",
    snake: "snake.exe",
    invaders: "invaders.exe",
    "task-manager": "Task Manager",
    "internet-browser": "Internet Explorer",
    "welcome-message": "Welcome"
  };

  const $ = (id) => document.getElementById(id);

  // ---------------------------
  // Window management
  // ---------------------------
  function isOpen(win) {
    return win.classList.contains("open") && !win.classList.contains("minimized");
  }

  function bringToFront(id) {
    const win = $(id);
    if (!win) return;
    win.style.zIndex = ++zIndexCounter;
    const idx = windowOrder.indexOf(id);
    if (idx !== -1) windowOrder.splice(idx, 1);
    windowOrder.push(id);
    document.querySelectorAll(".window.open").forEach((w) => w.classList.toggle("inactive", w.id !== id));
    // a game that loses focus pauses instead of playing on behind another window
    if (id !== "snake" && window.SnakeGame?.isRunning()) window.SnakeGame.pause();
    if (id !== "invaders" && window.InvadersGame?.isRunning()) window.InvadersGame.pause();
    renderTaskbar();
    updateStartOpenHighlights();
  }

  function centerWindow(win) {
    const wrapper = $("desktop-wrapper");
    const rect = wrapper.getBoundingClientRect();
    const w = win.offsetWidth;
    const h = win.offsetHeight;
    const top = rect.top + Math.max((rect.height - 40 - h) / 2, 8);
    const left = rect.left + Math.max((rect.width - w) / 2, 8);
    win.style.top = `${Math.round(top)}px`;
    win.style.left = `${Math.round(left)}px`;
  }

  function openWindow(id, opts = {}) {
    const win = $(id);
    if (!win) return;

    const wasOpen = win.classList.contains("open");
    win.classList.remove("minimized");
    win.classList.add("open");

    if (!wasOpen || opts.recenter) {
      win.style.visibility = "hidden";
      requestAnimationFrame(() => {
        centerWindow(win);
        win.style.visibility = "visible";
        if (id === "about") initLanguageBars();
        if (opts.focus !== false) focusFirst(win);
      });
    } else {
      if (id === "about") initLanguageBars();
      if (opts.focus !== false) focusFirst(win);
    }

    bringToFront(id);
    trackRecentApp(id);
    renderRecentApps();

    if (id === "task-manager") populateTaskList();
    if (id === "snake" && window.SnakeGame) window.SnakeGame.mount("desktop");
    if (id === "invaders" && window.InvadersGame) window.InvadersGame.mount("desktop");

  }

  // Focus the most useful control in a window, in priority order.
  function focusFirst(win) {
    const order = [".sidebar-item", ".window-body button", ".window-body [tabindex]", ".window-body a", ".title-bar-controls button"];
    for (const sel of order) {
      const el = win.querySelector(sel);
      if (el) {
        el.focus({ preventScroll: true });
        return;
      }
    }
  }

  function closeWindow(id) {
    const win = $(id);
    if (!win) return;
    win.classList.remove("open", "minimized");
    const idx = windowOrder.indexOf(id);
    if (idx !== -1) windowOrder.splice(idx, 1);
    if (id === "internet-browser") {
      const iframe = $("internet-iframe");
      if (iframe) iframe.src = "about:blank";
    }
    if (id === "snake" && window.SnakeGame) window.SnakeGame.stop();
    if (id === "invaders" && window.InvadersGame) window.InvadersGame.stop();
    const topId = windowOrder[windowOrder.length - 1];
    if (topId) bringToFront(topId);
    renderTaskbar();
    updateStartOpenHighlights();
    restoreFocus(topId);
  }

  // After a window closes or minimizes, keyboard focus goes to the next window or back to the desktop.
  function restoreFocus(nextId) {
    const next = nextId ? $(nextId) : null;
    if (next) {
      focusFirst(next);
      return;
    }
    const firstIcon = document.querySelector(".desktop .icon");
    if (firstIcon) firstIcon.focus({ preventScroll: true });
  }

  function minimizeWindow(id) {
    const win = $(id);
    if (!win) return;
    win.classList.add("minimized");
    const idx = windowOrder.indexOf(id);
    if (idx !== -1) windowOrder.splice(idx, 1);
    if (id === "snake" && window.SnakeGame) window.SnakeGame.pause();
    if (id === "invaders" && window.InvadersGame) window.InvadersGame.pause();
    const topId = windowOrder[windowOrder.length - 1];
    if (topId) bringToFront(topId);
    renderTaskbar();
    updateStartOpenHighlights();
    restoreFocus(topId);
  }

  function topWindowId() {
    return windowOrder[windowOrder.length - 1] || null;
  }

  // ---------------------------
  // Taskbar
  // ---------------------------
  function renderTaskbar() {
    const host = $("taskbar-windows");
    if (!host) return;
    const topId = topWindowId();
    const wins = Array.from(document.querySelectorAll(".window.open")).filter((w) => w.id && w.id !== "welcome-message");

    host.innerHTML = wins
      .map((w) => {
        const title = w.querySelector(".title-bar-text")?.textContent || LABELS[w.id] || w.id;
        const minimized = w.classList.contains("minimized");
        const active = w.id === topId && !minimized;
        return `<button type="button" class="task-button${active ? " active" : ""}${minimized ? " minimized" : ""}"
                  data-task="${CVSite.esc(w.id)}" title="${CVSite.esc(title)}"
                  aria-pressed="${active}">${CVSite.esc(title)}</button>`;
      })
      .join("");
  }

  function onTaskButton(id) {
    const win = $(id);
    if (!win) return;
    if (win.classList.contains("minimized")) {
      openWindow(id);
    } else if (topWindowId() === id) {
      minimizeWindow(id);
    } else {
      bringToFront(id);
    }
  }

  // ---------------------------
  // Start menu
  // ---------------------------
  function trackRecentApp(id) {
    if (!id || id === "welcome-message") return;
    const idx = recentApps.indexOf(id);
    if (idx !== -1) recentApps.splice(idx, 1);
    recentApps.unshift(id);
    recentApps.splice(RECENT_MAX, recentApps.length - RECENT_MAX);
  }

  function renderStartHeader() {
    const name = CV?.site?.name || CV?.internet?.headerName || CV?.site?.title || "Andrea Sustic";
    const role = CV?.site?.role || "Security Analyst";
    const avatarSrc = CV?.site?.favicon || CV?.internet?.headerImage || "img/pfp.png";
    if ($("start-name")) $("start-name").textContent = name;
    if ($("start-role")) $("start-role").textContent = role;
    if ($("start-avatar")) $("start-avatar").src = CVSite.safeHref(avatarSrc);
    const li = $("start-linkedin");
    if (li && CV?.contact?.linkedin?.url) li.href = CVSite.safeHref(CV.contact.linkedin.url);
  }

  function renderRecentApps() {
    const host = $("recent-apps");
    if (!host) return;
    if (recentApps.length === 0) {
      host.innerHTML = `<div class="menu-empty"><em>No recent programs.</em></div>`;
      return;
    }
    host.innerHTML = recentApps
      .map((id) => {
        const label = LABELS[id] || id;
        const action = id === "internet-browser" ? `data-action="internet"` : `data-open="${CVSite.esc(id)}"`;
        return `<button type="button" class="menu-item compact" role="menuitem" data-app-id="${CVSite.esc(id)}" ${action}>${CVSite.esc(label)}</button>`;
      })
      .join("");
  }

  function updateStartOpenHighlights() {
    const menu = $("start-menu");
    if (!menu) return;
    menu.querySelectorAll("[data-app-id]").forEach((el) => {
      const id = el.getAttribute("data-app-id");
      const win = id ? $(id) : null;
      el.classList.toggle("is-open", !!win && isOpen(win));
    });
  }

  function setStartMenu(open) {
    const menu = $("start-menu");
    const btn = document.querySelector(".start-button");
    if (!menu) return;
    menu.classList.toggle("hidden", !open);
    if (btn) btn.setAttribute("aria-expanded", String(open));
    if (open) {
      renderStartHeader();
      renderRecentApps();
      updateStartOpenHighlights();
      const first = menu.querySelector("[role=menuitem]");
      if (first) first.focus();
    }
  }

  function toggleStartMenu() {
    const menu = $("start-menu");
    setStartMenu(menu.classList.contains("hidden"));
  }

  // ---------------------------
  // Notepad helpers
  // ---------------------------
  function openNotepad(title, html, opts = {}) {
    const titleEl = $("notepad-title");
    const contentEl = $("notepad-content");
    if (!titleEl || !contentEl) return;
    titleEl.textContent = `${title} - Notepad`;
    contentEl.innerHTML = html;
    openWindow("notepad", { recenter: opts.recenter });
    renderTaskbar();
  }

  function openResumeTxt() {
    const text = CVSite.resumeText(CV);
    openNotepad("Resume.txt", `<pre>${CVSite.esc(text)}</pre>`);
  }

  function openNotepadFromData(kind, itemId) {
    const item = CV?.explorers?.[kind]?.items?.find((x) => x.id === itemId);
    if (!item) return;

    const meta = item.meta ? `<p class="notepad-meta">${CVSite.esc(item.meta)}</p>` : "";
    const bullets = (item.bullets || []).map((b) => `<li>${b}</li>`).join("");
    const links = (item.links || [])
      .map((l) => {
        const href = CVSite.safeHref(l.href);
        const external = /^https?:/i.test(href);
        const attrs = [
          l.download ? " download" : "",
          external ? ' target="_blank" rel="noopener noreferrer"' : ""
        ].join("");
        return `<li><a href="${CVSite.esc(href)}"${attrs}>${CVSite.esc(l.text || href)}</a></li>`;
      })
      .join("");

    openNotepad(item.notepadTitle || item.label || "Untitled", `${meta}<ul>${bullets}${links}</ul>`);
    setActiveExplorerItem(kind, itemId);
  }

  function setActiveExplorerItem(kind, itemId) {
    document.querySelectorAll(`#${kind}-sidebar .sidebar-item, #${kind}-grid .file`).forEach((el) => {
      el.classList.toggle("is-active", el.dataset.item === itemId);
    });
    const statusL = $(`${kind}-status-left`);
    const item = CV?.explorers?.[kind]?.items?.find((x) => x.id === itemId);
    if (statusL && item) statusL.textContent = `Viewing: ${CVSite.stripHtml(item.label)}`;
  }

  // ---------------------------
  // Renderers
  // ---------------------------
  function renderWelcome() {
    if (!CV?.welcome) return;
    if ($("welcome-title")) $("welcome-title").textContent = CV.welcome.title || "";
    if ($("welcome-content")) $("welcome-content").innerHTML = (CV.welcome.paragraphs || []).map((p) => `<p>${p}</p>`).join("");
    if ($("welcome-ok")) $("welcome-ok").textContent = CV.welcome.button || "OK";
  }

  function renderAbout() {
    const a = CV?.about;
    if (!a) return;
    if ($("about-title")) $("about-title").textContent = a.windowTitle || "About Me";
    const host = $("about-content");
    if (!host) return;

    const languagesHtml = (a.languages?.items || [])
      .map(
        (item) => `
        <div class="lang-item">
          <span class="lang-label">${CVSite.esc(item.label)}</span>
          <div class="language-bar" data-percentage="${Number(item.percentage) || 0}" role="img" aria-label="${CVSite.esc(item.label)}">
            <div class="bar-fill"></div>
          </div>
        </div>`
      )
      .join("");

    const awardsHtml = (a.awards?.items || [])
      .map((aw) => {
        const links = (aw.links || [])
          .map((l) => `<li><a href="${CVSite.esc(CVSite.safeHref(l.href))}" target="_blank" rel="noopener noreferrer">${CVSite.esc(l.text)}</a></li>`)
          .join("");
        return `
        <div class="award">
          <img class="award-ribbon" src="img/important.png" alt="" />
          <div>
            <strong>${CVSite.esc(aw.name)}</strong>
            <p>${CVSite.esc(aw.for)}</p>
            ${aw.thesis ? `<p>${CVSite.esc(aw.thesis)}</p>` : ""}
            ${links ? `<ul>${links}</ul>` : ""}
          </div>
        </div>`;
      })
      .join("");

    host.innerHTML = `
      <div class="profile-section">
        <img src="${CVSite.esc(CVSite.safeHref(a.profile?.image || ""))}" alt="Portrait of Andrea" class="profile-pic">
        <p>${a.profile?.text || ""}</p>
      </div>
      <hr>
      <h3>${CVSite.esc(a.education?.title || "Education")}</h3>
      <p>${a.education?.html || ""}</p>
      ${awardsHtml ? `<hr><h3>${CVSite.esc(a.awards?.title || "Awards")}</h3>${awardsHtml}` : ""}
      <hr>
      <h3>${CVSite.esc(a.skills?.title || "Skills")}</h3>
      <p>${a.skills?.text || ""}</p>
      <hr>
      <h3>${CVSite.esc(a.languages?.title || "Languages")}</h3>
      <div id="language-container">${languagesHtml}</div>
    `;
  }

  function renderContact() {
    const c = CV?.contact;
    if (!c) return;
    if ($("contact-title")) $("contact-title").textContent = c.windowTitle || "Contact";
    const host = $("contact-content");
    if (!host) return;

    const email = c.email?.address || "";
    const li = CVSite.safeHref(c.linkedin?.url || "#");
    host.innerHTML = `
      <div class="profile-section">
        <img src="${CVSite.esc(CVSite.safeHref(c.image || ""))}" alt="Portrait of Andrea" class="profile-pic">
        <div>
          <p>${CVSite.esc(c.intro || "")}</p>
          <ul class="contact-list">
            <li>${CVSite.esc(c.email?.label || "Email:")} <a href="mailto:${CVSite.esc(email)}">${CVSite.esc(email)}</a></li>
            <li>${CVSite.esc(c.linkedin?.label || "LinkedIn:")} <a href="${CVSite.esc(li)}" target="_blank" rel="noopener noreferrer">${CVSite.esc(c.linkedin?.text || "LinkedIn")}</a></li>
          </ul>
        </div>
      </div>
      <div class="contact-note">
        <strong>${CVSite.esc(c.cvRequest?.label || "Request my CV")}</strong>
        <p>${CVSite.esc(c.cvRequest?.note || "")}</p>
        <a class="request-btn" id="request-cv-link" href="${CVSite.esc(CVSite.mailtoCv(c))}">Email me for the CV</a>
      </div>
    `;
  }

  function renderExplorer(kind) {
    const data = CV?.explorers?.[kind];
    if (!data) return;
    if ($(`${kind}-title`)) $(`${kind}-title`).textContent = data.windowTitle || kind;
    const sidebar = $(`${kind}-sidebar`);
    const grid = $(`${kind}-grid`);
    if (!sidebar || !grid) return;

    const items = Array.isArray(data.items) ? data.items : [];

    sidebar.innerHTML =
      `<div class="sidebar-title">${CVSite.esc(data.windowTitle || kind)}</div>` +
      items
        .map((it) => `<button type="button" class="sidebar-item" data-kind="${kind}" data-item="${CVSite.esc(it.id)}">${CVSite.esc(it.label)}</button>`)
        .join("");

    grid.innerHTML = items
      .map(
        (it) => `
        <button type="button" class="file" data-kind="${kind}" data-item="${CVSite.esc(it.id)}">
          <img src="${CVSite.esc(CVSite.safeHref(it.icon))}" alt="">
          <span>${CVSite.esc(it.label)}</span>
        </button>`
      )
      .join("");

    if ($(`${kind}-status-left`)) $(`${kind}-status-left`).textContent = data.statusLeft || `${items.length} items`;
    if ($(`${kind}-status-right`)) $(`${kind}-status-right`).textContent = data.statusRight || "";
  }

  // ---------------------------
  // Dragging (pointer events: mouse, pen, touch)
  // ---------------------------
  function makeDraggable(win) {
    const bar = win.querySelector(".title-bar");
    if (!bar) return;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    const onMove = (e) => {
      if (!dragging) return;
      const wrapper = $("desktop-wrapper").getBoundingClientRect();
      const maxLeft = wrapper.right - 60;
      const maxTop = wrapper.bottom - 60;
      const left = Math.min(Math.max(e.clientX - offsetX, wrapper.left - win.offsetWidth + 60), maxLeft);
      const top = Math.min(Math.max(e.clientY - offsetY, wrapper.top), maxTop);
      win.style.left = `${left}px`;
      win.style.top = `${top}px`;
    };

    const onUp = (e) => {
      dragging = false;
      try { bar.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    };

    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      dragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      bringToFront(win.id);
      try { bar.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    });
    bar.addEventListener("pointermove", onMove);
    bar.addEventListener("pointerup", onUp);
    bar.addEventListener("pointercancel", onUp);
  }

  // ---------------------------
  // Language bars
  // ---------------------------
  function initLanguageBars() {
    document.querySelectorAll("#language-container .language-bar").forEach((bar) => {
      const fill = bar.querySelector(".bar-fill");
      if (!fill) return;
      const pct = Math.min(100, Math.max(0, Number(bar.dataset.percentage) || 0));
      if (CVSite.reducedMotion()) {
        fill.style.width = `${pct}%`;
        return;
      }
      fill.style.width = "0%";
      setTimeout(() => { fill.style.width = `${pct}%`; }, 50);
    });
  }

  // ---------------------------
  // Task manager
  // ---------------------------
  function populateTaskList() {
    const list = $("task-list");
    if (!list) return;
    const wins = Array.from(document.querySelectorAll(".window.open")).filter((w) => w.id !== "task-manager");
    if (wins.length === 0) {
      list.innerHTML = "<em>No open windows.</em>";
      return;
    }
    list.innerHTML = wins
      .map((win) => {
        const title = win.querySelector(".title-bar-text")?.textContent || "Unnamed window";
        const state = win.classList.contains("minimized") ? " (minimized)" : "";
        return `<div class="task-entry">
          <span>${CVSite.esc(title)}${state}</span>
          <button type="button" data-close="${CVSite.esc(win.id)}">End task</button>
        </div>`;
      })
      .join("");
  }

  // ---------------------------
  // Clock
  // ---------------------------
  function updateClock() {
    const now = new Date();
    const t = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const c = $("taskbar-clock");
    if (c) c.textContent = t;
    const p = $("phone-clock");
    if (p) p.textContent = t;
  }

  // ---------------------------
  // Fake virus
  // ---------------------------
  function triggerVirus() {
    const maxAlerts = CVSite.isPhone() ? 12 : 32;
    let counter = 0;
    const interval = setInterval(() => {
      if (counter >= maxAlerts) {
        clearInterval(interval);
        showStopVirusButton();
        return;
      }
      const msg = counter % 4 === 0
        ? `System Error: 0x000${Math.floor(100 + Math.random() * 900)}DEAD`
        : CVSite.nextAlert();
      createFakeAlert(msg, CVSite.nextAlertTitle());
      counter++;
    }, 220);
  }

  function createFakeAlert(message, title = "Alert") {
    const alertBox = document.createElement("div");
    alertBox.className = "window fake-virus-alert virus-popup";
    alertBox.style.zIndex = ++zIndexCounter;
    alertBox.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-text">${CVSite.esc(title)}</div>
        <div class="title-bar-controls">
          <button aria-label="Close" data-remove-popup>X</button>
        </div>
      </div>
      <div class="window-body"><p>${CVSite.esc(message)}</p></div>`;
    document.body.appendChild(alertBox);
    const x = Math.floor(Math.random() * Math.max(10, window.innerWidth - 230));
    const y = Math.floor(Math.random() * Math.max(10, window.innerHeight - 130));
    alertBox.style.left = `${x}px`;
    alertBox.style.top = `${y}px`;
  }

  function showStopVirusButton() {
    if (document.querySelector(".stop-virus-button")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Stop Virus";
    button.className = "stop-virus-button";
    button.addEventListener("click", () => {
      document.querySelectorAll(".virus-popup").forEach((el) => el.remove());
      button.remove();
    });
    document.body.appendChild(button);
    button.focus();
  }

  // ---------------------------
  // Internet Explorer window
  // ---------------------------
  function openInternetWindow() {
    openWindow("internet-browser");
    const loader = $("internet-loader");
    const iframe = $("internet-iframe");
    if (!loader || !iframe) return;
    loader.classList.add("visible");
    iframe.onload = () => {
      if (iframe.src.endsWith("about:blank")) return;
      setTimeout(() => loader.classList.remove("visible"), 400);
    };
    setTimeout(() => { iframe.src = "internet/cv.html"; }, 300);
  }

  // ---------------------------
  // Boot screen
  // ---------------------------
  function runBootScreen() {
    const screen = $("boot-screen");
    const text = $("boot-text");
    if (!screen || !text) return Promise.resolve();

    const seen = (() => { try { return sessionStorage.getItem("booted") === "1"; } catch (_) { return false; } })();
    if (seen || CVSite.reducedMotion()) {
      screen.classList.add("hidden");
      return Promise.resolve();
    }

    const name = CV?.site?.name || "Andrea M. Sustic";
    const lines = [
      "SUSTIC BIOS (C) 2026, Build 10.22",
      "CPU: Pentium II 400 MHz, Security Extensions enabled",
      "Memory test: 65536 KB OK",
      "",
      "Detecting IDE drives ...",
      "  Primary master  : CV_DISK  (content.json)",
      "  Primary slave   : PROJECTS (7 items)",
      "  Secondary master: EXPERIENCE (6 items)",
      "",
      "Verifying Content Security Policy ... OK",
      "Verifying first-party assets ........ OK",
      "",
      `Booting ${name} desktop`
    ];

    return new Promise((resolve) => {
      let i = 0;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearInterval(timer);
        screen.classList.add("hidden");
        try { sessionStorage.setItem("booted", "1"); } catch (_) { /* ignore */ }
        document.removeEventListener("keydown", finish);
        screen.removeEventListener("click", finish);
        resolve();
      };
      const timer = setInterval(() => {
        if (i < lines.length) {
          text.textContent += (i ? "\n" : "") + lines[i];
          i++;
        } else {
          setTimeout(finish, 500);
          clearInterval(timer);
        }
      }, 110);
      document.addEventListener("keydown", finish);
      screen.addEventListener("click", finish);
    });
  }

  // ---------------------------
  // Global click / key delegation (no inline handlers: CSP)
  // ---------------------------
  function handleAction(el) {
    const open = el.getAttribute("data-open");
    const close = el.getAttribute("data-close");
    const minimize = el.getAttribute("data-minimize");
    const action = el.getAttribute("data-action");
    const task = el.getAttribute("data-task");

    if (close) closeWindow(close);
    if (minimize) minimizeWindow(minimize);
    if (open) openWindow(open);
    if (task) onTaskButton(task);

    if (action === "internet") openInternetWindow();
    if (action === "virus") triggerVirus();
    if (action === "resume-txt") openResumeTxt();
    if (action === "request-cv") {
      openWindow("contact");
      const link = $("request-cv-link");
      if (link) link.focus();
    }

    if (el.closest("#start-menu")) setStartMenu(false);
    if (close === "task-manager" || el.closest("#task-list")) populateTaskList();
  }

  function setupDelegation() {
    document.addEventListener("click", (e) => {
      const popupClose = e.target.closest("[data-remove-popup]");
      if (popupClose) {
        popupClose.closest(".virus-popup")?.remove();
        return;
      }

      const fileOrSidebar = e.target.closest(".file[data-item], .sidebar-item[data-item]");
      if (fileOrSidebar) {
        openNotepadFromData(fileOrSidebar.dataset.kind, fileOrSidebar.dataset.item);
        return;
      }

      const actionEl = e.target.closest("[data-open],[data-close],[data-minimize],[data-action],[data-task]");
      if (actionEl && !actionEl.closest("#phone")) {
        handleAction(actionEl);
        return;
      }

      const startMenu = $("start-menu");
      const startButton = document.querySelector(".start-button");
      if (startMenu && !startMenu.classList.contains("hidden") && !startMenu.contains(e.target) && !startButton.contains(e.target)) {
        setStartMenu(false);
      }
    });

    const startButton = document.querySelector(".start-button");
    if (startButton) {
      startButton.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleStartMenu();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (CVSite.isPhone()) return;
      const startMenu = $("start-menu");
      if (e.key === "Escape") {
        if (startMenu && !startMenu.classList.contains("hidden")) {
          setStartMenu(false);
          document.querySelector(".start-button")?.focus();
          return;
        }
        const top = topWindowId();
        if (top && top !== "snake" && top !== "invaders") closeWindow(top);
        return;
      }
      if ((e.ctrlKey && e.key === "Escape") || (e.key === "Meta" && !e.repeat)) {
        e.preventDefault();
        toggleStartMenu();
        return;
      }
      // Arrow navigation inside the start menu
      if (startMenu && !startMenu.classList.contains("hidden") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        const items = Array.from(startMenu.querySelectorAll("[role=menuitem]"));
        const idx = items.indexOf(document.activeElement);
        const next = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
        items[next]?.focus();
        e.preventDefault();
      }
    });

    document.querySelectorAll(".window").forEach((win) => {
      makeDraggable(win);
      win.addEventListener("pointerdown", () => {
        if (topWindowId() !== win.id) bringToFront(win.id);
      });
    });

    window.addEventListener("resize", () => {
      if (CVSite.isPhone()) return;
      document.querySelectorAll(".window.open:not(.minimized)").forEach((w) => centerWindow(w));
    });
  }

  // ---------------------------
  // Init
  // ---------------------------
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      CV = await CVSite.load();
      renderWelcome();
      renderAbout();
      renderContact();
      renderExplorer("experience");
      renderExplorer("projects");
      renderStartHeader();
      renderRecentApps();
    } catch (e) {
      console.error(e);
      const host = $("welcome-content");
      if (host) host.innerHTML = `<p>Could not load content.json. ${CVSite.esc(e.message || "")}</p>`;
    }

    updateClock();
    setInterval(updateClock, 1000);
    setupDelegation();

    if (CVSite.isPhone()) {
      $("boot-screen")?.classList.add("hidden");
      return;
    }

    await runBootScreen();
    openWindow("welcome-message");
  });

  // expose for mobile.js and debugging
  window.CVDesktop = { openWindow, closeWindow, minimizeWindow, openInternetWindow, triggerVirus };
})();
