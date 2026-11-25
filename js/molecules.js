/* Renders skeletal formulas as SVG from atom/bond lists.
   atoms: [x, y, label?, color?]   (y grows downward, bond length ≈ 1)
   bonds: [a, b, order(1|2), style?] style: 'hl' (highlight), 'wedge', 'dash', 'leave' */
const ELEMENT_COLOR = { O: '#f87171', N: '#60a5fa', H: '#cbd5e1', R: '#34d399', S: '#fde047' };

function molSVG(def, opt = {}) {
  const s = opt.scale || 40, pad = opt.pad || 26;
  const stroke = opt.stroke || '#d6d8ff', hl = opt.hl || '#f472b6';
  const all = [...def.atoms, ...(def.notes || [])]; const xs = all.map(a => a[0]), ys = all.map(a => a[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const W = (Math.max(...xs) - minX) * s + pad * 2, H = (Math.max(...ys) - minY) * s + pad * 2;
  const P = a => [(a[0] - minX) * s + pad, (a[1] - minY) * s + pad];
  let out = '';

  (def.boxes || []).forEach(b => {          // translucent highlight boxes: [atomIdx..], color
    const pts = b.atoms.map(i => P(def.atoms[i]));
    const x0 = Math.min(...pts.map(p => p[0])) - 16, x1 = Math.max(...pts.map(p => p[0])) + 16;
    const y0 = Math.min(...pts.map(p => p[1])) - 14, y1 = Math.max(...pts.map(p => p[1])) + 14;
    out += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="10" fill="${b.color}" fill-opacity=".14" stroke="${b.color}" stroke-opacity=".45" stroke-dasharray="4 3"/>`;
  });

  def.bonds.forEach(([a, b, order = 1, style]) => {
    let [x1, y1] = P(def.atoms[a]), [x2, y2] = P(def.atoms[b]);
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const la = def.atoms[a][2], lb = def.atoms[b][2];
    const sa = la ? 9 + Math.max(0, la.length - 2) * 2 : 0, sb = lb ? 9 + Math.max(0, lb.length - 2) * 2 : 0;
    x1 += ux * sa; y1 += uy * sa; x2 -= ux * sb; y2 -= uy * sb;
    const col = style === 'hl' ? hl : style === 'leave' ? '#fbbf24' : stroke;
    const w = style === 'hl' ? 3.4 : 2;
    const nx = -uy, ny = ux;
    if (style === 'wedge') {
      out += `<polygon points="${x1},${y1} ${x2 + nx * 4},${y2 + ny * 4} ${x2 - nx * 4},${y2 - ny * 4}" fill="${col}"/>`;
    } else if (style === 'dash') {
      out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-dasharray="3 3"/>`;
    } else if (order === 2) {
      const o = 2.6;
      out += `<line x1="${x1 + nx * o}" y1="${y1 + ny * o}" x2="${x2 + nx * o}" y2="${y2 + ny * o}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
      out += `<line x1="${x1 - nx * o}" y1="${y1 - ny * o}" x2="${x2 - nx * o}" y2="${y2 - ny * o}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    } else {
      out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    }
  });

  def.atoms.forEach(a => {
    if (!a[2]) return;
    const [x, y] = P(a);
    const lab = a[2];
    const col = a[3] || ELEMENT_COLOR[lab.replace(/[^A-Z]/g, '').replace(/^H(?=[NO])/, '')[0]] || '#e9eaff';
    out += `<text x="${x}" y="${y}" fill="${col}" font-family="Outfit,Inter,sans-serif" font-weight="600" font-size="${opt.font || 17}" text-anchor="middle" dominant-baseline="central">${lab}</text>`;
  });
  (def.notes || []).forEach(n => {
    const [x, y] = P([n[0], n[1]]);
    out += `<text x="${x}" y="${y}" fill="${n[3] || '#9aa0cc'}" font-family="Inter,sans-serif" font-size="${n[4] || 12}" text-anchor="middle">${n[2]}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
}

/* ---------- molecule library ---------- */
const MOL = {};
const carboxyl = (i) => [[i, i + 1, 1], [i + 1, i + 2, 2], [i + 1, i + 3, 1]];

MOL.GLY = { atoms: [[0, 0, 'H₂N'], [.866, -.5], [1.732, 0], [1.732, 1, 'O'], [2.598, -.5, 'OH']],
  bonds: [[0, 1], [1, 2], [2, 3, 2], [2, 4]] };
MOL.ALA = { atoms: [...MOL.GLY.atoms, [.866, -1.5, 'CH₃', '#e9eaff']], bonds: [...MOL.GLY.bonds, [1, 5]] };
MOL.GEN = { atoms: [...MOL.GLY.atoms, [.866, -1.5, 'R', '#34d399']], bonds: [...MOL.GLY.bonds, [1, 5]] };

const ring = [[0, 0, 'N'], [1, 0], [1.309, .951], [.5, 1.539], [-.309, .951]];
MOL.PRO = { atoms: [...ring, [1.5, -.866], [1, -1.732, 'O'], [2.5, -.866, 'OH'], [-.75, -.6, 'H']],
  bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 5], [5, 6, 2], [5, 7], [0, 8]] };
MOL.HYP = { atoms: [...MOL.PRO.atoms, [.5, 2.55, 'OH']], bonds: [...MOL.PRO.bonds, [3, 9, 1, 'wedge']] };

// amino acid general, colour coded
MOL.AA = { atoms: [[0, 0, 'Cα', '#fde68a'], [-1.2, 0, 'H₂N', '#60a5fa'], [1.1, 0], [1.65, -.85, 'O', '#f87171'], [1.65, .85, 'OH', '#f87171'], [0, -1.15, 'R', '#34d399'], [0, 1.15, 'H', '#cbd5e1']],
  bonds: [[0, 1], [0, 2], [2, 3, 2], [2, 4], [0, 5], [0, 6]],
  boxes: [{ atoms: [1], color: '#60a5fa' }, { atoms: [2, 3, 4], color: '#f87171' }, { atoms: [5], color: '#34d399' }] };

// peptide bond formation
MOL.AA1 = { atoms: [[0, 0, 'H₂N'], [.866, -.5], [.866, -1.5, 'R₁', '#34d399'], [1.732, 0], [1.732, 1, 'O'], [2.598, -.5, 'OH', '#fbbf24']],
  bonds: [[0, 1], [1, 2], [1, 3], [3, 4, 2], [3, 5, 1, 'leave']] };
MOL.AA2 = { atoms: [[-1, 0, 'H', '#fbbf24'], [0, 0, 'N'], [0, 1, 'H'], [.866, -.5], [.866, -1.5, 'R₂', '#34d399'], [1.732, 0], [1.732, 1, 'O'], [2.598, -.5, 'OH']],
  bonds: [[0, 1, 1, 'leave'], [1, 2], [1, 3], [3, 4], [3, 5], [5, 6, 2], [5, 7]] };
MOL.DIPEP = { atoms: [[0, 0, 'H₂N'], [.866, -.5], [.866, -1.5, 'R₁', '#34d399'], [1.732, 0], [1.732, 1, 'O'], [2.598, -.5, 'N'], [2.598, -1.5, 'H'], [3.464, 0], [3.464, 1, 'R₂', '#34d399'], [4.33, -.5], [4.33, -1.5, 'O'], [5.196, 0, 'OH']],
  bonds: [[0, 1], [1, 2], [1, 3], [3, 4, 2], [3, 5, 1, 'hl'], [5, 6], [5, 7], [7, 8], [7, 9], [9, 10, 2], [9, 11]],
  boxes: [{ atoms: [3, 4, 5, 6], color: '#f472b6' }] };
MOL.RES_A = { atoms: [[-.866, .5, 'Cα', '#fde68a'], [0, 0], [0, -1, 'O'], [.866, .5, 'N'], [.866, 1.5, 'H'], [1.732, 0, 'Cα', '#fde68a']],
  bonds: [[0, 1], [1, 2, 2], [1, 3], [3, 4], [3, 5]] };
MOL.RES_B = { atoms: [[-.866, .5, 'Cα', '#fde68a'], [0, 0], [0, -1, 'O⁻'], [.866, .5, 'N⁺'], [.866, 1.5, 'H'], [1.732, 0, 'Cα', '#fde68a']],
  bonds: [[0, 1], [1, 2], [1, 3, 2, 'hl'], [3, 4], [3, 5]] };

// hydroxylation (residues inside the chain)
const resRing = [[0, 0, 'N'], [1, 0], [1.309, .951], [.5, 1.539], [-.309, .951]];
MOL.PRO_RES = { atoms: [...resRing, [1.5, -.866], [1, -1.732, 'O'], [2.4, -.866, '···', '#9aa0cc'], [-.8, -.55, '···', '#9aa0cc']],
  bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 5], [5, 6, 2], [5, 7], [0, 8]],
  notes: [[.5, 2.35, 'C4 (Cγ)', '#9aa0cc', 11]] };
MOL.HYP_RES = { atoms: [...MOL.PRO_RES.atoms, [.5, 2.55, 'OH', '#f472b6']],
  bonds: [...MOL.PRO_RES.bonds, [3, 9, 1, 'wedge']],
  notes: [[1.35, 2.6, '4R', '#f472b6', 12]] };

/* residue metadata for the sequence explorer */
const RES_INFO = {
  G: { name: 'Glicina', three: 'Gly', mol: 'GLY', cls: 'G' },
  P: { name: 'Prolina', three: 'Pro', mol: 'PRO', cls: 'P' },
  O: { name: '4-Hidroxiprolina', three: 'Hyp', mol: 'HYP', cls: 'O' },
  A: { name: 'Alanina', three: 'Ala', mol: 'ALA', cls: 'X' },
  M: { name: 'Metionina', three: 'Met', mol: 'GEN', cls: 'X', r: '–CH₂CH₂SCH₃ (apolar)' },
  S: { name: 'Serina', three: 'Ser', mol: 'GEN', cls: 'X', r: '–CH₂OH (polar)' },
  R: { name: 'Arginina', three: 'Arg', mol: 'GEN', cls: 'X', r: 'guanidinio, carga + (puentes salinos)' },
  L: { name: 'Leucina', three: 'Leu', mol: 'GEN', cls: 'X', r: 'isobutilo (apolar)' },
  Q: { name: 'Glutamina', three: 'Gln', mol: 'GEN', cls: 'X', r: 'amida (polar)' },
  F: { name: 'Fenilalanina', three: 'Phe', mol: 'GEN', cls: 'X', r: 'bencilo (aromático, apolar)' },
  E: { name: 'Ácido glutámico', three: 'Glu', mol: 'GEN', cls: 'X', r: '–CH₂CH₂COO⁻ (carga −)' },
  K: { name: 'Lisina', three: 'Lys', mol: 'GEN', cls: 'X', r: '–(CH₂)₄NH₃⁺ (sitio de entrecruzamiento)' },
};
