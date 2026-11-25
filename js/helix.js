/* Pseudo-3D triple helix drawn on canvas (no libraries).
   state: disorder 0..1 (denaturation), crosslink 0..1, mutAt (residue index or -1) */
class HelixRenderer {
  constructor(canvas, opt = {}) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.o = Object.assign({ n: 66, radius: 0.13, tilt: -0.32, size: 1, glow: true, colorByResidue: false, speed: 1, step: .36, bead: .24 }, opt);
    this.state = { disorder: 0, crosslink: 0, mutAt: -1 };
    this.cur = { disorder: 0, crosslink: 0 };
    this.mouse = { x: 0, y: 0 };
    this.noise = Array.from({ length: 3 * this.o.n }, () => [Math.random() * 6.28, Math.random() * 6.28, .6 + Math.random() * .8]);
    this.resize();
    addEventListener('resize', () => this.resize());
    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) / r.width - .5; this.mouse.y = (e.clientY - r.top) / r.height - .5;
    });
    this.visible = true;
    new IntersectionObserver(es => { this.visible = es[0].isIntersecting; }).observe(canvas);
    const loop = t => { if (this.visible) this.draw(t / 1000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  resize() {
    const d = Math.min(devicePixelRatio || 1, 2), r = this.c.getBoundingClientRect();
    this.W = r.width; this.H = r.height;
    this.c.width = r.width * d; this.c.height = r.height * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  draw(t) {
    const { ctx, W, H, o } = this;
    if (!W) return;
    // ease state
    this.cur.disorder += (this.state.disorder - this.cur.disorder) * .06;
    this.cur.crosslink += (this.state.crosslink - this.cur.crosslink) * .08;
    const dis = this.cur.disorder;
    ctx.clearRect(0, 0, W, H);
    const L = Math.min(W * .86, H * 2.2) * o.size, R = Math.min(W, H) * o.radius * o.size;
    const cx = W / 2, cy = H / 2;
    const tilt = o.tilt + this.mouse.y * .25, spin = t * .5 * o.speed + this.mouse.x * 1.2;
    const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
    const cols = [['#93c5fd', '#2563eb'], ['#c4b5fd', '#7c3aed'], ['#f9a8d4', '#db2777']];
    const pts = [];
    for (let c = 0; c < 3; c++) {
      for (let i = 0; i < o.n; i++) {
        const u = i / (o.n - 1) - .5;
        const nz = this.noise[c * o.n + i];
        const ang = i * o.step + c * 2.094 + spin;
        const rr = R * (1 + dis * 1.6 * nz[2]);
        let x = u * L, y = rr * Math.cos(ang), z = rr * Math.sin(ang);
        if (dis > .01) {
          y += Math.sin(t * 1.3 + nz[0] + i * .3) * R * 1.4 * dis;
          z += Math.cos(t * 1.1 + nz[1] + i * .2) * R * 1.4 * dis;
          x += Math.sin(t + nz[1]) * R * .4 * dis;
        }
        // tilt around z (2D rotation in x-y plane)
        const X = x * cosT - y * sinT, Y = x * sinT + y * cosT;
        const persp = 1 / (1 - z / (R * 9));
        const res = i % 3; // 0 Gly, 1 X(Pro), 2 Y(Hyp)
        pts.push({ c, i, res, x: cx + X * persp, y: cy + Y * persp, z, p: persp });
      }
    }
    // backbone tubes (draw per chain, under spheres)
    for (let c = 0; c < 3; c++) {
      const cp = pts.filter(p => p.c === c);
      ctx.beginPath();
      cp.forEach((p, k) => k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.strokeStyle = cols[c][1] + '88'; ctx.lineWidth = R * .3; ctx.lineCap = 'round'; ctx.stroke();
    }
    // crosslinks / H-bonds between chains
    const xl = this.cur.crosslink;
    if (xl > .02) {
      ctx.setLineDash([3, 4]);
      for (let i = 2; i < o.n; i += 3) {
        if (((i * 7) % 10) / 10 > xl) continue;
        const a = pts[i], b = pts[o.n + i];
        ctx.strokeStyle = `rgba(34,211,238,${.25 + .5 * (1 - dis)})`; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    pts.sort((a, b) => a.z - b.z);
    const base = R * o.bead;
    for (const p of pts) {
      let r = base * p.p * (p.res === 0 ? .78 : 1);
      let c1 = cols[p.c][0], c2 = cols[p.c][1];
      if (o.colorByResidue) {
        if (p.res === 0) { c1 = '#fff7cc'; c2 = '#d4a017'; }
        else if (p.res === 1) { c1 = '#bfdbfe'; c2 = '#2563eb'; }
        else { c1 = '#fbcfe8'; c2 = '#be185d'; }
      }
      if (this.state.mutAt >= 0 && p.i === this.state.mutAt && p.c === 0) { c1 = '#fecaca'; c2 = '#dc2626'; r *= 1.7; }
      const g = ctx.createRadialGradient(p.x - r * .35, p.y - r * .35, r * .1, p.x, p.y, r);
      g.addColorStop(0, '#ffffff'); g.addColorStop(.25, c1); g.addColorStop(1, c2);
      if (o.glow) { ctx.shadowColor = c2; ctx.shadowBlur = 10 * p.p; }
      ctx.fillStyle = g; ctx.globalAlpha = .55 + .45 * Math.min(1, (p.z / R + 1.2) / 2);
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
}
