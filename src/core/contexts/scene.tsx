import {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useState,
} from "react";
import { Vector3 } from "../../shared/types/vector3.ts";

export type SceneProps = {
	camera: Vector3;
	setCamera: Dispatch<SetStateAction<Vector3>>;
};

export const Scene = createContext(null as unknown as SceneProps);

export const SceneContext = ({ children }: PropsWithChildren) => {
	const [camera, setCamera] = useState<Vector3>([0, 0, 0]);

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
