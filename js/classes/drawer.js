"use strict";

class Drawer {
  /**
   * @param {object} opts
   * @param {"color"|"image"|"animation"} [opts.type]
   * @param {string} [opts.color]
   * @param {string} [opts.imageName]
   * @param {string} [opts.animationName]
   * @param {number} [opts.opacity]
   * @param {number} [opts.rotation]
   * @param {(ctx: CanvasRenderingContext2D, ent: any, camX: number, camY: number, dpr: number) => void} [opts.render]
   */
  constructor(opts = {}) {
    this.type = opts.type || "color";
    this.color = opts.color || "";
    this.imageName = opts.imageName || "";
    this.animationName = opts.animationName || "";
    this.opacity = (opts.opacity ?? 1);
    this.rotation = opts.rotation || 0;
    this.renderFn = typeof opts.render === "function" ? opts.render : null;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {any} ent
   * @param {number} camX
   * @param {number} camY
   * @param {number} dpr
   */
  render(ctx, ent, camX, camY, dpr) {
    if (this.renderFn) this.renderFn(ctx, ent, camX, camY, dpr);
  }
}
