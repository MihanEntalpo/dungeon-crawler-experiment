"use strict";

class Enemy extends Actor {
  constructor(opts = {}) {
    super(opts);
    this.dropTable = opts.dropTable || [];
  }

  updateAI(_dt) {}
}
