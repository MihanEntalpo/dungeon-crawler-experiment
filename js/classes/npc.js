"use strict";

/**
 * NPC: заготовка для ИИ и диалогов.
 */
class NPC extends Actor {
  constructor(opts = {}) {
    super(opts);
    this.dialogId = opts.dialogId || "";
  }

  updateAI(_dt) {}
}
