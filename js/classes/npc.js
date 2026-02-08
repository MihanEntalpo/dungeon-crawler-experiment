"use strict";

class NPC extends Actor {
  constructor(opts = {}) {
    super(opts);
    this.dialogId = opts.dialogId || "";
  }

  updateAI(_dt) {}
}
