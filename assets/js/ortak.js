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

  function showPage(id, hashYazma) {
    id = ESKI_ADLAR[id] || id;
    var hedef = document.getElementById(id);
    if (!hedef || !hedef.classList.contains('page')) return;

    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    hedef.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(function (b) {
      var secili = b.getAttribute('data-page') === id;
      b.classList.toggle('active', secili);
      if (secili && b.scrollIntoView && window.innerWidth <= 900) {
        b.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    });
    var ana = document.querySelector('.main-content');
    if (ana) ana.scrollTop = 0;

    if (aktifSayfa && aktifSayfa !== id && gorunur[aktifSayfa]) gorunur[aktifSayfa](false);
    aktifSayfa = id;
    if (acilis[id]) { var k = acilis[id]; acilis[id] = null; k(); }
    if (gorunur[id]) gorunur[id](true);
    if (id === 'oyunlar') Oyun.yildizCiz();

    if (!hashYazma) {
      try { history.replaceState(null, '', '#' + id); } catch (e) { /* file:// vb. */ }
    }
  }
  window.showPage = showPage;

  document.addEventListener('click', function (olay) {
    var b = olay.target.closest ? olay.target.closest('[data-page]') : null;
    if (b) { olay.preventDefault(); showPage(b.getAttribute('data-page')); }
  });

  function hashtenAc() {
    var h = (location.hash || '').replace('#', '');
    if (h) showPage(h, true);
  }
  window.addEventListener('hashchange', hashtenAc);
  document.addEventListener('DOMContentLoaded', function () {
    Oyun.yildizCiz();
    hashtenAc();
  });
})();
