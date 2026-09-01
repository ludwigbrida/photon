import package::compute::types::camera::Camera;
import package::compute::types::environment::Environment;
import package::compute::types::frame::Frame;
import package::compute::types::material::Material;
import package::compute::types::ray::Ray;
import package::compute::config::overrides::{
  WORKGROUP_SIZE,
  IMAGE_WIDTH,
  IMAGE_HEIGHT,
  OCTREE_DEPTH,
  MAX_BOUNCES,
  EMITTER_COUNT,
};
import package::compute::config::constants::{
  PROJECTION_ORTHOGRAPHIC,
  PROJECTION_PERSPECTIVE,
  OCTREE_NODE_EMPTY,
  OCTREE_NODE_BRANCH,
  OCTREE_NODE_LEAF,
  BIAS,
  INV_PI,
  TWO_PI,
};
import package::compute::config::resources::{
  ACCUMULATION,
  PRESENTATION,
  FRAME,
  CAMERA,
  ENVIRONMENT,
  VOXELS,
  MATERIALS,
  EMITTERS,
};
import package::compute::sampling::random::{hash, sampleRandom};

// -------------------------------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------------------------------
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
// Constants
// -------------------------------------------------------------------------------------------------
const RAY_INVALID = Ray();

const HIT_MISS = Hit(false, 0, vec3f(0), 0u);

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
 * Rotates a local direction into world space around a unit axis.
 *
 * Local +z maps to axis. The other two local axes are constructed deterministically, which is
 * sufficient because the sampled distributions are rotationally symmetric around their axis.
 */
