"use strict";

/**
 * Базовая единица изображения: хранит метаданные и источник картинки (url/base64/тайлсет).
 */
class ImageAsset {
  /**
   * @param {object} opts
   * @param {string} opts.name
   * @param {number} [opts.width]
   * @param {number} [opts.height]
   * @param {"base64"|"url"|"tileset"} [opts.sourceType]
   * @param {string} [opts.base64]
   * @param {string} [opts.url]
   * @param {string} [opts.tilesetName]
   * @param {string} [opts.tileName]
   */
  constructor(opts = {}) {
    this.name = opts.name || "";
    this.width = opts.width || 0;
    this.height = opts.height || 0;
    this.sourceType = opts.sourceType || "url";
    this.base64 = opts.base64 || "";
    this.url = opts.url || "";
    this.tilesetName = opts.tilesetName || "";
    this.tileName = opts.tileName || "";
  }
}
