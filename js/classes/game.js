"use strict";

class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas, mapData = null, entityData = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.W = DEFAULT_W;
    this.H = DEFAULT_H;
    this.DPR = DEFAULT_DPR;

    this.banner = document.getElementById("banner");
    this.fogEnabled = true;

    this.input = new InputManager(canvas);
    this.camera = new Camera();

    const data = mapData || DungeonGenerator.generate(CELLS_W, CELLS_H);
    this.map = new GameMap(data);
    this.fog = new FogOfWar(this.map);
    this.entities = new EntityManager();
    this.world = new World(this.map, this.fog, this.entities);
    this.world.input = this.input;
    this.world.camera = this.camera;

    const startTile = this.map.findNearestFloorTile(Math.floor(this.map.w / 2), Math.floor(this.map.h / 2));
    const exitTile = this.map.findNearestFloorTile(this.map.w - 2, this.map.h - 2);
    this.exitTile = exitTile;

    const playerSpawn = {
      x: (startTile.tx + 0.5) * TILE,
      y: (startTile.ty + 0.5) * TILE,
      hp: 120,
      hpMax: 120,
    };
    const playerData = entityData?.player || null;
    const playerInit = playerData ? {
      x: playerData.x ?? playerSpawn.x,
      y: playerData.y ?? playerSpawn.y,
      hp: playerData.hp ?? playerSpawn.hp,
      hpMax: playerSpawn.hpMax,
    } : playerSpawn;
    this.player = new Player(playerInit);
    this.world.setPlayer(this.player);
    this.world.hud = new HUD(this.player, this.input);

    this.enemies = [];
    const enemiesData = entityData?.enemies || null;
    if (Array.isArray(enemiesData) && enemiesData.length > 0) {
      for (const e of enemiesData) {
        const type = this.getMobTypeByName(e.type) || this.pickMobType();
        const enemy = new Enemy({ x: e.x, y: e.y, type });
        if (typeof e.hp === "number") enemy.hp = Math.max(0, Math.min(type.hp, e.hp));
        this.enemies.push(enemy);
        this.world.addEnemy(enemy);
      }
    } else {
      for (let i = 0; i < MOB_COUNT; i++) {
        const p = this.randomFloorPosFarFromPlayer(380);
        const enemy = new Enemy({ x: p.x, y: p.y, type: this.pickMobType() });
        this.enemies.push(enemy);
        this.world.addEnemy(enemy);
      }
    }

    this.fog.explored[this.map.idx(startTile.tx, startTile.ty)] = 1;

    const screenW = this.W / this.DPR;
    const screenH = this.H / this.DPR;
    const worldW = this.map.w * TILE;
    const worldH = this.map.h * TILE;
    const { tx, ty } = this.camera.computeTarget(this.player, this.input, screenW, screenH, worldW, worldH);
    this.camera.x = tx;
    this.camera.y = ty;

    this.last = performance.now();
    this.paused = false;

    window.addEventListener("resize", () => this.resize());
    this.resize();
  }

  resize() {
    this.DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.W = Math.floor(innerWidth * this.DPR);
    this.H = Math.floor(innerHeight * this.DPR);
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.input.setDPR(this.DPR);
    this.input.setScreen(this.W / this.DPR, this.H / this.DPR, this.DPR);
  }

  pickMobType() {
    const r = Math.random();
    if (r < 0.55) return MOB_TYPES[0];
    if (r < 0.85) return MOB_TYPES[1];
    return MOB_TYPES[2];
  }

  /**
   * @param {string} name
   * @returns {{name:string,color:string,hp:number,dmg:number,speed:number,aggro:number}|null}
   */
  getMobTypeByName(name) {
    for (const t of MOB_TYPES) if (t.name === name) return t;
    return null;
  }

  randomFloorPosFarFromPlayer(minDist) {
    for (let tries = 0; tries < 6000; tries++) {
      const tx = rndInt(0, this.map.w - 1);
      const ty = rndInt(0, this.map.h - 1);
      if (!this.map.isFloor(tx, ty)) continue;
      const x = (tx + 0.5) * TILE;
      const y = (ty + 0.5) * TILE;
      if (hypot(x - this.player.x, y - this.player.y) < minDist) continue;
      return { x, y };
    }
    return { x: this.player.x + minDist, y: this.player.y };
  }

  update(dt) {
    const camX0 = this.camera.x;
    const camY0 = this.camera.y;

    this.world.update(dt);

    if (this.fogEnabled) this.fog.computeVisibility(this.player);

    this.player.applyAttack(this.world);

    for (const m of this.enemies) {
      if (m.hp <= 0) continue;
      Collision.resolveCircleVsCircle(this.player, m);
    }

    const screenW = this.W / this.DPR;
    const screenH = this.H / this.DPR;
    const worldW = this.map.w * TILE;
    const worldH = this.map.h * TILE;
    this.camera.update(dt, this.player, this.input, screenW, screenH, worldW, worldH);

    const ex = (this.exitTile.tx + 0.5) * TILE;
    const ey = (this.exitTile.ty + 0.5) * TILE;
    if (this.fogEnabled && hypot(this.player.x - ex, this.player.y - ey) < 22) {
      this.fogEnabled = false;
      this.fog.explored.fill(1);
      this.banner.classList.add("show");
    }
  }

  render() {
    const screenW = this.W / this.DPR;
    const screenH = this.H / this.DPR;

    this.world.render(this.ctx, this.camera.x, this.camera.y, screenW, screenH, this.DPR);

    const ex = (this.exitTile.tx + 0.5) * TILE;
    const ey = (this.exitTile.ty + 0.5) * TILE;
    this.ctx.save();
    this.ctx.translate((ex - this.camera.x) * this.DPR, (ey - this.camera.y) * this.DPR);
    this.ctx.fillStyle = "rgba(124,255,178,0.20)";
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 16 * this.DPR, 0, TAU);
    this.ctx.fill();
    this.ctx.strokeStyle = "rgba(124,255,178,0.85)";
    this.ctx.lineWidth = 2 * this.DPR;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 10 * this.DPR, 0, TAU);
    this.ctx.stroke();
    this.ctx.restore();

    this.fog.draw(this.ctx, this.camera.x, this.camera.y, screenW, screenH, this.DPR, this.fogEnabled);
    if (this.world.hud) this.world.hud.render(this.ctx, screenW, screenH, this.DPR);

    if (this.player.hp <= 0) {
      this.ctx.fillStyle = "rgba(0,0,0,0.55)";
      this.ctx.fillRect(0, 0, this.W, this.H);
      this.ctx.fillStyle = "rgba(230,235,245,0.95)";
      this.ctx.font = `${28 * this.DPR}px system-ui, sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("GAME OVER", this.W / 2, this.H / 2 - 10 * this.DPR);
      this.ctx.font = `${14 * this.DPR}px system-ui, sans-serif`;
      this.ctx.fillStyle = "rgba(230,235,245,0.75)";
      this.ctx.fillText("Обновление страницы перезапускает прототип.", this.W / 2, this.H / 2 + 22 * this.DPR);
    }
  }

  frame(now) {
    if (this.paused) return;
    const dt = clamp((now - this.last) / 1000, 0, 0.033);
    this.last = now;

    this.update(dt);
    this.render();

    if (this.player.hp > 0) requestAnimationFrame((t) => this.frame(t));
  }

  run() {
    this.canvas.tabIndex = 0;
    requestAnimationFrame((t) => this.frame(t));
  }

  resume() {
    this.paused = false;
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }
}
