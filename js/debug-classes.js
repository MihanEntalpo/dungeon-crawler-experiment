(async () => {
  "use strict";

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });
  const seedInput = document.getElementById("seedInput");
  const regenBtn = document.getElementById("regenBtn");
  const rotateToggle = document.getElementById("rotateToggle");
  const polyPanel = document.getElementById("debugPolyPanel");
  const polyEulerDump = document.getElementById("polyEulerDump");

  const SEED_KEY = "debug_seed";
  const ROTATE_KEY = "debug_rotate";
  const POLY_EULER_KEY = "debug_poly_euler";
  localforage.config({ name: "dungeon-crawler-experiment", storeName: "debug" });

  let W = 1280, H = 720, DPR = 1;
  function resize() {
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    W = Math.floor(innerWidth * DPR);
    H = Math.floor(innerHeight * DPR);
    canvas.width = W;
    canvas.height = H;
  }
  window.addEventListener("resize", resize);

  let current = null;
  let rotating = false;
  let polyRotation = 0;
  let polyPitch = 0;
  let polyYaw = 0;

  function seedToUint(seed) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function withSeed(seed, fn) {
    const old = Math.random;
    Math.random = mulberry32(seedToUint(seed));
    try {
      return fn();
    } finally {
      Math.random = old;
    }
  }

  function randomColor(rng) {
    const h = Math.floor(rng() * 360);
    return `hsl(${h}, 70%, 60%)`;
  }

  function generatePolyhedrons(rng, map) {
    const names = PolyHedronDrawer.allowedNames;
    const items = [];
    const startX = 1;
    const startY = 16;
    for (let i = 0; i < names.length; i++) {
      const x = startX + i;
      const y = startY;
      if (x >= map.w - 1) break;
      const drawer = new PolyHedronDrawer({
        name: names[i],
        color: randomColor(rng),
        rotation: 0,
        euler: { x: 0, y: 0, z: 0 },
      });
      items.push({
        name: names[i],
        drawer,
        x: (x + 0.5) * TILE,
        y: (y + 0.5) * TILE,
        rotation: 0,
        euler: { x: 0, y: 0, z: 0 },
        userEuler: { x: 0, y: 0, z: 0 },
      });
    }
    return items;
  }

  function generateScene(seed) {
    return withSeed(seed, () => {
      const rng = Math.random;
      const data = DungeonGenerator.generate(20, 14);
      const map = new GameMap(data);
      const entityManager = new EntityManager();

      const start = map.findNearestFloorTile(Math.floor(map.w / 2), Math.floor(map.h / 2));
      const player = new Player({
        x: (start.tx + 0.5) * TILE,
        y: (start.ty + 0.5) * TILE,
        hp: 120,
        hpMax: 120,
      });
      entityManager.add(player);

      const enemySpawns = [
        { dx: 4, dy: 2, type: MOB_TYPES[0] },
        { dx: -3, dy: -2, type: MOB_TYPES[1] },
        { dx: 6, dy: -4, type: MOB_TYPES[2] },
      ];
      for (const s of enemySpawns) {
        const enemy = new Enemy({
          x: (start.tx + s.dx + 0.5) * TILE,
          y: (start.ty + s.dy + 0.5) * TILE,
          type: s.type,
        });
        entityManager.add(enemy);
      }

      const polyhedrons = generatePolyhedrons(rng, map);

      return { map, entityManager, player, polyhedrons };
    });
  }

  function renderCurrent() {
    if (!current) return;
    const screenW = W / DPR;
    const screenH = H / DPR;
    current.map.draw(ctx, 0, 0, screenW, screenH, DPR);
    current.entityManager.render(ctx, 0, 0, DPR);

    for (const p of current.polyhedrons) {
      p.drawer.rotation = p.rotation;
      p.drawer.euler = p.euler;
      p.drawer.render(ctx, p, 0, 0, DPR);
    }
  }

  function frame() {
    if (rotating && current) {
      current.player.facing += 0.02;
      for (const ent of current.entityManager.entities) {
        if (ent instanceof Enemy) ent.facing += 0.02;
      }
      polyRotation += 0.02;
      polyPitch += 0.015;
      polyYaw += 0.017;
      for (const p of current.polyhedrons) {
        p.rotation = polyRotation;
        p.euler = {
          x: p.userEuler.x + polyPitch,
          y: p.userEuler.y + polyYaw,
          z: p.userEuler.z + polyRotation,
        };
      }
      renderCurrent();
    }
    requestAnimationFrame(frame);
  }

  const savedSeed = (await localforage.getItem(SEED_KEY)) || "1";
  const savedRotate = (await localforage.getItem(ROTATE_KEY)) || false;
  const savedPolyEuler = (await localforage.getItem(POLY_EULER_KEY)) || {};
  seedInput.value = savedSeed;
  rotateToggle.checked = !!savedRotate;
  rotating = !!savedRotate;

  function buildPolyPanel() {
    polyPanel.innerHTML = "";
    if (!current) return;
    for (const p of current.polyhedrons) {
      const saved = savedPolyEuler[p.name];
      if (saved) {
        p.userEuler = {
          x: (saved.x || 0) * Math.PI / 180,
          y: (saved.y || 0) * Math.PI / 180,
          z: (saved.z || 0) * Math.PI / 180,
        };
        p.euler = { ...p.userEuler };
      }
      const row = document.createElement("div");
      row.className = "polyRow";
      const title = document.createElement("b");
      title.textContent = p.name;
      row.appendChild(title);

      const angles = document.createElement("div");
      angles.className = "polyAngles";
      const inputs = ["x", "y", "z"].map((axis) => {
        const input = document.createElement("input");
        input.type = "number";
        input.step = "1";
        input.value = (saved && typeof saved[axis] === "number") ? saved[axis] : "0";
        input.placeholder = axis.toUpperCase();
        input.addEventListener("input", () => {
          const deg = parseFloat(input.value || "0");
          p.userEuler[axis] = (deg * Math.PI) / 180;
          savedPolyEuler[p.name] = {
            x: Math.round((p.userEuler.x * 180) / Math.PI),
            y: Math.round((p.userEuler.y * 180) / Math.PI),
            z: Math.round((p.userEuler.z * 180) / Math.PI),
          };
          localforage.setItem(POLY_EULER_KEY, savedPolyEuler);
          updateEulerDump();
          if (!rotating) {
            p.euler = { ...p.userEuler };
            renderCurrent();
          }
        });
        return input;
      });
      for (const input of inputs) angles.appendChild(input);
      row.appendChild(angles);
      polyPanel.appendChild(row);
    }
    updateEulerDump();
  }

  function updateEulerDump() {
    if (!polyEulerDump || !current) return;
    const lines = current.polyhedrons.map((p) => {
      const saved = savedPolyEuler[p.name];
      const x = (saved && typeof saved.x === "number")
        ? saved.x
        : Math.round((p.userEuler.x * 180) / Math.PI);
      const y = (saved && typeof saved.y === "number")
        ? saved.y
        : Math.round((p.userEuler.y * 180) / Math.PI);
      const z = (saved && typeof saved.z === "number")
        ? saved.z
        : Math.round((p.userEuler.z * 180) / Math.PI);
      return `${p.name}: ${x}, ${y}, ${z}`;
    });
    polyEulerDump.value = lines.join("\n");
  }

  function regenerate() {
    const seed = seedInput.value.trim() || "1";
    localforage.setItem(SEED_KEY, seed);
    current = generateScene(seed);
    buildPolyPanel();
    renderCurrent();
  }

  regenBtn.addEventListener("click", regenerate);
  rotateToggle.addEventListener("change", () => {
    rotating = rotateToggle.checked;
    localforage.setItem(ROTATE_KEY, rotating);
    if (!rotating && current) {
      for (const p of current.polyhedrons) p.euler = { ...p.userEuler };
      renderCurrent();
    }
  });

  resize();
  regenerate();
  requestAnimationFrame(frame);
})();
