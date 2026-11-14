/* OYUN 1 — Hücre Yöneticisi
   Sıra tabanlı metabolizma oyunu. Stokiyometri ders kitabı değerleridir:
   glikoliz (net 2 ATP, 2 NADH), PDH (1 NADH), Krebs (3 NADH, 1 FADH2, 1 GTP),
   palmitat beta-oksidasyonu (8 asetil-CoA, 7 NADH, 7 FADH2, -2 ATP eşdeğeri),
   oksidatif fosforilasyon (P/O: NADH 2,5; FADH2 1,5), pentoz fosfat (2 NADPH). */
(function () {
  'use strict';

  /* ======================= MANTIK (DOM'dan bağımsız) ======================= */
  var K = { adTop: 30, nadTop: 20, fadTop: 10, nadpTop: 10, glcMax: 12, faMax: 4, acoaMax: 16, r5pMax: 4, pyrMax: 8, hedef: 100 };

  var OLAYLAR = {
    hipoksi: { ad: 'Hipoksi', ikon: '🫁', sure: 4, metin: 'Oksijen azaldı: 4 adım boyunca oksidatif fosforilasyon çalışmaz. NAD⁺’yı laktat fermantasyonuyla yenile.' },
    egzersiz: { ad: 'Yoğun egzersiz', ikon: '🏃', sure: 4, metin: 'ATP talebi arttı: 4 adım boyunca her adım 3 ATP harcanır.' },
    aclik: { ad: 'Açlık', ikon: '🌙', sure: 5, metin: 'Besin gelmiyor: 5 adım boyunca yemek yok. Glukagon lipolizi başlattı; depo yağını kullan, otofaji için fırsat.' },
    stres: { ad: 'Oksidatif stres dalgası', ikon: '🔥', sure: 1, metin: 'İnflamasyon kaynaklı ROS artışı: ROS +20. NADPH’li glutatyon savunmasını çalıştır.' }
  };

  function karistir(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function yeni() {
    return {
      glc: 4, fa: 1, pyr: 0, acoa: 0, lac: 0, r5p: 0,
      atp: 14, nadh: 2, fadh2: 0, nadph: 4, pentozC: 0,
      ros: 10, mito: 100, bio: 0,
      adim: 0, kriz: 0, bitti: false,
      olay: null, olaySira: karistir(['hipoksi', 'egzersiz', 'aclik', 'stres']), sonrakiOlay: 8,
      ist: { atpSub: 0, atpOks: 0, glc: 0, yag: 0 }
    };
  }

  function adp(s) { return K.adTop - s.atp; }
  function nad(s) { return K.nadTop - s.nadh; }
  function fad(s) { return K.fadTop - s.fadh2; }
  function nadp(s) { return K.nadpTop - s.nadph; }
  function o2Var(s) { return !(s.olay && s.olay.id === 'hipoksi'); }
  function bazal(s) { return (s.olay && s.olay.id === 'egzersiz') ? 3 : 1; }
  function f(x) { var y = Math.round(x * 10) / 10; return (y % 1 === 0 ? String(y) : y.toFixed(1)).replace('.', ','); }

  /* Her eylem: engel(s) -> neden yapılamadığını açıklayan metin ya da null
                yap(s)   -> { m: mesaj, akis: [[kaynak, hedef, renk, adet], ...] } */
  var EYLEM = {
    yeKarb: {
      ad: 'Karbonhidrat', ikon: '🍞', ozet: '+3 glukoz',
      denklem: 'Nişasta → glukoz → (GLUT) → hücre',
      bilgi: 'Kan glukozu yükselince insülin salınır; hücre “bolluk” sinyali alır ve mTOR üzerinden büyümeye yönelir.',
      engel: function (s) {
        if (s.olay && s.olay.id === 'aclik') return 'Açlık dönemindesin: besin gelmiyor. Depo yağını β-oksidasyonla kullan.';
        if (s.glc >= K.glcMax) return 'Glukoz deposu dolu. Önce elindekini kullan.';
        return null;
      },
      yap: function (s) { var n = Math.min(3, K.glcMax - s.glc); s.glc += n; return { m: '+' + n + ' glukoz hücreye alındı.', akis: [['yeKarb', 'glc', 'glc', n]] }; }
    },
    yeYag: {
      ad: 'Yağ', ikon: '🥑', ozet: '+1 palmitat (C16)',
      denklem: 'Triaçilgliserol → yağ asitleri (palmitat, C16)',
      bilgi: 'Yağ asitleri gram başına karbonhidratın iki katından fazla enerji taşır; ama yakılmaları için O₂ ve boş NAD⁺/FAD gerekir.',
      engel: function (s) {
        if (s.olay && s.olay.id === 'aclik') return 'Açlık dönemindesin: besin gelmiyor.';
        if (s.fa >= K.faMax) return 'Yağ asidi deposu dolu.';
        return null;
      },
      yap: function (s) { s.fa += 1; return { m: '+1 palmitat (C16) hücreye alındı.', akis: [['yeYag', 'fa', 'fa', 1]] }; }
    },
    bekle: {
      ad: 'Bekle', ikon: '⏭', ozet: 'adımı geç',
      denklem: 'Bazal metabolizma: Na⁺/K⁺-ATPaz, protein döngüsü…',
      bilgi: 'Hiçbir şey yapmasan da hücre ATP harcar: iyon pompaları ve onarım hiç durmaz.',
      engel: function () { return null; },
      yap: function () { return { m: 'Bir adım beklendi. Bazal metabolizma ATP harcamaya devam ediyor.', akis: [] }; }
    },
    glikoliz: {
      ad: 'Glikoliz', ikon: '⚙️', ozet: '→ 2 pirüvat · 2 ATP · 2 NADH',
      denklem: 'Glukoz + 2 NAD⁺ + 2 ADP + 2 P<sub>i</sub> → 2 pirüvat + 2 NADH + 2 ATP',
      bilgi: 'Sitozolde, O₂ gerektirmez. 2 ATP yatırılır, 4 ATP kazanılır: net 2 ATP. Hızlıdır ama glukozdaki enerjinin yalnızca ≈%7’sini yakalar.',
      engel: function (s) {
        if (s.glc < 1) return 'Glukoz yok. Önce karbonhidrat ye.';
        if (nad(s) < 2) return 'NAD⁺ kalmadı: gliseraldehit-3-fosfat dehidrogenaz NAD⁺ olmadan çalışamaz. NADH’yi solunum zincirinde (O₂ varsa) ya da laktat fermantasyonuyla NAD⁺’ya çevir.';
        if (adp(s) < 2) return 'ADP yok: fosforilasyon için boş ADP gerekir. Önce ATP harcayan bir iş yap (biyosentez).';
        if (s.pyr + 2 > K.pyrMax) return 'Pirüvat birikti. Önce PDH ya da laktat yoluna gönder.';
        return null;
      },
      yap: function (s) {
        s.glc -= 1; s.pyr += 2; s.nadh += 2; s.atp += 2; s.ist.atpSub += 2; s.ist.glc += 1;
        return { m: 'Glikoliz: 1 glukoz → 2 pirüvat, net +2 ATP, +2 NADH.', akis: [['glc', 'glikoliz', 'glc', 1], ['glikoliz', 'pyr', 'pyr', 2]] };
      }
    },
    ldh: {
      ad: 'Laktat fermantasyonu', ikon: '♻️', ozet: 'pirüvat + NADH → laktat + NAD⁺',
      denklem: 'Pirüvat + NADH + H⁺ → laktat + NAD⁺ &nbsp;(laktat dehidrogenaz)',
      bilgi: 'ATP üretmez; amacı NAD⁺’yı geri kazanıp glikolizi sürdürmektir. Laktat kana verilir, karaciğerde yeniden glukoza çevrilir (Cori döngüsü). Warburg etkisindeki yol da budur.',
      engel: function (s) {
        if (s.pyr < 1) return 'Pirüvat yok. Önce glikoliz çalıştır.';
        if (s.nadh < 1) return 'NADH yok: indirgenecek bir şey kalmadı, bu yola gerek de yok.';
        return null;
      },
      yap: function (s) {
        var n = Math.min(2, s.pyr, s.nadh); s.pyr -= n; s.nadh -= n; s.lac += n;
        return { m: n + ' pirüvat laktata indirgendi: +' + n + ' NAD⁺ geri kazanıldı. Laktat kana verildi.', akis: [['pyr', 'ldh', 'pyr', n], ['ldh', 'lac', 'lac', n]] };
      }
    },
    pdh: {
      ad: 'PDH', ikon: '🚪', ozet: 'pirüvat → asetil-CoA · NADH · CO₂',
      denklem: 'Pirüvat + CoA + NAD⁺ → asetil-CoA + NADH + CO₂ &nbsp;(pirüvat dehidrogenaz kompleksi)',
      bilgi: 'Mitokondrinin giriş kapısı; geri dönüşsüzdür. Beş koenzim ister: tiamin (B1), lipoat, FAD (B2), NAD⁺ (B3), CoA (B5). Tiamin eksikliğinde (beriberi) pirüvat laktata sapar.',
      engel: function (s) {
        if (s.pyr < 1) return 'Pirüvat yok. Önce glikoliz çalıştır.';
        if (nad(s) < 1) return 'NAD⁺ yok: PDH NADH tarafından baskılanır. Önce NADH’yi yükseltge.';
        if (s.acoa >= K.acoaMax) return 'Asetil-CoA birikti. Krebs döngüsünde ya da biyosentezde kullan.';
        return null;
      },
      yap: function (s) {
        var n = Math.min(2, s.pyr, nad(s), K.acoaMax - s.acoa); s.pyr -= n; s.acoa += n; s.nadh += n;
        return { m: 'PDH: ' + n + ' pirüvat → ' + n + ' asetil-CoA, +' + n + ' NADH, ' + n + ' CO₂.', akis: [['pyr', 'pdh', 'pyr', n], ['pdh', 'acoa', 'acoa', n]] };
      }
    },
    box: {
      ad: 'β-oksidasyon', ikon: '🔥', ozet: 'palmitat → 8 asetil-CoA · 7 NADH · 7 FADH₂',
      denklem: 'Palmitat (C16) + 7 NAD⁺ + 7 FAD + 8 CoA + ATP → 8 asetil-CoA + 7 NADH + 7 FADH₂ + AMP + PP<sub>i</sub>',
      bilgi: 'Aktivasyon 2 ATP eşdeğeri tüketir (ATP → AMP). Yağ asidi mitokondriye karnitin mekiğiyle (CPT-I) girer; malonil-CoA bu kapıyı kapatır, yani tokken yağ yakımı durur. Tam yakımda palmitat ≈106 ATP verir.',
      engel: function (s) {
        if (s.fa < 1) return 'Yağ asidi yok. Önce yağ ye (ya da açlıkta lipolizi bekle).';
        if (s.atp < 3 + bazal(s)) return 'Aktivasyon 2 ATP eşdeğeri harcar ve bazal gider için yedek kalmalı: en az ' + (3 + bazal(s)) + ' ATP gerekir (şu an ' + f(s.atp) + '). Önce elindeki NADH/FADH₂’yi ya da glukozu kullan.';
        if (nad(s) < 7) return '7 boş NAD⁺ gerekir (şu an ' + nad(s) + '). Önce NADH’yi solunum zincirinde yükseltge.';
        if (fad(s) < 7) return '7 boş FAD gerekir (şu an ' + fad(s) + '). Önce FADH₂’yi solunum zincirinde yükseltge.';
        if (s.acoa + 8 > K.acoaMax) return 'Asetil-CoA havuzunda 8 birimlik yer yok. Önce Krebs’te ya da biyosentezde kullan.';
        return null;
      },
      yap: function (s) {
        s.fa -= 1; s.atp -= 2; s.acoa += 8; s.nadh += 7; s.fadh2 += 7; s.ist.yag += 1;
        return { m: 'β-oksidasyon: 1 palmitat → 8 asetil-CoA, +7 NADH, +7 FADH₂ (−2 ATP aktivasyon).', akis: [['fa', 'box', 'fa', 1], ['box', 'acoa', 'acoa', 8]] };
      }
    },
    krebs: {
      ad: 'Krebs döngüsü', ikon: '🔄', ozet: 'asetil-CoA → 3 NADH · FADH₂ · GTP · 2 CO₂',
      denklem: 'Asetil-CoA + 3 NAD⁺ + FAD + GDP + P<sub>i</sub> → 2 CO₂ + 3 NADH + FADH₂ + GTP',
      bilgi: 'Döngü kendi başına O₂ kullanmaz ama NAD⁺ ve FAD’ı yalnızca solunum zinciri yeniler; bu yüzden O₂ yokken durur. Okzaloasetat katalizör gibidir: harcanmaz, her turda yenilenir.',
      engel: function (s) {
        if (s.acoa < 1) return 'Asetil-CoA yok. PDH (pirüvattan) ya da β-oksidasyon (yağdan) ile üret.';
        if (nad(s) < 3) return '3 boş NAD⁺ gerekir (şu an ' + nad(s) + '). İzositrat ve α-ketoglutarat dehidrogenaz NADH tarafından baskılanır: önce NADH’yi yükseltge.';
        if (fad(s) < 1) return 'Boş FAD yok: süksinat dehidrogenaz çalışamaz. Önce FADH₂’yi yükseltge.';
        if (adp(s) < 1) return 'ADP/GDP yok. Önce ATP harcayan bir iş yap.';
        return null;
      },
      yap: function (s) {
        s.acoa -= 1; s.nadh += 3; s.fadh2 += 1; s.atp += 1; s.ist.atpSub += 1;
        return { m: 'Krebs döngüsü bir tur döndü: +3 NADH, +1 FADH₂, +1 GTP (≈ATP), 2 CO₂.', akis: [['acoa', 'krebs', 'acoa', 1], ['krebs', 'oksfos', 'e', 4]] };
      }
    },
    oksfos: {
      ad: 'Oksidatif fosforilasyon', ikon: '⚡', ozet: 'NADH → 2,5 ATP · FADH₂ → 1,5 ATP',
      denklem: 'NADH + H⁺ + ½ O₂ + 2,5 ADP + 2,5 P<sub>i</sub> → NAD⁺ + H₂O + 2,5 ATP',
      bilgi: 'Elektronlar O₂’ye akarken protonlar pompalanır; ATP sentaz bu gradyanla döner. ADP yoksa sentaz durur, zar potansiyeli yükselir ve elektronlar O₂’ye erken kaçar: ROS. Bir adımda en çok 4 NADH + 2 FADH₂ işlenir (mitokondri sağlığına bağlı).',
      engel: function (s) {
        if (!o2Var(s)) return 'Hipoksi: son elektron alıcısı O₂ yok, zincir durdu. NAD⁺ için laktat fermantasyonunu kullan.';
        if (s.nadh < 1 && s.fadh2 < 1) return 'İndirgenmiş taşıyıcı (NADH/FADH₂) yok. Önce Krebs döngüsünü ya da β-oksidasyonu çalıştır.';
        if (!((s.nadh >= 1 && adp(s) >= 2.5) || (s.fadh2 >= 1 && adp(s) >= 1.5))) return 'ADP yok: ATP sentaz dönemiyor (solunum kontrolü). ATP harcayan bir iş yap: biyosentez.';
        return null;
      },
      yap: function (s) {
        var kap = s.mito >= 67 ? 4 : (s.mito >= 34 ? 3 : 2);
        var n = Math.min(s.nadh, kap), q = Math.min(s.fadh2, 2), kisit = false, bos = adp(s);
        while (2.5 * n + 1.5 * q > bos + 1e-9) { kisit = true; if (q > 0 && q >= n) q--; else n--; }
        var uret = 2.5 * n + 1.5 * q;
        s.nadh -= n; s.fadh2 -= q; s.atp += uret; s.ist.atpOks += uret;
        var r = 1 + (s.mito < 67 ? 1 : 0) + (s.mito < 34 ? 1 : 0) + (kisit ? 2 : 0);
        s.ros += r;
        var m = n + ' NADH + ' + q + ' FADH₂ yükseltgendi → +' + f(uret) + ' ATP.';
        if (kisit) m += ' ADP sınırlı olduğu için zincir yavaşladı: zar potansiyeli yükseldi, elektron kaçağı arttı (ROS +' + r + ').';
        else m += ' Küçük bir elektron kaçağı her zaman olur (ROS +' + r + ').';
        return { m: m, akis: [['oksfos', 'atp', 'atp', Math.max(1, Math.round(uret / 2.5))]] };
      }
    },
    ppp: {
      ad: 'Pentoz fosfat yolu', ikon: '🧪', ozet: '→ 2 NADPH · riboz-5-P · CO₂',
      denklem: 'Glukoz + ATP + 2 NADP⁺ → riboz-5-fosfat + 2 NADPH + CO₂ + ADP',
      bilgi: 'Hız kısıtlayıcı enzim glukoz-6-fosfat dehidrogenaz (G6PD). NADPH yağ asidi sentezi ve glutatyon için, riboz-5-P nükleotitler için gerekir. Riboz fazlası oksidatif olmayan kolla (transketolaz: tiamin/B1; transaldolaz) glikolize geri döner: 6 pentoz → 5 heksoz. G6PD eksikliğinde eritrositler oksidan strese dayanamaz (favizm).',
      engel: function (s) {
        if (s.glc < 1) return 'Glukoz yok. Önce karbonhidrat ye.';
        if (s.atp < 2 + bazal(s)) return 'Glukozu fosforillemek 1 ATP harcar (heksokinaz) ve bazal gider için yedek kalmalı: en az ' + (2 + bazal(s)) + ' ATP gerekir (şu an ' + f(s.atp) + ').';
        if (nadp(s) < 2) return 'NADP⁺ kalmadı: NADPH havuzu dolu. G6PD zaten NADPH ile baskılanır; önce NADPH kullan.';
        return null;
      },
      yap: function (s) {
        s.glc -= 1; s.atp -= 1; s.nadph += 2; s.ist.glc += 1;
        if (s.r5p < K.r5pMax) {
          s.r5p += 1;
          return { m: 'Pentoz fosfat yolu: +2 NADPH, +1 riboz-5-P (−1 glukoz, −1 ATP).', akis: [['glc', 'ppp', 'glc', 1], ['ppp', 'r5p', 'r5p', 1], ['ppp', 'gsh', 'nadph', 2]] };
        }
        /* Riboz ihtiyacı doymuş: pentoz, oksidatif olmayan kolla glikolize döner (6 C5 -> 5 C6) */
        s.pentozC += 5;
        var geri = 0;
        while (s.pentozC >= 6) { s.pentozC -= 6; s.glc += 1; geri++; }
        return {
          m: 'Pentoz fosfat yolu: +2 NADPH. Riboz-5-P deposu dolu olduğu için pentoz oksidatif olmayan kolla glikolize geri döndü' + (geri ? ' (+' + geri + ' glukoz eşdeğeri).' : ' (6 pentoz → 5 heksoz; karbon birikiyor).'),
          akis: [['glc', 'ppp', 'glc', 1], ['ppp', 'glc', 'r5p', 1], ['ppp', 'gsh', 'nadph', 2]]
        };
      }
    },
    gsh: {
      ad: 'Glutatyon savunması', ikon: '🛡️', ozet: 'NADPH → ROS temizliği',
      denklem: 'GSSG + NADPH + H⁺ → 2 GSH + NADP⁺ &nbsp;·&nbsp; 2 GSH + H₂O₂ → GSSG + 2 H₂O',
      bilgi: 'Glutatyon redüktaz FAD (riboflavin) taşır; glutatyon peroksidaz selenyum içerir. Antioksidan savunmanın gerçek yakıtı vitamin hapı değil, pentoz fosfat yolundan gelen NADPH’dir.',
      engel: function (s) {
        if (s.ros <= 0) return 'Temizlenecek ROS yok.';
        if (s.nadph < 1) return 'NADPH yok: savunma çalışamaz. Pentoz fosfat yolunu çalıştır.';
        return null;
      },
      yap: function (s) {
        var n = Math.min(2, s.nadph); s.nadph -= n; var once = s.ros; s.ros = Math.max(0, s.ros - 8 * n);
        return { m: n + ' NADPH ile glutatyon yenilendi, peroksitler suya indirgendi: ROS −' + f(once - s.ros) + '.', akis: [['gsh', 'ros', 'nadph', n]] };
      }
    },
    bio: {
      ad: 'Biyosentez (büyü)', ikon: '🌱', ozet: '−8 ATP · −4 NADPH · −2 asetil-CoA · −1 riboz-5-P',
      denklem: 'Riboz-5-P → nükleotit · asetil-CoA + NADPH → yağ asidi · ATP → protein, DNA, zar',
      bilgi: 'Büyümek için enerji tek başına yetmez: karbon iskeleti ve indirgeyici güç (NADPH) gerekir. Bu yüzden çoğalan hücreler glukozun bir kısmını yakmak yerine yapı taşına çevirir (Warburg etkisinin mantığı).',
      engel: function (s) {
        var e = [];
        var gerek = 9 + bazal(s);
        if (s.atp < gerek) e.push(gerek + ' ATP (8’i harcanır, kalanı bazal gider yedeği; şu an ' + f(s.atp) + ')');
        if (s.nadph < 4) e.push('4 NADPH (şu an ' + s.nadph + ')');
        if (s.acoa < 2) e.push('2 asetil-CoA (şu an ' + s.acoa + ')');
        if (s.r5p < 1) e.push('1 riboz-5-P (şu an ' + s.r5p + ')');
        return e.length ? 'Eksik yapı taşı: ' + e.join(', ') + '.' : null;
      },
      yap: function (s) {
        s.atp -= 8; s.nadph -= 4; s.acoa -= 2; s.r5p -= 1; s.bio = Math.min(K.hedef, s.bio + 20);
        return { m: 'Nükleotit, yağ asidi ve protein sentezlendi: biyokütle +20.', akis: [['r5p', 'bio', 'r5p', 1], ['acoa', 'bio', 'acoa', 2]] };
      }
    },
    otofaji: {
      ad: 'Otofaji / mitofaji', ikon: '🧹', ozet: 'mitokondri onarımı · ROS −10',
      denklem: 'Hasarlı organel + lizozom → geri kazanılmış yapı taşları',
      bilgi: 'Besin azken insülin düşer, AMPK etkinleşir, mTORC1 baskılanır ve otofaji açılır. Hasarlı mitokondriler ayıklanır (mitofaji). Tokken bu program kapalıdır.',
      engel: function (s) {
        if (s.glc > 2) return 'Hücrede bol glukoz var (' + s.glc + '): insülin/mTOR sinyali otofajiyi baskılıyor. Glukoz 2’nin altına inince açılır.';
        if (s.mito >= 100 && s.ros <= 0) return 'Onarılacak hasar yok.';
        return null;
      },
      yap: function (s) {
        s.mito = Math.min(100, s.mito + 15); s.ros = Math.max(0, s.ros - 10);
        return { m: 'Otofaji: hasarlı mitokondriler geri dönüştürüldü. Mitokondri sağlığı +15, ROS −10.', akis: [] };
      }
    }
  };

  function olayBaslat(s, ek) {
    var id = s.olaySira.shift();
    if (!s.olaySira.length) s.olaySira = karistir(['hipoksi', 'egzersiz', 'aclik', 'stres']);
    var o = OLAYLAR[id];
    s.olay = { id: id, ad: o.ad, ikon: o.ikon, kalan: o.sure };
    var m = o.ikon + ' ' + o.ad + ': ' + o.metin;
    if (id === 'stres') s.ros += 20;
    if (id === 'aclik' && s.fa < 2) { s.fa += 1; m += ' (+1 palmitat yağ dokusundan geldi.)'; }
    ek.push({ tip: 'olay', m: m });
  }

  function turSonu(s, ek) {
    s.adim++;
    s.atp -= bazal(s);

    var r = s.nadh / K.nadTop;
    if (r >= 0.7 && o2Var(s)) {
      s.ros += 3;
      ek.push({ tip: 'uyari', m: 'NADH/NAD⁺ oranı çok yüksek: zincir aşırı indirgenmiş, elektronlar O₂’ye erken kaçıyor (ROS +3). NADH’yi yükseltge.' });
    } else if (r < 0.5 && s.ros > 0) {
      s.ros = Math.max(0, s.ros - 1); // SOD + katalaz: bazal temizlik
    }
    if (s.ros >= 60) {
      s.mito = Math.max(20, s.mito - 3);
      ek.push({ tip: 'uyari', m: 'ROS yüksek: mitokondri hasar görüyor (sağlık −3). Glutatyon savunmasını çalıştır.' });
    }

    if (s.atp <= 0) {
      s.atp = 6; s.bio = Math.max(0, s.bio - 10); s.kriz++;
      ek.push({ tip: 'kotu', m: 'Enerji krizi: ATP tükendi. Fosfokreatin tamponu devreye girdi (+6 ATP), AMPK büyümeyi durdurdu (biyokütle −10). Öncelik: ATP üret.' });
    }
    if (s.ros >= 100) {
      s.ros = 50; s.mito = Math.max(20, s.mito - 25); s.bio = Math.max(0, s.bio - 10); s.kriz++;
      ek.push({ tip: 'kotu', m: 'Oksidatif hasar: hasarlı mitokondriler mitofajiyle ayıklandı. ROS 50’ye indi, mitokondri sağlığı −25, biyokütle −10.' });
    }

    if (s.olay) {
      s.olay.kalan--;
      if (s.olay.kalan <= 0) {
        if (s.olay.id !== 'stres') ek.push({ tip: 'iyi', m: s.olay.ad + ' sona erdi.' });
        s.olay = null; s.sonrakiOlay = s.adim + 7;
      }
    } else if (s.adim >= s.sonrakiOlay) {
      olayBaslat(s, ek);
    }

    if (s.bio >= K.hedef) s.bitti = true;
  }

  function uygula(s, id) {
    var e = EYLEM[id];
    if (!e || s.bitti) return null;
    var neden = e.engel(s);
    if (neden) return { tur: false, tip: 'uyari', m: neden, akis: [], ek: [] };
    var sonuc = e.yap(s), ek = [];
    turSonu(s, ek);
    return { tur: true, tip: 'iyi', m: sonuc.m, akis: sonuc.akis, ek: ek };
  }

  function yildiz(s) {
    if (s.kriz === 0 && s.adim <= 60) return 3;
    if (s.kriz <= 1 && s.adim <= 85) return 2;
    return 1;
  }

  /* İpucu motoru: duruma göre en mantıklı sonraki adım */
  function oner(s) {
    function ok(id) { return !EYLEM[id].engel(s); }
    var o2 = o2Var(s);
    if (s.ros >= 55) {
      if (ok('gsh')) return ['gsh', 'ROS yüksek: NADPH ile glutatyonu yenile, peroksitleri temizle.'];
      if (ok('ppp')) return ['ppp', 'ROS yüksek ama NADPH az: önce pentoz fosfat yoluyla NADPH üret.'];
    }
    if (nad(s) < 3 || s.nadh / K.nadTop >= 0.7) {
      if (o2 && ok('oksfos')) return ['oksfos', 'NADH birikti: solunum zincirinde yükseltgeyip hem ATP kazan hem NAD⁺’yı geri al.'];
      if (!o2 && ok('ldh')) return ['ldh', 'O₂ yok ve NADH birikti: pirüvatı laktata indirgeyerek NAD⁺’yı geri kazan.'];
      if (o2 && adp(s) < 2.5 && ok('bio')) return ['bio', 'ATP dolu, ADP yok: ATP harcamadan zincir dönmez. Biyosentez yap.'];
    }
    if (s.atp < 5 + 2 * bazal(s)) {
      if (o2 && ok('oksfos')) return ['oksfos', 'ATP azalıyor: NADH/FADH₂’yi ATP’ye çevir.'];
      if (o2 && ok('krebs')) return ['krebs', 'ATP azalıyor: asetil-CoA’yı Krebs’te yakıp NADH/FADH₂ topla.'];
      if (o2 && ok('pdh')) return ['pdh', 'ATP azalıyor: pirüvatı mitokondriye sok.'];
      if (ok('glikoliz')) return ['glikoliz', 'ATP azalıyor: glikoliz hızlı (ama az) ATP verir.'];
      if (!o2 && ok('ldh')) return ['ldh', 'Glikolizi sürdürmek için NAD⁺ gerek: laktat fermantasyonu.'];
      if (o2 && ok('box')) return ['box', 'Glukoz yok: yağ asidini β-oksidasyonla yak.'];
      if (s.glc < 1 && ok('yeKarb')) return ['yeKarb', 'ATP azalıyor ve glukoz yok: önce karbonhidrat al, sonra glikoliz.'];
    }
    if (ok('bio') && (o2 || s.atp >= 14)) return ['bio', 'Tüm yapı taşları hazır: büyü!'];
    if (s.nadph < 4 || s.r5p < 1) {
      if (ok('ppp')) return ['ppp', 'Biyosentez için NADPH ve riboz-5-P gerek: pentoz fosfat yolu.'];
    }
    if (s.acoa < 2) {
      if (ok('pdh')) return ['pdh', 'Yağ asidi sentezi için asetil-CoA gerek: pirüvatı PDH’den geçir.'];
      if (ok('glikoliz')) return ['glikoliz', 'Asetil-CoA için önce pirüvat gerek: glikoliz.'];
      if (o2 && ok('box')) return ['box', 'Asetil-CoA’yı yağ asidinden de elde edebilirsin: β-oksidasyon.'];
    }
    if (s.atp < 9 + bazal(s)) {
      if (o2 && ok('oksfos')) return ['oksfos', 'Biyosentez 8 ATP ister: NADH/FADH₂’yi ATP’ye çevir.'];
      if (o2 && ok('krebs')) return ['krebs', 'Biyosentez 8 ATP ister: Krebs döngüsüyle NADH/FADH₂ topla.'];
      if (o2 && ok('box')) return ['box', 'Biyosentez 8 ATP ister: yağ asidi güçlü bir enerji kaynağıdır.'];
      if (ok('glikoliz')) return ['glikoliz', 'Biyosentez 8 ATP ister: glikolizle hem ATP hem pirüvat kazan.'];
      if (!o2 && ok('ldh')) return ['ldh', 'O₂ yokken glikolizi sürdürmek için NAD⁺’yı laktat fermantasyonuyla geri kazan.'];
    }
    if (s.mito < 70 && ok('otofaji')) return ['otofaji', 'Glukoz düşükken otofaji açık: mitokondrileri onar.'];
    if ((s.glc < 2 || s.nadph < 4 || s.r5p < 1) && ok('yeKarb')) return ['yeKarb', 'Glukoz gerekiyor: karbonhidrat ye.'];
    if (s.fa < 1 && ok('yeYag')) return ['yeYag', 'Yedek yakıt olarak yağ asidi al.'];
    if (o2 && ok('oksfos')) return ['oksfos', 'NADH/FADH₂’yi ATP’ye çevir.'];
    if (ok('ldh') && !o2) return ['ldh', 'NAD⁺’yı geri kazan.'];
    return ['bekle', 'Şu an yapılabilecek daha iyi bir hamle yok: bir adım bekle.'];
  }

  var Mantik = { K: K, EYLEM: EYLEM, OLAYLAR: OLAYLAR, yeni: yeni, uygula: uygula, oner: oner, yildiz: yildiz, adp: adp, nad: nad, fad: fad, nadp: nadp, o2Var: o2Var };
  if (typeof module !== 'undefined' && module.exports) { module.exports = Mantik; return; }

  /* ============================== ARAYÜZ ============================== */
  var Oyun = window.Oyun;
  var RENK = { glc: '#60a5fa', pyr: '#f59e42', acoa: '#34d399', e: '#a78bfa', atp: '#fbbf24', nadph: '#f472b6', fa: '#fde68a', lac: '#94a3b8', r5p: '#7dd3fc' };
  var HAVUZ = {
    glc: { ad: 'Glukoz', alt: 'C₆' }, pyr: { ad: 'Pirüvat', alt: 'C₃' }, lac: { ad: 'Laktat', alt: 'kana verilen' },
    acoa: { ad: 'Asetil-CoA', alt: 'C₂' }, fa: { ad: 'Palmitat', alt: 'C₁₆ yağ asidi' }, r5p: { ad: 'Riboz-5-P', alt: 'C₅' }
  };
  var TELLER = [
    ['glc', 'glikoliz'], ['glikoliz', 'pyr'], ['pyr', 'ldh'], ['ldh', 'lac'], ['pyr', 'pdh'], ['pdh', 'acoa'],
    ['fa', 'box'], ['box', 'acoa'], ['acoa', 'krebs'], ['krebs', 'oksfos', 1], ['glc', 'ppp'], ['ppp', 'r5p'],
    ['ppp', 'gsh', 1], ['r5p', 'bio'], ['acoa', 'bio', 1]
  ];

  function kur() {
    var kok = document.getElementById('hucre-kok');
    var s = yeni(), incele = false, dugum = {}, olc = {}, onceki = {};

    function eylemHtml(id, ek) {
      var e = EYLEM[id];
      return '<button class="hc-dugum eylem ' + (ek || '') + '" data-e="' + id + '" style="grid-area:' + id + '">' +
        '<span class="ikon" aria-hidden="true">' + e.ikon + '</span><span class="ad">' + e.ad + '</span><small>' + e.ozet + '</small></button>';
    }
    function havuzHtml(id) {
      var h = HAVUZ[id];
      return '<div class="hc-dugum havuz h-' + id + '" data-h="' + id + '" style="grid-area:' + id + '"><b>0</b><span class="ad">' + h.ad + '</span><small>' + h.alt + '</small></div>';
    }
    function olcer(id, ad) {
      return '<div class="hc-olcer o-' + id + '" data-o="' + id + '"><div class="ust"><span class="ad">' + ad + '</span><b></b><span class="karsi"></span></div><div class="cubuk"><i></i></div></div>';
    }

    kok.innerHTML =
      '<div class="o-bas"><div><div class="o-ust">Oyun 1 · Strateji</div><h3 class="o-baslik">Hücre Yöneticisi</h3>' +
      '<p class="o-alt">Hedef: biyokütleyi %100’e çıkar ve hücreyi böl. Düğümlere tıklayarak yolları çalıştır; her tıklama bir adımdır ve 1 ATP bazal gider yazar. Bir yol çalışmıyorsa neyin eksik olduğunu söyler, adım harcamazsın.</p></div>' +
      '<div class="o-arac"><button class="o-btn" data-is="ipucu">💡 İpucu</button><button class="o-btn" data-is="incele" aria-pressed="false">🔍 İncele</button><button class="o-btn" data-is="yeniden">↺ Yeniden</button></div></div>' +

      '<div class="hc-hud">' + olcer('atp', 'ATP') + olcer('nadh', 'NADH') + olcer('fadh2', 'FADH₂') + olcer('nadph', 'NADPH') +
      olcer('ros', 'ROS') + olcer('mito', 'Mitokondri') + olcer('bio', 'Biyokütle') + '</div>' +

      '<div class="hc-serit"><span class="hc-adim"></span><span class="hc-olaycip"></span></div>' +

      '<div class="hc-tahta"><svg class="hc-teller" aria-hidden="true"></svg>' +
      '<div class="hc-kan"><span class="hc-bolge">Kan · besin</span>' +
      eylemHtml('yeKarb', 'yatay') + eylemHtml('yeYag', 'yatay') + eylemHtml('bekle', 'yatay') +
      '<span class="hc-o2" data-o2></span></div>' +
      '<div class="hc-sito"><span class="hc-bolge">Sitozol</span>' +
      havuzHtml('glc') + eylemHtml('glikoliz') + havuzHtml('pyr') + eylemHtml('ldh') + havuzHtml('lac') +
      eylemHtml('ppp') + eylemHtml('gsh') + havuzHtml('r5p') + havuzHtml('fa') +
      '<div class="hc-mito" style="grid-area:mito"><span class="hc-bolge">Mitokondri</span>' +
      eylemHtml('pdh') + havuzHtml('acoa') + eylemHtml('krebs') + eylemHtml('box') + eylemHtml('oksfos') + '</div>' +
      eylemHtml('bio', 'genis') + eylemHtml('otofaji') +
      '</div></div>' +

      '<div class="hc-alt"><div class="o-panel hc-mesaj" aria-live="polite"><div class="o-panel-bas">Ne oldu?</div><div class="hc-son"></div><div class="hc-denklem"></div><div class="hc-bilgi"></div></div>' +
      '<div class="o-panel hc-gunluk"><div class="o-panel-bas">Günlük</div><ul></ul></div></div>' +

      '<details class="o-not"><summary>Model notu: neler sadeleştirildi?</summary><ul>' +
      '<li>Stokiyometri gerçektir; havuz boyutları (30 adenin nükleotidi, 20 NAD, 10 FAD, 10 NADP) ve ROS/biyokütle puanları oyun ölçeğidir.</li>' +
      '<li>Sitozolik ve mitokondriyel NADH tek havuzda gösterilir. Gerçekte sitozolik NADH malat–aspartat ya da gliserol-3-fosfat mekiğiyle taşınır; glukoz başına verim bu yüzden 30–32 ATP arasındadır.</li>' +
      '<li>ATP + ADP toplamı sabittir: ADP bitince ATP sentaz durur (solunum kontrolü). Gerçek hücrede AMP ve fosfokreatin de bu dengenin parçasıdır.</li>' +
      '<li>Pentoz fosfat yolunda riboz-5-P deposu dolduğunda fazla pentoz, oksidatif olmayan kolla glikolize geri döner (6 pentoz → 5 heksoz); ara basamaklar tek tek gösterilmez.</li>' +
      '<li>Otofajinin yalnızca glukoz azken açılması, insülin/mTORC1/AMPK düzenlemesinin sadeleştirilmiş halidir.</li>' +
      '</ul></details>' +
      '<div class="o-perde"><div class="o-sonuc"></div></div>';

    kok.querySelectorAll('[data-e]').forEach(function (b) { dugum[b.getAttribute('data-e')] = b; });
    kok.querySelectorAll('[data-h]').forEach(function (b) { dugum[b.getAttribute('data-h')] = b; });
    kok.querySelectorAll('[data-o]').forEach(function (b) { olc[b.getAttribute('data-o')] = b; });

    var tahta = kok.querySelector('.hc-tahta'), teller = kok.querySelector('.hc-teller');
    var son = kok.querySelector('.hc-son'), denk = kok.querySelector('.hc-denklem'), bilgi = kok.querySelector('.hc-bilgi');
    var gunluk = kok.querySelector('.hc-gunluk ul'), perde = kok.querySelector('.o-perde');

    function merkez(id) {
      var el = dugum[id] || olc[id];
      if (!el) return null;
      var a = el.getBoundingClientRect(), t = tahta.getBoundingClientRect();
      return { x: a.left - t.left + a.width / 2, y: a.top - t.top + a.height / 2 };
    }

    function telCiz() {
      var t = tahta.getBoundingClientRect();
      if (!t.width) return;
      teller.setAttribute('viewBox', '0 0 ' + t.width + ' ' + t.height);
      var h = '';
      TELLER.forEach(function (w) {
        var a = merkez(w[0]), b = merkez(w[1]);
        if (!a || !b) return;
        h += '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"' + (w[2] ? ' class="kesik"' : '') + '/>';
      });
      teller.innerHTML = h;
    }

    function uc(kaynak, hedef, renk, adet) {
      if (Oyun.hareketAz() || !tahta.animate) return;
      var a = merkez(kaynak), b = merkez(hedef);
      if (!a || !b) return;
      adet = Math.min(adet, 8);
      for (var i = 0; i < adet; i++) {
        (function (i) {
          var p = document.createElement('i');
          p.className = 'hc-top';
          p.style.background = RENK[renk] || '#fff';
          p.style.boxShadow = '0 0 10px ' + (RENK[renk] || '#fff');
          tahta.appendChild(p);
          var sap = (i - (adet - 1) / 2) * 5;
          var an = p.animate([
            { transform: 'translate(' + (a.x - 5) + 'px,' + (a.y - 5 + sap) + 'px) scale(.6)', opacity: 0 },
            { opacity: 1, offset: 0.15 },
            { transform: 'translate(' + (b.x - 5) + 'px,' + (b.y - 5 + sap) + 'px) scale(1)', opacity: 1, offset: 0.9 },
            { transform: 'translate(' + (b.x - 5) + 'px,' + (b.y - 5) + 'px) scale(.3)', opacity: 0 }
          ], { duration: 620, delay: i * 70, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
          an.onfinish = function () { p.remove(); };
          an.oncancel = function () { p.remove(); };
        })(i);
      }
    }

    function olcerYaz(id, deger, karsi, oran, sinif) {
      var el = olc[id];
      el.querySelector('b').textContent = deger;
      el.querySelector('.karsi').textContent = karsi || '';
      el.querySelector('i').style.width = Math.max(0, Math.min(100, oran * 100)) + '%';
      el.classList.remove('iyi', 'orta', 'kotu');
      if (sinif) el.classList.add(sinif);
      if (onceki[id] !== undefined && onceki[id] !== deger) {
        el.classList.remove('vur'); void el.offsetWidth; el.classList.add('vur');
      }
      onceki[id] = deger;
    }

    function ciz() {
      Object.keys(HAVUZ).forEach(function (id) {
        var el = dugum[id], b = el.querySelector('b'), v = f(s[id]);
        if (b.textContent !== v) { b.textContent = v; el.classList.remove('vur'); void el.offsetWidth; el.classList.add('vur'); }
        el.classList.toggle('bos', s[id] <= 0);
      });
      Object.keys(EYLEM).forEach(function (id) {
        var k = !!EYLEM[id].engel(s);
        dugum[id].classList.toggle('kisik', k);
        dugum[id].setAttribute('aria-disabled', k ? 'true' : 'false');
      });
      var r = s.nadh / K.nadTop;
      olcerYaz('atp', f(s.atp), 'ADP ' + f(adp(s)), s.atp / K.adTop, s.atp < 5 ? 'kotu' : (s.atp < 9 ? 'orta' : 'iyi'));
      olcerYaz('nadh', String(s.nadh), 'NAD⁺ ' + nad(s), r, r >= 0.7 ? 'kotu' : (r >= 0.5 ? 'orta' : 'iyi'));
      olcerYaz('fadh2', String(s.fadh2), 'FAD ' + fad(s), s.fadh2 / K.fadTop, '');
      olcerYaz('nadph', String(s.nadph), 'NADP⁺ ' + nadp(s), s.nadph / K.nadpTop, '');
      olcerYaz('ros', f(s.ros), s.ros >= 60 ? 'tehlike' : (s.ros >= 35 ? 'dikkat' : 'güvenli'), s.ros / 100, s.ros >= 60 ? 'kotu' : (s.ros >= 35 ? 'orta' : 'iyi'));
      olcerYaz('mito', '%' + Math.round(s.mito), s.mito >= 67 ? 'sağlıklı' : 'kapasite düştü', s.mito / 100, s.mito >= 67 ? 'iyi' : (s.mito >= 34 ? 'orta' : 'kotu'));
      olcerYaz('bio', '%' + s.bio, 'hedef %100', s.bio / K.hedef, 'iyi');

      kok.querySelector('.hc-adim').textContent = 'Adım ' + s.adim + (s.kriz ? ' · ' + s.kriz + ' kriz' : '');
      var cip = kok.querySelector('.hc-olaycip');
      if (s.olay) {
        cip.className = 'hc-olaycip aktif';
        cip.textContent = s.olay.ikon + ' ' + s.olay.ad + ' · ' + s.olay.kalan + ' adım kaldı';
      } else if (s.sonrakiOlay - s.adim <= 2) {
        var o = OLAYLAR[s.olaySira[0]];
        cip.className = 'hc-olaycip yakin';
        cip.textContent = 'Yaklaşıyor (' + Math.max(1, s.sonrakiOlay - s.adim) + ' adım): ' + o.ikon + ' ' + o.ad;
      } else {
        cip.className = 'hc-olaycip';
        cip.textContent = 'Koşullar normal';
      }
      var o2 = kok.querySelector('[data-o2]');
      o2.textContent = o2Var(s) ? 'O₂ var' : 'O₂ yok';
      o2.classList.toggle('yok', !o2Var(s));
      tahta.classList.toggle('hipoksi', !o2Var(s));
    }

    function mesaj(tip, m, id) {
      son.className = 'hc-son ' + tip;
      son.innerHTML = m;
      if (id) {
        denk.innerHTML = EYLEM[id].denklem;
        bilgi.textContent = EYLEM[id].bilgi;
      }
    }
    function gunlugeYaz(tip, m) {
      var li = document.createElement('li');
      li.className = tip;
      li.innerHTML = '<span>' + s.adim + '</span>' + m;
      gunluk.insertBefore(li, gunluk.firstChild);
      while (gunluk.children.length > 40) gunluk.removeChild(gunluk.lastChild);
    }

    function isaretKaldir() { kok.querySelectorAll('.oneri').forEach(function (e) { e.classList.remove('oneri'); }); }

    function tikla(id) {
      isaretKaldir();
      var e = EYLEM[id];
      if (incele) {
        var n = e.engel(s);
        mesaj('notr', '<b>' + e.ad + '</b> — ' + (n ? 'Şu an çalışmaz: ' + n : 'şu an çalıştırılabilir.'), id);
        return;
      }
      var r = uygula(s, id);
      if (!r) return;
      if (!r.tur) {
        mesaj('uyari', r.m, id);
        dugum[id].classList.remove('salla'); void dugum[id].offsetWidth; dugum[id].classList.add('salla');
        return;
      }
      r.akis.forEach(function (a) { uc(a[0], a[1], a[2], a[3]); });
      dugum[id].classList.remove('calis'); void dugum[id].offsetWidth; dugum[id].classList.add('calis');
      var tip = 'iyi', metin = r.m;
      gunlugeYaz('iyi', r.m);
      r.ek.forEach(function (x) {
        metin += '<br><span class="ek ' + x.tip + '">' + x.m + '</span>';
        gunlugeYaz(x.tip, x.m);
        if (x.tip === 'kotu') tip = 'kotu';
      });
      mesaj(tip, metin, id);
      ciz();
      if (s.bitti) setTimeout(bitir, 500);
    }

    function bitir() {
      var y = yildiz(s), top = s.ist.atpSub + s.ist.atpOks;
      Oyun.yildizVer('hucre', y);
      perde.querySelector('.o-sonuc').innerHTML =
        '<div class="hc-bolunme" aria-hidden="true"><span></span><span></span></div>' +
        '<h4>Hücre bölündü!</h4><div class="yildizlar">' + Oyun.yildizMetni(y) + '</div>' +
        '<table>' +
        '<tr><td>Adım sayısı</td><td>' + s.adim + '</td></tr>' +
        '<tr><td>Kriz</td><td>' + s.kriz + '</td></tr>' +
        '<tr><td>Kullanılan glukoz / palmitat</td><td>' + s.ist.glc + ' / ' + s.ist.yag + '</td></tr>' +
        '<tr><td>Substrat düzeyinde üretilen ATP</td><td>' + f(s.ist.atpSub) + '</td></tr>' +
        '<tr><td>Oksidatif fosforilasyonla üretilen ATP</td><td>' + f(s.ist.atpOks) + (top ? ' (%' + Math.round(100 * s.ist.atpOks / top) + ')' : '') + '</td></tr>' +
        '<tr><td>Kana verilen laktat</td><td>' + s.lac + '</td></tr></table>' +
        '<ul class="ogrenilen">' +
        '<li>ATP’nin büyük kısmı substrat düzeyinde değil, zar üzerindeki proton gradyanıyla üretilir.</li>' +
        '<li>Büyüme yalnızca enerji işi değildir: karbonun bir bölümü yakılmak yerine NADPH ve yapı taşına ayrılmalıdır.</li>' +
        '<li>NAD⁺ ve ADP geri dönüştürülmeden akış durur; biriken NADH ise ROS’a dönüşür. Sağlık, akışın sürmesidir.</li></ul>' +
        '<div class="dugmeler"><button class="o-btn ana" data-is="yeniden">Tekrar oyna</button><button class="o-btn" data-page="oyunlar">Oyun merkezi</button></div>' +
        '<p style="margin-top:10px;color:var(--soluk);font-size:13px">3 yıldız: krizsiz ve en çok 60 adım · 2 yıldız: en çok 1 kriz ve 85 adım.</p>';
      perde.classList.add('acik');
    }

    function yeniden() {
      s = yeni(); onceki = {};
      perde.classList.remove('acik');
      gunluk.innerHTML = '';
      isaretKaldir();
      son.className = 'hc-son notr';
      son.innerHTML = 'Hücren hazır. Önerilen ilk hamle: <b>Glikoliz</b> ile bir glukozu pirüvata çevir, sonra <b>PDH → Krebs → Oksidatif fosforilasyon</b> hattını izle.';
      denk.innerHTML = ''; bilgi.textContent = '';
      ciz();
    }

    kok.addEventListener('click', function (olay) {
      var b = olay.target.closest('[data-e]');
      if (b) { tikla(b.getAttribute('data-e')); return; }
      var is = olay.target.closest('[data-is]');
      if (!is) return;
      var ne = is.getAttribute('data-is');
      if (ne === 'yeniden') yeniden();
      else if (ne === 'incele') {
        incele = !incele;
        is.classList.toggle('ana', incele);
        is.setAttribute('aria-pressed', incele ? 'true' : 'false');
        kok.classList.toggle('incele', incele);
        mesaj('notr', incele ? 'İncele modu açık: düğümlere tıklamak yolu çalıştırmaz, yalnızca tepkimeyi ve gerekçesini gösterir.' : 'İncele modu kapandı: tıklamalar yeniden yolu çalıştırır.');
      } else if (ne === 'ipucu') {
        var o = oner(s);
        isaretKaldir();
        dugum[o[0]].classList.add('oneri');
        mesaj('ipucu', '💡 <b>' + EYLEM[o[0]].ad + '</b> — ' + o[1], o[0]);
      }
    });

    var bekleyen = null;
    window.addEventListener('resize', function () {
      clearTimeout(bekleyen);
      bekleyen = setTimeout(telCiz, 120);
    });

    yeniden();
    telCiz();
    setTimeout(telCiz, 300);
    return { telCiz: telCiz };
  }

  var ornek = null;
  window.Oyun.kaydet('oyun-hucre', function () { ornek = kur(); }, function (acik) { if (acik && ornek) ornek.telCiz(); });
})();
