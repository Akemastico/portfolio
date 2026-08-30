// ============================================================
// Portfolio — Akemistico
// Relógio, entrada em stagger, navegação por bordas e ociosidade
// ============================================================

(function () {
  "use strict";

  const EDGE = 12; // px que disparam o retorno ao menu (laterais)
  const GLOW = 110; // px que acionam o brilho lateral
  const BOTTOM_ENTER = 60; // px da base que abrem o terminal
  const BOTTOM_GLOW = 140; // px da base que acionam o brilho inferior
  const IDLE_DELAY = 3000; // ms sem interação para suavizar a intro

  const windows = Array.from(document.querySelectorAll(".window"));
  const intro = document.getElementById("intro");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Relógio --------------------------------------------------

  const clock = document.getElementById("clock");

  /** Formata um número inteiro para dois dígitos (ex.: 5 → "05"). */
  const pad = (n) => String(n).padStart(2, "0");

  /** Atualiza o relógio do topo com o horário atual. */
  function tick() {
    const now = new Date();
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  if (clock) {
    tick();
    setInterval(tick, 1000);
  }

  // --- Menu superior: destaque por hover -------------------------

  document.querySelectorAll(".menu a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const target = document.querySelector(href);
    if (!target) return;
    link.addEventListener("mouseenter", () => target.classList.add("window--flash"));
    link.addEventListener("mouseleave", () => target.classList.remove("window--flash"));
  });

  // --- Entrada das janelas ---------------------------------------

  /** Remove o estado de "entrada" para permitir reanimar a cada abertura. */
  function resetWindows() {
    windows.forEach((w) => {
      w.classList.remove("is-in");
      w.style.animationDelay = "";
    });
  }

  /** Revela as janelas com stagger (ou imediatamente, se reduzir movimento). */
  function revealWindows() {
    resetWindows();
    if (reduceMotion) {
      windows.forEach((w) => w.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = windows.indexOf(entry.target) * 120;
          entry.target.style.animationDelay = `${delay}ms`;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    windows.forEach((w) => observer.observe(w));
  }

  // --- Navegação da intro (entrar / voltar) ----------------------

  if (intro) {
    let entered = false;
    let armed = false;
    let inSideGlow = false;

    /** Abre os terminais, escondendo a intro. */
    const enter = () => {
      if (entered) return;
      intro.classList.add("is-hidden");
      document.body.classList.remove("near-bottom");
      entered = true;
      armed = false;
      inSideGlow = false;
      revealWindows();
    };

    /** Volta ao menu inicial, recolhendo as janelas. */
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

    /**
     * Trata a posição do ponteiro (mouse ou toque) para abrir/voltar.
     * @param {number} x - coordenada horizontal em px.
     * @param {number} y - coordenada vertical em px.
     */
    function handlePointer(x, y) {
      const nearLeft = x <= GLOW;
      const nearRight = x >= window.innerWidth - GLOW;
      const nearBottom = y >= window.innerHeight - BOTTOM_GLOW;

      inSideGlow = entered && (nearLeft || nearRight);

      document.body.classList.toggle("near-left", entered && nearLeft);
      document.body.classList.toggle("near-right", entered && nearRight);
      document.body.classList.toggle("near-bottom", !entered && nearBottom);

      // Deslizar/tocar na base da tela abre o terminal.
      if (!entered) {
        if (y >= window.innerHeight - BOTTOM_ENTER) enter();
        return;
      }

      // Ao mover o cursor até uma das laterais, volta ao menu.
      const atEdge = x <= EDGE || x >= window.innerWidth - EDGE;
      if (atEdge) {
        if (armed) backToMenu();
      } else {
        armed = true;
      }
    }

    window.addEventListener("pointermove", (e) => handlePointer(e.clientX, e.clientY));
    window.addEventListener("pointerdown", (e) => handlePointer(e.clientX, e.clientY));

    // Clique/toque na região de brilho lateral também volta ao menu.
    window.addEventListener("click", () => {
      if (entered && inSideGlow) backToMenu();
    });
  } else {
    revealWindows();
  }

  // --- Ociosidade ------------------------------------------------

  let idleTimer = null;

  /** Reinicia o contador de ociosidade; suaviza a intro após IDLE_DELAY. */
  function resetIdle() {
    intro?.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => intro?.classList.add("is-idle"), IDLE_DELAY);
  }

  ["pointermove", "pointerdown", "keydown", "touchmove", "wheel"].forEach((evt) =>
    window.addEventListener(evt, resetIdle, { passive: true })
  );
  resetIdle();
})();
