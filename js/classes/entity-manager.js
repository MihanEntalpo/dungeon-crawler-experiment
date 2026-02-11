"use strict";

/**
 * Хранение сущностей и централизованный update/render.
 */
class EntityManager {
  constructor() {
    this.entities = [];
  }

  /**
   * @param {Entity} ent
   */
  add(ent) {
    this.entities.push(ent);
  }

  /**
   * @param {Entity} ent
   */
  remove(ent) {
    const i = this.entities.indexOf(ent);
    if (i >= 0) this.entities.splice(i, 1);
  }

  /**
   * @param {number} dt
   */
  update(dt, world) {
    for (const ent of this.entities) ent.update?.(dt, world);
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} camX
   * @param {number} camY
   * @param {number} dpr
   */
  render(ctx, camX, camY, dpr) {
    for (const ent of this.entities) {
      const key = ent.activeDrawerKey;
      const drawer = key && ent.drawers ? ent.drawers[key] : null;
      if (drawer && typeof drawer.render === "function") drawer.render(ctx, ent, camX, camY, dpr);
    }
  }
}
