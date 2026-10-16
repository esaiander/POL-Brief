/* Payer of Last Resort Brief — page behaviour.
   Ported from the Claude Design prototype's component script.
   Optional variants, set as attributes on <html>:
     data-palette="institutional|woodland|ink|aubergine"
     data-density="compact|standard|spacious"
     data-cover="photo|editorial|minimal"               */
(function () {
  'use strict';

  var root = document.documentElement;
  var opts = {
    palette: (root.getAttribute('data-palette') || 'institutional').toLowerCase(),
    density: (root.getAttribute('data-density') || 'standard').toLowerCase(),
    cover:   (root.getAttribute('data-cover')   || 'photo').toLowerCase()
  };

  /* ---- colour helpers ---- */
  function hex(c) {
    c = c.replace('#', '');
    if (c.length === 3) c = c.split('').map(function (x) { return x + x; }).join('');
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  }
  function toHex(rgb) {
    return '#' + rgb.map(function (v) {
      return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    }).join('');
  }
  function mix(a, b, t) {
    var A = hex(a), B = hex(b);
    return toHex(A.map(function (v, i) { return v + (B[i] - v) * t; }));
  }
  function shade(a, t) { return mix(a, '#000000', t); }

  var palettes = {
    institutional: { primary: '#004F6E', accent: '#92D0AA', secondary: '#C76C61' },
    woodland:      { primary: '#1F4634', accent: '#8FC0A0', secondary: '#CE9A52' },
    ink:           { primary: '#26303A', accent: '#C97B54', secondary: '#7C99AA' },
    aubergine:     { primary: '#3B2C46', accent: '#C79BB4', secondary: '#7FAE92' }
  };
  function buildMap(p) {
    var w = '#ffffff';
    return {
      '#004f6e': p.primary,
      '#92d0aa': p.accent,
      '#c76c61': p.secondary,
      '#d6e6ee': mix(p.primary, w, 0.78),
      '#aecbd9': mix(p.primary, w, 0.62),
      '#cce0ec': mix(p.primary, w, 0.80),
      '#f4fbf7': mix(p.accent, w, 0.90),
      '#d4eddd': mix(p.accent, w, 0.72),
      '#3a7d5a': shade(p.accent, 0.44),
      '#f1f9f4': mix(p.accent, w, 0.88),
      '#f3f7f8': mix(p.primary, w, 0.94)
    };
  }
  var map = buildMap(palettes[opts.palette] || palettes.institutional);
  function mapHex(h) { return map[h.toLowerCase()] || h; }

  /* ---- palette: rewrite authored hex colours in inline styles ---- */
  function themedElements() {
    var wrap = document.querySelector('.doc-wrap');
    var list = wrap ? Array.prototype.slice.call(wrap.querySelectorAll('*')) : [];
    if (wrap) list.unshift(wrap);
    var bar = document.getElementById('reading-progress');
    if (bar) list.push(bar);
    return list;
  }
  function applyPalette() {
    if (opts.palette === 'institutional') return; // authored colours already match
    var keys = Object.keys(map);
    themedElements().forEach(function (el) {
      var s = el.getAttribute('style');
      if (s == null) return;
      var out = s.replace(/#[0-9a-fA-F]{6}\b/g, function (m) { return mapHex(m); });
      if (out !== s) el.setAttribute('style', out);
    });
    var st = document.createElement('style');
    st.textContent = '::selection{background:' + map['#cce0ec'] + ' !important}' +
      '.toc-link:hover{background:' + map['#f3f7f8'] + ' !important}';
    document.head.appendChild(st);
    void keys;
  }

  /* ---- density ---- */
  function applyDensity() {
    var rules = {
      compact:  '.doc-shell p{line-height:1.48 !important;margin-bottom:11px !important}.doc-shell section{margin-top:30px !important}',
      standard: '',
      spacious: '.doc-shell p{line-height:1.95 !important;margin-bottom:22px !important}.doc-shell section{margin-top:66px !important}'
    };
    var css = rules[opts.density] || '';
    if (!css) return;
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---- cover ---- */
  function applyCover() {
    var header = document.querySelector('.doc-shell > header');
    if (!header) return;
    var dome = header.querySelector('img[aria-hidden]');
    var photoImg = header.querySelector('img[src*="photo-family"]');
    var photoWrap = photoImg ? photoImg.closest('div') : null;
    if (opts.cover === 'editorial') {
      if (photoWrap) photoWrap.style.display = 'none';
      if (dome) { dome.style.display = ''; dome.style.opacity = '0.14'; }
      header.style.paddingBottom = '62px';
    } else if (opts.cover === 'minimal') {
      if (photoWrap) photoWrap.style.display = 'none';
      if (dome) dome.style.display = 'none';
      header.style.paddingBottom = '54px';
    }
    // 'photo' is the authored default: nothing to change.
  }

  /* ---- contents rail: active section + reading progress ---- */
  function setupNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-toc]'));
    if (!links.length) return;
    function setActive(id) {
      links.forEach(function (l) {
        var on = l.getAttribute('data-toc') === id;
        l.style.background = on ? mapHex('#f1f9f4') : 'transparent';
        l.style.borderLeftColor = on ? mapHex('#92d0aa') : 'transparent';
        var label = l.querySelector('.toc-label');
        if (label) {
          label.style.color = on ? mapHex('#004f6e') : mapHex('#5a6b73');
          label.style.fontWeight = on ? '700' : '500';
        }
        var dot = l.querySelector('[data-dot]');
        if (dot) dot.style.background = on ? mapHex('#92d0aa') : mapHex('#c2ccd2');
      });
    }
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setActive(e.target.getAttribute('data-section'));
        });
      }, { rootMargin: '-12% 0px -78% 0px', threshold: 0 });
      sections.forEach(function (s) { obs.observe(s); });
    }
    if (sections.length) setActive(sections[0].getAttribute('data-section'));

    var bar = document.getElementById('reading-progress');
    if (bar) {
      var onScroll = function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var pct = h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0;
        bar.style.width = pct + '%';
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();
    }
  }

  function init() {
    applyPalette();
    applyDensity();
    applyCover();
    setupNav();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
