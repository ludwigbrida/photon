/**
 * Defines the directional light emitted by the sun.
 *
 * The sun is treated as a distant light source, so its direction and radiance are the same
 * everywhere in the scene.
 */
struct Sun {
  /**
   * The world-space direction from a shaded surface toward the sun.
   *
   * It must be normalized so surface-facing and lighting calculations remain consistent.
   */
  sunDirection: vec3f,

  /**
   * The brightness of the sun's direct illumination.
   *
   * It scales `sunColor` and must be non-negative.
   */
  sunIntensity: f32,

  /**
   * The color of the sun's direct illumination.
   *
   * Its components represent radiance and may be greater than `1`.
   */
  sunColor: vec3f,

  /**
   * The apparent radius of the sun disc in radians.
   *
   * `0` models the sun as a single direction and produces hard shadows.
   * Larger values sample a wider disc and produce softer shadows.
   *
   * It must be non-negative.
   */
  sunAngularRadius: f32,
}
