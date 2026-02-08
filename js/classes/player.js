"use strict";

class Player extends Actor {
  constructor(opts = {}) {
    super(opts);
    this.inventory = opts.inventory || [];
  }

  handleInput(_input) {}
  interact(_target) {}
}
