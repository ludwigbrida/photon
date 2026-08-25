/**
 * Defines the procedural sky visible behind the scene.
 *
 * When a ray does not intersect a voxel, the sky color is interpolated between the horizon and
 * zenith according to the ray's upward-facing direction.
 */
struct Sky {
  /**
   * The color of the sky at the horizon.
   *
   * Used for rays that travel parallel to the ground.
   */
  horizonColor: vec3f,

  /**
   * Controls how quickly the sky transitions from the horizon to the zenith.
   *
   * Larger values keep the horizon color visible farther above the horizon and concentrate the
   * zenith color near the top of the sky.
   *
   * It must be greater than zero.
   */
  horizonFalloff: f32,

  /**
   * The color of the sky directly overhead.
   *
   * Used for rays the point straight upward.
   */
  zenithColor: vec3f,
}
