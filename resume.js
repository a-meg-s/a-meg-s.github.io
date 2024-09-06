// Typewriter effect
function typeWriter(text, n) {
  const element = document.getElementById("typewriter");
  if (n < text.length) {
    element.innerHTML =
      text.substring(0, n + 1) + '<span class="blinking-cursor">|</span>';
    setTimeout(() => typeWriter(text, n + 1), 100);
  } else {
    element.innerHTML = text + '<span class="blinking-cursor">|</span>';
    let blinkCount = 0;
    function blinkCursor() {
      const cursor = document.querySelector(".blinking-cursor");
      if (cursor) {
        cursor.style.visibility =
          cursor.style.visibility === "hidden" ? "visible" : "hidden";
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

// Animate skill bars and handle hover effect
function initSkillBars() {
  const skillBars = document.querySelectorAll(".language-bar");

  skillBars.forEach((bar) => {
    const percentage = bar.getAttribute("data-percentage");
    bar.style.width = "99%";

    bar.addEventListener("mouseenter", () => {
      bar.style.width = percentage + "%";
      bar.classList.add("hovered");
    });

    bar.addEventListener("mouseleave", () => {
      bar.classList.remove("hovered");
      bar.style.backgroundColor = "#b39ddb";
    });
  });
}

// Profile picture drawing
function drawProfilePic() {
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

// Experience Carousel
let currentIndex = 0;

function updateExperience() {
  const experienceInner = document.querySelector(".experience-inner");
  const offset = -currentIndex * 100;
  experienceInner.style.transform = `translateX(${offset}%)`;

  // Update the dots
  const dots = document.querySelectorAll("#scroll-indicator .indicator-dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex);
  });
}

document.getElementById("next-experience").addEventListener("click", () => {
  const experiences = document.querySelectorAll(".experience-inner article");
  currentIndex = (currentIndex + 1) % experiences.length;
  updateExperience();
});

document.getElementById("prev-experience").addEventListener("click", () => {
  const experiences = document.querySelectorAll(".experience-inner article");
  currentIndex = (currentIndex - 1 + experiences.length) % experiences.length;
  updateExperience();
});

function typeText(text, elementId, delay) {
  let i = 0;
  const element = document.getElementById(elementId);
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, delay);
    }
  }
  type();
}

window.addEventListener("load", () => {
  typeText(
    "I’m currently expanding my knowledge in both Python and C, while already having experience with Java, HTML, CSS, SQL, and JavaScript.",
    "current-work-content",
    50
  );
  setTimeout(() => {
    typeText(
      "I've studied various cybersecurity concepts and personally enjoy designing defensive software architecture the most.",
      "current-work-content2",
      50
    );
  }, 3000);
  setTimeout(() => {
    typeText(
      "Fun fact: I’m really good at pattern recognition and puzzle solving!",
      "current-work-content3",
      50
    );
  }, 6000);
});


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
