"use strict";

// ---------- World / Map ----------
/**
 * Базовая ширина канваса (до масштабирования DPR).
 * @type {number}
 */
const DEFAULT_W = 1280;

/**
 * Базовая высота канваса (до масштабирования DPR).
 * @type {number}
 */
const DEFAULT_H = 720;

/**
 * Начальный device pixel ratio (обновляется в resize).
 * @type {number}
 */
const DEFAULT_DPR = 1;

/**
 * Размер тайла в пикселях.
 * @type {number}
 */
const TILE = 32;

/**
 * Ширина лабиринта в клетках (до проекции в тайлы).
 * @type {number}
 */
const CELLS_W = 56;

/**
 * Высота лабиринта в клетках (до проекции в тайлы).
 * @type {number}
 */
const CELLS_H = 46;

/**
 * Минимальное число комнат при генерации.
 * @type {number}
 */
const ROOM_MIN = 14;

/**
 * Делитель плотности комнат (чем больше — тем меньше комнат).
 * @type {number}
 */
const ROOM_DENSITY_DIV = 70;

/**
 * Вероятность открытия стены для формирования петель.
 * @type {number}
 */
const LOOP_PROB = 0.16;

/**
 * Количество проходов удаления тупиков.
 * @type {number}
 */
const DEAD_END_PASSES = 2;

// ---------- Mobs ----------
/**
 * Список типов мобов и их базовые параметры.
 * @type {{name:string,color:string,hp:number,dmg:number,speed:number,aggro:number}[]}
 */
const MOB_TYPES = [
  { name: "green",  color: "#6CFF9C", hp: 120, dmg: 10,  speed: 34, aggro: 210 },
  { name: "yellow", color: "#FFD36A", hp: 240, dmg: 20, speed: 40, aggro: 270 },
  { name: "red",    color: "#FF5566", hp: 480, dmg: 25, speed: 46, aggro: 400 },
];

/**
 * Количество мобов на карте.
 * @type {number}
 */
const MOB_COUNT = 100;

// ---------- Visibility ----------
/**
 * Дистанция видимости в пикселях.
 * @type {number}
 */
const VIS_DIST = 360;

/**
 * Количество лучей для вычисления видимости.
 * @type {number}
 */
const VIS_RAYS = 420;

/**
 * Шаг луча (в пикселях) при рейкасте видимости.
 * @type {number}
 */
const VIS_STEP = TILE / 6;
