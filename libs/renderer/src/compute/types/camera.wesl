/**
 * Defines how rays are generated for a camera view.
 *
 * The camera provides a world-space position and orientation, then selects either an orthographic
 * projection, whose rays travel in parallel, or a perspective projection, whose rays diverge
 * from the camera position.
 */
struct Camera {
  // The camera's position in world space.
  //
  // In orthographic mode, it is the center of the view plane.
  // In perspective mode, it is the point from which all rays originate.
  position: vec3f,

  // The projection mode used to generate rays.
  //
  // 0: orthographic
  // 1: perspective
  projection: u32,

  // The camera's right-facing, world-space unit vector.
  //
  // It must form an orthonormal basis together with `up` and `forward` so that the view is not
  // stretched or skewed.
  right: vec3f,

  // The orthographic view's half-height in world-space units.
  //
  // Only used for orthographic projection.
  // It must be greater than zero. The width is derived from this value and the output aspect ratio.
  scale: f32,

  // The camera's upward-facing, world-space unit vector.
  //
  // It must form an orthonormal basis together with `right` and `forward` so that the view is not
  // stretched or skewed.
  up: vec3f,

  // The vertical field of view in radians.
  //
  // Only used for perspective projection.
  // It must be greater than zero and less than π radians to produce a valid, non-inverted
  // perspective view.
  fieldOfView: f32,

  // The camera's forward-facing, world-space unit vector.
  //
  // It must form an orthonormal basis together with `right` and `up` so that the view is not
  // stretched or skewed.
  // In orthographic projection, every ray travels in parallel to this direction.
  // In perspective projection, rays fan out around this direction.
  forward: vec3f,
}
