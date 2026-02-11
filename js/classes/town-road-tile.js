"use strict";

/**
 * Тайл дороги (проходимый).
 */
class TownRoadTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: true, blocksLight: false });
  }
}
