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
          setTimeout(blinkCursor, 1100);
        } else {
          cursor.remove();
        }
      }
    }
    blinkCursor();
  }
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
  let width = parseInt(bar.style.width, 10);
  const id = setInterval(() => {
    if (width <= 25) {
      clearInterval(id);
      bar.style.width = "25%";
    } else {
      width--;
      bar.style.width = width + "%";
    }
  }, 10);
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
      }, 500);
    });
  });
}

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

window.addEventListener("load", () => {
  const canvas = document.getElementById("profile-pic");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    blinkEyes(ctx);
  }
  hoverSkillBar();
  typeWriter("Andrea Megan Sustic", 0);
});

function updateExperience() {
  const offset = -currentIndex * 100;
  experienceInner.style.transform = `translateX(${offset}%)`;
}

const experienceInner = document.querySelector(".experience-inner");
const experiences = document.querySelectorAll(".experience-inner article");
const totalExperiences = experiences.length;
let currentIndex = 0;

document.getElementById("next-experience").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % totalExperiences;
  updateExperience();
});

document.getElementById("prev-experience").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + totalExperiences) % totalExperiences;
  updateExperience();
});
