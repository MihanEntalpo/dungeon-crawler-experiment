"use strict";

class TownWoodBuildingTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: false, blocksLight: true });
  }
}
