// ===== resume.js =====
let zIndexCounter = 10000;

// ——— Window Management ———
function openWindow(id) {
  const win = document.getElementById(id);
  const wrapper = document.getElementById("desktop-wrapper");
  if (!win || !wrapper) return;

  win.style.visibility = 'hidden';
  win.style.display = 'block';
  win.style.zIndex = ++zIndexCounter;

  requestAnimationFrame(() => {
    const w = win.offsetWidth;
    const h = win.offsetHeight;
    const rect = wrapper.getBoundingClientRect();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const top = Math.max(rect.top + (rect.height - h) / 2, 10);
    const left = Math.max(rect.left + (rect.width - w) / 2, 10);

    win.style.position = 'fixed';
    win.style.top = `${Math.min(top, vh - 30)}px`;
    win.style.left = `${Math.min(left, vw - 30)}px`;
    win.style.visibility = 'visible';

    if (id === 'about') initLanguageBars();
  });
}

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
    win.style.top = `${e.clientY - offsetY}px`;
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

// ——— Language Bars ———
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

// ——— Clock ———
const updateClock = () => {
  const clock = document.getElementById('taskbar-clock');
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ——— Virus Effect ———
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
  const alertBox = document.createElement('div');
  alertBox.classList.add('window', 'fake-virus-alert', 'virus-popup');
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

  const maxX = Math.max(10, window.innerWidth - 220);  // ensure minimum space
  const maxY = Math.max(10, window.innerHeight - 120);

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  alertBox.style.left = `${x}px`;
  alertBox.style.top = `${y}px`;
  alertBox.style.display = 'block';
}


function showStopVirusButton() {
  const button = document.createElement('button');
  button.textContent = 'Stop Virus';
  button.className = 'stop-virus-button';
  button.onclick = () => {
    document.querySelectorAll('.virus-popup').forEach(el => el.remove());
    button.remove();
  };
  document.body.appendChild(button);
}

function openInternetWindow() {
  openWindow('internet-browser');

  const loader = document.getElementById("internet-loader");
  const iframe = document.getElementById("internet-iframe");

  loader.style.display = 'flex';     // Show loader
  iframe.style.display = 'none';     // Hide iframe initially
  iframe.src = '';                   // Clear previous src

  // Delay and then load content
  setTimeout(() => {
    iframe.src = 'internet/cv.html'; // ✅ Ensure this path is valid
    iframe.onload = () => {
      loader.style.display = 'none';
      iframe.style.display = 'block';
    };
  }, 1200); // Optional delay
}



// ——— Init ———
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

  document.querySelectorAll('.window').forEach(win => {
    win.addEventListener('mousedown', () => {
      win.style.zIndex = ++zIndexCounter;
    });
  });
});
