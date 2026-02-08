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
   */
  constructor(opts = {}) {
    this.type = opts.type || "color";
    this.color = opts.color || "";
    this.imageName = opts.imageName || "";
    this.animationName = opts.animationName || "";
    this.opacity = (opts.opacity ?? 1);
    this.rotation = opts.rotation || 0;
  }
}
