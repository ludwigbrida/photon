import computeShader from "./compute.wgsl?raw";

export const createComputePipeline = (
	device: GPUDevice,
	colorBufferView: GPUTextureView,
	scene: GPUBuffer,
) => {
	const computeBindGroupLayout = device.createBindGroupLayout({
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.COMPUTE,
				storageTexture: {
					access: "write-only",
					format: "rgba8unorm",
					viewDimension: "2d",
				},
			},
			{
				binding: 1,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "uniform",
				},
			},
		],
	});

	const computeBindGroup = device.createBindGroup({
		layout: computeBindGroupLayout,
		entries: [
			{
				binding: 0,
				resource: colorBufferView,
			},
			{
				binding: 1,
				resource: {
					buffer: scene,
				},
			},
		],
	});

	const computePipelineLayout = device.createPipelineLayout({
		bindGroupLayouts: [computeBindGroupLayout],
	});

	const computePipeline = device.createComputePipeline({
		layout: computePipelineLayout,
		compute: {
			module: device.createShaderModule({
				code: computeShader,
			}),
			entryPoint: "main",
		},
	});

	return {
		computeBindGroup,
		computePipeline,
	};
};
