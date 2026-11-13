/* =========================================================
   QUỲNH NHƯ FLORIST — main.js
   Menu · cuộn · hiệu ứng nghiêng/parallax · lọc & popup sản phẩm · form · màn chào mừng
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.QNF_CONFIG || {};
  var PRODUCTS = window.QNF_PRODUCTS || [];
  var doc = document, html = doc.documentElement;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  var missing = function (v) { return !v || String(v).indexOf('[CHƯA CÓ') === 0; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function store(type, key, val) {
    try {
      var s = window[type];
      if (val === undefined) return s.getItem(key);
      s.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------- Vòng lặp hiệu ứng dùng chung (requestAnimationFrame) ---------- */
  var jobs = [], rafId = 0;
  function loop() {
    rafId = 0;
    if (doc.hidden) return;
    jobs = jobs.filter(function (j) { return j(); });
    if (jobs.length) rafId = requestAnimationFrame(loop);
  }
  function addJob(fn) {
    if (jobs.indexOf(fn) < 0) jobs.push(fn);
    if (!rafId && !doc.hidden) rafId = requestAnimationFrame(loop);
  }
  doc.addEventListener('visibilitychange', function () { if (!doc.hidden && jobs.length && !rafId) rafId = requestAnimationFrame(loop); });

  /* Đầu vào chung: chuột (máy tính) hoặc độ nghiêng máy (điện thoại), giá trị -1..1 */
  var input = { tx: 0, ty: 0, x: 0, y: 0, source: 'none' };
  var inputListeners = [];
  function setInput(x, y, src) {
    input.tx = clamp(x, -1, 1); input.ty = clamp(y, -1, 1); input.source = src;
    inputListeners.forEach(function (f) { f(); });
  }

  /* ---------- Toast ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  }

  /* ---------- Pháo hoa cánh hoa 2D (dùng khi gửi form thành công) ---------- */
  function petalBurst(x, y, count) {
    if (reduced) return;
    var c = doc.createElement('canvas'); c.className = 'burst'; c.setAttribute('aria-hidden', 'true');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    doc.body.appendChild(c);
    var ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    var n = lowPower ? Math.round(count / 2) : count, ps = [];
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = 140 + Math.random() * 260;
      ps.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, r: Math.random() * 6, vr: (Math.random() - .5) * 4, s: 7 + Math.random() * 6, ph: Math.random() * 6.3, k: .6 + Math.random() * .4 });
    }
    // Vẽ cánh hoa hồng: giữa nhạt, chân hồng đậm
    function petal(s, k) {
      var g = ctx.createRadialGradient(0, s * .55, 0, 0, 0, s * 1.1);
      g.addColorStop(0, 'rgb(214,52,118)'); g.addColorStop(.35, 'rgb(244,166,196)'); g.addColorStop(1, 'rgb(253,228,238)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, s * .5);
      ctx.bezierCurveTo(s * .55, s * .4, s * .55, -s * .3, s * .3, -s * .45);
      ctx.bezierCurveTo(s * .12, -s * .55, 0, -s * .45, 0, -s * .42);
      ctx.bezierCurveTo(0, -s * .45, -s * .12, -s * .55, -s * .3, -s * .45);
      ctx.bezierCurveTo(-s * .55, -s * .3, -s * .55, s * .4, 0, s * .5);
      ctx.save(); ctx.scale(k, 1); ctx.fill(); ctx.restore();
    }
    var t0 = performance.now(), last = t0, life = 2400;
    function frame(now) {
      var dt = Math.min((now - last) / 1000, .05), age = now - t0; last = now;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalAlpha = clamp(1 - (age - life * .65) / (life * .35), 0, 1);
      ps.forEach(function (p) {
        var drag = Math.exp(-2.6 * dt);
        p.vx *= drag; p.vy = Math.min(p.vy * drag + 260 * dt, 90);
        p.x += (p.vx + Math.sin(now / 320 + p.ph) * 30) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        petal(p.s, Math.abs(Math.cos(now / 400 + p.ph)) * p.k + .25); ctx.restore();
      });
      if (age < life) requestAnimationFrame(frame); else c.remove();
    }
    requestAnimationFrame(frame);
  }

  /* =========================================================
     [A] MÀN CHÀO MỪNG
     ========================================================= */
  function initIntro() {
    var intro = $('#intro');
    if (!intro || !html.classList.contains('intro-on')) return;
    var done = false, ctrl = null, timers = [];
    store('sessionStorage', 'qnf-intro', '1'); // đánh dấu ngay: chuyển trang giữa chừng cũng không chạy lại
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function finish() {
      if (done) return; done = true;
      timers.forEach(clearTimeout);
      store('sessionStorage', 'qnf-intro', '1');
      intro.classList.add('is-out');
      setTimeout(function () {
        html.classList.remove('intro-on');
        if (ctrl) { try { ctrl.dispose(); } catch (e) {} ctrl = null; }
        intro.remove();
      }, 650);
    }
    intro.addEventListener('click', finish);
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
    later(finish, 6000); // giới hạn an toàn

    function cssFallback() {
      if (!reduced) {
        var box = $('.intro__petals', intro);
        var n = lowPower ? 18 : 36;
        for (var i = 0; i < n; i++) {
          var p = doc.createElement('i'), a = (i / n) * Math.PI * 2 + Math.random() * .3, d = 120 + Math.random() * 220;
          p.className = 'cpetal cpetal--' + (i % 3);
          p.style.setProperty('--dx', Math.cos(a) * d + 'px');
          p.style.setProperty('--dy', Math.sin(a) * d * .8 + 'px');
          p.style.setProperty('--sx', (Math.random() * 60 - 30) + 'px');
          p.style.setProperty('--rot', (Math.random() * 540 - 270) + 'deg');
          p.style.animationDelay = (.25 + Math.random() * .15) + 's';
          box.appendChild(p);
        }
      }
      later(finish, 1500 + 500);
    }

    // Chỉ chạy 3D khi máy có GPU thật; máy dùng WebGL giả lập bằng CPU (rất chậm) sẽ dùng bản chữ HTML
    var canWebGL = (function () {
      try {
        if (!window.WebGLRenderingContext) return false;
        var c = doc.createElement('canvas'), o = { failIfMajorPerformanceCaveat: !/intro3d=force/.test(location.search) };
        var gl = c.getContext('webgl2', o) || c.getContext('webgl', o);
        if (!gl) return false;
        var dbg = gl.getExtension('WEBGL_debug_renderer_info');
        var r = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
        var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
        return /intro3d=force/.test(location.search) || !/swiftshader|llvmpipe|software|basic render/i.test(r);
      } catch (e) { return false; }
    })();
    var importMapOK = window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('importmap');
    if (reduced || !canWebGL || !importMapOK) { cssFallback(); return; }

    var t0 = performance.now(), fellBack = false;
    // Nếu Three.js tải quá chậm thì dùng bản chữ HTML để khách không phải chờ
    later(function () { if (!ctrl && !done) { fellBack = true; cssFallback(); } }, 2200);
    var v = html.getAttribute('data-v') || '';
    import(new URL('/assets/js/intro3d.js?v=' + v, location.origin).href)
      .then(function (m) {
        if (done || fellBack) return;
        return m.play({
          canvas: $('.intro__canvas', intro),
          hello: $('.intro__hello', intro),
          fontUrl: new URL('/assets/fonts/qnf-3d.typeface.json?v=' + v, location.origin).href,
          lowPower: lowPower,
          input: input,
        }).then(function (c) {
          if (done || fellBack) { c.dispose(); return; }
          ctrl = c; intro.classList.add('is-3d');
          later(finish, 3400);
        });
      })
      .catch(function (err) {
        if (window.console) console.warn('[intro3d]', err);
        if (!done && !fellBack) { fellBack = true; cssFallback(); }
      });
    void t0;
  }

  /* =========================================================
     [C] MENU
     ========================================================= */
  function initNav() {
    var nav = $('#nav'), burger = $('.nav__burger', nav);
    if (!nav || !burger) return;
    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      html.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    }
    burger.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    $$('#nav-menu a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); burger.focus(); } });

    // Mục đang xem được đánh dấu sẵn trong HTML (aria-current="page") khi build từng trang

    // Menu thả xuống kiểu Nike (máy tính): rê chuột / focus vào MỘT mục → chỉ hạ phần của mục đó
    var mega = $('#mega'), list = $('.nav__list', nav);
    if (!mega || !list) return;
    var desk = window.matchMedia('(min-width:1024px)'), panels = $$('.mega__panel', mega), inner = $('.mega__in', mega), t;
    var dim = doc.createElement('div'); dim.className = 'mega-dim'; dim.setAttribute('aria-hidden', 'true'); doc.body.appendChild(dim);
    function syncPanels() { panels.forEach(function (d) { d.open = desk.matches; d.querySelector('summary').tabIndex = desk.matches ? -1 : 0; }); }
    syncPanels();
    function hide() {
      clearTimeout(t);
      nav.classList.remove('is-mega'); html.classList.remove('mega-on');
      panels.forEach(function (d) { d.classList.remove('is-on'); });
    }
    function show(li) {
      clearTimeout(t);
      var key = li && li.getAttribute('data-mega'), pnl = key && $('.mega__panel[data-panel="' + key + '"]', mega);
      if (!desk.matches || !pnl) { hide(); return; }
      panels.forEach(function (d) { d.classList.toggle('is-on', d === pnl); });
      // canh phần sổ xuống thẳng dưới mục menu, không tràn mép phải
      pnl.style.setProperty('--mx', '0px');
      var box = inner.getBoundingClientRect(), pad = parseFloat(getComputedStyle(inner).paddingLeft) || 0;
      var room = box.width - pad * 2 - pnl.offsetWidth;
      var x = li.getBoundingClientRect().left - box.left - pad + 12;
      pnl.style.setProperty('--mx', Math.max(0, Math.min(x, room)) + 'px');
      nav.classList.add('is-mega'); html.classList.add('mega-on');
    }
    if (desk.addEventListener) desk.addEventListener('change', function () { syncPanels(); hide(); });
    $$('li', list).forEach(function (li) { li.addEventListener('mouseenter', function () { show(li); }); });
    mega.addEventListener('mouseenter', function () { clearTimeout(t); });
    nav.addEventListener('mouseleave', function () { t = setTimeout(hide, 160); });
    dim.addEventListener('mouseenter', hide);
    nav.addEventListener('focusin', function (e) {
      if (mega.contains(e.target)) { clearTimeout(t); return; }
      var li = e.target.closest && e.target.closest('.nav__list > li');
      if (li) show(li); else hide();
    });
    nav.addEventListener('focusout', function (e) { if (!nav.contains(e.relatedTarget)) hide(); });
    $$('summary', mega).forEach(function (sm) { sm.addEventListener('click', function (e) { if (desk.matches) e.preventDefault(); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-mega')) hide(); });
  }

  /* =========================================================
     Hiện dần khi cuộn + đếm số
     ========================================================= */
  function countUp(el) {
    var to = +el.getAttribute('data-count'), t0 = performance.now(), dur = to > 10 ? 1400 : 700;
    if (reduced) return;
    el.textContent = '0';
    addJob(function () {
      var k = clamp((performance.now() - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(to * e));
      return k < 1;
    });
  }
  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        $$('[data-count]', en.target).forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* =========================================================
     Parallax lớp trang trí (±12px) + nghiêng thẻ theo máy
     ========================================================= */
  function initMotion() {
    if (reduced) return;
    var layers = $$('[data-depth]').map(function (el) { return { el: el, d: +el.getAttribute('data-depth') || .5, vis: false }; });
    var grid = $('#product-grid');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { layers.forEach(function (l) { if (l.el === en.target) l.vis = en.isIntersecting; }); });
      });
      layers.forEach(function (l) { io.observe(l.el); });
    } else layers.forEach(function (l) { l.vis = true; });

    var gridTilt = { x: 0, y: 0 };
    function step() {
      input.x = lerp(input.x, input.tx, .08); input.y = lerp(input.y, input.ty, .08);
      layers.forEach(function (l) {
        if (!l.vis) return;
        l.el.style.transform = 'translate3d(' + (input.x * 12 * l.d).toFixed(2) + 'px,' + (input.y * 12 * l.d).toFixed(2) + 'px,0)';
      });
      if (grid && input.source === 'tilt') {
        gridTilt.x = lerp(gridTilt.x, input.ty * -6, .1); gridTilt.y = lerp(gridTilt.y, input.tx * 6, .1);
        grid.style.setProperty('--rx', gridTilt.x.toFixed(2) + 'deg');
        grid.style.setProperty('--ry', gridTilt.y.toFixed(2) + 'deg');
      }
      return Math.abs(input.x - input.tx) > .001 || Math.abs(input.y - input.ty) > .001;
    }
    inputListeners.push(function () { addJob(step); });

    if (finePointer) {
      var pending = false;
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || pending) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; setInput(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1, 'mouse'); });
      }, { passive: true });
      return;
    }

    // Điện thoại: nghiêng / lắc máy
    var base = null;
    function onOrient(e) {
      if (e.gamma == null || e.beta == null) return;
      if (base === null) base = e.beta;
      setInput(e.gamma / 25, (e.beta - base) / 25, 'tilt');
    }
    var DOE = window.DeviceOrientationEvent;
    if (!DOE) return;
    if (typeof DOE.requestPermission === 'function') {
      var btn = $('.tilt-btn');
      if (!btn) return;
      btn.hidden = false;
      btn.addEventListener('click', function () {
        DOE.requestPermission().then(function (state) {
          btn.hidden = true;
          if (state === 'granted') window.addEventListener('deviceorientation', onOrient);
        }).catch(function () { btn.hidden = true; });
      });
    } else {
      window.addEventListener('deviceorientation', onOrient);
    }
  }

  /* =========================================================
     [F] SẢN PHẨM — lọc, thẻ nghiêng, chạm lần 1 xem thông tin
     ========================================================= */
  function productById(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    var card = doc.getElementById(id);
    if (!card) return null;
    return {
      id: id,
      name: ($('.pcard__name', card) || {}).textContent || '',
      size: ($('.pcard__size', card) || {}).textContent || '',
      category: card.getAttribute('data-cat'),
      desc: '', images: [], video: '',
    };
  }
  function imgPath(name, w) { return '/assets/img/products/' + name + '-' + w + '.webp'; }
  function imgTag(p, name, alt, sizes, lazy) {
    return '<img src="' + imgPath(name, 800) + '" srcset="' + imgPath(name, 400) + ' 400w, ' + imgPath(name, 800) + ' 800w, ' + imgPath(name, 1200) + ' 1200w" sizes="' + sizes + '" width="800" height="1000" alt="' + alt + '"' + (lazy ? ' loading="lazy"' : '') + ' decoding="async">';
  }

  // Bỏ dấu tiếng Việt để tìm "sinh nhat" vẫn ra "Sinh nhật"
  function fold(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, ' '); }

  /* =========================================================
     Ô TÌM KIẾM — gợi ý nhanh từ danh sách mẫu + các mục của tiệm
     ========================================================= */
  function initSearch() {
    var forms = $$('.nav__search');
    if (!forms.length) return;
    var dip = '/san-pham/?loai=hoa-theo-dip';
    var idx = [
      ['Hoa sáp', '/lien-he/', 'Hoa sáp'], ['Hoa tươi theo dịp', dip, 'Danh mục'], ['Trụ hoa để bàn decor', '/san-pham/?loai=tru-hoa-de-ban', 'Danh mục'],
      ['Sinh nhật', dip, 'Dịp'], ['Tốt nghiệp', dip, 'Dịp'], ['Kỷ niệm', dip, 'Dịp'], ['Chúc mừng – Khai trương', dip, 'Dịp'], ['Lời cảm ơn', dip, 'Dịp'],
      ['8/3 – Quốc tế Phụ nữ', dip, 'Dịp'], ['20/10 – Phụ nữ Việt Nam', dip, 'Dịp'], ['20/11 – Nhà giáo Việt Nam', dip, 'Dịp'],
      ['Quy trình 4 bước', '/giai-phap/#quy-trinh', 'Giải pháp'], ['Câu hỏi thường gặp', '/giai-phap/#hoi-dap', 'Giải pháp'],
      ['Giới thiệu', '/gioi-thieu/', 'Trang'], ['Liên hệ – địa chỉ tiệm', '/lien-he/', 'Trang']
    ];
    PRODUCTS.forEach(function (p) { idx.push([p.name, '/san-pham/#' + p.id, p.category === 'table' ? 'Trụ để bàn' : 'Theo dịp']); });
    idx.forEach(function (r) { r.push(fold(r[0])); });

    forms.forEach(function (form) {
      var input = $('input', form), list = doc.createElement('div'), sel = -1;
      list.className = 'srch__list'; list.hidden = true;
      form.appendChild(list);
      function links() { return $$('a', list); }
      function render() {
        var v = fold(input.value.trim()); sel = -1;
        list.textContent = '';
        if (!v) { list.hidden = true; return; }
        var words = v.split(' '), hits = idx.filter(function (r) { return words.every(function (w) { return r[3].indexOf(w) !== -1; }); }).slice(0, 7);
        if (!hits.length) {
          var e = doc.createElement('p'); e.className = 'srch__empty'; e.textContent = 'Chưa có mẫu khớp — bấm Enter để xem tất cả mẫu';
          list.appendChild(e);
        }
        hits.forEach(function (r) {
          var a = doc.createElement('a'), t = doc.createElement('span'), s = doc.createElement('small');
          a.href = r[1]; t.textContent = r[0]; s.textContent = r[2];
          a.appendChild(t); a.appendChild(s); list.appendChild(a);
        });
        list.hidden = false;
      }
      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      input.addEventListener('keydown', function (e) {
        var ls = links();
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          if (!ls.length) return;
          e.preventDefault();
          sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + ls.length) % ls.length;
          ls.forEach(function (a, i) { a.classList.toggle('is-sel', i === sel); });
        } else if (e.key === 'Enter' && sel >= 0 && ls[sel]) {
          e.preventDefault(); location.href = ls[sel].href;
        } else if (e.key === 'Escape') { list.hidden = true; }
      });
      form.addEventListener('focusout', function (e) { if (!form.contains(e.relatedTarget)) list.hidden = true; });
      form.addEventListener('submit', function (e) { if (!input.value.trim()) e.preventDefault(); });
      var q = new URLSearchParams(location.search).get('q');
      if (q) input.value = q;
    });

    // Điện thoại: nút kính lúp → mở menu và đặt con trỏ vào ô tìm
    var btn = $('.nav__search-btn'), burger = $('.nav__burger'), mi = $('.nav__search--menu input');
    if (btn && burger && mi) btn.addEventListener('click', function () {
      if (!$('#nav').classList.contains('is-open')) burger.click();
      setTimeout(function () { mi.focus(); }, 60);
    });
  }

  function initProducts() {
    var grid = $('#product-grid');
    if (!grid) return;
    var cards = $$('.pcard', grid);

    // Ảnh được thêm vào products.js nhưng chưa chạy build → tự thay placeholder
    cards.forEach(function (card) {
      var p = productById(card.id), media = $('.pcard__media', card);
      if (p && p.images && p.images.length && media && $('.ph', media)) {
        media.innerHTML = imgTag(p, p.images[0], p.name + ' – ' + p.size, '(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw', true);
      }
    });

    // Bộ lọc
    var tabs = $$('.tab');
    function setFilter(f) {
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.getAttribute('data-filter') === f)); });
      cards.forEach(function (c) {
        var show = f === 'all' || c.getAttribute('data-cat') === f;
        var was = !c.classList.contains('is-hidden');
        c.classList.toggle('is-hidden', !show);
        if (show && !was && !reduced) {
          c.classList.add('is-entering');
          requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.remove('is-entering'); }); });
        }
      });
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { setFilter(t.getAttribute('data-filter')); }); });
    // Mở sẵn tab lọc khi đến từ trang Giải pháp: /san-pham/?loai=hoa-theo-dip | tru-hoa-de-ban
    var loai = { 'hoa-theo-dip': 'occasion', 'tru-hoa-de-ban': 'table' }[new URLSearchParams(location.search).get('loai')];
    if (loai) setFilter(loai);

    // Tìm kiếm từ ô "Tìm kiếm" trên menu: /san-pham/?q=...
    var q = (new URLSearchParams(location.search).get('q') || '').trim(), note = $('#srch-note');
    if (q && note) {
      var nq = fold(q), n = 0;
      setFilter('all');
      cards.forEach(function (c) {
        var hit = fold(c.textContent).indexOf(nq) !== -1;
        c.classList.toggle('is-hidden', !hit);
        if (hit) n++;
      });
      note.textContent = '';
      note.appendChild(doc.createTextNode(n ? 'Kết quả cho “' + q + '”: ' + n + ' mẫu · ' : 'Chưa có mẫu khớp “' + q + '” — nhắn Zalo để tiệm tư vấn · '));
      var all = doc.createElement('a'); all.href = '/san-pham/'; all.textContent = 'Xem tất cả mẫu';
      note.appendChild(all); note.hidden = false;
      tabs.forEach(function (t) { t.addEventListener('click', function () { note.hidden = true; }); });
    }

    // Bấm/chạm 1 lần là mở chi tiết (trên điện thoại tên + kích thước đã hiện sẵn trên ô)
    grid.addEventListener('click', function (e) {
      var link = e.target.closest('.pcard__link');
      if (!link) return;
      e.preventDefault();
      openModal(link.closest('.pcard').id, link, true);
    });

    // Nghiêng 3D theo chuột (tối đa 8°) + vệt sáng
    if (reduced || !finePointer) return;
    cards.forEach(function (card) {
      var link = $('.pcard__link', card), s = { rx: 0, ry: 0, trx: 0, try_: 0, gx: 50, gy: 50 }, active = false;
      function step() {
        s.rx = lerp(s.rx, s.trx, .14); s.ry = lerp(s.ry, s.try_, .14);
        link.style.setProperty('--rx', s.rx.toFixed(2) + 'deg');
        link.style.setProperty('--ry', s.ry.toFixed(2) + 'deg');
        link.style.setProperty('--gx', s.gx + '%'); link.style.setProperty('--gy', s.gy + '%');
        var moving = Math.abs(s.rx - s.trx) > .01 || Math.abs(s.ry - s.try_) > .01;
        if (!moving && !active) card.classList.remove('is-tilting');
        return moving;
      }
      link.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = link.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        s.try_ = (px - .5) * 16; s.trx = (.5 - py) * 16; s.gx = Math.round(px * 100); s.gy = Math.round(py * 100);
        active = true; card.classList.add('is-tilting'); addJob(step);
      });
      link.addEventListener('pointerleave', function () { s.trx = 0; s.try_ = 0; active = false; addJob(step); });
    });
  }

  /* =========================================================
     POPUP SẢN PHẨM
     ========================================================= */
  var pm, pmPanel, pmFrame, pmThumbs, lastFocus = null, pmCurrent = null, pmParallax = { x: 0, y: 0, tx: 0, ty: 0 };
  var CAT_LABEL = { occasion: 'Hoa theo dịp', table: 'Trụ hoa để bàn decor' };

  function buildMedia(p) {
    var list = [];
    if (p.video) list.push({ type: 'video', src: p.video });
    (p.images || []).forEach(function (n) { list.push({ type: 'img', name: n }); });
    if (!list.length) list = [{ type: 'ph', v: '' }, { type: 'ph', v: ' ph--2' }, { type: 'ph', v: ' ph--3' }];
    return list;
  }
  function mediaHTML(p, m, big) {
    if (m.type === 'video') return '<video src="' + m.src + '" autoplay muted loop playsinline preload="metadata" aria-label="Video ' + p.name + '"></video>';
    if (m.type === 'img') return imgTag(p, m.name, p.name + ' – ' + p.size, big ? '(min-width:1024px) 900px, 100vw' : '96px', !big);
    return '<div class="ph' + m.v + '"><svg aria-hidden="true"><use href="#i-flower"/></svg>' + (big ? '<span>Ảnh sẽ cập nhật</span>' : '') + '</div>';
  }

  function showSlide(i) {
    $$('.pm__slide', pmFrame).forEach(function (s, k) {
      s.classList.toggle('is-on', k === i);
      var v = $('video', s); if (v) { if (k === i) v.play().catch(function () {}); else v.pause(); }
    });
    $$('.pm__thumb', pmThumbs).forEach(function (t, k) { t.setAttribute('aria-current', String(k === i)); });
  }

  var pmPushed = false; // popup mở bằng cách bấm → có 1 bước trong lịch sử để nút "Quay lại" chỉ đóng popup
  function openModal(id, from, push) {
    var p = productById(id);
    if (!p || !pm) return;
    pmCurrent = p;
    lastFocus = from || doc.activeElement;
    $('#pm-cat').textContent = CAT_LABEL[p.category] || '';
    $('#pm-name').textContent = p.name;
    $('#pm-size').textContent = p.size;
    $('#pm-desc').textContent = p.desc || '';
    var media = buildMedia(p);
    pmFrame.innerHTML = media.map(function (m, i) { return '<div class="pm__slide' + (i === 0 ? ' is-on' : '') + '"><div class="pm__kb">' + mediaHTML(p, m, true) + '</div></div>'; }).join('');
    pmThumbs.innerHTML = media.map(function (m, i) {
      return '<button type="button" class="pm__thumb" aria-label="Xem ảnh ' + (i + 1) + '" aria-current="' + (i === 0) + '">' + (m.type === 'video' ? '<div class="ph"><svg aria-hidden="true"><use href="#i-flower"/></svg></div><span class="pm__thumb-play">Video</span>' : mediaHTML(p, m, false)) + '</button>';
    }).join('');
    $$('.pm__thumb', pmThumbs).forEach(function (b, i) { b.addEventListener('click', function () { showSlide(i); }); });
    pm.hidden = false;
    html.classList.add('modal-open');
    var fab = $('#fab'); if (fab) fab.classList.add('is-hidden');
    requestAnimationFrame(function () { requestAnimationFrame(function () { pm.classList.add('is-open'); }); });
    $('.pm__close', pm).focus({ preventScroll: true });
    if (location.hash !== '#' + id && history.pushState) {
      if (push && !pmPushed) { history.pushState({ qnfModal: id }, '', '#' + id); pmPushed = true; }
      else history.replaceState(history.state, '', '#' + id);
    }
    showSlide(0);
  }

  // fromHistory = true khi đóng do khách bấm nút "Quay lại" của trình duyệt/điện thoại
  function closeModal(fromHistory) {
    if (!pm || pm.hidden) return;
    if (pmPushed && fromHistory !== true) { pmPushed = false; history.back(); return; } // popstate sẽ gọi lại closeModal(true)
    pmPushed = false;
    pm.classList.remove('is-open');
    pmPanel.style.transform = '';
    html.classList.remove('modal-open');
    var fab = $('#fab'); if (fab && !fab.dataset.nearForm) fab.classList.remove('is-hidden');
    if (history.replaceState && /^#sp-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    setTimeout(function () {
      if (pm.classList.contains('is-open')) return;
      pm.hidden = true; pmFrame.innerHTML = ''; pmThumbs.innerHTML = '';
    }, reduced ? 0 : 450);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    pmCurrent = null;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = doc.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0'; doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); }
      ta.remove();
    });
  }

  function initModal() {
    pm = $('#pm'); if (!pm) return;
    pmPanel = $('.pm__panel', pm); pmFrame = $('#pm-frame'); pmThumbs = $('#pm-thumbs');

    $$('[data-close]', pm).forEach(function (b) { b.addEventListener('click', closeModal); });
    doc.addEventListener('keydown', function (e) {
      if (pm.hidden) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') { // khóa focus bên trong popup
        var f = $$('a[href],button:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])', pmPanel).filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    $('#pm-zalo').addEventListener('click', function () {
      if (!pmCurrent) return;
      copyText('Mình muốn hỏi mẫu: ' + pmCurrent.name).then(function () { toast('Đã sao chép tên mẫu'); }, function () {});
    });

    // Parallax ảnh lớn theo chuột / nghiêng máy
    if (!reduced) {
      var stage = $('.pm__stage', pm);
      function step() {
        pmParallax.x = lerp(pmParallax.x, pmParallax.tx, .1); pmParallax.y = lerp(pmParallax.y, pmParallax.ty, .1);
        var kb = $('.pm__slide.is-on .pm__kb', pm);
        if (kb) { kb.style.setProperty('--px', pmParallax.x.toFixed(2) + 'px'); kb.style.setProperty('--py', pmParallax.y.toFixed(2) + 'px'); }
        return !pm.hidden && (Math.abs(pmParallax.x - pmParallax.tx) > .05 || Math.abs(pmParallax.y - pmParallax.ty) > .05);
      }
      stage.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = stage.getBoundingClientRect();
        pmParallax.tx = -((e.clientX - r.left) / r.width - .5) * 24; pmParallax.ty = -((e.clientY - r.top) / r.height - .5) * 24;
        addJob(step);
      });
      stage.addEventListener('pointerleave', function () { pmParallax.tx = pmParallax.ty = 0; addJob(step); });
      inputListeners.push(function () {
        if (pm.hidden || input.source !== 'tilt') return;
        pmParallax.tx = -input.tx * 12; pmParallax.ty = -input.ty * 12; addJob(step);
      });
    }

    // Vuốt xuống để đóng (điện thoại)
    var sy = null, sx = 0, dy = 0;
    pmPanel.addEventListener('touchstart', function (e) {
      if (e.target.closest('.pm__thumbs') || window.innerWidth >= 768) { sy = null; return; }
      sy = e.touches[0].clientY; sx = e.touches[0].clientX; dy = 0;
    }, { passive: true });
    pmPanel.addEventListener('touchmove', function (e) {
      if (sy === null) return;
      dy = e.touches[0].clientY - sy;
      if (Math.abs(e.touches[0].clientX - sx) > Math.abs(dy)) return;
      if (dy > 0) { pmPanel.style.transition = 'none'; pmPanel.style.transform = 'translateY(' + dy + 'px)'; }
    }, { passive: true });
    pmPanel.addEventListener('touchend', function () {
      if (sy === null) return;
      pmPanel.style.transition = '';
      if (dy > 110) closeModal(); else pmPanel.style.transform = '';
      sy = null;
    });

    // Mở theo hash (#sp-01) để chia sẻ link
    function fromHash() {
      var m = /^#(sp-\d{2})$/.exec(location.hash);
      if (m && doc.getElementById(m[1])) { if (pm.hidden || !pmCurrent || pmCurrent.id !== m[1]) openModal(m[1]); }
      else if (!pm.hidden) closeModal(true);
    }
    window.addEventListener('hashchange', fromHash);
    window.addEventListener('popstate', fromHash);
    fromHash();
  }

  /* =========================================================
     [I] FORM GỬI YÊU CẦU
     ========================================================= */
  function initForm() {
    var form = $('#order-form'); if (!form) return;
    var f = {
      name: $('#f-name'), phone: $('#f-phone'), occasion: $('#f-occasion'), date: $('#f-date'),
      budget: $('#f-budget'), msg: $('#f-msg'), hp: $('#f-web'),
    };
    var status = $('#f-status'), submit = $('#f-submit'), startedAt = 0, tsToken = '', tsWidget = null;
    var ZALO = CFG.ZALO_URL || 'https://zalo.me/0857380325', PHONE = CFG.PHONE_DISPLAY || '0857 380 325';

    // Ngày: không cho chọn ngày đã qua
    function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
    var today = new Date(); today.setHours(0, 0, 0, 0);
    f.date.min = ymd(today);
    f.date.addEventListener('change', function () {
      var hint = $('#f-date-hint'), v = f.date.value;
      if (!v) { hint.textContent = ''; return; }
      var d = new Date(v + 'T00:00:00');
      if (d < today) { f.date.value = ''; hint.textContent = ''; return; }
      hint.textContent = (d - today) / 864e5 < 4 ? 'Mẫu theo yêu cầu cần đặt trước 4–5 ngày — mẫu có sẵn vẫn có thể nhận trong ngày.' : '';
    });

    // Đếm ký tự lời nhắn
    var cnt = $('#f-msg-count span');
    f.msg.addEventListener('input', function () { cnt.textContent = f.msg.value.length; });

    form.addEventListener('focusin', function () {
      if (!startedAt) startedAt = Date.now();
      loadTurnstile();
    });

    // Cloudflare Turnstile (chỉ tải khi có site key và khi khách bắt đầu điền form)
    var tsLoading = false;
    function loadTurnstile() {
      if (tsLoading || missing(CFG.TURNSTILE_SITE_KEY)) return;
      tsLoading = true;
      window.qnfTurnstileReady = function () {
        tsWidget = window.turnstile.render('#turnstile', {
          sitekey: CFG.TURNSTILE_SITE_KEY, language: 'vi', theme: 'light',
          callback: function (t) { tsToken = t; }, 'expired-callback': function () { tsToken = ''; },
        });
      };
      var s = doc.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=qnfTurnstileReady';
      s.async = true; s.defer = true; doc.head.appendChild(s);
    }

    function setErr(el, msg) {
      var e = $('#' + el.id + '-err');
      if (e) e.textContent = msg || '';
      if (msg) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', el.id + '-err'); }
      else el.removeAttribute('aria-invalid');
    }
    function normPhone(v) {
      v = v.replace(/[\s.\-()]/g, '');
      if (v.indexOf('+84') === 0) v = '0' + v.slice(3); else if (v.indexOf('84') === 0 && v.length === 11) v = '0' + v.slice(2);
      return v;
    }
    function showStatus(ok, text) {
      status.innerHTML = '';
      var box = doc.createElement('div'); box.className = 'form__msg ' + (ok ? 'form__msg--ok' : 'form__msg--err');
      var p = doc.createElement('p'); p.textContent = text; box.appendChild(p);
      if (!ok) {
        var a = doc.createElement('a'); a.className = 'btn btn--pink btn--sm'; a.href = ZALO; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Nhắn Zalo';
        box.appendChild(a);
      }
      status.appendChild(box);
    }
    var ERR_TEXT = 'Chưa gửi được, bạn nhắn Zalo ' + PHONE + ' giúp mình nhé.';

    [f.name, f.phone, f.msg].forEach(function (el) { el.addEventListener('input', function () { setErr(el, ''); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      var name = f.name.value.trim(), phone = normPhone(f.phone.value.trim()), msg = f.msg.value.trim();
      if (name.length < 2) { setErr(f.name, 'Vui lòng nhập họ tên.'); ok = false; first = first || f.name; }
      if (!/^0[35789]\d{8}$/.test(phone)) { setErr(f.phone, 'Số điện thoại chưa đúng — cần đủ 10 chữ số, bắt đầu bằng 0.'); ok = false; first = first || f.phone; }
      if ((msg.match(/https?:\/\//gi) || []).length >= 2) { setErr(f.msg, 'Lời nhắn có quá nhiều đường link, bạn bớt link giúp mình nhé.'); ok = false; first = first || f.msg; }
      if (!ok) { first.focus(); return; }

      // Chống spam phía trình duyệt
      if (f.hp.value) { showStatus(true, 'Cảm ơn bạn! Quỳnh Như sẽ liên hệ lại sớm.'); form.reset(); return; } // bot: giả vờ thành công
      if (!startedAt || Date.now() - startedAt < 3000) { showStatus(false, 'Bạn kiểm tra lại thông tin giúp mình rồi bấm gửi lần nữa nhé.'); startedAt = startedAt || Date.now(); return; }
      var last = +store('localStorage', 'qnf-last-submit') || 0;
      if (Date.now() - last < 60000) { showStatus(false, 'Bạn vừa gửi yêu cầu rồi, vui lòng chờ khoảng 1 phút để gửi tiếp nhé.'); return; }
      if (!missing(CFG.TURNSTILE_SITE_KEY) && !tsToken) { showStatus(false, 'Bạn vui lòng hoàn tất ô xác minh phía trên rồi gửi lại nhé.'); return; }
      if (missing(CFG.WEB3FORMS_ACCESS_KEY)) { showStatus(false, ERR_TEXT); return; }

      submit.disabled = true;
      var payload = {
        access_key: CFG.WEB3FORMS_ACCESS_KEY,
        subject: 'Yêu cầu đặt hoa mới – Quỳnh Như Florist',
        from_name: 'Website Quỳnh Như Florist',
        'Họ tên': name, 'Số điện thoại / Zalo': phone, 'Dịp': f.occasion.value,
        'Ngày cần hoa': f.date.value || '(chưa chọn)', 'Ngân sách dự kiến': f.budget.value.trim() || '(không ghi)',
        'Lời nhắn': msg || '(không có)', botcheck: '',
      };
      if (tsToken) payload['cf-turnstile-response'] = tsToken;
      fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload),
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === false) throw new Error(j.message || r.status); }); })
        .then(function () {
          store('localStorage', 'qnf-last-submit', String(Date.now()));
          form.reset(); cnt.textContent = '0'; $('#f-date-hint').textContent = ''; startedAt = 0;
          showStatus(true, 'Cảm ơn bạn! Quỳnh Như sẽ liên hệ lại sớm.');
          var r = submit.getBoundingClientRect(); petalBurst(r.left + r.width / 2, r.top + r.height / 2, 46);
        })
        .catch(function () { showStatus(false, ERR_TEXT); })
        .then(function () {
          submit.disabled = false; tsToken = '';
          if (tsWidget !== null && window.turnstile) window.turnstile.reset(tsWidget);
        });
    });
  }

  /* Nút nổi: ẩn khi gần nút "Gửi" để không che */
  function initFab() {
    var fab = $('#fab'), foot = $('.form__foot');
    if (!fab || !foot || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      var near = es[0].isIntersecting;
      if (near) fab.dataset.nearForm = '1'; else delete fab.dataset.nearForm;
      fab.classList.toggle('is-hidden', near || (pm && !pm.hidden));
    }, { rootMargin: '0px 0px -40px 0px' }).observe(foot);
  }

  /* ---------- Khởi động ---------- */
  initIntro();
  initNav();
  initSearch();
  initReveal();
  initProducts();
  initModal();
  initMotion();
  initForm();
  initFab();
})();
