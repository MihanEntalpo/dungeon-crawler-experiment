"use strict";

// ---------- Utils ----------
/**
 * Ограничивает значение v диапазоном [a, b].
 *
 * @param {number} v - Исходное значение.
 * @param {number} a - Нижняя граница.
 * @param {number} b - Верхняя граница.
 * @returns {number} Ограниченное значение.
 */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * Линейная интерполяция между a и b.
 *
 * @param {number} a - Начальное значение.
 * @param {number} b - Конечное значение.
 * @param {number} t - Параметр интерполяции [0..1].
 * @returns {number} Интерполированное значение.
 */
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Ссылка на Math.hypot для краткости.
 *
 * @type {(x: number, y: number) => number}
 */
const hypot = Math.hypot;

/**
 * Константа 2π.
 *
 * @type {number}
 */
const TAU = Math.PI * 2;

/**
 * Возвращает целое число в диапазоне [a, b] включительно.
 *
 * @param {number} a - Нижняя граница (включительно).
 * @param {number} b - Верхняя граница (включительно).
 * @returns {number} Случайное целое из [a, b].
 */
function rndInt(a, b) { return (a + Math.floor(Math.random() * (b - a + 1))); }

/**
 * Детерминированный хеш для целочисленных координат (вариация тайлов).
 *
 * @param {number} x - Координата по X.
 * @param {number} y - Координата по Y.
 * @returns {number} Беззнаковый 32-битный хеш.
 */
function hash2(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

/**
 * Находит минимальную подписанную разницу между углами (в радианах).
 *
 * @param {number} a - Угол A в радианах.
 * @param {number} b - Угол B в радианах.
 * @returns {number} Разница в диапазоне [-PI, PI].
 */
function angleDiff(a, b) {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}
