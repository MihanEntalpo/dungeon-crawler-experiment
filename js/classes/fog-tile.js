"use strict";

class FogTile extends MapTile {
  constructor(opts = {}) {
    super({ ...opts, walkable: false, blocksLight: true });
  }
}
