// -------------------------------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------------------------------

/**
 * Represents a ray traveling through the scene.
 */
struct Ray {
  // The point in 3D space where the ray starts.
  origin: vec3f,
  // The direction in which the ray travels.
  // This should usually be normalized to have a length of 1.
  direction: vec3f,
}

struct Material {
  color: vec4f,
}

struct Camera {
  // World-space origin of rays in perspective mode, and center of the image plane in orthographic mode.
  position: vec3f,
  // TODO
  projection: u32,
  // World-space camera-right unit vector.
  right: vec3f,
  orthographicScale: f32,
  // World-space camera-up unit vector.
  up: vec3f,
  // TODO
  // The vertical field of view in radians. Only used in perspective mode.
  verticalFov: f32,
  // World-space forward unit vector, pointing from the camera toward its target.
  // Perspective rays start at `position` and fan out around this direction.
  // Orthographic rays all use this same direction.
  forward: vec3f,
}

/**
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

struct AabbHit {
  found: bool,
  distance: f32,
  normal: vec3f,
}

struct TraversalEntry {
  nodeIndex: u32,
  minBounds: vec3f,
  maxBounds: vec3f,
  distance: f32,
  normal: vec3f,
}

/**
 * Represents a geometric ray-tracing result.
 */
struct Hit {
  // Whether the ray intersected a leaf voxel.
  found: bool,
  // Outward direction of the voxel face through which the ray entered.
  normal: vec3f,
  // Material buffer index of the voxel that was hit.
  materialIndex: u32,
}

// -------------------------------------------------------------------------------------------------
// Configuration
// -------------------------------------------------------------------------------------------------

override WORKGROUP_SIZE: u32;
override IMAGE_WIDTH: u32;
override IMAGE_HEIGHT: u32;
override OCTREE_DEPTH: u32;

// -------------------------------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------------------------------

const PROJECTION_ORTHOGRAPHIC = 0u;
const PROJECTION_PERSPECTIVE = 1u;

const OCTREE_NODE_EMPTY = 0u;
const OCTREE_NODE_BRANCH = 1u;
const OCTREE_NODE_LEAF = 2u;

// -------------------------------------------------------------------------------------------------
// Resources
// -------------------------------------------------------------------------------------------------

@group(0) @binding(0) var INPUT_TEXTURE: texture_2d<f32>;
@group(0) @binding(1) var OUTPUT_TEXTURE: texture_storage_2d<rgba8unorm, write>;

@group(1) @binding(0) var<uniform> CAMERA: Camera;

@group(2) @binding(0) var<uniform> ENVIRONMENT: Environment;

@group(3) @binding(0) var<storage, read> VOXELS: array<u32>;
@group(3) @binding(1) var<storage, read> MATERIALS: array<Material>;

// -------------------------------------------------------------------------------------------------
// Functions (split into domains)
// -------------------------------------------------------------------------------------------------

/**
 * Calculates the position of a point along a ray at a given distance.
 */
fn rayAtDistance(ray: Ray, distance: f32) -> vec3f {
  return ray.origin + ray.direction * distance;
}

/**
 * Creates the primary world-space ray for one output pixel.
 *
 * The pixel is sampled at its center, so every pixel maps to a symmetric region of the camera image plane.
 */
fn createCameraRay(pixel: vec2u, resolution: vec2u) -> Ray {
  // Convert the pixel coordinate into [0, 1] texture-like space.
  // Add a half-pixel offset to shoot the ray through its center rather than its top-left corner.
  let uv = (vec2f(pixel) + vec2f(0.5)) / vec2f(resolution);

  // Convert [0, 1] into normalized screen coordinates:
  // Bottom-left: (-1, -1)
  // Top-right: (1, 1)
  let screen = uv * 2.0 - 1.0;

  let aspectRatio = f32(resolution.x) / f32(resolution.y);
  let imagePlane = vec2f(screen.x * aspectRatio, -screen.y);

  switch (CAMERA.projection) {
    case PROJECTION_ORTHOGRAPHIC: {
      let origin =
        CAMERA.position
          + CAMERA.right * imagePlane.x * CAMERA.orthographicScale
          + CAMERA.up * imagePlane.y * CAMERA.orthographicScale;

      return Ray(origin, CAMERA.forward);
    }
    default: {
      let imagePlaneHalfHeight = tan(CAMERA.verticalFov * 0.5);

      let direction =
        normalize(
          CAMERA.forward
            + CAMERA.right * imagePlane.x * imagePlaneHalfHeight
            + CAMERA.up * imagePlane.y * imagePlaneHalfHeight,
        );

      return Ray(CAMERA.position, direction);
    }
  }
}

