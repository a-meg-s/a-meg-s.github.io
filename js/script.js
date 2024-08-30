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

draw();
typeWriter("Andrea Megan Sustic", 0);

fetch("process_recommendation.php")
  .then((response) => response.json())
  .then((recommendations) => {
    // render recommendations in HTML
    renderRecommendations(recommendations);
  })
  .catch((error) => console.error("Error fetching recommendations:", error));

// function to render recommendations in HTML
function renderRecommendations(recommendations) {
  const recommendationsContainer = document.getElementById(
    "recommendationsContainer"
  );

  // clear existing content
  recommendationsContainer.innerHTML = "";

  // loop through recommendations and create HTML elements
  recommendations.forEach((recommendation) => {
    // Create the article element
    const article = document.createElement("article");
    article.classList.add("container");

    const heading = document.createElement("h3");
    heading.textContent = `${recommendation.first_name} ${recommendation.last_name}`;

    const paragraph = document.createElement("p");
    paragraph.textContent = `${recommendation.recommendation}`;

    const hr = document.createElement("hr");

    // append heading, paragraph, and hr to article
    article.appendChild(heading);
    article.appendChild(paragraph);
    article.appendChild(hr);

    // append article to recommendationsContainer

    recommendationsContainer.appendChild(article);
  });
}

// submit comment form using fetch
document
  .getElementById("recommendationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // clear message area
    document.getElementById("warningSection").style.display = "none";
    document.getElementById("successSection").style.display = "none";

    // get form data
    const formData = new FormData(this);

    // submit form data using fetch
    fetch("process_recommendation.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);

        if (responseData.status === "success") {
          // access properties
          const firstName = responseData.data.first_name;
          const lastName = responseData.data.last_name;
          const recommendation = responseData.data.recommendation;
          const message = responseData.message;

          // clear form fields
          document.getElementById("recommendationForm").reset();

          // display success section
          document.getElementById("successSection").style.display = "block";

          // display success message
          document.getElementById("successMessage").innerText = message;
        } else if (responseData.status === "cookieExists") {
          const message = responseData.message;
          // clear form fields
          document.getElementById("recommendationForm").reset();

          // display warning section
          document.getElementById("warningSection").style.display = "block";

          //warning message
          document.getElementById("warningMessage").innerText = message;
        } else {
          //error message
          console.error(
            "Error submitting recommendation:",
            responseData.message
          );
        }
      })
      .catch((error) =>
        console.error("Error submitting recommendation:", error)
      );
  });

//close the warning section
function closeWarningSection() {
  document.getElementById("warningSection").style.display = "none";
}

//close the success section
function closeSuccessSection() {
  document.getElementById("successSection").style.display = "none";
}
