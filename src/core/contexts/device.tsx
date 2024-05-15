import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { createDevice } from "../../render/helpers/device.ts";

export type DeviceProps = {
	device: GPUDevice | undefined;
};

export const Device = createContext(null as unknown as DeviceProps);

export const DeviceContext = ({ children }: PropsWithChildren) => {
	const [device, setDevice] = useState<GPUDevice>();

	useEffect(() => {
		createDevice().then((device) => setDevice(device));
	}, []);

	return <Device.Provider value={{ device }}>{children}</Device.Provider>;
};
