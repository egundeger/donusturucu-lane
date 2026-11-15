/* Beslenme hesaplayıcıları. Her hesap, kullandığı denklemi ve kaynağını ekranda gösterir.
   Denklemler:
   - DEH: Mifflin-St Jeor (1990); Harris-Benedict, Roza ve Shizgal düzeltmesi (1984); Schofield (1985)
   - Dolaylı kalorimetri: kısaltılmış Weir (1949); substrat oksidasyonu Frayn (1983)
   - HOMA-IR: Matthews (1985); LDL: Friedewald (1972) */
(function () {
  'use strict';

  /* ============================ SAF HESAPLAR ============================ */
  var H = {
    bki: function (kg, cm) { var m = cm / 100; return kg / (m * m); },
    bkiSinif: function (b) {
      if (b < 18.5) return 'Zayıf';
      if (b < 25) return 'Normal';
      if (b < 30) return 'Fazla kilolu';
      if (b < 35) return 'Obezite, 1. derece';
      if (b < 40) return 'Obezite, 2. derece';
      return 'Obezite, 3. derece';
    },
    mifflin: function (erkek, kg, cm, yas) { return 10 * kg + 6.25 * cm - 5 * yas + (erkek ? 5 : -161); },
    harris: function (erkek, kg, cm, yas) {
      return erkek ? 88.362 + 13.397 * kg + 4.799 * cm - 5.677 * yas : 447.593 + 9.247 * kg + 3.098 * cm - 4.330 * yas;
    },
    schofield: function (erkek, kg, yas) {
      if (erkek) return yas < 30 ? 15.057 * kg + 692.2 : (yas < 60 ? 11.472 * kg + 873.1 : 11.711 * kg + 587.7);
      return yas < 30 ? 14.818 * kg + 486.6 : (yas < 60 ? 8.126 * kg + 845.6 : 9.082 * kg + 658.5);
    },
    /* Günlük ATP devri: enerji -> O2 (Weir) -> mol O2 -> mol ATP (P/O) -> kg */
    atp: function (kcal, rq, po) {
      var litre = kcal / (3.941 + 1.106 * rq), molO2 = litre / 22.4, molAtp = molO2 * 2 * po;
      return { litre: litre, molO2: molO2, molAtp: molAtp, kg: molAtp * 507.18 / 1000 };
    },
    makro: function (kh, pro, yag, lif, alkol) {
      var e = { kh: 4 * kh, pro: 4 * pro, yag: 9 * yag, lif: 2 * lif, alkol: 7 * alkol };
      e.toplam = e.kh + e.pro + e.yag + e.lif + e.alkol;
      return e;
    },
    /* VO2 ve VCO2 mL/dk */
    kalorimetri: function (vo2, vco2) {
      var o = vo2 / 1000, c = vco2 / 1000;
      return { rq: vco2 / vo2, kcal: (3.941 * o + 1.106 * c) * 1440, kh: (4.55 * c - 3.21 * o) * 1440, yag: (1.67 * o - 1.67 * c) * 1440 };
    },
    gy: function (gi, kh) { return gi * kh / 100; },
    homa: function (glukozMgdl, insulin) { return glukozMgdl * insulin / 405; },
    friedewald: function (tk, hdl, tg) { return tk - hdl - tg / 5; },
    azot: function (protein, uua) { return protein / 6.25 - (uua + 4); }
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = H; return; }

  /* ============================== ARAYÜZ ============================== */
  function pm(id, ad) { return '<a class="kay" href="https://pubmed.ncbi.nlm.nih.gov/' + id + '/" target="_blank" rel="noopener">' + ad + '</a>'; }
  function s(x, basamak) {
    if (!isFinite(x)) return '—';
    var b = basamak == null ? 0 : basamak;
    return x.toLocaleString('tr-TR', { minimumFractionDigits: b, maximumFractionDigits: b });
  }
  function girdi(id, etiket, deger, birim, min, max, adim) {
    return '<label class="hs-alan"><span>' + etiket + '</span><span class="hs-kutu"><input type="number" inputmode="decimal" id="hs-' + id + '" value="' + deger + '" min="' + min + '" max="' + max + '" step="' + (adim || 1) + '">' + (birim ? '<em>' + birim + '</em>' : '') + '</span></label>';
  }
  function kart(id, baslik, alt, girdiler, formul) {
    return '<section class="hs-kart" id="hs-kart-' + id + '"><header><h3>' + baslik + '</h3><p>' + alt + '</p></header>' +
      '<div class="hs-govde"><div class="hs-girdiler">' + girdiler + '</div><div class="hs-sonuc" id="hs-s-' + id + '" aria-live="polite"></div></div>' +
      '<details class="hs-formul"><summary>Formül ve kaynak</summary>' + formul + '</details></section>';
  }

  function kur() {
    var kok = document.getElementById('hesap-kok');

    kok.innerHTML =
      kart('profil', '1 · Enerji gereksinimi ve vücut kütle indeksi', 'Dinlenme enerji harcamasını üç denklemle kestirir, fiziksel aktivite düzeyiyle çarpar.',
        '<label class="hs-alan"><span>Cinsiyet</span><span class="hs-kutu"><select id="hs-cins"><option value="k">Kadın</option><option value="e">Erkek</option></select></span></label>' +
        girdi('yas', 'Yaş', 21, 'yıl', 18, 100) + girdi('boy', 'Boy', 165, 'cm', 130, 220) + girdi('kilo', 'Vücut ağırlığı', 60, 'kg', 30, 250, 0.5) +
        '<label class="hs-alan genis"><span>Fiziksel aktivite düzeyi (PAL)</span><span class="hs-kutu"><select id="hs-pal">' +
        '<option value="1.4">1,40 · hareketsiz (masa başı, az yürüyüş)</option><option value="1.55" selected>1,55 · hafif aktif</option>' +
        '<option value="1.75">1,75 · aktif (düzenli egzersiz ya da ayakta iş)</option><option value="2.0">2,00 · çok aktif (ağır iş, yoğun antrenman)</option></select></span></label>',
        '<ul><li><b>BKİ</b> = ağırlık (kg) / boy² (m²). DSÖ sınıflaması: &lt;18,5 zayıf · 18,5–24,9 normal · 25–29,9 fazla kilolu · ≥30 obezite (' + pm('11234459', 'DSÖ, 2000') + '). BKİ yağ ve kas kütlesini ayırt etmez; sporcularda ve yaşlılarda yanıltabilir.</li>' +
        '<li><b>Mifflin-St Jeor</b>: 10 × kg + 6,25 × cm − 5 × yaş + 5 (erkek) ya da − 161 (kadın) (' + pm('2305711', 'Mifflin ve ark., 1990') + ').</li>' +
        '<li><b>Harris-Benedict</b> (düzeltilmiş): erkek 88,362 + 13,397 × kg + 4,799 × cm − 5,677 × yaş; kadın 447,593 + 9,247 × kg + 3,098 × cm − 4,330 × yaş (' + pm('6741850', 'Roza ve Shizgal, 1984') + ').</li>' +
        '<li><b>Schofield</b> (yalnız ağırlık; 18–30, 30–60 ve 60 üstü yaş grupları için ayrı katsayılar) (' + pm('4044297', 'Schofield, 1985') + '); FAO/WHO/UNU enerji raporunda kullanılan denklemler.</li>' +
        '<li><b>Toplam enerji</b> = dinlenme enerji harcaması × PAL. PAL aralıkları FAO/WHO/UNU (2004) sınıflamasına göredir: 1,40–1,69 hareketsiz ya da hafif, 1,70–1,99 aktif, 2,00–2,40 çok aktif.</li>' +
        '<li>Altın standart dolaylı kalorimetridir; denklemler ölçümün yerini tutmaz.</li></ul>') +

      kart('protein', '2 · Protein gereksinimi', 'Yukarıdaki vücut ağırlığına göre günlük protein aralıkları.',
        '<p class="hs-bilgi">Ağırlık ve yaş birinci karttan alınır.</p>',
        '<ul><li>Sağlıklı yetişkin: 0,83 g/kg/gün (<a class="kay" href="https://doi.org/10.2903/j.efsa.2012.2557" target="_blank" rel="noopener">EFSA, 2012</a>).</li>' +
        '<li>65 yaş ve üzeri: 1,0–1,2 g/kg/gün (' + pm('23867520', 'Bauer ve ark., 2013') + ').</li>' +
        '<li>Sporcu: 1,2–2,0 g/kg/gün (' + pm('26920240', 'Thomas ve ark., 2016') + ').</li>' +
        '<li>Kronik böbrek hastalığı, karaciğer yetmezliği, gebelik ve emziklilikte farklı hedefler geçerlidir.</li></ul>') +

      kart('atp', '3 · Günde kaç kilogram ATP?', 'Toplam enerji harcamasından oksijen tüketimine, oradan ATP devrine.',
        '<p class="hs-bilgi">Toplam enerji birinci karttaki Mifflin-St Jeor sonucundan alınır.</p>' + girdi('po', 'P/O oranı', 2.4, 'ATP/O', 1.5, 2.7, 0.1),
        '<ol><li>O₂ tüketimi (L/gün) = enerji (kcal) / (3,941 + 1,106 × RQ); RQ = 0,85 kabul edilir (' + pm('15394301', 'Weir, 1949') + ').</li>' +
        '<li>mol O₂ = litre / 22,4.</li><li>mol ATP = mol O₂ × 2 (oksijen atomu) × P/O. Glukoz için P/O ≈ 2,5, palmitat için ≈ 2,3 (' + pm('15620362', 'Hinkle, 2005') + ').</li>' +
        '<li>Kütle = mol ATP × 507,18 g/mol.</li></ol>' +
        '<p>Vücuttaki ATP stoku bu miktarın çok küçük bir kesridir; her ATP molekülü gün içinde yüzlerce kez ADP\'ye yıkılıp yeniden sentezlenir (' + pm('14641005', 'Rich, 2003') + ').</p>') +

      kart('makro', '4 · Makro besinden enerji', 'Atwater katsayılarıyla enerji ve enerji yüzdeleri.',
        girdi('kh', 'Sindirilebilir karbonhidrat', 250, 'g', 0, 1000) + girdi('pro', 'Protein', 75, 'g', 0, 500) + girdi('yag', 'Yağ', 70, 'g', 0, 500) + girdi('lif', 'Lif', 25, 'g', 0, 150) + girdi('alkol', 'Alkol', 0, 'g', 0, 300),
        '<ul><li>Enerji (kcal) = 4 × karbonhidrat + 4 × protein + 9 × yağ + 2 × lif + 7 × alkol (AB 1169/2011 sayılı Tüzük, Ek XIV).</li>' +
        '<li>1 kcal = 4,184 kJ.</li><li>EFSA referans alım aralıkları: karbonhidrat enerjinin %45–60\'ı, yağ %20–35\'i. Protein için aralık g/kg üzerinden verilir.</li>' +
        '<li>Katsayılar ortalamadır; gerçek metabolize edilebilir enerji besine göre değişir (' + pm('22760558', 'Novotny ve ark., 2012') + ').</li></ul>') +

      kart('kal', '5 · Dolaylı kalorimetri: RQ, enerji ve yakıt', 'Solunum gazlarından enerji harcaması ve yakılan karbonhidrat ile yağ.',
        girdi('vo2', 'O₂ tüketimi (V̇O₂)', 250, 'mL/dk', 100, 6000) + girdi('vco2', 'CO₂ üretimi (V̇CO₂)', 205, 'mL/dk', 60, 6000),
        '<ul><li>RQ = V̇CO₂ / V̇O₂.</li><li>Enerji (kcal/dk) = 3,941 × V̇O₂ + 1,106 × V̇CO₂ (L/dk) (' + pm('15394301', 'Weir, 1949') + ').</li>' +
        '<li>Karbonhidrat oksidasyonu (g/dk) = 4,55 × V̇CO₂ − 3,21 × V̇O₂; yağ oksidasyonu (g/dk) = 1,67 × V̇O₂ − 1,67 × V̇CO₂ (' + pm('6618956', 'Frayn, 1983') + ').</li>' +
        '<li>İdrar azotu bilinmediği için protein oksidasyonu ihmal edilmiştir; bu, sonuçta küçük bir hata yaratır. RQ &gt; 1 iken yağ oksidasyonu negatif çıkar: net yağ sentezi.</li></ul>') +

      kart('gy', '6 · Glisemik yük', 'Glisemik indeks ile porsiyondaki karbonhidrat miktarını birleştirir.',
        girdi('gi', 'Glisemik indeks', 70, '', 1, 110) + girdi('gykh', 'Porsiyondaki sindirilebilir karbonhidrat', 30, 'g', 0, 200),
        '<ul><li>Glisemik yük = glisemik indeks × karbonhidrat (g) / 100.</li><li>Glisemik indeks: ≤55 düşük, 56–69 orta, ≥70 yüksek. Glisemik yük (porsiyon): ≤10 düşük, 11–19 orta, ≥20 yüksek.</li>' +
        '<li>Değerler için uluslararası tablolar: ' + pm('34258626', 'Atkinson ve ark., 2021') + '; arama için <a class="kay" href="https://glycemicindex.com" target="_blank" rel="noopener">Sydney Üniversitesi veri tabanı</a>.</li>' +
        '<li>Düşük glisemik indeks tek başına “sağlıklı” demek değildir: yağ ve fruktoz indeksi düşürür.</li></ul>') +

      kart('homa', '7 · HOMA-IR', 'Açlık glukozu ve insülinden insülin direnci kestirimi.',
        girdi('glu', 'Açlık glukozu', 90, 'mg/dL', 40, 400) + girdi('ins', 'Açlık insülini', 8, 'µU/mL', 0.5, 300, 0.1),
        '<ul><li>HOMA-IR = glukoz (mg/dL) × insülin (µU/mL) / 405 = glukoz (mmol/L) × insülin / 22,5 (' + pm('3899825', 'Matthews ve ark., 1985') + ').</li>' +
        '<li>Epidemiyoloji ve araştırma için geliştirilmiştir. Eşik değeri topluma ve insülin ölçüm yöntemine göre değişir; tek başına tanı koydurmaz.</li></ul>') +

      kart('ldl', '8 · LDL kolesterol (Friedewald)', 'Lipid profilinden hesaplanan LDL ve HDL dışı kolesterol.',
        girdi('tk', 'Total kolesterol', 200, 'mg/dL', 50, 500) + girdi('hdl', 'HDL kolesterol', 50, 'mg/dL', 10, 150) + girdi('tg', 'Trigliserit', 150, 'mg/dL', 20, 2000),
        '<ul><li>LDL = total kolesterol − HDL − trigliserit / 5 (mg/dL) (' + pm('4337382', 'Friedewald ve ark., 1972') + ').</li>' +
        '<li>Trigliserit 400 mg/dL ve üzerindeyse ya da açlık örneği değilse denklem geçersizdir; doğrudan ölçüm gerekir.</li><li>HDL dışı kolesterol = total kolesterol − HDL.</li></ul>') +

      kart('azot', '9 · Azot dengesi', 'Protein alımı ile idrar üre azotundan yaklaşık denge.',
        girdi('npro', 'Protein alımı', 80, 'g/gün', 0, 400) + girdi('uua', '24 saatlik idrar üre azotu', 10, 'g/gün', 0, 60, 0.1),
        '<ul><li>Azot dengesi (g/gün) = protein alımı / 6,25 − (idrar üre azotu + 4).</li><li>6,25: proteinin ortalama %16 azot içermesinden. “+4 g”: dışkı, deri ve üre dışı idrar azotu için klinik beslenmede kullanılan yaklaşık pay (' + pm('3932497', 'Mackenzie ve ark., 1985') + ').</li>' +
        '<li>Böbrek yetmezliği, yanık, ishal ya da fistül varlığında bu yaklaşım kaybı olduğundan az gösterir.</li></ul>');

    var el = function (id) { return document.getElementById('hs-' + id); };
    var oku = function (id) { var x = parseFloat(String(el(id).value).replace(',', '.')); var e = el(id); if (!isFinite(x) || x < +e.min || x > +e.max) return NaN; return x; };
    var yaz = function (id, html) { document.getElementById('hs-s-' + id).innerHTML = html; };
    var gecersiz = '<p class="hs-uyari">Girdileri kontrol et: değerlerden biri boş ya da beklenen aralığın dışında.</p>';
    function buyuk(deger, birim, etiket) { return '<div class="hs-buyuk"><b>' + deger + '</b><span>' + birim + '</span><small>' + etiket + '</small></div>'; }

    function hesapla() {
      var erkek = el('cins').value === 'e', yas = oku('yas'), boy = oku('boy'), kilo = oku('kilo'), pal = parseFloat(el('pal').value);
      var tee = NaN;

      /* 1: profil */
      if ([yas, boy, kilo].some(isNaN)) { yaz('profil', gecersiz); }
      else {
        var b = H.bki(kilo, boy), m = H.mifflin(erkek, kilo, boy, yas), hb = H.harris(erkek, kilo, boy, yas), sc = H.schofield(erkek, kilo, yas);
        tee = m * pal;
        var konum = Math.max(0, Math.min(100, (b - 15) / (40 - 15) * 100));
        yaz('profil',
          '<div class="hs-iki">' + buyuk(s(b, 1), 'kg/m²', 'BKİ · ' + H.bkiSinif(b)) + buyuk(s(tee), 'kcal/gün', 'Toplam enerji (Mifflin × PAL)') + '</div>' +
          '<div class="hs-bki"><i style="left:' + konum + '%"></i></div><div class="hs-bki-olcek"><span>18,5</span><span>25</span><span>30</span><span>35</span></div>' +
          '<table class="hs-tablo"><thead><tr><th>Denklem</th><th>Dinlenme</th><th>× PAL ' + s(pal, 2) + '</th></tr></thead><tbody>' +
          '<tr><td>Mifflin-St Jeor</td><td>' + s(m) + '</td><td>' + s(m * pal) + '</td></tr>' +
          '<tr><td>Harris-Benedict</td><td>' + s(hb) + '</td><td>' + s(hb * pal) + '</td></tr>' +
          '<tr><td>Schofield</td><td>' + s(sc) + '</td><td>' + s(sc * pal) + '</td></tr></tbody></table>' +
          '<p class="hs-bilgi">Üç denklem arasındaki fark (' + s(Math.max(m, hb, sc) - Math.min(m, hb, sc)) + ' kcal), kestirimin belirsizliği hakkında fikir verir.</p>');
      }

      /* 2: protein */
      if (isNaN(kilo) || isNaN(yas)) yaz('protein', gecersiz);
      else {
        var yasli = yas >= 65;
        yaz('protein', '<table class="hs-tablo"><thead><tr><th>Grup</th><th>g/kg/gün</th><th>' + s(kilo, 1) + ' kg için</th></tr></thead><tbody>' +
          '<tr class="' + (yasli ? '' : 'vurgu') + '"><td>Sağlıklı yetişkin</td><td>0,83</td><td>' + s(0.83 * kilo) + ' g</td></tr>' +
          '<tr class="' + (yasli ? 'vurgu' : '') + '"><td>65 yaş ve üzeri</td><td>1,0–1,2</td><td>' + s(1.0 * kilo) + '–' + s(1.2 * kilo) + ' g</td></tr>' +
          '<tr><td>Sporcu</td><td>1,2–2,0</td><td>' + s(1.2 * kilo) + '–' + s(2.0 * kilo) + ' g</td></tr></tbody></table>' +
          '<p class="hs-bilgi">Vurgulanan satır girilen yaşa karşılık gelir.</p>');
      }

      /* 3: ATP */
      var po = oku('po');
      if (isNaN(tee) || isNaN(po)) yaz('atp', gecersiz);
      else {
        var a = H.atp(tee, 0.85, po);
        yaz('atp', '<div class="hs-iki">' + buyuk(s(a.kg, 1), 'kg ATP/gün', isNaN(kilo) ? '' : 'vücut ağırlığının %' + s(100 * a.kg / kilo) + '\'i') + buyuk(s(a.molAtp), 'mol ATP/gün', s(a.litre) + ' L O₂ · ' + s(a.molO2, 1) + ' mol O₂') + '</div>' +
          '<p class="hs-bilgi">' + s(tee) + ' kcal için. İnsan her gün kabaca kendi ağırlığı kadar ATP üretir ve harcar; bunu mümkün kılan, mitokondri zarındaki proton gradyanıdır.</p>');
      }

      /* 4: makro */
      var kh = oku('kh'), pro = oku('pro'), yag = oku('yag'), lif = oku('lif'), alkol = oku('alkol');
      if ([kh, pro, yag, lif, alkol].some(isNaN)) yaz('makro', gecersiz);
      else {
        var e = H.makro(kh, pro, yag, lif, alkol), t = e.toplam || 1;
        var pay = function (x) { return 100 * x / t; };
        var durum = function (p, alt, ust) { return p < alt ? '<em class="dus">aralığın altında</em>' : (p > ust ? '<em class="yuk">aralığın üstünde</em>' : '<em class="iyi">aralıkta</em>'); };
        yaz('makro', '<div class="hs-iki">' + buyuk(s(e.toplam), 'kcal', s(e.toplam * 4.184) + ' kJ') + buyuk(isNaN(kilo) ? '—' : s(pro / kilo, 2), 'g/kg protein', 'birinci karttaki ağırlığa göre') + '</div>' +
          '<div class="hs-yigin"><i style="width:' + pay(e.kh) + '%;background:#3b82f6"></i><i style="width:' + pay(e.pro) + '%;background:#ef4444"></i><i style="width:' + pay(e.yag) + '%;background:#f59e0b"></i><i style="width:' + pay(e.lif) + '%;background:#22c55e"></i><i style="width:' + pay(e.alkol) + '%;background:#a855f7"></i></div>' +
          '<table class="hs-tablo"><thead><tr><th>Bileşen</th><th>kcal</th><th>Enerji %</th><th>EFSA aralığı</th></tr></thead><tbody>' +
          '<tr><td><i class="nokta" style="background:#3b82f6"></i>Karbonhidrat</td><td>' + s(e.kh) + '</td><td>' + s(pay(e.kh), 1) + '</td><td>45–60 · ' + durum(pay(e.kh), 45, 60) + '</td></tr>' +
          '<tr><td><i class="nokta" style="background:#ef4444"></i>Protein</td><td>' + s(e.pro) + '</td><td>' + s(pay(e.pro), 1) + '</td><td>g/kg ile değerlendirilir</td></tr>' +
          '<tr><td><i class="nokta" style="background:#f59e0b"></i>Yağ</td><td>' + s(e.yag) + '</td><td>' + s(pay(e.yag), 1) + '</td><td>20–35 · ' + durum(pay(e.yag), 20, 35) + '</td></tr>' +
          '<tr><td><i class="nokta" style="background:#22c55e"></i>Lif</td><td>' + s(e.lif) + '</td><td>' + s(pay(e.lif), 1) + '</td><td>en az 25 g/gün · ' + (lif >= 25 ? '<em class="iyi">yeterli</em>' : '<em class="dus">düşük</em>') + '</td></tr>' +
          '<tr><td><i class="nokta" style="background:#a855f7"></i>Alkol</td><td>' + s(e.alkol) + '</td><td>' + s(pay(e.alkol), 1) + '</td><td>—</td></tr></tbody></table>');
      }

      /* 5: kalorimetri */
      var vo2 = oku('vo2'), vco2 = oku('vco2');
      if (isNaN(vo2) || isNaN(vco2)) yaz('kal', gecersiz);
      else {
        var k = H.kalorimetri(vo2, vco2), yorum;
        if (k.rq < 0.7) yorum = 'RQ 0,70\'in altında: belirgin ketogenez ya da ölçüm hatası (kaçak, kararsız durum) düşünülür.';
        else if (k.rq < 0.76) yorum = 'Yakıt ağırlıklı olarak yağ: açlık ya da çok düşük karbonhidratlı beslenme ile uyumlu.';
        else if (k.rq <= 0.9) yorum = 'Karışık yakıt kullanımı: dinlenme halindeki dengeli beslenen bir yetişkin için beklenen aralık.';
        else if (k.rq <= 1.0) yorum = 'Yakıt ağırlıklı olarak karbonhidrat: öğün sonrası ya da yüksek şiddetli egzersiz ile uyumlu.';
        else yorum = 'RQ 1,0\'ın üzerinde: net yağ sentezi (aşırı karbonhidrat yüklemesi) ya da hiperventilasyon düşünülür.';
        yaz('kal', '<div class="hs-iki">' + buyuk(s(k.rq, 2), 'RQ', 'solunum katsayısı') + buyuk(s(k.kcal), 'kcal/gün', 'enerji harcaması') + '</div>' +
          '<div class="hs-rq"><i style="left:' + Math.max(0, Math.min(100, (k.rq - 0.65) / (1.05 - 0.65) * 100)) + '%"></i></div><div class="hs-rq-olcek"><span>0,70 yağ</span><span>0,85 karışık</span><span>1,00 karbonhidrat</span></div>' +
          '<table class="hs-tablo"><thead><tr><th>Yakıt</th><th>g/gün</th><th>kcal/gün</th></tr></thead><tbody>' +
          '<tr><td>Karbonhidrat</td><td>' + s(Math.max(0, k.kh)) + '</td><td>' + s(Math.max(0, k.kh) * 4) + '</td></tr>' +
          '<tr><td>Yağ</td><td>' + (k.yag < 0 ? 'net sentez' : s(k.yag)) + '</td><td>' + (k.yag < 0 ? '—' : s(k.yag * 9)) + '</td></tr></tbody></table>' +
          '<p class="hs-bilgi">' + yorum + '</p>');
      }

      /* 6: glisemik yük */
      var gi = oku('gi'), gykh = oku('gykh');
      if (isNaN(gi) || isNaN(gykh)) yaz('gy', gecersiz);
      else {
        var g = H.gy(gi, gykh);
        yaz('gy', '<div class="hs-iki">' + buyuk(s(g, 1), 'glisemik yük', g <= 10 ? 'düşük' : (g < 20 ? 'orta' : 'yüksek')) + buyuk(s(gi), 'glisemik indeks', gi <= 55 ? 'düşük' : (gi < 70 ? 'orta' : 'yüksek')) + '</div>' +
          '<p class="hs-bilgi">Örnek: karpuzun glisemik indeksi yüksektir ama porsiyondaki karbonhidratı az olduğu için glisemik yükü düşük kalır.</p>');
      }

      /* 7: HOMA */
      var glu = oku('glu'), ins = oku('ins');
      if (isNaN(glu) || isNaN(ins)) yaz('homa', gecersiz);
      else yaz('homa', '<div class="hs-iki">' + buyuk(s(H.homa(glu, ins), 2), 'HOMA-IR', 'glukoz ' + s(glu / 18.016, 1) + ' mmol/L') + '</div>' +
        '<p class="hs-bilgi">Değer yükseldikçe insülin direnci olasılığı artar. Yorum, laboratuvarın ve çalışılan toplumun referansına göre yapılır.</p>');

      /* 8: LDL */
      var tk = oku('tk'), hdl = oku('hdl'), tg = oku('tg');
      if ([tk, hdl, tg].some(isNaN)) yaz('ldl', gecersiz);
      else if (tg >= 400) yaz('ldl', '<p class="hs-uyari">Trigliserit 400 mg/dL ve üzerinde: Friedewald denklemi geçersiz. LDL doğrudan ölçülmelidir.</p><div class="hs-iki">' + buyuk(s(tk - hdl), 'mg/dL', 'HDL dışı kolesterol') + '</div>');
      else yaz('ldl', '<div class="hs-iki">' + buyuk(s(H.friedewald(tk, hdl, tg)), 'mg/dL', 'LDL kolesterol (hesaplanan)') + buyuk(s(tk - hdl), 'mg/dL', 'HDL dışı kolesterol') + '</div>');

      /* 9: azot */
      var npro = oku('npro'), uua = oku('uua');
      if (isNaN(npro) || isNaN(uua)) yaz('azot', gecersiz);
      else {
        var n = H.azot(npro, uua);
        yaz('azot', '<div class="hs-iki">' + buyuk((n > 0 ? '+' : '') + s(n, 1), 'g N/gün', n > 1 ? 'pozitif: anabolik' : (n < -1 ? 'negatif: katabolik' : 'dengeye yakın')) + buyuk(s(npro / 6.25, 1), 'g N/gün', 'alınan azot') + '</div>' +
          '<p class="hs-bilgi">Negatif denge, yıkımın sentezi aştığını gösterir: yetersiz alım, hastalık ya da travma. Pozitif denge büyüme, gebelik ve iyileşme döneminde beklenir.</p>');
      }
    }

    kok.addEventListener('input', hesapla);
    kok.addEventListener('change', hesapla);
    hesapla();
  }

  window.Oyun.kaydet('hesap', kur);
})();
