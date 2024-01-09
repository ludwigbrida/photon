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

	return async (_: number, camera: Vector3) => {
		const begin = performance.now();

		device.queue.writeBuffer(sceneBuffer, 0, new Float32Array(camera), 0, 3);

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

		device.queue.submit([
			commandEncoder.finish({
				label: "commandBuffer",
			}),
		]);

		await device.queue.onSubmittedWorkDone();

		const end = performance.now();

		return end - begin;
	};
};
