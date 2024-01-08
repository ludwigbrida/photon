export const createDevice = async () => {
	const adapter = await navigator.gpu.requestAdapter();

	if (!adapter) {
		throw Error("Could not request adapter");
	}

	return adapter.requestDevice({
		label: "device",
	});
};
