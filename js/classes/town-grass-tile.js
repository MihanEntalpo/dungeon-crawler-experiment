"use strict";

/**
 * Тайл травы (проходимый).
 */
class TownGrassTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: true, blocksLight: false });
  }
}
