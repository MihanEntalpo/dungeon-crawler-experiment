"use strict";

class GameMap {
  /**
   * @param {{tiles:number[][], tw:number, th:number, WALL:number, FLOOR:number}} data
   */
  constructor(data) {
    this.tiles = data.tiles;
    this.w = data.tw;
    this.h = data.th;
    this.WALL = data.WALL;
    this.FLOOR = data.FLOOR;
  }

  /**
   * @param {number} tx
   * @param {number} ty
   * @returns {boolean}
   */
  inBounds(tx, ty) {
    return (tx >= 0 && ty >= 0 && tx < this.w && ty < this.h);
  }

  /**
   * @param {number} tx
   * @param {number} ty
   * @returns {boolean}
   */
  isWall(tx, ty) {
    if (!this.inBounds(tx, ty)) return true;
    return this.tiles[ty][tx] === this.WALL;
  }

  /**
   * @param {number} tx
   * @param {number} ty
   * @returns {boolean}
   */
  isFloor(tx, ty) {
    if (!this.inBounds(tx, ty)) return false;
    return this.tiles[ty][tx] === this.FLOOR;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {{tx:number, ty:number}}
   */
  worldToTile(x, y) {
    return { tx: Math.floor(x / TILE), ty: Math.floor(y / TILE) };
  }

  /**
   * @param {number} tx
   * @param {number} ty
   * @returns {number}
   */
  idx(tx, ty) {
    return ty * this.w + tx;
  }

  /**
   * @param {number} tx0
   * @param {number} ty0
   * @returns {{tx:number, ty:number}}
   */
  findNearestFloorTile(tx0, ty0) {
    let best = null;
    let bestD = 1e18;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (!this.isFloor(x, y)) continue;
        const dx = x - tx0, dy = y - ty0;
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = { tx: x, ty: y }; }
      }
    }
    return best;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} camX
   * @param {number} camY
   * @param {number} screenW
   * @param {number} screenH
   * @param {number} dpr
   * @returns {void}
   */
  draw(ctx, camX, camY, screenW, screenH, dpr) {
    const pad = 3;
    const minTx = Math.floor(camX / TILE) - pad;
    const minTy = Math.floor(camY / TILE) - pad;
    const maxTx = Math.floor((camX + screenW) / TILE) + pad;
    const maxTy = Math.floor((camY + screenH) / TILE) + pad;

    ctx.fillStyle = "#0b0e12";
    ctx.fillRect(0, 0, screenW * dpr, screenH * dpr);

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (!this.inBounds(tx, ty)) continue;
        const wx = tx * TILE;
        const wy = ty * TILE;
        const sx = (wx - camX) * dpr;
        const sy = (wy - camY) * dpr;
        const s = TILE * dpr;

        if (this.tiles[ty][tx] === this.FLOOR) {
          const h = hash2(tx, ty);
          const v = 0.10 + ((h & 255) / 255) * 0.08;
          ctx.fillStyle = `rgb(${Math.floor(20 + v*70)},${Math.floor(23 + v*70)},${Math.floor(28 + v*75)})`;
          ctx.fillRect(sx, sy, s, s);
        } else {
          ctx.fillStyle = "#252c36";
          ctx.fillRect(sx, sy, s, s);
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.fillRect(sx, sy, s, 2*dpr);
          ctx.fillRect(sx, sy, 2*dpr, s);
          ctx.fillStyle = "rgba(0,0,0,0.20)";
          ctx.fillRect(sx, sy + s - 2*dpr, s, 2*dpr);
          ctx.fillRect(sx + s - 2*dpr, sy, 2*dpr, s);
        }
      }
    }
  }
}
