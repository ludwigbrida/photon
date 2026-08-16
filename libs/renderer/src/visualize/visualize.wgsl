struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) coordinate: vec2f,
}

@group(0)
@binding(0)
var inputTexture: texture_2d<f32>;

@group(1)
@binding(0)
var textureSampler: sampler;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  let positions = array<vec2f, 6>(
    vec2(1, 1),
    vec2(1, -1),
    vec2(-1, -1),
    vec2(1, 1),
    vec2(-1, -1),
    vec2(-1, 1),
  );

  let coordinates = array<vec2f, 6>(
    vec2(1, 0),
    vec2(1, 1),
    vec2(0, 1),
    vec2(1, 0),
    vec2(0, 1),
    vec2(0, 0),
  );

  var output: VertexOutput;
  output.position = vec4(positions[vertexIndex], 0, 1);
  output.coordinate = coordinates[vertexIndex];

  return output;
}

@fragment
fn fragmentMain(@location(0) coordinate: vec2f) -> @location(0) vec4f {
  return textureSample(inputTexture, textureSampler, coordinate);
}
