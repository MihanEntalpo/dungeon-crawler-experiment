"use strict";

/**
 * Контейнер с лутом и состоянием открытия.
 */
class Chest extends Entity {
  constructor(opts = {}) {
    super(opts);
    this.loot = opts.loot || [];
    this.isOpen = !!opts.isOpen;
  }

  open(_actor) {}
}
