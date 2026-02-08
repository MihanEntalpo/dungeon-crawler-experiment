"use strict";

class Entity {
  /**
   * @param {object} opts
   * @param {string} [opts.id]
   * @param {string} [opts.name]
   * @param {number} [opts.x]
   * @param {number} [opts.y]
   * @param {number} [opts.vx]
   * @param {number} [opts.vy]
   * @param {number} [opts.rotation]
   * @param {number} [opts.radius]
   * @param {boolean} [opts.phasesWalls]
   * @param {boolean} [opts.phasesEntities]
   * @param {object} [opts.drawers]
   * @param {string} [opts.activeDrawerKey]
   * @param {object} [opts.world]
   */
  constructor(opts = {}) {
    this.id = opts.id || "";
    this.name = opts.name || "";
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.vx = opts.vx || 0;
    this.vy = opts.vy || 0;
    this.rotation = opts.rotation || 0;
    this.radius = opts.radius || 0;
    this.phasesWalls = !!opts.phasesWalls;
    this.phasesEntities = !!opts.phasesEntities;
    this.drawers = opts.drawers || {};
    this.activeDrawerKey = opts.activeDrawerKey || "";
    this.world = opts.world || null;
  }

  update(_dt, _world) {}
  render(_ctx) {}
  onInteract(_actor) {}
  onRemove() {}
}
