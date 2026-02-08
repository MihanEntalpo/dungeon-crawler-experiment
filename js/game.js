(async () => {
  "use strict";

  const canvas = document.getElementById("c");
  const menu = document.getElementById("menu");
  const btnNew = document.getElementById("btnNew");
  const btnLoad = document.getElementById("btnLoad");

  localforage.config({ name: "dungeon-crawler-experiment", storeName: "save" });

  let cachedMap = null;
  let cachedEntities = null;

  try {
    cachedMap = await localforage.getItem("map_v1");
    cachedEntities = await localforage.getItem("entities_v1");
  } catch (_err) {
    cachedMap = null;
    cachedEntities = null;
  }

  if (!cachedMap) btnLoad.disabled = true;

  function startGame(mapData, entityData) {
    menu.classList.add("hidden");
    const game = new Game(canvas, mapData, entityData);
    game.run();
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
})();
