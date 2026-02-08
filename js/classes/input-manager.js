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
  }

  /**
   * @param {number} dpr
   */
  setDPR(dpr) {
    this.dpr = dpr;
  }
}
