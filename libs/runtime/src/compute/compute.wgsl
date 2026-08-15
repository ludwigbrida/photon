struct Material {
	color: vec4f,
};

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
var<storage, read> voxels: array<u32>;

@group(1)
@binding(1)
var<storage, read> materials: array<Material>;

@compute
@workgroup_size(WORKGROUP_SIZE, WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) pixel: vec3u) {
  var color = vec4f(0);

  let root = voxels[0];

  let nodeType = root >> 30u;

  if nodeType == 1u {
    color = vec4f(1.0, 0.0, 0.0, 1.0);
  } else {
    color = vec4f(0.0, 0.0, 0.0, 1.0);
  }

  textureStore(outputTexture, pixel.xy, color);
}
