// -------------------------------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------------------------------

/**
 * Values that change for every accumulation dispatch.
 */
struct Frame {
  // Progressive sample number supplied by the CPU (zero-based).
  sampleIndex: u32,
}

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

struct Sky {
  horizonColor: vec3f,
  horizonFalloff: f32,
  zenithColor: vec3f,
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
  sky: Sky,
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

struct AnyHitTraversalEntry {
  nodeIndex: u32,
  minBounds: vec3f,
  maxBounds: vec3f,
}

/**
 * Represents a geometric ray-tracing result.
 */
struct Hit {
  // Whether the ray intersected a leaf voxel.
  found: bool,
  // Distance along the traced ray at which the ray entered the voxel.
  distance: f32,
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

// Maximum number of diffuse continuation rays spawned after the primary ray.
override MAX_BOUNCES: u32;

// -------------------------------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------------------------------

const PROJECTION_ORTHOGRAPHIC = 0u;
const PROJECTION_PERSPECTIVE = 1u;

const OCTREE_NODE_EMPTY = 0u;
const OCTREE_NODE_BRANCH = 1u;
const OCTREE_NODE_LEAF = 2u;

const RAY_INVALID = Ray();

const HIT_MISS = Hit(false, 0, vec3f(0), 0u);

const BIAS = 0.001f;

// Reciprocal approximation of pi, used by the energy-conserving Lambert diffuse BRDF.
const INV_PI = 0.3183098861837907;

// Full rotation in radians, used to sample an azimuth angle.
const TWO_PI = 6.283185307179586;

// -------------------------------------------------------------------------------------------------
// Resources
// -------------------------------------------------------------------------------------------------

@group(0) @binding(0) var INPUT_TEXTURE: texture_2d<f32>;
@group(0) @binding(1) var OUTPUT_TEXTURE: texture_storage_2d<rgba16float, write>;
@group(0) @binding(2) var<uniform> FRAME: Frame;

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
 * Mixes a number into a deterministic pseudo-random value.
 */
fn hash(value: u32) -> u32 {
  var state = value;

  state = (state ^ 61u) ^ (state >> 16u);
  state *= 9u;
  state = state ^ (state >> 4u);
  state *= 0x27d4eb2du;
  state = state ^ (state >> 15u);

  return state;
}

/**
 * Produces a pseudo-random value in [0.0, 1.0].
 *
 * `dimension` selects an independent random dimension for the same pixel and progressive sample.
 * Dimensions 0 and 1 are reserved for camera jitter. Diffuse path sampling will start at
 * dimension 2.
 */
fn sampleRandom(pixel: vec2u, sampleIndex: u32, dimension: u32) -> f32 {
  var seed = hash(pixel.x);
  seed = hash(seed ^ pixel.y);
  seed = hash(seed ^ sampleIndex);
  seed = hash(seed ^ dimension);

  // Keep the upper 24 random bits, which fit exactly in f32's mantissa.
  // This guarantees a value below 1.0 even after integer-to-float conversion.
  return f32(seed >> 8u) * (1.0 / 16777216.0);
}

/**
 * Samples a unit direction over the hemisphere above surfaceNormal.
 *
 * The distribution is cosine-weighted: Directions near the normal are chosen more often than
 * adjacent directions. This matches Lambert diffuse reflection and gives lower noise indirect
 * lighting than simple uniform sampling.
 */
fn sampleCosineHemisphere(surfaceNormal: vec3f, randomU: f32, randomV: f32) -> vec3f {
  // Convert two uniform random values into a cosine-weighted local direction.
  let radius = sqrt(randomU);
  let azimuth = TWO_PI * randomV;

  let localDirection = vec3f(radius * cos(azimuth), radius * sin(azimuth), sqrt(1.0 - randomU));

  // Construct a stable tangent frame around the axis-aligned voxel face normal. Choose a reference
  // vector that is not nearly parallel to it.
  let referenceAxis =
    select(vec3f(0.0, 0.0, 1.0), vec3f(0.0, 1.0, 0.0), abs(surfaceNormal.z) > 0.999);

  let tangent = normalize(cross(referenceAxis, surfaceNormal));
  let bitangent = cross(surfaceNormal, tangent);

  // Local +z points along the surface normal.
  return
    tangent * localDirection.x + bitangent * localDirection.y + surfaceNormal * localDirection.z;
}

/**
 * Creates a diffuse continuation ray from a surface.
 */
fn scatterDiffuse(surfacePosition: vec3f, surfaceNormal: vec3f, randomU: f32, randomV: f32) -> Ray {
  // Offset from the normal to prevent self-intersection.
  let origin = surfacePosition + surfaceNormal * BIAS;
  let direction = sampleCosineHemisphere(surfaceNormal, randomU, randomV);

  return Ray(origin, direction);
}

/**
 * Creates the primary world-space ray for one output pixel.
 *
 * The pixel is sampled at its center, so every pixel maps to a symmetric region of the camera image plane.
 */
fn createCameraRay(pixel: vec2u, resolution: vec2u, sampleOffset: vec2f) -> Ray {
  // Convert the pixel coordinate into [0, 1] texture-like space.
  // Add a half-pixel offset to shoot the ray through its center rather than its top-left corner.
  // TODO: keep this behavior if sampling is disabled.
  // let uv = (vec2f(pixel) + vec2f(0.5)) / vec2f(resolution);

  // Convert the pixel coordinate into [0, 1] texture-like space.
  // `sampleOffset` lies in [0, 1] on each axis, selecting one stochastic point
  let uv = (vec2f(pixel) + sampleOffset) / vec2f(resolution);

  // Convert [0, 1] into normalized screen coordinates:
  // Bottom-left: (-1, -1)
  // Top-right: (1, 1)
  let screen = uv * 2.0 - 1.0;

  let aspectRatio = f32(resolution.x) / f32(resolution.y);
  let imagePlane = vec2f(screen.x * aspectRatio, -screen.y);

  switch CAMERA.projection {
    case PROJECTION_ORTHOGRAPHIC: {
      let origin =
        CAMERA.position
          + CAMERA.right * imagePlane.x * CAMERA.orthographicScale
          + CAMERA.up * imagePlane.y * CAMERA.orthographicScale;

      return Ray(origin, CAMERA.forward);
    }
    case PROJECTION_PERSPECTIVE: {
      let imagePlaneHalfHeight = tan(CAMERA.verticalFov * 0.5);

      let direction =
        normalize(
          CAMERA.forward
            + CAMERA.right * imagePlane.x * imagePlaneHalfHeight
            + CAMERA.up * imagePlane.y * imagePlaneHalfHeight,
        );

      return Ray(CAMERA.position, direction);
    }
    default: {
      return RAY_INVALID;
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
    return HIT_MISS;
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
      return Hit(true, current.distance, current.normal, octreeNodePayload(node));
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
        return HIT_MISS;
      }

      stack[stackSize] = TraversalEntry(childIndex, bounds[0], bounds[1], hit.distance, hit.normal);

      stackSize += 1u;
    }
  }

