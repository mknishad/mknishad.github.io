/* =========================================================
   Monir Hossain — Portfolio interactions
   ========================================================= */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- current year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- theme toggle ---------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);

  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#f3f5fa" : "#07070b");
  });

  /* ---------- mobile nav ---------- */
  const burger = $("#navBurger");
  const navLinks = $("#navLinks");
  const closeMenu = () => {
    burger?.classList.remove("open");
    navLinks?.classList.remove("open");
    burger?.setAttribute("aria-expanded", "false");
  };
  burger?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#navLinks a").forEach(a => a.addEventListener("click", closeMenu));

  /* ---------- nav scroll state + scroll progress + scrollspy ---------- */
  const nav = $("#nav");
  const progress = $(".scroll-progress span");
  const sections = $$("main section[id], footer[id]");
  const navAnchors = $$("#navLinks a");

  const onScroll = () => {
    const y = window.scrollY;
    nav?.classList.toggle("scrolled", y > 30);

    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }

    // scrollspy
    let current = "";
    const mid = y + window.innerHeight * 0.35;
    sections.forEach(s => { if (s.offsetTop <= mid) current = s.id; });
    navAnchors.forEach(a =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + current)
    );
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- scroll reveal ---------- */
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          entry.target.style.transitionDelay = delay + "ms";
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in"));
  }

  /* ---------- typewriter ---------- */
  const tw = $("#typewriter");
  if (tw && !prefersReduced) {
    const words = [
      "Android apps.",
      "with Jetpack Compose.",
      "in Kotlin.",
      "cross-platform with Flutter.",
      "scalable mobile products.",
    ];
    let w = 0, c = 0, deleting = false;
    const tick = () => {
      const word = words[w];
      tw.textContent = word.slice(0, c);
      if (!deleting && c < word.length) {
        c++;
        setTimeout(tick, 70);
      } else if (deleting && c > 0) {
        c--;
        setTimeout(tick, 35);
      } else if (!deleting && c === word.length) {
        deleting = true;
        setTimeout(tick, 1600);
      } else {
        deleting = false;
        w = (w + 1) % words.length;
        setTimeout(tick, 300);
      }
    };
    tick();
  } else if (tw) {
    tw.textContent = "Android apps.";
  }

  /* ---------- animated counters ---------- */
  const counters = $$(".stat__num");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        if (prefersReduced) { el.textContent = target + suffix; cio.unobserve(el); return; }
        const dur = 1400;
        let start = null;
        const step = (ts) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- cursor glow + skill-card spotlight ---------- */
  if (finePointer && !prefersReduced) {
    const glow = $(".cursor-glow");
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy;
    window.addEventListener("mousemove", (e) => {
      gx = e.clientX; gy = e.clientY;
      glow?.classList.add("active");
    });
    const render = () => {
      cx += (gx - cx) * 0.15;
      cy += (gy - cy) * 0.15;
      if (glow) glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    };
    render();

    $$(".skill-card").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- 3D tilt ---------- */
  if (finePointer && !prefersReduced) {
    $$("[data-tilt]").forEach(el => {
      const strength = el.classList.contains("phone") ? 8 : 6;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-4px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- particle background ---------- */
  const canvas = $("#particles");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let w, h, particles, raf;
    const COUNT = () => Math.min(70, Math.floor(window.innerWidth / 22));

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const make = () => {
      particles = Array.from({ length: COUNT() }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.4,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(61, 220, 132, 0.55)";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = dx * dx + dy * dy;
          if (dist < 16000) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(120, 200, 230, ${0.16 * (1 - dist / 16000)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize(); make(); draw();
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { resize(); make(); }, 200);
    });
    // pause when tab hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }
})();
