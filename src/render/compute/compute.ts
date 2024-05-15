import computeShader from "./compute.wgsl?raw";

export const createComputeResources = (
	device: GPUDevice,
	textureViews: GPUTextureView[],
	cameraBuffer: GPUBuffer,
	materialBuffer: GPUBuffer,
	planeBuffer: GPUBuffer,
	sphereBuffer: GPUBuffer,
) => {
	const computeShaderModule = device.createShaderModule({
		label: "computeShaderModule",
		code: computeShader,
	});

	const computePipeline = device.createComputePipeline({
		label: "computePipeline",
		layout: "auto",
		compute: {
			module: computeShaderModule,
			entryPoint: "main",
		},
	});

	const computeBindGroups = [
		device.createBindGroup({
			label: "computeBindGroupA",
			layout: computePipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: textureViews[0],
				},
				{
					binding: 1,
					resource: textureViews[1],
				},
				{
					binding: 2,
					resource: {
						buffer: cameraBuffer,
					},
				},
				{
					binding: 3,
					resource: {
						buffer: materialBuffer,
					},
				},
				{
					binding: 4,
					resource: {
						buffer: planeBuffer,
					},
				},
				{
					binding: 5,
					resource: {
						buffer: sphereBuffer,
					},
				},
			],
		}),
		device.createBindGroup({
			label: "computeBindGroupB",
			layout: computePipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: textureViews[1],
				},
				{
					binding: 1,
					resource: textureViews[0],
				},
				{
					binding: 2,
					resource: {
						buffer: cameraBuffer,
					},
				},
				{
					binding: 3,
					resource: {
						buffer: materialBuffer,
					},
				},
				{
					binding: 4,
					resource: {
						buffer: planeBuffer,
					},
				},
				{
					binding: 5,
					resource: {
						buffer: sphereBuffer,
					},
				},
			],
		}),
	];

	return {
		computePipeline,
		computeBindGroups,
	};
};
