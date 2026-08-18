struct AabbHit {
  found: bool,
  distance: f32,
  normal: vec3f,
};

fn intersectAabb(
  ray: Ray,
  minBounds: vec3f,
  maxBounds: vec3f,
) -> AabbHit {
  let inverseDirection = 1.0 / ray.direction;

  let t0 = (minBounds - ray.origin) * inverseDirection;
  let t1 = (maxBounds - ray.origin) * inverseDirection;

  let tMin = min(t0, t1);
  let tMax = max(t0, t1);

  let near = max(tMin.x, max(tMin.y, tMin.z));
  let far = min(tMax.x, min(tMax.y, tMax.z));

  if far < max(near, 0.0) {
    return AabbHit(false, -1.0, vec3f(0));
  }

  var normal = vec3f(0);

  if near == tMin.x {
    normal = vec3f(-sign(ray.direction.x), 0, 0);
  } else if near == tMin.y {
    normal = vec3f(0, -sign(ray.direction.y), 0);
  } else {
    normal = vec3f(0, 0, -sign(ray.direction.z));
  }

  return AabbHit(true, max(near, 0), normal);
}
