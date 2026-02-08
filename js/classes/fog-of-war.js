"use strict";

class FogOfWar {
  /**
   * @param {GameMap} map
   */
  constructor(map) {
    this.map = map;
    this.explored = new Uint8Array(map.w * map.h);
    this.visible = new Uint8Array(map.w * map.h);
  }

  /**
   * @param {Player} player
   * @returns {void}
   */
  computeVisibility(player) {
    this.visible.fill(0);

    const pt = this.map.worldToTile(player.x, player.y);
    if (this.map.inBounds(pt.tx, pt.ty)) {
      const id0 = this.map.idx(pt.tx, pt.ty);
      this.visible[id0] = 1;
      this.explored[id0] = 1;
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
        const { tx, ty } = this.map.worldToTile(x, y);
        if (!this.map.inBounds(tx, ty)) break;
        const id = this.map.idx(tx, ty);
        this.visible[id] = 1;
        this.explored[id] = 1;
        if (this.map.isWall(tx, ty)) break;
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} camX
   * @param {number} camY
   * @param {number} screenW
   * @param {number} screenH
   * @param {number} dpr
   * @param {boolean} enabled
   * @returns {void}
   */
  draw(ctx, camX, camY, screenW, screenH, dpr, enabled) {
    if (!enabled) return;

    const pad = 2;
    const minTx = Math.floor(camX / TILE) - pad;
    const minTy = Math.floor(camY / TILE) - pad;
    const maxTx = Math.floor((camX + screenW) / TILE) + pad;
    const maxTy = Math.floor((camY + screenH) / TILE) + pad;

    ctx.fillStyle = "rgba(0,0,0,0.98)";
    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (!this.map.inBounds(tx, ty)) continue;
        const id = this.map.idx(tx, ty);
        if (this.explored[id]) continue;
        const sx = (tx * TILE - camX) * dpr;
        const sy = (ty * TILE - camY) * dpr;
        ctx.fillRect(sx, sy, TILE * dpr, TILE * dpr);
      }
    }
  }
}
