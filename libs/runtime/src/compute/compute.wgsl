struct Camera {
  position: vec3f,
  mode: f32,
  cameraTarget: vec3f,
  parameter: f32,
};

struct Material {
	color: vec4f,
};

struct Ray {
  origin: vec3f,
  direction: vec3f,
};

fn intersectsAabb(
  ray: Ray,
  minBounds: vec3f,
  maxBounds: vec3f,
) -> bool {
  let inverseDirection = 1.0 / ray.direction;

  let t0 = (minBounds - ray.origin) * inverseDirection;
  let t1 = (maxBounds - ray.origin) * inverseDirection;

  let tMin = min(t0, t1);
  let tMax = max(t0, t1);

  let near = max(tMin.x, max(tMin.y, tMin.z));
  let far = min(tMax.x, min(tMax.y, tMax.z));

  return far >= max(near, 0.0);
}

fn createCameraRay(
  pixel: vec2u,
  resolution: vec2u,
) -> Ray {
  let uv = (vec2f(pixel) + vec2f(0.5)) / vec2f(resolution);

  let screen = uv * 2.0 - 1.0;

  let aspect = f32(resolution.x) / f32(resolution.y);

  let cameraPosition = camera.position;
  let cameraTarget = camera.cameraTarget;
  let scale = camera.parameter;

  let forward = normalize(cameraTarget - cameraPosition);

  let worldUp = vec3f(0.0, 1.0, 0.0);

  let right = normalize(cross(forward, worldUp));
  let up = normalize(cross(right, forward));

  let origin =
    cameraPosition +
    right * screen.x * aspect * scale +
    up * -screen.y * scale;

  return Ray(
    origin,
    forward,
  );
}

fn childMinFromIndex(index: u32) -> vec3f {
  let x = f32(index & 1u);
  let y = f32((index >> 1u) & 1u);
  let z = f32((index >> 2u) & 1u);

  return vec3f(x, y, z);
}

override WORKGROUP_SIZE: u32;
override IMAGE_WIDTH: u32;
override IMAGE_HEIGHT: u32;

@group(0)
@binding(0)
var inputTexture: texture_2d<f32>;

@group(0)
@binding(1)
var outputTexture: texture_storage_2d<rgba8unorm, write>;

@group(1)
@binding(0)
var<uniform> camera: Camera;

@group(2)
@binding(0)
var<storage, read> voxels: array<u32>;

@group(2)
@binding(1)
var<storage, read> materials: array<Material>;

@compute
@workgroup_size(WORKGROUP_SIZE, WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) pixel: vec3u) {
  let resolution = vec2(IMAGE_WIDTH, IMAGE_HEIGHT);

  let ray = createCameraRay(pixel.xy, resolution);

  var color = vec4f(0);

  let root = voxels[0];
  let firstChild = root & 0x3fffffffu;

  for (var i = 0u; i < 8u; i++) {
    let node = voxels[firstChild + i];
    let nodeType = node >> 30u;

    if nodeType == 2u {
      let childMin = childMinFromIndex(i);
      let childMax = childMin + vec3f(1.0);

      if intersectsAabb(ray, childMin, childMax) {
        let materialIndex = node & 0x3fffffffu;
        color = materials[materialIndex].color;
      }
    }
  }

  textureStore(outputTexture, pixel.xy, color);
}
