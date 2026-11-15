/* Kaynak rehberi: veri tabanları, rehberler, kanıt araçları ve videolar.
   b: tr = Türkiye, av = Avrupa, dn = Dünya. Bağlantılar Kasım 2026'da derlendi. */
(function () {
  'use strict';

  var BOLGE = { tr: 'Türkiye', av: 'Avrupa', dn: 'Dünya' };

  var GRUP = [
    { ad: 'Besin bileşimi veri tabanları', not: 'Bir besinin enerji ve besin öğesi içeriği için birincil kaynak. Ülkeler arasında çeşit, toprak ve analiz yöntemi farkı olduğundan mümkünse yerel veri kullanılır.', oge: [
      ['TürKomp · Ulusal Gıda Kompozisyon Veri Tabanı', 'https://www.turkomp.gov.tr', 'Tarım ve Orman Bakanlığı. Türkiye\'de tüketilen gıdaların analizle belirlenmiş enerji ve besin öğesi değerleri; besine ve bileşene göre arama. Türkçe ve İngilizce.', 'tr'],
      ['USDA FoodData Central', 'https://fdc.nal.usda.gov', 'ABD Tarım Bakanlığı. En kapsamlı açık besin bileşimi kaynağı; indirilebilir veri setleri ve API.', 'dn'],
      ['FAO/INFOODS', 'https://www.fao.org/infoods/infoods/en/', 'Ülke ve bölge besin bileşim tablolarının dizini; veri derleme standartları ve yoğunluk, biyoçeşitlilik gibi özel tablolar.', 'dn'],
      ['EuroFIR FoodEXplorer', 'https://www.eurofir.org/our-tools/foodexplorer/', 'Avrupa ülkelerinin ulusal veri tabanlarında ortak arama ve karşılaştırma (Türkiye verisi dahil). Tam erişim üyelik gerektirebilir.', 'av'],
      ['CIQUAL (Fransa)', 'https://ciqual.anses.fr', 'ANSES\'in ulusal besin bileşim tablosu; İngilizce arayüz, indirilebilir.', 'av'],
      ['CoFID · McCance ve Widdowson (Birleşik Krallık)', 'https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid', 'Birleşik Krallık\'ın bütünleşik besin bileşimi veri seti; Excel olarak indirilebilir.', 'av'],
      ['Frida (Danimarka)', 'https://frida.fooddata.dk', 'Danimarka Teknik Üniversitesi Ulusal Gıda Enstitüsü veri tabanı; İngilizce.', 'av'],
      ['NEVO (Hollanda)', 'https://nevo-online.rivm.nl', 'RIVM\'in ulusal besin bileşim tablosu; İngilizce arayüz.', 'av'],
      ['Phenol-Explorer', 'http://phenol-explorer.eu', 'Besinlerin polifenol içeriği, işleme sırasındaki kayıplar ve insan metabolitleri.', 'dn'],
      ['FooDB', 'https://foodb.ca', 'Besinlerdeki kimyasal bileşenler: makro ve mikro besinler ile ikincil metabolitler.', 'dn'],
      ['Glisemik indeks veri tabanı', 'https://glycemicindex.com', 'Sydney Üniversitesi. Standart yöntemle ölçülmüş glisemik indeks değerleri.', 'dn'],
      ['Open Food Facts', 'https://world.openfoodfacts.org', 'Ambalajlı ürünlerin etiket verisi. Kullanıcı katkılıdır: araştırmada kullanmadan önce etiketle doğrulanmalıdır.', 'dn']
    ] },
    { ad: 'Referans değerler ve beslenme rehberleri', not: 'Gereksinim ve öneri değerleri kurumlar arasında küçük farklar gösterir; hangi kurumun değerinin kullanıldığı her zaman belirtilmelidir.', oge: [
      ['Türkiye Beslenme Rehberi (TÜBER) 2022', 'https://hsgm.saglik.gov.tr/media/attachments/2025/05/12/turkiye-beslenme-rehberi-2022.pdf', 'Sağlık Bakanlığı. Yaş, cinsiyet ve fizyolojik duruma göre enerji ve besin öğesi gereksinimleri, besin grupları ve porsiyonlar (PDF).', 'tr'],
      ['EFSA · Diyet Referans Değerleri', 'https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values', 'Avrupa Gıda Güvenliği Otoritesi. Besin öğelerine ilişkin bilimsel görüşler ve değerleri nüfus grubuna göre gösteren DRV Finder aracı.', 'av'],
      ['Nordic Nutrition Recommendations 2023', 'https://pub.norden.org/nord2023-003/', 'İskandinav ve Baltık ülkelerinin ortak önerileri; sağlık ile birlikte çevresel etkiyi de değerlendiren ilk baskı.', 'av'],
      ['NIH · Besin öğesi önerileri ve DRI tabloları', 'https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx', 'ABD Ulusal Akademilerinin Dietary Reference Intakes tablolarına ve raporlarına erişim.', 'dn'],
      ['DSÖ · Sağlıklı beslenme', 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet', 'Dünya Sağlık Örgütü\'nün serbest şeker, tuz, doymuş ve trans yağ, lif önerilerinin özeti ve ilgili rehberlere bağlantılar.', 'dn'],
      ['DSÖ eLENA', 'https://www.who.int/tools/elena', 'Beslenme müdahalelerine ilişkin kanıt kütüphanesi: her müdahale için rehber, sistematik derleme ve gerekçe.', 'dn'],
      ['Dietary Guidelines for Americans', 'https://www.dietaryguidelines.gov', 'ABD beslenme rehberi ve dayandığı bilimsel danışma kurulu raporu.', 'dn'],
      ['FAO · Ülkelerin besine dayalı beslenme rehberleri', 'https://www.fao.org/nutrition/education/food-dietary-guidelines/en/', 'Yüzü aşkın ülkenin ulusal rehberi ve görsel modelleri (piramit, tabak) bir arada.', 'dn']
    ] },
    { ad: 'Türkiye: veri, kurumlar ve Türkçe literatür', not: '', oge: [
      ['Türkiye Beslenme ve Sağlık Araştırması (TBSA) 2017', 'https://hsgm.saglik.gov.tr/depo/birimler/saglikli-beslenme-ve-hareketli-hayat-db/Dokumanlar/Kitaplar/TBSA_2017_Ozet_Bulgular.pdf', 'Sağlık Bakanlığı. Ülke temsiliyetine sahip besin tüketimi, antropometri ve biyokimya bulgularının özeti (PDF).', 'tr'],
      ['Halk Sağlığı Genel Müdürlüğü', 'https://hsgm.saglik.gov.tr', 'Sağlıklı Beslenme ve Hareketli Hayat Dairesi yayınları: tuz, şeker, obezite ve diyabet programları.', 'tr'],
      ['Türkiye Diyetisyenler Derneği', 'https://www.tdd.org.tr', 'Meslek örgütü; Beslenme ve Diyet Dergisi, kitaplar ve görüş yazıları.', 'tr'],
      ['KEPAN', 'https://www.kepan.org.tr', 'Klinik Enteral Parenteral Nütrisyon Derneği; klinik beslenme eğitimleri ve yayınları.', 'tr'],
      ['TEMD kılavuzları', 'https://temd.org.tr', 'Türkiye Endokrinoloji ve Metabolizma Derneği; diyabet, obezite ve lipid kılavuzları.', 'tr'],
      ['DergiPark', 'https://dergipark.org.tr', 'Türkiye\'de yayımlanan akademik dergilerin açık erişim platformu.', 'tr'],
      ['TR Dizin', 'https://trdizin.gov.tr', 'TÜBİTAK ULAKBİM ulusal atıf dizini; Türkçe hakemli yayın araması.', 'tr'],
      ['YÖK Ulusal Tez Merkezi', 'https://tez.yok.gov.tr/UlusalTezMerkezi/', 'Türkiye\'de tamamlanan yüksek lisans ve doktora tezleri.', 'tr']
    ] },
    { ad: 'Klinik beslenme rehberleri', not: '', oge: [
      ['ESPEN kılavuzları', 'https://www.espen.org/guidelines-home/espen-guidelines', 'Avrupa Klinik Beslenme ve Metabolizma Derneği; hastalığa özgü kılavuzlar (kanser, yoğun bakım, karaciğer, böbrek, geriatri).', 'av'],
      ['EFAD', 'https://www.efad.org', 'Avrupa Diyetisyen Dernekleri Federasyonu; mesleki standartlar ve görüş belgeleri.', 'av'],
      ['NICE rehberleri', 'https://www.nice.org.uk/guidance', 'Birleşik Krallık; kanıt özetleri ve maliyet-etkililik değerlendirmesiyle klinik rehberler.', 'av'],
      ['ASPEN', 'https://www.nutritioncare.org', 'Amerikan Parenteral ve Enteral Nütrisyon Derneği; kılavuzlar ve uygulama standartları.', 'dn'],
      ['Evidence Analysis Library', 'https://www.andeal.org', 'Amerikan Beslenme ve Diyetetik Akademisi; soru bazlı kanıt özetleri. Tam erişim üyelik gerektirir.', 'dn']
    ] },
    { ad: 'Kanıt arama ve değerlendirme', not: 'Bir iddiayı doğrulamanın yolu: önce sistematik derleme ara, yoksa randomize çalışmalara, o da yoksa gözlemsel veriye bak.', oge: [
      ['PubMed', 'https://pubmed.ncbi.nlm.nih.gov', 'Biyomedikal literatür araması. “Clinical Queries” ve yayın türü süzgeçleri (Meta-Analysis, Randomized Controlled Trial) işi hızlandırır.', 'dn'],
      ['Cochrane Library', 'https://www.cochranelibrary.com', 'Sistematik derlemeler; özetler ve “plain language summary” bölümleri ücretsiz.', 'dn'],
      ['Epistemonikos', 'https://www.epistemonikos.org', 'Sağlık alanındaki sistematik derlemelerin çok dilli veri tabanı; derleme ile içerdiği çalışmaları ilişkilendirir.', 'dn'],
      ['ClinicalTrials.gov', 'https://clinicaltrials.gov', 'Kayıtlı klinik çalışmalar. Yayımlanmamış ya da süren çalışmaları ve önceden belirtilen sonlanımları görmek için.', 'dn'],
      ['GRADE Çalışma Grubu', 'https://www.gradeworkinggroup.org', 'Kanıt kesinliğini ve öneri gücünü derecelendirme yöntemi.', 'dn'],
      ['EQUATOR Network', 'https://www.equator-network.org', 'Raporlama kılavuzları: CONSORT (RKÇ), PRISMA (sistematik derleme), STROBE-nut (beslenme epidemiyolojisi).', 'dn']
    ] },
    { ad: 'Takviyeler ve sağlık beyanları', not: '', oge: [
      ['NIH Office of Dietary Supplements', 'https://ods.od.nih.gov/factsheets/list-all/', 'Vitamin, mineral ve bitkisel takviyeler için kaynaklı bilgi notları; sağlık çalışanı sürümleri doz, etkileşim ve üst sınır içerir.', 'dn'],
      ['AB Beslenme ve Sağlık Beyanları Sicili', 'https://ec.europa.eu/food/food-feed-portal/screen/health-claims/eu-register', 'Avrupa Komisyonu. Onaylanan ve reddedilen sağlık beyanları; bir ürün iddiasının yasal ve bilimsel durumunu denetlemek için.', 'av'],
      ['EFSA', 'https://www.efsa.europa.eu', 'Sağlık beyanları, yeni gıdalar, katkı maddeleri ve üst alım sınırlarına ilişkin bilimsel görüşler.', 'av']
    ] },
    { ad: 'Beslenme epidemiyolojisi ve izleme', not: '', oge: [
      ['Global Dietary Database', 'https://www.globaldietarydatabase.org', 'Tufts Üniversitesi. Ülke, yaş ve cinsiyete göre besin ve besin öğesi alım tahminleri.', 'dn'],
      ['FAOSTAT', 'https://www.fao.org/faostat/', 'Ülkelerin gıda arzı (besin dengesi tabloları), üretim ve ticaret verisi.', 'dn'],
      ['NCD-RisC', 'https://www.ncdrisc.org', 'Ülkelere göre BKİ, kan basıncı, diyabet ve kolesterol eğilimleri; indirilebilir veri ve grafikler.', 'dn'],
      ['DSÖ Küresel Sağlık Gözlemevi', 'https://www.who.int/data/gho', 'Beslenme durumu, anemi, obezite ve bulaşıcı olmayan hastalık göstergeleri.', 'dn'],
      ['Global Nutrition Report', 'https://globalnutritionreport.org', 'Ülke beslenme profilleri ve küresel hedeflere göre ilerleme.', 'dn'],
      ['EFSA Besin Tüketim Veri Tabanı', 'https://www.efsa.europa.eu/en/data-report/food-consumption-data', 'Avrupa ülkelerinin ulusal tüketim araştırmalarından derlenmiş besin tüketim istatistikleri.', 'av'],
      ['NHANES', 'https://www.cdc.gov/nchs/nhanes/', 'ABD ulusal sağlık ve beslenme araştırması; açık erişimli bireysel veri.', 'dn']
    ] },
    { ad: 'Biyokimya ve metabolizma veri tabanları', not: 'Oyunlardaki yolları ve enzimleri birincil kaynaktan incelemek için.', oge: [
      ['KEGG PATHWAY', 'https://www.genome.jp/kegg/pathway.html', 'Metabolik yol haritaları; glikoliz, Krebs döngüsü ve oksidatif fosforilasyon haritaları enzim ve gen bağlantılıdır.', 'dn'],
      ['Reactome', 'https://reactome.org', 'İnsan metabolik ve sinyal yolları; hakemli, tepkime düzeyinde açıklamalı.', 'dn'],
      ['BRENDA', 'https://www.brenda-enzymes.org', 'Enzim veri tabanı: K<sub>m</sub>, k<sub>cat</sub>, inhibitörler, kofaktörler ve kaynak yayınlar.', 'av'],
      ['HMDB', 'https://hmdb.ca', 'İnsan metabolom veri tabanı: metabolitlerin derişimleri, yolları ve ilişkili hastalıklar.', 'dn'],
      ['Virtual Metabolic Human', 'https://www.vmh.life', 'İnsan ve bağırsak mikrobiyomu metabolizmasının genom ölçekli modeli; besin ve diyet tasarımı modülü içerir.', 'av'],
      ['OMIM', 'https://www.omim.org', 'Kalıtsal hastalıklar kataloğu: doğuştan metabolizma hastalıklarının genleri ve klinik bulguları.', 'dn'],
      ['RCSB Protein Data Bank', 'https://www.rcsb.org', 'Protein yapıları. 3B oyundaki komplekslerin gerçek yapıları aşağıdadır.', 'dn']
    ] }
  ];

  var YAPI = [
    ['5LNK', 'Kompleks I', 'koyun kalbi, kriyo-EM'], ['1ZOY', 'Kompleks II', 'domuz kalbi, X-ışını'],
    ['1BE3', 'Kompleks III', 'sığır kalbi, X-ışını'], ['1OCC', 'Kompleks IV', 'sığır kalbi, X-ışını'], ['5ARA', 'ATP sentaz', 'sığır kalbi, kriyo-EM']
  ];

  var VIDEO = [
    ['Nick Lane · How the Krebs cycle powers life and death', 'https://www.youtube.com/watch?v=vBiIDwBOqQA', 'Royal Institution konuşması (2022, yaklaşık 56 dakika, İngilizce). Kitabın yazarı; döngünün iki yönü, kanser ve hidrotermal bacalar.', 'YouTube'],
    ['WEHI.TV · Elektron taşıma zinciri', 'https://www.wehi.edu.au/wehi-tv/electron-transport-chain-respiration-series/', 'Drew Berry\'nin yapısal veriye dayalı moleküler animasyonu. 3B oyundaki sahnenin gerçeğe en yakın görseli.', 'Animasyon'],
    ['WEHI.TV · ATP sentezi', 'https://www.wehi.edu.au/wehi-tv/synthesis-atp', 'ATP sentazın dönel mekanizması; proton gradyanının mekanik işe çevrilmesi.', 'Animasyon'],
    ['MIT OpenCourseWare · 7.05 General Biochemistry', 'https://ocw.mit.edu/courses/7-05-general-biochemistry-spring-2020/video_galleries/video-lectures', 'Matthew Vander Heiden\'ın metabolizma dersleri: biyoenerjetik, glikoliz, Krebs döngüsü, oksidatif fosforilasyon. Ücretsiz, İngilizce.', 'Ders'],
    ['Khan Academy · Krebs / citric acid cycle', 'https://www.youtube.com/watch?v=juM2ROSLWfw', 'Döngünün adım adım anlatımı; başlangıç düzeyi için uygun (İngilizce, altyazı seçenekli).', 'YouTube'],
    ['Khan Academy Türkçe · hücresel solunum', 'https://tr.khanacademy.org/search?page_search_query=h%C3%BCcresel%20solunum', 'Türkçe ders ve alıştırmalar (site içi arama bağlantısı).', 'Türkçe'],
    ['iBiology', 'https://www.ibiology.org', 'Araştırmacıların kendi alanlarını anlattığı ücretsiz konuşmalar; metabolizma ve mitokondri başlıkları.', 'Ders'],
    ['HHMI BioInteractive', 'https://www.biointeractive.org', 'Sınıfta kullanılabilir animasyonlar, veri etkinlikleri ve sanal laboratuvarlar.', 'Ders'],
    ['YouTube araması · Nick Lane, Talks at Google', 'https://www.youtube.com/results?search_query=Nick+Lane+Deep+Chemistry+of+Life+and+Death+Talks+at+Google', 'Kitabın daha kısa bir sunumu (arama bağlantısı).', 'Arama'],
    ['YouTube araması · Ninja Nerd, metabolizma', 'https://www.youtube.com/results?search_query=Ninja+Nerd+metabolism+glycolysis+krebs+electron+transport+chain', 'Tahtada ayrıntılı biyokimya dersleri (arama bağlantısı).', 'Arama']
  ];

  function kur() {
    var kok = document.getElementById('kaynak-kok');
    var bolge = 'hepsi', sorgu = '';

    kok.innerHTML =
      '<div class="ky-arac"><div class="ky-cipler" role="tablist">' +
      '<button class="aktif" data-b="hepsi">Tümü</button><button data-b="tr">Türkiye</button><button data-b="av">Avrupa</button><button data-b="dn">Dünya</button></div>' +
      '<input type="search" class="ky-ara" placeholder="Kaynaklarda ara (ör. protein, etiket, kılavuz)" aria-label="Kaynaklarda ara"></div>' +
      '<div class="ky-liste"></div>' +
      '<section class="ky-grup"><h3>3B oyundaki komplekslerin gerçek yapıları</h3><p class="ky-not">RCSB Protein Data Bank kayıtları; sayfadaki “3D View” sekmesinden yapıyı döndürerek inceleyebilirsin.</p><div class="ky-yapilar">' +
      YAPI.map(function (y) { return '<a href="https://www.rcsb.org/structure/' + y[0] + '" target="_blank" rel="noopener"><b>' + y[0] + '</b><span>' + y[1] + '</span><small>' + y[2] + '</small></a>'; }).join('') + '</div></section>' +
      '<section class="ky-grup"><h3>Videolar ve açık dersler</h3><p class="ky-not">Kitabın konularını görsel olarak pekiştirmek için. Tümü ücretsiz.</p><div class="ky-kartlar">' +
      VIDEO.map(function (v) { return '<a class="ky-kart" href="' + v[1] + '" target="_blank" rel="noopener"><span class="ky-et video">' + v[3] + '</span><b>' + v[0] + '</b><p>' + v[2] + '</p></a>'; }).join('') + '</div></section>' +
      '<p class="bes-dipnot">Bağlantılar Kasım 2026\'da derlendi. Kurumlar adreslerini değiştirebilir; açılmayan bir bağlantıda kurumun ana sayfasından arama yap. Kaynakların listede yer alması, içeriklerinin tümüyle onaylandığı anlamına gelmez: her kaynak kendi yöntemiyle değerlendirilmelidir.</p>';

    var liste = kok.querySelector('.ky-liste');

    function ciz() {
      var q = sorgu.toLocaleLowerCase('tr-TR'), toplam = 0;
      liste.innerHTML = GRUP.map(function (g) {
        var uygun = g.oge.filter(function (o) {
          if (bolge !== 'hepsi' && o[3] !== bolge) return false;
          if (q && (o[0] + ' ' + o[2] + ' ' + g.ad).toLocaleLowerCase('tr-TR').indexOf(q) < 0) return false;
          return true;
        });
        if (!uygun.length) return '';
        toplam += uygun.length;
        return '<section class="ky-grup"><h3>' + g.ad + '</h3>' + (g.not ? '<p class="ky-not">' + g.not + '</p>' : '') + '<div class="ky-kartlar">' +
          uygun.map(function (o) { return '<a class="ky-kart" href="' + o[1] + '" target="_blank" rel="noopener"><span class="ky-et ' + o[3] + '">' + BOLGE[o[3]] + '</span><b>' + o[0] + '</b><p>' + o[2] + '</p></a>'; }).join('') +
          '</div></section>';
      }).join('') || '<p class="ky-bos">Bu süzgeçle eşleşen kaynak yok. Aramayı kısalt ya da “Tümü”nü seç.</p>';
    }

    kok.addEventListener('click', function (olay) {
      var b = olay.target.closest('[data-b]');
      if (!b) return;
      bolge = b.getAttribute('data-b');
      kok.querySelectorAll('[data-b]').forEach(function (x) { x.classList.toggle('aktif', x === b); });
      ciz();
    });
    kok.querySelector('.ky-ara').addEventListener('input', function (olay) { sorgu = olay.target.value.trim(); ciz(); });
    ciz();
  }

  window.Oyun.kaydet('kaynak', kur);
})();
