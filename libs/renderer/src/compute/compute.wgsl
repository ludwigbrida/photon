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

const NODE_TYPE_EMPTY = 0u;
const NODE_TYPE_BRANCH = 1u;
const NODE_TYPE_LEAF = 2u;

fn nodeType(node: u32) -> u32 {
  return node >> 30u;
}

fn nodePayload(node: u32) -> u32 {
  return node & 0x3fffffffu;
}

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

fn childMinFromIndex(index: u32) -> vec3f {
  let x = f32(index & 1u);
  let y = f32((index >> 1u) & 1u);
  let z = f32((index >> 2u) & 1u);

  return vec3f(x, y, z);
}

fn childBounds(
  parentMin: vec3f,
  parentMax: vec3f,
  childIndex: u32,
) -> array<vec3f, 2> {
  let center = (parentMin + parentMax) * 0.5;

  let xHigh = (childIndex & 1u) != 0u;
  let yHigh = (childIndex & 2u) != 0u;
  let zHigh = (childIndex & 4u) != 0u;

  let childMin = vec3f(
    select(parentMin.x, center.x, xHigh),
    select(parentMin.y, center.y, yHigh),
    select(parentMin.z, center.z, zHigh),
  );

  let childMax = vec3f(
    select(center.x, parentMax.x, xHigh),
    select(center.y, parentMax.y, yHigh),
    select(center.z, parentMax.z, zHigh),
  );

  return array<vec3f, 2>(
    childMin,
    childMax,
  );
}

override WORKGROUP_SIZE: u32;
override IMAGE_WIDTH: u32;
override IMAGE_HEIGHT: u32;
override OCTREE_DEPTH: u32;

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

  var nodeIndex = 0u;

  var nodeMin = vec3f(0.0);
  var nodeMax = vec3f(f32(1u << OCTREE_DEPTH));

  for (var level = 0u; level < OCTREE_DEPTH; level++) {
    let node = voxels[nodeIndex];

    if nodeType(node) != NODE_TYPE_BRANCH {
      break;
    }

    let firstChild = nodePayload(node);

    var foundChild = false;

    for (var i = 0u; i < 8u; i++) {
      let childIndex = firstChild + i;
      let child = voxels[childIndex];

      if nodeType(child) == NODE_TYPE_EMPTY {
        continue;
      }

      let bounds = childBounds(
        nodeMin,
        nodeMax,
        i,
      );

      let childMin = bounds[0];
      let childMax = bounds[1];

      if !intersectsAabb(
        ray,
        childMin,
        childMax,
      ) {
        continue;
      }

      if nodeType(child) == NODE_TYPE_LEAF {
        let materialIndex = nodePayload(child);
        color = materials[materialIndex].color;
        foundChild = true;
        break;
      }

      nodeIndex = childIndex;
      nodeMin = childMin;
      nodeMax = childMax;

      foundChild = true;
      break;
    }

    if !foundChild {
      break;
    }
  }

  textureStore(outputTexture, pixel.xy, color);
}
