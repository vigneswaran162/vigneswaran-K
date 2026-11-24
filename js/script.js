/* ==========================================================================
   Vigneswaran – Portfolio scripts (vanilla JS)
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CONTACT_EMAIL = 'vigneswaran162@gmail.com';

  /* ---------- Page loader ---------- */
  const loader = $('#loader');
  document.body.classList.add('is-loading');
  const hideLoader = () => {
    loader.classList.add('done');
    document.body.classList.remove('is-loading');
    document.body.classList.add('ready');
    startReveals();
    startTyping();
  };
  // Minimum display time keeps the animation from flashing
  const minDelay = reduceMotion ? 0 : 1300;
  const started = performance.now();
  const onReady = () => setTimeout(hideLoader, Math.max(0, minDelay - (performance.now() - started)));
  if (document.readyState === 'complete') onReady();
  else window.addEventListener('load', onReady);
  setTimeout(() => { if (!loader.classList.contains('done')) hideLoader(); }, 4000); // safety net

  /* ---------- Split headings into masked words ---------- */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(/\s+/).forEach((word, i, arr) => {
      const outer = document.createElement('span');
      outer.className = 'split-word';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.style.setProperty('--i', i);
      inner.textContent = word;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('split');
  });

  /* ---------- Scroll reveal ---------- */
  function startReveals() {
    const targets = $$('.reveal, [data-split]');
    if (!('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('in')); return; }

    // Stagger siblings that reveal together (e.g. skill cards, project cards)
    $$('.skills, .projects, .ach, .timeline').forEach((group) => {
      $$('.reveal', group).forEach((el, i) => el.style.setProperty('--d', `${(i % 6) * 0.07}s`));
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.matches('[data-count]') || e.target.querySelector('[data-count]')) runCounters(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- Typing effect ---------- */
  function startTyping() {
    const el = $('#typing');
    if (!el) return;
    const roles = ['Full Stack Developer', 'Angular Developer', 'Node.js Developer', 'Problem Solver'];
    if (reduceMotion) { el.textContent = roles[0]; return; }
    let r = 0, c = 0, deleting = false;
    const tick = () => {
      const word = roles[r];
      c += deleting ? -1 : 1;
      el.textContent = word.slice(0, c);
      let delay = deleting ? 45 : 85;
      if (!deleting && c === word.length) { deleting = true; delay = 1600; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
      setTimeout(tick, delay);
    };
    tick();
  }

  /* ---------- Count-up numbers ---------- */
  function runCounters(root) {
    $$('[data-count]', root.matches?.('[data-count]') ? root.parentNode : root).forEach((el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const end = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = end + suffix; return; }
      const t0 = performance.now(), dur = 1400;
      const step = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Navbar: sticky state, progress bar, active link ---------- */
  const nav = $('#nav');
  const progress = $('#progress');
  const links = $$('.nav__link');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      nav.classList.toggle('scrolled', y > 20);
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => {
          const on = l.getAttribute('href') === `#${e.target.id}`;
          l.classList.toggle('active', on);
          on ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Mobile menu ---------- */
  const toggle = $('#navToggle');
  const menu = $('#navMenu');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Smooth anchor scrolling (offset handled by scroll-padding-top) ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id.length > 1 ? $(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Cursor glow + 3D tilt (fine pointers only) ---------- */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    const glow = $('#cursorGlow');
    let gx = 0, gy = 0, raf = null;
    window.addEventListener('pointermove', (e) => {
      gx = e.clientX; gy = e.clientY;
      glow.classList.add('on');
      if (!raf) raf = requestAnimationFrame(() => { glow.style.transform = `translate(${gx}px, ${gy}px)`; raf = null; });
    }, { passive: true });

    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Contact form (opens the user's mail client, as before) ---------- */
  const form = $('#contactForm');
  const status = $('#formStatus');
  const setStatus = (msg, type) => { status.textContent = msg; status.className = `form__status ${type || ''}`; };
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    Object.keys(data).forEach((k) => (data[k] = data[k].trim()));

    $$('.field', form).forEach((f) => f.classList.remove('invalid'));
    const bad = ['name', 'email', 'subject', 'message'].filter((k) => !data[k] || (k === 'email' && !emailRe.test(data[k])));
    if (bad.length) {
      bad.forEach((k) => $(`#${k}`, form).closest('.field').classList.add('invalid'));
      $(`#${bad[0]}`, form).focus();
      setStatus(bad.includes('email') && data.email ? 'Please enter a valid email address.' : 'Please fill out all fields.', 'error');
      return;
    }

    const body = `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
    setStatus('Opening your email app to send the message…', 'ok');
    form.reset();
  });

  /* ---------- Spotlight position on cards ---------- */
  $$('.glass, .skill').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Scroll-linked: timeline fill + parallax section words ---------- */
  const timeline = $('.timeline');
  const heads = $$('.section-head[data-bg]');
  let ticking2 = false;
  const onScroll2 = () => {
    if (ticking2) return;
    ticking2 = true;
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      if (timeline) {
        const r = timeline.getBoundingClientRect();
        const p = (vh * 0.65 - r.top) / r.height;
        timeline.style.setProperty('--tl', Math.min(1, Math.max(0, p)).toFixed(3));
      }
      if (!reduceMotion) {
        heads.forEach((h) => {
          const r = h.getBoundingClientRect();
          h.style.setProperty('--py', `${((r.top + r.height / 2 - vh / 2) * -0.15).toFixed(1)}px`);
        });
      }
      ticking2 = false;
    });
  };
  window.addEventListener('scroll', onScroll2, { passive: true });
  window.addEventListener('resize', onScroll2);
  onScroll2();

  /* ---------- Fine-pointer extras: custom cursor + magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    const dot = $('#cursorDot'), ring = $('#cursorRing');
    if (dot && ring) {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
        window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const follow = () => {
      if (!dot) return;
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(follow);
    };
    follow();
    document.addEventListener('pointerover', (e) => ring.classList.toggle('hot', !!e.target.closest('a, button, [data-tilt], .skill')));
    }

    $$('.btn, .social a, .hero__social a').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1)}px`;
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });

    // Parallax on background orbs
    const orbs = $$('.bg__orb');
    window.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      orbs.forEach((o, i) => { o.style.translate = `${nx * (i + 1) * -40}px ${ny * (i + 1) * -40}px`; });
    }, { passive: true });
  }

  /* ---------- Particle network (interactive canvas) ---------- */
  const canvas = $('#particles');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let W, H, dpr, pts = [], run = true;
    const mouse = { x: -999, y: -999 };
    const init = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr;
      const n = Math.min(90, Math.floor((innerWidth * innerHeight) / 18000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35 * dpr, vy: (Math.random() - 0.5) * 0.35 * dpr,
        r: (Math.random() * 1.4 + 0.6) * dpr,
      }));
    };
    window.addEventListener('resize', init);
    window.addEventListener('pointermove', (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
    document.addEventListener('visibilitychange', () => { run = !document.hidden; if (run) draw(); });
    const LINK = 130;
    function draw() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      const link = LINK * dpr;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 140 * dpr) { p.x += (dx / d) * 1.2; p.y += (dy / d) * 1.2; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = 'rgba(255,170,110,0.75)'; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < link) {
            ctx.strokeStyle = `rgba(255,120,40,${(1 - dist / link) * 0.28})`;
            ctx.lineWidth = dpr * 0.8;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    init(); draw();
  }

  /* ---------- Project details modal ---------- */
  document.querySelectorAll('[data-details]').forEach((btn) => {
    const dlg = document.getElementById(btn.dataset.details);
    if (!dlg || typeof dlg.showModal !== 'function') { btn.hidden = true; return; }
    btn.addEventListener('click', () => dlg.showModal());
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  });

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
