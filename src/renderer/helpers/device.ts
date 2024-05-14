export const createDevice = async () => {
	if (!navigator.gpu) {
		throw new Error("Browser does not support WebGPU");
	}

	const adapter = await navigator.gpu.requestAdapter({
		powerPreference: "high-performance",
	});

	if (!adapter) {
		throw new Error("Could not request adapter");
	}

	return adapter.requestDevice({
		label: "device",
	});
};
