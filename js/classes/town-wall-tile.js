"use strict";

class TownWallTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: false, blocksLight: true });
  }
}
