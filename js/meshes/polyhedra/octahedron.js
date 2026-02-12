"use strict";

/**
 * Mesh data for polyhedron "octahedron".
 */
registerPolyMesh("octahedron", {
  "default_euler": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "verts": [
    {
      "x": 1,
      "y": 0,
      "z": 0
    },
    {
      "x": -1,
      "y": 0,
      "z": 0
    },
    {
      "x": 0,
      "y": 1,
      "z": 0
    },
    {
      "x": 0,
      "y": -1,
      "z": 0
    },
    {
      "x": 0,
      "y": 0,
      "z": 1
    },
    {
      "x": 0,
      "y": 0,
      "z": -1
    }
  ],
  "faces": [
    [
      4,
      0,
      2
    ],
    [
      4,
      2,
      1
    ],
    [
      4,
      1,
      3
    ],
    [
      4,
      3,
      0
    ],
    [
      5,
      2,
      0
    ],
    [
      5,
      1,
      2
    ],
    [
      5,
      3,
      1
    ],
    [
      5,
      0,
      3
    ]
  ]
});
