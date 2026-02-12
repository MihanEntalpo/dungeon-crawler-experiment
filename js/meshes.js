"use strict";

/**
 * Global registry of polyhedron meshes used by PolyHedronDrawer.
 * Concrete meshes are registered by scripts in js/meshes/polyhedra/*.js.
 */
const POLY_MESHES = {};

/**
 * Registers a mesh in the global registry.
 * @param {string} name
 * @param {{verts: Array, faces: Array}} mesh
 */
function registerPolyMesh(name, mesh) {
  if (!name || typeof name !== "string") {
    throw new Error("registerPolyMesh: name must be a non-empty string");
  }
  if (!mesh || !Array.isArray(mesh.verts) || !Array.isArray(mesh.faces)) {
    throw new Error(`registerPolyMesh: invalid mesh for \"${name}\"`);
  }
  POLY_MESHES[name] = mesh;
}

if (typeof window !== "undefined") {
  window.POLY_MESHES = POLY_MESHES;
  window.registerPolyMesh = registerPolyMesh;
}
