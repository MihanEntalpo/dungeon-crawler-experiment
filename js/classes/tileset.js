"use strict";

/**
 * Описывает тайлсет: связь с изображением и список тайлов внутри.
 */
class TileSet {
  /**
   * @param {object} opts
   * @param {string} opts.name
   * @param {string} opts.imageName
   * @param {Array<{name:string,x:number,y:number,w:number,h:number}>} [opts.tiles]
   */
  constructor(opts = {}) {
    this.name = opts.name || "";
    this.imageName = opts.imageName || "";
    this.tiles = Array.isArray(opts.tiles) ? opts.tiles : [];
  }
}
