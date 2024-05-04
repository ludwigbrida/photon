import visualizeShader from "./visualize.wgsl?raw";

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
		code: visualizeShader,
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
