"use strict";

class DungeonFloorTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: true, blocksLight: false });
  }
}
