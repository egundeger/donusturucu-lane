/* OYUN 2 — Solunum Zinciri 3B + Zehir Dedektifi
   Model: kemiozmotik eşleşmenin sadeleştirilmiş kinetiği.
   - H+/2e-: NADH yolu 10 (KI 4, KIII 4, KIV 2), süksinat yolu 6, askorbat/TMPD yolu 4 yük eşdeğeri
   - ATP başına 4 H+ (sentaz + P_i/ADP taşınması)  =>  teorik P/O: 2,5 ve 1,5
   - Proton kaçağı ve geri basınç (solunum kontrolü) Δp'ye bağlıdır. */
(function () {
  'use strict';

  /* ============================== MODEL ============================== */
  var P = { VN: 10, VS: 8, VA: 8, VIII: 14, VIV: 16, kSyn: 1.13, kOhm: 0.02, kNon: 0.012, kUnc: 3, C: 0.15, hATP: 4 };

  function geriBasinc(dp) { return 1 / (1 + Math.exp((dp - 168) / 8)); }

  function yeniGirdi() {
    return { sN: true, sS: false, sA: false, adp: true, unc: false, inh: { I: false, II: false, III: false, IV: false, V: false } };
  }

  /* Verilen girdi ve Δp için anlık akılar */
  function akilar(g, dp) {
    var b = geriBasinc(dp);
    var jn = (g.sN && !g.inh.I) ? P.VN * b : 0;
    var js = (g.sS && !g.inh.II) ? P.VS * b : 0;
    var ja = g.sA ? P.VA * b : 0;
    if (g.inh.III) { jn = 0; js = 0; }
    var t3 = jn + js, k3 = P.VIII * b;
    if (t3 > k3) { jn *= k3 / t3; js *= k3 / t3; }
    if (g.inh.IV) { jn = 0; js = 0; ja = 0; }
    var t4 = jn + js + ja, k4 = P.VIV * b;
    if (t4 > k4) { var k = k4 / t4; jn *= k; js *= k; ja *= k; }

    var pompa = 10 * jn + 6 * js + 4 * ja;
    var hSyn = (g.adp && !g.inh.V) ? P.kSyn * Math.max(0, dp - 100) : 0;
    var hKac = P.kOhm * dp + P.kNon * dp * Math.exp((dp - 150) / 25);
    var hUnc = g.unc ? P.kUnc * dp : 0;
    var j = jn + js + ja;
    var atp = hSyn / P.hATP;

    var nadh = g.sN ? 25 + 75 * (1 - jn / P.VN) : 5;
    var subst = g.sN || g.sS || g.sA;
    var ros = 2 + (subst ? 60 / (1 + Math.exp(-(dp - 170) / 8)) : 0);
    if (g.inh.III && (g.sN || g.sS)) ros += 60;
    if (g.inh.I && g.sN) ros += 24;
    if (g.inh.IV && subst) ros += 28;
    var isi = jn * 2280 + js * 1580 + ja * 1500 - hSyn * dp;

    return { jn: jn, js: js, ja: ja, j: j, pompa: pompa, hSyn: hSyn, hKac: hKac, hUnc: hUnc, atp: atp, nadh: nadh, ros: Math.min(100, ros), isi: Math.max(0, isi), net: pompa - hSyn - hKac - hUnc };
  }

  function adimla(g, dp, dt) {
    var n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
    for (var i = 0; i < n; i++) { dp += akilar(g, dp).net / P.C * h; if (dp < 0) dp = 0; }
    return dp;
  }
  function kararli(g, dp0) {
    var dp = dp0 == null ? 150 : dp0;
    for (var i = 0; i < 400; i++) dp = adimla(g, dp, 0.1);
    return dp;
  }

  var REF = (function () {
    var g = yeniGirdi(), dp = kararli(g), a = akilar(g, dp);
    var u = yeniGirdi(); u.unc = true; var au = akilar(u, kararli(u));
    return { dp: dp, j: a.j, atp: a.atp, nadh: a.nadh, ros: a.ros, isiMax: au.isi, isi: a.isi };
  })();

  /* Ölçer değerleri (kontrol = Durum 3, NADH kaynağı) */
  function olcum(a, dp) {
    return {
      o2: 100 * a.j / REF.j, dp: dp, atp: 100 * a.atp / REF.atp,
      po: a.j > 0.15 ? a.atp / a.j : null, nadh: a.nadh, ros: a.ros, isi: 100 * a.isi / REF.isiMax
    };
  }

  var ZEHIR = {
    rotenon: {
      ad: 'Rotenon', hedef: 'Kompleks I', kid: 'I', uygula: function (g) { g.inh.I = true; },
      degil: 'Rotenon yalnızca Kompleks I’i keser. O zaman süksinat (elektronlarını Kompleks II’den verir) eklendiğinde O₂ tüketimi geri gelmeliydi.',
      acikla: 'Rotenon, bazı baklagil köklerinden (Derris, Lonchocarpus) elde edilen bir böcek ve balık zehiridir. Kompleks I’de elektronların Fe-S kümelerinden ubikinona geçişini engeller: NADH yükseltgenemez ve birikir. Süksinat elektronlarını Kompleks II üzerinden verdiği için bloğu atlar. Deney hayvanlarında Parkinson benzeri tablo oluşturmak için kullanılır.'
    },
    antimisin: {
      ad: 'Antimisin A', hedef: 'Kompleks III', kid: 'III', uygula: function (g) { g.inh.III = true; },
      degil: 'Antimisin A Kompleks III’ü keser. O zaman süksinat işe yaramaz, ama elektronu doğrudan sitokrom c’ye veren askorbat + TMPD solunumu geri getirirdi.',
      acikla: 'Antimisin A (Streptomyces kaynaklı) Kompleks III’ün Q<sub>i</sub> bölgesine bağlanıp Q döngüsünü durdurur; hem NADH hem süksinat yolu kesilir. Q<sub>o</sub> bölgesinde biriken semikinon elektronunu O₂’ye kaçırdığı için süperoksit üretimi belirgin artar. Askorbat + TMPD elektronu sitokrom c’ye vererek bloğu atlar.'
    },
    siyanur: {
      ad: 'Siyanür', hedef: 'Kompleks IV', kid: 'IV', uygula: function (g) { g.inh.IV = true; },
      degil: 'Siyanür son basamağı (Kompleks IV) keser. O zaman hangi substratı eklersen ekle O₂ tüketimi geri gelmezdi.',
      acikla: 'Siyanür, Kompleks IV’teki hem a₃’ün Fe³⁺ formuna bağlanır; O₂ indirgenemez ve zincirin tamamı indirgenmiş halde kilitlenir. Beslenme bağlantısı: acı badem ve kayısı çekirdeğindeki amigdalin ile iyi işlenmemiş manyoktaki (cassava) linamarin siyanojenik glikozitlerdir. Karbonmonoksit ve azid de aynı kompleksi hedefler.'
    },
    oligomisin: {
      ad: 'Oligomisin', hedef: 'ATP sentaz', kid: 'V', uygula: function (g) { g.inh.V = true; },
      degil: 'Oligomisin ATP sentazın proton kanalını tıkar. O zaman Δp düşmez, yükselirdi; ayırıcı (FCCP) eklenince de O₂ tüketimi hızla geri gelirdi.',
      acikla: 'Oligomisin ATP sentazın F<sub>o</sub> bölümündeki proton kanalını tıkar. Protonlar matrikse dönemez, Δp yükselir ve bu geri basınç elektron akışını yavaşlatır: solunum kontrolünün en açık kanıtı. Ayırıcı eklenince protonlara yeni bir yol açılır; O₂ tüketimi geri gelir ama ATP gelmez.'
    },
    dnp: {
      ad: '2,4-Dinitrofenol', hedef: 'iç zar (ayırıcı)', kid: 'UCP', uygula: function (g) { g.unc = true; },
      degil: 'DNP bir ayırıcıdır: zinciri kesmez, serbest bırakır. O zaman O₂ tüketimi azalmaz, artardı; Δp çöker, ATP sentezi dururdu.',
      acikla: '2,4-Dinitrofenol zarı protonlara geçirgen yapan lipofilik bir zayıf asittir. Gradyan ATP yerine ısıya harcanır; hücre açığı kapatmak için daha çok yakıt ve O₂ tüketir. 1930’larda zayıflama ilacı olarak satıldı, ölümcül hipertermi nedeniyle yasaklandı; bugün hâlâ yasa dışı “yağ yakıcı” olarak karşınıza çıkabilir. Kahverengi yağ dokusundaki UCP1 aynı işi kontrollü biçimde yapar.'
    }
  };

  var Model = { P: P, yeniGirdi: yeniGirdi, akilar: akilar, adimla: adimla, kararli: kararli, olcum: olcum, REF: REF, ZEHIR: ZEHIR };
  if (typeof module !== 'undefined' && module.exports) { module.exports = Model; return; }

  /* ============================== ARAYÜZ ============================== */
  var Oyun = window.Oyun;
  var TABAN = document.currentScript ? document.currentScript.src : '';

  var KOMP = {
    I: { ad: 'Kompleks I', alt: 'NADH : ubikinon oksidoredüktaz', renk: '#3b82f6',
      satir: [['Tepkime', 'NADH + H⁺ + Q → NAD⁺ + QH₂'], ['Proton', '2 e⁻ başına 4 H⁺ pompalar'], ['Kofaktör', 'FMN, 8 Fe-S kümesi'], ['İnhibitör', 'rotenon, amital, piericidin A']],
      not: 'Memelide 45 alt birim; 7’si mitokondri DNA’sında kodlanır. Beslenme bağlantısı: FMN riboflavinden (B2), NAD⁺ niasinden (B3) gelir; Fe-S kümeleri demir ister.' },
    II: { ad: 'Kompleks II', alt: 'süksinat dehidrogenaz', renk: '#22c55e',
      satir: [['Tepkime', 'süksinat + Q → fumarat + QH₂'], ['Proton', 'pompalamaz'], ['Kofaktör', 'FAD (kovalent), 3 Fe-S kümesi, hem b'], ['İnhibitör', 'malonat (yarışmalı)']],
      not: 'Krebs döngüsünün zara gömülü tek enzimi; yani döngü ile zincir burada fiziksel olarak aynı proteindir. Proton pompalamadığı için FADH₂ yolu daha az ATP verir (P/O ≈ 1,5).' },
    Q: { ad: 'Ubikinon (koenzim Q)', alt: 'zar içi hareketli taşıyıcı', renk: '#eab308',
      satir: [['Taşıdığı', '2 e⁻ + 2 H⁺ (QH₂, ubikinol)'], ['Yol', 'Kompleks I ve II → Kompleks III'], ['Yapı', 'benzokinon halkası + izopren kuyruk (insanda Q₁₀)']],
      not: 'Yağda çözünür; zarın içinde serbestçe yüzer. Mevalonat yolundan sentezlenir; bu yüzden statinler plazma KoQ₁₀ düzeyini düşürebilir.' },
    III: { ad: 'Kompleks III', alt: 'sitokrom bc₁ kompleksi', renk: '#a855f7',
      satir: [['Tepkime', 'QH₂ + 2 sit c (yük.) → Q + 2 sit c (ind.)'], ['Proton', '2 e⁻ başına 4 H⁺ (Q döngüsü)'], ['Kofaktör', 'hem b<sub>L</sub>, hem b<sub>H</sub>, hem c₁, Rieske Fe-S'], ['İnhibitör', 'antimisin A (Q<sub>i</sub>), miksotiyazol (Q<sub>o</sub>)']],
      not: 'İki elektronlu taşıyıcıdan (QH₂) tek elektronlu taşıyıcıya (sitokrom c) geçiş burada Q döngüsüyle çözülür. Yarı indirgenmiş semikinon, süperoksidin başlıca kaynaklarından biridir.' },
    C: { ad: 'Sitokrom c', alt: 'zarlar arası boşlukta hareketli taşıyıcı', renk: '#ef4444',
      satir: [['Taşıdığı', '1 e⁻ (hem demiri: Fe³⁺ ⇄ Fe²⁺)'], ['Yol', 'Kompleks III → Kompleks IV'], ['Boyut', '≈12 kDa, suda çözünür']],
      not: 'Sitozole sızarsa Apaf-1’e bağlanıp apoptozomu kurar ve programlı hücre ölümünü başlatır: solunum proteini aynı zamanda ölüm sinyalidir.' },
    IV: { ad: 'Kompleks IV', alt: 'sitokrom c oksidaz', renk: '#14b8a6',
      satir: [['Tepkime', '4 sit c (ind.) + O₂ + 4 H⁺ → 2 H₂O'], ['Proton', '2 e⁻ başına 2 H⁺ pompalar (+2 H⁺ su için matriksten alınır)'], ['Kofaktör', 'Cu<sub>A</sub>, hem a, hem a₃–Cu<sub>B</sub>'], ['İnhibitör', 'siyanür, CO, azid, H₂S']],
      not: 'Soluduğumuz oksijenin neredeyse tamamı burada suya indirgenir. Beslenme bağlantısı: bakır ve (hem için) demir; ağır bakır eksikliğinde enzim etkinliği düşer.' },
    V: { ad: 'ATP sentaz', alt: 'F<sub>o</sub>F<sub>1</sub>-ATPaz (Kompleks V)', renk: '#f59e42',
      satir: [['Tepkime', 'ADP + P<sub>i</sub> + n H⁺ (dış) → ATP + n H⁺ (iç)'], ['Mekanizma', 'dönel kataliz: c-halkası ve γ sapı döner, β alt birimleri ATP salar'], ['Oran', 'tam tur = 3 ATP; memelide c₈ halkası → 8 H⁺'], ['İnhibitör', 'oligomisin (F<sub>o</sub>)']],
      not: 'Halka başına 8 H⁺ / 3 ATP ≈ 2,7; fosfat ve ADP taşınması için 1 H⁺ daha eklenince ATP başına ≈3,7 H⁺ eder. Model, ders kitaplarındaki yuvarlak değeri (4) kullanır. Boyer ve Walker, 1997 Nobel Kimya Ödülü.' },
    UCP: { ad: 'UCP1 (termogenin) / ayırıcı', alt: 'kontrollü proton kaçağı', renk: '#f472b6',
      satir: [['İşlev', 'H⁺ matrikse ATP yapılmadan döner; enerji ısıya dönüşür'], ['Düzenleme', 'yağ asitleri açar, pürin nükleotitleri (GDP/ATP) kapatır'], ['Kimyasal karşılığı', '2,4-dinitrofenol (DNP), FCCP']],
      not: 'Kahverengi yağ dokusunda titremesiz ısı üretiminin kaynağıdır (yenidoğanlar, soğuğa uyum). Hafif ayrışma Δp’yi düşürerek ROS üretimini de azaltır.' }
  };
  var KOMP_SIRA = ['I', 'II', 'Q', 'III', 'C', 'IV', 'V', 'UCP'];
  var KOMP_KISA = { I: 'I', II: 'II', Q: 'Q', III: 'III', C: 'Sit c', IV: 'IV', V: 'ATP sentaz', UCP: 'UCP1' };

  var OLCER = [
    { id: 'o2', ad: 'O₂ tüketimi', max: 220, birim: '%', renk: '#60a5fa' },
    { id: 'dp', ad: 'Δp · zar potansiyeli', max: 220, birim: ' mV', renk: '#fbbf24' },
    { id: 'atp', ad: 'ATP sentezi', max: 130, birim: '%', renk: '#f59e42' },
    { id: 'nadh', ad: 'NADH (indirgenmiş)', max: 100, birim: '%', renk: '#a78bfa' },
    { id: 'ros', ad: 'ROS üretimi', max: 100, birim: '', renk: '#f87171' },
    { id: 'isi', ad: 'Isı üretimi', max: 130, birim: '%', renk: '#fb7185' }
  ];

  var GOREV = [
    { ad: 'Durum 3: NADH kaynağı ve ADP varken ATP sentezini çalıştır.',
      ok: function (g, o) { return g.sN && g.adp && !g.unc && o.atp > 85; },
      ogret: 'Akış eşleşmiş: O₂ tüketimi ile ATP sentezi birlikte yürüyor. P/O teorik 2,5’in biraz altında, çünkü protonların bir kısmı zardan kaçıyor.' },
    { ad: 'ADP’yi kes ve bekle (Durum 4).',
      ok: function (g, o) { return !g.adp && !g.unc && !g.inh.I && !g.inh.III && !g.inh.IV && o.dp > 176; },
      ogret: 'ADP yokken sentaz durur, Δp yükselir, O₂ tüketimi düşer ve ROS artar. “Akış durunca sorun başlar”: çok yakıt, az iş.' },
    { ad: 'Rotenon ekle, sonra bloğu süksinatla atla.',
      ok: function (g, o) { return g.inh.I && g.sS && !g.inh.II && o.o2 > 50; },
      ogret: 'Süksinatın elektronları Kompleks II’den girer. Kompleks I’in 4 protonu eksik kaldığı için P/O ≈ 1,5’e düşer.' },
    { ad: 'Ayırıcıyı aç: O₂ tüketimi artarken ATP sentezi düşsün.',
      ok: function (g, o) { return g.unc && o.o2 > 115 && o.atp < 25; },
      ogret: 'Gradyan ısıya harcanıyor: kahverengi yağ dokusunun (UCP1) titremesiz ısı üretimi ve DNP zehirlenmesindeki hiperterminin mantığı.' },
    { ad: 'Oligomisinle ATP sentazı tıka, sonra ayırıcıyla solunumu geri getir.',
      ok: function (g, o) { return g.inh.V && g.unc && o.o2 > 100; },
      ogret: 'Solunum ve fosforilasyon iki ayrı makinedir; onları birbirine bağlayan tek şey proton gradyanıdır (Mitchell’in kemiozmotik kuramı, 1961).' }
  ];

  function kur() {
    var kok = document.getElementById('zincir-kok');
    var g = yeniGirdi(), dp = REF.dp, mod = 'lab';
    var gor = null, calisiyor = false, sonAn = 0, t = 0;
    var gecmis = [], isaretler = [], o2Top = 0, atpTop = 0, sonKayit = 0, sonDom = 0;
    var gorevTamam = GOREV.map(function () { return false; });
    var secili = null;
    var vaka = null; // { sira:[], i, zehir, eklendi, cozuldu, elenen:{}, yanlis, ipucu }

    var olcerHtml = OLCER.map(function (o) {
      return '<div class="zn-olcer" data-o="' + o.id + '" style="--renk:' + o.renk + '"><div class="ust"><span class="ad">' + o.ad + '</span><b>–</b></div><div class="cubuk"><i></i><u></u></div></div>';
    }).join('');

    kok.innerHTML =
      '<div class="o-bas"><div><div class="o-ust">Oyun 2 · 3B simülasyon</div><h3 class="o-baslik">Solunum Zinciri</h3>' +
      '<p class="o-alt">Mitokondri iç zarı: elektronlar Kompleks I’den O₂’ye akar, protonlar zarlar arası boşluğa pompalanır, ATP sentaz bu gradyanla döner. Sahneyi sürükleyerek döndür, bir komplekse tıklayarak incele.</p></div>' +
      '<div class="zn-mod" role="tablist"><button class="aktif" data-mod="lab" role="tab">Serbest laboratuvar</button><button data-mod="dedektif" role="tab">Zehir dedektifi</button></div></div>' +

      '<div class="zn-govde"><div class="zn-sol">' +
      '<div class="zn-sahne"><div class="zn-tuval"></div>' +
      '<span class="zn-bolge ust">Zarlar arası boşluk · H⁺ yüksek (+)</span><span class="zn-bolge alt">Matriks · H⁺ düşük (−)</span>' +
      '<span class="zn-surukle">↔ sürükle: döndür</span><div class="zn-yukleniyor">3B sahne yükleniyor…</div></div>' +
      '<div class="zn-cipler">' + KOMP_SIRA.map(function (k) { return '<button class="zn-kcip" data-k="' + k + '" style="--renk:' + KOMP[k].renk + '">' + KOMP_KISA[k] + '</button>'; }).join('') +
      '<button class="zn-kcip tum" data-k="">Tümü</button></div>' +
      '<div class="o-panel zn-bilgi"></div>' +
      '<div class="o-panel"><div class="o-panel-bas">Oksigraf kaydı <span class="zn-lejant"><i style="background:#60a5fa"></i>tüketilen O <i style="background:#f59e42"></i>sentezlenen ATP</span></div><canvas class="zn-grafik" width="640" height="220"></canvas></div></div>' +

      '<div class="zn-sag"><div class="o-panel"><div class="o-panel-bas">Ölçümler <span class="zn-ref-not">▏kontrol (Durum 3)</span></div>' +
      '<div class="zn-olcerler">' + olcerHtml + '</div>' +
      '<div class="zn-po">P/O oranı <b data-po>–</b><span>ATP / O atomu</span></div></div>' +
      '<div class="o-panel zn-kontrol"></div></div></div>' +

      '<details class="o-not"><summary>Model notu: neler sadeleştirildi?</summary><ul>' +
      '<li>Proton stokiyometrisi ders kitabı değerleridir: 2 e⁻ başına Kompleks I 4, Kompleks III 4, Kompleks IV 2 H⁺; ATP başına 4 H⁺. Buradan teorik P/O 2,5 (NADH) ve 1,5 (süksinat) çıkar; modeldeki proton kaçağı ölçülen değeri bir miktar düşürür.</li>' +
      '<li>Akı hızları, Δp değerleri ve ROS/ısı ölçekleri görelidir; yönleri ve sıralamaları deneysel gözlemlerle uyumludur (solunum kontrol oranı ≈5–6), mutlak sayılar belirli bir dokuya ait değildir.</li>' +
      '<li>İnhibitörler tam (%100) blok olarak modellenmiştir; gerçekte doz-yanıt ilişkisi vardır. Blok sonrası Δp’nin sönme hızı görsellik için hızlandırılmıştır ve ATP sentazın tersine çalışması (ATP hidrolizi) modele dahil değildir.</li>' +
      '<li>3B şekiller şematiktir; alt birim sayıları ve oranlar kristal yapılarla birebir değildir. ATP sentazdaki 8’li c-halkası memeli enzimine uygundur.</li>' +
      '</ul></details>' +
      '<div class="o-perde"><div class="o-sonuc"></div></div>';

    var sahne = kok.querySelector('.zn-tuval'), bilgi = kok.querySelector('.zn-bilgi'), kontrol = kok.querySelector('.zn-kontrol');
    var grafik = kok.querySelector('.zn-grafik'), gx = grafik.getContext('2d'), perde = kok.querySelector('.o-perde');
    var olcEl = {};
    kok.querySelectorAll('.zn-olcer').forEach(function (e) { olcEl[e.getAttribute('data-o')] = e; });

    /* ---------- 3B görünüm (tembel yükleme) ---------- */
    function gorunumYukle() {
      var yukleniyor = kok.querySelector('.zn-yukleniyor');
      function yedek(e) {
        yukleniyor.textContent = '3B görünüm bu cihazda açılamadı. Ölçümler, grafik ve deneyler çalışmaya devam ediyor.';
        yukleniyor.classList.add('hata');
        if (window.console) console.warn('3B görünüm açılamadı:', e && e.message);
      }
      try {
        import(new URL('zincir3d.js', TABAN).href).then(function (m) {
          try { gor = m.olustur(sahne, { sec: kompSec }); yukleniyor.remove(); } catch (e) { yedek(e); }
        }).catch(yedek);
      } catch (e) { yedek(e); }
    }

    /* ---------- kompleks bilgi kartı ---------- */
    function kompSec(k) {
      secili = k || null;
      kok.querySelectorAll('.zn-kcip').forEach(function (b) { b.classList.toggle('aktif', b.getAttribute('data-k') === (k || '')); });
      if (gor) gor.odak(secili);
      if (!k) {
        bilgi.innerHTML = '<div class="o-panel-bas">Kompleks bilgisi</div><p class="zn-bos">Bir kompleksi seçmek için sahnede üzerine tıkla ya da yukarıdaki düğmeleri kullan.</p>';
        return;
      }
      var c = KOMP[k];
      bilgi.innerHTML = '<div class="zn-kart-bas"><i style="background:' + c.renk + '"></i><div><h4>' + c.ad + '</h4><span>' + c.alt + '</span></div></div>' +
        '<dl>' + c.satir.map(function (s) { return '<dt>' + s[0] + '</dt><dd>' + s[1] + '</dd>'; }).join('') + '</dl><p class="zn-kart-not">' + c.not + '</p>';
    }

    /* ---------- kayıt / grafik ---------- */
    function isaretKoy(ad) { isaretler.push({ t: t, ad: ad }); }
    function grafikCiz() {
      var cw = grafik.clientWidth;
      if (!cw) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2), W = cw, H = Math.round(Math.max(150, Math.min(230, cw * 0.36)));
      if (grafik.width !== Math.round(W * dpr) || grafik.height !== Math.round(H * dpr)) {
        grafik.width = Math.round(W * dpr); grafik.height = Math.round(H * dpr); grafik.style.height = H + 'px';
      }
      gx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var pen = 60, sol = 8, sag = 8, ust = 50, alt = 18;
      gx.clearRect(0, 0, W, H);
      gx.fillStyle = '#0a1120'; gx.fillRect(0, 0, W, H);
      if (gecmis.length < 2) return;
      var t1 = t, t0 = Math.max(gecmis[0].t, t1 - pen);
      var ilk = gecmis[0];
      for (var i = 0; i < gecmis.length; i++) { if (gecmis[i].t >= t0) { ilk = gecmis[i]; break; } }
      var son = gecmis[gecmis.length - 1];
      var ymax = Math.max(son.o - ilk.o, son.a - ilk.a, 20) * 1.1;
      function X(tt) { return sol + (W - sol - sag) * (tt - t0) / Math.max(1e-6, pen); }
      function Y(v) { return H - alt - (H - alt - ust) * v / ymax; }
      gx.strokeStyle = '#1f2f50'; gx.lineWidth = 1;
      for (var k = 1; k < 4; k++) { var yy = ust + (H - alt - ust) * k / 4; gx.beginPath(); gx.moveTo(sol, yy); gx.lineTo(W - sag, yy); gx.stroke(); }
      gx.font = '600 11.5px system-ui, sans-serif'; gx.textBaseline = 'top';
      var sonX = -999, satir = 0;
      isaretler.forEach(function (m) {
        if (m.t < t0 - 0.3) return;
        var x = Math.max(sol, X(m.t));
        gx.strokeStyle = '#8ea2cf'; gx.setLineDash([4, 4]); gx.beginPath(); gx.moveTo(x, 4); gx.lineTo(x, H - alt); gx.stroke(); gx.setLineDash([]);
        satir = (x - sonX < 90) ? (satir + 1) % 3 : 0; sonX = x;
        gx.fillStyle = '#dbe5fb';
        var w = gx.measureText(m.ad).width;
        gx.fillText(m.ad, Math.min(x + 4, W - sag - w), 4 + satir * 14);
      });
      function cizgi(alan, renk) {
        gx.strokeStyle = renk; gx.lineWidth = 2.5; gx.lineJoin = 'round'; gx.beginPath();
        var basla = true;
        for (var i = 0; i < gecmis.length; i++) {
          var p = gecmis[i]; if (p.t < t0) continue;
          var x = X(p.t), y = Y(p[alan] - ilk[alan]);
          if (basla) { gx.moveTo(x, y); basla = false; } else gx.lineTo(x, y);
        }
        gx.stroke();
      }
      cizgi('a', '#f59e42'); cizgi('o', '#60a5fa');
      gx.fillStyle = '#7f90b6'; gx.font = '11px system-ui, sans-serif'; gx.textBaseline = 'bottom';
      gx.fillText('zaman → (son 60 sn)', W - sag - 112, H - 2);
    }

    /* ---------- ölçerler ---------- */
    function olcerYaz(o) {
      OLCER.forEach(function (tan) {
        var el = olcEl[tan.id], v = o[tan.id];
        el.querySelector('b').textContent = Math.round(v) + tan.birim;
        el.querySelector('i').style.width = Math.max(0, Math.min(100, 100 * v / tan.max)) + '%';
      });
      kok.querySelector('[data-po]').textContent = o.po == null ? '–' : Oyun.sayi(o.po);
    }
    function refYaz() {
      var r = olcum(akilar(yeniGirdi(), REF.dp), REF.dp);
      OLCER.forEach(function (tan) { olcEl[tan.id].querySelector('u').style.left = Math.min(100, 100 * r[tan.id] / tan.max) + '%'; });
    }

    /* ---------- kontrol panelleri ---------- */
    function cip(ad, anahtar, acik, ek) {
      return '<button class="zn-cip' + (acik ? ' acik' : '') + (ek ? ' ' + ek : '') + '" data-a="' + anahtar + '" aria-pressed="' + (acik ? 'true' : 'false') + '">' + ad + '</button>';
    }
    function labCiz() {
      kontrol.innerHTML =
        '<div class="o-panel-bas">Deney tezgâhı</div>' +
        '<div class="zn-grup"><span>Substrat</span>' + cip('Pirüvat + malat (NADH)', 'sN', g.sN) + cip('Süksinat', 'sS', g.sS) + cip('Askorbat + TMPD', 'sA', g.sA) + '</div>' +
        '<div class="zn-grup"><span>Fosfat alıcısı</span>' + cip('ADP + P<sub>i</sub>', 'adp', g.adp) + '</div>' +
        '<div class="zn-grup"><span>İnhibitör</span>' + cip('Rotenon', 'I', g.inh.I, 'zehir') + cip('Malonat', 'II', g.inh.II, 'zehir') + cip('Antimisin A', 'III', g.inh.III, 'zehir') + cip('Siyanür', 'IV', g.inh.IV, 'zehir') + cip('Oligomisin', 'V', g.inh.V, 'zehir') + '</div>' +
        '<div class="zn-grup"><span>Ayırıcı</span>' + cip('DNP / UCP1', 'unc', g.unc, 'isi') + '<button class="o-btn kucuk" data-a="sifirla">↺ Tezgâhı sıfırla</button></div>' +
        '<div class="o-panel-bas" style="margin-top:12px">Keşif görevleri</div><ol class="zn-gorev">' +
        GOREV.map(function (q, i) { return '<li class="' + (gorevTamam[i] ? 'tamam' : '') + '"><span>' + q.ad + '</span>' + (gorevTamam[i] ? '<em>' + q.ogret + '</em>' : '') + '</li>'; }).join('') + '</ol>';
    }

    var ADLAR = { sN: 'pirüvat + malat', sS: 'süksinat', sA: 'askorbat + TMPD', adp: 'ADP', I: 'rotenon', II: 'malonat', III: 'antimisin A', IV: 'siyanür', V: 'oligomisin', unc: 'ayırıcı' };

    function labTikla(a) {
      if (a === 'sifirla') { g = yeniGirdi(); isaretKoy('sıfırlandı'); labCiz(); return; }
      var acildi;
      if (a in g.inh) { g.inh[a] = !g.inh[a]; acildi = g.inh[a]; }
      else { g[a] = !g[a]; acildi = g[a]; }
      isaretKoy((acildi ? '+ ' : '− ') + ADLAR[a]);
      labCiz();
    }

    /* ---------- dedektif ---------- */
    function vakaBaslat(yeniTur) {
      if (yeniTur || !vaka) vaka = { sira: Oyun.karistir(Object.keys(ZEHIR)), i: 0, yanlisTop: 0 };
      vaka.zehir = vaka.sira[vaka.i]; vaka.eklendi = false; vaka.cozuldu = false; vaka.elenen = {}; vaka.ipucu = 0; vaka.geri = '';
      vaka.testler = { sS: false, sA: false, unc: false };
      g = yeniGirdi(); dp = REF.dp;
      gecmis = []; isaretler = []; o2Top = 0; atpTop = 0;
      isaretKoy('kontrol');
      vaka.ekleZamani = t + 2.5;
      kompSec(null);
      dedektifCiz();
    }
    function dedektifCiz() {
      var v = vaka, h = '<div class="o-panel-bas">Vaka ' + (v.i + 1) + ' / ' + v.sira.length + '</div>';
      if (!v.eklendi) h += '<p class="zn-vaka">Kontrol ölçümü alınıyor: pirüvat + malat ve ADP varken sağlıklı mitokondri (Durum 3)…</p>';
      else if (!v.cozuldu) h += '<p class="zn-vaka">Süspansiyona <b>bilinmeyen bir madde</b> eklendi. Ölçerlerdeki beyaz çentik kontrol değeridir. Deney yap, sonra şüpheliyi seç.</p>';
      h += '<div class="zn-grup"><span>Deneyler</span>' +
        cip('Süksinat ekle', 'sS', v.testler.sS, 'test') + cip('Askorbat + TMPD ekle', 'sA', v.testler.sA, 'test') + cip('FCCP (ayırıcı) ekle', 'unc', v.testler.unc, 'test') + '</div>';
      h += '<div class="zn-grup"><span>Şüpheliler</span>' + Object.keys(ZEHIR).map(function (z) {
        var sinif = 'zn-supheli' + (v.elenen[z] ? ' elendi' : '') + (v.cozuldu && z === v.zehir ? ' dogru' : '');
        return '<button class="' + sinif + '" data-z="' + z + '"' + ((!v.eklendi || v.cozuldu || v.elenen[z]) ? ' disabled' : '') + '>' + ZEHIR[z].ad + '</button>';
      }).join('') + '</div>';
      if (v.geri) h += '<div class="zn-geri ' + (v.cozuldu ? 'dogru' : 'yanlis') + '">' + v.geri + '</div>';
      h += '<div class="zn-grup">';
      if (!v.cozuldu) h += '<button class="o-btn kucuk" data-a="ipucu"' + (v.eklendi ? '' : ' disabled') + '>💡 İpucu' + (v.ipucu ? ' (' + v.ipucu + '/3)' : '') + '</button>';
      else h += '<button class="o-btn ana" data-a="sonraki">' + (v.i + 1 < v.sira.length ? 'Sonraki vaka →' : 'Sonuçları gör') + '</button>';
      h += '</div>';
      kontrol.innerHTML = h;
    }
    var IPUCU = [
      'Önce O₂ tüketimine bak. Arttıysa zincir serbest kalmış demektir (ayırıcı). Azaldıysa ya zincirin içinde ya da ATP sentazda bir blok var.',
      'Şimdi Δp’ye bak. O₂ tüketimi düşerken Δp yükseliyorsa protonlar geri dönemiyor: blok ATP sentazdadır (FCCP ile doğrula). Δp de düşüyorsa blok zincirin içindedir.',
      'Zincir içi blokta: süksinat solunumu geri getiriyorsa blok Kompleks I’de; getirmiyor ama askorbat + TMPD getiriyorsa Kompleks III’te; hiçbiri getirmiyorsa Kompleks IV’te.'
    ];
    function dedektifTikla(a, z) {
      var v = vaka;
      if (z) {
        if (z === v.zehir) {
          v.cozuldu = true;
          var zz = ZEHIR[z];
          v.geri = '<b>Doğru: ' + zz.ad + ' → ' + zz.hedef + '.</b> ' + zz.acikla;
          isaretKoy('çözüldü');
          kompSec(zz.kid);
        } else {
          v.elenen[z] = true; v.yanlisTop++;
          v.geri = '<b>' + ZEHIR[z].ad + ' değil.</b> ' + ZEHIR[z].degil + ' Ölçümlerine yeniden bak.';
        }
        dedektifCiz(); return;
      }
      if (a === 'ipucu') { v.ipucu = Math.min(3, v.ipucu + 1); v.geri = '💡 ' + IPUCU[v.ipucu - 1]; dedektifCiz(); return; }
      if (a === 'sonraki') {
        if (v.i + 1 < v.sira.length) { v.i++; vakaBaslat(false); }
        else dedektifBitir();
        return;
      }
      if (a in v.testler && !v.testler[a] && v.eklendi) {
        v.testler[a] = true; g[a] = true;
        isaretKoy('+ ' + (a === 'unc' ? 'FCCP' : ADLAR[a]));
        dedektifCiz();
      }
    }
    function dedektifBitir() {
      var y = vaka.yanlisTop <= 1 ? 3 : (vaka.yanlisTop <= 4 ? 2 : 1);
      Oyun.yildizVer('zincir', y);
      perde.querySelector('.o-sonuc').innerHTML =
        '<h4>Beş vaka da çözüldü</h4><div class="yildizlar">' + Oyun.yildizMetni(y) + '</div>' +
        '<table><tr><td>Çözülen vaka</td><td>' + vaka.sira.length + '</td></tr><tr><td>Yanlış tahmin</td><td>' + vaka.yanlisTop + '</td></tr></table>' +
        '<ul class="ogrenilen">' +
        '<li>O₂ tüketimi artıyorsa ayırıcı; azalıyor ve Δp yükseliyorsa ATP sentaz; azalıyor ve Δp düşüyorsa zincir içi blok.</li>' +
        '<li>Bloğun yerini, elektronu zincire farklı noktalardan veren substratlarla bulursun: süksinat → Kompleks II, askorbat + TMPD → sitokrom c.</li>' +
        '<li>Aynı mantık bugün hücre biyoenerjetiği ölçümlerinde (oligomisin → FCCP → rotenon + antimisin sırasıyla) kullanılır.</li></ul>' +
        '<div class="dugmeler"><button class="o-btn ana" data-a="yenitur">Yeni beş vaka</button><button class="o-btn" data-a="labagec">Serbest laboratuvar</button><button class="o-btn" data-page="oyunlar">Oyun merkezi</button></div>';
      perde.classList.add('acik');
    }

    function modSec(m) {
      mod = m;
      kok.querySelectorAll('[data-mod]').forEach(function (b) { b.classList.toggle('aktif', b.getAttribute('data-mod') === m); });
      kok.classList.toggle('zn-dedektif', m === 'dedektif');
      perde.classList.remove('acik');
      if (m === 'lab') { g = yeniGirdi(); dp = REF.dp; gecmis = []; isaretler = []; o2Top = 0; atpTop = 0; isaretKoy('Durum 3'); labCiz(); kompSec(secili); }
      else vakaBaslat(true);
    }

    /* ---------- döngü ---------- */
    function kare(simdi) {
      if (!calisiyor) return;
      var dt = Math.min(0.1, (simdi - sonAn) / 1000 || 0.016); sonAn = simdi; t += dt;

      if (mod === 'dedektif' && vaka && !vaka.eklendi && t >= vaka.ekleZamani) {
        vaka.eklendi = true; ZEHIR[vaka.zehir].uygula(g); isaretKoy('+ madde X'); dedektifCiz();
      }
      dp = adimla(g, dp, dt);
      var a = akilar(g, dp), o = olcum(a, dp);
      o2Top += a.j * dt; atpTop += a.atp * dt;
      if (t - sonKayit >= 0.1) {
        sonKayit = t; gecmis.push({ t: t, o: o2Top, a: atpTop });
        if (gecmis.length > 900) gecmis.shift();
        while (isaretler.length && isaretler[0].t < t - 70) isaretler.shift();
      }
      if (t - sonDom >= 0.12) {
        sonDom = t; olcerYaz(o); grafikCiz();
        if (mod === 'lab') {
          var degisti = false;
          GOREV.forEach(function (q, i) { if (!gorevTamam[i] && q.ok(g, o)) { gorevTamam[i] = true; degisti = true; } });
          if (degisti) labCiz();
        }
      }
      if (gor) {
        var gizle = mod === 'dedektif' && vaka && !vaka.cozuldu;
        gor.ciz({
          jn: a.jn, js: a.js, ja: a.ja, dp: dp, hSyn: a.hSyn, hUnc: a.hUnc, atp: a.atp, sS: g.sS, sA: g.sA, sN: g.sN,
          isaret: gizle ? {} : { I: g.inh.I, II: g.inh.II, III: g.inh.III, IV: g.inh.IV, V: g.inh.V },
          unc: g.unc && !(gizle && vaka.zehir === 'dnp' && !vaka.testler.unc)
        }, dt);
      }
      requestAnimationFrame(kare);
    }
    function calis(acik) {
      if (acik && !calisiyor) { calisiyor = true; sonAn = performance.now(); requestAnimationFrame(kare); }
      else if (!acik) calisiyor = false;
    }

    kok.addEventListener('click', function (olay) {
      var m = olay.target.closest('[data-mod]');
      if (m) { modSec(m.getAttribute('data-mod')); return; }
      var k = olay.target.closest('[data-k]');
      if (k) { kompSec(k.getAttribute('data-k')); return; }
      var z = olay.target.closest('[data-z]');
      if (z && mod === 'dedektif') { dedektifTikla(null, z.getAttribute('data-z')); return; }
      var a = olay.target.closest('[data-a]');
      if (!a) return;
      var ad = a.getAttribute('data-a');
      if (ad === 'yenitur') { perde.classList.remove('acik'); vakaBaslat(true); return; }
      if (ad === 'labagec') { modSec('lab'); return; }
      if (mod === 'lab') labTikla(ad); else dedektifTikla(ad, null);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) calis(false);
      else if (document.getElementById('oyun-zincir').classList.contains('active')) calis(true);
    });

    refYaz();
    kompSec(null);
    modSec('lab');
    gorunumYukle();
    return { calis: calis };
  }

  var ornek = null;
  window.Oyun.kaydet('oyun-zincir', function () { ornek = kur(); }, function (acik) { if (ornek) ornek.calis(acik); });
})();
