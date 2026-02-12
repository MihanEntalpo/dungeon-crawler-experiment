"use strict";

/**
 * Drawer для рисования многогранников сверху с простым освещением.
 */
class PolyHedronDrawer extends Drawer {
  /**
   * Допустимые типы многогранников.
   * @type {string[]}
   */
  static allowedNames = [
    "sphere",
    "tetrahedron",
    "octahedron",
    "cube",
    "icosahedron",
    "dodecahedron",
    "cuboctahedron",
    "truncated_hexahedron",
    "truncated_octahedron",
    "small_rhombicuboctahedron",
    "great_rhombicuboctahedron",
    "snub_hexahedron",
    "icosidodecahedron",
    "truncated_icosahedron",
    "great_rhombicosidodecahedron",
    "snub_dodecahedron",
    "small_stellated_dodecahedron",
    "great_stellated_dodecahedron",
  ];

  /**
   * @param {object} opts
   * @param {string} opts.name - Имя многогранника (sphere, cube, ...).
   * @param {string} [opts.color]
   * @param {number} [opts.rotation]
   * @param {{x:number,y:number,z:number}} [opts.euler]
   */
  constructor(opts = {}) {
    super({ ...opts, type: opts.type || "polyhedron" });
    const name = opts.name || "sphere";
    if (PolyHedronDrawer.allowedNames.includes(name)) {
      this.name = name;
    } else {
      console.warn(`PolyHedronDrawer: unknown name "${name}", fallback to "sphere"`);
      this.name = "sphere";
    }
    this.color = opts.color || "#9fb6ff";
    this.rotation = opts.rotation || 0;
    this.euler = opts.euler || { x: 0, y: 0, z: 0 };
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {any} ent
   * @param {number} camX
   * @param {number} camY
   * @param {number} dpr
   */
  render(ctx, ent, camX, camY, dpr) {
    const cx = (ent.x - camX) * dpr;
    const cy = (ent.y - camY) * dpr;
    const renderSize = (typeof ent.renderSize === "number" && ent.renderSize > 0)
      ? ent.renderSize
      : TILE;
    const baseR = (renderSize * 0.42) * dpr;
    const rot = this.rotation + (ent.rotation || 0);
    const euler = {
      x: this.euler.x + (ent.euler?.x || 0),
      y: this.euler.y + (ent.euler?.y || 0),
      z: this.euler.z + rot + (ent.euler?.z || 0),
    };

    if (this.name === "sphere") {
      this.renderSphere(ctx, cx, cy, baseR * 0.8, dpr);
      return;
    }

    const mesh = PolyHedronDrawer.getMesh(this.name);
    this.renderMesh(ctx, cx, cy, baseR, euler, mesh);
  }

  renderSphere(ctx, cx, cy, r, dpr) {
    const light = PolyHedronDrawer.tint(this.color, 1.35);
    const dark = PolyHedronDrawer.tint(this.color, 0.7);

    const grad = ctx.createRadialGradient(
      cx - r * 0.35, cy - r * 0.35, r * 0.2,
      cx, cy, r
    );
    grad.addColorStop(0, light);
    grad.addColorStop(1, dark);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2 * dpr;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.22, 0, TAU);
    ctx.fill();
  }

