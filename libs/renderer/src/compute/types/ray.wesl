/**
 * Defines a path for tracing through the scene.
 *
 * Rays start at a point and extend infinitely in one direction. Rendering calculations follow rays
 * to determine which surfaces are visible along a path.
 */
struct Ray {
  /**
   * The world-space position from which the ray is emitted.
   */
  origin: vec3f,

  /**
   * The direction in which the ray travels.
   *
   * Valid rays must use a normalized direction. A unit-length direction keeps distance-based
   * calculations independent of the vector's magnitude, preventing visual artifacts.
   */
  direction: vec3f,
}
