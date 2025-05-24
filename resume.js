// ===== resume.js =====
let zIndexCounter = 10000;

// ——— Window Management ———
const openWindow = id => {
  const win = document.getElementById(id);
  if (!win) return;

  win.style.display = 'block';
  win.style.zIndex = ++zIndexCounter;

  const { innerWidth: W, innerHeight: H } = window;
  const { width: w, height: h } = win.getBoundingClientRect();
  const taskbarHeight = document.querySelector('.taskbar').offsetHeight;

  const top = Math.max((H - taskbarHeight - h) / 2, 0);
  const left = Math.max((W - w) / 2, 0);

  win.style.top = `${top}px`;
  win.style.left = `${left}px`;

  if (id === 'about') initLanguageBars();
};

const closeWindow = id => {
  const win = document.getElementById(id);
  if (win) win.style.display = 'none';
};

// ——— Notepad ———
const openNotepad = (id) => {
  const notepad = document.getElementById('notepad');
  const contentDiv = document.getElementById(`content-${id}`);
  if (!contentDiv) return;

  const title = contentDiv.dataset.title;
  const html = contentDiv.innerHTML;

  document.getElementById('notepad-title').textContent = title;
  document.getElementById('notepad-content').innerHTML = html;

  notepad.style.display = 'block';
  notepad.style.zIndex = ++zIndexCounter;
};

// ——— Drag Functionality ———
const makeDraggable = win => {
  const bar = win.querySelector('.title-bar');
  let offsetX, offsetY;

  const onMouseMove = e => {
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top  = `${e.clientY - offsetY}px`;
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  bar.addEventListener('mousedown', e => {
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;

    win.style.zIndex = ++zIndexCounter;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
};

// ——— Language Bars  ———
const initLanguageBars = () => {
  document.querySelectorAll('#language-container .language-bar').forEach(bar => {
    const fill = bar.querySelector('.bar-fill');
    const pct = bar.dataset.percentage;
    fill.style.width = '0%';
    setTimeout(() => {
      fill.style.width = `${pct}%`;
    }, 50);
  });
};

const resetAllWindows = () => {
  document.querySelectorAll('.window').forEach(w => w.style.display = 'none');
  document.getElementById('start-menu').classList.add('hidden');
};

// ——— Task Manager ———
function populateTaskList() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  document.querySelectorAll('.window').forEach(win => {
    if (win.offsetParent !== null) {
      const titleBar = win.querySelector('.title-bar-text');
      const title = titleBar ? titleBar.textContent : 'Unnamed Window';
      const id = win.id;

      const entry = document.createElement('div');
      entry.classList.add('task-entry');
      entry.innerHTML = `
        <span>${title}</span>
        <button onclick="closeWindow('${id}'); populateTaskList();">❌ Close</button>
      `;
      list.appendChild(entry);
    }
  });

  if (list.innerHTML.trim() === '') {
    list.innerHTML = '<em>No open windows.</em>';
  }
}

// ——— Scroll-and-Highlight (sidebar) ———
const scrollToFile = id => {
  const file = document.getElementById(id);
  if (!file) return;
  file.scrollIntoView({ behavior: 'smooth', block: 'start' });
  file.classList.add('highlight');
  setTimeout(() => file.classList.remove('highlight'), 1000);
};

// ——— Clock ———
const updateClock = () => {
  const clock = document.getElementById('taskbar-clock');
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ——— DOMContentLoaded Initialization ———
document.addEventListener('DOMContentLoaded', () => {
  openWindow('welcome-message');

  updateClock();
  setInterval(updateClock, 1000);

  document.querySelectorAll('.window').forEach(makeDraggable);

  document.querySelectorAll('.explorer-window .file')
    .forEach(file => file.addEventListener('click', () => {
      openNotepad(file.id);
    }));

  const startButton = document.querySelector('.start-button');
  const startMenu = document.getElementById('start-menu');

  startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
      startMenu.classList.add('hidden');
    }
  });

  // Bring window to front when clicked
  document.querySelectorAll('.window').forEach(win => {
    win.addEventListener('mousedown', () => {
      win.style.zIndex = ++zIndexCounter;
    });
  });
});
