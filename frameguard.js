// Refuse to run inside a frame on a different origin.
// GitHub Pages cannot send X-Frame-Options or a frame-ancestors directive,
// so this is the fallback. Same-origin framing (index.html embeds
// internet/cv.html) is allowed.
(function () {
  "use strict";
  if (window.top === window.self) return;
  var sameOrigin = false;
  try {
    sameOrigin = window.top.location.origin === window.location.origin;
  } catch (e) {
    sameOrigin = false;
  }
  if (!sameOrigin) {
    document.documentElement.style.display = "none";
    window.top.location.href = window.location.href;
  }
})();
