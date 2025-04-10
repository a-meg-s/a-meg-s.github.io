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
          setTimeout(blinkCursor, 530);
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
    bar.style.width = "98%";

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

// Profile picture drawing
/*function drawProfilePic() {
  const canvas = document.getElementById("profile-pic");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(245,207,186)";
    ctx.fillRect(54, 45, 91, 90);
    ctx.fillStyle = "rgb(240,168,137)";
    ctx.fillRect(93, 117, 15, 5);
    ctx.fillRect(88, 112, 5, 5);
    ctx.fillRect(108, 112, 5, 5);
    ctx.fillStyle = "rgb(240,168,137)";
    ctx.fillRect(97, 95, 6, 10);
    ctx.fillStyle = "rgb(252,144,157)";
    ctx.fillRect(65, 97, 15, 8);
    ctx.fillRect(120, 97, 15, 8);
    ctx.fillStyle = "rgb(150,99,57)";
    ctx.fillRect(70, 30, 60, 15);
    ctx.fillRect(50, 40, 30, 20);
    ctx.fillRect(120, 40, 30, 20);
    ctx.fillRect(42, 55, 15, 110);
    ctx.fillRect(143, 55, 15, 110);
    ctx.fillRect(50, 130, 15, 10);
    ctx.fillRect(135, 130, 15, 10);
    ctx.fillRect(55, 135, 15, 35);
    ctx.fillRect(130, 135, 15, 35);
    ctx.fillStyle = "rgb(179, 157, 219)";
    ctx.fillRect(70, 135, 60, 65);
    drawEyes(ctx);
  }
}

// Draw eyes
function drawEyes(ctx) {
  ctx.fillStyle = "rgb(69,45,23)";
  ctx.fillRect(72, 85, 12, 12);
  ctx.fillRect(117, 85, 12, 12);
}

// Blink eyes
function blinkEyes() {
  const canvas = document.getElementById("profile-pic");
  const ctx = canvas.getContext("2d");

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
*/
// Call drawProfilePic and blinkEyes once the window loads
window.addEventListener("load", () => {
 // drawProfilePic();
 // blinkEyes();
  initSkillBars();
  typeWriter("Andrea Megan Sustic", 0);
});

// Experience Carousel
let currentIndex = 0;

function updateExperience() {
  const experienceInner = document.querySelector(".experience-inner");
  const experiences = document.querySelectorAll(".experience-inner article");
  
  if (experiences.length > 0 && experienceInner) {
    const offset = -currentIndex * 100;
    experienceInner.style.transform = `translateX(${offset}%)`;

    // Update the dots
    const dots = document.querySelectorAll("#scroll-indicator .indicator-dot");
    if (dots) {
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    }
  }
}

document.getElementById("next-experience").addEventListener("click", () => {
  const experiences = document.querySelectorAll(".experience-inner article");
  if (experiences.length > 0) {
    currentIndex = (currentIndex + 1) % experiences.length;
    updateExperience();
  }
});

document.getElementById("prev-experience").addEventListener("click", () => {
  const experiences = document.querySelectorAll(".experience-inner article");
  if (experiences.length > 0) {
    currentIndex = (currentIndex - 1 + experiences.length) % experiences.length;
    updateExperience();
  }
});

// Matrix background effect remains unchanged
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

// Back to Top Button Functionality
document.getElementById("back-to-top").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
