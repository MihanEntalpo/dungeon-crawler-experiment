"use strict";

class DungeonWallTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: false, blocksLight: true });
  }
}
