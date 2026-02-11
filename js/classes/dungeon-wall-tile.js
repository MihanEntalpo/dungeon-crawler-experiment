"use strict";

/**
 * Тайл стены подземелья (непроходимый, блокирует свет).
 */
class DungeonWallTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: false, blocksLight: true });
  }
}
