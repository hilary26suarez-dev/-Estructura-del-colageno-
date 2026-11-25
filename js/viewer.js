/* In-silico structural viewer (3Dmol.js + RCSB PDB). */
(function () {
  const $ = s => document.querySelector(s);
  const RES_COL = { GLY: '#fde68a', PRO: '#60a5fa', HYP: '#f472b6', ALA: '#ef4444' };
  const CHAIN_COL = ['#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#22d3ee'];
  const S = { id: '1CAG', style: 'ballstick', color: 'residue', hbond: true, glyOnly: false, spin: true, compare: false };
  const cache = {};
  let views = [];

  $('#pdbList').innerHTML = PDB_LIST.map(p => `<button class="pdb-item" data-id="${p.id}"><b>${p.id}</b> · ${p.title}<span>${p.desc}</span></button>`).join('');
  const mark = () => document.querySelectorAll('.pdb-item').forEach(b => b.classList.toggle('on', b.dataset.id === S.id));

  function status(msg) { const o = $('#viewerStatus'); o.innerHTML = msg || ''; o.style.display = msg ? 'grid' : 'none'; }

  async function fetchPDB(id) {
    if (cache[id]) return cache[id];
    const r = await fetch(`https://files.rcsb.org/download/${id}.pdb`);
    if (!r.ok) throw new Error('No se encontró la estructura ' + id);
    return (cache[id] = await r.text());
  }

  const pool = {};
  function getViewer(elId) {
    if (!pool[elId]) pool[elId] = $3Dmol.createViewer(document.getElementById(elId), { backgroundColor: '#000000', backgroundAlpha: 0, antialias: true });
    const v = pool[elId]; v.resize(); return v;
  }

  function colorFor(atom, chainIdx) {
    if (S.color === 'chain') return CHAIN_COL[chainIdx[atom.chain] % CHAIN_COL.length];
    if (S.color === 'element') return { C: '#c8c8d8', N: '#60a5fa', O: '#f87171', S: '#fde047' }[atom.elem] || '#ffffff';
    return RES_COL[atom.resn] || '#94a3b8';
  }

  /* Clean the PDB and orient it: first model only, altLoc ' '/'A', no water,
     at most one triple helix (first 3 chains), long axis aligned with screen X. */
  function prepare(pdbText) {
    const lines = [], keepChains = [];
    let totalChains = new Set();
    for (const l of pdbText.split('\n')) {
      if (l.startsWith('ENDMDL')) break;
      if (!(l.startsWith('ATOM') || l.startsWith('HETATM'))) continue;
      const alt = l[16], resn = l.slice(17, 20).trim(), ch = l[21];
      if (alt !== ' ' && alt !== 'A') continue;
      if (resn === 'HOH' || resn === 'WAT' || resn === 'DOD') continue;
      totalChains.add(ch);
      if (!keepChains.includes(ch)) { if (keepChains.length >= 3) continue; keepChains.push(ch); }
      lines.push({ l: l.slice(0, 16) + ' ' + l.slice(17), x: +l.slice(30, 38), y: +l.slice(38, 46), z: +l.slice(46, 54), ca: l.slice(12, 16).trim() === 'CA' });
    }
    const pts = lines.filter(p => p.ca).length > 3 ? lines.filter(p => p.ca) : lines;
    const c = [0, 0, 0]; pts.forEach(p => { c[0] += p.x; c[1] += p.y; c[2] += p.z; }); c.forEach((_, i) => c[i] /= pts.length);
    const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    pts.forEach(p => { const d = [p.x - c[0], p.y - c[1], p.z - c[2]]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cov[i][j] += d[i] * d[j]; });
    let v = [1, .3, .2];                                   // power iteration → principal axis
    for (let k = 0; k < 60; k++) {
      const w = cov.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]); const n = Math.hypot(...w) || 1; v = w.map(t => t / n);
    }
    // rotation (Rodrigues) taking v onto the x axis
    const ax = [0, v[2], -v[1]], s = Math.hypot(...ax), cs = v[0];
    const R = s < 1e-6 ? [[1, 0, 0], [0, 1, 0], [0, 0, 1]] : (() => {
      const k = ax.map(t => t / s), K = [[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]];
      const I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], K2 = K.map((r, i) => r.map((_, j) => K[i][0] * K[0][j] + K[i][1] * K[1][j] + K[i][2] * K[2][j]));
      return I.map((r, i) => r.map((_, j) => I[i][j] + s * K[i][j] + (1 - cs) * K2[i][j]));
    })();
    const f = n => n.toFixed(3).padStart(8).slice(-8);
    const out = lines.map(p => {
      const d = [p.x - c[0], p.y - c[1], p.z - c[2]];
      const r = R.map(row => row[0] * d[0] + row[1] * d[1] + row[2] * d[2]);
      return p.l.slice(0, 30) + f(r[0]) + f(r[1]) + f(r[2]) + p.l.slice(54);
    });
    return { text: out.join('\n') + '\nEND\n', totalChains: totalChains.size };
  }

  function render(v, pdbText, info) {
    v.clear();
    const prep = prepare(pdbText);
    const m = v.addModel(prep.text, 'pdb');
    const atoms = m.selectedAtoms({}).filter(a => a.resn !== 'HOH' && a.resn !== 'WAT' && a.elem !== 'H');
    const chains = [...new Set(atoms.map(a => a.chain))];
    const chainIdx = Object.fromEntries(chains.map((c, i) => [c, i]));
    const resns = [...new Set(atoms.map(a => a.resn))];
    m.setStyle({}, {});
    const sel = { resn: resns };
    const cf = a => {
      if (S.glyOnly && a.resn !== 'GLY' && a.resn !== 'ALA') return '#3b3f63';
      return colorFor(a, chainIdx);
    };
    if (S.style === 'sphere') m.setStyle(sel, { sphere: { colorfunc: cf, scale: .95 } });
    else if (S.style === 'stick') m.setStyle(sel, { stick: { colorfunc: cf, radius: .2 } });
    else if (S.style === 'ballstick') m.setStyle(sel, { stick: { colorfunc: cf, radius: .14 }, sphere: { colorfunc: cf, scale: .28 } });
    else {
      // custom Cα trace: robust even when HYP is a HETATM
      const ca = atoms.filter(a => a.atom === 'CA');
      ca.forEach((a, k) => {
        v.addSphere({ center: { x: a.x, y: a.y, z: a.z }, radius: a.resn === 'GLY' ? .55 : .75, color: cf(a) });
        const b = ca[k + 1];
        if (b && b.chain === a.chain && Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 4.3)
          v.addCylinder({ start: { x: a.x, y: a.y, z: a.z }, end: { x: b.x, y: b.y, z: b.z }, radius: .32, color: CHAIN_COL[chainIdx[a.chain] % 6], fromCap: 1, toCap: 1 });
      });
    }

    // inter-chain backbone H-bonds: N(donor, not Pro/Hyp) ··· O, distance < 3.5 Å
    const N = atoms.filter(a => a.atom === 'N' && a.resn !== 'PRO' && a.resn !== 'HYP');
    const O = atoms.filter(a => a.atom === 'O');
    let hb = 0;
    N.forEach(n => O.forEach(o => {
      if (n.chain === o.chain) return;
      const d = Math.hypot(n.x - o.x, n.y - o.y, n.z - o.z);
      if (d < 3.5) {
        hb++;
        if (S.hbond) v.addCylinder({ start: { x: n.x, y: n.y, z: n.z }, end: { x: o.x, y: o.y, z: o.z }, radius: .09, color: '#22d3ee', dashed: true, dashLength: .25, gapLength: .2 });
      }
    }));

    // label substitutions (ALA in a Gly position)
    const ala = atoms.filter(a => a.resn === 'ALA' && a.atom === 'CA');
    ala.forEach((a, k) => { if (k < 3) v.addLabel(`Ala${a.resi} (${a.chain})`, { position: a, backgroundColor: '#7f1d1d', backgroundOpacity: .85, fontColor: '#fff', fontSize: 12, borderRadius: 6 }); });

    if (!v._oriented) { v._oriented = true; } else { const cur = v.getView(); cur[4] = 0; cur[5] = 0; cur[6] = 0; cur[7] = 1; v.setView(cur); } // reset rotation, keep camera distance
    v.zoomTo(sel); v.zoom(S.compare ? .95 : 1.15);
    v.spin(S.spin ? 'x' : false, .5);                     // spin around the helix's own axis
    v.render();

    const count = r => new Set(atoms.filter(a => a.resn === r && a.atom === 'CA').map(a => a.chain + a.resi)).size;
    return { chains: chains.length, total: prep.totalChains, res: new Set(atoms.filter(a => a.atom === 'CA').map(a => a.chain + a.resi)).size, gly: count('GLY'), hyp: count('HYP'), pro: count('PRO'), ala: count('ALA'), hb };
  }

  async function load() {
    if (typeof $3Dmol === 'undefined') { status('No se pudo cargar 3Dmol.js.<br><small>Revisa tu conexión a internet.</small>'); return; }
    mark();
    status('Cargando ' + S.id + ' desde el Protein Data Bank…');
    const ids = S.compare ? ['1K6F', '1CAG'] : [S.id];
    $('#viewer3dB').classList.toggle('hidden', !S.compare);
    try {
      const texts = await Promise.all(ids.map(fetchPDB));
      views.forEach(v => v.spin(false));
      views = ids.map((id, k) => getViewer(k ? 'viewer3dB' : 'viewer3d'));
      const stats = texts.map((t, k) => render(views[k], t));
      status('');
      const st = stats[S.compare ? 1 : 0];
      $('#vStats').innerHTML = [['Cadenas', st.chains], ['Residuos', st.res], ['Gly', st.gly], ['Hyp', st.hyp], ['Puentes H detectados', st.hb], ['Sustituciones (Ala)', st.ala]]
        .map(([k, v]) => `<div><b>${v}</b><span>${k}</span></div>`).join('');
      $('#viewerCaption').innerHTML = S.compare
        ? `<span>◀ 1K6F · normal: ${stats[0].hb} puentes H</span><span>1CAG · Gly→Ala: ${stats[1].hb} puentes H ▶</span>`
        : `<span>PDB ${S.id}</span><span>${st.hb} puentes H N···O entre cadenas (&lt; 3,5 Å)</span>` +
          (st.total > 3 ? `<span>Mostrando 1 triple hélice (cadenas 1–3 de ${st.total})</span>` : '');
    } catch (e) {
      status('⚠️ ' + e.message + '<br><small>Verifica el ID o tu conexión.</small>');
    }
  }

  document.querySelectorAll('.pdb-item').forEach(b => b.onclick = () => { S.id = b.dataset.id; $('#tgCompare').checked = S.compare = false; load(); });
  $('#pdbLoad').onclick = () => { const v = $('#pdbInput').value.trim().toUpperCase(); if (/^[0-9][A-Z0-9]{3}$/.test(v)) { S.id = v; S.compare = $('#tgCompare').checked = false; load(); } };
  $('#pdbInput').addEventListener('keydown', e => e.key === 'Enter' && $('#pdbLoad').click());
  const seg = (id, key) => document.querySelectorAll(`#${id} button`).forEach(b => b.onclick = () => {
    document.querySelectorAll(`#${id} button`).forEach(x => x.classList.toggle('on', x === b));
    S[key] = b.dataset[key]; load();
  });
  seg('styleSeg', 'style'); seg('colorSeg', 'color');
  $('#tgHbond').onchange = e => { S.hbond = e.target.checked; load(); };
  $('#tgGly').onchange = e => { S.glyOnly = e.target.checked; load(); };
  $('#tgSpin').onchange = e => { S.spin = e.target.checked; views.forEach(v => v.spin(S.spin ? 'x' : false, .5)); };
  $('#tgCompare').onchange = e => { S.compare = e.target.checked; load(); };
  addEventListener('resize', () => views.forEach(v => { v.resize(); v.render(); }));

  // lazy-load when the section approaches the viewport
  const start = () => { if (typeof $3Dmol === 'undefined') return setTimeout(start, 200); load(); };
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '400px' });
  io.observe(document.getElementById('visor'));
})();
