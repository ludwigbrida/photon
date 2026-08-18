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

  let color = traceRay(ray);

  textureStore(outputTexture, pixel.xy, color);
}
