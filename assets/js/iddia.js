/* OYUN 5 — İddia mı, Kanıt mı?
   Yaygın beslenme iddiaları; her biri sistematik derleme ya da randomize çalışmalarla değerlendirilir.
   Her turda havuzdan 10 iddia gelir. Yanıtın ardından gerekçe ve PubMed kaynakları gösterilir. */
(function () {
  'use strict';
  var Oyun = window.Oyun;

  var HUKUM = { destek: 'Kanıt destekliyor', kismen: 'Kısmen / koşullu', red: 'Kanıt desteklemiyor' };

  /* kabul: tam doğru sayılan yanıtlar (ilk öğe asıl hüküm) */
  var IDDIA = [
    { m: 'Antioksidan vitamin takviyeleri (β-karoten, E vitamini) sağlıklı yetişkinlerde ölüm riskini azaltır.', kabul: ['red'],
      a: '78 randomize çalışmayı ve yaklaşık 297 000 katılımcıyı kapsayan Cochrane derlemesi ölümde azalma bulmadı. Yanlılık riski düşük çalışmalarda β-karoten ve E vitamini ölümü hafifçe artırdı. Reaktif oksijen türleri yalnızca hasar değil, aynı zamanda hücre içi sinyaldir.',
      k: [['22419320', 'Bjelakovic ve ark., 2012'], ['32231263', 'Sies ve Jones, 2020']] },
    { m: 'Kahvaltı yapmak kilo vermeyi kolaylaştırır.', kabul: ['red'],
      a: 'Randomize çalışmaların meta-analizinde kahvaltı yapanlar günde ortalama 260 kcal daha fazla enerji aldı ve kahvaltıyı atlayanlara göre 0,44 kg daha ağırdı. Çalışmaların kalitesi düşük; yine de kahvaltıyı kilo kaybı stratejisi olarak önermeyi destekleyen veri yok.',
      k: [['30700403', 'Sievert ve ark., 2019']] },
    { m: 'Günde altı küçük öğün, üç öğüne göre metabolizmayı hızlandırır.', kabul: ['red'],
      a: 'Besinin termik etkisi öğün sayısına değil, toplam alınan enerjiye ve makro besin bileşimine bağlıdır. Öğün sıklığının vücut bileşimine etkisini inceleyen meta-analizde görülen küçük etki tek bir çalışmadan kaynaklanıyordu.',
      k: [['15507147', 'Westerterp, 2004'], ['26024494', 'Schoenfeld ve ark., 2015']] },
    { m: 'Gebelik öncesinde ve erken gebelikte folik asit takviyesi nöral tüp defekti riskini azaltır.', kabul: ['destek'],
      a: 'Cochrane derlemesinde risk yaklaşık üçte bire iniyor (RR 0,31; yüksek kesinlik). Folat, tek karbon aktarımıyla timidilat ve pürin sentezinde gereklidir. Nöral tüp gebeliğin ilk dört haftasında kapandığı için takviye gebelikten önce başlamalıdır.',
      k: [['26662928', 'De-Regil ve ark., 2015'], ['1677062', 'MRC Vitamin Study, 1991']] },
    { m: 'Tuz alımını azaltmak kan basıncını düşürür.', kabul: ['destek'],
      a: 'Meta-analiz: günde ortalama 4,4 g tuz azaltımı sistolik kan basıncını yaklaşık 4, diyastolik kan basıncını 2 mmHg düşürdü; etki hipertansiflerde daha büyüktü. DASH-Sodyum çalışması doz-yanıt ilişkisini gösterdi.',
      k: [['23558162', 'He ve ark., 2013'], ['11136953', 'Sacks ve ark., 2001']] },
    { m: 'Eşit kalorili bir diyette fruktoz, diğer karbonhidratlardan daha fazla kilo aldırır.', kabul: ['red', 'kismen'],
      a: 'Eşit kalorili değişim çalışmalarında fark yok; kilo artışı fruktoz fazladan enerji olarak eklendiğinde görülüyor. Yüksek dozda fruktozun karaciğerde yağ sentezini ve viseral yağı artırdığı ise gösterilmiştir: sorun doz ve enerji fazlasıdır.',
      k: [['22351714', 'Sievenpiper ve ark., 2012'], ['19381015', 'Stanhope ve ark., 2009']] },
    { m: 'Detoks diyetleri ve kürleri vücuttan toksinleri temizler.', kabul: ['red'],
      a: 'Detoks diyetlerinin toksin atılımını artırdığını ya da kalıcı kilo kaybı sağladığını gösteren, yöntemi sağlam bir klinik çalışma yok. Yabancı maddelerin dönüştürülmesi ve atılması karaciğerin (sitokrom P450, konjugasyon) ve böbreğin sürekli yaptığı iştir.',
      k: [['25522674', 'Klein ve Kiat, 2015']] },
    { m: 'C vitamini takviyesi soğuk algınlığına yakalanmayı önler.', kabul: ['kismen', 'red'],
      a: 'Genel toplumda düzenli takviye yakalanma sıklığını azaltmaz; hastalık süresini yetişkinlerde yaklaşık %8, çocuklarda %14 kısaltır. Kısa süreli ağır fiziksel stres altındakilerde (maratoncular, kayakçılar) risk yarıya iner. Belirtiler başladıktan sonra alınması tutarlı bir yarar göstermemiştir.',
      k: [['23440782', 'Hemilä ve Chalker, 2013']] },
    { m: 'Yüksek proteinli beslenme sağlıklı kişilerde böbrek işlevini bozar.', kabul: ['red'],
      a: 'Randomize çalışmaların meta-analizinde yüksek protein alımı sağlıklı yetişkinlerde glomerüler filtrasyon hızını olumsuz etkilemedi. Kronik böbrek hastalığında protein kısıtlaması ise ayrı bir konudur.',
      k: [['30383278', 'Devries ve ark., 2018']] },
    { m: 'Akdeniz tipi beslenme kalp-damar olaylarını azaltır.', kabul: ['destek', 'kismen'],
      a: 'PREDIMED çalışmasında, yüksek riskli yetişkinlerde zeytinyağı ya da kuruyemişle zenginleştirilmiş Akdeniz diyeti büyük kardiyovasküler olayları yaklaşık %30 azalttı. Cochrane derlemesi kanıtın kesinliğini düşük ile orta arasında değerlendiriyor; bu yüzden “kısmen” yanıtı da kabul edilir.',
      k: [['29897866', 'Estruch ve ark., 2018'], ['30864165', 'Rees ve ark., 2019']] },
    { m: 'Ketojenik diyet, ilaca dirençli epilepsili çocuklarda nöbetleri azaltabilir.', kabul: ['destek', 'kismen'],
      a: 'Cochrane derlemesinde nöbetlerde en az %50 azalma olasılığı olağan bakıma göre belirgin yüksek (RR 5,80); ancak çalışmalar küçük ve kanıt kesinliği düşük. Uluslararası uzlaşı raporu ketojenik diyeti tedavi seçeneği olarak önerir.',
      k: [['32588435', 'Martin-McGill ve ark., 2020'], ['29881797', 'Kossoff ve ark., 2018']] },
    { m: 'Zaman kısıtlı beslenme (16:8), aynı kalori kısıtlamasına göre daha fazla kilo verdirir.', kabul: ['red'],
      a: '139 obez yetişkinde 12 ay süren çalışmada zaman kısıtlaması eklenen grup 8,0 kg, yalnız kalori kısıtlayan grup 6,3 kg verdi; fark anlamlı değildi. Cochrane derlemesi de aralıklı oruç ile sürekli enerji kısıtlaması arasında klinik olarak anlamlı fark bulmadı.',
      k: [['35443107', 'Liu ve ark., 2022'], ['33512717', 'Allaf ve ark., 2021'], ['32986097', 'Lowe ve ark., 2020']] },
    { m: 'Diyet lifini çok tüketenlerde kalp-damar hastalığı ve tip 2 diyabet daha az görülür.', kabul: ['destek'],
      a: '185 prospektif çalışma ve 58 klinik çalışmayı kapsayan derlemede en çok lif tüketenlerde tüm nedenlere bağlı ölüm, koroner kalp hastalığı, inme, tip 2 diyabet ve kolorektal kanser %15–30 daha azdı. En belirgin yarar günde 25–29 g alımda görüldü.',
      k: [['30638909', 'Reynolds ve ark., 2019']] },
    { m: 'Doymuş yağ alımını azaltmak kalp-damar olaylarını azaltır.', kabul: ['destek', 'kismen'],
      a: 'Cochrane derlemesi (15 randomize çalışma): birleşik kardiyovasküler olaylarda %21 azalma (orta kesinlik); toplam ölümde belirgin etki yok. Sonucu, doymuş yağın yerine ne konduğu etkiler; bu yüzden “kısmen” yanıtı da kabul edilir.',
      k: [['32428300', 'Hooper ve ark., 2020'], ['28620111', 'Sacks ve ark., 2017']] },
    { m: 'Glisemik indeksi düşük olan her besin sağlıklı bir seçimdir.', kabul: ['red'],
      a: 'Glisemik indeks yalnızca kan glukozu yanıtını ölçer. Yağ ve fruktoz indeksi düşürdüğü için bazı tatlıların indeksi birçok meyveninkinden düşüktür. Porsiyondaki karbonhidratı da hesaba katan glisemik yük ve besinin genel bileşimi birlikte değerlendirilir.',
      k: [['34258626', 'Atkinson ve ark., 2021']] },
    { m: 'Tip 2 diyabet bir kez başladıktan sonra geri döndürülemez; yalnızca ilerlemesi yavaşlatılabilir.', kabul: ['red', 'kismen'],
      a: 'DiRECT çalışmasında, tanısı en çok 6 yıllık olan ve yoğun kilo yönetimi programına alınan yetişkinlerin %46\'sında 12 ayda ilaçsız remisyon sağlandı; en az 15 kg verenlerde bu oran %86 idi. İki yılın sonunda remisyon %36\'ya indi: kilo geri alındıkça diyabet de döner. Uzun süreli diyabette ve β hücresi rezervi tükenmiş kişilerde olasılık düşüktür; bu yüzden “kısmen” yanıtı da kabul edilir.',
      k: [['29221645', 'Lean ve ark., 2018'], ['30852132', 'Lean ve ark., 2019'], ['30078554', 'Taylor ve ark., 2018']] },
    { m: 'Bademin etiketinde yazan enerji, vücudun ondan gerçekten elde ettiği enerjiye eşittir.', kabul: ['red'],
      a: 'Kontrollü beslenme çalışmasında bademin ölçülen metabolize edilebilir enerjisi 4,6 kcal/g bulundu; Atwater katsayılarıyla hesaplanan etiket değeri 6,0–6,1 kcal/g idi. Hücre duvarı içinde kalan yağın bir bölümü emilmeden atılır: etiket değeri %32 fazla tahmin eder.',
      k: [['22760558', 'Novotny ve ark., 2012']] }
  ];
  var TUR_BOYU = 10;

  function kur() {
    var kok = document.getElementById('iddia-kok');
    var d;

    kok.innerHTML =
      '<div class="o-bas"><div><div class="o-ust">Oyun 5 · Kanıt okuryazarlığı</div><h3 class="o-baslik">İddia mı, Kanıt mı?</h3>' +
      '<p class="o-alt">Sık duyulan on beslenme iddiası. Her biri için bugünkü kanıtın ne dediğini seç; yanıtın ardından gerekçeyi ve çalışmaların PubMed bağlantılarını gör. Havuzda ' + IDDIA.length + ' iddia var, her turda farklı on tanesi gelir.</p></div>' +
      '<div class="o-arac"><span class="id-puan"></span><button class="o-btn" data-is="yeni">↺ Yeni tur</button></div></div>' +
      '<div class="id-ilerleme"></div><div class="id-govde"></div>' +
      '<details class="o-not"><summary>Hükümler nasıl verildi?</summary><ul>' +
      '<li>Her hüküm, konuyla ilgili en güncel sistematik derlemeye ya da en büyük randomize çalışmaya dayanır; kaynaklar yanıtın altında listelenir.</li>' +
      '<li>“Kanıt destekliyor” mutlak kesinlik demek değildir: kanıtın kesinliği düşük ya da orta olduğunda açıklamada belirtilir ve “kısmen” yanıtı da doğru sayılır.</li>' +
      '<li>“Kanıt desteklemiyor”, iddianın yanlışlığının kanıtlandığı anlamına gelmeyebilir; iddiayı destekleyen yeterli veri bulunmadığını gösterir.</li>' +
      '<li>Bilim güncellenir. Hükümler Kasım 2026 itibarıyla literatürü yansıtır; yeni çalışmalar sonucu değiştirebilir.</li></ul></details>' +
      '<div class="o-perde"><div class="o-sonuc"></div></div>';

    var govde = kok.querySelector('.id-govde'), ilerleme = kok.querySelector('.id-ilerleme'), perde = kok.querySelector('.o-perde');

    function yeni() {
      d = { liste: Oyun.karistir(IDDIA).slice(0, TUR_BOYU), i: 0, yanit: [], secim: null };
      perde.classList.remove('acik');
      ciz();
    }
    function dogruSayisi() { return d.yanit.filter(function (y) { return y; }).length; }

    function ciz() {
      var x = d.liste[d.i], yanitlandi = d.secim !== null;
      kok.querySelector('.id-puan').innerHTML = 'Doğru: <b>' + dogruSayisi() + '</b> / ' + d.yanit.length;
      ilerleme.innerHTML = d.liste.map(function (_, j) {
        var s = j < d.yanit.length ? (d.yanit[j] ? 'dogru' : 'yanlis') : (j === d.i ? 'simdi' : '');
        return '<i class="' + s + '"></i>';
      }).join('');

      var h = '<div class="id-kart"><div class="id-no">İddia ' + (d.i + 1) + ' / ' + d.liste.length + '</div><blockquote>“' + x.m + '”</blockquote>' +
        '<div class="id-secenek">' + ['destek', 'kismen', 'red'].map(function (k) {
          var sinif = 'id-btn ' + k;
          if (yanitlandi) {
            if (k === x.kabul[0]) sinif += ' asil';
            else if (x.kabul.indexOf(k) > 0) sinif += ' kabul';
            if (k === d.secim) sinif += ' secilen';
          }
          return '<button class="' + sinif + '" data-y="' + k + '"' + (yanitlandi ? ' disabled' : '') + '>' + HUKUM[k] + '</button>';
        }).join('') + '</div>';

      if (yanitlandi) {
        var dogru = x.kabul.indexOf(d.secim) >= 0;
        h += '<div class="id-geri ' + (dogru ? 'dogru' : 'yanlis') + '"><div class="id-sonuc-bas">' + (dogru ? '✓ Doğru' : '✗ Bu kez değil') + ' · Hüküm: <b>' + HUKUM[x.kabul[0]] + '</b></div>' +
          '<p>' + x.a + '</p><div class="id-kaynak"><span>Kaynak:</span>' + x.k.map(function (r) {
            return '<a href="https://pubmed.ncbi.nlm.nih.gov/' + r[0] + '/" target="_blank" rel="noopener">' + r[1] + '</a>';
          }).join('') + '</div></div>' +
          '<div class="id-alt"><button class="o-btn ana" data-is="sonraki">' + (d.i + 1 < d.liste.length ? 'Sonraki iddia →' : 'Sonuçları gör') + '</button></div>';
      } else {
        h += '<p class="id-ipucu">İpucu: “bir çalışma gösterdi” ile “sistematik derleme gösterdi” aynı ağırlıkta değildir.</p>';
      }
      govde.innerHTML = h + '</div>';
    }

    function bitir() {
      var n = dogruSayisi(), y = n >= 9 ? 3 : (n >= 6 ? 2 : 1);
      Oyun.yildizVer('iddia', y);
      var kacan = d.liste.filter(function (_, j) { return !d.yanit[j]; });
      perde.querySelector('.o-sonuc').innerHTML =
        '<h4>Tur tamamlandı</h4><div class="yildizlar">' + Oyun.yildizMetni(y) + '</div>' +
        '<table><tr><td>Doğru yanıt</td><td>' + n + ' / ' + d.liste.length + '</td></tr></table>' +
        (kacan.length ? '<p style="margin:8px 0 4px;font-weight:700">Yeniden bakmaya değer:</p><ul class="ogrenilen">' + kacan.map(function (x) { return '<li>' + x.m + ' <b>' + HUKUM[x.kabul[0]] + '.</b></li>'; }).join('') + '</ul>'
          : '<ul class="ogrenilen"><li>Hepsi doğru. Havuzda başka iddialar da var: yeni tur farklı sorular getirir.</li></ul>') +
        '<div class="dugmeler"><button class="o-btn ana" data-is="yeni">Yeni tur</button><button class="o-btn" data-page="kaynak">Kanıt nasıl aranır?</button><button class="o-btn" data-page="oyunlar">Oyun merkezi</button></div>' +
        '<p style="margin-top:10px;color:var(--soluk);font-size:13px">3 yıldız: 9 ve üzeri doğru · 2 yıldız: 6 ve üzeri.</p>';
      perde.classList.add('acik');
    }

    kok.addEventListener('click', function (olay) {
      var el;
      if ((el = olay.target.closest('[data-y]'))) {
        if (d.secim !== null) return;
        d.secim = el.getAttribute('data-y');
        d.yanit.push(d.liste[d.i].kabul.indexOf(d.secim) >= 0);
        ciz(); return;
      }
      if ((el = olay.target.closest('[data-is]'))) {
        var is = el.getAttribute('data-is');
        if (is === 'yeni') yeni();
        else if (is === 'sonraki') {
          if (d.i + 1 < d.liste.length) { d.i++; d.secim = null; ciz(); } else bitir();
        }
      }
    });

    yeni();
  }

  window.Oyun.kaydet('oyun-iddia', kur);
})();
