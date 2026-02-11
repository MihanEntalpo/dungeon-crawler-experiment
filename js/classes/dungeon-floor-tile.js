"use strict";

/**
 * Тайл пола подземелья (проходимый).
 */
class DungeonFloorTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: true, blocksLight: false });
  }
}
