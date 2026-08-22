struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) coordinate: vec2f,
}

@group(0) @binding(0) var INPUT_TEXTURE: texture_2d<f32>;

/**
 * Converts unbounded linear HDR radiance into the displayable [0, 1] range.
 *
 * Tone mapping effectively protects highlights.
 *
 * This is deliberately a presentation operation: The compute shader continues
 * to accumulate the original linear radiance in rgba16float textures.
 */
fn toneMapReinhard(radiance: vec3f) -> vec3f {
  return radiance / (vec3f(1) + radiance);
}

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  let positions =
    array<vec2f, 6>(vec2(1, 1), vec2(1, -1), vec2(-1, -1), vec2(1, 1), vec2(-1, -1), vec2(-1, 1));

  let coordinates =
    array<vec2f, 6>(vec2(1, 0), vec2(1, 1), vec2(0, 1), vec2(1, 0), vec2(0, 1), vec2(0, 0));

  var output: VertexOutput;
  output.position = vec4(positions[vertexIndex], 0, 1);
  output.coordinate = coordinates[vertexIndex];

  return output;
}

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let pixel = vec2i(position.xy);
  let accumulatedSample = textureLoad(INPUT_TEXTURE, pixel, 0);

  let displayColor = toneMapReinhard(accumulatedSample.rgb);

  return vec4f(displayColor, accumulatedSample.a);
}
