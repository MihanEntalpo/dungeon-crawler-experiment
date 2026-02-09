"use strict";

class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * @param {Player} player
   * @param {InputManager} input
   * @param {number} screenW
   * @param {number} screenH
   * @param {number} worldW
   * @param {number} worldH
   * @returns {{tx:number, ty:number}}
   */
  computeTarget(player, input, screenW, screenH, worldW, worldH) {
    let mx = input.mouseX / input.dpr;
    let my = input.mouseY / input.dpr;
    if (input.isTouch) {
      const dir = { x: Math.cos(player.facing), y: Math.sin(player.facing) };
      const offset = Math.min(screenW, screenH) / 5;
      const focusX = player.x + dir.x * offset;
      const focusY = player.y + dir.y * offset;
      const tx = clamp(focusX - screenW * 0.5, 0, Math.max(0, worldW - screenW));
      const ty = clamp(focusY - screenH * 0.5, 0, Math.max(0, worldH - screenH));
      return { tx, ty };
    }

    const camTargetX = player.x + 0.5 * mx - 0.75 * screenW;
    const camTargetY = player.y + 0.5 * my - 0.75 * screenH;

    const tx = clamp(camTargetX, 0, Math.max(0, worldW - screenW));
    const ty = clamp(camTargetY, 0, Math.max(0, worldH - screenH));
    return { tx, ty };
  }

  /**
   * @param {number} dt
   * @param {Player} player
   * @param {InputManager} input
   * @param {number} screenW
   * @param {number} screenH
   * @param {number} worldW
   * @param {number} worldH
   * @returns {{camX:number, camY:number}}
   */
  update(dt, player, input, screenW, screenH, worldW, worldH) {
    const { tx, ty } = this.computeTarget(player, input, screenW, screenH, worldW, worldH);
    const k = 5.0;
    const a = 1 - Math.exp(-k * dt);
    this.x = lerp(this.x, tx, a);
    this.y = lerp(this.y, ty, a);
    return { camX: this.x, camY: this.y };
  }
}
