"use strict";

/**
 * Туман войны: вычисление видимости и отрисовка.
 */
class FogOfWar {
  /**
   * @param {GameMap} map
   */
  constructor(map) {
    this.map = map;
    this.explored = new Uint8Array(map.w * map.h);
    this.visible = new Uint8Array(map.w * map.h);
    this.overlayAlpha = new Float32Array(map.w * map.h);
    this.overlayAlpha.fill(FOG_UNSEEN_ALPHA);
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
   * @param {number} tx
   * @param {number} ty
   * @returns {boolean}
   */
  isVisibleTile(tx, ty) {
    if (!this.map.inBounds(tx, ty)) return false;
    return this.visible[this.map.idx(tx, ty)] === 1;
  }

  /**
   * @param {number} id
   * @returns {number}
   */
  getTargetAlphaById(id) {
    if (this.visible[id]) return 0;
    if (!this.explored[id]) return FOG_UNSEEN_ALPHA;
    if (FOG_MEMORY_MODE_ENABLED) return FOG_MEMORY_ALPHA;
    return 0;
  }

  /**
   * @param {number} dt
   * @returns {void}
   */
  updateFade(dt) {
    const fadeMs = Math.max(1, FOG_VISIBILITY_FADE_MS);
    for (let id = 0; id < this.overlayAlpha.length; id++) {
      const target = this.getTargetAlphaById(id);

      if (!FOG_VISIBILITY_FADE_ENABLED) {
        this.overlayAlpha[id] = target;
        continue;
      }

      if (target <= this.overlayAlpha[id]) {
        // Осветление и снятие затемнения делаем сразу; плавность нужна
        // только когда клетка уходит из visible в hidden.
        this.overlayAlpha[id] = target;
        continue;
      }

      const step = (dt * 1000 / fadeMs) * target;
      this.overlayAlpha[id] = Math.min(target, this.overlayAlpha[id] + step);
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

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (!this.map.inBounds(tx, ty)) continue;
        const id = this.map.idx(tx, ty);
        const alpha = this.overlayAlpha[id];
        if (alpha <= 0) continue;

        const sx = (tx * TILE - camX) * dpr;
        const sy = (ty * TILE - camY) * dpr;
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fillRect(sx, sy, TILE * dpr, TILE * dpr);
      }
    }
  }
}
