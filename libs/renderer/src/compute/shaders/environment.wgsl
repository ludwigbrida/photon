/*
 * Describes the scene-wide surroundings of the world.
 */
struct Environment {
  // Unit vector from a shaded surface toward the sun.
  sunDirection: vec3f,
  // Brightness multiplier of direct sun illumination.
  sunIntensity: f32,
  // Color tint of direct sun illumination.
  sunColor: vec3f,
}
