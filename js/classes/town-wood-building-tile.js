"use strict";

/**
 * Тайл стены деревянного дома (непроходимый).
 */
class TownWoodBuildingTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: false, blocksLight: true });
  }
}
