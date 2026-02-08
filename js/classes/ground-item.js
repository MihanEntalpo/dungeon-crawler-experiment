"use strict";

class GroundItem extends Entity {
  constructor(opts = {}) {
    super(opts);
    this.itemId = opts.itemId || "";
    this.count = opts.count || 1;
  }

  pickUp(_actor) {}
}
