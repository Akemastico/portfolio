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

  // Menu superior: destaca a janela alvo ao passar o mouse
  document.querySelectorAll(".menu a").forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    link.addEventListener("mouseenter", () => target.classList.add("window--flash"));
    link.addEventListener("mouseleave", () => target.classList.remove("window--flash"));
  });

  // Animação de entrada em stagger
  const windows = Array.from(document.querySelectorAll(".window"));
  const intro = document.getElementById("intro");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resetWindows() {
    windows.forEach((w) => {
      w.classList.remove("is-in");
      w.style.animationDelay = "";
    });
  }

  function revealWindows() {
    resetWindows();
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
    let inSideGlow = false;
    const EDGE = 12;           // px que disparam o retorno ao menu (laterais)
    const GLOW = 110;          // px que acionam o brilho lateral
    const BOTTOM_ENTER = 60;   // px da base que abrem o terminal
    const BOTTOM_GLOW = 140;   // px da base que acionam o brilho inferior

    const enter = () => {
      if (entered) return;
      intro.classList.add("is-hidden");
      document.body.classList.remove("near-bottom");
      entered = true;
      armed = false;
      inSideGlow = false;
      revealWindows();
    };

    const backToMenu = () => {
      if (!entered) return;
      intro.classList.remove("is-hidden");
      document.body.classList.remove("near-left", "near-right");
      entered = false;
      armed = false;
      inSideGlow = false;
      resetWindows();
    };

    intro.addEventListener("click", enter);
    intro.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enter();
      }
    });

    // Lógica de borda compartilhada entre mouse e toque
    function handlePointer(x, y) {
      const nearLeft = x <= GLOW;
      const nearRight = x >= window.innerWidth - GLOW;
      const nearBottom = y >= window.innerHeight - BOTTOM_GLOW;

      inSideGlow = entered && (nearLeft || nearRight);

      document.body.classList.toggle("near-left", entered && nearLeft);
      document.body.classList.toggle("near-right", entered && nearRight);
      document.body.classList.toggle("near-bottom", !entered && nearBottom);

      // Deslizar/tocar na base da tela abre o terminal
      if (!entered) {
        if (y >= window.innerHeight - BOTTOM_ENTER) enter();
        return;
      }

      // Ao mover o cursor até uma das laterais, volta ao menu inicial
      const atEdge = x <= EDGE || x >= window.innerWidth - EDGE;
      if (atEdge) {
        if (armed) backToMenu();
      } else {
        armed = true;
      }
    }

    window.addEventListener("pointermove", (e) => handlePointer(e.clientX, e.clientY));
    window.addEventListener("pointerdown", (e) => handlePointer(e.clientX, e.clientY));

    // Clique/toque na região de brilho lateral também volta ao menu
    window.addEventListener("click", () => {
      if (entered && inSideGlow) backToMenu();
    });
  } else {
    revealWindows();
  }

  // Timer de ociosidade: após 3s sem interação, suaviza a intro
  const IDLE_DELAY = 3000;
  let idleTimer = null;
  function resetIdle() {
    if (intro) intro.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (intro) intro.classList.add("is-idle");
    }, IDLE_DELAY);
  }
  ["pointermove", "pointerdown", "keydown", "touchmove", "wheel"].forEach((evt) =>
    window.addEventListener(evt, resetIdle, { passive: true })
  );
  resetIdle();
})();
