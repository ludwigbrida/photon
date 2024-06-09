import {
	createContext,
	Dispatch,
	MutableRefObject,
	PropsWithChildren,
	SetStateAction,
} from "react";
import { useRefState } from "../../shared/hooks/use-ref-state.ts";
import { Vector3 } from "../../types/vector3.ts";

export type ConfigProps = {
	camera: MutableRefObject<Vector3>;
	setCamera: Dispatch<SetStateAction<Vector3>>;
};

export const Config = createContext(null as unknown as ConfigProps);

export const ConfigProvider = ({ children }: PropsWithChildren) => {
	const [camera, setCamera] = useRefState<Vector3>([0, 0, 8]);

	return (
		<Config.Provider
			value={{
				camera,
				setCamera,
			}}
		>
			{children}
		</Config.Provider>
	);
};
