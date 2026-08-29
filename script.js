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
  const intro = document.getElementById("intro");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealWindows() {
    if (reduceMotion) {
      windows.forEach((w) => w.classList.add("is-in"));
      return;
    }
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

  if (intro) {
    let entered = false;
    let armed = false;
    const EDGE = 12;   // px que disparam o retorno ao menu
    const GLOW = 110;  // px que acionam o brilho lateral

    const enter = () => {
      intro.classList.add("is-hidden");
      entered = true;
      armed = false;
      revealWindows();
    };

    const backToMenu = () => {
      if (!entered) return;
      intro.classList.remove("is-hidden");
      document.body.classList.remove("near-left", "near-right");
      entered = false;
      armed = false;
    };

    intro.addEventListener("click", enter);
    intro.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enter();
      }
    });

    // Ao mover o mouse até uma das laterais, volta ao menu inicial
    window.addEventListener("mousemove", (e) => {
      const nearLeft = e.clientX <= GLOW;
      const nearRight = e.clientX >= window.innerWidth - GLOW;
      document.body.classList.toggle("near-left", entered && nearLeft);
      document.body.classList.toggle("near-right", entered && nearRight);

      if (!entered) return;
      const atEdge =
        e.clientX <= EDGE || e.clientX >= window.innerWidth - EDGE;

      if (atEdge) {
        if (armed) backToMenu();
      } else {
        armed = true;
      }
    });
  } else {
    revealWindows();
  }
})();
