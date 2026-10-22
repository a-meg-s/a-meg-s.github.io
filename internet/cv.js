'use strict';

let CV = null;

// ---------------------------
// Load shared JSON
// ---------------------------
async function loadContent() {
  const url = new URL("../content.json", window.location.href).toString();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load content.json at ${url} (HTTP ${res.status})`);
  CV = await res.json();
}

// ---------------------------
// Render helpers
// ---------------------------
function setText(id, value) {
  const el = document.getElementById(id);
  if (el && typeof value === "string") el.textContent = value;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el && typeof html === "string") el.innerHTML = html;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHref(href) {
  const h = String(href ?? "").trim();
  if (/^(https?:\/\/|mailto:)/i.test(h)) return h;
  if (/^[a-z0-9_./-]+$/i.test(h) && !h.startsWith("/") && !h.includes("..")) return `../${h}`;
  return "#";
}

function linkAttrs(href, download) {
  const external = /^https?:/i.test(href);
  return `${download ? " download" : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}`;
}

// ---------------------------
// Render page from JSON
// ---------------------------
function renderHeader() {
  const name = CV?.site?.name || CV?.internet?.headerName || CV?.site?.title || "Andrea M. Sustic";
  setText("person-name", name);
  setText("person-role", [CV?.site?.role, CV?.site?.location].filter(Boolean).join(", "));

  const img = document.getElementById("profile-img");
  const src = CV?.internet?.headerImage || CV?.about?.profile?.image || CV?.contact?.image || "img/pfp.png";
  if (img) img.src = safeHref(src);
}

function renderIntro() {
  setText("intro-title", CV?.welcome?.title || "Hello and welcome to my online CV");
  const paras = CV?.welcome?.paragraphs || [];
  setHTML("intro-paragraphs", paras.map((p) => `<p>${p}</p>`).join(""));
}

function renderCurrentWork() {
  const custom = CV?.internet?.currentWork;
  setText("current-work-title", custom?.title || "What I'm Currently Working On");
  if (custom?.paragraphs?.length) {
    setHTML("current-work-body", custom.paragraphs.map((p) => `<p>${p}</p>`).join(""));
    return;
  }
  const skills = CV?.about?.skills?.text || "";
  setHTML("current-work-body", `<p>Technologies and domains I work with: <span class="highlight">${escapeHtml(skills)}</span></p>`);
}

function renderLanguages() {
  setText("languages-title", CV?.about?.languages?.title || "Languages");
  const container = document.getElementById("language-container");
  if (!container) return;
  const items = CV?.about?.languages?.items || [];
  container.innerHTML = items
    .map((it) => `<div class="language-bar" data-percentage="${Number(it.percentage) || 0}">${escapeHtml(it.label)}</div>`)
    .join("");
}

function renderExperienceCarousel() {
  setText("experience-title", CV?.explorers?.experience?.windowTitle || "Experience");

  const inner = document.getElementById("experience-inner");
  const dots = document.getElementById("scroll-indicator");
  if (!inner || !dots) return;

  const items = CV?.explorers?.experience?.items || [];
  const intro = CV?.internet?.experienceIntro;
  const slides = [];

  if (intro?.title && Array.isArray(intro?.bullets)) {
    slides.push(`
      <article>
        <h3>${escapeHtml(intro.title)}</h3>
        <ul>${intro.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      </article>`);
  }

  for (const it of items) {
    const title = it.notepadTitle || it.label || "";
    const bullets = Array.isArray(it.bullets) ? it.bullets : [];
    slides.push(`
      <article>
        <h3>${escapeHtml(title)}</h3>
        ${it.meta ? `<p class="meta">${escapeHtml(it.meta)}</p>` : ""}
        ${bullets.length ? `<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}
      </article>`);
  }

  inner.innerHTML = slides.join("");
  dots.innerHTML = slides.map((_, i) => `<div class="indicator-dot ${i === 0 ? "active" : ""}"></div>`).join("");
  setupExperienceCarousel();
}

