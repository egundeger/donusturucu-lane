/* Ortak altyapı: sayfa geçişi, kayıt, yıldızlar, küçük yardımcılar */
(function () {
  'use strict';

  var ESKI_ADLAR = { game: 'oyunlar' };
  var acilis = {};   // sayfa id -> ilk açılışta çalışacak kurucu
  var gorunur = {};  // sayfa id -> (aktifMi) => void

  var Oyun = {
    /* --- kalıcı kayıt (tarayıcı izin vermezse sessizce atlanır) --- */
    oku: function (anahtar) {
      try { return JSON.parse(window.localStorage.getItem('trf_' + anahtar)); } catch (e) { return null; }
    },
    yaz: function (anahtar, deger) {
      try { window.localStorage.setItem('trf_' + anahtar, JSON.stringify(deger)); } catch (e) { /* yok say */ }
    },

    /* --- yıldızlar --- */
    yildizVer: function (oyun, n) {
      var y = Oyun.oku('yildiz') || {};
      if (!(y[oyun] >= n)) { y[oyun] = n; Oyun.yaz('yildiz', y); }
      Oyun.yildizCiz();
    },
    yildizMetni: function (n) {
      var s = '';
      for (var i = 1; i <= 3; i++) s += i <= n ? '★' : '☆';
      return s;
    },
    yildizCiz: function () {
      var y = Oyun.oku('yildiz') || {};
      document.querySelectorAll('[data-yildiz]').forEach(function (el) {
        var n = y[el.getAttribute('data-yildiz')] || 0;
        el.textContent = Oyun.yildizMetni(n);
        el.title = n ? 'En iyi sonucun: ' + n + ' / 3 yıldız' : 'Henüz oynanmadı';
        el.classList.toggle('var', n > 0);
      });
    },

    /* --- sayfa kancaları --- */
    kaydet: function (sayfaId, kurucu, gorunurluk) {
      acilis[sayfaId] = kurucu;
      if (gorunurluk) gorunur[sayfaId] = gorunurluk;
    },

    /* --- yardımcılar --- */
    el: function (etiket, sinif, html) {
      var e = document.createElement(etiket);
      if (sinif) e.className = sinif;
      if (html != null) e.innerHTML = html;
      return e;
    },
    karistir: function (dizi) {
      var a = dizi.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },
    sayi: function (x) {
      var y = Math.round(x * 10) / 10;
      return (y % 1 === 0 ? String(y) : y.toFixed(1)).replace('.', ',');
    },
    hareketAz: function () {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  };
  window.Oyun = Oyun;

  var aktifSayfa = null;
  var dar = window.matchMedia ? window.matchMedia('(max-width: 1199px)') : { matches: false };
  var menuDugme = null;

  /* --- yandan açılan menü (telefon ve tablet) --- */
  function menuAyarla(acik, odakla) {
    if (!menuDugme) return;
    acik = !!acik && dar.matches;
    var onceki = document.body.classList.contains('menu-acik');
    document.body.classList.toggle('menu-acik', acik);
    menuDugme.setAttribute('aria-expanded', acik ? 'true' : 'false');
    menuDugme.setAttribute('aria-label', acik ? 'Menüyü kapat' : 'Menüyü aç');
    if (acik && !onceki) {
      var secili = document.querySelector('.nav-btn.active');
      if (secili) setTimeout(function () {
        if (secili.scrollIntoView) secili.scrollIntoView({ block: 'center' });
        try { secili.focus({ preventScroll: true }); } catch (e) { /* eski tarayıcı */ }
      }, 80);
    } else if (!acik && onceki && odakla) {
      menuDugme.focus();
    }
  }

  function sayfaAdi(dugme) {
    var ad = '';
    dugme.childNodes.forEach(function (n) { if (n.nodeType === 3) ad += n.textContent; });
    return ad.replace(/\s+/g, ' ').trim();
  }

  function showPage(id) {
    id = ESKI_ADLAR[id] || id;
    var hedef = document.getElementById(id);
    if (!hedef || !hedef.classList.contains('page')) return false;

    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    hedef.classList.add('active');
    var baslik = '';
    document.querySelectorAll('.nav-btn').forEach(function (b) {
      var secili = b.getAttribute('data-page') === id;
      b.classList.toggle('active', secili);
      if (secili) { b.setAttribute('aria-current', 'page'); baslik = sayfaAdi(b); } else b.removeAttribute('aria-current');
    });
    if (baslik) {
      var ust = document.getElementById('ust-sayfa');
      if (ust) ust.textContent = baslik;
      document.title = baslik + ' · Transformer';
    }
    var ana = document.querySelector('.main-content');
    if (ana) ana.scrollTop = 0;
    menuAyarla(false);

    if (aktifSayfa && aktifSayfa !== id && gorunur[aktifSayfa]) gorunur[aktifSayfa](false);
    aktifSayfa = id;
    if (acilis[id]) { var k = acilis[id]; acilis[id] = null; k(); }
    if (gorunur[id]) gorunur[id](true);
    if (id === 'oyunlar') Oyun.yildizCiz();
    return true;
  }

  /* Sayfa geçişi adres çubuğundaki # üzerinden yapılır: böylece telefonun/tarayıcının
     "geri" düğmesi siteden çıkmak yerine bir önceki bölüme döner. */
  function git(id) {
    id = ESKI_ADLAR[id] || id;
    if (!document.getElementById(id)) return;
    if (location.hash === '#' + id) { showPage(id); return; }
    try { location.hash = id; } catch (e) { showPage(id); }
  }
  window.showPage = git;

  function hashtenAc() {
    var h = (location.hash || '').replace('#', '');
    if (!showPage(h || 'p0') && h) showPage('p0');
  }
  window.addEventListener('hashchange', hashtenAc);

  document.addEventListener('click', function (olay) {
    var t = olay.target;
    if (!t.closest) return;
    var b = t.closest('[data-page]');
    if (b) { olay.preventDefault(); git(b.getAttribute('data-page')); return; }
    if (t.closest('.menu-dugme')) { menuAyarla(!document.body.classList.contains('menu-acik')); return; }
    if (t.closest('.menu-kapat') || t.closest('.menu-perde')) menuAyarla(false, true);
  });
  document.addEventListener('keydown', function (olay) {
    if (olay.key === 'Escape' && document.body.classList.contains('menu-acik')) menuAyarla(false, true);
  });

  document.addEventListener('DOMContentLoaded', function () {
    menuDugme = document.querySelector('.menu-dugme');
    var yan = document.getElementById('yan-menu');
    if (yan) {
      /* menüyü sola kaydırarak kapatma */
      var bas = null;
      yan.addEventListener('touchstart', function (o) { var d = o.changedTouches[0]; bas = { x: d.clientX, y: d.clientY }; }, { passive: true });
      yan.addEventListener('touchend', function (o) {
        if (!bas) return;
        var d = o.changedTouches[0], dx = d.clientX - bas.x, dy = d.clientY - bas.y; bas = null;
        if (dx < -70 && Math.abs(dy) < 60) menuAyarla(false);
      }, { passive: true });
    }
    var degisti = function () { if (!dar.matches) menuAyarla(false); };
    if (dar.addEventListener) dar.addEventListener('change', degisti); else if (dar.addListener) dar.addListener(degisti);
    Oyun.yildizCiz();
    hashtenAc();
  });
})();
