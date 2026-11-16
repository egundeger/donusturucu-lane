/* Solunum zinciri — 3B görünüm (three.js). Model zincir.js içindedir; burası yalnızca çizer. */
import * as THREE from '../vendor/three.module.min.js';

const X = { I: -15, II: -8, III: -2, IV: 4, V: 11, UCP: 16.5 };
const RENK = { I: 0x3b82f6, II: 0x22c55e, III: 0xa855f7, IV: 0x14b8a6, V: 0xfb923c, UCP: 0xf472b6, Q: 0xfde047, C: 0xef4444 };
const ODAK = { I: [-14.5, -1.5], II: [-8, -1.5], Q: [-7.5, 0], III: [-2, 0], C: [1, 1.5], IV: [4, -0.5], V: [11, -2.5], UCP: [16.5, 0] };
const MERKEZ_X = -0.8;

function yumusak(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

function parcacikDoku(metin, ic, dis, yazi) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 30, 64, 64, 62);
  g.addColorStop(0, dis); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.globalAlpha = 0.55; x.fillStyle = g; x.beginPath(); x.arc(64, 64, 62, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1;
  const c2 = x.createRadialGradient(54, 52, 4, 64, 64, 42);
  c2.addColorStop(0, ic); c2.addColorStop(1, dis);
  x.fillStyle = c2; x.beginPath(); x.arc(64, 64, 40, 0, Math.PI * 2); x.fill();
  if (metin) {
    x.font = '800 40px system-ui, -apple-system, "Segoe UI", sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = yazi; x.fillText(metin, 64, 67);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function hapDoku(metin, zemin, yazi) {
  const c = document.createElement('canvas'); c.width = 192; c.height = 96;
  const x = c.getContext('2d');
  x.fillStyle = zemin; x.beginPath();
  const r = 40; x.moveTo(8 + r, 8); x.arcTo(184, 8, 184, 88, r); x.arcTo(184, 88, 8, 88, r); x.arcTo(8, 88, 8, 8, r); x.arcTo(8, 8, 184, 8, r); x.fill();
  x.font = '800 46px system-ui, -apple-system, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = yazi; x.fillText(metin, 96, 51);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function yasakDoku() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#dc2626'; x.beginPath(); x.arc(64, 64, 56, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#fff'; x.lineWidth = 9; x.beginPath(); x.arc(64, 64, 56, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(40, 40); x.lineTo(88, 88); x.moveTo(88, 40); x.lineTo(40, 88); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function zarDoku() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = '#9a6a26'; x.fillRect(0, 0, 512, 64);
  x.strokeStyle = 'rgba(60,34,8,.55)'; x.lineWidth = 3;
  for (let i = 0; i < 64; i++) {
    const px = i * 8 + 4;
    x.beginPath(); x.moveTo(px, 2); x.quadraticCurveTo(px + (i % 2 ? 3 : -3), 16, px, 30); x.stroke();
    x.beginPath(); x.moveTo(px, 62); x.quadraticCurveTo(px + (i % 2 ? -3 : 3), 48, px, 34); x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(9, 1); return t;
}

/* Çoklu çizgi üzerinde ilerleyen parçacıklar için yol */
class Yol {
  constructor(noktalar) {
    this.p = noktalar.map(n => new THREE.Vector3(n[0], n[1], n[2]));
    this.u = [0];
    for (let i = 1; i < this.p.length; i++) this.u.push(this.u[i - 1] + this.p[i].distanceTo(this.p[i - 1]));
    this.boy = this.u[this.u.length - 1];
  }
  konum(d, hedef) {
    if (d <= 0) return hedef.copy(this.p[0]);
    if (d >= this.boy) return hedef.copy(this.p[this.p.length - 1]);
    let i = 1; while (this.u[i] < d) i++;
    const t = (d - this.u[i - 1]) / (this.u[i] - this.u[i - 1]);
    return hedef.lerpVectors(this.p[i - 1], this.p[i], t);
  }
}

export function olustur(kap, olay) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.className = 'zn-canvas';
  kap.appendChild(renderer.domElement);
  const etiketKap = document.createElement('div'); etiketKap.className = 'zn-etiketler'; kap.appendChild(etiketKap);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1.6, 0.5, 600);

  /* --- arka plan: üstte zarlar arası boşluk (mavi), altta matriks (sıcak) --- */
  {
    const geo = new THREE.SphereGeometry(260, 32, 48);
    const pos = geo.attributes.position, renk = [];
    const ust = new THREE.Color(0x10305e), alt = new THREE.Color(0x3b1a22), ara = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { ara.lerpColors(alt, ust, yumusak(-14, 14, pos.getY(i))); renk.push(ara.r, ara.g, ara.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(renk, 3));
    scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false })));
  }
  scene.add(new THREE.HemisphereLight(0xdbeaff, 0x5a3324, 2.1));
  const gunes = new THREE.DirectionalLight(0xffffff, 2.4); gunes.position.set(14, 30, 32); scene.add(gunes);
  const dolgu = new THREE.DirectionalLight(0xffc49a, 0.9); dolgu.position.set(-18, -24, 14); scene.add(dolgu);

  /* --- zar --- */
  const ZAR_Z = 2.2, ZAR_Y = 1.45, ON_Z = 3.15; // ON_Z: proteinlerin önünde, parçacıkların görünür kaldığı derinlik
  const zar = new THREE.Mesh(new THREE.BoxGeometry(84, 2.5, ZAR_Z * 2), new THREE.MeshStandardMaterial({ map: zarDoku(), roughness: 0.9, metalness: 0 }));
  scene.add(zar);
  {
    const ayak = [[X.I - 0.2, 3.7], [X.II, 1.5], [X.III, 2.4], [X.IV, 2.2], [X.V + 0.7, 3.5], [X.UCP, 1.8]];
    const yer = [];
    for (let px = -41.5; px <= 41.5; px += 0.98) {
      for (let sira = 0; sira < 5; sira++) {
        const pz = -1.76 + sira * 0.88;
        if (ayak.some(a => Math.abs(px - a[0]) < a[1])) continue;
        yer.push([px + (Math.random() - 0.5) * 0.25, pz + (Math.random() - 0.5) * 0.25]);
      }
    }
    const bas = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 12, 9), new THREE.MeshStandardMaterial({ color: 0xf2c56d, roughness: 0.55 }), yer.length * 2);
    const m = new THREE.Matrix4();
    yer.forEach((p, i) => {
      m.setPosition(p[0], ZAR_Y + (Math.random() - 0.5) * 0.12, p[1]); bas.setMatrixAt(i * 2, m);
      m.setPosition(p[0] + 0.3, -ZAR_Y + (Math.random() - 0.5) * 0.12, p[1]); bas.setMatrixAt(i * 2 + 1, m);
    });
    scene.add(bas);
  }

  /* --- protein kurucu --- */
  const kure = new THREE.SphereGeometry(1, 28, 20);
  const gruplar = {}, malzeme = {}, secilebilir = [];
  function grup(kid) {
    const g = new THREE.Group(); g.userData.kid = kid; gruplar[kid] = g; scene.add(g);
    malzeme[kid] = new THREE.MeshStandardMaterial({ color: RENK[kid], roughness: 0.48, metalness: 0.06, emissive: 0x000000 });
    malzeme[kid].userData.temel = new THREE.Color(RENK[kid]);
    return g;
  }
  function top(g, kid, x, y, z, r, sx = 1, sy = 1, sz = 1, mat) {
    const m = new THREE.Mesh(kure, mat || malzeme[kid]);
    m.position.set(x, y, z); m.scale.set(r * sx, r * sy, r * sz); m.userData.kid = kid;
    g.add(m); secilebilir.push(m); return m;
  }

  // Kompleks I: zar kolu + matrikse uzanan çevresel kol (L biçimi)
  { const g = grup('I');
    top(g, 'I', -17.6, 0, 0, 1.75, 1.15, 1.3, 1.6); top(g, 'I', -15.4, 0.1, 0, 1.85, 1.1, 1.3, 1.55); top(g, 'I', -13.2, 0, 0, 1.9, 1.05, 1.3, 1.5);
    top(g, 'I', -12.7, -2.7, 0.1, 1.7, 1, 1.15, 1.2); top(g, 'I', -12.2, -4.9, 0.2, 1.6); top(g, 'I', -11.7, -6.9, 0.1, 1.45); }
  // Kompleks II: çoğu matriks tarafında
  { const g = grup('II');
    top(g, 'II', X.II, -0.3, 0, 1.25, 1, 1.35, 2.15); top(g, 'II', X.II, -2.8, 0, 1.75, 1.1, 1, 1.15); top(g, 'II', X.II + 0.8, -4.5, 0.2, 1.25); }
  // Kompleks III: dimer
  { const g = grup('III');
    top(g, 'III', X.III - 1.05, 0.5, 0, 1.45, 1, 2.3, 1.9); top(g, 'III', X.III + 1.05, 0.5, 0, 1.45, 1, 2.3, 1.9);
    top(g, 'III', X.III - 1.1, -3.3, 0, 1.5, 1.05, 1, 1.2); top(g, 'III', X.III + 1.1, -3.3, 0, 1.5, 1.05, 1, 1.2); }
  // Kompleks IV
  { const g = grup('IV');
    top(g, 'IV', X.IV, 0.3, 0, 2.0, 1.1, 1.55, 1.35); top(g, 'IV', X.IV + 0.7, -2.5, 0.2, 1.15); top(g, 'IV', X.IV - 0.9, 2.6, 0.3, 0.95); }
  // ATP sentaz
  const rotor = new THREE.Group();
  { const g = grup('V');
    rotor.position.set(X.V, 0, 0); g.add(rotor);
    const cGeo = new THREE.CylinderGeometry(0.66, 0.66, 3.0, 14);
    const cMat = [malzeme.V, new THREE.MeshStandardMaterial({ color: 0xfdba74, roughness: 0.5 })];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      const c = new THREE.Mesh(cGeo, cMat[i % 2]); c.position.set(Math.cos(a) * 1.95, 0, Math.sin(a) * 1.95); c.userData.kid = 'V'; rotor.add(c); secilebilir.push(c);
    }
    const sap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 3.6, 14), new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 }));
    sap.position.set(0, -3.1, 0); rotor.add(sap);
    const cikinti = new THREE.Mesh(kure, cMat[1]); cikinti.position.set(0.55, -2.4, 0); cikinti.scale.setScalar(0.5); rotor.add(cikinti);
    // F1 başı: alfa3-beta3
    const alfa = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.5 });
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      top(g, 'V', X.V + Math.cos(a) * 1.45, -5.9, Math.sin(a) * 1.45, 1.3, 1, 1.25, 1, i % 2 ? alfa : malzeme.V);
    }
    // stator: a alt birimi + çevresel sap
    const stator = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.55 });
    top(g, 'V', X.V + 3.0, 0, 0, 1.0, 0.75, 1.5, 2.6, stator);
    const kol = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 7.6, 10), stator); kol.position.set(X.V + 3.7, -3.4, 0); kol.userData.kid = 'V'; g.add(kol); secilebilir.push(kol);
    const kopru = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 3.4, 10), stator); kopru.rotation.z = Math.PI / 2; kopru.position.set(X.V + 2.1, -7.3, 0); g.add(kopru);
  }
  // UCP1
  { const g = grup('UCP'); malzeme.UCP.transparent = true;
    top(g, 'UCP', X.UCP - 0.75, 0, 0, 0.95, 1, 1.75, 2.75); top(g, 'UCP', X.UCP + 0.75, 0, 0, 0.95, 1, 1.75, 2.75); }
  // Hareketli taşıyıcılar
  const qMat = new THREE.MeshStandardMaterial({ color: RENK.Q, roughness: 0.35, emissive: 0x5a4a00 });
  const cMatS = new THREE.MeshStandardMaterial({ color: RENK.C, roughness: 0.4, emissive: 0x3a0606 });
  malzeme.Q = qMat; malzeme.C = cMatS; qMat.userData.temel = new THREE.Color(RENK.Q); cMatS.userData.temel = new THREE.Color(RENK.C);
  function tasiyici(kid, mat, r) { const m = new THREE.Mesh(kure, mat); m.scale.setScalar(r); m.userData.kid = kid; scene.add(m); secilebilir.push(m); return m; }
  const q1 = tasiyici('Q', qMat, 0.6), q2 = tasiyici('Q', qMat, 0.6), sitc = tasiyici('C', cMatS, 0.8);
  const Q_Z = ON_Z;

  /* --- yasak işaretleri --- */
  const yasakMat = new THREE.SpriteMaterial({ map: yasakDoku(), transparent: true, depthTest: false });
  const yasak = {};
  [['I', -15.4, 0.1], ['II', X.II, -2.8], ['III', X.III, 0.5], ['IV', X.IV, 0.3], ['V', X.V, 0]].forEach(a => {
    const s = new THREE.Sprite(yasakMat); s.position.set(a[1], a[2], 3.6); s.scale.setScalar(2.4); s.visible = false; s.renderOrder = 10; scene.add(s); yasak[a[0]] = s;
  });

  /* --- parçacıklar --- */
  const DOKU = {
    h: parcacikDoku('H⁺', '#fffbe6', '#ffd43b', '#4a3300'),
    e: parcacikDoku('e⁻', '#f0ffff', '#3be0ff', '#00343f'),
    su: parcacikDoku('', '#e6f1ff', '#6aa9ff', '#0b2a57'),
    atp: hapDoku('ATP', '#f59e42', '#2a1500'),
    isi: parcacikDoku('', '#ffe2d6', '#ff6b6b', '#000')
  };
  function havuz(tur, adet, olcek) {
    const liste = [];
    for (let i = 0; i < adet; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOKU[tur], transparent: true, depthWrite: false, opacity: 0 }));
      if (Array.isArray(olcek)) s.scale.set(olcek[0], olcek[1], 1); else s.scale.setScalar(olcek);
      s.visible = false; s.userData = { aktif: false }; scene.add(s); liste.push(s);
    }
    return liste;
  }
  const hav = { h: havuz('h', 70, 1.15), e: havuz('e', 40, 1.0), su: havuz('su', 10, 0.9), atp: havuz('atp', 16, [2.3, 1.15]), isi: havuz('isi', 14, 2.2) };
  const gezgin = [];
  function firlat(tur, yol, hiz, sapma) {
    const s = hav[tur].find(p => !p.userData.aktif);
    if (!s) return;
    s.userData.aktif = true; s.visible = true;
    gezgin.push({ s, yol, d: 0, hiz, sap: sapma || [0, 0, 0] });
  }
  const ara = new THREE.Vector3();
  function gezginIlerlet(dt) {
    for (let i = gezgin.length - 1; i >= 0; i--) {
      const g = gezgin[i]; g.d += g.hiz * dt;
      g.yol.konum(g.d, ara); g.s.position.set(ara.x + g.sap[0], ara.y + g.sap[1], ara.z + g.sap[2]);
      const k = g.d / g.yol.boy;
      g.s.material.opacity = Math.min(1, k * 8, (1 - k) * 5);
      if (k >= 1) { g.s.userData.aktif = false; g.s.visible = false; gezgin.splice(i, 1); }
    }
  }

  // elektron yolları (proteinlerin önünden geçer ki görünsün)
  const ortakSon = [[X.III, 0.4, ON_Z], [X.III + 1.4, 3.3, ON_Z], [X.IV - 1.4, 3.3, ON_Z], [X.IV, 0.6, ON_Z], [X.IV + 0.9, -3.6, 2.4]];
  const YOL = {
    eN: new Yol([[-11.4, -8.2, 2.2], [-12.4, -3, 2.6], [-13.6, 0, ON_Z], [-11, 0, ON_Z], [-4.5, 0, ON_Z]].concat(ortakSon)),
    eS: new Yol([[X.II + 0.6, -5.2, 2.2], [X.II, -1.6, 2.8], [X.II + 1, 0, ON_Z], [-4.5, 0, ON_Z]].concat(ortakSon)),
    eA: new Yol([[X.III + 3, 6.6, ON_Z], [X.III + 2.6, 3.3, ON_Z], [X.IV - 1.4, 3.3, ON_Z], [X.IV, 0.6, ON_Z], [X.IV + 0.9, -3.6, 2.4]]),
    sentaz: new Yol([[X.V + 2.6, 5.6, 2.6], [X.V + 2.2, 1.8, ON_Z], [X.V + 2.0, -0.2, ON_Z], [X.V + 1.8, -2.2, ON_Z], [X.V + 1.2, -4.2, 2.8]]),
    ucp: new Yol([[X.UCP, 5.4, ON_Z], [X.UCP, 1.8, ON_Z], [X.UCP, -1.8, ON_Z], [X.UCP, -4.6, ON_Z]]),
    su: new Yol([[X.IV + 0.9, -3.8, 2.4], [X.IV + 1.6, -7.8, 2.8]]),
    atp: new Yol([[X.V, -7.6, 2.2], [X.V - 1.2, -11.2, 3]]),
    isi: new Yol([[X.UCP, -1.5, ON_Z], [X.UCP + 0.6, -7, ON_Z]])
  };
  function pompaYolu(x, genis) {
    const px = x + (Math.random() - 0.5) * genis, pz = ON_Z + Math.random() * 0.5;
    return new Yol([[px, -3.6, pz], [px, 0, pz + 0.4], [px + (Math.random() - 0.5) * 1.5, 4.6 + Math.random() * 1.6, pz - 0.6]]);
  }

  // proton bulutu: zarlar arası boşlukta Δp ile orantılı yoğunluk, matrikste seyrek
  const bulut = [];
  function bulutEkle(adet, yMin, yMax, sabit) {
    for (let i = 0; i < adet; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOKU.h, transparent: true, depthWrite: false, opacity: 0 }));
      s.scale.setScalar(0.95);
      const b = { s, x: -22 + Math.random() * 42, y: yMin + Math.random() * (yMax - yMin), z: -2 + Math.random() * 5.4, f: Math.random() * 6.28, h: 0.4 + Math.random() * 0.7, sabit, sira: i / adet };
      s.position.set(b.x, b.y, b.z); scene.add(s); bulut.push(b);
    }
  }
  bulutEkle(64, 2.7, 8.6, false); bulutEkle(7, -9, -3.4, true);

  /* --- etiketler (HTML katmanı) --- */
  const etiketler = [];
  function etiket(metin, x, y, z, sinif, kid) {
    const el = document.createElement(kid ? 'button' : 'span');
    el.className = 'zn-etiket ' + (sinif || ''); el.innerHTML = metin;
    if (kid) { el.type = 'button'; el.addEventListener('click', () => olay.sec(kid)); }
    etiketKap.appendChild(el);
    const e = { el, v: new THREE.Vector3(x, y, z), izle: null, gorunur: true }; etiketler.push(e); return e;
  }
  const K = '<span class="uzun">Kompleks </span>'; // dar ekranda yalnızca numara görünür
  etiket(K + 'I', -15.4, 3.3, 0, 'ana', 'I'); etiket(K + 'II', X.II + 1.4, -6.5, 0, 'ana', 'II');
  etiket(K + 'III', X.III, 7.2, 0, 'ana', 'III'); etiket(K + 'IV', X.IV + 0.6, 7.2, 0, 'ana', 'IV');
  etiket('ATP sentaz', X.V + 0.4, 3.3, 0, 'ana', 'V'); etiket('UCP1', X.UCP + 0.2, -3.6, 0, 'ana', 'UCP');
  const eQ = etiket('Q', 0, 0, 0, 'kucuk', 'Q'); eQ.izle = q1;
  const eC = etiket('Sit c', 0, 0, 0, 'kucuk', 'C'); eC.izle = sitc;
  const eNadh = etiket('NADH → NAD⁺', -13.2, -9.5, 0, 'tepkime');
  const eSuk = etiket('Süksinat → Fumarat', X.II + 2.6, -8.3, 0, 'tepkime');
  const eO2 = etiket('½ O₂ + 2 H⁺ → H₂O', X.IV + 1.2, -5.2, 0, 'tepkime');
  const eAtp = etiket('ADP + P<sub>i</sub> → ATP', X.V, -9.4, 0, 'tepkime');
  const eIsi = etiket('ısı', X.UCP + 0.6, -6.6, 0, 'tepkime isi');

  /* --- kamera --- */
  const kam = { az: 0.16, el: 0.16, hedef: new THREE.Vector3(MERKEZ_X, -1, 0), yakin: 1, hAz: 0.16, hEl: 0.16, hHedef: new THREE.Vector3(MERKEZ_X, -1, 0), hYakin: 1, taban: 60 };
  let genislik = 1, yukseklik = 1;
  function boyutla() {
    const w = kap.clientWidth, h = kap.clientHeight;
    if (!w || !h) return;
    genislik = w; yukseklik = h;
    etiketKap.classList.toggle('dar', w < 600);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    kam.taban = Math.max(21.5 / (tv * camera.aspect), 12.5 / tv);
  }
  function kameraGuncelle(dt) {
    const k = 1 - Math.exp(-dt * 5);
    kam.az += (kam.hAz - kam.az) * k; kam.el += (kam.hEl - kam.el) * k; kam.yakin += (kam.hYakin - kam.yakin) * k;
    kam.hedef.lerp(kam.hHedef, k);
    const d = kam.taban * kam.yakin;
    camera.position.set(kam.hedef.x + d * Math.sin(kam.az) * Math.cos(kam.el), kam.hedef.y + d * Math.sin(kam.el), kam.hedef.z + d * Math.cos(kam.az) * Math.cos(kam.el));
    camera.lookAt(kam.hedef);
  }
  const ro = new ResizeObserver(boyutla); ro.observe(kap);
  boyutla();

  /* --- etkileşim: sürükle-döndür, tıkla-seç --- */
  const tuval = renderer.domElement;
  let suruk = null;
  tuval.addEventListener('pointerdown', e => { suruk = { x: e.clientX, y: e.clientY, bx: e.clientX, by: e.clientY, yol: 0 }; try { tuval.setPointerCapture(e.pointerId); } catch (_) { /* yok say */ } });
  tuval.addEventListener('pointermove', e => {
    if (!suruk) return;
    const dx = e.clientX - suruk.x, dy = e.clientY - suruk.y;
    suruk.x = e.clientX; suruk.y = e.clientY; suruk.yol += Math.abs(dx) + Math.abs(dy);
    kam.hAz = Math.max(-1.05, Math.min(1.05, kam.hAz - dx * 0.006));
    kam.hEl = Math.max(-0.3, Math.min(0.8, kam.hEl + dy * 0.004));
  });
  const isin = new THREE.Raycaster(), fare = new THREE.Vector2();
  function birak(e) {
    if (!suruk) return;
    const tik = suruk.yol < 6; suruk = null;
    if (!tik) return;
    const r = tuval.getBoundingClientRect();
    fare.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    isin.setFromCamera(fare, camera);
    const hit = isin.intersectObjects(secilebilir, false)[0];
    if (hit) olay.sec(hit.object.userData.kid);
  }
  tuval.addEventListener('pointerup', birak);
  tuval.addEventListener('pointercancel', () => { suruk = null; });

  /* --- durum --- */
  const birikim = { eN: 0, eS: 0, eA: 0, pI: 0, pIII: 0, pIV: 0, syn: 0, unc: 0, atp: 0, su: 0, isi: 0 };
  let zaman = 0, secili = null, qFaz = 0, cFaz = 0, oncekiIsaret = '';
  const gri = new THREE.Color(0x5b6474);

  function isaretle(isaret) {
    const anahtar = JSON.stringify(isaret);
    if (anahtar === oncekiIsaret) return; oncekiIsaret = anahtar;
    ['I', 'II', 'III', 'IV', 'V'].forEach(k => {
      const var_ = !!isaret[k];
      yasak[k].visible = var_;
      malzeme[k].color.copy(var_ ? gri : malzeme[k].userData.temel);
    });
  }

  function ciz(d, dt) {
    zaman += dt;
    isaretle(d.isaret || {});

    // elektronlar
    birikim.eN += d.jn * dt * 0.42; birikim.eS += d.js * dt * 0.42; birikim.eA += d.ja * dt * 0.42;
    while (birikim.eN >= 1) { birikim.eN--; firlat('e', YOL.eN, 13, [0, (Math.random() - 0.5) * 0.5, 0]); }
    while (birikim.eS >= 1) { birikim.eS--; firlat('e', YOL.eS, 13, [0, (Math.random() - 0.5) * 0.5, 0]); }
    while (birikim.eA >= 1) { birikim.eA--; firlat('e', YOL.eA, 11, [0, 0, 0]); }
    // pompalanan protonlar
    birikim.pI += 4 * d.jn * dt * 0.085; birikim.pIII += 4 * (d.jn + d.js) * dt * 0.085; birikim.pIV += 2 * (d.jn + d.js + d.ja) * dt * 0.085;
    while (birikim.pI >= 1) { birikim.pI--; firlat('h', pompaYolu(-15.6, 4.6), 5.5); }
    while (birikim.pIII >= 1) { birikim.pIII--; firlat('h', pompaYolu(X.III, 2.8), 5.5); }
    while (birikim.pIV >= 1) { birikim.pIV--; firlat('h', pompaYolu(X.IV, 2.4), 5.5); }
    // ATP sentaz ve kaçak
    birikim.syn += d.hSyn * dt * 0.085;
    while (birikim.syn >= 1) { birikim.syn--; firlat('h', YOL.sentaz, 7, [(Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5]); }
    rotor.rotation.y -= d.hSyn * dt * 0.1;
    birikim.atp += d.atp * dt * 0.13;
    while (birikim.atp >= 1) { birikim.atp--; firlat('atp', YOL.atp, 2.6, [(Math.random() - 0.5) * 2.4, 0, (Math.random() - 0.5) * 1.5]); }
    const j = d.jn + d.js + d.ja;
    birikim.su += j * dt * 0.12;
    while (birikim.su >= 1) { birikim.su--; firlat('su', YOL.su, 2.6, [(Math.random() - 0.5) * 1.2, 0, 0]); }
    if (d.unc) {
      birikim.unc += d.hUnc * dt * 0.075; birikim.isi += d.hUnc * dt * 0.02;
      while (birikim.unc >= 1) { birikim.unc--; firlat('h', YOL.ucp, 8, [(Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.8]); }
      while (birikim.isi >= 1) { birikim.isi--; firlat('isi', YOL.isi, 3, [(Math.random() - 0.5) * 2.5, 0, (Math.random() - 0.5) * 1.5]); }
    }
    gezginIlerlet(dt);

    // taşıyıcılar: Q zar içinde, sitokrom c zar yüzeyinde mekik dokur
    qFaz += dt * Math.min(1, j / 6) * 2.4;
    const s1 = 0.5 - 0.5 * Math.cos(qFaz), s2 = 0.5 - 0.5 * Math.cos(qFaz + 1.7);
    q1.position.set(d.jn > 0.05 ? THREE.MathUtils.lerp(-11.2, -4.4, s1) : -11.2, Math.sin(qFaz * 2) * 0.35, Q_Z + 0.25);
    q2.position.set(d.js > 0.05 ? THREE.MathUtils.lerp(X.II + 1.6, -4.4, s2) : X.II + 1.6, Math.sin(qFaz * 2 + 1) * 0.35, Q_Z + 0.25);
    q2.visible = !!d.sS;
    cFaz += dt * Math.min(1, j / 6) * 3.0;
    sitc.position.set(THREE.MathUtils.lerp(X.III + 1.5, X.IV - 1.5, j > 0.05 ? 0.5 - 0.5 * Math.cos(cFaz) : 0.5), 3.3, ON_Z - 0.2);

    // proton bulutu
    const yogun = Math.max(0, Math.min(1, d.dp / 195));
    bulut.forEach(b => {
      const hedef = b.sabit ? 0.55 : (b.sira < yogun ? 0.95 : 0);
      b.s.material.opacity += (hedef - b.s.material.opacity) * Math.min(1, dt * 2.2);
      b.s.visible = b.s.material.opacity > 0.02;
      b.s.position.set(b.x + Math.sin(zaman * b.h + b.f) * 0.7, b.y + Math.cos(zaman * b.h * 0.8 + b.f) * 0.45, b.z);
    });

    // UCP ve seçim vurgusu
    malzeme.UCP.opacity = d.unc ? 1 : 0.4;
    malzeme.UCP.emissive.setHex(d.unc ? 0x7a1238 : 0x000000);
    malzeme.UCP.emissiveIntensity = d.unc ? 0.7 + 0.4 * Math.sin(zaman * 6) : 0;
    Object.keys(malzeme).forEach(k => {
      if (k === 'UCP' || k === 'Q' || k === 'C') return;
      malzeme[k].emissive.copy(malzeme[k].userData.temel).multiplyScalar(k === secili ? 0.35 + 0.12 * Math.sin(zaman * 5) : 0);
    });

    eSuk.gorunur = d.js > 0.05; eNadh.gorunur = d.jn > 0.05; eIsi.gorunur = !!d.unc; eAtp.gorunur = d.atp > 0.3; eO2.gorunur = j > 0.05;

    kameraGuncelle(dt);
    renderer.render(scene, camera);

    // etiketleri ekrana yansıt
    etiketler.forEach(e => {
      if (e.izle) { ara.copy(e.izle.position); ara.y += e.izle === sitc ? 1.45 : -1.3; } else ara.copy(e.v);
      ara.project(camera);
      const gor = e.gorunur && ara.z < 1 && Math.abs(ara.x) < 1.02 && Math.abs(ara.y) < 1.05 && (!e.izle || e.izle.visible);
      e.el.style.display = gor ? '' : 'none';
      if (gor) e.el.style.transform = 'translate(-50%,-50%) translate(' + ((ara.x * 0.5 + 0.5) * genislik).toFixed(1) + 'px,' + ((-ara.y * 0.5 + 0.5) * yukseklik).toFixed(1) + 'px)';
    });
  }

  function odak(kid) {
    secili = kid || null;
    if (kid && ODAK[kid]) { kam.hHedef.set(ODAK[kid][0], ODAK[kid][1], 0); kam.hYakin = 0.5; }
    else { kam.hHedef.set(MERKEZ_X, -1, 0); kam.hYakin = 1; kam.hAz = 0.16; kam.hEl = 0.16; }
  }

  function temizle() { ro.disconnect(); renderer.dispose(); }

  return { ciz, odak, temizle };
}
