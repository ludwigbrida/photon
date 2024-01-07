import visualizeShader from "./visualize.wgsl?raw";

export const createVisualizePipeline = (
	device: GPUDevice,
	colorBufferView: GPUTextureView,
	sampler: GPUSampler,
) => {
	const visualizeBindGroupLayout = device.createBindGroupLayout({
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
		bindGroupLayouts: [visualizeBindGroupLayout],
	});

	const visualizePipeline = device.createRenderPipeline({
		layout: visualizePipelineLayout,
		vertex: {
			module: device.createShaderModule({
				code: visualizeShader,
			}),
			entryPoint: "vertexMain",
		},
		fragment: {
			module: device.createShaderModule({
				code: visualizeShader,
			}),
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
