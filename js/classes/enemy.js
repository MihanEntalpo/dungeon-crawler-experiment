"use strict";

/**
 * Враг: ИИ преследования/атаки и рендер.
 */
class Enemy extends Actor {
  /**
   * @param {object} opts
   * @param {{name:string,color:string,hp:number,dmg:number,speed:number,aggro:number}} opts.type
   */
  constructor(opts = {}) {
    super(opts);
    this.type = opts.type;
    this.r = 11;
    this.radius = this.r;
    this.hp = this.type.hp;
    this.hpMax = this.type.hp;
    this.damage = this.type.dmg;
    this.moveSpeed = this.type.speed;
    this.aggroRadius = this.type.aggro;
    this.attackRange = 22;
    this.attackCooldown = 0;
    this.attackWindow = 0;
    this.facing = 0;
    this.wanderT = Math.random() * 2;
    this.wanderA = Math.random() * TAU;
    this.state = "wander";
    this.drawers = Object.assign({
      idle: new Drawer({ render: Enemy.renderBody }),
      walk: new Drawer({ render: Enemy.renderBody }),
      attack: new Drawer({ render: Enemy.renderBody }),
      dead: new Drawer({ render: null }),
    }, this.drawers);
    this.activeDrawerKey = "idle";
  }

  /**
   * @param {number} dt
   * @param {Player} player
   * @param {GameMap} map
   * @param {Enemy[]} mobs
   */
  update(dt, world) {
    const player = world.player;
    const map = world.map;
    const mobs = world.enemies;
    if (this.hp <= 0) {
      this.activeDrawerKey = "dead";
      return;
    }
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.attackWindow = Math.max(0, this.attackWindow - dt);

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    let tx = 0, ty = 0;

    if (dist < this.aggroRadius) {
      this.state = "chase";
      if (dist > 1e-6) { tx = dx / dist; ty = dy / dist; }
      this.facing = Math.atan2(dy, dx);
    } else {
      this.state = "wander";
      this.wanderT -= dt;
      if (this.wanderT <= 0) {
        this.wanderT = 1.3 + Math.random() * 1.7;
        this.wanderA = Math.random() * TAU;
      }
      tx = Math.cos(this.wanderA);
      ty = Math.sin(this.wanderA);
      this.facing = this.wanderA;
    }

    const spd = (this.state === "chase") ? this.moveSpeed : (this.moveSpeed * 0.55);
    this.vx = lerp(this.vx, tx * spd, 1 - Math.pow(0.03, dt * 60));
    this.vy = lerp(this.vy, ty * spd, 1 - Math.pow(0.03, dt * 60));

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    Collision.resolveEntityVsWalls(this, map);

    for (const o of mobs) {
      if (o === this || o.hp <= 0) continue;
      Collision.resolveCircleVsCircle(this, o);
    }

    const hitDist = this.attackRange + player.r;
    if (dist < hitDist && this.attackCooldown <= 0) {
      this.attackCooldown = 0.65;
      this.attackWindow = 0.12;
      player.hp = Math.max(0, player.hp - this.damage);
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} camX
   * @param {number} camY
   * @param {number} dpr
   */
  static renderBody(ctx, ent, camX, camY, dpr) {
    const sx = (ent.x - camX) * dpr;
    const sy = (ent.y - camY) * dpr;

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 9*dpr, 13*dpr, 7*dpr, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = ent.type.color;
    ctx.beginPath();
    ctx.arc(sx, sy, ent.r * dpr, 0, TAU);
    ctx.fill();

    if (ent.attackWindow > 0) {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(ent.facing);
      ctx.strokeStyle = "rgba(255,200,200,0.85)";
      ctx.lineWidth = 3 * dpr;
      ctx.beginPath();
      const R = (ent.r + 16) * dpr;
      ctx.arc(0, 0, R, -0.55, 0.55);
      ctx.stroke();
      ctx.restore();
    }

    const barW = 36 * dpr;
    const barH = 6 * dpr;
    const t = clamp(ent.hp / ent.hpMax, 0, 1);
    const bx = sx - barW / 2;
    const by = sy - (ent.r * dpr) - 14 * dpr;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(bx - 1*dpr, by - 1*dpr, barW + 2*dpr, barH + 2*dpr);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = `rgba(${Math.floor(lerp(255, 80, t))},${Math.floor(lerp(90, 220, t))},${Math.floor(lerp(110, 90, t))},0.95)`;
    ctx.fillRect(bx, by, barW * t, barH);
  }
}
