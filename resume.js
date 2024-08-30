function typeWriter(text, n) {
  if (n < text.length) {
    document.getElementById("typewriter").innerHTML =
      text.substring(0, n + 1) + '<span class="blinking-cursor">|</span>';
    setTimeout(function () {
      typeWriter(text, n + 1);
    }, 100);
  } else {
    document.getElementById("typewriter").innerHTML =
      text + '<span class="blinking-cursor">|</span>';
  }
}

//canva profile pic
function draw() {
  const canvas = document.getElementById("profile-pic");
  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgb(245,207,186)";
    ctx.fillRect(54, 45, 91, 90);

    //mouth
    ctx.fillStyle = "rgb(240,168,137)";
    ctx.fillRect(93, 117, 15, 5);
    ctx.fillRect(88, 112, 5, 5);
    ctx.fillRect(108, 112, 5, 5);

    //nose
    ctx.fillStyle = "rgb(240,168,137)";
    ctx.fillRect(97, 95, 6, 10);

    //blush
    ctx.fillStyle = "rgb(252,144,157)";
    ctx.fillRect(65, 97, 15, 8);
    ctx.fillRect(120, 97, 15, 8);

    //hair
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

    ctx.fillStyle = "rgb(43,112,52)";
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
  // blinked eyes
  ctx.fillStyle = "rgb(245,207,186)"; // Background color to clear old eyes
  ctx.fillRect(72, 85, 12, 12);
  ctx.fillRect(117, 85, 12, 12);

  ctx.fillStyle = "rgb(69,45,23)";
  ctx.fillRect(72, 93, 12, 4);
  ctx.fillRect(117, 93, 12, 4);

  // blink time
  setTimeout(function () {
    drawEyes(ctx);
  }, 200);
}

window.addEventListener("click", function () {
  const canvas = document.getElementById("profile-pic");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    blinkEyes(ctx);
  }
});
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function animateSkillBar(bar, percentage) {
  var width = 1;
  var id = setInterval(frame, 10);

  function frame() {
    if (width >= percentage) {
      clearInterval(id);
    } else {
      width++;
      bar.style.width = width + "%";
    }
  }
}

function fillSkillBar() {
  const skillBars = document.querySelectorAll("#language");

  skillBars.forEach((bar) => {
    if (isInViewport(bar) && !bar.classList.contains("filled")) {
      const percentage = bar.getAttribute("data-percentage");
      bar.classList.add("filled");
    }
  });
}

draw();
typeWriter("Andrea Megan Sustic", 0);
window.addEventListener("hover", fillSkillBar);
