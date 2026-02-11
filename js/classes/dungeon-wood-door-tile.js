"use strict";

/**
 * Тайл двери подземелья (проходимый, интерактивный).
 */
class DungeonWoodDoorTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: true, interactable: true, blocksLight: false });
  }
}