fn intersectAabb(ray: Ray, minBounds: vec3f, maxBounds: vec3f) -> AabbHit {
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

fn octreeNodeType(node: u32) -> u32 {
  return node >> 30u;
}

fn octreeNodePayload(node: u32) -> u32 {
  return node & 0x3fffffffu;
}

fn childBounds(parentMin: vec3f, parentMax: vec3f, childIndex: u32) -> array<vec3f, 2> {
  let center = (parentMin + parentMax) * 0.5;

  let xHigh = (childIndex & 1u) != 0u;
  let yHigh = (childIndex & 2u) != 0u;
  let zHigh = (childIndex & 4u) != 0u;

  let childMin =
    vec3f(
      select(parentMin.x, center.x, xHigh),
      select(parentMin.y, center.y, yHigh),
      select(parentMin.z, center.z, zHigh),
    );

  let childMax =
    vec3f(
      select(center.x, parentMax.x, xHigh),
      select(center.y, parentMax.y, yHigh),
      select(center.z, parentMax.z, zHigh),
    );

  return array<vec3f, 2>(childMin, childMax);
}

/**
 * Traverses the voxel octree and returns the closest leaf hit.
 */
fn traceRay(ray: Ray) -> Hit {
  let halfExtent = f32(1u << (OCTREE_DEPTH - 1u));
  let rootMin = vec3(-halfExtent - 0.5);
  let rootMax = vec3(halfExtent - 0.5);
  let rootHit = intersectAabb(ray, rootMin, rootMax);

  if !rootHit.found {
    return Hit(false, vec3f(0), 0u);
  }

  var stack: array<TraversalEntry, 128u>;
  var stackSize = 1u;

  stack[0] = TraversalEntry(0u, rootMin, rootMax, rootHit.distance, rootHit.normal);

  loop {
    if stackSize == 0u {
      break;
    }

    var nearestIndex = 0u;
    var nearestDistance = stack[0].distance;

    for (var i = 1u; i < stackSize; i++) {
      if stack[i].distance < nearestDistance {
        nearestIndex = i;
        nearestDistance = stack[i].distance;
      }
    }

    let current = stack[nearestIndex];
    stackSize -= 1u;
    stack[nearestIndex] = stack[stackSize];

    let node = VOXELS[current.nodeIndex];

    if octreeNodeType(node) == OCTREE_NODE_LEAF {
      return Hit(true, current.normal, octreeNodePayload(node));
    }

    if octreeNodeType(node) != OCTREE_NODE_BRANCH {
      continue;
    }

    let firstChild = octreeNodePayload(node);

    for (var i = 0u; i < 8u; i++) {
      let childIndex = firstChild + i;
      let childNode = VOXELS[childIndex];

      if octreeNodeType(childNode) == OCTREE_NODE_EMPTY {
        continue;
      }

      let bounds = childBounds(current.minBounds, current.maxBounds, i);
      let hit = intersectAabb(ray, bounds[0], bounds[1]);

      if !hit.found {
        continue;
      }

      if stackSize >= 128u {
        return Hit(false, vec3f(1, 0, 1), 0u);
      }

      stack[stackSize] = TraversalEntry(childIndex, bounds[0], bounds[1], hit.distance, hit.normal);

      stackSize += 1u;
    }
  }

  return Hit(false, vec3f(0), 0u);
}

/**
 * Calculates simple Lambert diffuse lighting for a surface.
 */
fn shadeSurface(baseColor: vec3f, surfaceNormal: vec3f) -> vec3f {
  let lightDirection = normalize(ENVIRONMENT.sunDirection);

  let sunFacing = max(dot(surfaceNormal, lightDirection), 0);

  let ambientLight = vec3f(0.25);

  let directLight = ENVIRONMENT.sunColor * ENVIRONMENT.sunIntensity * sunFacing;

  return baseColor * (ambientLight + directLight);
}

/**
 * Converts a geometric hit into a display color.
 *
 * TODO: shading modes (unlit, debug, lambert, etc.)
 */
fn shadeHit(hit: Hit) -> vec4f {
  let material = MATERIALS[hit.materialIndex];
  let shadedColor = shadeSurface(material.color.rgb, hit.normal);

  return vec4(shadedColor, material.color.a);
}

/**
 * Calculates the color for a ray that missed all voxel geometry.
 *
 * TODO: procedural sky, atmospheric scattering, cloud raymarching
 */
fn shadeMiss() -> vec4f {
  return vec4(0);
}

// -------------------------------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------------------------------

@compute @workgroup_size(WORKGROUP_SIZE, WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) pixel: vec3u) {
  let resolution = vec2(IMAGE_WIDTH, IMAGE_HEIGHT);
  let ray = createCameraRay(pixel.xy, resolution);
  let hit = traceRay(ray);

  if hit.found {
    textureStore(OUTPUT_TEXTURE, pixel.xy, shadeHit(hit));
    return;
  }

  textureStore(OUTPUT_TEXTURE, pixel.xy, shadeMiss());
}
