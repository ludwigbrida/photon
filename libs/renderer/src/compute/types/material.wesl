/**
 * Defines the surface and light interaction properties of a voxel.
 *
 * The renderer uses these properties to determine e.g. the color of reflected light, whether the
 * surface behaves diffusely or as a mirror, etc.
 */
struct Material {
  /**
   * The base color used to tint reflected light.
   *
   * It affects both, diffuse and metallic reflections.
   */
  color: vec3f,

  /**
   * The balance between diffuse and ideal metallic reflection.
   *
   * `0` produces a fully diffuse Lambert surface, while `1` produces a perfectly smooth mirror.
   * Values between blend the two behaviors.
   *
   * It is expected to be within the range [0, 1].
   */
  metallic: f32,

  /**
   * The light emitted by the material.
   *
   * It is emitted radiance, so its components may be greater than `1`.
   */
  emission: vec3f,
}
