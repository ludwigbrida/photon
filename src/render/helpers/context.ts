export const createContext = (canvas: HTMLCanvasElement, device: GPUDevice) => {
	const context = canvas.getContext("webgpu");

	if (!context) {
		throw new Error("Could not create context");
	}

	const format = navigator.gpu.getPreferredCanvasFormat();

	context.configure({
		device,
		format,
	});

	return context;
};