  renderMesh(ctx, cx, cy, baseR, euler, mesh) {
    const lightDir = PolyHedronDrawer.norm({ x: -1, y: -1, z: 1 });
    const viewDir = { x: 0, y: 0, z: 1 };
    const verts = mesh.verts.map((v) => PolyHedronDrawer.rotateEuler(v, euler));

    const scale = baseR / PolyHedronDrawer.getStableScaleRadius(mesh);
    const scaled = verts.map((v) => ({ x: v.x * scale, y: v.y * scale, z: v.z * scale }));

    const faces = mesh.faces.map((f) => {
      const vs = f.map((i) => scaled[i]);
      let n = PolyHedronDrawer.faceNormal(vs[0], vs[1], vs[2]);
      if (!mesh.skipAutoNormalFlip) {
        const c = PolyHedronDrawer.faceCentroid(vs);
        if (PolyHedronDrawer.dot(n, c) < 0) {
          n = { x: -n.x, y: -n.y, z: -n.z };
          f = [...f].reverse();
        }
      }
      let dz = 0;
      for (const v of vs) dz += v.z;
      dz /= (vs.length || 1);
      return { idx: f, verts: vs, normal: n, depth: dz };
    });

    faces.sort((a, b) => a.depth - b.depth);

    for (const f of faces) {
      if (mesh.cullBackfaces && PolyHedronDrawer.dot(f.normal, viewDir) <= 0) continue;
      const shade = Math.max(0, PolyHedronDrawer.dot(f.normal, lightDir));
      const c = PolyHedronDrawer.tint(this.color, 0.35 + shade * 0.75);
      ctx.fillStyle = c;
      ctx.beginPath();
      for (let i = 0; i < f.idx.length; i++) {
        const v = scaled[f.idx[i]];
        const x = cx + v.x;
        const y = cy + v.y;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (mesh.placeholder) {
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - baseR * 0.7, cy - baseR * 0.7);
      ctx.lineTo(cx + baseR * 0.7, cy + baseR * 0.7);
      ctx.moveTo(cx + baseR * 0.7, cy - baseR * 0.7);
      ctx.lineTo(cx - baseR * 0.7, cy + baseR * 0.7);
      ctx.stroke();
    }
  }

  static rotateEuler(v, e) {
    let x = v.x, y = v.y, z = v.z;
    const cx = Math.cos(e.x), sx = Math.sin(e.x);
    const cy = Math.cos(e.y), sy = Math.sin(e.y);
    const cz = Math.cos(e.z), sz = Math.sin(e.z);

    // X
    let y1 = y * cx - z * sx;
    let z1 = y * sx + z * cx;
    let x1 = x;
    // Y
    let z2 = z1 * cy - x1 * sy;
    let x2 = z1 * sy + x1 * cy;
    let y2 = y1;
    // Z
    let x3 = x2 * cz - y2 * sz;
    let y3 = x2 * sz + y2 * cz;

    return { x: x3, y: y3, z: z2 };
  }

  static faceNormal(a, b, c) {
    const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };
    return PolyHedronDrawer.norm({
      x: ab.y * ac.z - ab.z * ac.y,
      y: ab.z * ac.x - ab.x * ac.z,
      z: ab.x * ac.y - ab.y * ac.x,
    });
  }

  static faceCentroid(vs) {
    let x = 0, y = 0, z = 0;
    for (const v of vs) { x += v.x; y += v.y; z += v.z; }
    const d = vs.length || 1;
    return { x: x / d, y: y / d, z: z / d };
  }

  static norm(v) {
    const d = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / d, y: v.y / d, z: v.z / d };
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static getStableScaleRadius(mesh) {
    if (typeof mesh.__stableScaleRadius === "number" && mesh.__stableScaleRadius > 0) {
      return mesh.__stableScaleRadius;
    }
    const radius = PolyHedronDrawer.maxRadiusXYZ(mesh.verts || []);
    mesh.__stableScaleRadius = radius;
    return radius;
  }

  static maxRadiusXYZ(verts) {
    let m = 1e-6;
    for (const v of verts) {
      const d = Math.hypot(v.x, v.y, v.z);
      if (d > m) m = d;
    }
    return m;
  }

  static getMesh(name) {
    if (typeof POLY_MESHES !== "undefined" && POLY_MESHES[name]) return POLY_MESHES[name];
    console.warn(`PolyHedronDrawer: missing mesh for "${name}", fallback to cube`);
    return (typeof POLY_MESHES !== "undefined" && POLY_MESHES.cube)
      ? POLY_MESHES.cube
      : { verts: [], faces: [], placeholder: true };
  }

  static tint(hex, factor) {
    const rgb = PolyHedronDrawer.parseColor(hex);
    const r = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
    const g = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
    const b = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));
    return `rgb(${r},${g},${b})`;
  }

  static parseColor(c) {
    if (!c) return { r: 160, g: 160, b: 160 };
    if (c.startsWith("#")) {
      const h = c.replace("#", "");
      const num = parseInt(h.length === 3
        ? h.split("").map((x) => x + x).join("")
        : h, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }
    const mRgb = c.match(/rgba?\(([^)]+)\)/i);
    if (mRgb) {
      const parts = mRgb[1].split(/\s*,\s*/).map((v) => parseFloat(v));
      return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0 };
    }
    const mHsl = c.match(/hsla?\(([^)]+)\)/i);
    if (mHsl) {
      const parts = mHsl[1].split(/\s*,\s*/);
      const h = parseFloat(parts[0]) || 0;
      const s = parseFloat(parts[1]) / 100 || 0;
      const l = parseFloat(parts[2]) / 100 || 0;
      return PolyHedronDrawer.hslToRgb(h, s, l);
    }
    return { r: 160, g: 160, b: 160 };
  }

  static hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = (h % 360) / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r1 = 0, g1 = 0, b1 = 0;
    if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
    else if (hp < 2) [r1, g1, b1] = [x, c, 0];
    else if (hp < 3) [r1, g1, b1] = [0, c, x];
    else if (hp < 4) [r1, g1, b1] = [0, x, c];
    else if (hp < 5) [r1, g1, b1] = [x, 0, c];
    else [r1, g1, b1] = [c, 0, x];
    const m = l - c / 2;
    return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
  }
}
