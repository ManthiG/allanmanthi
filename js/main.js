/* Allan Manthi Mweu — site behaviour. No dependencies.
   Everything degrades to a static, readable page. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
  var smallMQ = window.matchMedia('(max-width: 899px)');
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  var ASSET_BASE = document.documentElement.getAttribute('data-base') || '';

  /* ---------------------------------------------------------------- header */
  var header = $('.site-header');
  var menuBtn = $('.menu-btn');
  var nav = $('#site-nav');
  function onScrollHeader() { header.classList.toggle('is-scrolled', window.scrollY > 24); }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  function setMenu(open) {
    header.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('b').textContent = open ? 'Close' : 'Menu';
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!header.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1040) setMenu(false); });
  }

  /* active section in the nav and the story rail */
  var navLinks = $$('[data-target]', nav || document);
  var railLinks = $$('.act-rail [data-act]');
  if ('IntersectionObserver' in window && (navLinks.length || railLinks.length)) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navLinks.forEach(function (a) { if (a.getAttribute('data-target') === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        var actId = id === 'about' ? 'work' : id;
        railLinks.forEach(function (a) { if (a.getAttribute('data-act') === actId) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'approach', 'expertise', 'implementation', 'work', 'about', 'contact'].forEach(function (id) {
      var el = document.getElementById(id); if (el) secIO.observe(el);
    });
  }

  /* buttons: illumination follows the pointer inside the button */
  document.addEventListener('pointermove', function (e) {
    var b = e.target.closest && e.target.closest('.btn');
    if (!b) return;
    var r = b.getBoundingClientRect();
    b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    b.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------------------------------------------------------- hero scene */
  var hero = $('.hero');
  var scene = $('.scene');
  if (hero && scene) (function heroScene() {
    var canvas = $('canvas.streams');
    var depthEls = $$('.scene-wrap [data-depth]');

    (function loadScene() {
      var src = ASSET_BASE + (smallMQ.matches ? 'assets/scene-1100.webp' : 'assets/scene-1672.webp');
      var done = false;
      function show() { if (done) return; done = true; scene.classList.add('is-loaded'); }
      var img = new Image(); img.src = src;
      if (img.decode) img.decode().then(show, show); else img.onload = show;
      setTimeout(show, 2600);
    })();

    // Light pathways traced from the artwork (coordinates in the 1672×941 source).
    var IN = [
      [[380, 387], [445, 392], [500, 423], [575, 452], [640, 457], [705, 460], [770, 462], [830, 465]],
      [[445, 360], [490, 378], [535, 400], [605, 432], [655, 440], [700, 442], [770, 448], [830, 455]],
      [[470, 475], [500, 465], [530, 472], [600, 485], [652, 496], [720, 498], [780, 494], [830, 490]],
      [[380, 535], [412, 527], [480, 510], [525, 500], [575, 497], [652, 496], [720, 500], [830, 505]],
      [[400, 620], [455, 599], [512, 562], [570, 532], [615, 531], [702, 530], [770, 528], [830, 525]],
      [[412, 582], [445, 557], [490, 538], [540, 522], [600, 512], [700, 512], [830, 515]]
    ];
    var OUT = [
      [[960, 488], [1000, 494], [1035, 497], [1080, 488], [1110, 470], [1152, 464], [1188, 464]],
      [[960, 494], [1035, 500], [1085, 492], [1120, 478], [1160, 474], [1192, 474]],
      [[960, 500], [1035, 503], [1090, 496], [1125, 484], [1165, 482], [1195, 482]],
      [[960, 505], [1040, 505], [1095, 500], [1150, 494], [1190, 492]],
      [[960, 508], [1040, 508], [1085, 520], [1110, 545], [1150, 556], [1188, 560]],
      [[960, 512], [1040, 510], [1080, 530], [1105, 560], [1150, 572], [1185, 572]],
      [[960, 515], [1040, 512], [1075, 540], [1100, 575], [1150, 588], [1182, 590]]
    ];
    var CUBE = { x: 820, y: 405, w: 140, h: 150 };
    function buildPath(pts) {
      var out = [], i, t, p0, p1, p2, p3;
      for (i = 0; i < pts.length - 1; i++) {
        p0 = pts[i - 1] || pts[i]; p1 = pts[i]; p2 = pts[i + 1]; p3 = pts[i + 2] || p2;
        for (t = 0; t < 1; t += 0.125) {
          var t2 = t * t, t3 = t2 * t;
          out.push([
            0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
            0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
          ]);
        }
      }
      out.push(pts[pts.length - 1]);
      var len = [0];
      for (i = 1; i < out.length; i++) len.push(len[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
      return { p: out, l: len, total: len[len.length - 1] };
    }
    function pointAt(path, d) {
      d = clamp(d, 0, path.total);
      var l = path.l, lo = 0, hi = l.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (l[m] < d) lo = m; else hi = m; }
      var span = l[hi] - l[lo] || 1, f = (d - l[lo]) / span;
      return [path.p[lo][0] + (path.p[hi][0] - path.p[lo][0]) * f, path.p[lo][1] + (path.p[hi][1] - path.p[lo][1]) * f];
    }
    var inPaths = IN.map(buildPath), outPaths = OUT.map(buildPath);
    var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    var mobile = !fineMQ.matches;
    var W = 0, S = 1, DPR = 1;
    var sprite = (function () {
      var c = document.createElement('canvas'); c.width = c.height = 32;
      var g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, 'rgba(235,242,255,1)'); gr.addColorStop(0.25, 'rgba(160,190,255,.55)'); gr.addColorStop(1, 'rgba(100,140,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return c;
    })();
    function resize() {
      if (!ctx) return;
      var r = scene.getBoundingClientRect();
      W = r.width; S = W / 1672;
      DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(r.height * DPR);
    }
    // restrained: a few streams at a time, varied speed and timing
    var pulses = [], parts = [];
    var boost = 0, bboost = 0, lastBoost = -1, lastB = -1, nextSpawn = 0;
    var MAXP = mobile ? 5 : 9;
    function spawnIn(now) {
      pulses.push({ path: inPaths[(Math.random() * inPaths.length) | 0], d: 0, v: rand(130, 240), len: rand(46, 90), a: rand(0.5, 0.95), out: false });
      nextSpawn = now + rand(mobile ? 700 : 380, mobile ? 1400 : 900);
    }
    function spawnOut(delay) {
      setTimeout(function () {
        pulses.push({ path: outPaths[(Math.random() * outPaths.length) | 0], d: 0, v: rand(100, 170), len: rand(30, 56), a: rand(0.45, 0.85), out: true });
      }, delay);
    }
    for (var k = 0; k < (mobile ? 6 : 10); k++) {
      parts.push({ x: CUBE.x + Math.random() * CUBE.w, y: CUBE.y + Math.random() * CUBE.h, vx: rand(8, 22), ph: Math.random() * 6.28, s: rand(1.4, 2.6) });
    }
    function drawPulse(p) {
      var head = p.d, steps = 12, seg = p.len / steps, prev = pointAt(p.path, head - p.len), i, cur;
      ctx.lineWidth = (p.out ? 1.3 : 1.6) / S;
      for (i = 1; i <= steps; i++) {
        cur = pointAt(p.path, head - p.len + seg * i);
        ctx.globalAlpha = p.a * (i / steps) * (i / steps);
        ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(cur[0], cur[1]); ctx.stroke();
        prev = cur;
      }
      var h = pointAt(p.path, head), r = (p.out ? 5.5 : 7) / S;
      ctx.globalAlpha = p.a;
      ctx.drawImage(sprite, h[0] - r, h[1] - r, r * 2, r * 2);
    }
    var px = 0, py = 0, tx = 0, ty = 0, lastPx = 9, lastPy = 9, lastHp = -1;
    var running = false, heroVisible = true, last = 0, t0 = performance.now();
    function frame(now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      var time = (now - t0) / 1000;
      px += (tx - px) * Math.min(1, dt * 3);
      py += (ty - py) * Math.min(1, dt * 3);
      var prog = clamp(window.scrollY / (hero.offsetHeight || 1), 0, 1);
      if (Math.abs(prog - lastHp) > 0.004) { hero.style.setProperty('--hp', prog.toFixed(3)); lastHp = prog; }
      var fx = Math.sin(time * 0.4) * 2, fy = Math.sin(time * 0.62) * 2.6;
      for (var i = 0; i < depthEls.length; i++) {
        var el = depthEls[i], d = +el.getAttribute('data-depth');
        var x = -px * 14 * d, y = -py * 9 * d - prog * 70 * d;
        if (d === 1) { x += fx; y += fy; }
        var tr = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
        if (el.classList.contains('lyr-b')) tr += ' rotateY(' + (px * 1.4).toFixed(3) + 'deg) rotateX(' + (-py * 0.9).toFixed(3) + 'deg)';
        el.style.transform = tr;
      }
      if (Math.abs(px - lastPx) > 0.002 || Math.abs(py - lastPy) > 0.002) {
        hero.style.setProperty('--px', px.toFixed(3)); hero.style.setProperty('--py', py.toFixed(3));
        lastPx = px; lastPy = py;
      }
      if (ctx && W > 0) {
        if (now > nextSpawn && pulses.length < MAXP) spawnIn(now);
        ctx.setTransform(DPR * S, 0, 0, DPR * S, 0, 0);
        ctx.clearRect(0, 0, 1672, 941);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgb(176,200,255)';
        for (i = pulses.length - 1; i >= 0; i--) {
          var p = pulses[i];
          p.d += p.v * dt;
          if (p.d - p.len > p.path.total) {
            pulses.splice(i, 1);
            if (p.out) bboost = Math.min(1, bboost + 0.34);
            else { boost = Math.min(1, boost + 0.26); if (Math.random() < 0.8) spawnOut(rand(260, 760)); }
            continue;
          }
          drawPulse(p);
        }
        for (i = 0; i < parts.length; i++) {
          var q = parts[i];
          q.x += q.vx * dt * (1 + boost * 1.4);
          if (q.x > CUBE.x + CUBE.w) { q.x = CUBE.x; q.y = CUBE.y + Math.random() * CUBE.h; }
          var edge = Math.min(q.x - CUBE.x, CUBE.x + CUBE.w - q.x) / 30;
          ctx.globalAlpha = clamp(edge, 0, 1) * (0.3 + 0.2 * Math.sin(time * 2 + q.ph) + boost * 0.3);
          var yy = q.y + Math.sin(time * 1.3 + q.ph) * 3, rr = q.s / S;
          ctx.drawImage(sprite, q.x - rr, yy - rr, rr * 2, rr * 2);
        }
        ctx.globalAlpha = 1;
      }
      boost *= Math.exp(-dt * 1.4); bboost *= Math.exp(-dt * 1.0);
      if (Math.abs(boost - lastBoost) > 0.006) { hero.style.setProperty('--boost', boost.toFixed(3)); lastBoost = boost; }
      if (Math.abs(bboost - lastB) > 0.006) { hero.style.setProperty('--bboost', bboost.toFixed(3)); lastB = bboost; }
      requestAnimationFrame(frame);
    }
    function start() {
      if (running || reduced || !heroVisible || document.hidden) return;
      running = true; last = performance.now(); requestAnimationFrame(frame);
    }
    function stop() { running = false; }
    if (!reduced) {
      resize();
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(scene); else window.addEventListener('resize', resize);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; if (heroVisible) start(); else stop(); }).observe(hero);
      }
      document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
      if (fineMQ.matches) {
        hero.addEventListener('pointermove', function (e) {
          var r = hero.getBoundingClientRect();
          tx = clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1);
          ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
          hero.classList.add('has-pointer');
        }, { passive: true });
        hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; hero.classList.remove('has-pointer'); });
      }
      start();
    } else if (canvas) {
      canvas.style.display = 'none';
    }
  })();

  /* ------------------------------------------- scroll: parallax and light */
  // Each image drifts slowly against the scroll (--p) and its light rises as
  // the scene reaches the middle of the screen (--c). Only visible scenes update.
  var pEls = $$('[data-parallax]');
  if (!reduced && pEls.length && 'IntersectionObserver' in window) {
    var live = new Set(), ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      live.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
        el.style.setProperty('--p', p.toFixed(3));
        el.style.setProperty('--c', (1 - Math.min(1, Math.abs(p) * 1.25)).toFixed(3));
      });
    };
    var request = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    var pIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) live.add(en.target); else live.delete(en.target); });
      request();
    }, { rootMargin: '10% 0px 10% 0px' });
    pEls.forEach(function (el) { pIO.observe(el); });
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
  } else {
    pEls.forEach(function (el) { el.style.setProperty('--c', '1'); });
  }

  /* one gentle entrance per block; content is always visible */
  var revealEls = $$('[data-reveal], .levels-desk');
  if ('IntersectionObserver' in window && !reduced) {
    var rIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rIO.unobserve(en.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { rIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* --------------------------------------------------------- download CV */
  // On the hosted site the links download the PDF directly. Inside a Claude
  // artifact (where plain download links are blocked) the file is offered
  // through the viewer's download prompt instead.
  var cvLinks = $$('[data-cv]');
  var cvStatus = $('.cv-status');
  var downloadsNS = null, downloadsReady = null;
  if (window.claude && typeof window.claude.use === 'function') {
    downloadsReady = Promise.race([
      window.claude.use('downloads'),
      new Promise(function (res) { setTimeout(function () { res(null); }, 10500); })
    ]).then(function (ns) { downloadsNS = ns; return ns; }, function () { return null; });
  }
  function cvMessage(msg) {
    if (!cvStatus) return;
    cvStatus.hidden = false; cvStatus.innerHTML = msg;
  }
  cvLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!downloadsReady) return; // hosted site: native download
      e.preventDefault();
      var href = a.getAttribute('href');
      downloadsReady.then(function (ns) {
        if (!ns) { cvMessage('The download isn’t available in this view. Email <a href="mailto:allan@juapath.com">allan@juapath.com</a> for a copy.'); return; }
        return fetch(href).then(function (r) { if (!r.ok) throw new Error('fetch'); return r.blob(); })
          .then(function (blob) { return ns.save({ filename: 'Allan-Manthi-Mweu-CV.pdf', data: blob }); })
          .then(function () { cvMessage('CV saved.'); }, function (err) {
            if (err && err.code === 'declined') return;
            cvMessage('The CV couldn’t be saved here. Email <a href="mailto:allan@juapath.com">allan@juapath.com</a> for a copy.');
          });
      });
    });
  });

  /* ------------------------------------------------------------ contact */
  var copyBtn = $('#copy-email');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var text = copyBtn.getAttribute('data-copy');
    function done() { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000); }
    function fallback() {
      var el = $('#email-addr'), r = document.createRange(); r.selectNodeContents(el);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      copyBtn.textContent = 'Selected';
      setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2400);
    }
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (err) { fallback(); }
  });

  var startBtn = $('[data-start]');
  var form = $('#enquiry');
  if (startBtn && form) startBtn.addEventListener('click', function (e) {
    e.preventDefault();
    form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () { var f = $('#f-name'); if (f) f.focus({ preventScroll: true }); }, reduced ? 0 : 650);
  });

  if (form) {
    var EMAIL = 'allan@juapath.com';
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    var statusEl = $('#form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!endpoint) { var note = $('#form-note'); if (note) note.textContent = 'Opens your email app with this message addressed to Allan.'; }
    var checks = {
      name: function (v) { return v.trim().length > 0; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      message: function (v) { return v.trim().length > 0; }
    };
    function check(name) {
      var input = form.elements[name], ok = checks[name](input.value);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      document.getElementById('f-' + (name === 'message' ? 'msg' : name) + '-err').hidden = ok;
      return ok;
    }
    function status(msg, isError) {
      statusEl.hidden = false; statusEl.innerHTML = msg;
      statusEl.classList.toggle('is-error', !!isError);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var order = ['name', 'email', 'message'], firstBad = null;
      order.forEach(function (n) { if (!check(n) && !firstBad) firstBad = n; });
      if (firstBad) { form.elements[firstBad].focus(); return; }
      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        organization: form.elements.organization.value.trim(),
        message: form.elements.message.value.trim()
      };
      if (endpoint) {
        submitBtn.classList.add('is-busy'); submitBtn.setAttribute('aria-disabled', 'true');
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error('send'); })
          .then(function () {
            form.reset();
            status('Thank you, ' + data.name.split(' ')[0].replace(/[<>&"]/g, '') + '. Your message has been sent and Allan will reply by email.');
          }, function () {
            status('Your message couldn’t be sent just now. Please email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> instead. Your text is still in the form.', true);
          })
          .then(function () { submitBtn.classList.remove('is-busy'); submitBtn.removeAttribute('aria-disabled'); });
        return;
      }
      var subject = 'Project enquiry' + (data.organization ? ': ' + data.organization : '');
      var body = 'Hello Allan,\n\n' + data.message + '\n\n' + data.name + (data.organization ? '\n' + data.organization : '') + '\n' + data.email;
      var href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status('Your email app should open with this message ready to send. If it doesn’t, email <a href="' + href + '">' + EMAIL + '</a> directly. Your text is still in the form.');
      window.location.href = href;
    });
    ['name', 'email', 'message'].forEach(function (n) {
      form.elements[n].addEventListener('input', function () { if (this.getAttribute('aria-invalid') === 'true') check(n); });
    });
  }
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
