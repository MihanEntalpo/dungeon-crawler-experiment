"use strict";

/**
 * Мир: объединяет карту, туман, сущности и HUD.
 */
class World {
  /**
   * @param {GameMap} map
   * @param {FogOfWar} fog
   * @param {EntityManager} entityManager
   */
  constructor(map, fog, entityManager) {
    this.map = map;
    this.fog = fog;
    this.entityManager = entityManager;
    this.input = null;
    this.camera = null;
    this.player = null;
    this.enemies = [];
    this.hud = null;
  }

  /**
   * @param {Entity} ent
   */
  addEntity(ent) {
    this.entityManager.add(ent);
  }

  /**
   * @param {Entity} ent
   */
  removeEntity(ent) {
    this.entityManager.remove(ent);
  }

  /**
   * @param {Player} player
   */
  setPlayer(player) {
    this.player = player;
    this.addEntity(player);
  }

  /**
   * @param {Enemy} enemy
   */
  addEnemy(enemy) {
    this.enemies.push(enemy);
    this.addEntity(enemy);
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    this.entityManager.update(dt, this);
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} camX
   * @param {number} camY
   * @param {number} screenW
   * @param {number} screenH
   * @param {number} dpr
   */
  render(ctx, camX, camY, screenW, screenH, dpr) {
    this.map.draw(ctx, camX, camY, screenW, screenH, dpr);
    this.entityManager.render(ctx, camX, camY, dpr);
  }
}