function renderProjects() {
  setText("projects-title", CV?.explorers?.projects?.windowTitle || "Projects");
  const host = document.getElementById("projects-list");
  if (!host) return;

  const items = CV?.explorers?.projects?.items || [];
  host.innerHTML = items
    .map((it) => {
      const title = it.notepadTitle || it.label || "Project";
      const bullets = Array.isArray(it.bullets) ? it.bullets : [];
      const bulletList = bullets.length ? `<ul class="project-bullets">${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : "";
      const links = (it.links || [])
        .map((l) => {
          const href = safeHref(l.href);
          return `<a href="${escapeHtml(href)}"${linkAttrs(href, l.download)}>${escapeHtml(l.text || href)}</a>`;
        })
        .join("<br>");
      return `
      <li class="project-item">
        <h3>${escapeHtml(title)}</h3>
        <article>
          ${it.meta ? `<p class="meta">${escapeHtml(it.meta)}</p>` : ""}
          ${bulletList}
          ${links ? `<p>${links}</p>` : ""}
        </article>
      </li>`;
    })
    .join("");
}

function renderEducation() {
  setText("education-title", CV?.about?.education?.title || "Education");
  const host = document.getElementById("education-body");
  if (!host) return;

  const eduHtml = CV?.about?.education?.html || "";
  const awards = (CV?.about?.awards?.items || [])
    .map((aw) => {
      const links = (aw.links || [])
        .map((l) => {
          const href = safeHref(l.href);
          return `<a href="${escapeHtml(href)}"${linkAttrs(href)}>${escapeHtml(l.text)}</a>`;
        })
        .join("<br>");
      return `
      <div class="award-box">
        <p><span class="bold">${escapeHtml(aw.name)}</span></p>
        <p>${escapeHtml(aw.for)}</p>
        ${aw.thesis ? `<p>${escapeHtml(aw.thesis)}</p>` : ""}
        ${links ? `<p>${links}</p>` : ""}
      </div>`;
    })
    .join("");

  host.innerHTML = `
    <article>
      <h3>${escapeHtml(CV?.internet?.educationHeading || "Bachelor of Science in Information & Cyber Security")}</h3>
      <p>${eduHtml}</p>
      ${awards}
    </article>`;
}

function renderFooterContact() {
  const host = document.getElementById("contact-footer");
  if (!host) return;
  const email = CV?.contact?.email?.address || "";
  const linkedinUrl = safeHref(CV?.contact?.linkedin?.url || "#");
  const linkedinText = CV?.contact?.linkedin?.text || "LinkedIn";
  host.innerHTML = `
    <p>
      Contact: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
      |
      LinkedIn: <a href="${escapeHtml(linkedinUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkedinText)}</a>
    </p>`;
}

// ---------------------------
// Skill bars
// ---------------------------
function initSkillBars() {
  const bars = document.querySelectorAll(".language-bar");
  const animate = (bar) => {
    bar.style.width = `${Math.min(100, Number(bar.getAttribute("data-percentage")) || 0)}%`;
    bar.classList.add("hovered");
  };
  if (!("IntersectionObserver" in window)) {
    bars.forEach(animate);
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach((bar) => {
    bar.style.width = "0%";
    observer.observe(bar);
  });
}

// ---------------------------
// Experience carousel (buttons, keyboard, swipe)
// ---------------------------
let currentIndex = 0;

function slideCount() {
  return document.querySelectorAll(".experience-inner article").length;
}

function updateExperience() {
  const inner = document.querySelector(".experience-inner");
  if (!inner || slideCount() === 0) return;
  inner.style.transform = `translateX(${-currentIndex * 100}%)`;
  document.querySelectorAll("#scroll-indicator .indicator-dot").forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
}

function step(delta) {
  const n = slideCount();
  if (!n) return;
  currentIndex = (currentIndex + delta + n) % n;
  updateExperience();
}

function setupExperienceCarousel() {
  currentIndex = 0;
  updateExperience();

  const nextBtn = document.getElementById("next-experience");
  const prevBtn = document.getElementById("prev-experience");
  if (nextBtn) nextBtn.onclick = () => step(1);
  if (prevBtn) prevBtn.onclick = () => step(-1);

  const carousel = document.getElementById("experience-carousel");
  if (carousel && !carousel.dataset.swipeBound) {
    carousel.dataset.swipeBound = "1";
    let startX = null;
    carousel.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    carousel.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
    carousel.tabIndex = 0;
  }
}

// ---------------------------
// Matrix background
// ---------------------------
function startMatrix() {
  const canvas = document.getElementById("matrix-canvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]<>/\\|~".split("");
  const fontSize = 10;
  let drops = [];

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drops = Array(Math.floor(canvas.width / fontSize)).fill(1);
  }

  function drawFrame() {
    ctx.fillStyle = "rgba(26, 26, 46, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#39FF14";
    ctx.font = `${fontSize}px monospace`;
    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y * fontSize);
      if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }

  window.addEventListener("resize", resize);
  resize();
  let timer = setInterval(drawFrame, 35);
  document.addEventListener("visibilitychange", () => {
    clearInterval(timer);
    if (!document.hidden) timer = setInterval(drawFrame, 35);
  });
}

// ---------------------------
// Init
// ---------------------------
window.addEventListener("load", async () => {
  try {
    await loadContent();
    renderHeader();
    renderIntro();
    renderCurrentWork();
    renderLanguages();
    renderExperienceCarousel();
    renderProjects();
    renderEducation();
    renderFooterContact();
    initSkillBars();
  } catch (e) {
    console.error(e);
    const intro = document.getElementById("intro-paragraphs");
    if (intro) {
      intro.innerHTML = `
        <p><strong>Could not load shared content.json</strong></p>
        <pre class="load-error">${escapeHtml(e.message || String(e))}</pre>`;
    }
  }
  startMatrix();
});
