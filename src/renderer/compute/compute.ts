import computeShader from "./compute.wgsl?raw";

export const createComputePipeline = (
	device: GPUDevice,
	colorBufferView: GPUTextureView,
	scene: GPUBuffer,
) => {
	const computeBindGroupLayout = device.createBindGroupLayout({
		label: "computeBindGroupLayout",
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
		label: "computeBindGroup",
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
		label: "computePipelineLayout",
		bindGroupLayouts: [computeBindGroupLayout],
	});

	const computeShaderModule = device.createShaderModule({
		label: "computeShader",
		code: computeShader,
	});

	const computePipeline = device.createComputePipeline({
		label: "computePipeline",
		layout: computePipelineLayout,
		compute: {
			module: computeShaderModule,
			entryPoint: "main",
		},
	});

	return {
		computeBindGroup,
		computePipeline,
	};
};