(() => {
  "use strict";

  // ---------- Canvas / Resize ----------
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });

  let W = 1280, H = 720, DPR = 1;
  function resize() {
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    W = Math.floor(innerWidth * DPR);
    H = Math.floor(innerHeight * DPR);
    canvas.width = W;
    canvas.height = H;
  }
  window.addEventListener("resize", resize);
  resize();

  // ---------- Utils ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hypot = Math.hypot;
  const TAU = Math.PI * 2;

  function rndInt(a, b) { return (a + Math.floor(Math.random() * (b - a + 1))); }
  function hash2(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return (h ^ (h >> 16)) >>> 0;
  }
  function angleDiff(a, b) {
    let d = (a - b) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
  }

  // ---------- Procedural dungeon: maze + rooms + loops ----------
  // Base: DFS perfect maze on cell grid -> tile grid.
  // Then: carve rooms + add loops + reduce dead-ends.
  function genDungeon(cw, ch) {
    const visited = Array.from({ length: ch }, () => Array(cw).fill(false));
    const stack = [];
    const start = { x: rndInt(0, cw - 1), y: rndInt(0, ch - 1) };
    visited[start.y][start.x] = true;
    stack.push(start);

    const open = Array.from({ length: ch }, () => Array.from({ length: cw }, () => ({ n:0,e:0,s:0,w:0 })));
    const dirs = [
      { dx: 0, dy: -1, a: "n", b: "s" },
      { dx: 1, dy: 0,  a: "e", b: "w" },
      { dx: 0, dy: 1,  a: "s", b: "n" },
      { dx: -1,dy: 0,  a: "w", b: "e" },
    ];

    while (stack.length) {
      const cur = stack[stack.length - 1];
      const order = dirs.slice().sort(() => Math.random() - 0.5);
      let moved = false;
      for (const d of order) {
        const nx = cur.x + d.dx, ny = cur.y + d.dy;
        if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
        if (visited[ny][nx]) continue;
        visited[ny][nx] = true;
        open[cur.y][cur.x][d.a] = 1;
        open[ny][nx][d.b] = 1;
        stack.push({ x: nx, y: ny });
        moved = true;
        break;
      }
      if (!moved) stack.pop();
    }

    const tw = cw * 2 + 1;
    const th = ch * 2 + 1;
    const WALL = 1, FLOOR = 0;
    const tiles = Array.from({ length: th }, () => Array(tw).fill(WALL));

    // Carve maze floors
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const tx = x * 2 + 1;
        const ty = y * 2 + 1;
        tiles[ty][tx] = FLOOR;
        const o = open[y][x];
        if (o.e) tiles[ty][tx + 1] = FLOOR;
        if (o.s) tiles[ty + 1][tx] = FLOOR;
      }
    }

    // Carve rooms (rectangles in tile-space)
    const roomCount = Math.max(14, Math.floor((cw * ch) / 70));
    for (let i = 0; i < roomCount; i++) {
      const rw = rndInt(2, 5);
      const rh = rndInt(2, 5);
      const rx = rndInt(1, tw - rw - 2);
      const ry = rndInt(1, th - rh - 2);
      for (let y = ry; y < ry + rh; y++) {
        for (let x = rx; x < rx + rw; x++) {
          tiles[y][x] = FLOOR;
        }
      }
    }

    // Add loops by opening some wall-tiles that separate floors
    const loopProb = 0.16;
    for (let y = 1; y < th - 1; y++) {
      for (let x = 1; x < tw - 1; x++) {
        if (tiles[y][x] !== WALL) continue;
        const L = tiles[y][x - 1] === FLOOR;
        const R = tiles[y][x + 1] === FLOOR;
        const U = tiles[y - 1][x] === FLOOR;
        const D = tiles[y + 1][x] === FLOOR;
        const lr = L && R;
        const ud = U && D;
        const around = (L?1:0) + (R?1:0) + (U?1:0) + (D?1:0);
        if ((lr || ud) && Math.random() < loopProb) tiles[y][x] = FLOOR;
        else if (around >= 3 && Math.random() < loopProb * 0.5) tiles[y][x] = FLOOR;
      }
    }

    // Reduce dead-ends ("braiding")
    const ddPasses = 2;
    for (let pass = 0; pass < ddPasses; pass++) {
      for (let y = 2; y < th - 2; y++) {
        for (let x = 2; x < tw - 2; x++) {
          if (tiles[y][x] !== FLOOR) continue;
          const N = tiles[y - 1][x] === FLOOR;
          const S = tiles[y + 1][x] === FLOOR;
          const W = tiles[y][x - 1] === FLOOR;
          const E = tiles[y][x + 1] === FLOOR;
          const cnt = (N?1:0) + (S?1:0) + (W?1:0) + (E?1:0);
          if (cnt !== 1) continue;
          if (Math.random() > 0.45) continue;

          const cand = [];
          // Open a nearby wall if it connects to existing floor behind it
          if (tiles[y - 1][x] === WALL && tiles[y - 2][x] === FLOOR) cand.push({ dx:0, dy:-1 });
          if (tiles[y + 1][x] === WALL && tiles[y + 2][x] === FLOOR) cand.push({ dx:0, dy: 1 });
          if (tiles[y][x - 1] === WALL && tiles[y][x - 2] === FLOOR) cand.push({ dx:-1,dy: 0 });
          if (tiles[y][x + 1] === WALL && tiles[y][x + 2] === FLOOR) cand.push({ dx: 1,dy: 0 });

          if (cand.length) {
            const c = cand[rndInt(0, cand.length - 1)];
            tiles[y + c.dy][x + c.dx] = FLOOR;
          }
        }
      }
    }

    // Keep borders walls
    for (let x = 0; x < tw; x++) { tiles[0][x] = WALL; tiles[th - 1][x] = WALL; }
    for (let y = 0; y < th; y++) { tiles[y][0] = WALL; tiles[y][tw - 1] = WALL; }

    return { tiles, tw, th, WALL, FLOOR };
  }

  // ---------- World ----------
  const TILE = 32;
  const CELLS_W = 56;
  const CELLS_H = 46;
  const dungeon = genDungeon(CELLS_W, CELLS_H);

  const MAP_W = dungeon.tw;
  const MAP_H = dungeon.th;
  const WALL = dungeon.WALL;
  const FLOOR = dungeon.FLOOR;
  const tiles = dungeon.tiles;

  function inBounds(tx, ty) { return (tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H); }
  function isWall(tx, ty) { if (!inBounds(tx, ty)) return true; return tiles[ty][tx] === WALL; }
  function isFloor(tx, ty) { if (!inBounds(tx, ty)) return false; return tiles[ty][tx] === FLOOR; }
  function worldToTile(x, y) { return { tx: Math.floor(x / TILE), ty: Math.floor(y / TILE) }; }
  function idx(tx, ty) { return ty * MAP_W + tx; }

  function findNearestFloorTile(tx0, ty0) {
    let best = null;
    let bestD = 1e18;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (!isFloor(x, y)) continue;
        const dx = x - tx0, dy = y - ty0;
        const d = dx*dx + dy*dy;
        if (d < bestD) { bestD = d; best = { tx: x, ty: y }; }
      }
    }
    return best;
  }

  const startTile = findNearestFloorTile(Math.floor(MAP_W / 2), Math.floor(MAP_H / 2));
  const exitTile  = findNearestFloorTile(MAP_W - 2, MAP_H - 2);

  // ---------- Fog-of-war state (tile-based, permanent reveal) ----------
  const explored = new Uint8Array(MAP_W * MAP_H);
  const visible  = new Uint8Array(MAP_W * MAP_H);

  // ---------- Entities ----------
  const player = {
    x: (startTile.tx + 0.5) * TILE,
    y: (startTile.ty + 0.5) * TILE,
    vx: 0,
    vy: 0,
    r: 12,
    facing: 0,
    hp: 120,
    hpMax: 120,
    atkCooldown: 0,
    atkWindow: 0,
    atkDidHit: false,
  };

  const MOB_TYPES = [
    { name: "green",  color: "#6CFF9C", hp: 120, dmg: 10,  speed: 34, aggro: 210 },
    { name: "yellow", color: "#FFD36A", hp: 240, dmg: 20, speed: 40, aggro: 270 },
    { name: "red",    color: "#FF5566", hp: 480, dmg: 25, speed: 46, aggro: 400 },
  ];
  function pickMobType() {
    const r = Math.random();
    if (r < 0.55) return MOB_TYPES[0];
    if (r < 0.85) return MOB_TYPES[1];
    return MOB_TYPES[2];
  }

  function makeMob(x, y, t) {
    return {
      x, y,
      vx: 0, vy: 0,
      r: 11,
      type: t,
      hp: t.hp,
      hpMax: t.hp,
      dmg: t.dmg,
      speed: t.speed,
      aggro: t.aggro,
      attackRange: 22,
      attackCooldown: 0,
      wanderT: Math.random() * 2,
      wanderA: Math.random() * TAU,
      state: "wander",
    };
  }

  const mobs = [];
  function randomFloorPosFarFromPlayer(minDist) {
    for (let tries = 0; tries < 6000; tries++) {
      const tx = rndInt(0, MAP_W - 1);
      const ty = rndInt(0, MAP_H - 1);
      if (!isFloor(tx, ty)) continue;
      const x = (tx + 0.5) * TILE;
      const y = (ty + 0.5) * TILE;
      if (hypot(x - player.x, y - player.y) < minDist) continue;
      return { x, y };
    }
    return { x: player.x + minDist, y: player.y };
  }

  const MOB_COUNT = 100;
  for (let i = 0; i < MOB_COUNT; i++) {
    const p = randomFloorPosFarFromPlayer(380);
    mobs.push(makeMob(p.x, p.y, pickMobType()));
  }

  // ---------- Input ----------
  const keys = new Set();
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    keys.add(e.key);
  }, { passive: false });
  window.addEventListener("keyup", (e) => keys.delete(e.key));

  let mouseX = 0, mouseY = 0;
  let mouseDown = false;

  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouseX = (e.clientX - r.left) * DPR;
    mouseY = (e.clientY - r.top) * DPR;
  });
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) mouseDown = true;
    canvas.focus?.();
  });
  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) mouseDown = false;
  });

  // ---------- Physics / Collision ----------
  function circleAABBResolve(cx, cy, cr, ax, ay, aw, ah) {
    const nx = clamp(cx, ax, ax + aw);
    const ny = clamp(cy, ay, ay + ah);
    const dx = cx - nx;
    const dy = cy - ny;
    const d2 = dx*dx + dy*dy;
    if (d2 >= cr*cr || d2 === 0) return null;
    const d = Math.sqrt(d2);
    const push = (cr - d);
    return { mx: (dx / d) * push, my: (dy / d) * push };
  }

  function resolveEntityVsWalls(ent) {
    const r = ent.r;
    const minTx = Math.floor((ent.x - r) / TILE) - 1;
    const maxTx = Math.floor((ent.x + r) / TILE) + 1;
    const minTy = Math.floor((ent.y - r) / TILE) - 1;
    const maxTy = Math.floor((ent.y + r) / TILE) + 1;

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (!isWall(tx, ty)) continue;
        const ax = tx * TILE;
        const ay = ty * TILE;
        const res = circleAABBResolve(ent.x, ent.y, r, ax, ay, TILE, TILE);
        if (res) {
          ent.x += res.mx;
          ent.y += res.my;
          const dot = ent.vx * res.mx + ent.vy * res.my;
          if (dot > 0) { ent.vx *= 0.6; ent.vy *= 0.6; }
        }
      }
    }
  }

  function resolveCircleVsCircle(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    const d = Math.sqrt(dx*dx + dy*dy);
    const minD = a.r + b.r;
    if (d === 0 || d >= minD) return;
    const push = (minD - d);
    const nx = dx / d, ny = dy / d;
    a.x += nx * push * 0.65;
    a.y += ny * push * 0.65;
    b.x -= nx * push * 0.35;
    b.y -= ny * push * 0.35;
  }

  // ---------- Tile-based visibility (ray casting) ----------
  const VIS_DIST = 360;
  const VIS_RAYS = 420;
  const VIS_STEP = TILE / 6;

  function computeVisibility() {
    visible.fill(0);

    // Always see current tile
    const pt = worldToTile(player.x, player.y);
    if (inBounds(pt.tx, pt.ty)) {
      const id0 = idx(pt.tx, pt.ty);
      visible[id0] = 1;
      explored[id0] = 1;
    }

    for (let i = 0; i < VIS_RAYS; i++) {
      const ang = (i / VIS_RAYS) * TAU;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      let x = player.x;
      let y = player.y;

      for (let d = 0; d < VIS_DIST; d += VIS_STEP) {
        x += c * VIS_STEP;
        y += s * VIS_STEP;
        const { tx, ty } = worldToTile(x, y);
        if (!inBounds(tx, ty)) break;
        const id = idx(tx, ty);
        visible[id] = 1;
        explored[id] = 1;
        if (isWall(tx, ty)) break;
      }
    }
  }

  // ---------- Rendering ----------
  function drawWorld(camX, camY) {
    const pad = 3;
    const screenW = W / DPR;
    const screenH = H / DPR;

    const minTx = Math.floor(camX / TILE) - pad;
    const minTy = Math.floor(camY / TILE) - pad;
    const maxTx = Math.floor((camX + screenW) / TILE) + pad;
    const maxTy = Math.floor((camY + screenH) / TILE) + pad;

    ctx.fillStyle = "#0b0e12";
    ctx.fillRect(0, 0, W, H);

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (!inBounds(tx, ty)) continue;
        const wx = tx * TILE;
        const wy = ty * TILE;
        const sx = (wx - camX) * DPR;
        const sy = (wy - camY) * DPR;
        const s = TILE * DPR;

        if (tiles[ty][tx] === FLOOR) {
          const h = hash2(tx, ty);
          const v = 0.10 + ((h & 255) / 255) * 0.08;
          ctx.fillStyle = `rgb(${Math.floor(20 + v*70)},${Math.floor(23 + v*70)},${Math.floor(28 + v*75)})`;
          ctx.fillRect(sx, sy, s, s);
        } else {
          ctx.fillStyle = "#252c36";
          ctx.fillRect(sx, sy, s, s);
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.fillRect(sx, sy, s, 2*DPR);
          ctx.fillRect(sx, sy, 2*DPR, s);
          ctx.fillStyle = "rgba(0,0,0,0.20)";
          ctx.fillRect(sx, sy + s - 2*DPR, s, 2*DPR);
          ctx.fillRect(sx + s - 2*DPR, sy, 2*DPR, s);
        }
      }
    }

    // Exit marker
    const ex = (exitTile.tx + 0.5) * TILE;
    const ey = (exitTile.ty + 0.5) * TILE;
    ctx.save();
    ctx.translate((ex - camX) * DPR, (ey - camY) * DPR);
    ctx.fillStyle = "rgba(124,255,178,0.20)";
    ctx.beginPath();
    ctx.arc(0, 0, 16 * DPR, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(124,255,178,0.85)";
    ctx.lineWidth = 2 * DPR;
    ctx.beginPath();
    ctx.arc(0, 0, 10 * DPR, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(camX, camY) {
    const sx = (player.x - camX) * DPR;
    const sy = (player.y - camY) * DPR;

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 10*DPR, 14*DPR, 8*DPR, 0, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(player.facing);
    ctx.fillStyle = "#d7e2ff";
    ctx.beginPath();
    ctx.arc(0, 0, player.r * DPR, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#8fb0ff";
    ctx.beginPath();
    ctx.moveTo(0, -2*DPR);
    ctx.lineTo((player.r + 9) * DPR, 0);
    ctx.lineTo(0, 2*DPR);
    ctx.closePath();
    ctx.fill();

    if (player.atkWindow > 0) {
      ctx.strokeStyle = "rgba(255,235,180,0.9)";
      ctx.lineWidth = 3 * DPR;
      ctx.beginPath();
      const R = (player.r + 18) * DPR;
      ctx.arc(0, 0, R, -0.55, 0.55);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMob(m, camX, camY) {
    const sx = (m.x - camX) * DPR;
    const sy = (m.y - camY) * DPR;

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 9*DPR, 13*DPR, 7*DPR, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = m.type.color;
    ctx.beginPath();
    ctx.arc(sx, sy, m.r * DPR, 0, TAU);
    ctx.fill();

    // Health bar
    const barW = 36 * DPR;
    const barH = 6 * DPR;
    const t = clamp(m.hp / m.hpMax, 0, 1);
    const bx = sx - barW / 2;
    const by = sy - (m.r * DPR) - 14 * DPR;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(bx - 1*DPR, by - 1*DPR, barW + 2*DPR, barH + 2*DPR);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = `rgba(${Math.floor(lerp(255, 80, t))},${Math.floor(lerp(90, 220, t))},${Math.floor(lerp(110, 90, t))},0.95)`;
    ctx.fillRect(bx, by, barW * t, barH);
  }

  function drawHealthCircle() {
    const cx = 64 * DPR;
    const cy = (H - 64 * DPR);
    const R = 42 * DPR;
    const t = clamp(player.hp / player.hpMax, 0, 1);

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.arc(0, 0, R + 6*DPR, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(0, 0, R + 2*DPR, 0, TAU);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.clip();

    ctx.fillStyle = "rgba(10,14,20,0.75)";
    ctx.fillRect(-R, -R, 2*R, 2*R);

    const fillH = 2 * R * t;
    const topY = R - fillH;

    ctx.fillStyle = "rgba(235,70,70,0.88)";
    ctx.fillRect(-R, topY, 2*R, fillH);

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(-R, topY, 2*R, 2*DPR);

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    for (let i = 0; i < 9; i++) {
      const bx = (Math.sin(i*12.7) * 0.5 + 0.5) * (2*R) - R;
      const by = topY + (Math.cos(i*7.3) * 0.5 + 0.5) * fillH;
      const br = (2 + (i % 3)) * DPR;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
    }

    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2 * DPR;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();

    ctx.fillStyle = "rgba(230,235,245,0.9)";
    ctx.font = `${12 * DPR}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.ceil(player.hp)}`, cx, cy);
  }

  // Overlay only not-explored tiles (once explored -> never re-fog)
  function drawFogTiles(camX, camY, fogEnabled) {
    if (!fogEnabled) return;

    const pad = 2;
    const screenW = W / DPR;
    const screenH = H / DPR;

    const minTx = Math.floor(camX / TILE) - pad;
    const minTy = Math.floor(camY / TILE) - pad;
    const maxTx = Math.floor((camX + screenW) / TILE) + pad;
    const maxTy = Math.floor((camY + screenH) / TILE) + pad;

    ctx.fillStyle = "rgba(0,0,0,0.98)";
    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (!inBounds(tx, ty)) continue;
        const id = idx(tx, ty);
        if (explored[id]) continue;
        const sx = (tx * TILE - camX) * DPR;
        const sy = (ty * TILE - camY) * DPR;
        ctx.fillRect(sx, sy, TILE * DPR, TILE * DPR);
      }
    }
  }

  // ---------- Game logic ----------
  let fogEnabled = true;
  const banner = document.getElementById("banner");

  function updatePlayer(dt, camX, camY) {
    // Facing follows mouse
    const mxWorld = camX + (mouseX / DPR);
    const myWorld = camY + (mouseY / DPR);
    player.facing = Math.atan2(myWorld - player.y, mxWorld - player.x);

    // x2 speed
    const accel = 1560;
    const maxSpd = 320;

    let ax = 0, ay = 0;

    // Arrows + WASD + Russian layout (ФЦЫВ)
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A") || keys.has("ф") || keys.has("Ф"))  ax -= 1;
    if (keys.has("ArrowRight")|| keys.has("d") || keys.has("D") || keys.has("в") || keys.has("В"))  ax += 1;
    if (keys.has("ArrowUp")   || keys.has("w") || keys.has("W") || keys.has("ц") || keys.has("Ц"))  ay -= 1;
    if (keys.has("ArrowDown") || keys.has("s") || keys.has("S") || keys.has("ы") || keys.has("Ы"))  ay += 1;

    const len = Math.hypot(ax, ay);
    if (len > 0) { ax /= len; ay /= len; }

    player.vx += ax * accel * dt;
    player.vy += ay * accel * dt;

    const damp = (len > 0) ? 0.88 : 0.78;
    player.vx *= Math.pow(damp, dt * 60);
    player.vy *= Math.pow(damp, dt * 60);

    const spd = Math.hypot(player.vx, player.vy);
    if (spd > maxSpd) {
      player.vx = (player.vx / spd) * maxSpd;
      player.vy = (player.vy / spd) * maxSpd;
    }

    // Attack
    player.atkCooldown = Math.max(0, player.atkCooldown - dt);
    player.atkWindow = Math.max(0, player.atkWindow - dt);
    if (!mouseDown) player.atkDidHit = false;

    if (mouseDown && player.atkCooldown <= 0) {
      player.atkCooldown = 0.30;
      player.atkWindow = 0.12;
      player.atkDidHit = false;
    }

    player.x += player.vx * dt;
    player.y += player.vy * dt;
    resolveEntityVsWalls(player);

    // Exit check
    const ex = (exitTile.tx + 0.5) * TILE;
    const ey = (exitTile.ty + 0.5) * TILE;
    if (fogEnabled && hypot(player.x - ex, player.y - ey) < 22) {
      fogEnabled = false;
      explored.fill(1);
      banner.classList.add("show");
    }
  }

  function updateMobs(dt) {
    for (const m of mobs) {
      if (m.hp <= 0) continue;
      m.attackCooldown = Math.max(0, m.attackCooldown - dt);

      const dx = player.x - m.x;
      const dy = player.y - m.y;
      const dist = Math.hypot(dx, dy);

      let tx = 0, ty = 0;

      if (dist < m.aggro) {
        m.state = "chase";
        if (dist > 1e-6) { tx = dx / dist; ty = dy / dist; }
      } else {
        m.state = "wander";
        m.wanderT -= dt;
        if (m.wanderT <= 0) {
          m.wanderT = 1.3 + Math.random() * 1.7;
          m.wanderA = Math.random() * TAU;
        }
        tx = Math.cos(m.wanderA);
        ty = Math.sin(m.wanderA);
      }

      const spd = (m.state === "chase") ? m.speed : (m.speed * 0.55);
      m.vx = lerp(m.vx, tx * spd, 1 - Math.pow(0.03, dt * 60));
      m.vy = lerp(m.vy, ty * spd, 1 - Math.pow(0.03, dt * 60));

      m.x += m.vx * dt;
      m.y += m.vy * dt;
      resolveEntityVsWalls(m);

      for (const o of mobs) {
        if (o === m || o.hp <= 0) continue;
        resolveCircleVsCircle(m, o);
      }

      const hitDist = m.attackRange + player.r;
      if (dist < hitDist && m.attackCooldown <= 0) {
        m.attackCooldown = 0.65;
        player.hp = Math.max(0, player.hp - m.dmg);
      }
    }
  }

  function handlePlayerAttack() {
    if (player.atkWindow <= 0) return;
    if (player.atkDidHit) return;

    const range = 46;
    const cone = 0.75;
    let didAny = false;

    for (const m of mobs) {
      if (m.hp <= 0) continue;
      const dx = m.x - player.x;
      const dy = m.y - player.y;
      const d = Math.hypot(dx, dy);
      if (d > range + m.r) continue;

      const a = Math.atan2(dy, dx);
      const da = Math.abs(angleDiff(a, player.facing));
      if (da > cone) continue;

      m.hp = Math.max(0, m.hp - 18);
      didAny = true;
    }

    player.atkDidHit = didAny;
  }

  // ---------- Camera (target + inertia) ----------
  // Center of screen follows a point on segment [player -> mouseWorld] at 1/3 from player.
  // Closed form (no iteration): camTarget = player + 0.5*mouseScreen - 0.75*screenSize
  function computeCameraTarget() {
    const screenW = W / DPR;
    const screenH = H / DPR;
    const mx = mouseX / DPR;
    const my = mouseY / DPR;

    const camTargetX = player.x + 0.5 * mx - 0.75 * screenW;
    const camTargetY = player.y + 0.5 * my - 0.75 * screenH;

    const worldW = MAP_W * TILE;
    const worldH = MAP_H * TILE;

    const tx = clamp(camTargetX, 0, Math.max(0, worldW - screenW));
    const ty = clamp(camTargetY, 0, Math.max(0, worldH - screenH));
    return { tx, ty };
  }

  const cam = { x: 0, y: 0 };
  function updateCamera(dt) {
    const { tx, ty } = computeCameraTarget();
    // Exponential smoothing: higher k => snappier
    const k = 9.0;
    const a = 1 - Math.exp(-k * dt);
    cam.x = lerp(cam.x, tx, a);
    cam.y = lerp(cam.y, ty, a);
    return { camX: cam.x, camY: cam.y };
  }

  // Init explored around spawn
  explored[idx(startTile.tx, startTile.ty)] = 1;

  // Init camera to target
  {
    const { tx, ty } = computeCameraTarget();
    cam.x = tx;
    cam.y = ty;
  }

  // ---------- Main Loop ----------
  let last = performance.now();
  function frame(now) {
    const dt = clamp((now - last) / 1000, 0, 0.033);
    last = now;

    // Use current camera for facing / mouseWorld computations
    const camX0 = cam.x;
    const camY0 = cam.y;

    updatePlayer(dt, camX0, camY0);
    if (fogEnabled) computeVisibility();

    updateMobs(dt);
    handlePlayerAttack();

    for (const m of mobs) {
      if (m.hp <= 0) continue;
      resolveCircleVsCircle(player, m);
    }

    const { camX, camY } = updateCamera(dt);

    drawWorld(camX, camY);
    for (const m of mobs) if (m.hp > 0) drawMob(m, camX, camY);
    drawPlayer(camX, camY);
    drawFogTiles(camX, camY, fogEnabled);
    drawHealthCircle();

    if (player.hp <= 0) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(230,235,245,0.95)";
      ctx.font = `${28 * DPR}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME OVER", W / 2, H / 2 - 10 * DPR);
      ctx.font = `${14 * DPR}px system-ui, sans-serif`;
      ctx.fillStyle = "rgba(230,235,245,0.75)";
      ctx.fillText("Обновление страницы перезапускает прототип.", W / 2, H / 2 + 22 * DPR);
      return;
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  canvas.tabIndex = 0;
})();