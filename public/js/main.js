/* =========================================================
   Aqualume — interactions
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = (n) => CURRENCY + (Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth <= 860 || !finePointer;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  // Always start at the surface: a reload must not drop you mid-transition behind the loader.
  ScrollTrigger.clearScrollMemory("manual");
  addEventListener("beforeunload", () => scrollTo(0, 0));
  scrollTo(0, 0);

  /* =====================================================
     VIDEO SOURCES
     ===================================================== */
  const screenPx = innerWidth * Math.min(devicePixelRatio, 2);
  function loadVideo(video) {
    if (video.dataset.loaded) return;
    video.dataset.loaded = "1";
    const d = video.dataset;
    // On mobile screens, never load heavy 4K/2K streams to ensure 60fps playback
    video.src = isMobile ? d.src : ((screenPx > 2600 && d.src4k) || (screenPx > 1600 && d.src2k) || d.src);
    video.load();
  }
  const sceneVideos = $$(".scene-video");

  /* =====================================================
     LOADER — fill the tank, then dive
     ===================================================== */
  const loader = $("#loader");
  const diveBtn = $("#diveBtn");
  const depthNum = $("#depthNum");
  const depthFill = $("#depthFill");

  (function loaderBubbles() {
    const c = $("#loaderBubbles");
    const ctx = c.getContext("2d");
    let w, h, bubbles = [];
    const resize = () => { w = c.width = innerWidth * devicePixelRatio; h = c.height = innerHeight * devicePixelRatio; };
    resize(); addEventListener("resize", resize);
    for (let i = 0; i < 70; i++) bubbles.push(newBubble(true));
    function newBubble(init) {
      return { x: Math.random() * w, y: init ? Math.random() * h : h + 20, r: (Math.random() * 4 + 1) * devicePixelRatio, s: Math.random() * 1.2 + .4, o: Math.random() * Math.PI * 2 };
    }
    (function tick() {
      if (!loader.isConnected) return;
      ctx.clearRect(0, 0, w, h);
      bubbles.forEach((b, i) => {
        b.y -= b.s * devicePixelRatio; b.o += .03;
        const x = b.x + Math.sin(b.o) * 6;
        ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(160,255,228,.35)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(x - b.r * .35, b.y - b.r * .35, b.r * .25, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.fill();
        if (b.y < -20) bubbles[i] = newBubble(false);
      });
      requestAnimationFrame(tick);
    })();
  })();

  gsap.from(".loader-title span, .loader-title em", { yPercent: 110, opacity: 0, duration: 1.4, stagger: .12, ease: "expo.out", delay: .2 });

  // Real loading progress: first video buffered + fonts, with a time-based floor so it never hangs.
  let progress = 0, target = 0, ready = false;
  const firstVideo = sceneVideos[0];
  loadVideo(firstVideo);
  const markReady = () => { ready = true; };
  firstVideo.addEventListener("canplaythrough", markReady, { once: true });
  firstVideo.addEventListener("error", markReady, { once: true });
  if (firstVideo.readyState >= 4) markReady();
  setTimeout(markReady, 6000);
  const t0 = performance.now();
  (function loadTick() {
    const elapsed = (performance.now() - t0) / 1000;
    let buffered = 0;
    try { if (firstVideo.duration && firstVideo.buffered.length) buffered = firstVideo.buffered.end(0) / firstVideo.duration; } catch {}
    target = ready ? 100 : Math.min(92, Math.max(elapsed * 22, buffered * 300));
    progress = lerp(progress, target, .12);
    const shown = Math.round(progress);
    depthNum.textContent = shown;
    depthFill.style.width = shown + "%";
    if (ready && progress > 97) {
      depthNum.textContent = 100;
      diveBtn.disabled = false;
      $(".dive-label", diveBtn).textContent = "Dive in";
      return;
    }
    setTimeout(loadTick, 16); // timer, not rAF, so loading never stalls in a background tab
  })();

  diveBtn.addEventListener("click", () => {
    scrollTo(0, 0);
    Sound.start();
    firstVideo.play().catch(() => {});
    const tl = gsap.timeline({
      onComplete: () => {
        loader.remove();
        document.body.classList.remove("is-loading");
        lenis?.start();
        ScrollTrigger.refresh();
      },
    });
    tl.to(".loader-inner", { scale: 1.6, opacity: 0, duration: 1, ease: "power3.in" })
      .to(loader, { clipPath: "circle(0% at 50% 50%)", duration: 1.1, ease: "expo.inOut" }, "-=.4")
      .from(".scene--planted .scene-media", { scale: 1.35, duration: 2.4, ease: "expo.out" }, "-=.8")
      .from(".scene--planted .scene-title span, .scene--planted .scene-title em", { yPercent: 120, opacity: 0, stagger: .1, duration: 1.4, ease: "expo.out" }, "-=2")
      .from(".scene--planted .eyebrow, .scene--planted .scene-sub", { y: 20, opacity: 0, stagger: .1, duration: 1, ease: "power3.out" }, "-=1.4")
      .from(".scene--planted .hotspot", { scale: 0, opacity: 0, stagger: .08, duration: .8, ease: "back.out(2)" }, "-=1.2")
      .from(".nav, .scene-hud > *", { autoAlpha: 0, stagger: .05, duration: .8, clearProps: "opacity,visibility" }, "-=1");
  });
  loader.style.clipPath = "circle(150% at 50% 50%)";

  /* =====================================================
     SMOOTH SCROLL
     ===================================================== */
  let lenis = null;
  if (!reduceMotion && typeof Lenis !== "undefined" && finePointer && !isMobile) {
    lenis = window.lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(500, 33);
    if (loader.isConnected) lenis.stop();
  } else {
    gsap.ticker.lagSmoothing(500, 33);
  }
  const scrollToY = (y) => (lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: "smooth" }));
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const el = $(a.getAttribute("href"));
      if (!el) return;
      e.preventDefault();
      scrollToY(el.getBoundingClientRect().top + scrollY);
    })
  );

  /* =====================================================
     AMBIENT SOUND — synthesised underwater hum + bubbles
     ===================================================== */
  const Sound = (() => {
    let ctx, master, on = false, bubbleTimer;
    const btn = $("#soundBtn");
    function build() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      // brown noise
      const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
      const lfo = ctx.createOscillator(); lfo.frequency.value = .08;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 160;
      lfo.connect(lfoGain).connect(lp.frequency);
      const ng = ctx.createGain(); ng.gain.value = .55;
      src.connect(lp).connect(ng).connect(master);
      src.start(); lfo.start();
    }
    function bubble() {
      if (!on) return;
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      const f = 260 + Math.random() * 500;
      o.type = "sine"; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 2.6, t + .09);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .12);
      o.connect(g).connect(master); o.start(t); o.stop(t + .14);
      bubbleTimer = setTimeout(bubble, 300 + Math.random() * 2600);
    }
    function set(v) {
      if (!ctx) build();
      on = v;
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(v ? .5 : 0, ctx.currentTime + 1.2);
      btn.classList.toggle("sound-on", v);
      clearTimeout(bubbleTimer);
      if (v) bubble();
    }
    btn.addEventListener("click", () => set(!on));
    return {
      start: () => { try { set(true); } catch {} },
      blip: () => { if (on) { const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(1400, t + .08); g.gain.setValueAtTime(.06, t); g.gain.exponentialRampToValueAtTime(.0001, t + .12); o.connect(g).connect(master); o.start(t); o.stop(t + .13); } },
    };
  })();

  /* =====================================================
     CURSOR + BUBBLE TRAIL
     ===================================================== */
  const cursor = $("#cursor");
  const cLabel = $(".c-label", cursor);
  const cRing = $(".c-ring", cursor);
  const cDot = $(".c-dot", cursor);
  const ring = { x: mouse.x, y: mouse.y };
  if (finePointer && cursor) {
    addEventListener("pointermove", () => cursor.classList.remove("is-hidden"), { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("mouseenter", () => cursor.classList.remove("is-hidden"));

    gsap.ticker.add(() => {
      ring.x = lerp(ring.x, mouse.x, .18); ring.y = lerp(ring.y, mouse.y, .18);
      cRing.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%,-50%)`;
      cLabel.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%,-50%)`;
      cDot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%,-50%)`;
    });
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor], a, button, .hotspot, input, select, .card, .cat");
      cursor.classList.remove("is-hover", "is-label");
      if (!t) return;
      const label = t.dataset.cursor || (t.classList.contains("hotspot") ? "Discover" : t.classList.contains("cat") ? "Explore" : "");
      if (label) { cLabel.textContent = label; cursor.classList.add("is-label"); }
      else cursor.classList.add("is-hover");
    });
  }

  (function bubbleTrail() {
    if (!finePointer || reduceMotion) return;
    const c = $("#bubbleTrail");
    if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = Math.min(devicePixelRatio, 2);
    let parts = [], last = { x: 0, y: 0 };
    const resize = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; };
    resize(); addEventListener("resize", resize);
    addEventListener("pointermove", (e) => {
      const d = Math.hypot(e.clientX - last.x, e.clientY - last.y);
      if (d > 14 && parts.length < 90) {
        parts.push({ x: e.clientX + (Math.random() - .5) * 10, y: e.clientY, r: Math.random() * 3 + 1, vy: -(Math.random() * .8 + .4), life: 1, o: Math.random() * 6 });
        last = { x: e.clientX, y: e.clientY };
      }
    }, { passive: true });
    gsap.ticker.add(() => {
      if (!parts.length) return; // skip when idle to save GPU frames!
      ctx.clearRect(0, 0, c.width, c.height);
      parts = parts.filter((p) => p.life > 0);
      for (const p of parts) {
        p.y += p.vy; p.o += .1; p.life -= .012;
        const x = (p.x + Math.sin(p.o) * 2) * dpr, y = p.y * dpr;
        ctx.globalAlpha = p.life * .7;
        ctx.beginPath(); ctx.arc(x, y, p.r * dpr, 0, 6.283);
        ctx.strokeStyle = "#bff9e8"; ctx.lineWidth = dpr * .8; ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  })();

  // magnetic + button glow
  if (finePointer) {
    $$("[data-magnetic], .btn").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: dx * .25, y: dy * .3, duration: .5, ease: "power3.out" });
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
      el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: .8, ease: "elastic.out(1,.4)" }));
    });
  }

  /* =====================================================
     NAV & MOBILE MENU
     ===================================================== */
  const nav = $(".nav");
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("is-hidden", y > lastY && y > 200);
    nav.classList.toggle("is-solid", y > 60);
    lastY = y;
  }, { passive: true });

  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");
  const menuCloseBtn = $("#menuCloseBtn");
  const menuBackdrop = $("#menuBackdrop");

  const openMobileMenu = () => {
    mobileMenu?.classList.add("is-open");
    menuBtn?.classList.add("is-active");
    mobileMenu?.setAttribute("aria-hidden", "false");
    menuBtn?.setAttribute("aria-expanded", "true");
  };
  const closeMobileMenu = () => {
    mobileMenu?.classList.remove("is-open");
    menuBtn?.classList.remove("is-active");
    mobileMenu?.setAttribute("aria-hidden", "true");
    menuBtn?.setAttribute("aria-expanded", "false");
  };

  menuBtn?.addEventListener("click", () => {
    mobileMenu?.classList.contains("is-open") ? closeMobileMenu() : openMobileMenu();
  });
  menuCloseBtn?.addEventListener("click", closeMobileMenu);
  menuBackdrop?.addEventListener("click", closeMobileMenu);
  $$(".mobile-nav-links a").forEach((a) => {
    a.addEventListener("click", (e) => {
      closeMobileMenu();
      const el = $(a.getAttribute("href"));
      if (!el) return;
      e.preventDefault();
      setTimeout(() => scrollToY(el.getBoundingClientRect().top + scrollY), 100);
    });
  });

  /* =====================================================
     IMMERSIVE SCENES
     ===================================================== */
  const stage = $(".scenes-stage");
  const scenes = $$(".scene");
  const dots = $$(".scene-dots button");
  const card = $("#specCard");
  let active = 0;
  const savedPaths = store.get("aqualume-paths", {});

  // Build hotspots
  const allHotspots = [];
  scenes.forEach((sceneEl, si) => {
    const key = $(".hotspots", sceneEl).dataset.hotspots;
    const layer = $(".hotspots", sceneEl);
    HOTSPOTS[key].forEach((hs, hi) => {
      const el = document.createElement("button");
      el.className = "hotspot";
      el.dataset.kind = hs.kind;
      el.setAttribute("aria-label", hs.label);
      el.innerHTML = `<span class="hs-tag">${hs.label}</span>`;
      layer.appendChild(el);
      const pathKey = `${key}:${hi}`;
      const h = { ...hs, sx: hs.x ?? 50, sy: hs.y ?? 50, el, scene: si, key: pathKey, path: savedPaths[pathKey] || hs.path, held: false, clock: Math.random() * 10, x: 0, y: 0 };
      allHotspots.push(h);
      el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") openCard(h); });
      el.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") scheduleClose(); });
      el.addEventListener("focus", () => { if (el.matches(":focus-visible")) openCard(h); });
      el.addEventListener("click", (e) => { e.stopPropagation(); card.classList.contains("is-open") && card.dataset.key === h.key ? closeCard() : openCard(h); });
    });
  });
  const found = new Set(store.get("aqualume-found", []));
  $("#foundTotal").textContent = allHotspots.length;
  const updateFound = () => {
    $("#foundNum").textContent = found.size;
    allHotspots.forEach((h) => h.el.classList.toggle("is-found", found.has(h.key)));
  };
  updateFound();

  // Video-frame % → stage px, honouring object-fit: cover, object-position and any CSS transform.
  const objPos = new Map();
  function videoBox(video, stageRect) {
    const r = video.getBoundingClientRect();
    const vw = video.videoWidth || 1920, vh = video.videoHeight || 1080;
    const s = Math.max(r.width / vw, r.height / vh), dw = vw * s, dh = vh * s;
    if (!objPos.has(video)) {
      const [ox, oy] = getComputedStyle(video).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
      objPos.set(video, [isNaN(ox) ? .5 : ox, isNaN(oy) ? .5 : oy]);
    }
    const [ox, oy] = objPos.get(video);
    return { x: r.left - stageRect.left + (r.width - dw) * ox, y: r.top - stageRect.top + (r.height - dh) * oy, w: dw, h: dh };
  }
  addEventListener("resize", () => objPos.clear());

  // Hotspot position (video %): recorded path → orbit → static
  function hotspotPos(h, video, dt) {
    if (!h.held) h.clock += dt;
    if (h.path && h.path.length > 1 && video.duration) {
      const t = (video.currentTime % video.duration) / video.duration;
      const p = h.path;
      let i = p.findIndex((k) => k[0] > t);
      if (i === -1) i = p.length;
      const a = p[(i - 1 + p.length) % p.length], b = p[i % p.length];
      const span = (b[0] - a[0] + 1) % 1 || 1;
      const f = ((t - a[0] + 1) % 1) / span;
      return [lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
    }
    if (h.orbit) {
      const o = h.orbit, a = h.clock * o.speed * Math.PI * 2 + o.phase;
      return [o.cx + Math.cos(a) * o.rx + Math.sin(a * 2.3) * 1.2, o.cy + Math.sin(a) * o.ry + Math.cos(a * 1.7) * 1];
    }
    return [h.sx, h.sy];
  }

  // Card
  let closeTimer;
  function openCard(h) {
    clearTimeout(closeTimer);
    allHotspots.forEach((o) => { o.held = false; o.el.classList.remove("is-open"); });
    h.held = true;
    h.el.classList.add("is-open");
    const p = productById[h.product];
    card.dataset.key = h.key;
    card.dataset.product = p.id;
    const img = $(".spec-img img", card);
    $(".spec-img", card).querySelectorAll(".art").forEach((n) => n.remove());
    if (p.img) { img.style.display = ""; img.src = p.zoom ? p.img.replace(/w=\d+/, "w=1600") : p.img; img.alt = p.name; img.style.setProperty("--z", p.zoom || 1); img.style.setProperty("--o", p.imgPos || "50% 50%"); }
    else { img.style.display = "none"; $(".spec-img", card).insertAdjacentHTML("afterbegin", `<div class="art art--food">${p.art}</div>`); }
    $(".spec-type", card).textContent = h.kind === "plant" && p.cat !== "plants" ? "In this scene" : ({ fish: "Live fish", koi: "Koi", monster: "Monster fish", plants: "Aquatic plant" }[p.cat] || "Shop");
    $(".spec-name", card).textContent = p.name;
    $(".spec-latin", card).textContent = p.latin;
    $(".spec-stats", card).innerHTML = Object.entries(p.stats).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    $(".spec-desc", card).textContent = p.desc;
    $(".spec-price", card).textContent = money(p.price);
    positionCard(h);
    card.classList.add("is-open");
    card.setAttribute("aria-hidden", "false");
    if (!found.has(h.key)) {
      found.add(h.key); store.set("aqualume-found", [...found]); updateFound();
      Sound.blip();
      if (found.size === allHotspots.length) toast("🐠 You discovered every species! Use code DEEPDIVE for 10% off.");
    }
  }
  function positionCard(h) {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    if (sw < 700) return; // mobile: CSS docks the card
    const cw = card.offsetWidth || 330, ch = card.offsetHeight || 420;
    let x = h.x + 44, y = h.y - ch / 2;
    if (x + cw > sw - 20) x = h.x - cw - 44;
    y = clamp(y, 80, sh - ch - 20);
    card.style.left = x + "px"; card.style.top = y + "px";
  }
  function scheduleClose() { closeTimer = setTimeout(closeCard, 350); }
  function closeCard() {
    card.classList.remove("is-open");
    card.setAttribute("aria-hidden", "true");
    allHotspots.forEach((o) => { o.held = false; o.el.classList.remove("is-open"); });
  }
  $("#specClose")?.addEventListener("click", (e) => { e.stopPropagation(); closeCard(); });
  card.addEventListener("pointerenter", () => clearTimeout(closeTimer));
  card.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") scheduleClose(); });
  $(".spec-add", card).addEventListener("click", (e) => { addToCart(card.dataset.product, 1, e.currentTarget); });
  stage.addEventListener("click", (e) => { if (!e.target.closest(".spec-card, .hotspot")) closeCard(); });

  // Per-frame scene update
  let lastT = performance.now();
  const media = $$(".scene-media");
  const par = { x: 0, y: 0 };
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    const rect = stage.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const sw = rect.width, sh = rect.height;
    const sceneEl = scenes[active], video = sceneVideos[active];
    const paused = video.paused;
    const boxes = sceneVideos.map((v, i) => (i === active || i === active + 1 ? videoBox(v, rect) : null));
    allHotspots.forEach((h) => {
      const box = boxes[h.scene];
      if (!box) return;
      const [px, py] = hotspotPos(h, sceneVideos[h.scene], paused ? 0 : dt);
      h.x = box.x + (px / 100) * box.w; h.y = box.y + (py / 100) * box.h;
      const off = h.x < -30 || h.x > sw + 30 || h.y < -30 || h.y > sh + 30;
      h.el.style.visibility = off ? "hidden" : "";
      h.el.style.transform = `translate3d(${h.x}px, ${h.y}px, 0)`;
    });
    // mouse parallax
    const mx = (mouse.x / innerWidth - .5), my = (mouse.y / innerHeight - .5);
    par.x = lerp(par.x, mx, .05); par.y = lerp(par.y, my, .05);
    media[active].style.translate = `${par.x * -26}px ${par.y * -18}px`;
    // monster torch
    if (active === 2) {
      // Touch screens have no hover: let the torch wander on its own.
      const tr = clamp(sw * .17, 220, 420) * (finePointer ? 1 : 1.5);
      const lx = finePointer ? mouse.x - rect.left : sw * (.5 + Math.sin(now / 2600) * .25);
      const ly = finePointer ? mouse.y - rect.top : sh * (.55 + Math.cos(now / 3300) * .12);
      sceneEl.style.setProperty("--tx", lx + "px"); sceneEl.style.setProperty("--ty", ly + "px"); sceneEl.style.setProperty("--tr", tr + "px");
      allHotspots.forEach((h) => { if (h.scene === 2) h.el.classList.toggle("in-light", Math.hypot(h.x - lx, h.y - ly) < tr * 1.05 || h.held || !finePointer); });
    }
    // keep open card attached to its hotspot
    if (card.classList.contains("is-open")) {
      const h = allHotspots.find((o) => o.key === card.dataset.key);
      if (h) positionCard(h);
    }
  });

  function setActive(i) {
    if (i === active) return;
    active = i;
    closeCard();
    scenes.forEach((s, si) => s.classList.toggle("is-active", si === i));
    dots.forEach((d, di) => d.classList.toggle("is-active", di === i));
    sceneVideos.forEach((v, vi) => {
      if (vi === i) { loadVideo(v); v.play().catch(() => {}); }
      else v.pause();
    });
    if (sceneVideos[i + 1]) loadVideo(sceneVideos[i + 1]);
  }
  dots[0].classList.add("is-active");

  // Scroll-driven dive between scenes
  const sceneTl = gsap.timeline({ defaults: { ease: "none" } });
  sceneTl.addLabel("s0").to({}, { duration: 1 });
  for (let i = 1; i < scenes.length; i++) {
    const prev = scenes[i - 1], next = scenes[i];
    sceneTl
      .fromTo($(".scene-media", prev), { scale: 1, opacity: 1 }, { scale: 1.15, opacity: 0.25, duration: 1, immediateRender: false }, `t${i}`)
      .to($(".scene-copy", prev), { y: -80, opacity: 0, duration: .5 }, `t${i}`)
      .to($(".hotspots", prev), { opacity: 0, duration: .35 }, `t${i}`)
      .fromTo($(".hotspots", next), { opacity: 0 }, { opacity: 1, duration: .4 }, `t${i}+=.6`)
      .fromTo(next, { clipPath: "circle(0% at 50% 55%)" }, { clipPath: "circle(75% at 50% 55%)", duration: 1, ease: "power2.inOut" }, `t${i}`)
      .fromTo($(".scene-media", next), { scale: 1.3 }, { scale: 1, duration: 1, ease: "power2.out" }, `t${i}`)
      .fromTo($$(".scene-title span, .scene-title em, .scene-sub, .eyebrow", next), { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .5 }, `t${i}+=.5`)
      .addLabel(`s${i}`)
      .to({}, { duration: 1 });
  }
  const sceneST = ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: () => "+=" + innerHeight * (scenes.length - 1) * 2.2,
    pin: true,
    scrub: 1,
    animation: sceneTl,
    onUpdate: (self) => {
      const t = self.progress * sceneTl.duration();
      let idx = 0;
      for (let i = 1; i < scenes.length; i++) if (t > sceneTl.labels[`t${i}`] + .55) idx = i;
      setActive(idx);
    },
    onLeave: () => sceneVideos.forEach((v) => v.pause()),
    onEnterBack: () => sceneVideos[active].play().catch(() => {}),
  });
  const gotoScene = (i) => {
    const t = sceneTl.labels[`s${i}`] / sceneTl.duration();
    scrollToY(sceneST.start + (sceneST.end - sceneST.start) * t + 2);
  };
  dots.forEach((d) => d.addEventListener("click", () => gotoScene(+d.dataset.goto)));

  // Koi ripples
  (function ripples() {
    const sceneEl = scenes[1], c = $(".ripple-canvas", sceneEl), ctx = c.getContext("2d");
    const dpr = Math.min(devicePixelRatio, 2);
    let rings = [], lastSpawn = 0;
    const resize = () => { c.width = sceneEl.clientWidth * dpr; c.height = sceneEl.clientHeight * dpr; };
    resize(); addEventListener("resize", resize);
    const spawn = (x, y, big) => rings.push({ x: x * dpr, y: y * dpr, r: 2, max: (big ? 180 : 70) * dpr, life: 1, w: big ? 2.4 : 1.4 });
    sceneEl.addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - lastSpawn < 70) return;
      lastSpawn = now;
      const r = sceneEl.getBoundingClientRect();
      spawn(e.clientX - r.left, e.clientY - r.top, false);
    });
    sceneEl.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".hotspot, .spec-card")) return;
      const r = sceneEl.getBoundingClientRect();
      for (let k = 0; k < 3; k++) setTimeout(() => spawn(e.clientX - r.left, e.clientY - r.top, true), k * 140);
      Sound.blip();
    });
    gsap.ticker.add(() => {
      if (active !== 1 && !rings.length) return;
      ctx.clearRect(0, 0, c.width, c.height);
      rings = rings.filter((g) => g.life > 0);
      for (const g of rings) {
        g.r += (g.max - g.r) * .045; g.life -= .016;
        ctx.beginPath(); ctx.ellipse(g.x, g.y, g.r, g.r * .62, 0, 0, 6.283);
        ctx.strokeStyle = `rgba(220,255,245,${g.life * .55})`; ctx.lineWidth = g.w * dpr; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(g.x, g.y, g.r * .7, g.r * .7 * .62, 0, 0, 6.283);
        ctx.strokeStyle = `rgba(220,255,245,${g.life * .25})`; ctx.lineWidth = dpr; ctx.stroke();
      }
    });
  })();

  // Monster rail
  $("#monsterRail").innerHTML = MONSTER_RAIL.map((id) => {
    const p = productById[id];
    return `<li data-cursor="Add" data-id="${id}"><img src="${p.img}" alt="${p.name}" loading="lazy"/><div><b>${p.name}</b><span>${money(p.price)} · ${p.stats.Size}</span></div></li>`;
  }).join("");
  $$("#monsterRail li").forEach((li) => li.addEventListener("click", (e) => addToCart(li.dataset.id, 1, li)));

  /* =====================================================
     HOTSPOT TRACKER (authoring tool)
     ===================================================== */
  const tracker = (() => {
    const panel = $("#tracker"), sel = $("#trackSelect"), status = $("#trackStatus");
    const api = { on: false };
    sel.innerHTML = allHotspots.filter((h) => h.kind === "fish").map((h) => `<option value="${h.key}">${h.key} — ${h.label}</option>`).join("");
    const cur = () => allHotspots.find((h) => h.key === sel.value);
    let rec = null;
    function toggle(v) {
      api.on = v ?? !api.on;
      panel.hidden = !api.on;
      document.body.classList.toggle("tracking", api.on);
    }
    addEventListener("keydown", (e) => { if (e.shiftKey && e.key.toLowerCase() === "t") toggle(); });
    if (new URLSearchParams(location.search).has("track")) toggle(true);
    stage.addEventListener("pointerdown", (e) => {
      if (!api.on || e.target.closest(".spec-card, .tracker")) return;
      const h = cur(); if (!h || h.scene !== active) { status.textContent = "Scroll to that hotspot's scene first."; return; }
      e.preventDefault(); rec = []; status.textContent = "Recording…";
    });
    gsap.ticker.add(() => {
      if (!rec) return;
      const v = sceneVideos[active], r = stage.getBoundingClientRect();
      if (!v.duration) return;
      const b = videoBox(v, r);
      rec.push([+(v.currentTime / v.duration).toFixed(4), +(((mouse.x - r.left - b.x) / b.w) * 100).toFixed(2), +(((mouse.y - r.top - b.y) / b.h) * 100).toFixed(2)]);
    });
    addEventListener("pointerup", () => {
      if (!rec) return;
      const h = cur();
      const merged = (h.path || []).filter((k) => k[0] < rec[0][0] || k[0] > rec[rec.length - 1][0]).concat(rec.filter((_, i) => i % 3 === 0));
      merged.sort((a, b) => a[0] - b[0]);
      h.path = merged; savedPaths[h.key] = merged; store.set("aqualume-paths", savedPaths);
      status.textContent = `Saved ${merged.length} keyframes for ${h.label}`;
      rec = null;
    });
    $("#trackClear").addEventListener("click", () => { const h = cur(); delete h.path; delete savedPaths[h.key]; store.set("aqualume-paths", savedPaths); status.textContent = "Path cleared"; });
    $("#trackExport").addEventListener("click", () => { navigator.clipboard?.writeText(JSON.stringify(savedPaths)); status.textContent = "Copied paths JSON — paste into HOTSPOTS as `path`"; });
    return api;
  })();

  /* =====================================================
     CATEGORIES — horizontal dive
     ===================================================== */
  const catsTrack = $("#catsTrack");
  catsTrack.innerHTML = CATEGORIES.map((c, i) => `
    <a class="cat" href="#shop" data-filter="${c.id}">
      ${c.img ? `<img src="${c.img}" alt="${c.name}" loading="lazy"/>` : `<div class="art ${c.artClass}">${c.art}</div>`}
      <div class="cat-body">
        <span class="cat-num">0${i + 1}</span>
        <h3>${c.name}</h3>
        <p>${c.copy}</p>
        <span class="cat-link">Explore ${c.name.toLowerCase()}</span>
      </div>
      <div class="cat-shine"></div>
    </a>`).join("");
  const catsPin = $(".cats-pin");
  const catsDistance = () => Math.max(0, catsTrack.scrollWidth - innerWidth);
  gsap.to(catsTrack, {
    x: () => -catsDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: catsPin, start: "top top", end: () => "+=" + catsDistance(), pin: true, scrub: 1, invalidateOnRefresh: true,
      onUpdate: (s) => { $("#catsProgress").style.width = s.progress * 100 + "%"; },
    },
  });
  $$(".cat").forEach((el) => {
    el.addEventListener("click", (e) => { e.preventDefault(); setFilter(el.dataset.filter); scrollToY($("#shop").getBoundingClientRect().top + scrollY); });
    if (!finePointer) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateY(${(x - .5) * 12}deg) rotateX(${(.5 - y) * 10}deg) translateZ(10px)`;
      el.style.setProperty("--sx", x * 100 + "%"); el.style.setProperty("--sy", y * 100 + "%");
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  /* =====================================================
     STATS
     ===================================================== */
  $$("[data-count]").forEach((el) => {
    const obj = { v: 0 };
    gsap.to(obj, { v: +el.dataset.count, duration: 2.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" }, onUpdate: () => { el.textContent = Math.round(obj.v); } });
  });

  /* =====================================================
     SHOP
     ===================================================== */
  const grid = $("#productGrid");
  const filtersEl = $("#filters");
  // Crop into one subject of a wider photo (e.g. one fish from a video frame)
  function imgStyle(p) { return p.zoom ? ` style="--z:${p.zoom};--o:${p.imgPos}"` : ""; }
  const mediaHTML = (p, w = 600) => p.img
    ? `<img src="${p.img.replace(/w=\d+/, "w=" + Math.round(w * (p.zoom ? Math.min(p.zoom, 2.4) : 1)))}" alt="${p.name}" loading="lazy"${imgStyle(p)}/>`
    : `<div class="art ${p.cat === "food" ? "art--food" : p.cat === "tanks" ? "art--tank" : "art--gear"}">${p.art}</div>`;
  grid.innerHTML = PRODUCTS.map((p) => `
    <article class="card" data-cat="${p.cat}" data-id="${p.id}">
      <div class="card-media">${mediaHTML(p)}${p.badge ? `<span class="card-badge ${p.hot ? "hot" : ""}">${p.badge}</span>` : ""}</div>
      <div class="card-body">
        <span class="card-cat">${FILTERS.find((f) => f.id === p.cat).label}</span>
        <h3>${p.name}</h3>
        <p class="latin">${p.latin || "&nbsp;"}</p>
        <div class="card-tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>
        <div class="card-foot">
          <span class="card-price">${money(p.price)}</span>
          <button class="add-btn" aria-label="Add ${p.name} to cart" data-cursor="Add">+</button>
        </div>
      </div>
    </article>`).join("");
  filtersEl.innerHTML = `<span class="pill"></span>` + FILTERS.map((f) => `<button role="tab" data-filter="${f.id}">${f.label}</button>`).join("");
  const pill = $(".pill", filtersEl);
  function movePill() {
    const b = $("button.is-active", filtersEl); if (!b) return;
    pill.style.left = b.offsetLeft + "px"; pill.style.width = b.offsetWidth + "px";
    if (filtersEl.scrollWidth > filtersEl.clientWidth) {
      const targetLeft = b.offsetLeft - (filtersEl.clientWidth / 2) + (b.offsetWidth / 2);
      filtersEl.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    }
  }
  function setFilter(id) {
    $$("button", filtersEl).forEach((b) => b.classList.toggle("is-active", b.dataset.filter === id));
    movePill();
    const cards = $$(".card", grid);
    const show = cards.filter((c) => id === "all" || c.dataset.cat === id);
    cards.forEach((c) => c.classList.toggle("is-hidden", !show.includes(c)));
    gsap.fromTo(show, { y: 40, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .8, stagger: .04, ease: "expo.out", overwrite: true });
    ScrollTrigger.refresh();
  }
  $$("button", filtersEl).forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));
  $$("button", filtersEl)[0].classList.add("is-active");
  requestAnimationFrame(movePill);
  addEventListener("resize", movePill);
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (btn) addToCart(btn.closest(".card").dataset.id, 1, btn);
  });
  if (finePointer) {
    grid.addEventListener("pointermove", (e) => {
      const c = e.target.closest(".card"); if (!c) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    grid.addEventListener("pointerout", (e) => { const c = e.target.closest(".card"); if (c && !c.contains(e.relatedTarget)) c.style.transform = ""; });
  }
  ScrollTrigger.batch(".card", { start: "top 92%", once: true, onEnter: (els) => gsap.from(els, { y: 60, opacity: 0, duration: 1, stagger: .06, ease: "expo.out" }) });

  /* =====================================================
     CART
     ===================================================== */
  let cart = store.get("aqualume-cart", {});
  const cartEl = $("#cart"), overlay = $("#cartOverlay");
  const openCart = () => { cartEl.classList.add("is-open"); overlay.classList.add("is-open"); cartEl.setAttribute("aria-hidden", "false"); lenis?.stop(); };
  const closeCart = () => { cartEl.classList.remove("is-open"); overlay.classList.remove("is-open"); cartEl.setAttribute("aria-hidden", "true"); lenis?.start(); };
  $("#cartBtn").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); closeCard(); } });

  function renderCart() {
    const ids = Object.keys(cart);
    const count = ids.reduce((s, id) => s + cart[id], 0);
    const total = ids.reduce((s, id) => s + cart[id] * productById[id].price, 0);
    const badge = $("#cartCount");
    badge.textContent = count; badge.classList.toggle("has", count > 0);
    $("#cartTotal").textContent = money(total);
    $("#cartItems").innerHTML = ids.length ? ids.map((id) => {
      const p = productById[id];
      return `<li class="ci" data-id="${id}">
        <div class="ci-img">${mediaHTML(p, 200)}</div>
        <div><b>${p.name}</b><small>${money(p.price)} each</small></div>
        <div class="ci-right">
          <div class="qty"><button data-d="-1" aria-label="Decrease">−</button><output>${cart[id]}</output><button data-d="1" aria-label="Increase">+</button></div>
          <button class="ci-remove">Remove</button>
        </div></li>`;
    }).join("") : `<li class="empty"><svg viewBox="0 0 40 40" width="56" height="56"><path d="M4 20c6-9 15-12 24-7l8-6-2 13 2 13-8-6c-9 5-18 2-24-7z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>Your tank is empty.<br/>Go catch something.</li>`;
    store.set("aqualume-cart", cart);
  }
  $("#cartItems").addEventListener("click", (e) => {
    const li = e.target.closest(".ci"); if (!li) return;
    const id = li.dataset.id;
    if (e.target.closest(".ci-remove")) delete cart[id];
    const d = e.target.closest("[data-d]");
    if (d) { cart[id] += +d.dataset.d; if (cart[id] <= 0) delete cart[id]; }
    renderCart();
  });
  function addToCart(id, qty = 1, fromEl, silent) {
    cart[id] = (cart[id] || 0) + qty;
    renderCart();
    const cb = $("#cartBtn");
    if (fromEl && !reduceMotion) {
      const a = fromEl.getBoundingClientRect(), b = cb.getBoundingClientRect();
      const orb = document.createElement("div"); orb.className = "fly"; document.body.appendChild(orb);
      gsap.set(orb, { left: a.left + a.width / 2 - 8, top: a.top + a.height / 2 - 8 });
      gsap.to(orb, { left: b.left + b.width / 2 - 8, duration: .8, ease: "power2.inOut" });
      gsap.to(orb, { top: b.top + b.height / 2 - 8, duration: .8, ease: "back.in(1.6)", onComplete: () => { orb.remove(); cb.classList.remove("bump"); void cb.offsetWidth; cb.classList.add("bump"); } });
    }
    Sound.blip();
    if (!silent) toast(`Added ${productById[id].name}`);
  }
  $("#checkoutBtn").addEventListener("click", () => toast(Object.keys(cart).length ? "Checkout is a demo — connect your payment provider here." : "Add something to your tank first 🐟"));
  renderCart();

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("is-show"), 2600);
  }

  $("#newsletter").addEventListener("submit", (e) => { e.preventDefault(); e.target.reset(); toast("You're on the list. See you Friday 🐠"); });

  /* =====================================================
     TANK BUILDER
     ===================================================== */
  const build = { tank: BUILDER_TANKS[1], qty: {} };
  const tankEl = $("#tankPreview"), fishLayer = $("#tankFish"), plantLayer = $("#tankPlants");
  $("#tankOptions").innerHTML = BUILDER_TANKS.map((t) => `<button class="tank-opt" data-id="${t.id}"><b>${t.liters} L</b><span>${t.name.replace(/^\d+ L /, "")} · ${money(productById[t.id].price)}</span></button>`).join("");
  $("#pickList").innerHTML = BUILDER_ITEMS.map((p) => `
    <div class="pick" data-id="${p.id}">
      ${p.img ? `<span class="pick-img"><img src="${p.img.replace(/w=\d+/, "w=" + (p.zoom ? 400 : 120))}" alt="" loading="lazy"${imgStyle(p)}/></span>` : `<div class="pick-art"></div>`}
      <div><b>${p.name}</b><small>${p.builder.plant ? "Plant" : `${p.builder.temp[0]}–${p.builder.temp[1]}°C · ${p.builder.temper}`} · ${money(p.price)}</small></div>
      <div class="qty"><button data-d="-1" aria-label="Remove one">−</button><output>0</output><button data-d="1" aria-label="Add one">+</button></div>
    </div>`).join("");
  $$(".tank-opt").forEach((b) => b.addEventListener("click", () => { build.tank = BUILDER_TANKS.find((t) => t.id === b.dataset.id); renderBuilder(); }));
  $("#pickList").addEventListener("click", (e) => {
    const d = e.target.closest("[data-d]"); if (!d) return;
    const id = d.closest(".pick").dataset.id;
    build.qty[id] = clamp((build.qty[id] || 0) + +d.dataset.d, 0, 40);
    renderBuilder();
  });

  const swimmers = [];
  const fishSVG = (c1, c2) => `<svg viewBox="0 0 44 20"><path d="M2 10C9 1 22-1 32 6l9-5-2 9 2 9-9-5C22 21 9 19 2 10z" fill="${c1}"/><path d="M14 4c2 4 2 8 0 12" stroke="${c2}" stroke-width="3" fill="none"/><circle cx="8" cy="9" r="1.5" fill="#111"/></svg>`;
  function syncFish() {
    const wanted = [];
    BUILDER_ITEMS.forEach((p) => { if (!p.builder.plant) for (let i = 0; i < (build.qty[p.id] || 0); i++) wanted.push(p.id); });
    // remove extras
    for (let i = swimmers.length - 1; i >= 0; i--) {
      const s = swimmers[i];
      const have = swimmers.filter((o) => o.id === s.id).length, need = wanted.filter((w) => w === s.id).length;
      if (have > need) { s.el.remove(); swimmers.splice(i, 1); }
    }
    wanted.forEach((id) => {
      const have = swimmers.filter((o) => o.id === id).length, need = wanted.filter((w) => w === id).length;
      if (have < need) {
        const el = document.createElement("div"); el.className = "mini-fish";
        const [c1, c2] = FISH_COLORS[id] || ["#7cf5d4", "#fff"];
        const sz = { discus: 1.8, angel: 1.7, goldfish: 1.6, oscar: 2.4, flowerhorn: 2.2, axolotl: 2, betta: 1.3, shrimp: .6, neon: .7, guppy: .8, goldbarb: 1, pencilfish: .8 }[id] || 1;
        el.innerHTML = fishSVG(c1, c2);
        fishLayer.appendChild(el);
        swimmers.push({ id, el, sz, x: Math.random() * 80 + 10, y: id === "shrimp" ? 80 : Math.random() * 60 + 10, tx: 50, ty: 40, v: (Math.random() * .5 + .4) / sz, dir: 1 });
      }
    });
  }
  // Leafy plant illustrations for the builder preview (viewBox 0 0 40 100, rooted at the bottom)
  const PLANT_ART = {
    vallis: (c) => [0, 1, 2, 3, 4].map((i) => `<path d="M${16 + i * 2} 100C${10 + i * 4} 70 ${4 + i * 7} 40 ${8 + i * 6} ${4 + i * 3}" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="${.75 + i * .05}"/>`).join(""),
    lotus: () => `<path d="M20 100V55M20 100C16 80 10 70 8 50M20 100c4-22 10-30 14-44" stroke="#7a2a1e" stroke-width="1.6" fill="none"/>
      <ellipse cx="9" cy="48" rx="8" ry="6" fill="#b8402c"/><ellipse cx="33" cy="54" rx="7" ry="5.5" fill="#c9553b"/><ellipse cx="20" cy="50" rx="9" ry="7" fill="#d4663f"/>
      <path d="M13 49c4-2 10-2 14 0" stroke="#f0a070" stroke-width=".8" fill="none" opacity=".7"/>`,
    moss: () => `<g fill="#2f7a3c">${[6, 14, 22, 30, 12, 26, 19].map((x, i) => `<circle cx="${x + 2}" cy="${92 - (i % 3) * 5}" r="${6 + (i % 2) * 2}"/>`).join("")}</g><g fill="#4a9a52" opacity=".7">${[9, 20, 30].map((x) => `<circle cx="${x}" cy="88" r="4"/>`).join("")}</g>`,
    carpet: () => `<g fill="#7fd36b">${Array.from({ length: 16 }, (_, i) => `<circle cx="${2 + i * 2.4}" cy="${96 - (i % 3) * 1.6}" r="2.6"/>`).join("")}</g>`,
    anubias: () => `<path d="M20 100c0-8-2-14-6-20M20 100c0-10 3-16 8-22M20 100c0-6 0-12 0-18" stroke="#2d6b3a" stroke-width="1.6" fill="none"/>
      <ellipse cx="12" cy="76" rx="7" ry="4" transform="rotate(-30 12 76)" fill="#2f7d45"/><ellipse cx="29" cy="74" rx="7" ry="4" transform="rotate(25 29 74)" fill="#3a8f50"/><ellipse cx="20" cy="78" rx="5" ry="6.5" fill="#46a05c"/>`,
  };
  const PLANT_SIZE = { vallis: [10, 78], lotus: [12, 50], moss: [16, 24], carpet: [22, 12], anubias: [12, 32] };
  function syncPlants() {
    plantLayer.innerHTML = "";
    let n = 0;
    BUILDER_ITEMS.filter((p) => p.builder.plant).forEach((p) => {
      for (let i = 0; i < (build.qty[p.id] || 0); i++) {
        const [w, h] = PLANT_SIZE[p.id] || [10, 30];
        const left = (n * 29 + (p.id === "vallis" ? 2 : 11)) % (100 - w);
        const art = (PLANT_ART[p.id] || PLANT_ART.vallis)(["#3f9a55", "#4fae6a", "#5cbf72"][n % 3]);
        plantLayer.insertAdjacentHTML("beforeend", `<svg class="tank-plant ${p.id === "vallis" ? "" : "is-low"}" style="left:${left}%;width:${w}%;height:${h}%;animation-delay:${-n * .7}s;z-index:${p.id === "vallis" ? 0 : 2}" viewBox="0 0 40 100" preserveAspectRatio="xMidYMax meet">${art}</svg>`);
        n++;
      }
    });
  }
  gsap.ticker.add(() => {
    const W = fishLayer.clientWidth, H = fishLayer.clientHeight;
    if (!W) return;
    const r = tankEl.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    swimmers.forEach((s) => {
      const dx = s.tx - s.x, dy = s.ty - s.y;
      if (Math.hypot(dx, dy) < 2) { s.tx = Math.random() * 84 + 6; s.ty = s.id === "shrimp" ? 78 + Math.random() * 6 : Math.random() * 66 + 8; }
      s.x += Math.sign(dx) * Math.min(Math.abs(dx), s.v * .35); s.y += Math.sign(dy) * Math.min(Math.abs(dy), s.v * .2);
      if (Math.abs(dx) > .5) s.dir = dx > 0 ? -1 : 1;
      s.el.style.transform = `translate(${(s.x / 100) * W}px, ${(s.y / 100) * H}px) scale(${s.dir * s.sz}, ${s.sz})`;
    });
  });

  function renderBuilder() {
    $$(".tank-opt").forEach((b) => b.classList.toggle("is-active", b.dataset.id === build.tank.id));
    $$(".pick").forEach((r) => { $("output", r).textContent = build.qty[r.dataset.id] || 0; });
    tankEl.style.aspectRatio = build.tank.ratio;
    $("#tankLabel").textContent = build.tank.name;
    syncFish(); syncPlants();

    const chosen = BUILDER_ITEMS.filter((p) => build.qty[p.id] > 0);
    const fish = chosen.filter((p) => !p.builder.plant);
    let load = 0;
    chosen.forEach((p) => { load += p.builder.bio * build.qty[p.id]; });
    const fishLoad = fish.reduce((s, p) => s + p.builder.bio * build.qty[p.id], 0);
    load = Math.max(fishLoad ? fishLoad * .6 : 0, load);
    const pct = Math.round((load / build.tank.capacity) * 100);
    $("#stockPct").textContent = pct + "%";
    const bar = $("#stockBar");
    bar.style.width = clamp(pct, 0, 100) + "%";
    bar.style.backgroundPosition = `${clamp(pct, 0, 130) / 1.3}% 0`;

    const warn = [];
    if (pct > 100) warn.push(`Overstocked by ${pct - 100}% — choose a bigger tank or fewer fish.`);
    fish.forEach((p) => { if (p.builder.minTank > build.tank.liters) warn.push(`${p.name} needs at least ${p.builder.minTank} L.`); });
    fish.filter((p) => p.builder.solo && build.qty[p.id] > 1).forEach((p) => warn.push(`${p.name} should be kept alone (one per tank).`));
    const aggressive = fish.filter((p) => p.builder.temper === "aggressive");
    const others = fish.filter((p) => p.builder.temper !== "aggressive");
    if (aggressive.length && others.length) warn.push(`${aggressive[0].name} will bully or eat ${others[0].name}.`);
    if (fish.some((p) => p.builder.solo) && fish.length > 1) {
      const solo = fish.find((p) => p.builder.solo);
      warn.push(`${solo.name} does best in a species-only tank.`);
    }
    if (fish.some((p) => p.id === "shrimp") && fish.some((p) => ["angel", "discus", "oscar", "flowerhorn", "goldfish"].includes(p.id))) warn.push("Larger fish will hunt your cherry shrimp.");
    if (fish.length > 1) {
      const lo = Math.max(...fish.map((p) => p.builder.temp[0])), hi = Math.min(...fish.map((p) => p.builder.temp[1]));
      if (lo > hi) warn.push(`No shared temperature: these fish need between ${lo}°C and ${hi}°C, which doesn't exist.`);
    }
    const ul = $("#warnings");
    ul.innerHTML = warn.length ? [...new Set(warn)].map((w) => `<li>⚠ ${w}</li>`).join("")
      : fish.length ? `<li class="ok">✓ Great match — these get along and fit comfortably.</li>` : `<li class="ok">Add some fish to see compatibility.</li>`;

    const total = productById[build.tank.id].price + chosen.reduce((s, p) => s + p.price * build.qty[p.id], 0);
    $("#builderTotal").textContent = money(total);
  }
  $("#builderAdd").addEventListener("click", (e) => {
    addToCart(build.tank.id, 1, e.currentTarget, true);
    Object.entries(build.qty).forEach(([id, q]) => { if (q > 0) addToCart(id, q, null, true); });
    toast("Your dream tank is in the cart 🐠");
  });
  build.qty = { neon: 10, shrimp: 1, vallis: 3, lotus: 1, moss: 2, carpet: 2 };
  renderBuilder();

  /* =====================================================
     REVEALS
     ===================================================== */
  $$(".h2").forEach((h) => {
    gsap.from(h, { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 85%" } });
  });
  $$(".lede, .visit-list li, .builder-controls > *").forEach((el) => {
    gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  gsap.to(".visit-media img", { yPercent: -15, ease: "none", scrollTrigger: { trigger: ".visit", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".footer-big", { yPercent: 40, opacity: 0, ease: "expo.out", duration: 1.6, scrollTrigger: { trigger: ".footer", start: "top 85%" } });

  // highlight current nav link
  ["scenes", "categories", "shop", "builder", "visit"].forEach((id) => {
    ScrollTrigger.create({
      trigger: "#" + id, start: "top center", end: "bottom center",
      onToggle: (s) => { if (s.isActive) $$(".nav-links a").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + id)); },
    });
  });

  // Pause videos when the tab is hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) sceneVideos.forEach((v) => v.pause());
    else if (!loader.isConnected && sceneST.isActive) sceneVideos[active].play().catch(() => {});
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
