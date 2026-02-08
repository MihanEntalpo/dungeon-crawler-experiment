"use strict";

class Collision {
  /**
   * Разрешает пересечение круга и AABB, возвращая вектор выталкивания.
   *
   * @param {number} cx - Центр круга X.
   * @param {number} cy - Центр круга Y.
   * @param {number} cr - Радиус круга.
   * @param {number} ax - X прямоугольника.
   * @param {number} ay - Y прямоугольника.
   * @param {number} aw - Ширина прямоугольника.
   * @param {number} ah - Высота прямоугольника.
   * @returns {{mx:number,my:number}|null} Вектор выталкивания или null.
   */
  static circleAABBResolve(cx, cy, cr, ax, ay, aw, ah) {
    const nx = clamp(cx, ax, ax + aw);
    const ny = clamp(cy, ay, ay + ah);
    const dx = cx - nx;
    const dy = cy - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 >= cr * cr || d2 === 0) return null;
    const d = Math.sqrt(d2);
    const push = (cr - d);
    return { mx: (dx / d) * push, my: (dy / d) * push };
  }

  /**
   * Выталкивает сущность из пересечений со стенами.
   *
   * @param {{x:number,y:number,vx:number,vy:number,radius?:number,r?:number}} ent
   * @param {GameMap} map
   * @returns {void}
   */
  static resolveEntityVsWalls(ent, map) {
    const r = (ent.radius ?? ent.r ?? 0);
    const minTx = Math.floor((ent.x - r) / TILE) - 1;
    const maxTx = Math.floor((ent.x + r) / TILE) + 1;
    const minTy = Math.floor((ent.y - r) / TILE) - 1;
    const maxTy = Math.floor((ent.y + r) / TILE) + 1;

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (!map.isWall(tx, ty)) continue;
        const ax = tx * TILE;
        const ay = ty * TILE;
        const res = Collision.circleAABBResolve(ent.x, ent.y, r, ax, ay, TILE, TILE);
        if (res) {
          ent.x += res.mx;
          ent.y += res.my;
          const dot = ent.vx * res.mx + ent.vy * res.my;
          if (dot > 0) { ent.vx *= 0.6; ent.vy *= 0.6; }
        }
      }
    }
  }

  /**
   * Раздвигает два пересекающихся круга с взвешенным вкладом.
   *
   * @param {{x:number,y:number,radius?:number,r?:number}} a
   * @param {{x:number,y:number,radius?:number,r?:number}} b
   * @returns {void}
   */
  static resolveCircleVsCircle(a, b) {
    const ar = (a.radius ?? a.r ?? 0);
    const br = (b.radius ?? b.r ?? 0);
    const dx = a.x - b.x, dy = a.y - b.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const minD = ar + br;
    if (d === 0 || d >= minD) return;
    const push = (minD - d);
    const nx = dx / d, ny = dy / d;
    a.x += nx * push * 0.65;
    a.y += ny * push * 0.65;
    b.x -= nx * push * 0.35;
    b.y -= ny * push * 0.35;
  }
}
