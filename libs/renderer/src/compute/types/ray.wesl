/**
 * Defines a path for tracing through the scene.
 *
 * Rays start at a point and extend infinitely in one direction.
 * Rendering calculations use rays to determine which surfaces are visible along a path.
 */
struct Ray {
  // The world-space position from which the ray is emitted.
  origin: vec3f,
  // The direction in which the ray travels.
  // It should generally be normalized before construction. This keeps distance-based calculations
  // consistent and avoids visual artifacts caused by the direction's magnitude.
  direction: vec3f,
}
