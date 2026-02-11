"use strict";

/**
 * HUD: отрисовка интерфейсных элементов (HP, джойстики).
 */
class HUD {
  /**
   * @param {Player} player
   */
  constructor(player, input) {
    this.player = player;
    this.input = input;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenW
   * @param {number} screenH
   * @param {number} dpr
   */
  render(ctx, screenW, screenH, dpr) {
    const isTouch = this.input && this.input.isTouch;
    const cx = 64 * dpr;
    const cy = isTouch ? (64 * dpr) : (screenH * dpr - 64 * dpr);
    const R = 42 * dpr;
    const t = clamp(this.player.hp / this.player.hpMax, 0, 1);

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.arc(0, 0, R + 6*dpr, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(0, 0, R + 2*dpr, 0, TAU);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.clip();

    ctx.fillStyle = "rgba(10,14,20,0.75)";
    ctx.fillRect(-R, -R, 2*R, 2*R);

    const fillH = 2 * R * t;
    const topY = R - fillH;

    ctx.fillStyle = "rgba(235,70,70,0.88)";
    ctx.fillRect(-R, topY, 2*R, fillH);

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(-R, topY, 2*R, 2*dpr);

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    for (let i = 0; i < 9; i++) {
      const bx = (Math.sin(i*12.7) * 0.5 + 0.5) * (2*R) - R;
      const by = topY + (Math.cos(i*7.3) * 0.5 + 0.5) * fillH;
      const br = (2 + (i % 3)) * dpr;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
    }

    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();

    ctx.fillStyle = "rgba(230,235,245,0.9)";
    ctx.font = `${12 * dpr}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.ceil(this.player.hp)}`, cx, cy);

    if (this.input && this.input.isTouch) {
      const l = this.input.layout.leftCenter;
      const r = this.input.layout.rightCenter;
      const jr = this.input.layout.joyRadius;
      const kr = this.input.layout.knobRadius;

      this.drawJoystick(ctx, l.x, l.y, jr, kr, this.input.moveVec, dpr);
      this.drawJoystick(ctx, r.x, r.y, jr, kr, this.input.lookVec, dpr);
    }
  }

  drawJoystick(ctx, x, y, r, kr, vec, dpr) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = "rgba(200,210,230,0.6)";
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(x * dpr, y * dpr, r * dpr, 0, TAU);
    ctx.stroke();

    ctx.fillStyle = "rgba(200,210,230,0.25)";
    ctx.beginPath();
    ctx.arc(x * dpr, y * dpr, r * dpr, 0, TAU);
    ctx.fill();

    const kx = (x + vec.x * r) * dpr;
    const ky = (y + vec.y * r) * dpr;
    ctx.fillStyle = "rgba(230,235,245,0.7)";
    ctx.beginPath();
    ctx.arc(kx, ky, kr * dpr, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

}
