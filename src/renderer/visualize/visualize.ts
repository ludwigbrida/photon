import visualizeShader from "./visualize.wgsl?raw";

export const createVisualizePipeline = (
	device: GPUDevice,
	textureSampler: GPUSampler,
	textureViews: GPUTextureView[],
) => {
	const visualizeShaderModule = device.createShaderModule({
		label: "visualizeShaderModule",
		code: visualizeShader,
	});

	const visualizePipeline = device.createRenderPipeline({
		label: "visualizePipeline",
		layout: "auto",
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

	const visualizeBindGroups = [
		device.createBindGroup({
			label: "visualizeBindGroupA",
			layout: visualizePipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: textureSampler,
				},
				{
					binding: 1,
					resource: textureViews[0],
				},
			],
		}),
		device.createBindGroup({
			label: "visualizeBindGroupB",
			layout: visualizePipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: textureSampler,
				},
				{
					binding: 1,
					resource: textureViews[1],
				},
			],
		}),
	];

	return {
		visualizePipeline,
		visualizeBindGroups,
	};
};
