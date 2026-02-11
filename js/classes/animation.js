"use strict";

/**
 * Хранит набор кадров и параметры анимации.
 */
class Animation {
  /**
   * @param {object} opts
   * @param {string} opts.name
   * @param {number} [opts.fps]
   * @param {Array<{imageName?:string,tilesetName?:string,tileName?:string}>} [opts.frames]
   */
  constructor(opts = {}) {
    this.name = opts.name || "";
    this.fps = opts.fps || 2;
    this.frames = Array.isArray(opts.frames) ? opts.frames : [];
  }
}
