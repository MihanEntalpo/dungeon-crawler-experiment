"use strict";

/**
 * Движимая сущность с боевыми параметрами (hp, скорость, урон).
 */
class Actor extends Entity {
  /**
   * @param {object} opts
   * @param {number} [opts.hp]
   * @param {number} [opts.hpMax]
   * @param {number} [opts.moveSpeed]
   * @param {number} [opts.damage]
   * @param {number} [opts.aggroRadius]
   * @param {string} [opts.state]
   */
  constructor(opts = {}) {
    super(opts);
    this.hp = (opts.hp ?? 0);
    this.hpMax = (opts.hpMax ?? this.hp);
    this.moveSpeed = opts.moveSpeed || 0;
    this.damage = opts.damage || 0;
    this.aggroRadius = opts.aggroRadius || 0;
    this.state = opts.state || "idle";
  }

  move(_dir, _dt) {}
  takeDamage(_amount) {}
  die() {}
}
