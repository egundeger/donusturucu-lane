/* OYUN 4 — Tok mu, Aç mı?
   Altı senaryo. Her birinde önce baskın sinyal, sonra dokulardaki yolların yönü (artar / azalır) seçilir.
   Yanlış yanıt elemez: ipucu verir, düzeltip yeniden kontrol edebilirsin. */
(function () {
  'use strict';
  var Oyun = window.Oyun;

  var DOKU = {
    kc: { ad: 'Karaciğer', renk: '#f59e42' }, kas: { ad: 'İskelet kası', renk: '#f87171' },
    yag: { ad: 'Yağ dokusu', renk: '#fbbf24' }, beyin: { ad: 'Beyin', renk: '#f472b6' }
  };

  var SENARYO = [
    {
      kisa: 'Tok', baslik: 'Karbonhidrattan zengin bir öğünden 1 saat sonra',
      durum: 'Makarna, ekmek ve meyve suyu. Bağırsaktan emilen glukoz portal venle karaciğere, oradan dolaşıma geçiyor; kan glukozu 140 mg/dL.',
      soru: 'Bu tabloyu yöneten baskın sinyal hangisi?',
      secenek: ['İnsülin', 'Glukagon', 'Adrenalin'], dogru: 0,
      sinyalNeden: 'Yükselen kan glukozu pankreas β hücrelerinden insülin salgılatır, α hücrelerinden glukagon salgısını baskılar. İnsülin/glukagon oranı yükselir: “depola ve inşa et”.',
      duzey: { ins: 3, glu: 0, adr: 0 }, dusun: 'İnsülin “depola ve inşa et” der. Bu yol depolamaya mı hizmet ediyor, yıkıma mı?',
      madde: [
        { d: 'kc', yol: 'Glikojen sentezi', y: 1, neden: 'İnsülin, protein fosfataz-1 üzerinden glikojen sentazı defosforile ederek etkinleştirir. Karaciğerin glukokinazı (yüksek K<sub>m</sub>) ancak glukoz bolken hızlanır.' },
        { d: 'kc', yol: 'Glukoneogenez', y: -1, neden: 'İnsülin PEPCK ve glukoz-6-fosfataz ifadesini baskılar; fruktoz-2,6-bisfosfat yükselir ve fruktoz-1,6-bisfosfatazı durdurur.' },
        { d: 'kc', yol: 'Yağ asidi sentezi (de novo lipogenez)', y: 1, neden: 'Fazla glukoz asetil-CoA’ya, o da yağ asidine çevrilir: insülin asetil-CoA karboksilazı etkinleştirir. Oluşan malonil-CoA aynı anda CPT-I’i kapatıp β-oksidasyonu durdurur.' },
        { d: 'kas', yol: 'GLUT4 ile glukoz alımı', y: 1, neden: 'İnsülin, GLUT4 taşıyan vezikülleri hücre zarına gönderir. Öğün sonrası glukozun en büyük alıcısı iskelet kasıdır.' },
        { d: 'yag', yol: 'Lipoliz (hormona duyarlı lipaz)', y: -1, neden: 'İnsülin fosfodiesteraz 3B ile cAMP’yi düşürür; hormona duyarlı lipaz ve ATGL baskılanır. Tokken depo yağı çözülmez.' },
        { d: 'yag', yol: 'Triaçilgliserol depolama (lipoprotein lipaz)', y: 1, neden: 'İnsülin yağ dokusu kılcallarındaki lipoprotein lipazı artırır; şilomikron ve VLDL’nin yağ asitleri depoya alınır.' }
      ]
    },
    {
      kisa: 'Gece açlığı', baslik: 'Gece açlığı: son öğünden 12 saat sonra',
      durum: 'Sabah 07.00, kahvaltıdan önce. Kan glukozu 85 mg/dL ve sabit; oysa bağırsaktan saatlerdir glukoz gelmiyor. Birisi glukoz üretiyor olmalı.',
      soru: 'Bu tabloyu yöneten baskın sinyal hangisi?',
      secenek: ['İnsülin', 'Glukagon', 'Adrenalin'], dogru: 1,
      sinyalNeden: 'Kan glukozu düşme eğilimine girince α hücreleri glukagon salgılar, insülin bazal düzeye iner. Glukagonun hedefi neredeyse yalnızca karaciğerdir: “kan glukozunu koru”.',
      duzey: { ins: 1, glu: 3, adr: 0 }, dusun: 'Glukagon karaciğere “kan glukozunu koru” der; insülinin azlığı ise yağ dokusunun frenini kaldırır.',
      madde: [
        { d: 'kc', yol: 'Glikojen yıkımı (glikojenoliz)', y: 1, neden: 'Glukagon → cAMP → PKA → fosforilaz kinaz → glikojen fosforilaz. Gece açlığında kana verilen glukozun kabaca yarısı karaciğer glikojeninden gelir.' },
        { d: 'kc', yol: 'Glukoneogenez', y: 1, neden: 'Laktat, alanin ve gliserolden glukoz yapılır. Glukagon PEPCK’yi artırır, fruktoz-2,6-bisfosfatı düşürür.' },
        { d: 'kc', yol: 'Glikoliz', y: -1, neden: 'Fruktoz-2,6-bisfosfat düşünce PFK-1 yavaşlar; PKA karaciğer pirüvat kinazını fosforile ederek baskılar. Karaciğer şu an glukoz tüketmez, üretir.' },
        { d: 'yag', yol: 'Lipoliz (hormona duyarlı lipaz)', y: 1, neden: 'İnsülin düştüğü için fren kalkar; serbest yağ asitleri ve gliserol kana verilir. Gliserol karaciğerde glukoneogeneze girer.' },
        { d: 'kas', yol: 'Yağ asidi oksidasyonu', y: 1, neden: 'Dinlenme halindeki kas açlıkta enerjisinin çoğunu yağ asitlerinden sağlar; glukoz beyne ve eritrositlere bırakılır.' },
        { d: 'kas', yol: 'GLUT4 ile glukoz alımı', y: -1, neden: 'İnsülin düşükken GLUT4 hücre içi veziküllerde kalır. Kas, glukoz için beyinle yarışmaz.' }
      ]
    },
    {
      kisa: 'Uzamış açlık', baslik: 'Uzamış açlık: üçüncü gün',
      durum: 'Üç gündür yalnızca su. Karaciğer glikojeni ilk günün sonunda büyük ölçüde tükendi; beyin ise günde yaklaşık 120 g glukoz istiyor. Bu glukoz kas proteininden karşılanırsa vücut hızla erir.',
      soru: 'Bu tabloyu yöneten baskın sinyal hangisi?',
      secenek: ['İnsülin', 'Glukagon (insülin çok düşük)', 'Adrenalin'], dogru: 1,
      sinyalNeden: 'İnsülin en düşük düzeyinde, glukagon yüksek; kortizol de glukoneogenez enzimlerini ve kas proteolizini destekler. Sorun artık glukoz bulmak değil, proteini korumaktır: çözüm keton cisimleri.',
      duzey: { ins: 0, glu: 3, adr: 1 }, dusun: 'Öncelik beyne yakıt sağlamak ve kas proteinini korumak. Karaciğer yağ asitlerinden beynin kullanabileceği bir yakıt üretebilir mi?',
      madde: [
        { d: 'kc', yol: 'Ketogenez', y: 1, neden: 'β-oksidasyondan gelen asetil-CoA Krebs’e sığmaz, çünkü okzaloasetat glukoneogeneze çekilmiştir. Asetil-CoA asetoasetat ve β-hidroksibütirata çevrilir (hız kısıtlayıcı enzim: mitokondriyel HMG-CoA sentaz).' },
        { d: 'kc', yol: 'Glukoneogenez', y: 1, neden: 'Glikojen bittiği için kan glukozunun tek kaynağı budur: gliserol, laktat ve kastan gelen amino asitler (alanin, glutamin).' },
        { d: 'beyin', yol: 'Keton cisimlerinin kullanımı', y: 1, neden: 'Yağ asitleri kan–beyin bariyerini yeterince geçemez; ketonlar geçer. Açlık uzadıkça ketonlar beynin enerji gereksiniminin giderek büyüyen bölümünü karşılar, glukoz ve dolayısıyla protein ihtiyacı azalır.' },
        { d: 'kc', yol: 'Yağ asidi sentezi (de novo lipogenez)', y: -1, neden: 'Glukagon ve AMPK asetil-CoA karboksilazı fosforile ederek kapatır. Malonil-CoA düşer, CPT-I serbest kalır: yağ asitleri mitokondriye girip yakılır.' },
        { d: 'yag', yol: 'Lipoliz (hormona duyarlı lipaz)', y: 1, neden: 'Vücudun en büyük enerji deposu açılır; yağ asitleri kas ve karaciğerin, gliserol glukoneogenezin yakıtıdır.' },
        { d: 'kc', yol: 'Glikojen sentezi', y: -1, neden: 'PKA glikojen sentazı fosforile ederek kapalı tutar; üretilen glukoz depolanmaz, doğrudan kana verilir.' }
      ]
    },
    {
      kisa: 'Egzersiz', baslik: 'Yüksek şiddetli egzersiz: 400 metre koşusu',
      durum: 'Yaklaşık bir dakikalık maksimal efor. Kasın ATP tüketimi dinlenmeye göre yüz kat kadar arttı; oksijen taşınması bu hıza yetişemiyor.',
      soru: 'Bu tabloyu yöneten baskın sinyal hangisi?',
      secenek: ['İnsülin', 'Glukagon', 'Adrenalin ve kasılmanın kendisi (Ca²⁺, AMP)'], dogru: 2,
      sinyalNeden: 'Adrenalin cAMP üzerinden çalışır; ama kasta asıl hızlı sinyaller yereldir: kasılmayı başlatan Ca²⁺ ve ATP tüketildikçe yükselen AMP. İnsülin egzersizde düşer.',
      duzey: { ins: 0, glu: 1, adr: 3 }, dusun: 'Kasın şu an tek derdi saniyeler içinde ATP bulmak. Bu yol hızlı ATP sağlar mı, yoksa ATP harcar mı?',
      madde: [
        { d: 'kas', yol: 'Glikojen yıkımı', y: 1, neden: 'Üç sinyal birden: adrenalin (cAMP → PKA), Ca²⁺ (fosforilaz kinazı doğrudan etkinleştirir) ve AMP (fosforilaz b’nin allosterik aktivatörü).' },
        { d: 'kas', yol: 'Glikoliz ve laktat üretimi', y: 1, neden: 'ATP talebi oksidatif kapasiteyi aşar; AMP ve ADP, PFK-1’i açar. Pirüvat laktata indirgenerek glikolizin gereksindiği NAD⁺ yenilenir.' },
        { d: 'kas', yol: 'Fosfokreatin kullanımı', y: 1, neden: 'İlk saniyelerde ATP, kreatin kinaz tepkimesiyle fosfokreatinden yenilenir; depo yaklaşık 10 saniyelik maksimal efora yeter, sonrasını glikoliz devralır.' },
        { d: 'kas', yol: 'Glikojen sentezi', y: -1, neden: 'PKA glikojen sentazı fosforile ederek kapatır. Yıkım ve sentez aynı anda çalışmaz: karşılıklı düzenleme boş döngüyü önler.' },
        { d: 'kc', yol: 'Glikojen yıkımı (glikojenoliz)', y: 1, neden: 'Adrenalin karaciğerde de (β ve α₁ reseptörleri) glikojen fosforilazı açar; kana glukoz verilir.' },
        { d: 'kas', yol: 'GLUT4 ile glukoz alımı', y: 1, neden: 'İnsülin düşük olsa da kasılma, AMPK ve Ca²⁺ üzerinden GLUT4’ü zara taşır. Egzersizin insülinden bağımsız glukoz düşürücü etkisinin ve tip 2 diyabette egzersiz önerisinin biyokimyasal temeli.' }
      ]
    },
    {
      kisa: 'Tip 1 diyabet', baslik: 'Tedavi edilmemiş tip 1 diyabet',
      durum: 'Kan glukozu 350 mg/dL, idrarda glukoz ve keton var, soluk aseton kokuyor. Kanda bu kadar yakıt varken hasta kilo kaybediyor.',
      soru: 'Bu tabloyu yöneten baskın sinyal hangisi?',
      secenek: ['İnsülin', 'Glukagon (karşısında insülin yok)', 'Adrenalin'], dogru: 1,
      sinyalNeden: 'β hücreleri yıkıldığı için insülin yok; glukagon frensiz kalır. Hücreler kandaki glukozu “göremez” ve metabolizma derin açlıktaymış gibi davranır: bolluk içinde açlık.',
      duzey: { ins: 0, glu: 3, adr: 1 }, dusun: 'İnsülin hiç yokmuş gibi düşün: dokular bunu uzamış açlık sanır. Açlıkta bu yol ne yapardı?',
      madde: [
        { d: 'kas', yol: 'GLUT4 ile glukoz alımı (kas ve yağ dokusu)', y: -1, neden: 'GLUT4’ün zara taşınması insüline bağlıdır. Kanda glukoz bolken kas ve yağ hücresi içeride aç kalır.' },
        { d: 'kc', yol: 'Glukoneogenez', y: 1, neden: 'Glukagonu frenleyecek insülin yok: karaciğer, zaten yüksek olan kan glukozunun üstüne glukoz üretmeyi sürdürür.' },
        { d: 'yag', yol: 'Lipoliz (hormona duyarlı lipaz)', y: 1, neden: 'İnsülin lipolizin başlıca frenidir; yokluğunda yağ asitleri kana dolar. Kilo kaybının nedeni budur.' },
        { d: 'kc', yol: 'Ketogenez', y: 1, neden: 'Karaciğere akan yağ asitleri keton cisimlerine çevrilir. Üretim kullanımı aşınca asetoasetat ve β-hidroksibütirat (ikisi de asit) birikir: diyabetik ketoasidoz. Aseton kokusu asetoasetatın kendiliğinden dekarboksilasyonundandır.' },
        { d: 'kc', yol: 'Glikojen sentezi', y: -1, neden: 'Glikojen sentazı açacak insülin sinyali yok; PKA enzimi fosforile, yani kapalı tutar.' },
        { d: 'yag', yol: 'Triaçilgliserol depolama (lipoprotein lipaz)', y: -1, neden: 'Lipoprotein lipaz insüline bağımlıdır. Etkinliği düşünce şilomikron ve VLDL temizlenemez: kanda trigliserit yükselir.' }
      ]
    },
    {
      kisa: 'Alkol', baslik: 'Aç karnına alkol',
      durum: 'Uzun bir açlığın ardından birkaç kadeh. Etanol karaciğerde iki adımda yükseltgenir: alkol dehidrogenaz (etanol → asetaldehit) ve aldehit dehidrogenaz (asetaldehit → asetat). İki adım da NAD⁺ kullanır.',
      soru: 'Karaciğer hücresinde asıl değişen nedir?',
      secenek: ['NADH/NAD⁺ oranı yükselir', 'İnsülin yükselir', 'Hücrede ATP tükenir'], dogru: 0,
      sinyalNeden: 'Bu senaryoda sorun hormonal değil, redokstur. Her etanol molekülü iki NAD⁺’yı NADH’ye çevirir; sitozolde ve mitokondride NADH/NAD⁺ oranı yükselir ve NAD⁺ isteyen bütün tepkimeler geri itilir.',
      duzey: null, dusun: 'Yüksek NADH, NAD⁺ kullanan dehidrogenazları durdurur; NADH kullananları ise ileri iter. Bu yol hangisine bağlı?',
      madde: [
        { d: 'kc', yol: 'Glukoneogenez', y: -1, neden: 'Yüksek NADH pirüvatı laktata, okzaloasetatı malata çeker; glukoneogenezin başlangıç maddeleri kalmaz. Glikojeni tükenmiş (aç) kişide ciddi hipoglisemi gelişebilir.' },
        { d: 'kc', yol: 'Pirüvatın laktata indirgenmesi', y: 1, neden: 'Laktat dehidrogenaz dengesi NADH tarafından laktat yönüne itilir. Kan laktatı yükselir; laktat böbrekte ürat atılımıyla yarıştığı için gut atağını da tetikleyebilir.' },
        { d: 'kc', yol: 'Yağ asidi β-oksidasyonu', y: -1, neden: 'β-oksidasyonun 3-hidroksiaçil-CoA dehidrogenazı NAD⁺ ister. NADH birikince yol yavaşlar; yağ asitleri yakılamaz.' },
        { d: 'kc', yol: 'Triaçilgliserol sentezi', y: 1, neden: 'Yüksek NADH dihidroksiaseton fosfatı gliserol-3-fosfata indirger; yakılamayan yağ asitleri buna esterlenir. Alkole bağlı yağlı karaciğerin (steatoz) başlangıcı.' },
        { d: 'kc', yol: 'Krebs döngüsü', y: -1, neden: 'İzositrat dehidrogenaz, α-ketoglutarat dehidrogenaz ve malat dehidrogenaz yüksek NADH ile baskılanır. Kitabın ana fikri burada da geçerli: NADH/NAD⁺ oranı akışın yönünü belirler.' }
      ]
    }
  ];

  function kur() {
    var kok = document.getElementById('tokac-kok');
    var durum, aktif;
    function sifirla() {
      durum = SENARYO.map(function (s) {
        return { sinyal: null, sinyalIlk: null, sinyalDeneme: 0, sec: s.madde.map(function () { return 0; }), ilk: s.madde.map(function () { return null; }), kontrol: s.madde.map(function () { return null; }), kontrolSayi: 0, bitti: false };
      });
      aktif = 0;
    }
    sifirla();

    kok.innerHTML =
      '<div class="o-bas"><div><div class="o-ust">Oyun 4 · Vaka</div><h3 class="o-baslik">Tok mu, Aç mı?</h3>' +
      '<p class="o-alt">Her senaryoda önce baskın sinyali bul, sonra dokulardaki yolların artıp azaldığını işaretle. Yanlış yanıt elemez; ipucunu okuyup düzeltir, yeniden kontrol edersin.</p></div>' +
      '<div class="o-arac"><span class="ta-puan"></span><button class="o-btn" data-is="sifirla">↺ Baştan</button></div></div>' +
      '<div class="ta-sekme" role="tablist"></div><div class="ta-govde"></div>' +
      '<details class="o-not"><summary>Model notu</summary><ul>' +
      '<li>Yanıtlar, sağlıklı erişkinde her durumun baskın (net) yönünü gösterir; gerçekte yollar aç/kapa değil, kademeli düzenlenir ve dokular arasında zamanlama farkı vardır.</li>' +
      '<li>Sayısal değerler (kan glukozu, süreler) tipik ders kitabı değerleridir; kişiden kişiye değişir.</li>' +
      '<li>Hormon çubukları göreli düzeyi gösterir, ölçüm değeri değildir. Kortizol ve büyüme hormonu gibi yavaş etkili hormonlar sadelik için gösterilmemiştir.</li>' +
      '</ul></details>' +
      '<div class="o-perde"><div class="o-sonuc"></div></div>';

    var sekme = kok.querySelector('.ta-sekme'), govde = kok.querySelector('.ta-govde'), perde = kok.querySelector('.o-perde');

    function puan() {
      var al = 0, top = 0;
      SENARYO.forEach(function (s, i) {
        top += 1 + s.madde.length;
        if (durum[i].sinyalIlk === true) al++;
        durum[i].ilk.forEach(function (x) { if (x === true) al++; });
      });
      return { al: al, top: top };
    }

    function hormonHtml(dz) {
      if (!dz) return '';
      function satir(ad, n, renk) {
        var h = '';
        for (var i = 0; i < 3; i++) h += '<i class="' + (i < n ? 'dolu' : '') + '"></i>';
        return '<div class="ta-hormon" style="--renk:' + renk + '"><span>' + ad + '</span><div>' + h + '</div></div>';
      }
      return '<div class="ta-hormonlar">' + satir('İnsülin', dz.ins, '#34d399') + satir('Glukagon', dz.glu, '#f59e42') + satir('Adrenalin', dz.adr, '#f87171') + '</div>';
    }

    function ciz() {
      var s = SENARYO[aktif], d = durum[aktif], p = puan();
      kok.querySelector('.ta-puan').innerHTML = 'İlk denemede doğru: <b>' + p.al + '</b> / ' + p.top;
      sekme.innerHTML = SENARYO.map(function (x, i) {
        return '<button role="tab" class="' + (i === aktif ? 'aktif' : '') + (durum[i].bitti ? ' bitti' : '') + '" data-sen="' + i + '"><b>' + (durum[i].bitti ? '✓' : i + 1) + '</b>' + x.kisa + '</button>';
      }).join('');

      var h = '<div class="ta-vaka"><div class="ta-vaka-ust">Senaryo ' + (aktif + 1) + ' / ' + SENARYO.length + '</div><h4>' + s.baslik + '</h4><p>' + s.durum + '</p></div>';

      /* 1. soru: baskın sinyal */
      h += '<div class="o-panel ta-sinyal"><div class="o-panel-bas">1 · Sinyal</div><p class="ta-soru">' + s.soru + '</p><div class="ta-secenekler">' +
        s.secenek.map(function (ad, i) {
          var sinif = 'ta-sec';
          if (d.sinyal === i) sinif += i === s.dogru ? ' dogru' : ' yanlis';
          return '<button class="' + sinif + '" data-sinyal="' + i + '"' + (d.sinyal === s.dogru ? ' disabled' : '') + '>' + ad + '</button>';
        }).join('') + '</div>';
      if (d.sinyal === s.dogru) h += '<div class="ta-geri dogru">' + s.sinyalNeden + '</div>' + hormonHtml(s.duzey);
      else if (d.sinyal !== null) h += '<div class="ta-geri yanlis">Bu değil. Senaryodaki kan glukozuna ve enerji talebine yeniden bak, sonra tekrar seç.</div>';
      h += '</div>';

      /* 2. soru: yollar */
      var kilitli = d.sinyal !== s.dogru;
      h += '<div class="o-panel ta-yollar' + (kilitli ? ' kilitli' : '') + '"><div class="o-panel-bas">2 · Yollar ' + (kilitli ? '<span>(önce sinyali bul)</span>' : '') + '</div><ul>';
      s.madde.forEach(function (m, i) {
        var k = d.kontrol[i], dk = DOKU[m.d];
        h += '<li class="ta-madde' + (k === true ? ' dogru' : (k === false ? ' yanlis' : '')) + '">' +
          '<span class="ta-doku" style="--renk:' + dk.renk + '">' + dk.ad + '</span><span class="ta-yol">' + m.yol + '</span>' +
          '<span class="ta-dugme"><button class="' + (d.sec[i] === 1 ? 'secili' : '') + '" data-madde="' + i + '" data-yon="1" aria-pressed="' + (d.sec[i] === 1) + '"' + (k === true || kilitli ? ' disabled' : '') + '>↑ Artar</button>' +
          '<button class="' + (d.sec[i] === -1 ? 'secili' : '') + '" data-madde="' + i + '" data-yon="-1" aria-pressed="' + (d.sec[i] === -1) + '"' + (k === true || kilitli ? ' disabled' : '') + '>↓ Azalır</button></span>';
        if (k === true) h += '<p class="ta-neden">' + m.neden + '</p>';
        else if (k === false) h += '<p class="ta-neden ipucu">' + (d.sec[i] === 0 ? 'Henüz seçim yapmadın.' : 'Tekrar düşün: ' + s.dusun) + '</p>';
        h += '</li>';
      });
      h += '</ul><div class="ta-alt">';
      if (d.bitti) {
        h += '<span class="ta-tamam">Senaryo tamamlandı.</span>';
        h += aktif + 1 < SENARYO.length ? '<button class="o-btn ana" data-is="sonraki">Sonraki senaryo →</button>' : '<button class="o-btn ana" data-is="sonuc">Sonuçları gör</button>';
      } else {
        h += '<button class="o-btn ana" data-is="kontrol"' + (kilitli ? ' disabled' : '') + '>Kontrol et</button>';
        if (d.kontrolSayi >= 2) h += '<button class="o-btn" data-is="goster">Yanıtları göster</button>';
      }
      h += '</div></div>';
      govde.innerHTML = h;
    }

    function kontrolEt(goster) {
      var s = SENARYO[aktif], d = durum[aktif], hepsi = true;
      d.kontrolSayi++;
      s.madde.forEach(function (m, i) {
        if (goster && d.kontrol[i] !== true) { if (d.ilk[i] === null) d.ilk[i] = false; d.sec[i] = m.y; }
        var dogru = d.sec[i] === m.y;
        if (d.ilk[i] === null && d.sec[i] !== 0) d.ilk[i] = dogru; // boş bırakılan madde deneme sayılmaz
        d.kontrol[i] = dogru;
        if (!dogru) hepsi = false;
      });
      if (hepsi) d.bitti = true;
      ciz();
    }

    function sonuc() {
      var p = puan(), oran = p.al / p.top, y = oran >= 0.85 ? 3 : (oran >= 0.6 ? 2 : 1);
      Oyun.yildizVer('tokac', y);
      perde.querySelector('.o-sonuc').innerHTML =
        '<h4>Altı senaryo tamamlandı</h4><div class="yildizlar">' + Oyun.yildizMetni(y) + '</div>' +
        '<table><tr><td>İlk denemede doğru yanıt</td><td>' + p.al + ' / ' + p.top + '</td></tr><tr><td>Başarı</td><td>%' + Math.round(100 * oran) + '</td></tr></table>' +
        '<ul class="ogrenilen">' +
        '<li>İnsülin “depola ve inşa et”, glukagon “kan glukozunu koru”, adrenalin “şimdi yakıt ver” der; aynı yol farklı dokuda farklı sinyale bakar.</li>' +
        '<li>Sentez ve yıkım yolları karşılıklı düzenlenir: biri açılırken diğeri kapanır (glikojen sentaz ↔ fosforilaz, ACC ↔ CPT-I).</li>' +
        '<li>Tip 1 diyabet, hormonal açıdan uzamış açlığın abartılı bir kopyasıdır; alkol ise hormonu değil redoks dengesini (NADH/NAD⁺) bozar.</li>' +
        '<li>Diyet danışmanlığında “ne yendiği” kadar “hangi metabolik durumda yendiği” de önemlidir.</li></ul>' +
        '<div class="dugmeler"><button class="o-btn ana" data-is="sifirla">Baştan oyna</button><button class="o-btn" data-page="oyunlar">Oyun merkezi</button></div>' +
        '<p style="margin-top:10px;color:var(--soluk);font-size:13px">3 yıldız: ilk denemede %85 ve üzeri · 2 yıldız: %60 ve üzeri.</p>';
      perde.classList.add('acik');
    }

    kok.addEventListener('click', function (olay) {
      var t = olay.target, el, s = SENARYO[aktif], d = durum[aktif];
      if ((el = t.closest('[data-sen]'))) { aktif = +el.getAttribute('data-sen'); ciz(); return; }
      if ((el = t.closest('[data-sinyal]'))) {
        var i = +el.getAttribute('data-sinyal');
        d.sinyalDeneme++;
        if (d.sinyalIlk === null) d.sinyalIlk = i === s.dogru;
        d.sinyal = i; ciz(); return;
      }
      if ((el = t.closest('[data-madde]'))) {
        var m = +el.getAttribute('data-madde'), yon = +el.getAttribute('data-yon');
        d.sec[m] = d.sec[m] === yon ? 0 : yon;
        if (d.kontrol[m] === false) d.kontrol[m] = null;
        ciz(); return;
      }
      if ((el = t.closest('[data-is]'))) {
        var is = el.getAttribute('data-is');
        if (is === 'kontrol') kontrolEt(false);
        else if (is === 'goster') kontrolEt(true);
        else if (is === 'sonraki') { aktif++; ciz(); var ana = document.querySelector('.main-content'); if (ana) ana.scrollTop = 0; }
        else if (is === 'sonuc') {
          var eksik = -1;
          durum.forEach(function (x, j) { if (!x.bitti && eksik < 0) eksik = j; });
          if (eksik >= 0) { aktif = eksik; ciz(); } else sonuc();
        }
        else if (is === 'sifirla') { perde.classList.remove('acik'); sifirla(); ciz(); }
      }
    });

    ciz();
  }

  window.Oyun.kaydet('oyun-tokac', kur);
})();
