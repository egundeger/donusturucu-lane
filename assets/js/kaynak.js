/* Kaynak rehberi: veri tabanları, rehberler, kanıt araçları ve videolar.
   b: tr = Türkiye, av = Avrupa, dn = Dünya. Bağlantılar Kasım 2026'da derlendi. */
(function () {
  'use strict';

  var BOLGE = { tr: 'Türkiye', av: 'Avrupa', dn: 'Dünya' };

  var E = 'https://evrimagaci.org/';

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
      ['TEMD · Obezite Tanı ve Tedavi Kılavuzu 2024', 'https://file.temd.org.tr/Uploads/publications/guides/documents/obezitetanitedavikilavizu-2024.pdf', 'Tıbbi beslenme tedavisi, egzersiz, ilaç ve cerrahi bölümleriyle güncel ulusal kılavuz (PDF).', 'tr'],
      ['Ankara Üniversitesi Açık Ders · BES203 Beslenme Biyokimyası I', 'https://acikders.ankara.edu.tr/course/view.php?id=831', 'Prof. Dr. Alev Keser. Karbonhidrat, lipit ve protein metabolizması, enzimler ve nükleik asitler; ders izlencesi ve notlar açık erişimli.', 'tr'],
      ['Ankara Üniversitesi Açık Ders · Beslenme ve Diyetetik dersleri', 'https://acikders.ankara.edu.tr/course/index.php?categoryid=76', 'Bölümün açık ders malzemeleri: Beslenme Biyokimyası II (vitaminler, mineraller), Beslenme İlkeleri, Besin Kimyası ve diğerleri.', 'tr'],
      ['Beslenme ve Diyet Dergisi', 'https://beslenmevediyetdergisi.org', 'Türkiye Diyetisyenler Derneği\'nin 1972\'den beri yayımlanan hakemli dergisi; makaleler açık erişimli.', 'tr'],
      ['DergiPark', 'https://dergipark.org.tr', 'Türkiye\'de yayımlanan akademik dergilerin açık erişim platformu.', 'tr'],
      ['TR Dizin', 'https://trdizin.gov.tr', 'TÜBİTAK ULAKBİM ulusal atıf dizini; Türkçe hakemli yayın araması.', 'tr'],
      ['YÖK Ulusal Tez Merkezi', 'https://tez.yok.gov.tr/UlusalTezMerkezi/', 'Türkiye\'de tamamlanan yüksek lisans ve doktora tezleri.', 'tr']
    ] },
    { ad: 'Türkçe popüler bilim · Evrim Ağacı', not: 'Konuya giriş için iyi bir başlangıçtır; ancak ikincil kaynaktır. Sayısal değerleri birincil kaynakla karşılaştır: popüler yazılarda glukoz başına 36–38 ATP gibi eski ders kitabı değerleri geçebilir (güncel kabul 30–32).', oge: [
      ['Hücresel solunum nedir?', E + 'hucresel-solunum-nedir-glikoliz-krebs-dongusu-ve-elektron-tasima-zinciri-nasil-isler-24103', 'Glikoliz, Krebs döngüsü ve elektron taşıma zincirinin kaynaklı anlatımı. Oyunlardan önce okumak için uygun.', 'tr'],
      ['Metabolizma nedir? Anabolizma, katabolizma ve enerji dengesi', E + 'metabolizma-nedir-anabolizma-katabolizma-ve-enerji-dengesi-nasil-isler-24174', 'Yapım ve yıkım yollarının ATP döngüsü üzerinden eşleşmesi.', 'tr'],
      ['ATP nedir? Canlılar için neden önemlidir?', E + 'atp-nedir-canlilar-icin-neden-onemlidir-11826', 'Hücrenin enerji birimi ve ATP–ADP döngüsü. “Günde kaç kilogram ATP?” hesaplayıcısıyla birlikte okunabilir.', 'tr'],
      ['Krebs döngüsü nedir?', E + 'krebs-dongusu-nedir-4231', 'Döngünün yeri, girdileri ve ürünleri; Krebs Bulmacası için ön okuma.', 'tr'],
      ['Sitrik asit döngüsü ve oksidatif fosforilasyon', E + 'sitrik-asit-dongusu-nedir-oksidatif-fosforilasyon-nasil-gerceklesir-13834', '“Hücrelerin enerji kaynakları” yazı dizisinden; döngünün adımları ve kemiozmotik ATP sentezi.', 'tr'],
      ['Metaller ve enzimler olmadan Krebs döngüsü', E + 'abiyogenez-teorisinde-onemli-kesif-metaller-ve-enzimler-olmadan-da-krebs-dongusunun-calisabildigi-gosterildi-9456', 'Döngü tepkimelerinin enzimsiz de yürüyebildiğini gösteren deneyler; kitabın 3. bölümündeki “önce metabolizma” fikrinin deneysel dayanağı.', 'tr'],
      ['Fermantasyon nedir?', E + 'fermantasyon-nedir-fermante-olmus-yiyecekler-insansi-evrimine-nasil-yon-verdi-9197', 'Oksijensiz enerji üretimi ve fermente besinlerin insan evrimindeki yeri.', 'tr'],
      ['Oksijenli solunum nasıl evrimleşti?', E + 'oksijenli-solunum-nasil-evrimlesti-ilkel-hucreler-nasil-oldu-da-oksijeni-kullanabilecek-bicimde-evrimlestiler-5289', 'Kitabın 4. bölümündeki oksijen devrimi konusunun Türkçe anlatımı.', 'tr'],
      ['Warburg etkisi ve kanserde metabolik değişimler', E + 'warburg-etkisi-ve-kanserde-meydana-gelen-metabolik-degisimler-7901', 'Kitabın 5. bölümü ve “Tartışmalı Konular” sayfasındaki kanser başlığıyla birlikte okunabilir.', 'tr'],
      ['Yaşamın başlangıcının bilimsel tarihi', E + 'yasamin-baslangicinin-bilimsel-tarihi-dunyada-yasam-nasil-basladi-457', 'Hidrotermal baca hipotezi ve Nick Lane\'in “yaşamın kökeni reaktörü” deneyleri.', 'tr'],
      ['Serpantinleşme nedir?', E + 'serpantinlesme-nedir-yasamin-baslangicina-dair-neler-soyler-8628', 'Alkali hidrotermal bacalarda H₂ üreten jeokimyasal süreç; ilk metabolizmanın enerji kaynağı tartışması.', 'tr'],
      ['Enzim nedir?', E + 'enzim-nedir-enzimlerin-calismasina-etki-eden-faktorler-ve-kullanim-alanlari-nelerdir-11254', 'Aktivasyon enerjisi, etkin bölge, sıcaklık ve pH etkisi, inhibisyon türleri.', 'tr'],
      ['Vitamin nedir? Sınıflandırma ve eksiklikler', E + 'vitamin-nedir-vitaminler-nasil-siniflandirilir-eksikliklerinde-neler-olur-11320', 'Suda ve yağda çözünen vitaminler; “Biyokimyadan Sofraya” sayfasındaki koenzim tablosunu tamamlar.', 'tr'],
      ['Karbonhidrat nedir?', E + 'karbonhidrat-nedir-glikoz-gibi-sekerler-canlilar-icin-neden-onemlidir-11342', 'Şekerlerin yapısı, sınıflandırılması ve canlılardaki işlevi.', 'tr'],
      ['Sindirim nedir? Sindirim sistemi nasıl çalışır?', E + 'sindirim-nedir-sindirim-sistemi-nasil-calisir-17361', 'Makro besinlerin sindirimi ve emilimi; enzimler ve salgılar.', 'tr'],
      ['Hiperkolesterolemi nedir?', E + 'hiperkolesterolemi-nedir-yuksek-kolesterol-hastaliginin-riskleri-ve-tedavi-secenekleri-nelerdir-12404', 'Lipoproteinler, LDL reseptörü ve tedavi seçenekleri; Friedewald hesaplayıcısıyla birlikte okunabilir.', 'tr'],
      ['Keto diyeti ve epilepsi', E + 'keto-diyeti-nedir-ketojenik-diyet-epilepsi-tedavisinde-neden-kullaniliyor-14666', 'Ketojenik diyetin mekanizması ve epilepsideki kullanımı. Kanıt düzeyi için “Biyokimyadan Sofraya” 5. başlıkla karşılaştır.', 'tr'],
      ['Multivitaminler işe yarıyor mu?', E + 'saglikli-bireylerin-aldigi-multivitaminlerin-cogu-islevsiz-ancak-bazilarini-almanizda-fayda-var-4690', 'Sağlıklı bireylerde vitamin ve antioksidan takviyelerine ilişkin çalışmaların derlemesi.', 'tr'],
      ['“Yaşam Neden Var?” (Nick Lane)', E + 'eser/yasam-neden-var-182', 'Lane\'in Türkçeye çevrilmiş kitabının tanıtım sayfası; enerji akışı ve yaşamın kökeni üzerine.', 'tr'],
      ['Evrim Ağacı YouTube videoları', E + 'eserler/youtube-kanali', 'Video içeriklerinin dizini; Türkçe popüler bilim.', 'tr']
    ] },
    { ad: 'Türkçe popüler bilim · TÜBİTAK Bilim Genç ve Sarkaç', not: 'TÜBİTAK\'ın gençlere yönelik yayını ile Bilim Akademisi\'nin popüler bilim sitesi; yazılar alanında çalışan araştırmacılarca ya da editör denetiminde hazırlanır.', oge: [
      ['Bilim Genç · İnsülin direnci ve insülin duyarlılığı', 'https://bilimgenc.tubitak.gov.tr/makale/insulin-direnci-ve-insulin-duyarliligi-hakkinda-bilinmesi-gerekenler', 'İnsülinin etkisi, direnç ve duyarlılık kavramları. HOMA-IR hesaplayıcısı ve “Tok mu, Aç mı?” oyunuyla birlikte okunabilir.', 'tr'],
      ['Bilim Genç · Metabolomik nedir?', 'https://bilimgenc.tubitak.gov.tr/makale/metabolomik-nedir-vucudun-kimyasal-gunlugu-okunabilir-mi', 'Vücuttaki küçük moleküllerin toplu ölçümü; beslenme araştırmalarında ve doğuştan metabolizma hastalıklarında kullanımı.', 'tr'],
      ['Sarkaç · Zeytinyağı neden sağlıklı?', 'https://sarkac.org/2017/07/zeytinyagi-neden-saglikli-zeynep-delen-nircan/', 'Oleik, linoleik ve palmitik asidin çift bağ kimyası; oksidasyona dayanıklılık.', 'tr'],
      ['Sarkaç · Nar gibi kızarmış patates', 'https://sarkac.org/2022/09/nar-gibi-kizarmis-patates/', 'Kızartma kimyası: yağın oksidasyonu, tekrar kullanılan yağ ve akrilamid.', 'tr'],
      ['Sarkaç · Polifenol nedir?', 'https://sarkac.org/2020/09/bitkilerde-bulunan-saglikli-maddeler-polifenol-nedir/', 'Bitkisel besinlerdeki polifenoller; Phenol-Explorer veri tabanıyla birlikte kullanılabilir.', 'tr'],
      ['Sarkaç · Protein nedir, nasıl katlanır? (2024 Nobel Kimya Ödülü)', 'https://sarkac.org/2024/12/bilim-sohbetleri-2024-nobel-kimya-odulu-protein-nedir-nasil-katlanir/', 'Bilim Sohbetleri kaydı: protein katlanması problemi, AlphaFold ve protein tasarımı.', 'tr']
    ] },
    { ad: 'Türkçe haber · BBC Türkçe', not: 'Haber, bir çalışmanın özetidir; kanıtın kendisi değildir. Haberde anılan çalışmayı PubMed\'de bul, türüne (gözlemsel mi, randomize mi) ve örneklemine bak. Aşağıdaki üç yazı BBC Türkçe\'nin haberleridir; BBC sitesindeki asıl adresleri doğrulanamadığı için Cumhuriyet\'te yayımlanan kopyalarına bağlanmıştır.', oge: [
      ['BBC News Türkçe', 'https://www.bbc.com/turkce', 'Güncel sağlık ve beslenme araştırmalarının Türkçe haberleri.', 'tr'],
      ['BBC Türkçe · Aşırı işlenmiş gıdalar küresel bir sağlık tehdidi mi?', 'https://www.cumhuriyet.com.tr/saglik/uzmanlar-uyardi-asiri-islenmis-gidalar-kuresel-bir-saglik-tehdidi-2454265', 'The Lancet\'te yayımlanan uzman raporu ve ona yöneltilen eleştiriler: gözlemsel veri nedensellik gösterir mi? “Tartışmalı Konular” 1. başlıkla birlikte okunabilir. (Cumhuriyet\'teki yayını)', 'tr'],
      ['BBC Türkçe · Hangi ultra işlenmiş gıdalar faydalı olabilir?', 'https://www.cumhuriyet.com.tr/yasam/hangi-ultra-islenmis-gidalar-faydali-olabilir-2447416', 'İşlenme derecesi ile besin bileşiminin ayrı ayrı değerlendirilmesi üzerine. (Cumhuriyet\'teki yayını)', 'tr'],
      ['BBC Türkçe · Aralıklı oruç diyeti nedir?', 'https://www.cumhuriyet.com.tr/haber/aralikli-oruc-diyeti-nedir-neden-bu-kadar-populer-oldu-1833623', '5:2 ve 16:8 gibi uygulamalar ve kimler için uygun olmadığı. Kanıt için “Biyokimyadan Sofraya” 6. başlığa bak. (Cumhuriyet\'teki yayını)', 'tr']
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

  var KITAP = [
    ['Aksoy M.', 'Beslenme Biyokimyası', '6. baskı, Nobel Tıp Kitabevleri (önceki baskılar Hatiboğlu Yayınevi). Bölümlerde en yaygın kullanılan klasik.'],
    ['Tetik Ş.', 'Beslenme Biyokimyası', 'Nobel Tıp Kitabevleri, 2020.'],
    ['Savaş H. B. (ed.)', 'Beslenme Biyokimyası', 'Nobel Akademik Yayıncılık, 2022. Çok yazarlı.'],
    ['Günşen U. (ed.)', 'Beslenme Biyokimyası', 'Akademisyen Kitabevi, 2025.'],
    ['Nelson D. L., Cox M. M.', 'Lehninger Biyokimyanın İlkeleri', 'Türkçe çeviri, Palme Yayıncılık. Biyoenerjetik ve metabolik düzenleme için başvuru kitabı.'],
    ['Ferrier D. R.', 'Lippincott Biyokimya', 'Türkçe çeviri, Nobel Tıp Kitabevleri. Şemalarla özet anlatım.']
  ];

  var VIDEO = [
    ['Nick Lane · How the Krebs cycle powers life and death', 'https://www.youtube.com/watch?v=vBiIDwBOqQA', 'Royal Institution konuşması (2022, yaklaşık 56 dakika, İngilizce). Kitabın yazarı; döngünün iki yönü, kanser ve hidrotermal bacalar.', 'YouTube'],
    ['WEHI.TV · Elektron taşıma zinciri', 'https://www.wehi.edu.au/wehi-tv/electron-transport-chain-respiration-series/', 'Drew Berry\'nin yapısal veriye dayalı moleküler animasyonu. 3B oyundaki sahnenin gerçeğe en yakın görseli.', 'Animasyon'],
    ['WEHI.TV · ATP sentezi', 'https://www.wehi.edu.au/wehi-tv/synthesis-atp', 'ATP sentazın dönel mekanizması; proton gradyanının mekanik işe çevrilmesi.', 'Animasyon'],
    ['MIT OpenCourseWare · 7.05 General Biochemistry', 'https://ocw.mit.edu/courses/7-05-general-biochemistry-spring-2020/video_galleries/video-lectures', 'Matthew Vander Heiden\'ın metabolizma dersleri: biyoenerjetik, glikoliz, Krebs döngüsü, oksidatif fosforilasyon. Ücretsiz, İngilizce.', 'Ders'],
    ['Khan Academy · Krebs / citric acid cycle', 'https://www.youtube.com/watch?v=juM2ROSLWfw', 'Döngünün adım adım anlatımı; başlangıç düzeyi için uygun (İngilizce, altyazı seçenekli).', 'YouTube'],
    ['Khan Academy Türkçe · hücresel solunum', 'https://tr.khanacademy.org/search?page_search_query=h%C3%BCcresel%20solunum', 'Türkçe ders ve alıştırmalar (site içi arama bağlantısı).', 'Türkçe'],
    ['Evrim Ağacı · video dizini', 'https://evrimagaci.org/eserler/youtube-kanali', 'Türkçe popüler bilim videoları; evrim, biyokimya ve beslenme başlıkları.', 'Türkçe'],
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
      '<section class="ky-grup"><h3>Türkçe ders kitapları</h3><p class="ky-not">Baskı ve yıl bilgileri kitabevi kayıtlarına dayanır; güncel baskıyı yayınevinden kontrol et.</p><ul class="ky-kitap">' +
      KITAP.map(function (k) { return '<li><b>' + k[0] + '</b> <i>' + k[1] + '.</i> ' + k[2] + '</li>'; }).join('') + '</ul></section>' +
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
