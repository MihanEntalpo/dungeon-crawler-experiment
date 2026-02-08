"use strict";

class DungeonWoodDoorTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: true, interactable: true, blocksLight: false });
  }
}
