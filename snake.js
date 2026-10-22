// ===== snake.js: a snake made of bits. Shared by the desktop window and the phone LCD. =====
"use strict";

(function () {
  const COLS = 20;
  const ROWS = 15;
  const CELL = 16;

  const THEMES = {
    desktop: { bg: "#000000", ink: "#33ff33", dim: "#117711", head: "#ffffff", font: "W95FA, monospace" },
    phone: { bg: "#c3d59f", ink: "#1b2618", dim: "#6f7f5a", head: "#1b2618", font: "W95FA, monospace" }
  };

  const state = {
    target: null,
    canvas: null,
    ctx: null,
    theme: THEMES.desktop,
    snake: [],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: null,
    score: 0,
    best: 0,
    timer: null,
    running: false,
    over: false,
    tickMs: 140,
    swipeStart: null,
    listenersBound: new Set()
  };

  function $(id) {
    return document.getElementById(id);
  }

  function loadBest() {
    try { return Number(localStorage.getItem("snake-best")) || 0; } catch (_) { return 0; }
  }

  function saveBest(v) {
    try { localStorage.setItem("snake-best", String(v)); } catch (_) { /* ignore */ }
  }

  function randomCell() {
    return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  }

  function placeFood() {
    let cell = randomCell();
    let guard = 0;
    while (state.snake.some((s) => s.x === cell.x && s.y === cell.y) && guard++ < 500) cell = randomCell();
    state.food = { ...cell, byte: Math.floor(Math.random() * 256).toString(16).padStart(2, "0") };
  }

  function reset() {
    state.snake = [
      { x: 6, y: 7, bit: "1" },
      { x: 5, y: 7, bit: "0" },
      { x: 4, y: 7, bit: "1" }
    ];
    state.dir = { x: 1, y: 0 };
    state.nextDir = { x: 1, y: 0 };
    state.score = 0;
    state.over = false;
    state.tickMs = 140;
    placeFood();
    updateHud();
  }

  function updateHud() {
    const s = $(`snake-score-${state.target}`);
    const b = $(`snake-best-${state.target}`);
    if (s) s.textContent = String(state.score);
    if (b) b.textContent = String(state.best);
    const btn = $(`snake-start-${state.target}`);
    if (btn) btn.textContent = state.running ? "Pause" : state.over ? "Play again" : state.snake.length && state.score ? "Resume" : "Start";
  }

  function draw() {
    const { ctx, theme } = state;
    if (!ctx) return;
    const w = COLS * CELL;
    const h = ROWS * CELL;
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, w, h);

    // faint grid dots so the LCD reads as a grid
    ctx.fillStyle = theme.dim;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        ctx.fillRect(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 1);
      }
    }

    ctx.font = `bold 14px ${theme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // food: a hex byte in a box
    if (state.food) {
      const fx = state.food.x * CELL;
      const fy = state.food.y * CELL;
      ctx.strokeStyle = theme.ink;
      ctx.lineWidth = 1;
      ctx.strokeRect(fx + 1.5, fy + 1.5, CELL - 3, CELL - 3);
      ctx.fillStyle = theme.ink;
      ctx.font = `bold 9px ${theme.font}`;
      ctx.fillText(state.food.byte, fx + CELL / 2, fy + CELL / 2 + 0.5);
      ctx.font = `bold 14px ${theme.font}`;
    }

    // body: bits
    state.snake.forEach((seg, i) => {
      const px = seg.x * CELL;
      const py = seg.y * CELL;
      if (i === 0) {
        ctx.fillStyle = theme.head;
        ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
        ctx.fillStyle = theme.bg;
        ctx.fillText(seg.bit, px + CELL / 2, py + CELL / 2 + 1);
      } else {
        ctx.fillStyle = theme.ink;
        ctx.fillText(seg.bit, px + CELL / 2, py + CELL / 2 + 1);
      }
    });

    if (state.over) {
      ctx.fillStyle = theme.bg;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(CELL, h / 2 - 34, w - CELL * 2, 68);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = theme.ink;
      ctx.strokeRect(CELL + 0.5, h / 2 - 34 + 0.5, w - CELL * 2 - 1, 67);
      ctx.fillStyle = theme.ink;
      ctx.font = `bold 13px ${theme.font}`;
      ctx.fillText("Segmentation fault", w / 2, h / 2 - 16);
      ctx.font = `12px ${theme.font}`;
      ctx.fillText(`core dumped: ${state.score} bytes`, w / 2, h / 2 + 4);
      ctx.fillText(state.target === "phone" ? "Press Select to retry" : "Press Start to retry", w / 2, h / 2 + 22);
    } else if (!state.running) {
      ctx.fillStyle = theme.ink;
      ctx.font = `12px ${theme.font}`;
      ctx.fillText(state.target === "phone" ? "Select = start, keys = steer" : "Start, then arrow keys or WASD", w / 2, h - 10);
    }
  }

  function tick() {
    if (!state.running || state.over) return;
    state.dir = state.nextDir;
    const head = state.snake[0];
    const nx = head.x + state.dir.x;
    const ny = head.y + state.dir.y;

    const hitWall = nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS;
    const hitSelf = state.snake.some((s) => s.x === nx && s.y === ny);
    if (hitWall || hitSelf) {
      gameOver();
      return;
    }

    const newHead = { x: nx, y: ny, bit: Math.random() < 0.5 ? "0" : "1" };
    state.snake.unshift(newHead);

    if (state.food && nx === state.food.x && ny === state.food.y) {
      state.score += 1;
      if (state.score > state.best) {
        state.best = state.score;
        saveBest(state.best);
      }
      placeFood();
      if (state.score % 4 === 0 && state.tickMs > 70) {
        state.tickMs -= 8;
        restartTimer();
      }
      updateHud();
    } else {
      state.snake.pop();
    }
    draw();
  }

  function restartTimer() {
    clearInterval(state.timer);
    state.timer = setInterval(tick, state.tickMs);
  }

  function gameOver() {
    state.over = true;
    state.running = false;
    clearInterval(state.timer);
    updateHud();
    draw();
  }

  function start() {
    if (state.over) reset();
    state.running = true;
    restartTimer();
    updateHud();
    draw();
    state.canvas?.focus({ preventScroll: true });
  }

  function pause() {
    state.running = false;
    clearInterval(state.timer);
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

  function setDirection(name) {
    const map = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    const d = map[name];
    if (!d) return;
    // no 180° turns
    if (d.x === -state.dir.x && d.y === -state.dir.y && state.snake.length > 1) return;
    state.nextDir = d;
    if (!state.running && !state.over) start();
  }

  function onKey(e) {
    if (!state.canvas) return;
    const keys = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
      W: "up", S: "down", A: "left", D: "right"
    };
    const dir = keys[e.key];
    const win = state.canvas.closest(".window");
    const windowActive = state.target === "phone" || (win && win.classList.contains("open") && !win.classList.contains("minimized") && !win.classList.contains("inactive"));
    if (!dir || !windowActive) return;
    if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    e.preventDefault();
    setDirection(dir);
  }

  function bindSwipe(canvas) {
    canvas.addEventListener("pointerdown", (e) => {
      state.swipeStart = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("pointerup", (e) => {
      if (!state.swipeStart) return;
      const dx = e.clientX - state.swipeStart.x;
      const dy = e.clientY - state.swipeStart.y;
      state.swipeStart = null;
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
        if (!state.running) start();
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? "right" : "left");
      else setDirection(dy > 0 ? "down" : "up");
    });
  }

  function mount(target) {
    const canvas = $(`snake-canvas-${target}`);
    if (!canvas) return;
    if (state.target && state.target !== target) pause();
    state.target = target;
    state.canvas = canvas;
    state.ctx = canvas.getContext("2d");
    state.theme = THEMES[target] || THEMES.desktop;
    state.best = loadBest();
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;

    if (!state.listenersBound.has(target)) {
      state.listenersBound.add(target);
      bindSwipe(canvas);
      const btn = $(`snake-start-${target}`);
      if (btn) btn.addEventListener("click", toggle);
    }
    if (!state.listenersBound.has("keys")) {
      state.listenersBound.add("keys");
      document.addEventListener("keydown", onKey);
    }
    if (!state.snake.length || state.over) reset();
    state.running = false;
    clearInterval(state.timer);
    updateHud();
    draw();
  }

  window.SnakeGame = { mount, start, pause, toggle, stop, setDirection, isRunning: () => state.running, isOver: () => state.over };
})();
