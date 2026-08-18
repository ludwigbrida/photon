struct Camera {
  position: vec3f,
  mode: f32,
  cameraTarget: vec3f,
  parameter: f32,
};

fn createCameraRay(
  pixel: vec2u,
  resolution: vec2u,
) -> Ray {
  let uv = (vec2f(pixel) + vec2f(0.5)) / vec2f(resolution);

  let screen = uv * 2.0 - 1.0;

  let aspect = f32(resolution.x) / f32(resolution.y);

  let cameraPosition = camera.position;
  let mode = u32(camera.mode);
  let cameraTarget = camera.cameraTarget;
  let parameter = camera.parameter;

  let forward = normalize(cameraTarget - cameraPosition);

  let worldUp = vec3f(0.0, 1.0, 0.0);

  let right = normalize(cross(forward, worldUp));
  let up = normalize(cross(right, forward));

  if mode == 0u {
    let scale = parameter;

    let origin =
      cameraPosition +
      right * screen.x * aspect * scale +
      up * -screen.y * scale;

    return Ray(
      origin,
      forward,
    );
  }

  let fov = parameter;
  let halfHeight = tan(fov * 0.5);

  let direction = normalize(
    forward +
    right * screen.x * aspect * halfHeight +
    up * -screen.y * halfHeight,
  );

  return Ray(
    cameraPosition,
    direction,
  );
}
