"use strict";

/**
 * Процедурная генерация подземелья (лабиринт, комнаты, петли).
 */
class DungeonGenerator {
  /**
   * Генерирует сетку подземелья: лабиринт + комнаты + петли.
   *
   * @param {number} cw - Ширина лабиринта в клетках.
   * @param {number} ch - Высота лабиринта в клетках.
   * @returns {{tiles:number[][], tw:number, th:number, WALL:number, FLOOR:number}} Данные подземелья.
   */
  static generate(cw, ch) {
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
    const roomCount = Math.max(ROOM_MIN, Math.floor((cw * ch) / ROOM_DENSITY_DIV));
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
    const loopProb = LOOP_PROB;
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
    const ddPasses = DEAD_END_PASSES;
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
}
