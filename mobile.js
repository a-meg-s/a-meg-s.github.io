// ===== mobile.js: phone shell (< 760px). Reads the same content.json as the desktop. =====
"use strict";

(function () {
  const CVSite = window.CVSite;
  const $ = (id) => document.getElementById(id);

  let CV = null;
  const stack = []; // navigation stack of screen descriptors
  let selectedIndex = 0;
  let booted = false;

  // ---------------------------
  // Screen registry
  // ---------------------------
  const screens = {
    idle: {
      title: "",
      softLeft: "Menu",
      softRight: "",
      nav: false,
      render() {
        const site = CV?.site || {};
        const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return `
          <div class="idle">
            <img class="idle-avatar" src="${CVSite.esc(CVSite.safeHref(site.favicon || "img/pfp.png"))}" alt="" />
            <div class="idle-time" id="idle-time">${CVSite.esc(t)}</div>
            <div class="idle-name">${CVSite.esc(site.name || "Andrea M. Sustic")}</div>
            <div class="idle-role">${CVSite.esc(site.role || "")}</div>
            <div class="idle-hint">Tap the screen or press Menu</div>
          </div>`;
      },
      onLeft() { glitchTo("menu"); }
    },

    menu: {
      title: "Menu",
      softLeft: "Select",
      softRight: "Back",
      nav: true,
      items() {
        return [
          { label: "About me", sub: CV?.site?.role || "", go: "about" },
          { label: "Experience", sub: `${CV?.explorers?.experience?.items?.length || 0} entries`, go: "experience" },
          { label: "Projects", sub: `${CV?.explorers?.projects?.items?.length || 0} entries`, go: "projects" },
          { label: "Contact", sub: "Email, LinkedIn, CV request", go: "contact" },
          { label: "Games", sub: "snake.exe, invaders.exe", go: "games" },
          { label: "Internet", sub: "Older CV site", go: "internet" },
          { label: "unsuspicious.jar", sub: "Do not open", go: "virus" }
        ];
      },
      onSelect(item) {
        if (item.go === "virus") runVirus();
        else push(item.go);
      }
    },

    about: {
      title: "About me",
      softLeft: "Contact",
      softRight: "Back",
      nav: "scroll",
      render() {
        const a = CV?.about || {};
        const langs = (a.languages?.items || [])
          .map((l) => {
            const pct = Math.min(100, Math.max(0, Number(l.percentage) || 0));
            return `<div class="lcd-meter" role="img" aria-label="${CVSite.esc(l.label)}">
              <span class="lcd-meter-label">${CVSite.esc(l.label)}</span>
              <span class="lcd-meter-track"><i class="lcd-meter-fill" data-pct="${pct}"></i></span>
            </div>`;
          })
          .join("");
        const awards = (a.awards?.items || [])
          .map((aw) => {
            const links = (aw.links || [])
              .map((l) => `<li><a href="${CVSite.esc(CVSite.safeHref(l.href))}" target="_blank" rel="noopener noreferrer">${CVSite.esc(l.text)}</a></li>`)
              .join("");
            return `<p><strong>${CVSite.esc(aw.name)}</strong></p><p>${CVSite.esc(aw.for)}</p>${aw.thesis ? `<p>${CVSite.esc(aw.thesis)}</p>` : ""}${links ? `<ul>${links}</ul>` : ""}`;
          })
          .join("");
        return `
          <div class="lcd-text">
            <p>${a.profile?.text || ""}</p>
            <h3>${CVSite.esc(a.education?.title || "Education")}</h3>
            <p>${a.education?.html || ""}</p>
            ${awards ? `<h3>${CVSite.esc(a.awards?.title || "Awards")}</h3>${awards}` : ""}
            <h3>${CVSite.esc(a.skills?.title || "Skills")}</h3>
            <p>${a.skills?.text || ""}</p>
            <h3>${CVSite.esc(a.languages?.title || "Languages")}</h3>
            ${langs}
          </div>`;
      },
      onMount() {
        // widths via CSSOM: inline style attributes are blocked by the CSP
        document.querySelectorAll(".lcd-meter-fill").forEach((f) => { f.style.width = `${f.dataset.pct}%`; });
      },
      onLeft() { push("contact"); }
    },

    experience: {
      title: "Experience",
      softLeft: "Open",
      softRight: "Back",
      nav: true,
      items() {
        return (CV?.explorers?.experience?.items || []).map((it) => ({
          label: it.label,
          sub: it.meta || "",
          go: "detail",
          detail: { kind: "experience", id: it.id }
        }));
      },
      onSelect(item) { push("detail", item.detail); }
    },

    projects: {
      title: "Projects",
      softLeft: "Open",
      softRight: "Back",
      nav: true,
      items() {
        return (CV?.explorers?.projects?.items || []).map((it) => ({
          label: CVSite.stripHtml(it.notepadTitle || it.label),
          sub: it.meta || "",
          go: "detail",
          detail: { kind: "projects", id: it.id }
        }));
      },
      onSelect(item) { push("detail", item.detail); }
    },

    detail: {
      title(params) {
        const it = findItem(params);
        return it ? CVSite.stripHtml(it.label) : "Details";
      },
      softLeft: "",
      softRight: "Back",
      nav: "scroll",
      render(params) {
        const it = findItem(params);
        if (!it) return `<div class="lcd-text"><p>Entry not found.</p></div>`;
        const bullets = (it.bullets || []).map((b) => `<li>${b}</li>`).join("");
        const links = (it.links || [])
          .map((l) => {
            const href = CVSite.safeHref(l.href);
            const external = /^https?:/i.test(href);
            return `<a class="lcd-action" href="${CVSite.esc(href)}"${l.download ? " download" : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${CVSite.esc(l.text || href)}</a>`;
          })
          .join("");
        const full = CVSite.stripHtml(it.notepadTitle || it.label);
        const sameAsTitle = full === CVSite.stripHtml(it.label);
        return `
          <div class="lcd-text">
            ${sameAsTitle ? "" : `<h3>${CVSite.esc(full)}</h3>`}
            ${it.meta ? `<div class="meta">${CVSite.esc(it.meta)}</div>` : ""}
            <ul>${bullets}</ul>
            ${links}
          </div>`;
      }
    },

    contact: {
      title: "Contact",
      softLeft: "Email",
      softRight: "Back",
      nav: "scroll",
      render() {
        const c = CV?.contact || {};
        const email = c.email?.address || "";
        const li = CVSite.safeHref(c.linkedin?.url || "#");
        return `
          <div class="lcd-text">
            <p>${CVSite.esc(c.intro || "")}</p>
            <h3>${CVSite.esc(c.email?.label || "Email:")}</h3>
            <p><a href="mailto:${CVSite.esc(email)}">${CVSite.esc(email)}</a></p>
            <h3>${CVSite.esc(c.linkedin?.label || "LinkedIn:")}</h3>
            <p><a href="${CVSite.esc(li)}" target="_blank" rel="noopener noreferrer">${CVSite.esc(c.linkedin?.text || "LinkedIn")}</a></p>
            <div class="lcd-note">
              <strong>${CVSite.esc(c.cvRequest?.label || "Request my CV")}</strong>
              <p>${CVSite.esc(c.cvRequest?.note || "")}</p>
              <a class="lcd-action" href="${CVSite.esc(CVSite.mailtoCv(c))}">Email me for the CV</a>
            </div>
          </div>`;
      },
      onLeft() {
        const email = CV?.contact?.email?.address;
        if (email) window.location.href = `mailto:${email}`;
      }
    },

    games: {
      title: "Games",
      softLeft: "Play",
      softRight: "Back",
      nav: true,
      items() {
        return [
          { label: "snake.exe", sub: "Eat the bits, don't bite yourself", go: "snake" },
          { label: "invaders.exe", sub: "Classic arcade shooter", go: "invaders" }
        ];
      },
      onSelect(item) { push(item.go); }
    },

    invaders: {
      title: "invaders.exe",
      softLeft: "Start",
      softRight: "Back",
      nav: "dpad",
      render() {
        return `
          <div class="lcd-snake">
            <div class="snake-hud">
              <span>Score <strong id="invaders-score-phone">0</strong></span>
              <span>Wave <strong id="invaders-wave-phone">1</strong></span>
              <span>Best <strong id="invaders-best-phone">0</strong></span>
            </div>
            <canvas id="invaders-canvas-phone" width="320" height="240" aria-label="Invaders game" tabindex="0"></canvas>
            <p class="lcd-game-hint">Hold the side keys to move, hold the top key to fire. Or drag on the screen and tap to fire.</p>
          </div>`;
      },
      onMount() {
        if (window.InvadersGame) window.InvadersGame.mount("phone");
        syncGameSoftkey();
      },
      onLeft() {
        if (window.InvadersGame) window.InvadersGame.toggle();
        syncGameSoftkey();
      },
      onLeave() {
        if (window.InvadersGame) window.InvadersGame.pause();
      }
    },

    snake: {
      title: "snake.exe",
      softLeft: "Start",
      softRight: "Back",
      nav: "dpad",
      render() {
        return `
          <div class="lcd-snake">
            <div class="snake-hud">
              <span>Score <strong id="snake-score-phone">0</strong></span>
              <span>Best <strong id="snake-best-phone">0</strong></span>
            </div>
            <canvas id="snake-canvas-phone" width="320" height="240" aria-label="Snake game" tabindex="0"></canvas>
          </div>`;
      },
      onMount() {
        if (window.SnakeGame) window.SnakeGame.mount("phone");
        syncSnakeSoftkey();
      },
      onLeft() {
        if (window.SnakeGame) window.SnakeGame.toggle();
        syncSnakeSoftkey();
      },
      onLeave() {
        if (window.SnakeGame) window.SnakeGame.pause();
      }
    },

    internet: {
      title: "Internet",
      softLeft: "",
      softRight: "Back",
      nav: false,
      browser: true,
      render() {
        return `<iframe class="lcd-frame" src="internet/cv.html" title="Andrea's older CV website"></iframe>`;
      }
    }
  };

  function findItem(params) {
    return CV?.explorers?.[params?.kind]?.items?.find((x) => x.id === params?.id) || null;
  }

  function activeGame() {
    const name = current()?.name;
    if (name === "snake") return window.SnakeGame || null;
    if (name === "invaders") return window.InvadersGame || null;
    return null;
  }

  function syncGameSoftkey() {
    const left = $("sk-left");
    const game = activeGame();
    if (!left || !game || left.dataset.virus) return;
    left.textContent = game.isRunning() ? "Pause" : game.isOver() ? "Retry" : "Start";
  }
  const syncSnakeSoftkey = syncGameSoftkey;

  // ---------------------------
  // Navigation
  // ---------------------------
  function current() {
    return stack[stack.length - 1];
  }

  function push(name, params) {
    const prev = current();
    if (prev && screens[prev.name].onLeave) screens[prev.name].onLeave();
    stack.push({ name, params: params || null, index: 0, scroll: 0 });
    selectedIndex = 0;
    render();
  }

  // Brief LCD tear effect covering a screen change (skipped under reduced motion).
  function glitchTo(name, params) {
    const lcd = $("lcd");
    if (CVSite.reducedMotion() || lcd.classList.contains("lcd-glitch")) {
      push(name, params);
      return;
    }
    lcd.classList.add("lcd-glitch");
    setTimeout(() => push(name, params), 240);
    setTimeout(() => lcd.classList.remove("lcd-glitch"), 560);
  }

  function back() {
    if (stack.length <= 1) return;
    const prev = stack.pop();
    if (screens[prev.name].onLeave) screens[prev.name].onLeave();
    selectedIndex = current().index || 0;
    render();
  }

  function render() {
    const entry = current();
    const def = screens[entry.name];
    const screen = $("lcd-screen");
    const titleEl = $("lcd-title");
    const lcd = $("lcd");

    const title = typeof def.title === "function" ? def.title(entry.params) : def.title;
    $("phone").classList.toggle("is-idle", entry.name === "idle");
    titleEl.textContent = title;
    titleEl.style.display = title ? "" : "none";
    lcd.classList.toggle("lcd-browser", !!def.browser);

    if (def.items) {
      const items = def.items();
      entry.items = items;
      screen.innerHTML = `<ul class="lcd-list" role="listbox" aria-label="${CVSite.esc(title)}">${items
        .map(
          (it, i) => `<li role="option" data-index="${i}" aria-selected="${i === selectedIndex}" class="${i === selectedIndex ? "selected" : ""}">
            <span class="num">${i + 1}</span>
            <span><span class="lbl">${CVSite.esc(it.label)}</span>${it.sub ? `<span class="sub">${CVSite.esc(it.sub)}</span>` : ""}</span>
          </li>`
        )
        .join("")}</ul>`;
    } else {
      screen.innerHTML = def.render(entry.params);
    }

    const left = $("sk-left");
    const right = $("sk-right");
    left.textContent = def.softLeft || "";
    left.disabled = !def.softLeft;
    right.textContent = def.softRight || "";
    right.disabled = !def.softRight;

    $("nav-keys").hidden = def.nav !== true && def.nav !== "scroll";
    $("dpad").hidden = def.nav !== "dpad";

    screen.scrollTop = entry.scroll || 0;
    updateScrollIndicator();
    if (def.onMount) def.onMount(entry.params);
  }

  function moveSelection(delta) {
    const entry = current();
    const def = screens[entry.name];
    const screen = $("lcd-screen");
    if (def.nav === "scroll") {
      screen.scrollBy({ top: delta * Math.round(screen.clientHeight * 0.6), behavior: CVSite.reducedMotion() ? "auto" : "smooth" });
      return;
    }
    if (!entry.items || !entry.items.length) return;
    selectedIndex = (selectedIndex + delta + entry.items.length) % entry.items.length;
    entry.index = selectedIndex;
    screen.querySelectorAll(".lcd-list li").forEach((li, i) => {
      li.classList.toggle("selected", i === selectedIndex);
      li.setAttribute("aria-selected", String(i === selectedIndex));
      if (i === selectedIndex) li.scrollIntoView({ block: "nearest" });
    });
  }

  function selectCurrent() {
    const entry = current();
    const def = screens[entry.name];
    if (def.items && entry.items) {
      entry.index = selectedIndex;
      def.onSelect(entry.items[selectedIndex]);
      return;
    }
    if (def.onLeft) def.onLeft();
  }

  function updateScrollIndicator() {
    const screen = $("lcd-screen");
    const ind = $("lcd-scroll");
    if (!screen || !ind) return;
    const scrollable = screen.scrollHeight > screen.clientHeight + 4;
    ind.classList.toggle("visible", scrollable);
    if (!scrollable) return;
    const ratio = screen.clientHeight / screen.scrollHeight;
    const pos = screen.scrollTop / (screen.scrollHeight - screen.clientHeight);
    const h = Math.max(14, Math.round(ind.clientHeight * ratio));
    const top = Math.round((ind.clientHeight - h) * pos);
    let thumb = ind.querySelector("i");
    if (!thumb) {
      thumb = document.createElement("i");
      ind.appendChild(thumb);
    }
    thumb.style.top = `${top}px`;
    thumb.style.height = `${h}px`;
  }

  // ---------------------------
  // "Virus" on the LCD (capped at 8 popups)
  // ---------------------------
  let virusRunning = false;

  function runVirus() {
    if (virusRunning) return;
    virusRunning = true;
    const lcd = $("lcd");
    const left = $("sk-left");
    const right = $("sk-right");
    let count = 0;
    const max = 12;

    // The softkeys switch to "Stop" immediately so nothing else can be triggered meanwhile.
    left.textContent = "Stop";
    left.disabled = false;
    left.dataset.virus = "1";
    right.disabled = true;
    $("nav-keys").hidden = true;
    $("dpad").hidden = true;

    const timer = setInterval(() => {
      if (count >= max) {
        clearInterval(timer);
        showLcdStopButton();
        return;
      }
      const box = document.createElement("div");
      box.className = "lcd-popup";
      box.innerHTML = `<strong>${CVSite.esc(CVSite.nextAlertTitle())}</strong>${CVSite.esc(CVSite.nextAlert())}`;
      box.setAttribute("role", "button");
      box.title = "Tap to dismiss";
      const maxX = Math.max(0, lcd.clientWidth - 180);
      const maxY = Math.max(60, lcd.clientHeight - 110);
      box.style.left = `${Math.floor(Math.random() * maxX)}px`;
      box.style.top = `${Math.floor(40 + Math.random() * (maxY - 40))}px`;
      box.addEventListener("click", () => box.remove());
      lcd.appendChild(box);
      count++;
    }, 280);
  }

  function showLcdStopButton() {
    if ($("lcd-stop")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "lcd-stop";
    btn.className = "lcd-stop";
    btn.textContent = "STOP VIRUS";
    btn.addEventListener("click", stopVirus);
    $("lcd").appendChild(btn);
    btn.focus({ preventScroll: true });
  }

  function stopVirus() {
    document.querySelectorAll(".lcd-popup, .lcd-stop").forEach((el) => el.remove());
    const left = $("sk-left");
    delete left.dataset.virus;
    virusRunning = false;
    render();
  }

  // ---------------------------
  // Splash, then idle
  // ---------------------------
  function splash() {
    const screen = $("lcd-screen");
    const site = CV?.site || {};
    $("lcd-title").style.display = "none";
    $("sk-left").disabled = true;
    $("sk-right").disabled = true;
    $("nav-keys").hidden = true;
    screen.innerHTML = `
      <div class="idle">
        <img class="idle-avatar" src="${CVSite.esc(CVSite.safeHref(site.favicon || "img/pfp.png"))}" alt="" />
        <div class="idle-time idle-loading"><span class="bar"><i></i></span></div>
        <div class="idle-name">${CVSite.esc(site.name || "Andrea M. Sustic")}</div>
        <div class="idle-role">${CVSite.esc(site.role || "")}</div>
        <div class="idle-hint">... connecting you ...</div>
      </div>`;
    const delay = CVSite.reducedMotion() ? 0 : 1300;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  // ---------------------------
  // Events
  // ---------------------------
  function bindEvents() {
    const phone = $("phone");
    const screen = $("lcd-screen");

    $("sk-left").addEventListener("click", () => {
      const left = $("sk-left");
      if (left.dataset.virus) { stopVirus(); return; }
      selectCurrent();
    });
    $("sk-right").addEventListener("click", back);

    $("nav-keys").addEventListener("click", (e) => {
      const b = e.target.closest("[data-nav]");
      if (!b) return;
      moveSelection(b.dataset.nav === "up" ? -1 : 1);
    });

    const dpad = $("dpad");
    dpad.addEventListener("click", (e) => {
      const b = e.target.closest("[data-dir]");
      if (!b || current()?.name !== "snake" || !window.SnakeGame) return;
      window.SnakeGame.setDirection(b.dataset.dir);
      syncGameSoftkey();
    });
    // invaders: hold-to-move on the D-pad
    const invInput = (e, down) => {
      const b = e.target.closest("[data-dir]");
      if (!b || current()?.name !== "invaders" || !window.InvadersGame) return;
      e.preventDefault();
      window.InvadersGame.input(b.dataset.dir, down);
      syncGameSoftkey();
    };
    dpad.addEventListener("pointerdown", (e) => invInput(e, true));
    dpad.addEventListener("pointerup", (e) => invInput(e, false));
    dpad.addEventListener("pointercancel", (e) => invInput(e, false));
    dpad.addEventListener("pointerleave", (e) => invInput(e, false), true);
    dpad.addEventListener("contextmenu", (e) => e.preventDefault());

    screen.addEventListener("click", (e) => {
      if (current()?.name === "idle") {
        glitchTo("menu");
        return;
      }
      const li = e.target.closest(".lcd-list li");
      if (!li) return;
      selectedIndex = Number(li.dataset.index) || 0;
      moveSelection(0);
      selectCurrent();
    });

    screen.addEventListener("scroll", () => {
      current().scroll = screen.scrollTop;
      updateScrollIndicator();
    }, { passive: true });

    // keyboard (external keyboards, desktop devtools)
    phone.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Backspace") { back(); e.preventDefault(); }
      else if (e.key === "Enter") { selectCurrent(); e.preventDefault(); }
      else if (e.key === "ArrowDown") { moveSelection(1); e.preventDefault(); }
      else if (e.key === "ArrowUp") { moveSelection(-1); e.preventDefault(); }
    });

    // keep the idle clock current
    setInterval(() => {
      const t = $("idle-time");
      if (t) t.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      syncSnakeSoftkey();
    }, 1000);

    window.addEventListener("resize", updateScrollIndicator);
  }

  // ---------------------------
  // Init / layout switching
  // ---------------------------
  async function boot() {
    if (booted) return;
    booted = true;
    try {
      CV = await CVSite.load();
    } catch (e) {
      console.error(e);
    }
    bindEvents();
    const carrier = $("phone-carrier");
    if (carrier && CV?.site?.name) carrier.textContent = CV.site.name.toUpperCase();
    await splash();
    stack.length = 0;
    push("idle");
  }

  function applyLayout() {
    const phone = $("phone");
    if (!phone) return;
    const isPhone = CVSite.isPhone();
    phone.hidden = !isPhone;
    if (isPhone) boot();
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyLayout();
    window.matchMedia("(max-width: 759px)").addEventListener("change", applyLayout);
  });
})();
