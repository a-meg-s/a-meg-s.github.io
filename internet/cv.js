'use strict';

let CV = null;

// ---------------------------
// Load shared JSON
// IMPORTANT: cv.html is in /internet/, so content.json is one level up.
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
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------------------------
// Render page from JSON
// ---------------------------
function renderHeader() {
  // Your current JSON doesn't store the big name, so fall back to site.title if present.
  // If you want exact header name, add CV.internet.headerName or CV.site.name, etc.
  const name = CV?.internet?.headerName || CV?.site?.title || "Andrea M. Sustic";
  setText("person-name", name);

  // Try to use the same image as contact/about profile if present
  const img = document.getElementById("profile-img");
  const src =
    CV?.internet?.headerImage ||
    CV?.about?.profile?.image ||
    CV?.contact?.image ||
    "/img/pfp.png";

  if (img) img.src = src.startsWith("/") ? src : `/${src.replace(/^\.\//, "")}`;
}

function renderIntro() {
  // Use welcome content (same as desktop welcome modal)
  const title = CV?.welcome?.title || "Hello and welcome to my online CV";
  setText("intro-title", title);

  const paras = CV?.welcome?.paragraphs || [];
  const html = paras.map(p => `<p>${p}</p>`).join("");
  setHTML("intro-paragraphs", html);
}

function renderCurrentWork() {
  // If you add custom JSON later, it will override this fallback.
  // Recommended JSON addition:
  // "internet": { "currentWork": { "title": "...", "paragraphs": ["...","..."] } }
  const custom = CV?.internet?.currentWork;

  const title = custom?.title || "What I'm Currently Working On";
  setText("current-work-title", title);

  if (custom?.paragraphs?.length) {
    setHTML("current-work-body", custom.paragraphs.map(p => `<p>${p}</p>`).join(""));
    return;
  }

  // Fallback: derive something reasonable from about.skills + welcome
  const skills = CV?.about?.skills?.text || "";
  const fallback = `
    <p>
      Since I’m still studying, my areas of interest and projects are constantly evolving.
      Here are some technologies and domains I work with:
      <span class="highlight">${escapeHtml(skills)}</span>
    </p>
    <p>
      You can find reports and results of various projects and topics in the Projects section.
    </p>
  `;
  setHTML("current-work-body", fallback);
}

function renderLanguages() {
  setText("languages-title", CV?.about?.languages?.title || "Languages");

  const container = document.getElementById("language-container");
  if (!container) return;

  const items = CV?.about?.languages?.items || [];
  container.innerHTML = items.map(it => {
    // In this "internet" UI, the bar text includes the label in the same element
    return `<div class="language-bar" data-percentage="${it.percentage}">${escapeHtml(it.label)}</div>`;
  }).join("");
}

function renderExperienceCarousel() {
  setText("experience-title", CV?.explorers?.experience?.windowTitle || "Experience");

  const inner = document.getElementById("experience-inner");
  const dots = document.getElementById("scroll-indicator");
  if (!inner || !dots) return;

  const items = CV?.explorers?.experience?.items || [];

  // Optional: keep your first "Key Skills from Experience" slide if you put it in JSON
  // Example:
  // CV.internet.experienceIntro = { title: "Key Skills from Experience:", bullets: [...] }
  const intro = CV?.internet?.experienceIntro;

  const slides = [];

  if (intro?.title && Array.isArray(intro?.bullets)) {
    slides.push(`
      <article>
        <h3>${escapeHtml(intro.title)}</h3>
        <ul>${intro.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
      </article>
    `);
  }

  // Convert each experience item into a slide
  for (const it of items) {
    const title = it.notepadTitle || it.label || "";
    const bullets = Array.isArray(it.bullets) ? it.bullets : [];
    const dateLine = bullets.length ? bullets[0] : "";

    const rest = bullets.slice(1).map(b => `<li>${b}</li>`).join("");

    slides.push(`
      <article>
        <h3>${escapeHtml(title)}</h3>
        ${dateLine ? `<p>${escapeHtml(dateLine)}</p>` : ""}
        ${rest ? `<ul>${rest}</ul>` : ""}
      </article>
    `);
  }

  inner.innerHTML = slides.join("");

  // dots
  dots.innerHTML = slides.map((_, i) =>
    `<div class="indicator-dot ${i === 0 ? "active" : ""}"></div>`
  ).join("");

  // set up carousel
  setupExperienceCarousel();
}

