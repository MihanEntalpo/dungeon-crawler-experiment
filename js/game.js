(async () => {
  "use strict";

  const canvas = document.getElementById("c");
  const menu = document.getElementById("menu");
  const btnNew = document.getElementById("btnNew");
  const btnLoad = document.getElementById("btnLoad");
  const pause = document.getElementById("pause");
  const btnResume = document.getElementById("btnResume");

  localforage.config({ name: "dungeon-crawler-experiment", storeName: "save" });

  let cachedMap = null;
  let cachedEntities = null;
  let game = null;

  try {
    cachedMap = await localforage.getItem("map_v1");
    cachedEntities = await localforage.getItem("entities_v1");
  } catch (_err) {
    cachedMap = null;
    cachedEntities = null;
  }

  if (!cachedMap) btnLoad.disabled = true;

  async function enterFullscreenIfMobile() {
    const isTouch = ("ontouchstart" in window)
      || (navigator.maxTouchPoints > 0)
      || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    if (!isTouch) return;
    try {
      await document.documentElement.requestFullscreen?.();
    } catch (_err) {
      // ignore fullscreen errors
    }
  }

  async function startGame(mapData, entityData) {
    menu.classList.add("hidden");
    pause.classList.add("hidden");
    await enterFullscreenIfMobile();
    game = new Game(canvas, mapData, entityData);
    game.run();
  }

  function pauseGame() {
    if (!game) return;
    game.paused = true;
    pause.classList.remove("hidden");
  }

  async function resumeGame() {
    if (!game) return;
    pause.classList.add("hidden");
    await enterFullscreenIfMobile();
    game.resume();
    canvas.focus?.();
  }

  btnNew.addEventListener("click", async () => {
    const mapData = DungeonGenerator.generate(CELLS_W, CELLS_H);
    try {
      await localforage.setItem("map_v1", mapData);
      await localforage.removeItem("entities_v1");
    } catch (_err) {
      // ignore storage errors
    }
    startGame(mapData, null);
  });

  btnLoad.addEventListener("click", async () => {
    let mapData = cachedMap;
    let entityData = cachedEntities;
    if (!mapData) {
      try {
        mapData = await localforage.getItem("map_v1");
        entityData = await localforage.getItem("entities_v1");
      } catch (_err) {
        mapData = null;
      }
    }
    if (!mapData) return;
    startGame(mapData, entityData);
  });

  btnResume.addEventListener("click", () => resumeGame());

  window.addEventListener("blur", () => pauseGame());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseGame();
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) pauseGame();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!game) return;
    if (pause.classList.contains("hidden")) pauseGame();
    else resumeGame();
  });
})();
