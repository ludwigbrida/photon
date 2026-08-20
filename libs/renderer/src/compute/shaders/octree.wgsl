const NODE_TYPE_EMPTY = 0u;
const NODE_TYPE_BRANCH = 1u;
const NODE_TYPE_LEAF = 2u;

fn nodeType(node: u32) -> u32 {
  return node >> 30u;
}

fn nodePayload(node: u32) -> u32 {
  return node & 0x3fffffffu;
}

fn childMinFromIndex(index: u32) -> vec3f {
  let x = f32(index & 1u);
  let y = f32((index >> 1u) & 1u);
  let z = f32((index >> 2u) & 1u);

  return vec3f(x, y, z);
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

const MAX_TRAVERSAL_STACK = 128u;

struct TraversalEntry {
  nodeIndex: u32,
  minBounds: vec3f,
  maxBounds: vec3f,
  distance: f32,
  normal: vec3f,
}

/*
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

  var stack: array<TraversalEntry, MAX_TRAVERSAL_STACK>;
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

    let node = voxels[current.nodeIndex];

    if nodeType(node) == NODE_TYPE_LEAF {
      return Hit(true, current.normal, nodePayload(node));
    }

    if nodeType(node) != NODE_TYPE_BRANCH {
      continue;
    }

    let firstChild = nodePayload(node);

    for (var i = 0u; i < 8u; i++) {
      let childIndex = firstChild + i;
      let childNode = voxels[childIndex];

      if nodeType(childNode) == NODE_TYPE_EMPTY {
        continue;
      }

      let bounds = childBounds(current.minBounds, current.maxBounds, i);
      let hit = intersectAabb(ray, bounds[0], bounds[1]);

      if !hit.found {
        continue;
      }

      if stackSize >= MAX_TRAVERSAL_STACK {
        return Hit(false, vec3f(1, 0, 1), 0u);
      }

      stack[stackSize] = TraversalEntry(childIndex, bounds[0], bounds[1], hit.distance, hit.normal);

      stackSize += 1u;
    }
  }

  return Hit(false, vec3f(0), 0u);
}
