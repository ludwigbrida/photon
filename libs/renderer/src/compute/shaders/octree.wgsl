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

struct ChildHit {
  found: bool,
  index: u32,
  octant: u32,
}

fn findNearestChild(
  ray: Ray,
  nodeIndex: u32,
  nodeMin: vec3f,
  nodeMax: vec3f,
) -> ChildHit {
  let firstChild = nodePayload(voxels[nodeIndex]);

  var nearestDistance = 1e30;
  var nearestChildIndex = 0u;
  var nearestChildOctant = 0u;
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

    let distance = intersectAabb(
      ray,
      bounds[0],
      bounds[1],
    );

    if distance >= 0.0 && distance < nearestDistance {
      nearestDistance = distance;
      nearestChildIndex = childIndex;
      nearestChildOctant = i;
      foundChild = true;
    }
  }

  return ChildHit(
    foundChild,
    nearestChildIndex,
    nearestChildOctant,
  );
}

fn traceRay(ray: Ray) -> vec4f {
  var nodeIndex = 0u;

  var nodeMin = vec3f(0.0);
  var nodeMax = vec3f(f32(1u << OCTREE_DEPTH));

  for (var level = 0u; level < OCTREE_DEPTH; level++) {
    let node = voxels[nodeIndex];

    if nodeType(node) != NODE_TYPE_BRANCH {
      break;
    }

    let child = findNearestChild(
      ray,
      nodeIndex,
      nodeMin,
      nodeMax,
    );

    if !child.found {
      break;
    }

    let childNode = voxels[child.index];

    if nodeType(childNode) == NODE_TYPE_LEAF {
      let materialIndex = nodePayload(childNode);
      return materials[materialIndex].color;
    }

    let bounds = childBounds(
      nodeMin,
      nodeMax,
      child.octant,
    );

    nodeIndex = child.index;
    nodeMin = bounds[0];
    nodeMax = bounds[1];
  }

  return vec4f(0.0);
}
