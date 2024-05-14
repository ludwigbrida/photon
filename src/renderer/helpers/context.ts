export const createContext = (canvas: HTMLCanvasElement, device: GPUDevice) => {
	const context = canvas.getContext("webgpu");

	if (!context) {
		throw new Error("Could not create context");
	}

	context.configure({
		device: device,
		format: "bgra8unorm",
	});

	return context;
};
