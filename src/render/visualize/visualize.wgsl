@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var texture: texture_2d<f32>;

struct VertexOutput {
	@builtin(position) position: vec4<f32>,
	@location(0) coordinate: vec2<f32>,
}

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
	let positions = array<vec2<f32>, 6>(
		vec2(1, 1),
		vec2(1, -1),
		vec2(-1, -1),
		vec2(1, 1),
		vec2(-1, -1),
		vec2(-1, 1),
	);

	let coordinates = array<vec2<f32>, 6>(
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
fn fragmentMain(@location(0) coordinate: vec2<f32>) -> @location(0) vec4<f32> {
	return textureSample(texture, textureSampler, coordinate);
}
