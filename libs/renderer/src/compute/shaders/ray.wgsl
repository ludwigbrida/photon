/*
 * Represents a ray traveling through the scene.
 */
struct Ray {
  // The point in 3D space where the ray starts.
  origin: vec3f,

  // The direction in which the ray travels.
  // This should usually be normalized to have a length of 1.
  direction: vec3f,
};

/**
 * Calculates the position of a point along a ray at a given distance.
 */
fn rayAtDistance(
  ray: Ray,
  distance: f32,
) -> vec3f {
  return ray.origin + ray.direction * distance;
}
