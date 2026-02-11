"use strict";

/**
 * Невидимая зона-триггер с колбэками входа/выхода.
 */
class TriggerZone extends Entity {
  constructor(opts = {}) {
    super(opts);
    this.onEnter = typeof opts.onEnter === "function" ? opts.onEnter : null;
    this.onLeave = typeof opts.onLeave === "function" ? opts.onLeave : null;
  }
}
