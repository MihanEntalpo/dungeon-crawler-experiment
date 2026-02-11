"use strict";

/**
 * Снаряд с временем жизни и уроном.
 */
class Projectile extends Entity {
  constructor(opts = {}) {
    super(opts);
    this.ttl = opts.ttl || 0;
    this.damage = opts.damage || 0;
  }

  onHit(_target) {}
}
