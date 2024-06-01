import computeShader from "./compute.wgsl?raw";

export const createComputeResources = (
	device: GPUDevice,
	textureViews: GPUTextureView[],
	cameraBuffer: GPUBuffer,
	materialBuffer: GPUBuffer,
	planeBuffer: GPUBuffer,
	sphereBuffer: GPUBuffer,
	directionalLightBuffer: GPUBuffer,
	pointLightBuffer: GPUBuffer,
) => {
	const computeShaderModule = device.createShaderModule({
		label: "computeShaderModule",
		code: computeShader,
	});

	const computeBindGroupLayout = device.createBindGroupLayout({
		label: "computeBindGroupLayout",
		entries: [
			// Output Texture
			{
				binding: 0,
				visibility: GPUShaderStage.COMPUTE,
				storageTexture: {
					access: "write-only",
					format: "rgba8unorm",
					viewDimension: "2d",
				},
			},
			// Input Texture
			{
				binding: 1,
				visibility: GPUShaderStage.COMPUTE,
				storageTexture: {
					access: "write-only",
					format: "rgba8unorm",
					viewDimension: "2d",
				},
			},
			// Camera
			{
				binding: 2,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "uniform",
				},
			},
			// Materials
			{
				binding: 3,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
			// Planes
			{
				binding: 4,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
			// Spheres
			{
				binding: 5,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
			// Directional Lights
			{
				binding: 6,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
			// Point Lights
			{
				binding: 7,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
		],
	});

	const computeBindGroups = [
		device.createBindGroup({
			label: "computeBindGroupA",
			layout: computeBindGroupLayout,
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
				{
					binding: 6,
					resource: {
						buffer: directionalLightBuffer,
					},
				},
				{
					binding: 7,
					resource: {
						buffer: pointLightBuffer,
					},
				},
			],
		}),
		device.createBindGroup({
			label: "computeBindGroupB",
			layout: computeBindGroupLayout,
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
				{
					binding: 6,
					resource: {
						buffer: directionalLightBuffer,
					},
				},
				{
					binding: 7,
					resource: {
						buffer: pointLightBuffer,
					},
				},
			],
		}),
	];

	const computePipelineLayout = device.createPipelineLayout({
		label: "computePipelineLayout",
		bindGroupLayouts: [computeBindGroupLayout],
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
		computeBindGroups,
		computePipeline,
	};
};
