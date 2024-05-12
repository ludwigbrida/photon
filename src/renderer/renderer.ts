import { Vector3 } from "../types/vector3.ts";
import { createComputePipeline } from "./compute/compute";
import { createContext } from "./helpers/context";
import { createVisualizePipeline } from "./visualize/visualize";

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

	const cameraBuffer = device.createBuffer({
		label: "cameraBuffer",
		size: 4 * 4,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});

	const materialCount = 16;
	const materialBuffer = device.createBuffer({
		label: "materialBuffer",
		size: 3 * 4 * materialCount,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	});

	const planeCount = 16;
	const planeBuffer = device.createBuffer({
		label: "planeBuffer",
		size: 7 * 4 * planeCount,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	});

	const sphereCount = 16;
	const sphereBuffer = device.createBuffer({
		label: "sphereBuffer",
		size: 5 * 4 * sphereCount,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	});

	// Pipelines

	const { computeBindGroup, computePipeline } = createComputePipeline(
		device,
		colorBufferView,
		cameraBuffer,
		materialBuffer,
		planeBuffer,
		sphereBuffer,
	);

	const { visualizeBindGroup, visualizePipeline } = createVisualizePipeline(
		device,
		colorBufferView,
		sampler,
	);

	return async (
		_: number,
		cameraPosition: Vector3,
		materials: Float32Array,
		planes: Float32Array,
		spheres: Float32Array,
	) => {
		const begin = performance.now();

		device.queue.writeBuffer(cameraBuffer, 0, new Float32Array(cameraPosition));

		device.queue.writeBuffer(materialBuffer, 0, materials);
		device.queue.writeBuffer(planeBuffer, 0, planes);
		device.queue.writeBuffer(sphereBuffer, 0, spheres);

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
