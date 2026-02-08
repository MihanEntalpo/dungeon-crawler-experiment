"use strict";

class InputManager {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.dpr = 1;
    this.isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);

    this.moveActive = false;
    this.lookActive = false;
    this.moveVec = { x: 0, y: 0 };
    this.lookVec = { x: 0, y: 0 };
    this.lookAngle = 0;
    this.attackDown = false;

    this.leftId = null;
    this.rightId = null;
    this.attackId = null;

    this.layout = {
      screenW: 0,
      screenH: 0,
      dpr: 1,
      leftCenter: { x: 0, y: 0 },
      rightCenter: { x: 0, y: 0 },
      joyRadius: 60,
      knobRadius: 24,
      attackRect: { x: 0, y: 0, w: 0, h: 0 },
    };

    window.addEventListener("keydown", (e) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
      this.keys.add(e.key);
    }, { passive: false });

    window.addEventListener("keyup", (e) => this.keys.delete(e.key));

    canvas.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - r.left) * this.dpr;
      this.mouseY = (e.clientY - r.top) * this.dpr;
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.mouseDown = true;
      canvas.focus?.();
    });

    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.mouseDown = false;
    });

    canvas.addEventListener("touchstart", (e) => this.onTouchStart(e), { passive: false });
    canvas.addEventListener("touchmove", (e) => this.onTouchMove(e), { passive: false });
    canvas.addEventListener("touchend", (e) => this.onTouchEnd(e), { passive: false });
    canvas.addEventListener("touchcancel", (e) => this.onTouchEnd(e), { passive: false });
  }

  /**
   * @param {number} dpr
   */
  setDPR(dpr) {
    this.dpr = dpr;
  }

  /**
   * @param {number} screenW
   * @param {number} screenH
   * @param {number} dpr
   */
  setScreen(screenW, screenH, dpr) {
    this.isTouch = ("ontouchstart" in window)
      || (navigator.maxTouchPoints > 0)
      || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    this.layout.screenW = screenW;
    this.layout.screenH = screenH;
    this.layout.dpr = dpr;
    const pad = 70;
    this.layout.leftCenter = { x: pad, y: screenH - pad };
    this.layout.rightCenter = { x: screenW - pad, y: screenH - pad };
    this.layout.joyRadius = 62;
    this.layout.knobRadius = 24;
    const btnW = 120;
    const btnH = 52;
    this.layout.attackRect = {
      x: (screenW - btnW) / 2,
      y: screenH - btnH - 16,
      w: btnW,
      h: btnH,
    };
  }

  onTouchStart(e) {
    if (!this.isTouch) return;
    e.preventDefault();
    const r = this.canvas.getBoundingClientRect();
    for (const t of Array.from(e.changedTouches)) {
      const x = (t.clientX - r.left);
      const y = (t.clientY - r.top);
      if (this.isInRect(x, y, this.layout.attackRect) && this.attackId === null) {
        this.attackId = t.identifier;
        this.attackDown = true;
        continue;
      }
      if (x < this.layout.screenW * 0.5 && this.leftId === null) {
        this.leftId = t.identifier;
        this.updateMove(x, y);
        continue;
      }
      if (x >= this.layout.screenW * 0.5 && this.rightId === null) {
        this.rightId = t.identifier;
        this.updateLook(x, y);
      }
    }
  }

  onTouchMove(e) {
    if (!this.isTouch) return;
    e.preventDefault();
    const r = this.canvas.getBoundingClientRect();
    for (const t of Array.from(e.changedTouches)) {
      const x = (t.clientX - r.left);
      const y = (t.clientY - r.top);
      if (t.identifier === this.leftId) this.updateMove(x, y);
      if (t.identifier === this.rightId) this.updateLook(x, y);
    }
  }

  onTouchEnd(e) {
    if (!this.isTouch) return;
    e.preventDefault();
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === this.leftId) {
        this.leftId = null;
        this.moveActive = false;
        this.moveVec.x = 0;
        this.moveVec.y = 0;
      }
      if (t.identifier === this.rightId) {
        this.rightId = null;
        this.lookActive = false;
        this.lookVec.x = 0;
        this.lookVec.y = 0;
      }
      if (t.identifier === this.attackId) {
        this.attackId = null;
        this.attackDown = false;
      }
    }
  }

  updateMove(x, y) {
    const c = this.layout.leftCenter;
    const dx = x - c.x;
    const dy = y - c.y;
    const r = this.layout.joyRadius;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;
    const m = Math.min(d, r) / r;
    this.moveVec.x = nx * m;
    this.moveVec.y = ny * m;
    this.moveActive = true;
  }

  updateLook(x, y) {
    const c = this.layout.rightCenter;
    const dx = x - c.x;
    const dy = y - c.y;
    const r = this.layout.joyRadius;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;
    const m = Math.min(d, r) / r;
    this.lookVec.x = nx * m;
    this.lookVec.y = ny * m;
    this.lookActive = true;
    this.lookAngle = Math.atan2(dy, dx);
  }

  isInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }
}
