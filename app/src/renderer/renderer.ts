import { Vector3 } from "../shared/types/vector3.ts";
import { createComputePipeline } from "./compute/compute.ts";
import { createContext } from "./helpers/context.ts";
import { createVisualizePipeline } from "./visualize/visualize.ts";

export const createRenderer = (
	device: GPUDevice,
	canvas: HTMLCanvasElement,
) => {
	const context = createContext(canvas, device);

	// Assets

	const colorBuffer = device.createTexture({
		label: "colorBuffer",
		size: {
			width: context.canvas.width,
			height: context.canvas.height,
		},
		format: "rgba8unorm",
		usage:
			GPUTextureUsage.COPY_DST |
			GPUTextureUsage.STORAGE_BINDING |
			GPUTextureUsage.TEXTURE_BINDING,
	});

	const colorBufferView = colorBuffer.createView({
		label: "colorBufferView",
	});

	const sampler = device.createSampler({
		label: "sampler",
		addressModeU: "repeat",
		addressModeV: "repeat",
		magFilter: "linear",
		minFilter: "nearest",
		mipmapFilter: "nearest",
		maxAnisotropy: 1,
	});

	const sceneBuffer = device.createBuffer({
		label: "sceneBuffer",
		size: 16,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});

	const voxelCount = 16;
	const voxelBuffer = device.createBuffer({
		label: "voxelBuffer",
		size: 4 * 4 * voxelCount,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	});

	const materialCount = 3;
	const materialBuffer = device.createBuffer({
		label: "materialBuffer",
		size: 4 * 4 * materialCount,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	});

	// Pipelines

	const { computeBindGroup, computePipeline } = createComputePipeline(
		device,
		colorBufferView,
		sceneBuffer,
		voxelBuffer,
		materialBuffer,
	);

	const { visualizeBindGroup, visualizePipeline } = createVisualizePipeline(
		device,
		colorBufferView,
		sampler,
	);

	return async (
		_: number,
		camera: Vector3,
		voxels: Int32Array,
		materials: Float32Array,
	) => {
		const begin = performance.now();

		device.queue.writeBuffer(sceneBuffer, 0, new Float32Array(camera), 0, 3);

		device.queue.writeBuffer(voxelBuffer, 0, voxels.buffer);
		device.queue.writeBuffer(materialBuffer, 0, materials.buffer);

		const commandEncoder = device.createCommandEncoder({
			label: "commandEncoder",
		});

		const computePass = commandEncoder.beginComputePass({
			label: "computePass",
		});
		computePass.setPipeline(computePipeline);
		computePass.setBindGroup(0, computeBindGroup);
		computePass.dispatchWorkgroups(
			context.canvas.width,
			context.canvas.height,
			1,
		);
		computePass.end();

		const textureView = context.getCurrentTexture().createView({
			label: "textureView",
		});

		const renderPass = commandEncoder.beginRenderPass({
			label: "visualizePass",
			colorAttachments: [
				{
					view: textureView,
					clearValue: { r: 0.5, g: 0, b: 0.25, a: 1 },
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});
		renderPass.setPipeline(visualizePipeline);
		renderPass.setBindGroup(0, visualizeBindGroup);
		renderPass.draw(6, 1, 0, 0);
		renderPass.end();

		const commandBuffer = commandEncoder.finish({
			label: "commandBuffer",
		});

		device.queue.submit([commandBuffer]);

		await device.queue.onSubmittedWorkDone();

		const end = performance.now();

		return end - begin;
	};
};
