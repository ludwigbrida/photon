/**
 * Identifies the projection used to generate camera rays.
 */
const PROJECTION_ORTHOGRAPHIC = 0u;
const PROJECTION_PERSPECTIVE = 1u;

/**
 * Identifies the kind of data stored in an octree node.
 */
const OCTREE_NODE_EMPTY = 0u;
const OCTREE_NODE_BRANCH = 1u;
const OCTREE_NODE_LEAF = 2u;

/**
 * The distance used to offset a ray origin from a surface.
 *
 * It prevents a newly spawned ray from immediately intersecting its source surface because of
 * floating-point precision errors.
 */
const BIAS = 0.001f;

/**
 * The ratio of a circle's circumference to its diameter.
 *
 * Used as a base value to derive angular constants.
 */
const PI = 3.141592653589793;

/**
 * The reciprocal of π.
 *
 * Used by the Lambert diffuse BRDF to conserve reflected light energy.
 */
const INV_PI = 1.0 / PI;

/**
 * The angle of one full rotation in radians.
 *
 * Used when sampling an azimuth angle around a surface normal.
 */
const TWO_PI = 2.0 * PI;
