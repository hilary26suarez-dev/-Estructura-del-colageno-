const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- nav, reveal, scroll spy ---------- */
(function nav() {
  const btn = $('.menu-btn'), nav = $('.nav');
  btn.addEventListener('click', () => { nav.classList.toggle('open'); btn.setAttribute('aria-expanded', nav.classList.contains('open')); });
  $$('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
  const links = Object.fromEntries($$('.nav a').map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { $$('.nav a').forEach(a => a.classList.remove('active')); links[e.target.id]?.classList.add('active'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section').forEach(s => spy.observe(s));
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count; let v = 0;
    const tick = () => { v = Math.min(end, v + 1); el.textContent = v; if (v < end) setTimeout(tick, 40); };
    setTimeout(tick, 600);
  });
})();

/* ---------- hero ---------- */
const hero = new HelixRenderer($('#heroHelix'), { n: 60, radius: .11, tilt: -.36 });
$$('.mol-badge').forEach(b => { $('.mol-circle', b).innerHTML = molSVG(MOL[b.dataset.mol], { scale: 26, font: 13, pad: 18 }); });

/* ---------- fundamentals figures ---------- */
$('#svgAminoacid').innerHTML = molSVG(MOL.AA, { scale: 70, font: 22, pad: 40 });
const arrow = (top, bot = '', cls = '') => `<div class="rx-arrow ${cls}"><span>${top}</span><div class="ln"></div><span>${bot}</span></div>`;
$('#svgPeptide').innerHTML =
  molSVG(MOL.AA1, { scale: 34, font: 14 }) + '<span class="rx-op">+</span>' + molSVG(MOL.AA2, { scale: 34, font: 14 }) +
  arrow('condensación', '− H₂O') + molSVG(MOL.DIPEP, { scale: 34, font: 14 });
$('#svgResonance').innerHTML =
  molSVG(MOL.RES_A, { scale: 40, font: 15 }) + arrow('', '', 'res') + molSVG(MOL.RES_B, { scale: 40, font: 15 });
$('#svgHydrox').innerHTML =
  `<div style="text-align:center">${molSVG(MOL.PRO_RES, { scale: 40, font: 15 })}<div class="muted small">Residuo de Pro (posición Y)</div></div>` +
  arrow('prolil-4-hidroxilasa<br>Fe²⁺ · O₂ · α-cetoglutarato', 'ascorbato (vit. C)<br>→ succinato + CO₂') +
  `<div style="text-align:center">${molSVG(MOL.HYP_RES, { scale: 40, font: 15 })}<div class="muted small">Residuo de 4(<i>R</i>)-Hyp</div></div>`;

/* ---------- sequence explorer ---------- */
const seqState = { sel: 3, mutated: new Set() };
function renderSequence() {
  const box = $('#sequence'); box.innerHTML = '';
  for (let t = 0; t < SEQUENCE.length; t += 3) {
    const tri = document.createElement('div'); tri.className = 'triplet'; tri.setAttribute('role', 'listitem');
    for (let k = 0; k < 3; k++) {
      const i = t + k, ch = seqState.mutated.has(i) ? 'A' : SEQUENCE[i];
      const b = document.createElement('button');
      b.className = `res ${RES_INFO[ch].cls}` + (seqState.mutated.has(i) ? ' mut' : '') + (i === seqState.sel ? ' sel' : '');
      b.textContent = ch; b.title = `${RES_INFO[ch].three}${i + 1}`;
      b.setAttribute('aria-label', `${RES_INFO[ch].name}, posición ${i + 1}`);
      b.onclick = () => { seqState.sel = i; renderSequence(); renderResInfo(); };
      tri.appendChild(b);
    }
    box.appendChild(tri);
  }
}
function renderResInfo() {
  const i = seqState.sel, mut = seqState.mutated.has(i), ch = mut ? 'A' : SEQUENCE[i], info = RES_INFO[ch];
  const pos = ['Gly (posición 1, centro de la hélice)', 'X (posición 2, hacia afuera)', 'Y (posición 3, hacia afuera)'][i % 3];
  let bullets = '';
  if (ch === 'G' ) bullets = `<li>Cadena lateral: <b>–H</b>. Es el único residuo aquiral y el único que cabe en el eje de la triple hélice.</li><li>Su N–H forma un puente de H con el C=O del residuo X de la cadena vecina.</li><li>Gracias a esa flexibilidad, las cadenas pueden enrollarse tan juntas.</li>`;
  else if (ch === 'P') bullets = `<li>Aminoácido cíclico: el N forma parte de un anillo de pirrolidina (amina secundaria).</li><li>Fija el ángulo φ ≈ −65°, cercano al de la hélice de poliprolina II.</li><li>Su N <b>no tiene H</b> para donar puentes de H: aporta rigidez, no enlaces.</li>`;
  else if (ch === 'O') bullets = `<li>No la codifica el ADN: se forma <b>después de la traducción</b>, a partir de Pro.</li><li>El –OH en 4<i>R</i> fija el pliegue Cγ-exo por efecto <i>gauche</i> y estabiliza la hélice.</li><li>Forma puentes de H mediados por moléculas de agua alrededor de la hélice.</li>`;
  else if (ch === 'A' && mut) bullets = `<li>Cadena lateral –CH₃: <b>demasiado grande</b> para el centro de la hélice.</li><li>Se pierde el puente de H Gly N–H···O=C y la hélice se abre localmente.</li>`;
  else bullets = `<li>Cadena lateral: ${info.r || 'variable'}.</li><li>Los residuos en X e Y apuntan hacia afuera: interactúan con otras moléculas, el agua o las células.</li><li>Los cargados forman puentes salinos que guían el empaquetamiento en fibrillas.</li>`;
  const warn = mut ? `<div class="warn"><b>Sustitución de glicina:</b> es el tipo de mutación más común en la <b>osteogénesis imperfecta</b>. Un solo residuo voluminoso en el centro distorsiona la hélice, baja su estabilidad y altera la mecánica de la fibrilla. El resultado son huesos frágiles (Gautieri et al., 2009).</div>` : '';
  $('#resInfo').innerHTML = `<div class="ri-top"><div class="ri-mol">${molSVG(MOL[info.mol], { scale: 30, font: 13, pad: 18 })}</div>
    <div><h4>${info.name} <span class="muted">(${info.three}${i + 1})</span></h4><span class="pos">${pos}</span></div></div><ul>${bullets}</ul>${warn}`;
  const isG = SEQUENCE[i] === 'G';
  const mb = $('#mutateBtn');
  mb.disabled = !isG; mb.style.opacity = isG ? 1 : .45;
  mb.textContent = mut ? 'Revertir a Gly' : 'Mutar Gly → Ala';
  mb.classList.toggle('on', mut);
  mb.title = isG ? '' : 'Selecciona una glicina (amarilla) para mutarla';
  $('#crossSection').innerHTML = crossSVG(seqState.mutated.size > 0);
  $('#crossNote').innerHTML = seqState.mutated.size
    ? '<b style="color:#fca5a5">La Ala no cabe en el centro:</b> choca con las otras cadenas y desaparece su puente de H. La hélice se "abre" en ese punto.'
    : 'Cada Gly apunta al eje central. Su N–H forma un puente de hidrógeno con el C=O del residuo X de la cadena vecina.';
}
$('#mutateBtn').onclick = () => {
  const i = seqState.sel; if (SEQUENCE[i] !== 'G') return;
  seqState.mutated.has(i) ? seqState.mutated.delete(i) : seqState.mutated.add(i);
  renderSequence(); renderResInfo();
};

function crossSVG(mut) {
  const C = 180, cols = ['#60a5fa', '#a78bfa', '#f472b6'];
  const pt = (r, deg) => [C + r * Math.cos(deg * Math.PI / 180), C + r * Math.sin(deg * Math.PI / 180)];
  let s = `<defs><radialGradient id="cg" cx="50%" cy="50%"><stop offset="0" stop-color="#fde68a" stop-opacity=".25"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient></defs>`;
  s += `<circle cx="${C}" cy="${C}" r="46" fill="url(#cg)"/><circle cx="${C}" cy="${C}" r="3" fill="#fde68a"/>`;
  s += `<text x="${C}" y="${C + 62}" fill="#9aa0cc" font-size="10" text-anchor="middle" font-family="Inter">eje</text>`;
  const res = [];
  for (let c = 0; c < 3; c++) {
    const a = -90 + c * 120;
    const [bx, by] = pt(78, a);
    s += `<circle cx="${bx}" cy="${by}" r="64" fill="${cols[c]}" fill-opacity=".07" stroke="${cols[c]}" stroke-opacity=".35" stroke-dasharray="3 4"/>`;
    const [lx, ly] = pt(160, a);
    s += `<text x="${lx}" y="${ly}" fill="${cols[c]}" font-size="12" font-family="Outfit" font-weight="600" text-anchor="middle" dominant-baseline="central">Cadena ${'ABC'[c]}</text>`;
    res.push({ G: pt(30, a), X: pt(100, a + 30), Y: pt(108, a - 26), a });
  }
  // H-bonds G(c) -> X(c+1)
  for (let c = 0; c < 3; c++) {
    const g = res[c].G, x = res[(c + 1) % 3].X;
    const broken = mut && c === 0;
    s += `<line x1="${g[0]}" y1="${g[1]}" x2="${x[0]}" y2="${x[1]}" stroke="${broken ? '#ef4444' : '#22d3ee'}" stroke-width="2" stroke-dasharray="4 4" opacity="${broken ? .6 : .9}"/>`;
    if (broken) { const m = [(g[0] + x[0]) / 2, (g[1] + x[1]) / 2]; s += `<text x="${m[0]}" y="${m[1]}" fill="#ef4444" font-size="20" font-weight="700" text-anchor="middle" dominant-baseline="central">✕</text>`; }
  }
  const ball = (p, r, c1, c2, t) => `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${c1}" stroke="${c2}" stroke-width="2"/><text x="${p[0]}" y="${p[1]}" font-size="${r * .8}" font-family="JetBrains Mono" font-weight="700" fill="#0b0d24" text-anchor="middle" dominant-baseline="central">${t}</text>`;
  res.forEach((r, c) => {
    s += ball(r.X, 17, '#93c5fd', '#2563eb', 'P') + ball(r.Y, 17, '#f9a8d4', '#db2777', 'O');
    if (mut && c === 0) {
      const p = [C + 6 * Math.cos(r.a * Math.PI / 180), C + 6 * Math.sin(r.a * Math.PI / 180)];
      s += `<circle cx="${p[0]}" cy="${p[1]}" r="34" fill="#ef4444" fill-opacity=".18"><animate attributeName="r" values="30;38;30" dur="1.2s" repeatCount="indefinite"/></circle>`;
      s += ball(p, 22, '#fca5a5', '#dc2626', 'A');
      s += `<text x="${C + 70}" y="${C - 8}" fill="#fca5a5" font-size="12" font-family="Outfit" font-weight="600">choque estérico</text>`;
    } else s += ball(r.G, 12, '#fef3c7', '#d4a017', 'G');
  });
  s += `<text x="${C}" y="350" fill="#22d3ee" font-size="11" text-anchor="middle" font-family="Inter">– – –  N–H (Gly) ··· O=C (X)</text>`;
  return `<svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}
renderSequence(); renderResInfo();

/* ---------- hierarchy ---------- */
const H_COLORS = ['#60a5fa', '#7c8cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6'];
function hArt(key) {
  const W = 600, H = 280; let s = '';
  const g = `<defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset=".5" stop-color="#a78bfa"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs>`;
  const bead = (x, y, r, c, t = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .35}" fill="#fff" opacity=".45"/>${t ? `<text x="${x}" y="${y + 1}" font-size="${r * .75}" font-family="JetBrains Mono" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#0b0d24">${t}</text>` : ''}`;
  const rc = ['#fde68a', '#60a5fa', '#f472b6'];
  if (key === 'aa') {
    s += `<line x1="60" y1="140" x2="540" y2="140" stroke="#6b7099" stroke-width="3"/>`;
    ['G', 'P', 'O', 'G', 'P', 'O', 'G'].forEach((t, k) => s += bead(80 + k * 73, 140, k < 6 ? 28 : 20, rc[k % 3], t));
    s += `<text x="300" y="220" font-size="22" fill="#e9eaff" font-family="JetBrains Mono" text-anchor="middle">–[ Gly – X – Y ]ₙ–</text>`;
    s += `<text x="300" y="70" font-size="13" fill="#9aa0cc" font-family="Inter" text-anchor="middle">enlaces peptídicos (amida) entre residuos</text>`;
  } else if (key === 'alpha' || key === 'triple') {
    const chains = key === 'alpha' ? 1 : 3, cols = ['#60a5fa', '#a78bfa', '#f472b6'];
    for (let c = 0; c < chains; c++) {
      let d = '', beads = [];
      for (let x = 30; x <= 570; x += 4) {
        const ph = x / 38 + c * 2.094; const y = 140 + 52 * Math.sin(ph);
        d += (x === 30 ? 'M' : 'L') + x + ' ' + y.toFixed(1);
      }
      s += `<path d="${d}" fill="none" stroke="${cols[c]}" stroke-width="${key === 'alpha' ? 6 : 9}" stroke-linecap="round" opacity=".85"/>`;
      for (let k = 0; k < 40; k++) {
        const x = 34 + k * 13.5, ph = x / 38 + c * 2.094, y = 140 + 52 * Math.sin(ph);
        if (Math.cos(ph) > -.2 || key === 'alpha') beads.push(bead(x, y, 6, rc[k % 3]));
      }
      s += beads.join('');
    }
    s += `<text x="300" y="262" font-size="13" fill="#9aa0cc" font-family="Inter" text-anchor="middle">${key === 'alpha' ? 'hélice de poliprolina II · levógira · ~3,3 residuos/vuelta' : 'superhélice dextrógira · 3 cadenas α · desfase de 1 residuo'}</text>`;
    if (key === 'triple') s += `<line x1="40" y1="40" x2="560" y2="40" stroke="#9aa0cc" stroke-width="1"/><text x="300" y="30" font-size="12" fill="#9aa0cc" text-anchor="middle" font-family="Inter">300 nm</text>`;
  } else if (key === 'fibril') {
    const D = 38, len = 4.4 * D, period = 5 * D;
    s += `<clipPath id="fc"><rect x="20" y="40" width="560" height="190" rx="14"/></clipPath><g clip-path="url(#fc)">`;
    for (let row = 0; row < 10; row++) {
      const y = 52 + row * 18, off = (row % 5) * D - period;
      for (let x = off; x < 600; x += period)
        s += `<rect x="${x}" y="${y}" width="${len}" height="10" rx="5" fill="url(#hg)" opacity="${.65 + (row % 3) * .12}"/>`;
    }
    for (let x = -period; x < 620; x += period) s += `<rect x="${x + len}" y="40" width="${period - len}" height="190" fill="#0b0d24" opacity="0"/>`;
    s += `</g>`;
    s += `<line x1="100" y1="248" x2="${100 + D}" y2="248" stroke="#22d3ee" stroke-width="2"/><text x="${100 + D / 2}" y="268" fill="#22d3ee" font-size="12" text-anchor="middle" font-family="Inter">D = 67 nm</text>`;
    s += `<text x="400" y="268" fill="#9aa0cc" font-size="12" text-anchor="middle" font-family="Inter">escalonamiento ≈ ¼ → zonas de hueco y solapamiento</text>`;
  } else if (key === 'fiber') {
    for (let k = 0; k < 9; k++) {
      const y = 50 + k * 21, wob = (k % 2 ? 6 : -4);
      s += `<rect x="${30 + wob}" y="${y}" width="540" height="16" rx="8" fill="url(#hg)" opacity="${.5 + (k % 3) * .15}"/>`;
      for (let x = 40 + wob + (k % 5) * 4; x < 565; x += 14) s += `<line x1="${x}" y1="${y + 2}" x2="${x}" y2="${y + 14}" stroke="#0b0d24" stroke-opacity=".35" stroke-width="3"/>`;
    }
    s += `<text x="300" y="262" fill="#9aa0cc" font-size="12" text-anchor="middle" font-family="Inter">haz de fibrillas con bandas D, unidas por proteoglicanos</text>`;
  } else {
    for (let k = 0; k < 14; k++) {
      let d = ''; const y0 = 40 + k * 14;
      for (let x = 20; x <= 580; x += 5) d += (x === 20 ? 'M' : 'L') + x + ' ' + (y0 + 6 * Math.sin(x / 22 + k * .4)).toFixed(1);
      s += `<path d="${d}" stroke="${H_COLORS[k % 6]}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".75"/>`;
    }
    s += `<text x="300" y="262" fill="#9aa0cc" font-size="12" text-anchor="middle" font-family="Inter">tendón: fibras paralelas onduladas (crimp) que se enderezan al tensarse</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${g}${s}</svg>`;
}
let hIdx = 2;
function renderHierarchy() {
  $('#hSteps').innerHTML = HIERARCHY.map((h, k) => `<button class="h-step ${k === hIdx ? 'on' : ''}" data-k="${k}"><small>Nivel ${k + 1}</small><b>${h.name}</b></button>`).join('');
  $$('.h-step').forEach(b => b.onclick = () => { hIdx = +b.dataset.k; renderHierarchy(); });
  const h = HIERARCHY[hIdx];
  $('#hArt').innerHTML = hArt(h.key);
  $('#hInfo').innerHTML = `<div class="size grad">${h.size}</div><div class="muted small">${h.unit}</div><span class="force">${h.force}</span><p>${h.text}</p><p class="muted small">(${h.cite})</p>`;
  $('#scaleBar').innerHTML = HIERARCHY.map((_, k) => `<i class="${k <= hIdx ? 'on' : ''}" style="background:${H_COLORS[k]}"></i>`).join('');
}
renderHierarchy();

/* ---------- applications ---------- */
const APP_ART = {
  scaffold: `<svg viewBox="0 0 120 120"><defs><linearGradient id="sa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c4b5fd"/><stop offset="1" stop-color="#6d28d9"/></linearGradient></defs><path d="M60 10 L105 35 L105 85 L60 110 L15 85 L15 35Z" fill="url(#sa)" opacity=".85"/><path d="M60 10 L105 35 L60 60 L15 35Z" fill="#ddd6fe" opacity=".5"/><path d="M60 60 L60 110" stroke="#ede9fe" opacity=".5"/>${[[38, 32], [60, 26], [82, 34], [48, 44], [72, 46], [30, 62], [42, 78], [30, 90], [52, 92], [78, 66], [90, 80], [72, 92], [92, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#1e1b4b" opacity=".75"/>`).join('')}</svg>`,
  skin: `<svg viewBox="0 0 120 120"><path d="M10 40 Q60 25 110 40 L110 55 Q60 42 10 55Z" fill="#fca5a5"/><path d="M10 55 Q60 42 110 55 L110 78 Q60 66 10 78Z" fill="#f472b6" opacity=".8"/><path d="M10 78 Q60 66 110 78 L110 100 Q60 92 10 100Z" fill="#a78bfa" opacity=".7"/><path d="M45 33 L55 60 L65 34" fill="#7f1d1d" opacity=".8"/>${[20, 35, 50, 70, 85, 100].map(x => `<path d="M${x} 70 q4 6 0 12 q-4 6 0 12" stroke="#fde68a" stroke-width="1.5" fill="none" opacity=".7"/>`).join('')}</svg>`,
  drop: `<svg viewBox="0 0 120 120"><path d="M60 12 C 60 12 26 55 26 76 a34 34 0 0 0 68 0 C94 55 60 12 60 12Z" fill="#e11d48" opacity=".85"/><path d="M42 72 a18 18 0 0 0 10 22" stroke="#fecdd3" stroke-width="4" fill="none" stroke-linecap="round"/>${[[50, 60], [70, 70], [62, 88], [76, 52]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.5" fill="#fde68a" opacity=".9"/>`).join('')}<path d="M20 100 Q60 85 100 104" stroke="#a78bfa" stroke-width="5" fill="none"/></svg>`,
  suture: `<svg viewBox="0 0 120 120"><path d="M20 90 Q 20 30 70 25" stroke="#cbd5e1" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M70 25 Q 110 25 100 60 Q 90 95 60 80 Q 35 68 55 50 Q 75 35 85 55" stroke="url(#sg)" stroke-width="4" fill="none"/><defs><linearGradient id="sg"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs></svg>`,
  bone: `<svg viewBox="0 0 120 120"><path d="M15 95 Q20 40 60 30 Q100 40 105 95Z" fill="#fef3c7" opacity=".9"/>${[[40, 70], [60, 55], [80, 72], [50, 85], [70, 86], [90, 88], [30, 88], [60, 72]].map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="${5 + k % 3 * 2}" ry="${4 + k % 2 * 2}" fill="#78350f" opacity=".55"/>`).join('')}</svg>`,
  drug: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="#4c1d95" opacity=".5" stroke="#a78bfa" stroke-width="2"/><circle cx="60" cy="60" r="44" fill="url(#dg)"/><defs><radialGradient id="dg" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>${[[45, 45], [72, 42], [60, 62], [40, 72], [78, 72], [58, 84], [86, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#c084fc"/>`).join('')}${[[110, 30], [105, 95], [14, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#c084fc" opacity=".6"/>`).join('')}</svg>`,
};
$('#apps').innerHTML = APPS.map(a => `<div class="app reveal" tabindex="0"><div class="app-inner">
  <div class="app-face"><div class="app-art">${APP_ART[a.art]}</div><h4>${a.name}</h4><span class="sub">${a.sub}</span></div>
  <div class="app-face back"><span class="key">Propiedad química clave</span><h4>${a.key}</h4><p>${a.text}</p><span class="ex">${a.ex}</span></div>
</div></div>`).join('');
$$('.app').forEach(el => { el.addEventListener('click', () => el.classList.toggle('flip')); new IntersectionObserver(es => es[0].isIntersecting && el.classList.add('in')).observe(el); });

let xlKey = 'ga';
function renderXL() {
  $('#xlTabs').innerHTML = Object.entries(CROSSLINKERS).map(([k, v]) => `<button data-k="${k}" class="${k === xlKey ? 'on' : ''}">${v.name}</button>`).join('');
  $$('#xlTabs button').forEach(b => b.onclick = () => { xlKey = b.dataset.k; renderXL(); });
  const x = CROSSLINKERS[xlKey];
  const meter = (lab, v, col) => `<div class="meter"><span>${lab}</span><div class="t"><i style="width:${v}%;background:${col}"></i></div><b>${v}</b></div>`;
  $('#xlBody').innerHTML = `<div><div class="mech">${x.mech}</div><p class="mt">${x.text}</p></div>
    <div>${meter('Eficacia de entrecruzamiento', x.m.ef, 'linear-gradient(90deg,#60a5fa,#a78bfa)')}${meter('Citotoxicidad', x.m.tox, 'linear-gradient(90deg,#fbbf24,#ef4444)')}${meter('Costo relativo', x.m.cost, 'linear-gradient(90deg,#a78bfa,#f472b6)')}
    <p class="muted small">Escala comparativa cualitativa (0–100) basada en Parenteau-Bareil et al. (2010) y Sung et al. (1999).</p></div>`;
}
renderXL();

/* ---------- sources table ---------- */
$('#sourcesTbl').innerHTML = `<thead><tr><th>Fuente</th><th>Origen</th><th>Costo relativo</th><th>Riesgo sanitario</th><th>T. desnaturalización</th><th>Comentario</th></tr></thead><tbody>` +
  SOURCES.map(s => `<tr><td>${s.src}</td><td>${s.from}</td><td><div class="cost">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= s.cost ? 'on' : ''}"></i>`).join('')}</div></td>
  <td><span class="risk ${s.risk[0]}">${s.risk[1]}</span></td><td>${s.tm}</td><td class="muted">${s.note}</td></tr>`).join('') + '</tbody>';

/* ---------- quiz ---------- */
const qz = { i: 0, score: 0 };
function renderQuiz() {
  $('#qBar').style.width = (qz.i / QUIZ.length * 100) + '%';
  if (qz.i >= QUIZ.length) {
    const pct = Math.round(qz.score / QUIZ.length * 100);
    $('#quizBox').innerHTML = `<div class="q-final"><div class="score grad">${qz.score}/${QUIZ.length}</div><p>${pct >= 80 ? '¡Excelente! Dominas la química del colágeno.' : pct >= 50 ? 'Buen trabajo. Repasa las secciones donde fallaste.' : 'Vuelve a explorar las secciones 01–05 e inténtalo de nuevo.'}</p><button class="btn primary" id="qRestart">Reintentar</button></div>`;
    $('#qRestart').onclick = () => { qz.i = 0; qz.score = 0; renderQuiz(); };
    return;
  }
  const q = QUIZ[qz.i];
  $('#quizBox').innerHTML = `<div class="q-num">Pregunta ${qz.i + 1} de ${QUIZ.length}</div><div class="q-text">${q.q}</div>
    <div class="q-opts">${q.o.map((o, k) => `<button class="q-opt" data-k="${k}">${'ABCD'[k]}. ${o}</button>`).join('')}</div><div id="qAfter"></div>`;
  $$('.q-opt').forEach(b => b.onclick = () => {
    const k = +b.dataset.k;
    $$('.q-opt').forEach(x => { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add('right'); });
    if (k === q.a) qz.score++; else b.classList.add('wrong');
    $('#qAfter').innerHTML = `<div class="q-exp">${k === q.a ? '✓ Correcto. ' : '✕ No exactamente. '}${q.e}</div><div class="q-foot"><button class="btn primary" id="qNext">${qz.i === QUIZ.length - 1 ? 'Ver resultado' : 'Siguiente →'}</button></div>`;
    $('#qNext').onclick = () => { qz.i++; renderQuiz(); };
  });
}
renderQuiz();

/* ---------- refs ---------- */
$('#refs').innerHTML = REFS.map(r => `<li>${r}</li>`).join('');
