export const createVisualizePipeline = (
	device: GPUDevice,
	colorBufferView: GPUTextureView,
	sampler: GPUSampler,
) => {
	const visualizeBindGroupLayout = device.createBindGroupLayout({
		label: "visualizeBindGroupLayout",
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.FRAGMENT,
				sampler: {},
			},
			{
				binding: 1,
				visibility: GPUShaderStage.FRAGMENT,
				texture: {},
			},
		],
	});

	const visualizeBindGroup = device.createBindGroup({
		label: "visualizeBindGroup",
		layout: visualizeBindGroupLayout,
		entries: [
			{
				binding: 0,
				resource: sampler,
			},
			{
				binding: 1,
				resource: colorBufferView,
			},
		],
	});

	const visualizePipelineLayout = device.createPipelineLayout({
		label: "visualizePipelineLayout",
		bindGroupLayouts: [visualizeBindGroupLayout],
	});

	const visualizeShaderModule = device.createShaderModule({
		label: "visualizeShaderModule",
		// language=WGSL
		code: `
			@group(0)
			@binding(0)
			var screenSampler: sampler;

			@group(0)
			@binding(1)
			var colorBuffer: texture_2d<f32>;

			struct VertexOutput {
				@builtin(position) position: vec4<f32>,
				@location(0) texCoord: vec2<f32>,
			}

			@vertex
			fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
				let positions = array<vec2<f32>, 6>(
					vec2<f32>(1, 1),
					vec2<f32>(1, -1),
					vec2<f32>(-1, -1),
					vec2<f32>(1, 1),
					vec2<f32>(-1, -1),
					vec2<f32>(-1, 1),
				);

				let texCoords = array<vec2<f32>, 6>(
					vec2<f32>(1, 0),
					vec2<f32>(1, 1),
					vec2<f32>(0, 1),
					vec2<f32>(1, 0),
					vec2<f32>(0, 1),
					vec2<f32>(0, 0),
				);

				var output: VertexOutput;
				output.position = vec4<f32>(positions[vertexIndex], 0, 1);
				output.texCoord = texCoords[vertexIndex];

				return output;
			}

			@fragment
			fn fragmentMain(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
				return textureSample(colorBuffer, screenSampler, texCoord);
			}
		`,
	});

	const visualizePipeline = device.createRenderPipeline({
		label: "visualizePipeline",
		layout: visualizePipelineLayout,
		vertex: {
			module: visualizeShaderModule,
			entryPoint: "vertexMain",
		},
		fragment: {
			module: visualizeShaderModule,
			entryPoint: "fragmentMain",
			targets: [
				{
					format: "bgra8unorm",
				},
			],
		},
		primitive: {
			topology: "triangle-list",
		},
	});

	return {
		visualizeBindGroup,
		visualizePipeline,
	};
};