fn orientAroundAxis(localDirection: vec3f, axis: vec3f) -> vec3f {
  let referenceAxis = select(vec3f(0, 0, 1), vec3f(0, 1, 0), abs(axis.z) > 0.999);

  let tangent = normalize(cross(referenceAxis, axis));
  let bitangent = cross(axis, tangent);

  return tangent * localDirection.x + bitangent * localDirection.y + axis * localDirection.z;
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

  // Local +z points along the surface normal.
  return orientAroundAxis(localDirection, surfaceNormal);
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
 * Spawns a perfectly specular reflection ray from an opaque surface.
 *
 * Unlike diffuse scattering, this has no random component:
 * For one incoming direction and surface normal there is exactly one reflected direction.
 */
fn scatterMirror(surfacePosition: vec3f, surfaceNormal: vec3f, incomingDirection: vec3f) -> Ray {
  // `incomingDirection` points toward the surface. `reflect` return the direction leaving the
  // surface in the mirror-reflected direction.
  // Since ray direction and voxel normal are already normalized, this is implicitly normalized
  // as well.
  let reflectedDirection = reflect(incomingDirection, surfaceNormal);

  // The ray leaves into the outward hemisphere, so offset it along the outward normal to avoid
  // immediately intersecting its source voxel again.
  return Ray(surfacePosition + surfaceNormal * BIAS, reflectedDirection);
}

/**
 * Samples one direction uniformly across the apparent solar disc.
 *
 * The result is a direction from a shaded surface toward one point on the sun.
 * At a zero angular radius it returns the exact central direction, resulting in a hard shadow.
 */
fn sampleSunDirection(randomU: f32, randomV: f32) -> vec3f {
  if ENVIRONMENT.sun.angularRadius == 0.0 {
    return ENVIRONMENT.sun.direction;
  }

  // Uniformly sample a solid angle inside a cone around the central direction.
  let cosRadius = cos(ENVIRONMENT.sun.angularRadius);
  let cosTheta = 1.0 - randomU *(1.0 - cosRadius);
  let sinTheta = sqrt(max(0.0, 1.0 - cosTheta * cosTheta));
  let azimuth = TWO_PI * randomV;

  let localDirection = vec3f(sinTheta * cos(azimuth), sinTheta * sin(azimuth), cosTheta);

  return orientAroundAxis(localDirection, ENVIRONMENT.sun.direction);
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
  let uv =(vec2f(pixel) + sampleOffset) / vec2f(resolution);

  // Convert [0, 1] into normalized screen coordinates:
  // Bottom-left: (-1, -1)
  // Top-right: (1, 1)
  let screen = uv * 2.0 - 1.0;

  let aspectRatio = f32(resolution.x) / f32(resolution.y);
  let imagePlane = vec2f(screen.x * aspectRatio, - screen.y);

  switch CAMERA.projection {
    case PROJECTION_ORTHOGRAPHIC: {
      let origin = CAMERA.position + CAMERA.right * imagePlane.x * CAMERA.scale + CAMERA.up * imagePlane.y * CAMERA.scale;

      return Ray(origin, CAMERA.forward);
    }
     case PROJECTION_PERSPECTIVE: {
      let imagePlaneHalfHeight = tan(CAMERA.fieldOfView * 0.5);

      let direction = normalize(CAMERA.forward + CAMERA.right * imagePlane.x * imagePlaneHalfHeight + CAMERA.up * imagePlane.y * imagePlaneHalfHeight);

      return Ray(CAMERA.position, direction);
    }
     default: {
      return RAY_INVALID;
    }
  }
}

fn intersectAabb(ray: Ray, minBounds: vec3f, maxBounds: vec3f) -> AabbHit {
  let inverseDirection = 1.0 / ray.direction;

  let t0 =(minBounds - ray.origin) * inverseDirection;
  let t1 =(maxBounds - ray.origin) * inverseDirection;

  let tMin = min(t0, t1);
  let tMax = max(t0, t1);

  let near = max(tMin.x, max(tMin.y, tMin.z));
  let far = min(tMax.x, min(tMax.y, tMax.z));

  if far < max(near, 0.0) {
    return AabbHit(false, - 1.0, vec3f(0));
  }

   var normal = vec3f(0);

  if near == tMin.x {
    normal = vec3f(- sign(ray.direction.x), 0, 0);
  } else if near == tMin.y {
    normal = vec3f(0, - sign(ray.direction.y), 0);
  } else {
    normal = vec3f(0, 0, - sign(ray.direction.z));
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
  let center =(parentMin + parentMax) * 0.5;

  let xHigh =(childIndex & 1u) != 0u;
  let yHigh =(childIndex & 2u) != 0u;
  let zHigh =(childIndex & 4u) != 0u;

  let childMin = vec3f(select(parentMin.x, center.x, xHigh), select(parentMin.y, center.y, yHigh),
    select(parentMin.z, center.z, zHigh),
  );

  let childMax = vec3f(select(center.x, parentMax.x, xHigh), select(center.y, parentMax.y, yHigh),
    select(center.z, parentMax.z, zHigh),
  );

  return array<vec3f, 2>(childMin, childMax);
}

/**
 * Traverses the voxel octree and returns the closest leaf hit.
 */
fn traceRay(ray: Ray) -> Hit {
  let halfExtent = f32(1u <<(OCTREE_DEPTH - 1u));
  let rootMin = vec3(- halfExtent);
  let rootMax = vec3(halfExtent);
  let rootHit = intersectAabb(ray, rootMin, rootMax);

  if!rootHit.found {
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

      if!hit.found {
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
  let halfExtent = f32(1u <<(OCTREE_DEPTH - 1u));
  let rootMin = vec3f(- halfExtent);
  let rootMax = vec3f(halfExtent);
  let rootHit = intersectAabb(ray, rootMin, rootMax);

  if!rootHit.found {
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

      if!childHit.found {
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

// infinite distance shadow testing
fn isSunOccluded(surfacePosition: vec3f, surfaceNormal: vec3f, sunDirection: vec3f) -> bool {
  let shadowOrigin = surfacePosition + surfaceNormal * BIAS;

  let shadowRay = Ray(shadowOrigin, sunDirection);

  return traceAny(shadowRay);
}

// finite distance shadow testing
fn isPointOccluded(origin: vec3f, lightTarget: vec3f) -> bool {
  let toTarget = lightTarget - origin;
  let distanceSquared = dot(toTarget, toTarget);

  if distanceSquared <= BIAS * BIAS {
    return false;
  }

   let distance = sqrt(distanceSquared);
  let direction = toTarget / distance;
  let hit = traceRay(Ray(origin, direction));

  // A hit at `distance` is the selected light itself, not an occluder.
  return hit.found && hit.distance < distance - BIAS;
}

/**
 * Calculates simple Lambert diffuse lighting for a surface.
 */
fn shadeSurface(baseColor: vec3f, surfacePosition: vec3f, surfaceNormal: vec3f) -> vec3f {
  let sunFacing = max(dot(surfaceNormal, ENVIRONMENT.sun.direction), 0);

  let ambientLight = vec3f(0.15);

  if sunFacing == 0f {
    return baseColor * ambientLight;
  }

   let sunVisibility = select(1f, 0f, isSunOccluded(surfacePosition, surfaceNormal, ENVIRONMENT.sun.direction));

  let directLight = ENVIRONMENT.sun.color * ENVIRONMENT.sun.intensity * sunFacing * sunVisibility;

  return baseColor *(ambientLight + directLight);
}

/**
 * Estimates direct radiance from the directional sun at one diffuse surface.
 */
fn estimateDirectSun(baseColor: vec3f, surfacePosition: vec3f, surfaceNormal: vec3f, sunDirection: vec3f) -> vec3f {
  let sunFacing = max(dot(surfaceNormal, sunDirection), 0);

  // Back-facing surfaces receive no direct light and need no shadow ray.
  if sunFacing == 0.0 {
    return vec3f(0);
  }

   if isSunOccluded(surfacePosition, surfaceNormal, sunDirection) {
    return vec3f(0);
  }

   let sunSampleWeight = 2.0 /(1.0 + cos(ENVIRONMENT.sun.angularRadius));

  // Lambert's BRDF is baseColor / pi. The cosing term converts incoming directional radiance into
  // irradiance on this oriented surface.
  let diffuseBrdf = baseColor * INV_PI;
  let sunRadiance = ENVIRONMENT.sun.color * ENVIRONMENT.sun.intensity * sunSampleWeight;

  return diffuseBrdf * sunRadiance * sunFacing;
}

fn estimateDirectEmitter(baseColor: vec3f, surfacePosition: vec3f, surfaceNormal: vec3f, randomEmitter: f32,
  randomU: f32,
  randomV: f32,
) -> vec3f {
  if EMITTER_COUNT == 0u {
    return vec3f(0);
  }

   let emitterIndex = min(u32(randomEmitter * f32(EMITTER_COUNT)), EMITTER_COUNT - 1u);
  let emitter = EMITTERS[emitterIndex];
  let emitterMaterial = MATERIALS[u32(emitter.materialIndex)];

  // Uniform point on the voxel's downward facing unit square.
  // TODO: make general
  let lightPoint = emitter.position + vec3f(randomU, 0.0, randomV);
  let lightNormal = vec3f(0.0, - 1.0, 0.0);

  let shadowOrigin = surfacePosition + surfaceNormal * BIAS;
  let toLight = lightPoint - shadowOrigin;
  let distanceSquared = dot(toLight, toLight);

  if distanceSquared <= BIAS * BIAS {
    return vec3f(0);
  }

   let distance = sqrt(distanceSquared);
  let lightDirection = toLight / distance;

  let surfaceCosine = max(dot(surfaceNormal, lightDirection), 0.0);
  let lightCosine = max(dot(lightNormal, - lightDirection), 0.0);

  if surfaceCosine == 0.0 || lightCosine == 0.0 {
    return vec3f(0.0);
  }

   if isPointOccluded(shadowOrigin, lightPoint) {
    return vec3f(0.0);
  }

  // One unit-area face is selected uniformly among EMITTER_COUNT faces.
  let areaPdf = 1.0 / f32(EMITTER_COUNT);

  return baseColor * INV_PI * emitterMaterial.emission.rgb * surfaceCosine * lightCosine /(distanceSquared * areaPdf);
}

/**
 * Converts a geometric hit into a display color.
 *
 * TODO: shading modes (unlit, debug, lambert, etc.)
 */
fn shadeHit(ray: Ray, hit: Hit) -> vec4f {
  let material = MATERIALS[hit.materialIndex];

  let surfacePosition = rayAtDistance(ray, hit.distance);

  let radiance = estimateDirectSun(material.color.rgb, surfacePosition, hit.normal, ENVIRONMENT.sun.direction);

  // let shadedColor = shadeSurface(material.color.rgb, surfacePosition, hit.normal);
  return vec4(radiance, 1);
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

    if!hit.found {
      // The sky is effectively emitted radiance from the environment. It is attenuated by every
      // diffuse surface the path reflected from before reaching it.
      radiance += throughput * skyColor(ray.direction);
      break;
    }

     let material = MATERIALS[hit.materialIndex];
    let surfacePosition = rayAtDistance(ray, hit.distance);

    // Emission is radiance leaving this surface toward the incoming ray.
    // `throughput` contains the attenuation from every prior diffuse reflection,
    // so an emitter visible to the camera uses throughput = 1, while an emitter
    // reached after a red bounce contributes red-tinted light.
    radiance += throughput * material.emission.rgb;

    // Five independent random dimensions are reserved per path vertex:
    // 0-1: sun-disc sample
    // 2-4: emitter selection and point on its face
    // 5-6: diffuse direction
    // 7: diffuse versus mirror mode selection
    let vertexRandomDimension = 2u + bounce * 8u;

    // move this to author validation eventually
    let metallic = clamp(material.metallic, 0.0, 1.0);
    let diffuseWeight = 1.0 - metallic;

    // Only the diffuse part of the material model receives the existing Lambert direct-sun
    // estimate. A perfect mirror gets its illumination by tracing its reflected ray instead.
    if diffuseWeight > 0.0 {
      let sampledSunDirection = sampleSunDirection(sampleRandom(pixel, FRAME.sampleIndex, vertexRandomDimension),
        sampleRandom(pixel, FRAME.sampleIndex, vertexRandomDimension + 1u),
      );

      // Next-event estimation of the directional sun at this path vertex.
      // estimateDirectSun already includes this material's Lambert BRDF.
      radiance += throughput * estimateDirectSun(material.color * diffuseWeight, surfacePosition,
        hit.normal,
        sampledSunDirection,
      );

      radiance += throughput * estimateDirectEmitter(material.color * diffuseWeight, surfacePosition,
        hit.normal,
        sampleRandom(pixel, FRAME.sampleIndex, vertexRandomDimension + 2u),
        sampleRandom(pixel, FRAME.sampleIndex, vertexRandomDimension + 3u),
        sampleRandom(pixel, FRAME.sampleIndex, vertexRandomDimension + 4u),
      );
    }

    // Reaching the continuation limit still allows direct lighting at this final vertex, but
    // does not spawn another ray.
    if bounce == MAX_BOUNCES {
      break;
    }

    // Cosing-weighted Lambert sampling:
    // (baseColor / pi) * cosine / (cosing / pi) = baseColor
    // Therefore the path throughput is the material base color.
    throughput *= material.color;

    if sampleRandom(pixel, FRAME.sampleIndex, vertexRandomDimension + 7u) < metallic {
      ray = scatterMirror(surfacePosition, hit.normal, ray.direction);
    } else {
      ray = scatterDiffuse(surfacePosition, hit.normal, sampleRandom(pixel, FRAME.sampleIndex,
        vertexRandomDimension + 5u,
      ), sampleRandom(pixel, FRAME.sampleIndex, vertexRandomDimension + 6u));
    }
  }

   return radiance;
}

fn accumulateRadiance(pixel: vec2u, currentSample: vec4f) -> vec4f {
  let pixelIndex = pixel.y * IMAGE_WIDTH + pixel.x;

  if FRAME.sampleIndex == 0u {
    ACCUMULATION[pixelIndex] = currentSample;
    return currentSample;
  }

   let previousAverage = ACCUMULATION[pixelIndex];

  let newSampleCount = f32(FRAME.sampleIndex) + 1;

  let accumulatedRadiance = previousAverage +(currentSample - previousAverage) / newSampleCount;
  ACCUMULATION[pixelIndex] = accumulatedRadiance;

  return accumulatedRadiance;
}

fn toneMap(radiance: vec3f) -> vec3f {
  let exposedRadiance = radiance * 2.0;
  return exposedRadiance /(vec3f(1) + exposedRadiance);
}

// -------------------------------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------------------------------
@compute @workgroup_size(WORKGROUP_SIZE, WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) invocation: vec3u) {
  let pixel = vec2u(invocation.x * FRAME.bucketGridSize + FRAME.bucketX, invocation.y * FRAME.bucketGridSize + FRAME.bucketY);

  if pixel.x >= IMAGE_WIDTH || pixel.y >= IMAGE_HEIGHT {
    return;
  }

   let resolution = vec2(IMAGE_WIDTH, IMAGE_HEIGHT);
  // The offset traces the ray through a different random point inside the pixel for each sample.
  // The HRD accumulator then averages those samples (Monte-Carlo supersampling).
  // This results in progressive stochastic anti-aliasing.
  let sampleOffset = vec2f(sampleRandom(pixel.xy, FRAME.sampleIndex, 0u), sampleRandom(pixel.xy,
    FRAME.sampleIndex,
    1u,
  ));
  let ray = createCameraRay(pixel.xy, resolution, sampleOffset);

  let radiance = tracePath(ray, pixel.xy);

  let accumulatedRadiance = accumulateRadiance(pixel.xy, vec4f(radiance, 1));

  let toneMappedRadiance = vec4(toneMap(accumulatedRadiance.rgb), accumulatedRadiance.a);

  textureStore(PRESENTATION, pixel.xy, toneMappedRadiance);
}
