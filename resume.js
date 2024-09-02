function typeWriter(text, n) {
  const element = document.getElementById("typewriter");
  if (n < text.length) {
    element.innerHTML =
      text.substring(0, n + 1) + '<span class="blinking-cursor">|</span>';
    setTimeout(() => typeWriter(text, n + 1), 100);
  } else {
    element.innerHTML = text + '<span class="blinking-cursor">|</span>';
    // Ensure the cursor keeps blinking after typing is finished
    setInterval(() => {
      const cursor = document.querySelector(".blinking-cursor");
      if (cursor) {
        cursor.style.visibility =
          cursor.style.visibility === "hidden" ? "visible" : "hidden";
      }
    }, 500);
  }
}

function drawProfilePic() {
  const canvas = document.getElementById("profile-pic");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing

    ctx.fillStyle = "rgb(245,207,186)";
    ctx.fillRect(54, 45, 91, 90);

    // Mouth
    ctx.fillStyle = "rgb(240,168,137)";
    ctx.fillRect(93, 117, 15, 5);
    ctx.fillRect(88, 112, 5, 5);
    ctx.fillRect(108, 112, 5, 5);

    // Nose
    ctx.fillStyle = "rgb(240,168,137)";
    ctx.fillRect(97, 95, 6, 10);

    // Blush
    ctx.fillStyle = "rgb(252,144,157)";
    ctx.fillRect(65, 97, 15, 8);
    ctx.fillRect(120, 97, 15, 8);

    // Hair
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

    ctx.fillStyle = "rgb(255, 200, 221)";
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
  ctx.fillStyle = "rgb(245,207,186)";
  ctx.fillRect(72, 85, 12, 12);
  ctx.fillRect(117, 85, 12, 12);

  ctx.fillStyle = "rgb(69,45,23)";
  ctx.fillRect(72, 93, 12, 4);
  ctx.fillRect(117, 93, 12, 4);

  setTimeout(() => drawEyes(ctx), 200);
}

function animateSkillBar(bar, percentage) {
  let width = 1;
  const id = setInterval(() => {
    if (width >= percentage) {
      clearInterval(id);
    } else {
      width++;
      bar.style.width = width + "%";
    }
  }, 10);
}

function reverseSkillBar(bar) {
  let width = parseInt(bar.style.width, 50);
  const id = setInterval(() => {
    if (width <= 25) {
      clearInterval(id);
      bar.style.width = "25%";
    } else {
      width--;
      bar.style.width = width + "%";
    }
  }, 5000);
}

function hoverSkillBar() {
  const skillBars = document.querySelectorAll("#language");

  skillBars.forEach((bar) => {
    bar.addEventListener("mouseenter", () => {
      if (!bar.classList.contains("filled")) {
        const percentage = bar.getAttribute("data-percentage");
        animateSkillBar(bar, percentage);
        bar.classList.add("filled");
      }
    });

    bar.addEventListener("mouseleave", () => {
      setTimeout(() => {
        reverseSkillBar(bar);
        bar.classList.remove("filled");
      }, 1000);
    });
  });
}

window.addEventListener("click", () => {
  const canvas = document.getElementById("profile-pic");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    blinkEyes(ctx);
  }
});

// Experience Carousel Logic

function updateScrollIndicator() {
  const indicatorDots = document.querySelectorAll(".indicator-dot");
  indicatorDots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex);
  });
}

let currentIndex = 0;

const experienceInner = document.querySelector(".experience-inner");
const experiences = document.querySelectorAll(".experience-inner article");
const totalExperiences = experiences.length;

document.getElementById("next-experience").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % totalExperiences;
  updateExperience();
  updateScrollIndicator();
});

document.getElementById("prev-experience").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + totalExperiences) % totalExperiences;
  updateExperience();
  updateScrollIndicator();
});

function updateExperience() {
  const offset = -currentIndex * 100;
  experienceInner.style.transform = `translateX(${offset}%)`;
}

// Matrix animation script
(function () {
  var canvas = document.getElementById("matrix-canvas");
  var ctx = canvas.getContext("2d");

  // Matrix characters
  var matrix =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}".split(
      ""
    );
  var font_size = 10;
  var columns;
  var drops;

  // Resize canvas to full screen and recalculate columns
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = canvas.width / font_size; // recalculate columns based on new width
    drops = Array(Math.floor(columns)).fill(1); // recalculate drops array
    drawMatrix(); // Redraw immediately after resizing
  }

  function drawMatrix() {
    ctx.fillStyle = "rgba(255, 248, 253, 0.1)"; // Adjusted to a translucent version of #fff6f9
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffc8dd"; // Adjusted to a color from the palette
    ctx.font = font_size + "px arial";

    drops.forEach((y, i) => {
      var text = matrix[Math.floor(Math.random() * matrix.length)];
      ctx.fillText(text, i * font_size, y * font_size);

      if (y * font_size > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    });
}
  // Resize canvas and redraw on window resize
  window.addEventListener("resize", resizeCanvas);

  // Initial call to resize and draw
  resizeCanvas();
  setInterval(drawMatrix, 35);
})();


// Initialize everything
drawProfilePic();
typeWriter("Andrea Megan Sustic", 0);
hoverSkillBar();
