"use strict";

/**
 * Mesh data for polyhedron "tetrahedron".
 */
registerPolyMesh("tetrahedron", {
  "default_euler": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "verts": [
    {
      "x": 1,
      "y": 1,
      "z": 1
    },
    {
      "x": -1,
      "y": -1,
      "z": 1
    },
    {
      "x": -1,
      "y": 1,
      "z": -1
    },
    {
      "x": 1,
      "y": -1,
      "z": -1
    }
  ],
  "faces": [
    [
      0,
      1,
      2
    ],
    [
      0,
      3,
      1
    ],
    [
      0,
      2,
      3
    ],
    [
      1,
      3,
      2
    ]
  ]
});
