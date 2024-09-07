'use strict';

// Typewriter effect with safer DOM manipulation
function typeWriter(text, n) {
  const element = document.getElementById("typewriter");
  if (n < text.length) {
    element.textContent = text.substring(0, n + 1);  // Use textContent to avoid XSS
    const cursor = document.createElement('span');
    cursor.classList.add('blinking-cursor');
    cursor.textContent = '|';
    element.appendChild(cursor);
    setTimeout(() => typeWriter(text, n + 1), 100);
  } else {
    const cursor = document.querySelector(".blinking-cursor");
    let blinkCount = 0;
    function blinkCursor() {
      if (cursor) {
        cursor.style.visibility = cursor.style.visibility === "hidden" ? "visible" : "hidden";
        blinkCount++;
        if (blinkCount < 10) {
          setTimeout(blinkCursor, 900);
        } else {
          cursor.remove();
        }
      }
    }
    blinkCursor();
  }
}

// Animate skill bars securely
function initSkillBars() {
  const skillBars = document.querySelectorAll(".language-bar");
  skillBars.forEach((bar) => {
    const percentage = bar.getAttribute("data-percentage");
    bar.style.width = "99%";

    bar.addEventListener("mouseenter", () => {
      bar.style.width = `${percentage}%`;  // Use template literals for dynamic values
      bar.classList.add("hovered");
    });

    bar.addEventListener("mouseleave", () => {
      bar.classList.remove("hovered");
      bar.style.backgroundColor = "#b39ddb";
    });
  });
}

// Profile picture drawing (no security risks here, keeping it as is)
function drawProfilePic() {
  const canvas = document.getElementById("profile-pic");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Drawing code as before...
    drawEyes(ctx);
  }
}

function drawEyes(ctx) {
  ctx.fillStyle = "rgb(69,45,23)";
  ctx.fillRect(72, 85, 12, 12);
  ctx.fillRect(117, 85, 12, 12);
}

function blinkEyes(ctx) {
  function blink() {
    ctx.fillStyle = "rgb(245,207,186)";
    ctx.fillRect(72, 85, 12, 12);
    ctx.fillRect(117, 85, 12, 12);
    ctx.fillStyle = "rgb(69,45,23)";
    ctx.fillRect(72, 93, 12, 4);
    ctx.fillRect(117, 93, 12, 4);
    setTimeout(() => drawEyes(ctx), 200);
    const randomInterval = Math.random() * (7000 - 1000) + 1000;
    setTimeout(blink, randomInterval);
  }
  blink();
}

// Initialize everything
window.addEventListener("load", () => {
  const canvas = document.getElementById("profile-pic");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    blinkEyes(ctx);
    drawProfilePic();
  }
  initSkillBars();
  typeWriter("Andrea Megan Sustic", 0);
});

// Matrix background effect remains unchanged
// Matrix background effect
(function () {
  const canvas = document.getElementById("matrix-canvas");
  const ctx = canvas.getContext("2d");

  const matrixChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}".split(
      ""
    );
  const fontSize = 10;
  let columns, drops;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
      if (y * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    });
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  setInterval(drawMatrix, 35);
})();
