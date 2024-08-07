import { Vector3 } from "../types/vector3.ts";
import { createComputeResources } from "./compute/compute.ts";
import { createContext } from "./helpers/context.ts";
import { createVisualizeResources } from "./visualize/visualize.ts";

export const createRenderer = (
	device: GPUDevice,
	canvas: HTMLCanvasElement,
) => {
	const context = createContext(canvas, device);

	const textureSampler = device.createSampler({
		label: "textureSampler",
		magFilter: "linear",
		minFilter: "linear",
	});

	const textureA = device.createTexture({
		label: "textureA",
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

	const textureB = device.createTexture({
		label: "textureB",
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

	const textureViews = [
		textureA.createView({
			label: "textureViewA",
		}),
		textureB.createView({
			label: "textureViewB",
		}),
	];

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

	const directionalLightCount = 4;
	const directionalLightBuffer = device.createBuffer({
		label: "directionLightBuffer",
		size: 6 * 4 * directionalLightCount,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	});

	const pointLightCount = 8;
	const pointLightBuffer = device.createBuffer({
		label: "pointLightBuffer",
		size: 6 * 4 * pointLightCount,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	});

	const { computeBindGroups, computePipeline } = createComputeResources(
		device,
		textureViews,
		cameraBuffer,
		materialBuffer,
		planeBuffer,
		sphereBuffer,
		directionalLightBuffer,
		pointLightBuffer,
	);

	const { visualizeBindGroups, visualizePipeline } = createVisualizeResources(
		device,
		textureSampler,
		textureViews,
	);

	return async (
		_: number,
		step: number,
		cameraPosition: Vector3,
		materials: Float32Array,
		planes: Float32Array,
		spheres: Float32Array,
		directionalLights: Float32Array,
		pointLights: Float32Array,
	) => {
		const begin = performance.now();

		device.queue.writeBuffer(cameraBuffer, 0, new Float32Array(cameraPosition));

		device.queue.writeBuffer(materialBuffer, 0, materials);
		device.queue.writeBuffer(planeBuffer, 0, planes);
		device.queue.writeBuffer(sphereBuffer, 0, spheres);
		device.queue.writeBuffer(directionalLightBuffer, 0, directionalLights);
		device.queue.writeBuffer(pointLightBuffer, 0, pointLights);

		const commandEncoder = device.createCommandEncoder({
			label: "commandEncoder",
		});

		const computePass = commandEncoder.beginComputePass({
			label: "computePass",
		});
		computePass.setPipeline(computePipeline);
		computePass.setBindGroup(0, computeBindGroups[step % 2]);
		computePass.dispatchWorkgroups(context.canvas.width, context.canvas.height);
		computePass.end();

		const canvasTextureView = context.getCurrentTexture().createView({
			label: "canvasTextureView",
		});

		const visualizePass = commandEncoder.beginRenderPass({
			label: "visualizePass",
			colorAttachments: [
				{
					view: canvasTextureView,
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});
		visualizePass.setPipeline(visualizePipeline);
		visualizePass.setBindGroup(0, visualizeBindGroups[step % 2]);
		visualizePass.draw(6);
		visualizePass.end();

		const commandBuffer = commandEncoder.finish({
			label: "commandBuffer",
		});

		device.queue.submit([commandBuffer]);

		await device.queue.onSubmittedWorkDone();

		const end = performance.now();

		return end - begin;
	};
};
