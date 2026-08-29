// ============================================================
// Portfolio — Akemistico
// Relógio + animação de entrada em stagger + typewriter
// ============================================================

(function () {
  "use strict";

  // Relógio no topo
  const clock = document.getElementById("clock");
  function tick() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  if (clock) {
    tick();
    setInterval(tick, 1000);
  }

  // Animação de entrada em stagger
  const windows = Array.from(document.querySelectorAll(".window"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    windows.forEach((w) => w.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = windows.indexOf(entry.target) * 120;
            entry.target.style.animationDelay = `${delay}ms`;
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    windows.forEach((w) => io.observe(w));
  }
})();
