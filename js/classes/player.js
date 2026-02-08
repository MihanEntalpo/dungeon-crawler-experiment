"use strict";

class Player extends Actor {
  /**
   * @param {object} opts
   */
  constructor(opts = {}) {
    super(opts);
    this.r = opts.r || 12;
    this.radius = this.r;
    this.facing = 0;
    this.atkCooldown = 0;
    this.atkWindow = 0;
    this.atkDidHit = false;
    this.inventory = opts.inventory || [];
    this.drawers = Object.assign({
      idle: new Drawer({ render: Player.renderBody }),
      walk: new Drawer({ render: Player.renderBody }),
      attack: new Drawer({ render: Player.renderBody }),
      hurt: new Drawer({ render: Player.renderBody }),
      dead: new Drawer({ render: Player.renderBody }),
    }, this.drawers);
    this.activeDrawerKey = "idle";
  }

  /**
   * @param {number} dt
   * @param {InputManager} input
   * @param {GameMap} map
   * @param {Camera} camera
   */
  update(dt, world) {
    const input = world.input;
    const camera = world.camera;
    const map = world.map;
    if (input.isTouch && input.lookActive) {
      this.facing = input.lookAngle;
    } else {
      const mxWorld = camera.x + (input.mouseX / input.dpr);
      const myWorld = camera.y + (input.mouseY / input.dpr);
      this.facing = Math.atan2(myWorld - this.y, mxWorld - this.x);
    }

    const accel = 1560;
    const maxSpd = 320;

    let ax = 0, ay = 0;
    if (input.isTouch && input.moveActive) {
      ax = input.moveVec.x;
      ay = input.moveVec.y;
    } else {
      if (input.keys.has("ArrowLeft") || input.keys.has("a") || input.keys.has("A") || input.keys.has("ф") || input.keys.has("Ф"))  ax -= 1;
      if (input.keys.has("ArrowRight")|| input.keys.has("d") || input.keys.has("D") || input.keys.has("в") || input.keys.has("В"))  ax += 1;
      if (input.keys.has("ArrowUp")   || input.keys.has("w") || input.keys.has("W") || input.keys.has("ц") || input.keys.has("Ц"))  ay -= 1;
      if (input.keys.has("ArrowDown") || input.keys.has("s") || input.keys.has("S") || input.keys.has("ы") || input.keys.has("Ы"))  ay += 1;
    }

    const len = Math.hypot(ax, ay);
    if (len > 0) { ax /= len; ay /= len; }

    this.vx += ax * accel * dt;
    this.vy += ay * accel * dt;

    const damp = (len > 0) ? 0.88 : 0.78;
    this.vx *= Math.pow(damp, dt * 60);
    this.vy *= Math.pow(damp, dt * 60);

    const spd = Math.hypot(this.vx, this.vy);
    if (spd > maxSpd) {
      this.vx = (this.vx / spd) * maxSpd;
      this.vy = (this.vy / spd) * maxSpd;
    }

    this.atkCooldown = Math.max(0, this.atkCooldown - dt);
    this.atkWindow = Math.max(0, this.atkWindow - dt);
    const attackDown = input.isTouch ? input.attackDown : input.mouseDown;
    if (!attackDown) this.atkDidHit = false;

    if (attackDown && this.atkCooldown <= 0) {
      this.atkCooldown = 0.30;
      this.atkWindow = 0.12;
      this.atkDidHit = false;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    Collision.resolveEntityVsWalls(this, map);
  }

  /**
   * @param {Enemy[]} enemies
   */
  /**
   * @param {World} world
   */
  applyAttack(world) {
    if (this.atkWindow <= 0) return;
    if (this.atkDidHit) return;

    const map = world.map;
    const range = 46;
    const cone = 0.75;
    let didAny = false;

    for (const m of world.enemies) {
      if (m.hp <= 0) continue;
      const dx = m.x - this.x;
      const dy = m.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d > range + m.r) continue;

      const a = Math.atan2(dy, dx);
      const da = Math.abs(angleDiff(a, this.facing));
      if (da > cone) continue;
      if (!Player.hasLineOfSight(this.x, this.y, m.x, m.y, map)) continue;

      m.hp = Math.max(0, m.hp - 18);
      didAny = true;
    }

    this.atkDidHit = didAny;
  }

  /**
   * @param {number} x0
   * @param {number} y0
   * @param {number} x1
   * @param {number} y1
   * @param {GameMap} map
   * @returns {boolean}
   */
  static hasLineOfSight(x0, y0, x1, y1, map) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    if (dist <= 1e-6) return true;
    const step = TILE / 6;
    const steps = Math.ceil(dist / step);
    const sx = dx / steps;
    const sy = dy / steps;
    let x = x0;
    let y = y0;
    for (let i = 0; i < steps; i++) {
      x += sx;
      y += sy;
      const { tx, ty } = map.worldToTile(x, y);
      if (map.isWall(tx, ty)) return false;
    }
    return true;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {Player} ent
   * @param {number} camX
   * @param {number} camY
   * @param {number} dpr
   */
  static renderBody(ctx, ent, camX, camY, dpr) {
    const sx = (ent.x - camX) * dpr;
    const sy = (ent.y - camY) * dpr;

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 10*dpr, 14*dpr, 8*dpr, 0, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ent.facing);
    ctx.fillStyle = "#d7e2ff";
    ctx.beginPath();
    ctx.arc(0, 0, ent.r * dpr, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#8fb0ff";
    ctx.beginPath();
    ctx.moveTo(0, -2*dpr);
    ctx.lineTo((ent.r + 9) * dpr, 0);
    ctx.lineTo(0, 2*dpr);
    ctx.closePath();
    ctx.fill();

    if (ent.atkWindow > 0) {
      ctx.strokeStyle = "rgba(255,235,180,0.9)";
      ctx.lineWidth = 3 * dpr;
      ctx.beginPath();
      const R = (ent.r + 18) * dpr;
      ctx.arc(0, 0, R, -0.55, 0.55);
      ctx.stroke();
    }
    ctx.restore();
  }
}
