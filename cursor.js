// Shared cursor control for all pages
const CursorController = (() => {
  const cursor = document.getElementById("customCursor");
  const cursorIcons = ["chai.png", "pretzel.png"];
  let currentIconIndex = 0;
  let lastMouse = { x: 0, y: 0, time: 0 };
  let shakeHistory = [];
  let lastToggle = 0;

  function setCursorIcon(index) {
    currentIconIndex = index;
    cursor.src = cursorIcons[currentIconIndex];
  }

  function initializeCursor() {
    const hour = new Date().getHours();
    setCursorIcon(hour >= 6 && hour < 18 ? 0 : 1);
  }

  function toggleCursorIcon() {
    setCursorIcon(currentIconIndex ? 0 : 1);
  }

  function detectShake(x, y, t) {
    if (!lastMouse.time) {
      lastMouse = { x, y, time: t };
      return;
    }

    const dx = x - lastMouse.x;
    const dy = y - lastMouse.y;
    const dir =
      Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : -1) : dy > 0 ? 2 : -2;
    const dist = Math.sqrt(dx * dx + dy * dy);

    shakeHistory.push({ dir, dist, time: t });
    shakeHistory = shakeHistory.filter((item) => t - item.time < 250);

    let changes = 0;
    for (let i = 1; i < shakeHistory.length; i++) {
      if (shakeHistory[i].dir !== shakeHistory[i - 1].dir) {
        changes++;
      }
    }

    const totalDist = shakeHistory.reduce((sum, item) => sum + item.dist, 0);
    if (changes >= 3 && totalDist > 120 && t - lastToggle > 600) {
      toggleCursorIcon();
      lastToggle = t;
      shakeHistory = [];
    }

    lastMouse = { x, y, time: t };
  }

  function addClickEffect() {
    document.addEventListener("click", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1.3)";
      setTimeout(() => {
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
      }, 120);
    });
  }

  function addMouseFollowing(onMove) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.pageX + "px";
      cursor.style.top = e.pageY + "px";
      detectShake(e.pageX, e.pageY, e.timeStamp);
      if (onMove) onMove(e);
    });
  }

  function init(options = {}) {
    initializeCursor();
    addClickEffect();
    addMouseFollowing(options.onMouseMove);
  }

  return { init };
})();
