"use strict";

class TownGrassTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: true, blocksLight: false });
  }
}
