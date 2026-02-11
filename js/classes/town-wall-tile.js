"use strict";

/**
 * Тайл городской стены (непроходимый, блокирует свет).
 */
class TownWallTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: false, blocksLight: true });
  }
}
