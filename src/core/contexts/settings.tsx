import {
	createContext,
	Dispatch,
	MutableRefObject,
	PropsWithChildren,
	SetStateAction,
} from "react";
import { useRefState } from "../../shared/hooks/use-ref-state.ts";
import { Vector3 } from "../../types/vector3.ts";

export type SettingsProps = {
	camera: MutableRefObject<Vector3>;
	setCamera: Dispatch<SetStateAction<Vector3>>;
};

export const Settings = createContext(null as unknown as SettingsProps);

export const SettingsContext = ({ children }: PropsWithChildren) => {
	const [camera, setCamera] = useRefState<Vector3>([0, 0, 8]);

	return (
		<Settings.Provider
			value={{
				camera,
				setCamera,
			}}
		>
			{children}
		</Settings.Provider>
	);
};
