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

  // Menu superior: destaca a janela alvo ao clicar
  document.querySelectorAll(".menu a").forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      target.classList.remove("window--flash");
      void target.offsetWidth; // reflow para reiniciar a transição
      target.classList.add("window--flash");
      window.setTimeout(() => target.classList.remove("window--flash"), 800);
    });
  });

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
    };

    intro.addEventListener("click", enter);
    intro.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enter();
      }
    });

    window.addEventListener("mousemove", (e) => {
      const nearLeft = e.clientX <= GLOW;
      const nearRight = e.clientX >= window.innerWidth - GLOW;
      const nearBottom = e.clientY >= window.innerHeight - BOTTOM_GLOW;

      inSideGlow = entered && (nearLeft || nearRight);

      document.body.classList.toggle("near-left", entered && nearLeft);
      document.body.classList.toggle("near-right", entered && nearRight);
      document.body.classList.toggle("near-bottom", !entered && nearBottom);

      // Deslizar na base da tela abre o terminal
      if (!entered) {
        if (e.clientY >= window.innerHeight - BOTTOM_ENTER) enter();
        return;
      }

      // Ao mover o mouse até uma das laterais, volta ao menu inicial
      const atEdge =
        e.clientX <= EDGE || e.clientX >= window.innerWidth - EDGE;
      if (atEdge) {
        if (armed) backToMenu();
      } else {
        armed = true;
      }
    });

    // Clique na região de brilho lateral também volta ao menu
    window.addEventListener("click", () => {
      if (entered && inSideGlow) backToMenu();
    });
  } else {
    revealWindows();
  }
})();
