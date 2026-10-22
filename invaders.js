// ===== invaders.js: a classic arcade shooter. Shared by the desktop window and the phone LCD. =====
"use strict";

(function () {
  const W = 320;
  const H = 240;
  const TICK_MS = 33;
  const MAX_BULLETS = 3;
  const BULLET_SPEED = 9;
  const FIRE_COOLDOWN_MS = 150;

  const THEMES = {
    desktop: {
      bg: "#0b0014", invader: "#b46cff", player: "#39ff14", bullet: "#39ff14", bomb: "#ff4fd8", text: "#39ff14", dim: "#5a2d8a",
      font: "'Press Start 2P', monospace", small: 8, big: 10
    },
    phone: {
      bg: "#c3d59f", invader: "#1b2618", player: "#1b2618", bullet: "#1b2618", bomb: "#1b2618", text: "#1b2618", dim: "#6f7f5a",
      font: "W95FA, monospace", small: 11, big: 13
    }
  };

  // 8x6 bitmaps, two animation frames each.
  const SPRITES = {
    a: [
      ["..XXXX..", ".XXXXXX.", "XX.XX.XX", "XXXXXXXX", "..X..X..", ".X.XX.X."],
      ["..XXXX..", ".XXXXXX.", "XX.XX.XX", "XXXXXXXX", ".X.XX.X.", "X......X"]
    ],
    b: [
      ["X..XX..X", ".XXXXXX.", "XX.XX.XX", "XXXXXXXX", "X.X..X.X", "..X..X.."],
      ["X..XX..X", ".XXXXXX.", "XX.XX.XX", "XXXXXXXX", ".X....X.", "X.X..X.X"]
    ],
    c: [
      ["...XX...", "..XXXX..", ".XXXXXX.", "XX.XX.XX", "XXXXXXXX", ".X....X."],
      ["...XX...", "..XXXX..", ".XXXXXX.", "XX.XX.XX", "XXXXXXXX", "X.X..X.X"]
    ],
    ship: [["...XX...", "..XXXX..", ".XXXXXX.", "XXXXXXXX", "XXXXXXXX"]]
  };
  const ROW_TYPES = ["a", "b", "b", "c"];
  const ROW_SCORE = [30, 20, 20, 10];
  const COLS = 8;
  const ROWS = 4;
  const INV_W = 16;
  const INV_H = 12;
  const GAP_X = 24;
  const GAP_Y = 20;

  const state = {
    target: null,
    canvas: null,
    ctx: null,
    theme: THEMES.desktop,
    timer: null,
    running: false,
    over: false,
    score: 0,
    best: 0,
    lives: 3,
    wave: 1,
    invaders: [],
    dir: 1,
    stepMs: 520,
    stepAcc: 0,
    frame: 0,
    player: { x: W / 2 - 8, w: 16, h: 10 },
    bullets: [],
    bombs: [],
    input: { left: false, right: false, fire: false },
    lastShot: 0,
    message: "",
    messageUntil: 0,
    drag: null,
    bound: new Set(),
    flash: 0
  };

  const $ = (id) => document.getElementById(id);

  function loadBest() {
    try { return Number(localStorage.getItem("invaders-best")) || 0; } catch (_) { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem("invaders-best", String(v)); } catch (_) { /* ignore */ }
  }

  // ---------------------------
  // Setup
  // ---------------------------
  function spawnWave() {
    state.invaders = [];
    const startX = (W - (COLS - 1) * GAP_X - INV_W) / 2;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        state.invaders.push({ x: startX + c * GAP_X, y: 26 + r * GAP_Y, row: r, type: ROW_TYPES[r], alive: true });
      }
    }
    state.dir = 1;
    state.stepMs = Math.max(120, 520 - (state.wave - 1) * 60);
    state.stepAcc = 0;
    state.bullets = [];
    state.bombs = [];
  }

  function reset() {
    state.score = 0;
    state.lives = 3;
    state.wave = 1;
    state.over = false;
    state.player.x = W / 2 - 8;
    state.message = "";
    spawnWave();
    updateHud();
  }

  function updateHud() {
    const s = $(`invaders-score-${state.target}`);
    const b = $(`invaders-best-${state.target}`);
    const w = $(`invaders-wave-${state.target}`);
    if (s) s.textContent = String(state.score);
    if (b) b.textContent = String(state.best);
    if (w) w.textContent = String(state.wave);
    const btn = $(`invaders-start-${state.target}`);
    if (btn) btn.textContent = state.running ? "Pause" : state.over ? "Play again" : state.score ? "Resume" : "Start";
  }

  function say(text, ms = 1200) {
    state.message = text;
    state.messageUntil = Date.now() + ms;
  }

  // ---------------------------
  // Drawing
  // ---------------------------
  function drawSprite(bitmap, x, y, color, scale = 2) {
    const { ctx } = state;
    ctx.fillStyle = color;
    for (let r = 0; r < bitmap.length; r++) {
      const row = bitmap[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c] === "X") ctx.fillRect(Math.round(x + c * scale), Math.round(y + r * scale), scale, scale);
      }
    }
  }

  function draw() {
    const { ctx, theme } = state;
    if (!ctx) return;
    ctx.fillStyle = state.flash > 0 ? theme.invader : theme.bg;
    ctx.fillRect(0, 0, W, H);
    if (state.flash > 0) {
      state.flash--;
      return;
    }

    // header
    ctx.fillStyle = theme.text;
    ctx.font = `${theme.small}px ${theme.font}`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE ${String(state.score).padStart(4, "0")}`, 6, 6);
    ctx.textAlign = "center";
    ctx.fillText(`WAVE ${state.wave}`, W / 2, 6);
    for (let i = 0; i < state.lives; i++) drawSprite(SPRITES.ship[0], W - 14 - i * 12, 5, theme.player, 1);

    // ground line
    ctx.fillStyle = theme.dim;
    ctx.fillRect(0, H - 6, W, 1);

    // invaders
    const f = state.frame % 2;
    state.invaders.forEach((inv) => {
      if (!inv.alive) return;
      drawSprite(SPRITES[inv.type][f], inv.x, inv.y, theme.invader);
    });

    // player
    drawSprite(SPRITES.ship[0], Math.round(state.player.x), H - 6 - state.player.h, theme.player);

    // bullets
    ctx.fillStyle = theme.bullet;
    state.bullets.forEach((b) => ctx.fillRect(b.x, b.y, 2, 6));

    // bombs
    ctx.fillStyle = theme.bomb;
    state.bombs.forEach((b) => {
      ctx.fillRect(b.x, b.y, 2, 3);
      ctx.fillRect(b.x - 1, b.y + 3, 4, 2);
    });

    // messages
    const now = Date.now();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (state.over) {
      ctx.fillStyle = theme.bg;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(30, H / 2 - 36, W - 60, 72);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = theme.invader;
      ctx.strokeRect(30.5, H / 2 - 35.5, W - 61, 71);
      ctx.fillStyle = theme.text;
      ctx.font = `${theme.big}px ${theme.font}`;
      ctx.fillText("GAME OVER", W / 2, H / 2 - 16);
      ctx.font = `${theme.small}px ${theme.font}`;
      ctx.fillText(`score ${state.score}`, W / 2, H / 2 + 4);
      ctx.fillText(state.target === "phone" ? "Select to retry" : "Start to retry", W / 2, H / 2 + 22);
    } else if (state.message && now < state.messageUntil) {
      ctx.fillStyle = theme.text;
      ctx.font = `${theme.big}px ${theme.font}`;
      ctx.fillText(state.message, W / 2, H / 2);
    } else if (!state.running) {
      ctx.fillStyle = theme.text;
      ctx.font = `${theme.small}px ${theme.font}`;
      ctx.fillText(state.target === "phone" ? "Drag to move, tap to fire" : "Arrows move, space fires", W / 2, H - 22);
    }
  }

  // ---------------------------
  // Logic
  // ---------------------------
  function alive() {
    return state.invaders.filter((i) => i.alive);
  }

  function shoot() {
    const now = Date.now();
    if (state.bullets.length >= MAX_BULLETS || now - state.lastShot < FIRE_COOLDOWN_MS) return;
    state.lastShot = now;
    state.bullets.push({ x: state.player.x + state.player.w / 2 - 1, y: H - 6 - state.player.h - 6 });
  }

  function tick() {
    if (!state.running || state.over) return;

    // player
    const speed = 4;
    if (state.input.left) state.player.x -= speed;
    if (state.input.right) state.player.x += speed;
    if (state.drag && state.drag.targetX != null) {
      const dx = state.drag.targetX - state.player.x;
      state.player.x += Math.max(-6, Math.min(6, dx));
    }
    state.player.x = Math.max(2, Math.min(W - state.player.w - 2, state.player.x));
    if (state.input.fire) shoot();

    // bullets
    state.bullets.forEach((b) => { b.y -= BULLET_SPEED; });
    state.bullets = state.bullets.filter((b) => b.y > 12);

    // invaders step
    const living = alive();
    if (!living.length) {
      state.wave++;
      say(`WAVE ${state.wave - 1} CLEARED`, 1300);
      spawnWave();
      updateHud();
      draw();
      return;
    }
    const speedup = 1 - (1 - living.length / (COLS * ROWS)) * 0.75;
    state.stepAcc += TICK_MS;
    if (state.stepAcc >= state.stepMs * speedup) {
      state.stepAcc = 0;
      state.frame++;
      const minX = Math.min(...living.map((i) => i.x));
      const maxX = Math.max(...living.map((i) => i.x + INV_W));
      if ((state.dir > 0 && maxX + 8 > W - 4) || (state.dir < 0 && minX - 8 < 4)) {
        state.dir *= -1;
        living.forEach((i) => { i.y += 10; });
      } else {
        living.forEach((i) => { i.x += 8 * state.dir; });
      }
      if (state.bombs.length < 3 + state.wave && Math.random() < 0.4 + state.wave * 0.08) {
        const shooter = living[Math.floor(Math.random() * living.length)];
        state.bombs.push({ x: shooter.x + INV_W / 2, y: shooter.y + INV_H });
      }
    }

    // bullets vs invaders
    state.bullets = state.bullets.filter((bullet) => {
      for (const inv of living) {
        if (!inv.alive) continue;
        if (bullet.x + 2 > inv.x && bullet.x < inv.x + INV_W && bullet.y + 6 > inv.y && bullet.y < inv.y + INV_H) {
          inv.alive = false;
          state.score += ROW_SCORE[inv.row];
          if (state.score > state.best) {
            state.best = state.score;
            saveBest(state.best);
          }
          updateHud();
          return false;
        }
      }
      return true;
    });

    // bombs
    const py = H - 6 - state.player.h;
    state.bombs = state.bombs.filter((b) => {
      b.y += 3;
      if (b.y > H) return false;
      const hit = b.x + 2 > state.player.x && b.x < state.player.x + state.player.w && b.y + 5 > py && b.y < py + state.player.h;
      if (hit) {
        loseLife();
        return false;
      }
      const idx = state.bullets.findIndex((s) => Math.abs(b.x - s.x) < 4 && Math.abs(b.y - s.y) < 6);
      if (idx !== -1) {
        state.bullets.splice(idx, 1);
        return false;
      }
      return true;
    });

    // invaders reached the bottom
    if (living.some((i) => i.alive && i.y + INV_H >= py)) {
      state.lives = 0;
      gameOver();
      return;
    }

    draw();
  }

  function loseLife() {
    state.lives--;
    state.flash = 2;
    state.bombs = [];
    if (state.lives <= 0) {
      gameOver();
      return;
    }
    say(`SHIP LOST. ${state.lives} LEFT`, 900);
    state.player.x = W / 2 - 8;
  }

  function gameOver() {
    state.over = true;
    state.running = false;
    clearInterval(state.timer);
    updateHud();
    draw();
  }

  // ---------------------------
  // Controls
  // ---------------------------
  function start() {
    if (state.over) reset();
    state.running = true;
    clearInterval(state.timer);
    state.timer = setInterval(tick, TICK_MS);
    updateHud();
    draw();
    state.canvas?.focus({ preventScroll: true });
  }

  function pause() {
    state.running = false;
    clearInterval(state.timer);
    state.input.left = state.input.right = state.input.fire = false;
    updateHud();
    draw();
  }

  function toggle() {
    if (state.running) pause();
    else start();
  }

  function stop() {
    pause();
    reset();
    draw();
  }

  function fire() {
    if (state.over) return;
    if (!state.running) {
      start();
      return;
    }
    shoot();
  }

  // name: "left" | "right" | "fire" | "up", down: boolean. Holding fire keeps shooting.
  function input(name, down) {
    if (name === "left" || name === "right") {
      state.input[name] = down;
      if (down && !state.running && !state.over) start();
    } else if (name === "fire" || name === "up") {
      state.input.fire = down;
      if (down) fire();
    }
  }

  function isActiveWindow() {
    if (state.target === "phone") return true;
    const win = state.canvas?.closest(".window");
    return !!win && win.classList.contains("open") && !win.classList.contains("minimized") && !win.classList.contains("inactive");
  }

  const KEYMAP = { ArrowLeft: "left", ArrowRight: "right", a: "left", d: "right", A: "left", D: "right", " ": "fire", ArrowUp: "fire", w: "fire", W: "fire" };

  function onKeyDown(e) {
    if (!state.canvas || !isActiveWindow()) return;
    if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    const name = KEYMAP[e.key];
    if (!name) return;
    e.preventDefault();
    if (e.repeat) return;
    input(name, true);
  }

  function onKeyUp(e) {
    const name = KEYMAP[e.key];
    if (name) input(name, false);
  }

  function bindPointer(canvas) {
    const toGameX = (clientX) => {
      const r = canvas.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * W;
    };
    canvas.addEventListener("pointerdown", (e) => {
      state.drag = { startX: e.clientX, moved: false, targetX: null };
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!state.drag) return;
      if (Math.abs(e.clientX - state.drag.startX) > 6) state.drag.moved = true;
      if (state.drag.moved) {
        state.drag.targetX = toGameX(e.clientX) - state.player.w / 2;
        if (!state.running && !state.over) start();
      }
    });
    const end = (e) => {
      if (!state.drag) return;
      const tapped = !state.drag.moved;
      state.drag = null;
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      if (tapped) fire();
    };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
  }

  // Backing store at on-screen pixel size, context scaled to logical coordinates: sharp text and sprites.
  function fitCanvas() {
    const canvas = state.canvas;
    if (!canvas) return;
    const cssW = canvas.clientWidth || W;
    const dpr = window.devicePixelRatio || 1;
    const scale = (cssW / W) * dpr;
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    state.ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function mount(target) {
    const canvas = $(`invaders-canvas-${target}`);
    if (!canvas) return;
    if (state.target && state.target !== target) pause();
    state.target = target;
    state.canvas = canvas;
    state.ctx = canvas.getContext("2d");
    state.theme = THEMES[target] || THEMES.desktop;
    state.best = loadBest();
    fitCanvas();
    if (!state.bound.has("resize")) {
      state.bound.add("resize");
      window.addEventListener("resize", () => { fitCanvas(); draw(); });
    }

    if (!state.bound.has(target)) {
      state.bound.add(target);
      bindPointer(canvas);
      const btn = $(`invaders-start-${target}`);
      if (btn) btn.addEventListener("click", toggle);
    }
    if (!state.bound.has("keys")) {
      state.bound.add("keys");
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
    }
    if (!state.invaders.length || state.over) reset();
    state.running = false;
    clearInterval(state.timer);
    updateHud();
    // make sure the pixel font is loaded before the first frame on desktop
    if (document.fonts && target === "desktop") {
      document.fonts.load("8px 'Press Start 2P'").then(draw).catch(draw);
    }
    draw();
  }

  window.InvadersGame = { mount, start, pause, toggle, stop, fire, input, isRunning: () => state.running, isOver: () => state.over };
})();
