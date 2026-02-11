"use strict";

/**
 * Базовый тайл карты с проходимостью, светопропусканием и Drawer.
 */
class MapTile {
  /**
   * @param {object} opts
   * @param {boolean} [opts.walkable]
   * @param {number} [opts.speedMul]
   * @param {boolean} [opts.interactable]
   * @param {boolean} [opts.blocksLight]
   * @param {Drawer|null} [opts.drawer]
   * @param {(actor: unknown) => void} [opts.onInteract]
   * @param {object} [opts.meta]
   */
  constructor(opts = {}) {
    this.walkable = !!opts.walkable;
    this.speedMul = (opts.speedMul ?? 1);
    this.interactable = !!opts.interactable;
    this.blocksLight = !!opts.blocksLight;
    this.drawer = opts.drawer || null;
    this.onInteract = typeof opts.onInteract === "function" ? opts.onInteract : null;
    this.meta = opts.meta || {};
  }
}
