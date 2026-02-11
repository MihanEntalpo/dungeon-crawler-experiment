"use strict";

/**
 * Тайл тумана войны (непроходимый, блокирует свет).
 */
class FogTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: false, blocksLight: true });
  }
}
