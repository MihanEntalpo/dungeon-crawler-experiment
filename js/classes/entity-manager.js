"use strict";

/**
 * Хранение сущностей и централизованный update/render.
 */
class EntityManager {
  constructor() {
    this.entities = [];
    this.enemyFogAlpha = new WeakMap();
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
   * Плавное исчезновение врагов вне текущей видимости.
   * @param {number} dt
   * @param {World|null} world
   * @param {boolean} fogEnabled
   * @returns {void}
   */
  updateFogVisibilityFade(dt, world, fogEnabled) {
    for (const ent of this.entities) {
      if (!(ent instanceof Enemy)) continue;
      this.enemyFogAlpha.set(ent, this.computeEnemyFogAlpha(ent, dt, world, fogEnabled));
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} camX
   * @param {number} camY
   * @param {number} dpr
   * @param {World|null} [world]
   */
  render(ctx, camX, camY, dpr, world = null) {
    for (const ent of this.entities) {
      if (!this.shouldRenderEntity(ent, world)) continue;
      const key = ent.activeDrawerKey;
      const drawer = key && ent.drawers ? ent.drawers[key] : null;
      if (!drawer || typeof drawer.render !== "function") continue;

      const alpha = this.getEntityRenderAlpha(ent, world);
      if (alpha >= 0.999) {
        drawer.render(ctx, ent, camX, camY, dpr);
        continue;
      }
      ctx.save();
      ctx.globalAlpha *= alpha;
      drawer.render(ctx, ent, camX, camY, dpr);
      ctx.restore();
    }
  }

  /**
   * @param {Entity} ent
   * @param {World|null} world
   * @returns {boolean}
   */
  shouldRenderEntity(ent, world) {
    return this.getEntityRenderAlpha(ent, world) > 0;
  }

  /**
   * @param {Entity} ent
   * @param {World|null} world
   * @returns {number}
   */
  getEntityRenderAlpha(ent, world) {
    if (!(ent instanceof Enemy)) return 1;
    if (!FOG_HIDE_ENEMIES_OUTSIDE_VISIBLE) return 1;
    if (!world || !world.map || !world.fog) return 1;
    return this.enemyFogAlpha.get(ent) ?? 1;
  }

  /**
   * @param {Enemy} ent
   * @param {number} dt
   * @param {World|null} world
   * @param {boolean} fogEnabled
   * @returns {number}
   */
  computeEnemyFogAlpha(ent, dt, world, fogEnabled) {
    if (!FOG_HIDE_ENEMIES_OUTSIDE_VISIBLE) return 1;
    if (!fogEnabled) return 1;
    if (!world || !world.map || !world.fog) return 1;

    const { tx, ty } = world.map.worldToTile(ent.x, ent.y);
    const isVisible = world.fog.isVisibleTile(tx, ty);
    const hasPrev = this.enemyFogAlpha.has(ent);
    const prev = hasPrev ? this.enemyFogAlpha.get(ent) : (isVisible ? 1 : 0);

    if (isVisible) return 1;
    if (!FOG_VISIBILITY_FADE_ENABLED) return 0;

    const fadeMs = Math.max(1, FOG_VISIBILITY_FADE_MS);
    const step = (dt * 1000) / fadeMs;
    return Math.max(0, prev - step);
  }
}
