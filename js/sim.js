/* Qualitative, didactic model linking chemistry → thermal stability → stress–strain.
   Calibrated so the "healthy tendon" preset falls in typical ranges:
   Tm ≈ 41–42 °C, E ≈ 1 GPa, σ_max ≈ 100 MPa, ε_rotura ≈ 12 % (Fratzl, 2008; Shoulders y Raines, 2009). */
(function () {
  const el = id => document.getElementById(id);
  const sHyp = el('sHyp'), sXl = el('sXl'), sSub = el('sSub'), sT = el('sT'), sAgent = el('sAgent');
  const helix = new HelixRenderer(el('simHelix'), { n: 39, radius: .17, tilt: 0, size: .95, colorByResidue: true, glow: false, speed: .7 });

  const AGENT = { natural: { tox: 0, tm: 0, label: 'natural' }, dht: { tox: 3, tm: -3, label: 'DHT' }, ga: { tox: 80, tm: 6, label: 'glutaraldehído' },
    gen: { tox: 12, tm: 5, label: 'genipina' }, edc: { tox: 8, tm: 3, label: 'EDC/NHS' } };

  const PRESETS = [
    { n: 'Tendón sano', v: [45, 50, 0, 37, 'natural'] },
    { n: 'Escorbuto (sin vit. C)', v: [8, 35, 0, 37, 'natural'] },
    { n: 'Colágeno marino', v: [20, 30, 0, 37, 'natural'] },
    { n: 'Osteogénesis imperfecta', v: [45, 50, 2, 37, 'natural'] },
    { n: 'Andamio sin entrecruzar', v: [45, 8, 0, 37, 'dht'] },
    { n: 'Exceso de glutaraldehído', v: [45, 100, 0, 37, 'ga'] },
    { n: 'Esterilización con calor', v: [45, 50, 0, 62, 'natural'] },
  ];
  el('presets').innerHTML = PRESETS.map((p, k) => `<button data-k="${k}">${p.n}</button>`).join('');
  document.querySelectorAll('#presets button').forEach(b => b.onclick = () => {
    const [h, x, s, t, a] = PRESETS[+b.dataset.k].v;
    sHyp.value = h; sXl.value = x; sSub.value = s; sT.value = t; sAgent.value = a;
    document.querySelectorAll('#presets button').forEach(z => z.classList.toggle('on', z === b));
    update();
  });

  function model(hyp, xl, sub, T, agent) {
    const A = AGENT[agent];
    const Tm = 27 + 30 * hyp + 6 * xl - 5 * sub + A.tm;
    const fold = 1 / (1 + Math.exp((T - Tm) / 2));
    const E = (0.3 + 1.4 * xl) * (0.15 + 0.85 * fold) * (1 - 0.12 * sub);          // GPa
    const eToe = 0.025;
    const eF = (0.165 - 0.085 * xl) * (1 - 0.15 * sub) * (0.6 + 0.4 * fold);        // failure strain
    const sMax = 1000 * E * Math.max(0.002, eF - eToe / 2);                         // MPa
    const tough = 1000 * E * (eToe * eToe / 6 + Math.max(0, eF - eToe) ** 2 / 2 + Math.max(0, eF - eToe) * eToe / 2) ; // MJ/m³
    const degr = Math.min(100, 12 + 80 * Math.pow(xl, .8) + (agent === 'ga' ? 8 : 0)) * (0.4 + 0.6 * fold);
    return { Tm, fold, E, eToe, eF, sMax, tough, degr, tox: A.tox };
  }
  const stressAt = (m, e) => e < m.eToe ? 1000 * m.E * e * e / (2 * m.eToe) : 1000 * m.E * (e - m.eToe / 2);

  function chart(m, ref) {
    const W = 640, H = 300, L = 52, B = 40, R = 16, T = 16, xMax = 0.20, yMax = 160;
    const X = e => L + (e / xMax) * (W - L - R), Y = s => H - B - (s / yMax) * (H - B - T);
    let s = '';
    for (let v = 0; v <= yMax; v += 40) s += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(150,140,255,.12)"/><text x="${L - 8}" y="${Y(v)}" fill="#9aa0cc" font-size="11" text-anchor="end" dominant-baseline="central">${v}</text>`;
    for (let v = 0; v <= 20; v += 5) s += `<text x="${X(v / 100)}" y="${H - B + 18}" fill="#9aa0cc" font-size="11" text-anchor="middle">${v}</text>`;
    s += `<text x="${(W + L) / 2}" y="${H - 4}" fill="#9aa0cc" font-size="12" text-anchor="middle">Deformación (%)</text>`;
    s += `<text transform="translate(14 ${(H - B) / 2}) rotate(-90)" fill="#9aa0cc" font-size="12" text-anchor="middle">Esfuerzo (MPa)</text>`;
    // regions
    s += `<rect x="${X(0)}" y="${T}" width="${X(m.eToe) - X(0)}" height="${H - B - T}" fill="#22d3ee" opacity=".05"/>`;
    s += `<text x="${(X(0) + X(m.eToe)) / 2}" y="${T + 12}" fill="#67e8f9" font-size="10" text-anchor="middle">pie</text>`;
    s += `<text x="${(X(m.eToe) + X(Math.min(m.eF, .19))) / 2}" y="${T + 12}" fill="#c4b5fd" font-size="10" text-anchor="middle">región lineal</text>`;
    const path = (mm, dash, col, w) => {
      let d = '';
      for (let e = 0; e <= mm.eF; e += 0.0015) d += (d ? 'L' : 'M') + X(e).toFixed(1) + ' ' + Y(Math.min(yMax, stressAt(mm, e))).toFixed(1);
      const yF = Y(Math.min(yMax, stressAt(mm, mm.eF)));
      d += `L${X(mm.eF).toFixed(1)} ${yF} L${X(mm.eF + 0.008).toFixed(1)} ${Y(0)}`;
      return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" ${dash ? 'stroke-dasharray="5 5"' : ''} stroke-linejoin="round"/>`;
    };
    s += `<defs><linearGradient id="cgr" x1="0" x2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset=".5" stop-color="#a78bfa"/><stop offset="1" stop-color="#f472b6"/></linearGradient>
      <linearGradient id="cfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a78bfa" stop-opacity=".35"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/></linearGradient></defs>`;
    // area (toughness)
    let a = `M${X(0)} ${Y(0)}`; for (let e = 0; e <= m.eF; e += 0.0015) a += `L${X(e).toFixed(1)} ${Y(Math.min(yMax, stressAt(m, e))).toFixed(1)}`;
    s += `<path d="${a}L${X(m.eF)} ${Y(0)}Z" fill="url(#cfill)"/>`;
    s += path(ref, true, 'rgba(203,213,255,.45)', 1.6);
    s += path(m, false, 'url(#cgr)', 3.2);
    const fx = X(m.eF), fy = Y(Math.min(yMax, stressAt(m, m.eF)));
    s += `<circle cx="${fx}" cy="${fy}" r="6" fill="#f472b6"><animate attributeName="r" values="5;8;5" dur="1.6s" repeatCount="indefinite"/></circle>`;
    s += `<text x="${Math.min(fx + 10, W - 90)}" y="${fy - 10}" fill="#fbcfe8" font-size="11">rotura</text>`;
    s += `<line x1="${W - 180}" x2="${W - 160}" y1="${T + 30}" y2="${T + 30}" stroke="rgba(203,213,255,.6)" stroke-dasharray="5 5"/><text x="${W - 154}" y="${T + 30}" fill="#9aa0cc" font-size="11" dominant-baseline="central">referencia: tendón sano</text>`;
    s += `<line x1="${W - 180}" x2="${W - 160}" y1="${T + 48}" y2="${T + 48}" stroke="#c084fc" stroke-width="3"/><text x="${W - 154}" y="${T + 48}" fill="#9aa0cc" font-size="11" dominant-baseline="central">tu material</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
  }

  const gauge = (lab, val, pct, bad) => `<div class="gauge ${bad ? 'bad' : ''}"><span>${lab}</span><b>${val}</b><div class="bar"><i style="width:${Math.max(2, Math.min(100, pct))}%"></i></div></div>`;
  const REF = model(.45, .5, 0, 37, 'natural');

  function update() {
    const hyp = sHyp.value / 100, xl = sXl.value / 100, sub = +sSub.value, T = +sT.value, agent = sAgent.value;
    [sHyp, sXl, sSub, sT].forEach(s => s.style.setProperty('--p', ((s.value - s.min) / (s.max - s.min) * 100) + '%'));
    el('vHyp').textContent = sHyp.value + ' %'; el('vXl').textContent = sXl.value + ' %'; el('vSub').textContent = sub; el('vT').textContent = T + ' °C';
    const m = model(hyp, xl, sub, T, agent);
    el('gauges').innerHTML =
      gauge('T. de desnaturalización (Tm)', m.Tm.toFixed(0) + ' °C', (m.Tm - 15) / 60 * 100, m.Tm < 38) +
      gauge(`Hélice plegada a ${T} °C`, (m.fold * 100).toFixed(0) + ' %', m.fold * 100, m.fold < .5) +
      gauge('Módulo elástico E', m.E.toFixed(2) + ' GPa', m.E / 2 * 100) +
      gauge('Resistencia a la tracción', m.sMax.toFixed(0) + ' MPa', m.sMax / 150 * 100, m.sMax < 40) +
      gauge('Tenacidad (área)', m.tough.toFixed(1) + ' MJ/m³', m.tough / 9 * 100, m.tough < 2.5) +
      gauge('Resistencia a colagenasas', m.degr.toFixed(0) + ' / 100', m.degr, m.degr < 30) +
      gauge('Citotoxicidad residual', m.tox + ' / 100', m.tox, m.tox > 40);
    el('ssChart').innerHTML = chart(m, REF);
    helix.state.disorder = 1 - m.fold;
    helix.state.crosslink = xl;
    helix.state.mutAt = sub > 0 ? 24 : -1;

    const msgs = [];
    if (m.fold < .5) msgs.push(`🔥 A ${T} °C la triple hélice se <b>desnaturaliza</b>: los puentes de H entre cadenas se rompen y el colágeno pasa a <b>gelatina</b> (cadenas desordenadas). La rigidez se pierde.`);
    else if (m.Tm < 40) msgs.push(`⚠️ Tm de ${m.Tm.toFixed(0)} °C: el material queda muy cerca de la temperatura corporal. Con poca Hyp hay menos preorganización estereoelectrónica (así ocurre en el escorbuto y en el colágeno de peces de aguas frías).`);
    if (sub > 0) msgs.push(`🧬 ${sub} sustitución(es) de Gly abren la hélice localmente. Baja la Tm y el material falla antes: es el mecanismo molecular de la osteogénesis imperfecta.`);
    if (xl > .85) msgs.push(`🔗 Con un entrecruzamiento excesivo el material es más rígido pero <b>frágil</b>: rompe a menor deformación y absorbe menos energía (menor tenacidad).`);
    else if (xl < .2) msgs.push(`🧽 Sin entrecruzamiento, las moléculas se deslizan entre sí con facilidad: baja resistencia y degradación enzimática rápida. Por eso los andamios comerciales se entrecruzan.`);
    if (m.tox > 40) msgs.push(`☣️ El glutaraldehído deja aldehídos residuales <b>citotóxicos</b>. Se compromete la biocompatibilidad: considera genipina o EDC/NHS.`);
    if (!msgs.length) msgs.push('✅ Equilibrio adecuado: hélice estable a 37 °C, buena resistencia y tenacidad, degradación controlada. Este es el objetivo de diseño de un biomaterial de colágeno.');
    el('simMsg').innerHTML = msgs.join('<br>');
  }
  [sHyp, sXl, sSub, sT, sAgent].forEach(s => s.addEventListener('input', () => { document.querySelectorAll('#presets button').forEach(z => z.classList.remove('on')); update(); }));
  update();
})();
