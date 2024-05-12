import {
	createContext,
	Dispatch,
	MutableRefObject,
	PropsWithChildren,
	SetStateAction,
} from "react";
import { useRefState } from "../../shared/hooks/use-ref-state.ts";
import { Vector3 } from "../../types/vector3.ts";

export type SceneProps = {
	camera: MutableRefObject<Vector3>;
	setCamera: Dispatch<SetStateAction<Vector3>>;
};

export const Scene = createContext(null as unknown as SceneProps);

export const SceneContext = ({ children }: PropsWithChildren) => {
	const [camera, setCamera] = useRefState<Vector3>([0, 0, 0]);

	return (
		<Scene.Provider
			value={{
				camera,
				setCamera,
			}}
		>
			{children}
		</Scene.Provider>
	);
};
