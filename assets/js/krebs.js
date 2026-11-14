/* OYUN 3 — Krebs Bulmacası
   Üç aşama: (1) ara ürünleri sırala, (2) enzimleri eşleştir, (3) NADH / FADH2 / GTP / CO2'yi doğru adıma koy.
   Yanlış hamle ceza değil ipucu getirir. */
(function () {
  'use strict';
  var Oyun = window.Oyun;

  var ARA = [
    { ad: 'Sitrat', c: 6 }, { ad: 'İzositrat', c: 6 }, { ad: 'α-Ketoglutarat', c: 5 }, { ad: 'Süksinil-CoA', c: 4 },
    { ad: 'Süksinat', c: 4 }, { ad: 'Fumarat', c: 4 }, { ad: 'Malat', c: 4 }, { ad: 'Okzaloasetat', c: 4 }
  ];
  /* ADIM[i]: ARA[i] -> ARA[(i+1) % 8] */
  var ADIM = [
    { enzim: 'Akonitaz', urun: [],
      araIpucu: 'Sitratın izomeri: OH grubu komşu karbona kayar, karbon sayısı değişmez (C6 → C6).',
      enzIpucu: 'Ara ürünü cis-akonitattır; enzim adını ondan alır. Fe-S kümesi taşır.' },
    { enzim: 'İzositrat dehidrogenaz', urun: ['NADH', 'CO₂'],
      araIpucu: 'İlk oksidatif dekarboksilasyon: C6 → C5, bir CO₂ ayrılır ve bir keto asit oluşur.',
      enzIpucu: 'Substratının adını taşır. Döngünün başlıca hız kontrol noktası: ADP açar, NADH ve ATP kapatır.' },
    { enzim: 'α-Ketoglutarat dehidrogenaz', urun: ['NADH', 'CO₂'],
      araIpucu: 'İkinci oksidatif dekarboksilasyon: C5 → C4. Ürün, CoA’ya bağlı yüksek enerjili bir tiyoesterdir.',
      enzIpucu: 'PDH’nin kardeşi olan çok enzimli kompleks: tiamin (B1), lipoat, FAD (B2), NAD⁺ (B3) ve CoA (B5) ister.' },
    { enzim: 'Süksinil-CoA sentetaz', urun: ['GTP'],
      araIpucu: 'Tiyoester bağı kırılır ve CoA ayrılır; geriye serbest C4 dikarboksilat kalır.',
      enzIpucu: 'Döngünün tek substrat düzeyinde fosforilasyonu. Ters yöndeki tepkimeye göre adlandırılmıştır (süksinat tiyokinaz).' },
    { enzim: 'Süksinat dehidrogenaz', urun: ['FADH₂'],
      araIpucu: 'Süksinat FAD ile yükseltgenir: iki karbon arasında trans çift bağ oluşur.',
      enzIpucu: 'Zara gömülü tek Krebs enzimi; aynı zamanda solunum zincirinin Kompleks II’sidir. Malonat yarışmalı inhibitörüdür.' },
    { enzim: 'Fumaraz', urun: [],
      araIpucu: 'Çift bağa su eklenir (hidrasyon): OH grubu taşıyan C4 bileşiği oluşur.',
      enzIpucu: 'Fumarata su ekleyen hidrataz; adını substratından alır.' },
    { enzim: 'Malat dehidrogenaz', urun: ['NADH'],
      araIpucu: 'OH grubu keto grubuna yükseltgenir; ürün, asetil-CoA ile birleşmeye hazır C4 keto asittir.',
      enzIpucu: 'Substratının adını taşır; döngüde NAD⁺’yı indirgeyen üçüncü dehidrogenaz.' },
    { enzim: 'Sitrat sentaz', urun: [],
      araIpucu: '',
      enzIpucu: 'Okzaloasetat (C4) + asetil-CoA (C2) → C6. Ürününün adını taşır; döngüye girişin geri dönüşsüz adımı.' }
  ];
  var ASAMA_AD = ['Ara ürünler', 'Enzimler', 'Ürünler'];
  var ASAMA_YONERGE = [
    'Aşağıdan bir ara ürün seç, sonra halkada ait olduğu boşluğa tıkla. Boşluklardaki karbon sayıları yol gösterir.',
    'Şimdi enzimler: bir enzim kartı seç, sonra katalizlediği adıma (listede ya da halkadaki numaraya) tıkla.',
    'Son aşama: bir turda çıkan 3 NADH, 1 FADH₂, 1 GTP ve 2 CO₂’yi oluştukları adımlara yerleştir.'
  ];

  function kur() {
    var kok = document.getElementById('krebs-kok');
    var d; // durum

    kok.innerHTML =
      '<div class="o-bas"><div><div class="o-ust">Oyun 3 · Bulmaca</div><h3 class="o-baslik">Krebs Bulmacası</h3>' +
      '<p class="o-alt">Döngüyü üç aşamada kur. Yanlış yerleştirme puan düşürmez, bir ipucu getirir; istediğin kadar deneyebilirsin.</p></div>' +
      '<div class="o-arac"><button class="o-btn" data-is="ipucu">💡 İpucu</button><button class="o-btn" data-is="yeniden">↺ Yeniden karıştır</button></div></div>' +
      '<div class="kr-asama"></div>' +
      '<div class="kr-govde"><div class="kr-halka-kap"><div class="kr-halka"></div></div>' +
      '<div class="kr-yan"><div class="o-panel kr-mesaj" aria-live="polite"></div>' +
      '<div class="o-panel"><div class="o-panel-bas kr-tepsi-bas">Kartlar</div><div class="kr-tepsi"></div></div>' +
      '<div class="o-panel kr-adim-panel"><div class="o-panel-bas">Adımlar</div><ol class="kr-adimlar"></ol></div></div></div>' +
      '<details class="o-not"><summary>Model notu</summary><ul>' +
      '<li>Sıra ve ürünler memeli mitokondrisindeki döngüye göredir. Süksinil-CoA sentetazın GDP ve ADP kullanan iki izoformu vardır; burada ders kitaplarındaki gibi GTP gösterilmiştir (GTP + ADP ⇄ GDP + ATP).</li>' +
      '<li>FADH₂ serbest bir molekül değildir: süksinat dehidrogenaza kovalent bağlı FAD indirgenir ve elektronlar doğrudan ubikinona aktarılır.</li>' +
      '<li>İzositrat dehidrogenazın mitokondride NAD⁺ (IDH3) ve NADP⁺ (IDH2) bağımlı izoformları bulunur; döngüde çalışan NAD⁺ bağımlı olandır.</li>' +
      '</ul></details>' +
      '<div class="o-perde"><div class="o-sonuc"></div></div>';

    var halka = kok.querySelector('.kr-halka'), tepsi = kok.querySelector('.kr-tepsi'), mesajEl = kok.querySelector('.kr-mesaj');
    var adimlarEl = kok.querySelector('.kr-adimlar'), asamaEl = kok.querySelector('.kr-asama'), perde = kok.querySelector('.o-perde');

    function yeni() {
      var kartlar = [], i;
      for (i = 1; i < 8; i++) kartlar.push({ k: 'a' + i, tur: 'ara', i: i, ad: ARA[i].ad, alt: 'C' + ARA[i].c });
      d = {
        asama: 0, hata: 0, ipucu: 0, secili: null, bitti: false,
        ara: [true, false, false, false, false, false, false, false],
        enz: [false, false, false, false, false, false, false, false],
        urun: [[], [], [], [], [], [], [], []],
        tepsi: Oyun.karistir(kartlar)
      };
      perde.classList.remove('acik');
      halka.classList.remove('tamam');
      mesaj('bilgi', ASAMA_YONERGE[0]);
      ciz();
    }

    function asamaKartlari(n) {
      var k = [], i;
      if (n === 1) for (i = 0; i < 8; i++) k.push({ k: 'e' + i, tur: 'enz', i: i, ad: ADIM[i].enzim });
      if (n === 2) {
        ['NADH', 'NADH', 'NADH', 'FADH₂', 'GTP', 'CO₂', 'CO₂'].forEach(function (u, j) { k.push({ k: 'u' + j, tur: 'urun', ad: u }); });
      }
      return Oyun.karistir(k);
    }

    function mesaj(tip, m) { mesajEl.className = 'o-panel kr-mesaj ' + tip; mesajEl.innerHTML = m; }

    function konum(aci, r) {
      var a = aci * Math.PI / 180;
      return 'left:' + (50 + r * Math.cos(a)).toFixed(2) + '%;top:' + (50 + r * Math.sin(a)).toFixed(2) + '%';
    }

    function ciz() {
      /* aşama şeridi */
      asamaEl.innerHTML = ASAMA_AD.map(function (ad, i) {
        return '<span class="' + (i === d.asama ? 'aktif' : (i < d.asama ? 'gecti' : '')) + '"><b>' + (i < d.asama ? '✓' : i + 1) + '</b>' + ad + '</span>';
      }).join('<i></i>') + '<em>Yanlış deneme: ' + d.hata + ' · İpucu: ' + d.ipucu + '</em>';

      /* halka */
      var h = '<div class="kr-cember"></div><div class="kr-orta"><span class="kr-don"></span><b>Krebs<br>döngüsü</b><small>' +
        (d.bitti ? '3 NADH · FADH₂ · GTP · 2 CO₂' : 'saat yönünde ilerler') + '</small></div>' +
        '<div class="kr-giris" style="' + konum(-90, 21) + '"><b>Asetil-CoA</b> <small>C2</small><span aria-hidden="true">↑</span></div>';
      for (var i = 0; i < 8; i++) {
        var dolu = d.ara[i];
        h += '<button class="kr-yuva' + (dolu ? ' dolu' : '') + (i === 0 ? ' sabit' : '') + '" data-yuva="' + i + '" style="' + konum(-90 + i * 45, 38) + '"' + (dolu ? ' tabindex="-1"' : '') + '>' +
          (dolu ? '<b>' + ARA[i].ad + '</b><small>C' + ARA[i].c + '</small>' : '<b>?</b><small>C' + ARA[i].c + '</small>') + '</button>';
        var urunler = d.urun[i].length ? '<em>' + d.urun[i].join(' · ') + '</em>' : '';
        h += '<button class="kr-rozet' + (d.enz[i] ? ' dolu' : '') + (d.asama > 0 ? ' hedef' : '') + '" data-adim="' + i + '" style="' + konum(-90 + (i + 0.5) * 45, 30.5) + '" aria-label="Adım ' + (i + 1) + '">' + (i + 1) + urunler + '</button>';
      }
      halka.innerHTML = h;

      /* tepsi */
      kok.querySelector('.kr-tepsi-bas').textContent = ['Ara ürün kartları', 'Enzim kartları', 'Ürün kartları'][d.asama] + ' (' + d.tepsi.length + ' kaldı)';
      tepsi.innerHTML = d.tepsi.map(function (k) {
        return '<button class="kr-kart t-' + k.tur + (d.secili === k.k ? ' secili' : '') + '" data-kart="' + k.k + '"><b>' + k.ad + '</b>' + (k.alt ? '<small>' + k.alt + '</small>' : '') + '</button>';
      }).join('') || '<span class="kr-bos">Bu aşamanın bütün kartları yerleşti.</span>';

      /* adım listesi */
      kok.querySelector('.kr-adim-panel').style.display = d.asama === 0 ? 'none' : '';
      adimlarEl.innerHTML = ADIM.map(function (a, i) {
        var sonraki = ARA[(i + 1) % 8].ad;
        return '<li><button class="kr-adim' + (d.enz[i] ? ' dolu' : '') + '" data-adim="' + i + '"><span class="no">' + (i + 1) + '</span>' +
          '<span class="tep">' + ARA[i].ad + (i === 7 ? ' + asetil-CoA' : '') + ' → ' + sonraki + '</span>' +
          '<span class="enz">' + (d.enz[i] ? a.enzim : 'enzim ?') + '</span>' +
          '<span class="ur">' + d.urun[i].map(function (u) { return '<i>' + u + '</i>'; }).join('') + '</span></button></li>';
      }).join('');
    }

    function kartBul(k) { for (var i = 0; i < d.tepsi.length; i++) if (d.tepsi[i].k === k) return d.tepsi[i]; return null; }
    function kartCikar(k) { d.tepsi = d.tepsi.filter(function (x) { return x.k !== k; }); d.secili = null; }
    function salla(el) { if (!el) return; el.classList.remove('salla'); void el.offsetWidth; el.classList.add('salla'); }

    function asamaBitti() {
      if (d.tepsi.length) return;
      if (d.asama < 2) {
        d.asama++;
        d.tepsi = asamaKartlari(d.asama);
        mesaj('iyi', '<b>' + ASAMA_AD[d.asama - 1] + ' tamam.</b> ' + ASAMA_YONERGE[d.asama]);
      } else {
        d.bitti = true;
        ciz();
        halka.classList.add('tamam');
        mesaj('iyi', '<b>Döngü tamamlandı.</b> Okzaloasetat yeniden oluştu ve bir sonraki asetil-CoA’yı bekliyor: döngü kendi katalizörünü yeniler.');
        setTimeout(bitir, Oyun.hareketAz() ? 200 : 1900);
      }
    }

    function yanlis(el, m) { d.hata++; salla(el); mesaj('uyari', m); ciz(); }

    function yuvaTikla(i, el) {
      if (d.asama !== 0 || d.ara[i]) return;
      var k = kartBul(d.secili);
      if (!k) { mesaj('bilgi', 'Önce aşağıdan bir ara ürün kartı seç, sonra boşluğa tıkla.'); return; }
      if (k.i === i) {
        d.ara[i] = true; kartCikar(k.k);
        mesaj('iyi', '<b>' + ARA[i].ad + '</b> yerinde. ' + ADIM[i - 1].araIpucu);
        asamaBitti(); ciz();
      } else {
        yanlis(el, '<b>' + k.ad + '</b> buraya ait değil. Bu boşluğun ipucu: ' + ADIM[i - 1].araIpucu);
      }
    }

    function urunNedeni(u, i) {
      var a = ARA[i], b = ARA[(i + 1) % 8];
      if (ADIM[i].urun.indexOf(u) >= 0) return 'Bu adımın ' + u + ' ürünü zaten yerinde; aynı ürün başka bir adımda da çıkıyor.';
      if (u === 'CO₂') return a.c === b.c && i !== 7 ? 'Bu adımda karbon sayısı değişmiyor (C' + a.c + ' → C' + b.c + '): CO₂ çıkamaz. Karbonun azaldığı adımları ara.' : 'Bu adımda karbon kaybı yok. CO₂, karbon sayısının azaldığı iki dekarboksilasyon adımında çıkar.';
      if (u === 'NADH') return 'NADH yalnızca NAD⁺ bağımlı dehidrogenaz adımlarında oluşur. Enzim adlarına bak: üç tane “dehidrogenaz” NAD⁺ kullanır, dördüncüsü FAD.';
      if (u === 'FADH₂') return 'FADH₂, karbon–karbon çift bağı oluşturan yükseltgenmede çıkar: bu tepkimenin indirgeme gücü NAD⁺’ya yetmez, FAD kullanılır.';
      return 'GTP, yüksek enerjili tiyoester bağının kırıldığı adımda oluşur (substrat düzeyinde fosforilasyon).';
    }

    function adimTikla(i, el) {
      if (d.asama === 0) return;
      var k = kartBul(d.secili);
      if (!k) { mesaj('bilgi', 'Önce bir kart seç, sonra yerleştireceğin adıma tıkla.'); return; }
      if (d.asama === 1) {
        if (d.enz[i]) { mesaj('bilgi', 'Bu adımın enzimi zaten yerinde: ' + ADIM[i].enzim + '.'); return; }
        if (k.i === i) {
          d.enz[i] = true; kartCikar(k.k);
          mesaj('iyi', '<b>' + ADIM[i].enzim + '</b>: ' + ADIM[i].enzIpucu);
          asamaBitti(); ciz();
        } else {
          yanlis(el, '<b>' + k.ad + '</b> bu adımın enzimi değil. ' + (i + 1) + '. adımın ipucu: ' + ADIM[i].enzIpucu);
        }
        return;
      }
      var gerek = ADIM[i].urun.filter(function (u) { return u === k.ad; }).length;
      var var_ = d.urun[i].filter(function (u) { return u === k.ad; }).length;
      if (gerek > var_) {
        d.urun[i].push(k.ad); kartCikar(k.k);
        mesaj('iyi', '<b>' + k.ad + '</b> doğru adımda: ' + ARA[i].ad + ' → ' + ARA[(i + 1) % 8].ad + ' (' + ADIM[i].enzim + ').');
        asamaBitti(); ciz();
      } else {
        yanlis(el, '<b>' + k.ad + '</b>, ' + (i + 1) + '. adımda oluşmaz. ' + urunNedeni(k.ad, i));
      }
    }

    function ipucuVer() {
      if (d.bitti) return;
      var k = kartBul(d.secili) || d.tepsi[0];
      if (!k) return;
      d.ipucu++; d.secili = k.k;
      var m, hedef;
      if (k.tur === 'ara') { m = ADIM[k.i - 1].araIpucu; hedef = '[data-yuva="' + k.i + '"]'; }
      else if (k.tur === 'enz') { m = ADIM[k.i].enzIpucu; hedef = '.kr-adim[data-adim="' + k.i + '"]'; }
      else {
        var i;
        for (i = 0; i < 8; i++) {
          if (ADIM[i].urun.filter(function (u) { return u === k.ad; }).length > d.urun[i].filter(function (u) { return u === k.ad; }).length) break;
        }
        m = { 'NADH': 'NADH, NAD⁺ bağımlı üç dehidrogenaz adımında oluşur.', 'FADH₂': 'FADH₂, süksinatın fumarata yükseltgendiği adımda oluşur.', 'GTP': 'GTP, süksinil-CoA’nın tiyoester bağı kırılırken oluşur.', 'CO₂': 'CO₂, karbon sayısının azaldığı adımlarda (C6 → C5 ve C5 → C4) çıkar.' }[k.ad];
        hedef = '.kr-adim[data-adim="' + i + '"]';
      }
      ciz();
      var el = kok.querySelector(hedef);
      if (el) el.classList.add('oneri');
      mesaj('ipucu', '💡 <b>' + k.ad + '</b>: ' + m + ' İşaretli yere tıkla.');
    }

    function bitir() {
      var toplam = d.hata + d.ipucu, y = toplam <= 3 ? 3 : (toplam <= 9 ? 2 : 1);
      Oyun.yildizVer('krebs', y);
      perde.querySelector('.o-sonuc').innerHTML =
        '<h4>Döngü dönüyor</h4><div class="yildizlar">' + Oyun.yildizMetni(y) + '</div>' +
        '<table><tr><td>Yanlış deneme</td><td>' + d.hata + '</td></tr><tr><td>Kullanılan ipucu</td><td>' + d.ipucu + '</td></tr>' +
        '<tr><td>3 NADH × 2,5 ATP</td><td>7,5 ATP</td></tr><tr><td>1 FADH₂ × 1,5 ATP</td><td>1,5 ATP</td></tr><tr><td>1 GTP</td><td>1 ATP</td></tr>' +
        '<tr><td><b>Asetil-CoA başına toplam</b></td><td>≈10 ATP · 2 CO₂</td></tr></table>' +
        '<ul class="ogrenilen">' +
        '<li>İki karbon girer (asetil-CoA), iki karbon CO₂ olarak çıkar; okzaloasetat harcanmaz, her turda yenilenir.</li>' +
        '<li>Döngü ATP’yi doğrudan değil, NADH ve FADH₂ üzerinden solunum zincirinde üretir; O₂ yoksa NAD⁺ yenilenemez ve döngü durur.</li>' +
        '<li>Vitamin bağlantısı: NAD⁺ ← niasin (B3), FAD ← riboflavin (B2), CoA ← pantotenat (B5), α-ketoglutarat dehidrogenaz ayrıca tiamin (B1) ve lipoat ister.</li>' +
        '<li>Ara ürünler aynı zamanda yapı taşıdır: sitrat → yağ asitleri, α-ketoglutarat → glutamat, süksinil-CoA → hem, okzaloasetat → aspartat ve glukoz.</li></ul>' +
        '<div class="dugmeler"><button class="o-btn ana" data-is="yeniden">Yeniden karıştır</button><button class="o-btn" data-page="oyunlar">Oyun merkezi</button></div>' +
        '<p style="margin-top:10px;color:var(--soluk);font-size:13px">3 yıldız: yanlış deneme + ipucu en çok 3 · 2 yıldız: en çok 9.</p>';
      perde.classList.add('acik');
    }

    kok.addEventListener('click', function (olay) {
      var t = olay.target, el;
      if ((el = t.closest('[data-kart]'))) {
        var k = el.getAttribute('data-kart');
        d.secili = d.secili === k ? null : k;
        ciz(); return;
      }
      if ((el = t.closest('[data-yuva]'))) { yuvaTikla(+el.getAttribute('data-yuva'), el); return; }
      if ((el = t.closest('[data-adim]'))) { adimTikla(+el.getAttribute('data-adim'), el); return; }
      if ((el = t.closest('[data-is]'))) {
        if (el.getAttribute('data-is') === 'yeniden') yeni(); else ipucuVer();
      }
    });

    yeni();
  }

  window.Oyun.kaydet('oyun-krebs', kur);
})();
