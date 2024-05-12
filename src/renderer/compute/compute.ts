import computeShader from "./compute.wgsl?raw";

export const createComputePipeline = (
	device: GPUDevice,
	colorBufferView: GPUTextureView,
	cameraBuffer: GPUBuffer,
	materialBuffer: GPUBuffer,
	planeBuffer: GPUBuffer,
	sphereBuffer: GPUBuffer,
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
			{
				binding: 2,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
			{
				binding: 3,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
			{
				binding: 4,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
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
					buffer: cameraBuffer,
				},
			},
			{
				binding: 2,
				resource: {
					buffer: materialBuffer,
				},
			},
			{
				binding: 3,
				resource: {
					buffer: planeBuffer,
				},
			},
			{
				binding: 4,
				resource: {
					buffer: sphereBuffer,
				},
			},
		],
	});

	const computePipelineLayout = device.createPipelineLayout({
		label: "computePipelineLayout",
		bindGroupLayouts: [computeBindGroupLayout],
	});

	const computeShaderModule = device.createShaderModule({
		label: "computeShaderModule",
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
