/* Kitap sayfalarındaki (Bölüm 1–4) özgün şemalar.
   Her çizim, index.html içindeki <div class="kt-ciz" data-sekil="..."> yer tutucusuna
   satır içi SVG olarak üretilir. Kitabın kendi çizimleri kopyalanmamıştır; şemalar
   bölümlerde anlatılan mekanizmalardan yeniden kurulmuştur. */
(function () {
    'use strict';

    var RAD = Math.PI / 180;

    /* ---------- metin genişliği ---------- */
    var olcer = null, aile = null;
    function gen(yazi, px, kalin) {
        try {
            if (!olcer) {
                olcer = document.createElement('canvas').getContext('2d');
                aile = window.getComputedStyle(document.body).fontFamily || 'sans-serif';
            }
            var agirlik = kalin ? '600 ' : '';
            olcer.font = agirlik + px + 'px ' + aile;
            if (olcer.font.indexOf(px + 'px') < 0) olcer.font = agirlik + px + 'px sans-serif';
            return olcer.measureText(yazi).width;
        } catch (e) {
            return yazi.length * px * 0.57;
        }
    }

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
    function n(v) { return Math.round(v * 10) / 10; }

    /* ---------- çizim yüzeyi ---------- */
    function Cizim(w, h, etiket) {
        this.w = w; this.h = h; this.etiket = etiket;
        this.g0 = []; this.g1 = []; this.g2 = [];
    }
    Cizim.prototype.ham = function (kat, s) { this['g' + kat].push(s); };
    Cizim.prototype.yazi = function (x, y, s, sinif, hiza, ek) {
        this.g2.push('<text x="' + n(x) + '" y="' + n(y) + '"' + (sinif ? ' class="' + sinif + '"' : '') +
            (hiza ? ' text-anchor="' + hiza + '"' : '') + (ek || '') + '>' + esc(s) + '</text>');
    };
    Cizim.prototype.bas = function (x, y, aci, sinif, boy) {
        var L = boy || 9, W = L * 0.48, c = Math.cos(aci), s = Math.sin(aci);
        var bx = x - L * c, by = y - L * s;
        this.g1.push('<polygon class="okb' + (sinif ? ' ' + sinif : '') + '" points="' +
            n(x) + ',' + n(y) + ' ' + n(bx - W * s) + ',' + n(by + W * c) + ' ' + n(bx + W * s) + ',' + n(by - W * c) + '"/>');
    };
    Cizim.prototype.ok = function (x1, y1, x2, y2, sinif, ikiYon) {
        var a = Math.atan2(y2 - y1, x2 - x1), k = 6;
        var sx = ikiYon ? x1 + k * Math.cos(a) : x1, sy = ikiYon ? y1 + k * Math.sin(a) : y1;
        this.g1.push('<line class="ok' + (sinif ? ' ' + sinif : '') + '" x1="' + n(sx) + '" y1="' + n(sy) +
            '" x2="' + n(x2 - k * Math.cos(a)) + '" y2="' + n(y2 - k * Math.sin(a)) + '"/>');
        this.bas(x2, y2, a, sinif);
        if (ikiYon) this.bas(x1, y1, a + Math.PI, sinif);
    };
    Cizim.prototype.yol = function (d, sinif) {
        this.g1.push('<path class="ok' + (sinif ? ' ' + sinif : '') + '" d="' + d + '"/>');
    };
    /* Molekül kapsülü: ad + isteğe bağlı karbon rozeti (C2…C6) ya da iki satır (ad + alt). */
    Cizim.prototype.hap = function (x, y, ad, sec) {
        sec = sec || {};
        var c = sec.c, alt = sec.alt, w, h, s = '';
        if (alt) {
            w = Math.max(gen(ad, 13, true), gen(alt, 10.5)) + 24; h = 40;
        } else {
            w = gen(ad, 13, true) + (c ? 27 : 0) + 22; h = 28;
        }
        w = Math.round(w);
        if (x + w / 2 > this.w - 5) x = this.w - 5 - w / 2;
        if (x - w / 2 < 5) x = 5 + w / 2;
        s += '<g class="hap' + (sec.sinif ? ' ' + sec.sinif : '') + '">';
        s += '<rect x="' + n(x - w / 2) + '" y="' + n(y - h / 2) + '" width="' + w + '" height="' + h + '" rx="' + (alt ? 12 : 14) + '"/>';
        if (alt) {
            s += '<text class="ad" x="' + n(x) + '" y="' + n(y - 3) + '" text-anchor="middle">' + esc(ad) + '</text>';
            s += '<text class="alt" x="' + n(x) + '" y="' + n(y + 11.5) + '" text-anchor="middle">' + esc(alt) + '</text>';
        } else if (c) {
            s += '<circle class="rozet" cx="' + n(x - w / 2 + 15) + '" cy="' + n(y) + '" r="10.5"/>';
            s += '<text class="rozet-t" x="' + n(x - w / 2 + 15) + '" y="' + n(y + 3.5) + '" text-anchor="middle">C' + c + '</text>';
            s += '<text class="ad" x="' + n(x - w / 2 + 31) + '" y="' + n(y + 4.5) + '">' + esc(ad) + '</text>';
        } else {
            s += '<text class="ad" x="' + n(x) + '" y="' + n(y + 4.5) + '" text-anchor="middle">' + esc(ad) + '</text>';
        }
        s += '</g>';
        this.g2.push(s);
        return { x: x, y: y, w: w, h: h, sol: x - w / 2, sag: x + w / 2, ust: y - h / 2, alt: y + h / 2 };
    };
    /* Küçük etiket çipi. hiza: 'm' (ortala), 's' (soldan başla), 'e' (sağda bitir). Genişliği döndürür. */
    Cizim.prototype.cip = function (x, y, s, tur, hiza) {
        var w = Math.round(gen(s, 11.5, true) + 13), h = 20;
        var sol = hiza === 's' ? x : hiza === 'e' ? x - w : x - w / 2;
        this.g2.push('<g class="cip cip-' + tur + '"><rect x="' + n(sol) + '" y="' + n(y - h / 2) + '" width="' + w +
            '" height="' + h + '" rx="6"/><text x="' + n(sol + w / 2) + '" y="' + n(y + 4) + '" text-anchor="middle">' + esc(s) + '</text></g>');
        return w;
    };
    /* Çipleri yan yana dizer; x merkez kabul edilir. liste: [[yazi, tur], ...] */
    Cizim.prototype.cipler = function (x, y, liste, hiza) {
        var i, top = 0, ara = 5, w = [];
        for (i = 0; i < liste.length; i++) { w[i] = Math.round(gen(liste[i][0], 11.5, true) + 13); top += w[i]; }
        top += ara * (liste.length - 1);
        var bas = hiza === 's' ? x : hiza === 'e' ? x - top : x - top / 2;
        for (i = 0; i < liste.length; i++) { this.cip(bas, y, liste[i][0], liste[i][1], 's'); bas += w[i] + ara; }
        return top;
    };
    Cizim.prototype.kutu = function (x, y, w, h, sinif) {
        this.g0.push('<rect class="kutu' + (sinif ? ' ' + sinif : '') + '" x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" rx="10"/>');
    };
    Cizim.prototype.svg = function (maks) {
        return '<svg class="kt-svg" viewBox="0 0 ' + this.w + ' ' + this.h + '" role="img" aria-label="' + esc(this.etiket) +
            '" style="max-width:' + (maks || Math.round(this.w * 1.3)) + 'px">' +
            this.g0.join('') + this.g1.join('') + this.g2.join('') + '</svg>';
    };

    function elips(cx, cy, rx, ry, derece) {
        var t = derece * RAD;
        return { x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t), t: t };
    }

    var SEKIL = {};

    /* ===== 1.3 Krebs döngüsü: bir pirüvatın hesabı ===== */
    SEKIL.krebs = function () {
        var c = new Cizim(420, 508, 'Krebs döngüsü: pirüvat asetil-CoA’ya dönüşür, asetil-CoA oksaloasetatla birleşip sitratı oluşturur; ' +
            'bir turda iki CO₂ ve dört çift hidrojen (2H) ayrılır, bir GTP oluşur ve oksaloasetat yenilenir.');
        var cx = 208, cy = 312, rx = 130, ry = 166, i, p;
        c.ham(0, '<ellipse class="halka" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/>');

        // döngü yönü (saat yönünde) ok uçları
        var yon = [-60, -22.5, 22.5, 60, 120, 157.5, 202.5, 240];
        for (i = 0; i < yon.length; i++) {
            p = elips(cx, cy, rx, ry, yon[i]);
            c.bas(p.x, p.y, Math.atan2(ry * Math.cos(p.t), -rx * Math.sin(p.t)), '', 11);
        }

        // giriş: pirüvat → asetil-CoA → sitrat
        c.hap(208, 24, 'Pirüvat', { c: 3 });
        c.ok(208, 39, 208, 71);
        c.cipler(222, 55, [['CO₂', 'co2'], ['2H', 'h2']], 's');
        c.hap(208, 86, 'Asetil-CoA', { c: 2 });
        c.ok(208, 101, 208, 131);

        var D = [
            ['Sitrat', 6, -90, 1], ['İzositrat', 6, -45, 0], ['α-Ketoglutarat', 5, 0, 1], ['Süksinil-CoA', 4, 45, 1],
            ['Süksinat', 4, 90, 0], ['Fumarat', 4, 135, 0], ['Malat', 4, 180, 1], ['Oksaloasetat', 4, -135, 1]
        ];
        for (i = 0; i < D.length; i++) {
            p = elips(cx, cy, rx, ry, D[i][2]);
            c.hap(p.x, p.y, D[i][0], { c: D[i][1], sinif: D[i][3] ? 'kavsak' : '' });
        }

        // adımlarda ayrılan / giren parçalar
        c.cipler(343, 252, [['CO₂', 'co2'], ['2H', 'h2']], 's');   // izositrat → α-ketoglutarat
        c.cipler(343, 372, [['CO₂', 'co2'], ['2H', 'h2']], 's');   // α-ketoglutarat → süksinil-CoA
        c.cip(308, 472, 'GTP', 'atp', 'm');                         // süksinil-CoA → süksinat
        c.cip(104, 472, '2H · FAD', 'h2', 'm');                     // süksinat → fumarat
        c.cip(76, 372, '+H₂O', 'o2', 'e');                          // fumarat → malat
        c.cip(76, 252, '2H', 'h2', 'e');                            // malat → oksaloasetat

        // ortadaki bilanço
        c.yazi(193, 286, '1 pirüvat →', 't-k', 'middle');
        c.cip(193, 306, '3 CO₂', 'co2', 'm');
        c.cip(193, 331, '5 × 2H', 'h2', 'm');
        c.cip(193, 356, '1 GTP', 'atp', 'm');
        return c.svg(520);
    };

    /* ===== 1.4 Kemiozmoz: solunum zinciri ve ATP sentaz ===== */
    SEKIL.kemiozmoz = function () {
        var c = new Cizim(420, 292, 'Solunum zinciri: NADH’nin elektronları kompleks I, III ve IV üzerinden oksijene akarken ' +
            'toplam on proton zarın dışına pompalanır; protonlar ATP sentazdan geri akarken ATP sentezlenir.');
        var zy = 122, zh = 58, orta = zy + zh / 2, i;
        c.ham(0, '<rect class="zar" x="26" y="' + zy + '" width="386" height="' + zh + '" rx="4"/>');
        c.yazi(26, 18, 'Zarlar arası boşluk', 't-m t-b');
        c.yazi(26, 33, 'H⁺ derişimi yüksek · (+) yüklü', 't-k');
        c.yazi(26, 284, 'Matriks · H⁺ derişimi düşük · (−) yüklü', 't-k');

        // zar kalınlığı
        c.ham(1, '<line class="eksen" x1="14" y1="' + zy + '" x2="14" y2="' + (zy + zh) + '"/>' +
            '<line class="eksen" x1="10" y1="' + zy + '" x2="18" y2="' + zy + '"/>' +
            '<line class="eksen" x1="10" y1="' + (zy + zh) + '" x2="18" y2="' + (zy + zh) + '"/>');
        c.yazi(9, orta, '≈ 6 nm', 't-k', 'middle', ' transform="rotate(-90 9 ' + orta + ')"');

        // kompleksler: [ad, sol, genişlik, üst, yükseklik, H⁺ okunun x'i, numaranın x'i]
        var P = [['I', 34, 64, 110, 104, 82, 80], ['III', 136, 54, 112, 88, 150, 172], ['IV', 228, 54, 112, 88, 268, 264]];
        for (i = 0; i < P.length; i++) {
            c.ham(0, '<rect class="prot" x="' + P[i][1] + '" y="' + P[i][3] + '" width="' + P[i][2] + '" height="' + P[i][4] + '" rx="14"/>');
            c.yazi(P[i][6], P[i][3] + P[i][4] - 7, P[i][0], 'prot-t', 'middle');
            c.ok(P[i][5], zy + 22, P[i][5], 78, 'hp');
        }
        c.cip(82, 64, '4 H⁺', 'hp', 'm');
        c.cip(150, 64, '4 H⁺', 'hp', 'm');
        c.cip(268, 64, '2 H⁺', 'hp', 'm');

        // ATP sentaz
        c.ham(0, '<rect class="prot sentaz" x="351" y="182" width="10" height="20"/>' +
            '<rect class="prot sentaz" x="330" y="114" width="52" height="72" rx="10"/>' +
            '<circle class="prot sentaz" cx="356" cy="222" r="24"/>');
        c.yazi(356, 226, 'F₁', 't-k t-b', 'middle');
        c.yazi(372, 176, 'F₀', 't-k t-b', 'middle');
        c.ok(356, 78, 356, 174, 'hp');
        c.cip(356, 64, '8 H⁺', 'hp', 'm');
        c.yazi(356, 44, 'ATP sentaz', 't-k t-b', 'middle');
        c.yazi(340, 268, '3 ADP + 3 Pi → 3 ATP', 't-m t-b', 'middle');

        // elektron yolu (noktalı)
        c.yol('M52 222 L52 162 Q52 151 63 151 L176 151 L176 138 C176 94 242 94 242 138 L242 205', 'el');
        c.bas(242, 211, Math.PI / 2, 'el');
        c.yazi(117, 144, 'Q', 't-k t-b', 'middle');
        c.yazi(209, 96, 'sit c', 't-k t-b', 'middle');
        c.yazi(56, 240, 'NADH', 't-m t-b', 'middle');
        c.yazi(56, 255, '→ NAD⁺ + 2e⁻', 't-k', 'middle');
        c.yazi(236, 230, '½ O₂ + 2 H⁺', 't-m t-b', 'middle');
        c.yazi(236, 245, '→ H₂O', 't-k', 'middle');
        return c.svg(600);
    };

    /* ===== 2.2a Calvin–Benson döngüsü ===== */
    SEKIL.calvin = function () {
        var c = new Cizim(340, 344, 'Calvin–Benson döngüsü: beş karbonlu ribuloz bisfosfat CO₂ alır, üç karbonlu fosfogliserata bölünür; ' +
            'fosfogliserat indirgenerek üç karbonlu şekere dönüşür; altı şekerden beşi yeniden ribuloz bisfosfata çevrilir, biri net üründür.');
        var cx = 170, cy = 196, r = 100, p;
        c.ham(0, '<circle class="halka" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>');
        c.yazi(170, 22, 'Işık + H₂O → ½ O₂ + 2H', 't-m t-b', 'middle');

        var yon = [-30, 90, 210], i;
        for (i = 0; i < yon.length; i++) {
            p = elips(cx, cy, r, r, yon[i]);
            c.bas(p.x, p.y, (yon[i] + 90) * RAD, '', 11);
        }
        c.hap(170, 96, 'C5 şeker', { alt: 'ribuloz bisfosfat' });
        c.hap(256.6, 246, 'C3 asit', { alt: 'fosfogliserat' });
        c.hap(83.4, 246, 'C3 şeker', { alt: 'gliseraldehit fosfat' });

        c.cip(290, 126, '+CO₂', 'co2', 'm');
        c.yazi(296, 150, 'rubisko', 't-k t-i', 'middle');
        c.cipler(170, 320, [['+2H', 'h2'], ['ATP', 'atp']], 'm');
        c.cip(50, 128, 'ATP', 'atp', 'm');
        c.yazi(8, 104, '5 × C3 → 3 × C5', 't-k');

        c.ok(50, 268, 34, 296);
        c.yazi(8, 312, 'net ürün:', 't-k');
        c.yazi(8, 326, '1 C3 şeker / 3 tur', 't-k t-b');

        c.yazi(170, 190, '3 CO₂ → 1 C3 şeker', 't-m t-b', 'middle');
        c.yazi(170, 207, '9 ATP + 6 NADPH', 't-k', 'middle');
        return c.svg(420);
    };

    /* ===== 2.2b Ters (indirgeyici) Krebs döngüsü ===== */
    SEKIL.tersKrebs = function () {
        var c = new Cizim(340, 344, 'Ters Krebs döngüsü: asetil-CoA’ya art arda CO₂ ve hidrojen eklenerek pirüvat, oksaloasetat, ' +
            'α-ketoglutarat ve sitrat oluşur; sitrat asetil-CoA ile oksaloasetata bölünür. Her turda dört CO₂ bağlanır ve bir oksaloasetat kazanılır.');
        var cx = 170, cy = 196, r = 104, p, i;
        c.ham(0, '<circle class="halka" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>');
        c.yazi(8, 22, 'Işık + H₂S → S + 2H', 't-m t-b');

        // saat yönünün tersine ok uçları
        var yon = [-126, -193.5, 90, 13.5, -54];
        for (i = 0; i < yon.length; i++) {
            p = elips(cx, cy, r, r, yon[i]);
            c.bas(p.x, p.y, (yon[i] - 90) * RAD, '', 11);
        }
        var D = [['Asetil-CoA', 2, -90], ['Pirüvat', 3, -162], ['Oksaloasetat', 4, 135], ['α-Ketoglutarat', 5, 45], ['Sitrat', 6, -18]];
        for (i = 0; i < D.length; i++) {
            p = elips(cx, cy, r, r, D[i][2]);
            c.hap(p.x, p.y, D[i][0], { c: D[i][1] });
        }

        c.cip(92, 78, '+CO₂', 'co2', 'm');                     // C2 → C3
        c.cip(48, 102, '+2H · Fd', 'fd', 'm');
        c.cip(34, 212, '+CO₂', 'co2', 'm');                    // C3 → C4
        c.cip(31, 236, 'ATP', 'atp', 'm');
        c.cipler(170, 322, [['+CO₂', 'co2'], ['+2H · Fd', 'fd'], ['+2 × 2H', 'h2'], ['ATP', 'atp']], 'm');   // C4 → C5
        c.cip(306, 212, '+CO₂', 'co2', 'm');                   // C5 → C6
        c.cip(309, 236, '+2H', 'h2', 'm');

        // sitratın bölünmesi: net ürün
        c.ok(240, 104, 262, 64);
        c.cip(296, 92, 'ATP', 'atp', 'm');
        c.yazi(272, 24, 'net ürün', 't-k', 'middle');
        c.hap(272, 44, 'Oksaloasetat', { c: 4, sinif: 'urun' });

        c.yazi(170, 190, '4 CO₂ + 5 × 2H', 't-m t-b', 'middle');
        c.yazi(170, 207, '→ 1 oksaloasetat', 't-k', 'middle');
        return c.svg(420);
    };

    /* ===== 3.1 Alkali baca gözeneği ve protohücre ===== */
    function gozenekZemin(c) {
        c.ham(0, '<rect class="okyanus" x="0" y="0" width="340" height="300" rx="10"/>' +
            '<path class="gozenek" d="M46 306 L46 190 A124 124 0 0 1 294 190 L294 306"/>');
        c.yazi(10, 20, 'Okyanus', 't-m t-b');
        c.yazi(10, 35, 'asidik · CO₂ çok', 't-k');
        c.yazi(322, 250, 'FeS mineral duvar', 'fes-t', 'middle', ' transform="rotate(-90 322 250)"');
    }
    SEKIL.gozenek = function () {
        var c = new Cizim(340, 300, 'İnorganik gözenek: asidik okyanustan protonlar ve CO₂ demir–kükürt duvardan geçer; ' +
            'gözeneğin içindeki alkali akışkanın taşıdığı H₂ ile birleşerek organik madde oluşturur.');
        gozenekZemin(c);
        c.ok(170, 42, 170, 108, 'hp');
        c.cip(170, 30, 'H⁺', 'hp', 'm');
        c.ok(60, 80, 112, 132, 'hp');
        c.cip(52, 68, 'H⁺', 'hp', 'm');
        c.ok(280, 80, 228, 132, 'co2');
        c.cip(288, 68, 'CO₂', 'co2', 'm');

        c.ham(2, '<rect class="kutu" x="98" y="150" width="144" height="46" rx="10"/>');
        c.yazi(170, 170, 'CO₂ + H₂ → CH₂O', 't-b', 'middle');
        c.yazi(170, 186, 'organik madde', 't-k', 'middle');

        c.ok(92, 294, 92, 232, 'h2');
        c.cip(92, 268, 'H₂', 'h2', 'm');
        c.ok(248, 232, 248, 294);
        c.cip(248, 262, 'OH⁻', 'o2', 'm');
        c.yazi(170, 250, 'alkali akışkan', 't-m t-b', 'middle');
        c.yazi(170, 265, 'H₂ çok', 't-k', 'middle');
        return c.svg(420);
    };
    SEKIL.protohucre = function () {
        var c = new Cizim(340, 300, 'Gözeneğe yerleşmiş protohücre: protonlar önce mineral duvardan, sonra yağ asidi zarındaki ' +
            'demir–kükürt kümeleri üzerinden hücrenin içine akar ve içeride CO₂ ile H₂’nin birleşmesini sürer.');
        gozenekZemin(c);
        c.ham(0, '<circle class="hucre" cx="170" cy="134" r="54"/><circle class="hucre-ic" cx="170" cy="134" r="49"/>');
        c.ok(170, 42, 170, 104, 'hp');
        c.cip(170, 30, 'H⁺', 'hp', 'm');
        c.ok(72, 72, 131, 108, 'hp');
        c.cip(60, 64, 'H⁺', 'hp', 'm');
        c.ok(268, 72, 209, 108, 'co2');
        c.cip(282, 64, 'CO₂', 'co2', 'm');
        // zardaki FeS kümeleri (ön-Ech)
        c.ham(2, '<polygon class="kume" points="170,76 177,88 163,88"/>' +
            '<polygon class="kume" points="119,93 130,97 120,107"/>');

        c.yazi(170, 136, 'CO₂ + H₂', 't-b', 'middle');
        c.yazi(170, 153, '→ CH₂O', 't-b', 'middle');
        c.yazi(170, 210, 'protohücre (yağ asidi zarı)', 't-m t-b', 'middle');
        c.ham(2, '<polygon class="kume" points="70,226 76,236 64,236"/>');
        c.yazi(82, 236, 'zardaki FeS kümeleri: “ön-Ech”', 't-k');
        c.yazi(170, 274, 'alkali akışkan · H₂ çok', 't-k', 'middle');
        return c.svg(420);
    };

    /* ===== 4.1 Atmosfer oksijeninin şematik öyküsü ===== */
    SEKIL.oksijen = function () {
        var c = new Cizim(420, 240, 'Atmosfer oksijeninin şematik zaman çizgisi: yaşamın ilk iki milyar yılında oksijen yok denecek kadar azdır; ' +
            '2,3 milyar yıl önce Büyük Oksidasyon Olayı ile bugünkü düzeyin yüzde 1–10’una çıkar, yaklaşık bir milyar yıl orada kalır ve ' +
            'Kambriyen patlaması sıralarında bugünkü düzeye yaklaşır.');
        function X(t) { return 52 + (4 - t) * 88.5; }
        var y0 = 188, y1 = 128, y2 = 56, i;

        for (i = 0; i < 3; i++) c.ham(0, '<line class="izgara" x1="52" y1="' + [y0, y1, y2][i] + '" x2="406" y2="' + [y0, y1, y2][i] + '"/>');
        c.yazi(46, y0 + 4, '≈ 0', 't-k', 'end');
        c.yazi(46, y1 + 4, '%1–10', 't-k', 'end');
        c.yazi(46, y2 + 4, '≈ %100', 't-k', 'end');

        var p1 = 'M52 ' + y0 + ' L' + n(X(2.36)) + ' ' + y0 + ' C' + n(X(2.3)) + ' ' + y0 + ' ' + n(X(2.3)) + ' ' + y1 + ' ' + n(X(2.2)) + ' ' + y1 + ' L' + n(X(0.8)) + ' ' + y1;
        var p2 = ' L' + n(X(0.74)) + ' 112 L' + n(X(0.68)) + ' 140 L' + n(X(0.63)) + ' 104 L' + n(X(0.585)) + ' 136';
        var p3 = ' C' + n(X(0.55)) + ' 136 ' + n(X(0.56)) + ' ' + (y2 + 2) + ' ' + n(X(0.5)) + ' ' + (y2 + 2) +
            ' L' + n(X(0.3)) + ' ' + y2 + ' L' + n(X(0.25)) + ' 76 L' + n(X(0.2)) + ' ' + y2 + ' L406 ' + y2;
        c.ham(0, '<path class="alan" d="' + p1 + p2 + p3 + ' L406 ' + (y0 + 6) + ' L52 ' + (y0 + 6) + ' Z"/>');
        c.ham(1, '<path class="seri-1" d="' + p1 + '"/>' +
            '<path class="seri-1 belirsiz" d="M' + n(X(0.8)) + ' ' + y1 + p2 + '"/>' +
            '<path class="seri-1" d="M' + n(X(0.585)) + ' 136' + p3 + '"/>');

        // eksen
        c.ham(1, '<line class="eksen" x1="52" y1="200" x2="406" y2="200"/>');
        var T = [4, 3, 2, 1];
        for (i = 0; i < T.length; i++) {
            c.ham(1, '<line class="eksen" x1="' + n(X(T[i])) + '" y1="200" x2="' + n(X(T[i])) + '" y2="204"/>');
            c.yazi(X(T[i]), 217, String(T[i]), 't-k', 'middle');
        }
        c.ham(1, '<line class="eksen" x1="406" y1="200" x2="406" y2="204"/>');
        c.yazi(410, 217, 'bugün', 't-k', 'end');
        c.yazi(229, 234, 'milyar yıl önce', 't-k', 'middle');

        // olaylar
        c.ham(1, '<line class="olay" x1="' + n(X(2.3)) + '" y1="44" x2="' + n(X(2.3)) + '" y2="200"/>');
        c.yazi(X(2.3), 28, 'Büyük Oksidasyon', 't-m t-b', 'middle');
        c.yazi(X(2.3), 41, '≈ 2,3', 't-k', 'middle');
        c.yazi(X(1.5), y1 - 9, '“sıkıcı milyar”', 't-k t-i', 'middle');
        c.yazi(56, 180, 'yaşamın kökeni', 't-k');
        c.yazi(X(2.36) - 4, 164, 'oksijenik fotosentez ?', 't-k', 'end');
        c.yazi(X(0.64), 158, 'Shuram', 't-k t-b', 'middle');
        c.yazi(X(0.64), 170, '0,56', 't-k', 'middle');
        c.yazi(X(0.5), 28, 'Kambriyen', 't-m t-b', 'middle');
        c.yazi(X(0.5), 41, '≈ 0,54', 't-k', 'middle');
        c.yazi(370, 96, 'Permiyen', 't-k');
        c.yazi(370, 108, 'sonu', 't-k');
        return c.svg(640);
    };

    /* ===== 4.2 Verim ve besin zinciri uzunluğu ===== */
    SEKIL.trofik = function () {
        var c = new Cizim(420, 250, 'Besin zincirinde kalan enerji: yüzde 40 verimli oksijenli solunumla enerji beşinci beslenme basamağında ' +
            'yüzde 1’e iner (40, 16, 6,4, 2,6, 1,02); yüzde 10 verimli oksijensiz yollarla ikinci basamakta yüzde 1’e iner (10, 1).');
        function X(l) { return 62 + l * 66; }
        function Y(v) { return 190 - 74 * (Math.log(v) / Math.LN10); }
        var i, d;
        var G = [[100, '%100'], [10, '%10'], [1, '%1']];
        for (i = 0; i < G.length; i++) {
            c.ham(0, '<line class="' + (G[i][0] === 1 ? 'esik' : 'izgara') + '" x1="62" y1="' + n(Y(G[i][0])) + '" x2="404" y2="' + n(Y(G[i][0])) + '"/>');
            c.yazi(54, Y(G[i][0]) + 4, G[i][1], 't-k', 'end');
        }
        c.yazi(404, Y(1) + 14, 'eşik: yaşayabilir popülasyon için %1', 't-k', 'end');
        for (i = 0; i <= 5; i++) c.yazi(X(i), 224, String(i), 't-k', 'middle');
        c.yazi(233, 242, 'beslenme (trofik) basamağı · 0 = sabitlenen karbon', 't-k', 'middle');

        var A = [100, 40, 16, 6.4, 2.56, 1.024], B = [100, 10, 1];
        var AE = ['', '40', '16', '6,4', '2,6', '1,02'], BE = ['', '10', '1'];
        d = '';
        for (i = 0; i < B.length; i++) d += (i ? ' L' : 'M') + n(X(i)) + ' ' + n(Y(B[i]));
        c.ham(1, '<path class="seri-2" d="' + d + '"/>');
        d = '';
        for (i = 0; i < A.length; i++) d += (i ? ' L' : 'M') + n(X(i)) + ' ' + n(Y(A[i]));
        c.ham(1, '<path class="seri-1" d="' + d + '"/>');
        for (i = 1; i < B.length; i++) {
            c.ham(2, '<circle class="nokta-2" cx="' + n(X(i)) + '" cy="' + n(Y(B[i])) + '" r="5"><title>Oksijensiz · ' + i + '. basamak: %' + BE[i] + '</title></circle>');
            c.yazi(X(i) - 9, Y(B[i]) + 15, BE[i], 't-m t-b', 'end');
        }
        for (i = 1; i < A.length; i++) {
            c.ham(2, '<circle class="nokta-1" cx="' + n(X(i)) + '" cy="' + n(Y(A[i])) + '" r="5"><title>Oksijenli · ' + i + '. basamak: %' + AE[i] + '</title></circle>');
            c.yazi(X(i) + 8, Y(A[i]) - 8, AE[i], 't-m t-b', i === 5 ? 'end' : 'start');
        }
        c.ham(2, '<circle class="nokta-1" cx="' + n(X(0)) + '" cy="' + n(Y(100)) + '" r="5"><title>Sabitlenen karbon: %100</title></circle>');
        return c.svg(640);
    };

    /* ===== 4.3 Çatallı yol: iki kollu Krebs “döngü-olmayanı” ===== */
    SEKIL.catal = function () {
        var c = new Cizim(420, 366, 'Çatallı Krebs yolu: oksaloasetattan çıkan oksidatif kol sitrat ve izositrat üzerinden α-ketoglutarata ' +
            'giderken 2H ve CO₂ üretir; indirgeyici kol malat ve fumarat üzerinden süksinata giderken 2H tüketir. İki kol birbirini dengeler.');
        var sol = 112, sag = 308;
        c.hap(sol, 30, 'Asetil-CoA', { c: 2 });
        c.hap(sag, 30, 'Pirüvat', { c: 3 });
        c.ok(178, 24, 252, 24);
        c.ok(252, 37, 178, 37);
        c.yazi(215, 15, '+CO₂ +2H', 't-k', 'middle');
        c.yazi(215, 54, '−CO₂ −2H', 't-k', 'middle');

        c.hap(210, 112, 'Oksaloasetat', { c: 4, sinif: 'kavsak' });
        c.ok(300, 45, 250, 97);
        c.cip(292, 76, '+CO₂', 'co2', 's');

        // oksidatif kol
        c.ok(92, 45, 92, 163);
        c.ok(180, 127, 140, 163);
        c.hap(sol, 178, 'Sitrat', { c: 6 });
        c.ok(sol, 193, sol, 225);
        c.hap(sol, 240, 'İzositrat', { c: 6 });
        c.ok(sol, 255, sol, 287);
        c.cipler(sol + 12, 271, [['−2H', 'h2'], ['−CO₂', 'co2']], 's');
        c.hap(sol, 302, 'α-Ketoglutarat', { c: 5 });

        // indirgeyici kol
        c.ok(240, 127, 280, 163);
        c.cip(272, 140, '+2H', 'h2', 's');
        c.hap(sag, 178, 'Malat', { c: 4 });
        c.ok(sag, 193, sag, 225);
        c.cip(sag + 12, 209, '−H₂O', 'o2', 's');
        c.hap(sag, 240, 'Fumarat', { c: 4 });
        c.ok(sag, 255, sag, 287);
        c.cip(sag + 12, 271, '+2H', 'h2', 's');
        c.hap(sag, 302, 'Süksinat', { c: 4 });

        // iki kolun buluşma noktası
        c.ham(1, '<line class="ok kesik" x1="192" y1="302" x2="250" y2="302"/>');
        c.yazi(221, 322, '±2H ±CO₂', 't-k', 'middle');

        c.yazi(sol, 338, 'Oksidatif kol', 't-m t-b', 'middle');
        c.yazi(sol, 354, '2H üretir', 't-k', 'middle');
        c.yazi(sag, 338, 'İndirgeyici kol', 't-m t-b', 'middle');
        c.yazi(sag, 354, '2H tüketir', 't-k', 'middle');
        c.ok(166, 346, 252, 346, 'h2');
        return c.svg(540);
    };

    /* ===== 5.3 Bir palmitat için kaç glukoz gerekir? ===== */
    SEKIL.palmitat = function () {
        var c = new Cizim(420, 172, 'Bir palmitat molekülünün gereksinimleri glukoz cinsinden: ATP için 0,2, karbon için yaklaşık 3, ' +
            'NADPH için 7 glukoz gerekir. Kıt olan ATP değil, NADPH’dir.');
        function X(v) { return 132 + v * 38; }
        var R = [['ATP', '7 ATP gerekir', 0.2, '0,2'], ['Karbon', '16 karbon gerekir', 16 / 6, '≈ 3'], ['NADPH', '14 NADPH gerekir', 7, '7']];
        var i, y, w, r;
        for (i = 0; i <= 7; i++) {
            c.ham(0, '<line class="' + (i ? 'izgara' : 'eksen') + '" x1="' + X(i) + '" y1="8" x2="' + X(i) + '" y2="134"/>');
            c.yazi(X(i), 149, String(i), 't-k', 'middle');
        }
        c.yazi(X(3.5), 166, 'gereken glukoz sayısı', 't-k', 'middle');
        for (i = 0; i < R.length; i++) {
            y = 28 + i * 42; w = R[i][2] * 38; r = Math.min(4, w / 2);
            c.yazi(122, y, R[i][0], 't-b', 'end');
            c.yazi(122, y + 14, R[i][1], 't-k', 'end');
            c.ham(1, '<path class="cubuk" d="M' + X(0) + ' ' + (y - 11) + ' h' + n(w - r) + ' a' + n(r) + ' ' + n(r) + ' 0 0 1 ' + n(r) + ' ' + n(r) +
                ' v' + n(22 - 2 * r) + ' a' + n(r) + ' ' + n(r) + ' 0 0 1 -' + n(r) + ' ' + n(r) + ' H' + X(0) + ' Z"><title>' + R[i][0] + ': ' + R[i][3] + ' glukoz</title></path>');
            c.yazi(X(R[i][2]) + 7, y + 4.5, R[i][3], 't-m t-b');
        }
        return c.svg(600);
    };

    /* ===== 5.4 Oksijensiz koşulda fumarat solunumu ===== */
    SEKIL.fumarat = function () {
        var c = new Cizim(420, 272, 'Fumarat solunumu: oksijen yokken NADH’nin elektronları kompleks I’den kompleks II’ye akar ve fumaratı ' +
            'süksinata indirger. Kompleks I dört proton pompalar; ATP sentaz az miktarda ATP yapar. Süksinat birikir ve sitozole çıkar.');
        c.ham(0, '<rect class="zar" x="26" y="96" width="386" height="54" rx="4"/>');
        c.yazi(26, 18, 'Zarlar arası boşluk', 't-m t-b');
        c.yazi(404, 266, 'Matriks', 't-k', 'end');
        c.cip(222, 44, 'O₂ yok', 'o2', 'm');

        c.ham(0, '<rect class="prot" x="40" y="84" width="64" height="100" rx="14"/>');
        c.yazi(88, 177, 'I', 'prot-t', 'middle');
        c.ok(88, 120, 88, 58, 'hp');
        c.cip(88, 44, '4 H⁺', 'hp', 'm');

        c.ham(0, '<rect class="prot" x="164" y="112" width="60" height="72" rx="14"/>');
        c.yazi(208, 177, 'II', 'prot-t', 'middle');

        c.ham(0, '<rect class="prot sentaz" x="351" y="154" width="10" height="20"/>' +
            '<rect class="prot sentaz" x="330" y="88" width="52" height="70" rx="10"/>' +
            '<circle class="prot sentaz" cx="356" cy="194" r="22"/>');
        c.ok(356, 58, 356, 146, 'hp');
        c.cip(356, 44, '4 H⁺', 'hp', 'm');
        c.yazi(356, 24, 'ATP sentaz', 't-k t-b', 'middle');
        c.yazi(356, 238, 'ADP + Pi → ATP', 't-m t-b', 'middle');

        c.yol('M58 200 L58 136 Q58 125 69 125 L167 125 Q177 125 177 135 L177 222', 'el');
        c.bas(177, 229, Math.PI / 2, 'el');
        c.yazi(134, 119, 'Q', 't-k t-b', 'middle');
        c.yazi(62, 216, 'NADH → NAD⁺', 't-m t-b', 'middle');

        var f = c.hap(114, 244, 'Fumarat', { c: 4 });
        var s = c.hap(244, 244, 'Süksinat', { c: 4, sinif: 'kavsak' });
        c.ok(f.sag + 3, 244, s.sol - 3, 244);
        c.yazi(244, 269, 'birikir, sitozole çıkar', 't-k', 'middle');
        return c.svg(600);
    };

    /* ===== 5.5 Glutamin: döngünün bir yarısı geri, bir yarısı ileri ===== */
    SEKIL.glutamin = function () {
        var c = new Cizim(420, 326, 'Glutaminin kanser hücresindeki akışı: glutamin azotunu verip α-ketoglutarata dönüşür. α-Ketoglutaratın bir bölümü ' +
            'CO₂ ve NADPH ile geri yönde sitrata, bir bölümü ileri yönde süksinata gider; ikisi de sitozole çıkar. Zardaki transhidrogenaz NADH’den NADPH üretir.');
        var x = 216;
        var g = c.hap(60, 165, 'Glutamin', { c: 5 });
        var k = c.hap(x, 165, 'α-Ketoglutarat', { c: 5, sinif: 'kavsak' });
        c.ok(g.sag + 3, 165, k.sol - 3, 165);
        c.cip(60, 197, '−NH₃', 'az', 'm');
        c.yazi(8, 222, 'azot: amino asit ve', 't-k');
        c.yazi(8, 235, 'nükleotit yapımına', 't-k');

        var st = c.hap(x, 30, 'Sitrat', { c: 6 });
        c.hap(x, 96, 'İzositrat', { c: 6 });
        c.hap(x, 234, 'Süksinil-CoA', { c: 4 });
        var su = c.hap(x, 300, 'Süksinat', { c: 4 });
        c.ok(x, 150, x, 111);
        c.ok(x, 81, x, 45);
        c.ok(x, 180, x, 219);
        c.ok(x, 249, x, 285);
        var ust = c.cipler(x + 12, 131, [['+CO₂', 'co2'], ['+2H · NADPH', 'h2']], 's');
        var alt = c.cipler(x + 12, 200, [['−CO₂', 'co2'], ['−2H · NADH', 'h2']], 's');
        c.cip(x + 12, 267, 'ATP', 'atp', 's');
        c.yazi(x - 12, 135, 'geri · indirgeyici', 't-k', 'end');
        c.yazi(x - 12, 204, 'ileri · oksidatif', 't-k', 'end');

        c.ok(st.sag + 3, 30, st.sag + 36, 30);
        c.yazi(st.sag + 42, 27, 'sitozole:', 't-k');
        c.yazi(st.sag + 42, 40, 'yağ asidi yapımı', 't-k t-b');
        c.ok(su.sag + 3, 300, su.sag + 36, 300);
        c.yazi(su.sag + 42, 297, 'sitozole:', 't-k');
        c.yazi(su.sag + 42, 310, 'HIF1α sinyali', 't-k t-b');

        // transhidrogenaz: NADH → NADPH (proton akışıyla)
        var sagUc = x + 12 + Math.max(ust, alt);
        var tx = Math.min(sagUc + 20, 388);
        c.yol('M' + n(x + 12 + alt + 3) + ' 200 L' + tx + ' 200 L' + tx + ' 131 L' + n(x + 12 + ust + 11) + ' 131', 'h2');
        c.bas(x + 12 + ust + 4, 131, Math.PI, 'h2');
        c.cip(tx, 166, 'H⁺', 'hp', 'm');
        c.yazi(tx + 25, 166, 'transhidrogenaz', 't-k', 'middle', ' transform="rotate(-90 ' + (tx + 25) + ' 166)"');
        return c.svg(540);
    };

    /* ===== 5.6 Krebs kavşağı: sitozoldeki sitratın yolları ===== */
    SEKIL.kavsak5 = function () {
        var c = new Cizim(420, 342, 'Krebs kavşağı: sitozole çıkan sitrat asetil-CoA ve oksaloasetata bölünür. Asetil-CoA yağ asidi yapımına ve histon ' +
            'asetilasyonuna gider. Oksaloasetat aspartata, fosfoenolpirüvat üzerinden şekerlere ya da malat üzerinden pirüvat ve NADPH’ye dönüşebilir.');
        var st = c.hap(100, 26, 'Sitrat', { c: 6 });
        var ac = c.hap(300, 26, 'Asetil-CoA', { c: 2 });
        c.ok(st.sag + 3, 26, ac.sol - 3, 26);
        c.yazi(300, 58, '→ yağ asitleri (zarlar)', 't-k', 'middle');
        c.yazi(300, 73, '→ histon asetilasyonu: büyüme genleri', 't-k', 'middle');

        c.hap(210, 138, 'Oksaloasetat', { c: 4, sinif: 'kavsak' });
        c.ok(112, 41, 180, 123);

        // sol: azot yolu
        c.hap(66, 204, 'Aspartat', { c: 4 });
        c.ok(168, 153, 104, 189);
        c.cip(100, 158, '+NH₃', 'az', 'm');
        c.yazi(66, 232, 'nükleotitler', 't-k', 'middle');
        c.yazi(66, 245, 'üre döngüsü', 't-k', 'middle');

        // aşağı: şeker yolu
        c.hap(210, 226, 'Fosfoenolpirüvat', { c: 3 });
        c.ok(210, 153, 210, 211);
        c.cip(222, 172, '−CO₂', 'co2', 's');
        c.cip(222, 195, 'ATP', 'atp', 's');
        c.ok(210, 241, 210, 264);
        c.hap(210, 279, 'Şekerler');
        c.yazi(210, 308, 'riboz → nükleotitler', 't-k', 'middle');
        c.yazi(210, 322, 'gliserol fosfat → zar lipitleri', 't-k', 'middle');
        c.yazi(210, 336, 'pentoz fosfat yolu → NADPH', 't-k', 'middle');

        // sağ: malat üzerinden pirüvat
        c.hap(356, 204, 'Pirüvat', { c: 3 });
        c.ok(252, 153, 318, 189);
        c.cipler(298, 130, [['−CO₂', 'co2'], ['NADPH', 'h2']], 's');
        c.yazi(300, 160, 'malat üzerinden', 't-k t-i');
        c.yazi(356, 232, '→ laktat (dışarı atılır)', 't-k', 'middle');
        c.yazi(356, 245, '→ asetil-CoA', 't-k', 'middle');
        return c.svg(560);
    };

    /* ===== 5.7 Kaşeksi: glutamin ve amonyak arasındaki kısır döngü ===== */
    SEKIL.kaseksi = function () {
        var c = new Cizim(420, 198, 'Kaşeksi kısır döngüsü: tümör glutamini tüketir ve azotun fazlasını amonyak olarak kana verir; kasta protein ' +
            'yıkılır, açığa çıkan azot ve amonyak yeni glutamine bağlanır; glutamin kanla tümöre geri döner.');
        c.kutu(14, 40, 160, 124);
        c.kutu(246, 40, 160, 124);
        c.yazi(94, 64, 'Tümör', 't-b', 'middle');
        c.yazi(94, 90, 'glutamini tüketir;', 't-m', 'middle');
        c.yazi(94, 107, 'azotun fazlası', 't-m', 'middle');
        c.yazi(94, 124, 'amonyak olarak çıkar', 't-m', 'middle');
        c.yazi(326, 64, 'İskelet kası', 't-b', 'middle');
        c.yazi(326, 90, 'protein yıkılır;', 't-m', 'middle');
        c.yazi(326, 107, 'amino azotu + amonyak', 't-m', 'middle');
        c.yazi(326, 124, '→ yeni glutamin', 't-m', 'middle');
        c.yazi(210, 22, 'kan dolaşımı', 't-k', 'middle');
        c.ok(178, 78, 242, 78);
        c.cip(210, 60, 'NH₃', 'az', 'm');
        c.ok(242, 132, 178, 132);
        c.cip(210, 150, 'glutamin', 'az', 'm');
        c.yazi(210, 188, 'sonuç: kas kaybı', 't-k t-b', 'middle');
        return c.svg(580);
    };

    /* ===== 6.1 Mitokondri: akış kapasitörü ===== */
    SEKIL.kapasitor = function () {
        var c = new Cizim(420, 264, 'Akış kapasitörü: Krebs döngüsünün akışı solunum zinciriyle zar potansiyeline çevrilir. Zar potansiyeli ATP sentezini, ' +
            'ROS akısını ve NADPH yapımını belirler; çok yükselirse Krebs akışını yavaşlatır. Akıştaki değişim süksinat ve sitrat aracılığıyla çekirdeğe bildirilir.');
        c.kutu(44, 14, 160, 40);
        c.yazi(124, 39, 'Krebs döngüsü akışı', 't-b', 'middle');
        c.ok(124, 56, 124, 86);
        c.cip(136, 71, '2H · NADH', 'h2', 's');
        c.kutu(44, 88, 160, 42);
        c.yazi(124, 106, 'Solunum zinciri', 't-b', 'middle');
        c.yazi(124, 121, 'proton pompalar', 't-k', 'middle');
        c.ok(124, 132, 124, 160);
        c.cip(136, 146, 'H⁺', 'hp', 's');
        c.kutu(44, 162, 160, 60, 'vurgu');
        c.ham(1, '<line class="plaka" x1="60" y1="176" x2="60" y2="208"/><line class="plaka" x1="69" y1="176" x2="69" y2="208"/>');
        c.yazi(138, 188, 'Zar potansiyeli', 't-b', 'middle');
        c.yazi(138, 205, 'kapasitör: yükü ayırır', 't-k', 'middle');

        // çıktılar
        var a = c.hap(346, 142, 'ATP sentezi');
        var r = c.hap(346, 192, 'ROS akısı');
        var p = c.hap(346, 242, 'NADPH yapımı');
        c.ok(206, 180, a.sol - 3, 148);
        c.ok(206, 192, r.sol - 3, 192);
        c.ok(206, 204, p.sol - 3, 236);

        // çekirdeğe sinyal
        c.kutu(292, 14, 120, 40);
        c.yazi(352, 31, 'Çekirdek', 't-b', 'middle');
        c.yazi(352, 46, 'gen etkinliği', 't-k', 'middle');
        c.ok(206, 34, 289, 34);
        c.yazi(248, 26, 'süksinat · sitrat', 't-k', 'middle');

        // geri besleme
        c.yol('M42 192 L22 192 L22 34 L36 34', 'kesik');
        c.bas(43, 34, 0);
        c.yazi(12, 113, 'çok yükselirse akış yavaşlar', 't-k', 'middle', ' transform="rotate(-90 12 113)"');
        return c.svg(560);
    };

    /* ===== 6.3 Glutatyon döngüsü ve solunumun kısılması ===== */
    SEKIL.glutatyon = function () {
        var c = new Cizim(420, 316, 'Glutatyon döngüsü: indirgenmiş glutatyon hidrojen peroksidi suya çevirirken oksitlenir; NADPH onu yeniden indirger. ' +
            'Glutatyon havuzu oksitlenirse kompleks I kısılır, NADH birikir, Krebs akışı yavaşlar, NADPH azalır ve glutatyon daha da oksitlenir.');
        var g = c.hap(108, 46, '2 GSH', { alt: 'indirgenmiş glutatyon' });
        var s = c.hap(312, 46, 'GSSG', { alt: 'oksitlenmiş glutatyon' });
        c.ok(g.sag + 3, 38, s.sol - 3, 38);
        c.yazi(210, 26, 'H₂O₂ → 2 H₂O', 't-k t-b', 'middle');
        c.ok(s.sol - 3, 56, g.sag + 3, 56);
        c.yazi(210, 86, 'NADPH → NADP⁺', 't-k t-b', 'middle');
        c.ham(0, '<line class="izgara" x1="20" y1="104" x2="400" y2="104"/>');

        var ust = c.hap(210, 138, 'Glutatyon havuzu oksitlenir', { alt: 'GSSG oranı artar' });
        var sag = c.hap(326, 214, 'Kompleks I kısılır', { alt: 'S-glutatyonilasyon' });
        var al = c.hap(210, 290, 'Krebs akışı yavaşlar', { alt: 'NADH birikir' });
        var sol = c.hap(94, 214, 'NADPH azalır', { alt: 'GSH yenilenemez' });
        c.ok(sag.x - 30, ust.alt + 3, sag.x, sag.ust - 3);
        c.ok(sag.x, sag.alt + 3, al.sag - 22, al.ust - 3);
        c.ok(al.sol + 22, al.ust - 3, sol.x, sol.alt + 3);
        c.ok(sol.x, sol.ust - 3, sol.x + 30, ust.alt + 3);
        c.yazi(210, 212, 'kısır', 't-k t-i', 'middle');
        c.yazi(210, 225, 'döngü', 't-k t-i', 'middle');
        return c.svg(540);
    };

    /* ===== 7.2 Bakterinin zarı, mitokondrinin zarı ===== */
    SEKIL.zarlar = function () {
        var c = new Cizim(420, 228, 'Solda bir bakteri: zar potansiyeli hücreyi dış dünyadan ayıran sınırdadır. Sağda bir ökaryot hücre: ' +
            'bakteri kökenli mitokondriler aynı yüklü zarı hücrenin içinde taşır.');
        c.yazi(99, 20, 'Bakteri', 't-b', 'middle');
        c.yazi(99, 35, 'yüklü zar = dış dünyayla sınır', 't-k', 'middle');
        c.ham(0, '<rect class="hucre" x="24" y="52" width="150" height="84" rx="42"/><rect class="hucre-ic" x="30" y="58" width="138" height="72" rx="36"/>');
        c.yazi(99, 92, 'içerisi (−)', 't-m t-b', 'middle');
        c.yazi(99, 108, 'dışarısı (+)', 't-k', 'middle');
        c.yazi(99, 160, 'ATP sentezi · kamçı', 't-k', 'middle');
        c.yazi(99, 174, 'madde taşınması · bölünme', 't-k', 'middle');
        c.yazi(99, 198, 'potansiyel çökerse', 't-k', 'middle');
        c.yazi(99, 212, 'hücre ölür', 't-k t-b', 'middle');

        c.ok(186, 94, 234, 94);
        c.yazi(210, 80, '≈ 2 milyar', 't-k', 'middle');
        c.yazi(210, 112, 'yıl önce', 't-k', 'middle');

        c.yazi(325, 20, 'Ökaryot hücre', 't-b', 'middle');
        c.yazi(325, 35, 'aynı zar, artık içeride', 't-k', 'middle');
        c.ham(0, '<rect class="hucre-buyuk" x="244" y="48" width="162" height="150" rx="34"/>' +
            '<circle class="cekirdek" cx="292" cy="96" r="26"/>' +
            '<rect class="hucre" x="322" y="110" width="72" height="34" rx="17"/><rect class="hucre-ic" x="327" y="115" width="62" height="24" rx="12"/>' +
            '<rect class="hucre" x="262" y="148" width="72" height="34" rx="17"/><rect class="hucre-ic" x="267" y="153" width="62" height="24" rx="12"/>');
        c.yazi(292, 100, 'çekirdek', 't-k', 'middle');
        c.yazi(358, 131, '−', 't-b', 'middle');
        c.yazi(298, 169, '−', 't-b', 'middle');
        c.yazi(358, 78, 'mitokondri', 't-k', 'middle');
        c.ham(1, '<line class="eksen" x1="358" y1="82" x2="358" y2="108"/>');
        c.yazi(325, 216, 'iç zarda ≈ 150–200 mV', 't-k', 'middle');
        return c.svg(580);
    };

    function ciz() {
        var yer = document.querySelectorAll('.kt-ciz[data-sekil]'), i, ad;
        for (i = 0; i < yer.length; i++) {
            ad = yer[i].getAttribute('data-sekil');
            if (!SEKIL[ad]) continue;
            try { yer[i].innerHTML = SEKIL[ad](); } catch (e) { if (window.console) console.error('kitap şekli çizilemedi: ' + ad, e); }
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ciz);
    else ciz();
})();
