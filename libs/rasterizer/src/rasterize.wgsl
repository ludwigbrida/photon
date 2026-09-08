struct Camera {
  viewProjection: mat4x4f,
}

struct VertexInput {
  @location(0) position: vec3f,

  @location(1) normal: vec3f,

  @location(2) materialIndex: u32,
}

struct VertexOutput {
  @builtin(position) position: vec4f,

  @location(0) normal: vec3f,
}

@group(0) @binding(0) var<uniform> CAMERA: Camera;

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = CAMERA.viewProjection * vec4(input.position, 1);
  output.normal = input.normal;

  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  return vec4(input.normal * 0.5 + 0.5, 1);
}
