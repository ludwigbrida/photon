import { createComputePipeline } from "./compute/compute.ts";
import { createContext } from "./helpers/context.ts";
import { createDevice } from "./helpers/device.ts";
import { createVisualizePipeline } from "./visualize/visualize.ts";

export const createRenderer = async (canvas: HTMLCanvasElement) => {
	const device = await createDevice();
	const context = createContext(canvas, device);

	// Assets

	const colorBuffer = device.createTexture({
		size: {
			width: canvas.width,
			height: canvas.height,
		},
		format: "rgba8unorm",
		usage:
			GPUTextureUsage.COPY_DST |
			GPUTextureUsage.STORAGE_BINDING |
			GPUTextureUsage.TEXTURE_BINDING,
	});

	const colorBufferView = colorBuffer.createView();

	const sampler = device.createSampler({
		addressModeU: "repeat",
		addressModeV: "repeat",
		magFilter: "linear",
		minFilter: "nearest",
		mipmapFilter: "nearest",
		maxAnisotropy: 1,
	});

	const sceneBuffer = device.createBuffer({
		size: 16,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});

	// Pipelines

	const { computeBindGroup, computePipeline } = createComputePipeline(
		device,
		colorBufferView,
		sceneBuffer,
	);

	const { visualizeBindGroup, visualizePipeline } = createVisualizePipeline(
		device,
		colorBufferView,
		sampler,
	);

	return (_: number) => {
		const begin = performance.now();

		device.queue.writeBuffer(sceneBuffer, 0, new Float32Array([0, 0, 0]), 0, 3);

		const commandEncoder = device.createCommandEncoder();

		const computePass = commandEncoder.beginComputePass();
		computePass.setPipeline(computePipeline);
		computePass.setBindGroup(0, computeBindGroup);
		computePass.dispatchWorkgroups(canvas.width, canvas.height, 1);
		computePass.end();

		const textureView = context.getCurrentTexture().createView();

		const renderPass = commandEncoder.beginRenderPass({
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

		device.queue.submit([commandEncoder.finish()]);

		device.queue.onSubmittedWorkDone().then(() => {
			const end = performance.now();
			// console.log(end - begin);
		});
	};
};