  return HIT_MISS;
}

fn traceAny(ray: Ray) -> bool {
  let halfExtent = f32(1u << (OCTREE_DEPTH - 1u));
  let rootMin = vec3f(-halfExtent - 0.5);
  let rootMax = vec3f(halfExtent - 0.5);
  let rootHit = intersectAabb(ray, rootMin, rootMax);

  if !rootHit.found {
    return false;
  }

  var stack: array<AnyHitTraversalEntry, 128u>;
  var stackSize = 1u;

  stack[0] = AnyHitTraversalEntry(0u, rootMin, rootMax);

  loop {
    if stackSize == 0u {
      break;
    }

    stackSize -= 1u;
    let current = stack[stackSize];

    let node = VOXELS[current.nodeIndex];

    if octreeNodeType(node) == OCTREE_NODE_LEAF {
      return true;
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
      let childHit = intersectAabb(ray, bounds[0], bounds[1]);

      if !childHit.found {
        continue;
      }

      if stackSize >= 128u {
        // An overflow here means traversal cannot prove that the light is visible.
        // Treat it as occluded to avoid a potentially incorrect light leak.
        return true;
      }

      stack[stackSize] = AnyHitTraversalEntry(childIndex, bounds[0], bounds[1]);

      stackSize += 1u;
    }
  }

  return false;
}

fn isSunOccluded(surfacePosition: vec3f, surfaceNormal: vec3f) -> bool {
  let shadowOrigin = surfacePosition + surfaceNormal * BIAS;

  let shadowRay = Ray(shadowOrigin, ENVIRONMENT.sunDirection);

  return traceAny(shadowRay);
}

/**
 * Calculates simple Lambert diffuse lighting for a surface.
 */
fn shadeSurface(baseColor: vec3f, surfacePosition: vec3f, surfaceNormal: vec3f) -> vec3f {
  let sunFacing = max(dot(surfaceNormal, ENVIRONMENT.sunDirection), 0);

  let ambientLight = vec3f(0.15);

  if sunFacing == 0f {
    return baseColor * ambientLight;
  }

  let sunVisibility = select(1f, 0f, isSunOccluded(surfacePosition, surfaceNormal));

  let directLight = ENVIRONMENT.sunColor * ENVIRONMENT.sunIntensity * sunFacing * sunVisibility;

  return baseColor * (ambientLight + directLight);
}

/**
 * Estimates direct radiance from the directional sun at one diffuse surface.
 */
fn estimateDirectSun(baseColor: vec3f, surfacePosition: vec3f, surfaceNormal: vec3f) -> vec3f {
  let sunFacing = max(dot(surfaceNormal, ENVIRONMENT.sunDirection), 0);

  // Back-facing surfaces receive no direct light and need no shadow ray.
  if sunFacing == 0.0 {
    return vec3f(0);
  }

  if isSunOccluded(surfacePosition, surfaceNormal) {
    return vec3f(0);
  }

  // Lambert's BRDF is baseColor / pi. The cosing term converts incoming directional radiance into
  // irradiance on this oriented surface.
  let diffuseBrdf = baseColor * INV_PI;
  let sunRadiance = ENVIRONMENT.sunColor * ENVIRONMENT.sunIntensity;

  return diffuseBrdf * sunRadiance * sunFacing;
}

/**
 * Converts a geometric hit into a display color.
 *
 * TODO: shading modes (unlit, debug, lambert, etc.)
 */
fn shadeHit(ray: Ray, hit: Hit) -> vec4f {
  let material = MATERIALS[hit.materialIndex];

  let surfacePosition = rayAtDistance(ray, hit.distance);

  let radiance = estimateDirectSun(material.color.rgb, surfacePosition, hit.normal);

  // let shadedColor = shadeSurface(material.color.rgb, surfacePosition, hit.normal);

  return vec4(radiance, material.color.a);
}

/**
 * Evaluates the color of the procedural sky, based on the ray direction.
 */
fn skyColor(direction: vec3f) -> vec3f {
  // A normalized direction's y component is its vertical elevation:
  // -1 points straight down, 0 lies on the horizon and 1 points up.
  // Since the sky gradient excludes values below the horizon, this value needs to be clamped.
  let elevation = clamp(direction.y, 0, 1);

  let zenithWeight = pow(elevation, ENVIRONMENT.sky.horizonFalloff);

  return mix(ENVIRONMENT.sky.horizonColor, ENVIRONMENT.sky.zenithColor, zenithWeight);
}

/**
 * Calculates the color for a ray that missed all voxel geometry.
 *
 * TODO: procedural sky, atmospheric scattering, cloud raymarching
 */
fn shadeMiss(ray: Ray) -> vec4f {
  let sky = skyColor(ray.direction);
  return vec4f(sky, 1);
}

/**
 * Estimates the radiance along one camera ray through opaque Lambert voxel surfaces.
 *
 * Direct sunlight is sampled deterministically at every surface. Diffuse continuation is sampled
 * stochastically, so repeated frames must be averaged by the accumulated radiance.
 */
fn tracePath(primaryRay: Ray, pixel: vec2u) -> vec3f {
  var radiance = vec3f(0);
  var throughput = vec3f(1);
  var ray = primaryRay;

  // Count only continuation rays after the primary ray:
  // 0u: evaluate only the primary visible surface
  // 1u: evaluate one indirect diffuse bounce
  for (var bounce = 0u; bounce <= MAX_BOUNCES; bounce++) {
    let hit = traceRay(ray);

    if !hit.found {
      // The sky is effectively emitted radiance from the environment. It is attenuated by every
      // diffuse surface the path reflected from before reaching it.
      radiance += throughput * skyColor(ray.direction);
      break;
    }

    let material = MATERIALS[hit.materialIndex];
    let surfacePosition = rayAtDistance(ray, hit.distance);

    // Next-event estimation of the directional sun at this path vertex.
    // esestimateDirectSun already includes this material's Lambert BRDF.
    radiance += throughput * estimateDirectSun(material.color.rgb, surfacePosition, hit.normal);

    // Reaching the continuation limit still allows direct lighting at this final vertex, but does not spawn another
    // ray.
    if bounce == MAX_BOUNCES {
      break;
    }

    // Cosing-weighted Lambert sampling:
    // (baseColor / pi) * cosine / (cosing / pi) = baseColor
    // Therefore the path throughput is the material base colr.
    throughput *= material.color.rgb;

    // Dimensions 0 and 1 belong to camera jitter.
    // Allocate two dimensions per diffuse bounce for the hemisphere sample.
    let randomDimension = 2u + bounce * 2u;

    ray =
      scatterDiffuse(
        surfacePosition,
        hit.normal,
        sampleRandom(pixel, FRAME.sampleIndex, randomDimension),
        sampleRandom(pixel, FRAME.sampleIndex, randomDimension + 1u),
      );
  }

  return radiance;
}

fn accumulateRadiance(pixel: vec2u, currentSample: vec4f) -> vec4f {
  if FRAME.sampleIndex == 0u {
    return currentSample;
  }

  let previousAverage = textureLoad(INPUT_TEXTURE, vec2i(pixel), 0);

  let newSampleCount = f32(FRAME.sampleIndex) + 1;

  return previousAverage + (currentSample - previousAverage) / newSampleCount;
}

// -------------------------------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------------------------------

@compute @workgroup_size(WORKGROUP_SIZE, WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) pixel: vec3u) {
  let resolution = vec2(IMAGE_WIDTH, IMAGE_HEIGHT);
  // The offset traces the ray through a different random point inside the pixel for each sample.
  // The HRD accumulator then averages those samples (Monte-Carlo supersampling).
  // This results in progressive stochastic anti-aliasing.
  let sampleOffset =
    vec2f(
      sampleRandom(pixel.xy, FRAME.sampleIndex, 0u),
      sampleRandom(pixel.xy, FRAME.sampleIndex, 1u),
    );
  let ray = createCameraRay(pixel.xy, resolution, sampleOffset);

  let radiance = tracePath(ray, pixel.xy);

  let accumulatedRadiance = accumulateRadiance(pixel.xy, vec4f(radiance, 1));

  textureStore(OUTPUT_TEXTURE, pixel.xy, accumulatedRadiance);
}