function renderProjects() {
  setText("projects-title", CV?.explorers?.projects?.windowTitle || "Projects");

  const host = document.getElementById("projects-list");
  if (!host) return;

  const items = CV?.explorers?.projects?.items || [];

  host.innerHTML = items.map(it => {
    const title = it.notepadTitle || it.label || "Project";
    const bullets = Array.isArray(it.bullets) ? it.bullets : [];
    const text = bullets.map(b => `<p>${b}</p>`).join("");

    const links = (it.links || []).map(l => {
      const dl = l.download ? " download" : "";
      const href = l.href || "#";
      const label = l.text || href;
      return `<a href="${href}"${dl}>${escapeHtml(label)}</a>`;
    }).join("<br>");

    return `
      <article>
        <h3>${escapeHtml(title)}</h3>
        ${text}
        ${links ? `<p>${links}</p>` : ""}
      </article>
    `;
  }).join("");
}

function renderEducation() {
  setText("education-title", CV?.about?.education?.title || "Education");

  const host = document.getElementById("education-body");
  if (!host) return;

  // Your desktop JSON has education.html (with <br>).
  // For the internet version we can reuse it.
  const eduHtml = CV?.about?.education?.html || "";
  host.innerHTML = `
    <article>
      <h3>${escapeHtml(CV?.internet?.educationHeading || "Bachelor in Information & Cyber Security")}</h3>
      <p>${eduHtml}</p>
    </article>
  `;
}

function renderFooterContact() {
  const host = document.getElementById("contact-footer");
  if (!host) return;

  const email = CV?.contact?.email?.address || "codebymegan@gmail.com";
  const linkedinUrl = CV?.contact?.linkedin?.url || "#";
  const linkedinText = CV?.contact?.linkedin?.text || "LinkedIn";

  host.innerHTML = `
    <p>
      Contact:
      <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
      |
      LinkedIn:
      <a href="${linkedinUrl}">${escapeHtml(linkedinText)}</a>
    </p>
  `;
}

// ---------------------------
// Skill bars (unchanged logic, but works with JSON-injected bars)
// ---------------------------
function initSkillBars() {
  const skillBars = document.querySelectorAll(".language-bar");

  const animateBar = (bar) => {
    const percentage = bar.getAttribute("data-percentage");
    bar.style.width = `${percentage}%`;
    bar.classList.add("hovered");
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateBar(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  skillBars.forEach((bar) => {
    bar.style.width = "0%";
    observer.observe(bar);
  });
}

// ---------------------------
// Experience Carousel (updated to be safe with dynamic slide count)
// ---------------------------
let currentIndex = 0;

function updateExperience() {
  const experienceInner = document.querySelector(".experience-inner");
  const experiences = document.querySelectorAll(".experience-inner article");
  if (!experienceInner || experiences.length === 0) return;

  const offset = -currentIndex * 100;
  experienceInner.style.transform = `translateX(${offset}%)`;

  const dots = document.querySelectorAll("#scroll-indicator .indicator-dot");
  dots.forEach((dot, index) => dot.classList.toggle("active", index === currentIndex));
}

function setupExperienceCarousel() {
  currentIndex = 0;
  updateExperience();

  const nextBtn = document.getElementById("next-experience");
  const prevBtn = document.getElementById("prev-experience");

  if (nextBtn) {
    nextBtn.onclick = () => {
      const experiences = document.querySelectorAll(".experience-inner article");
      if (experiences.length === 0) return;
      currentIndex = (currentIndex + 1) % experiences.length;
      updateExperience();
    };
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      const experiences = document.querySelectorAll(".experience-inner article");
      if (experiences.length === 0) return;
      currentIndex = (currentIndex - 1 + experiences.length) % experiences.length;
      updateExperience();
    };
  }
}

// ---------------------------
// Matrix background effect (unchanged)
// ---------------------------
function startMatrix() {
  const canvas = document.getElementById("matrix-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const matrixChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|]}".split("");
  const fontSize = 10;
  let columns, drops;

  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    columns = canvas.width / fontSize;
    drops = Array(Math.floor(columns)).fill(1);
  }

  function drawMatrix() {
    ctx.fillStyle = "rgba(26, 26, 46, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#39FF14";
    ctx.font = fontSize + "px arial";

    drops.forEach((y, i) => {
      const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      ctx.fillText(text, i * fontSize, y * fontSize);
      if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  setInterval(drawMatrix, 35);
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

    // after languages are injected
    initSkillBars();

    // background effect
    startMatrix();
  } catch (e) {
    console.error(e);
    // fail loudly in-page
    const intro = document.getElementById("intro-paragraphs");
    if (intro) {
      intro.innerHTML = `
        <p><strong>Could not load shared content.json</strong></p>
        <pre style="white-space:pre-wrap; font-family: monospace;">${escapeHtml(e.message || String(e))}</pre>
        <p>Check that ../content.json exists relative to /internet/cv.html.</p>
      `;
    }
    startMatrix();
  }
});
