import {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useMemo,
	useState,
} from "react";
import { black, green, red, white } from "../../types/color.ts";

type MaterialProps = {
	materials: Material[];
	serializedMaterials: Float32Array;
	setMaterials: Dispatch<SetStateAction<Material[]>>;
};

export const Material = createContext(null as unknown as MaterialProps);

export const MaterialProvider = ({ children }: PropsWithChildren) => {
	const [materials, setMaterials] = useState<Material[]>([
		{
			name: "White",
			diffuse: white,
			metallic: 0,
		},
		{
			name: "Red",
			diffuse: red,
			metallic: 0,
		},
		{
			name: "Green",
			diffuse: green,
			metallic: 0,
		},
		{
			name: "Left Sphere",
			diffuse: black,
			metallic: 1,
		},
		{
			name: "Right Sphere",
			diffuse: white,
			metallic: 0,
		},
	]);

	const serializedMaterials = useMemo(() => {
		return Float32Array.from(
			materials.flatMap((material) => [...material.diffuse, material.metallic]),
		);
	}, [materials]);

	return (
		<Material.Provider value={{ materials, serializedMaterials, setMaterials }}>
			{children}
		</Material.Provider>
	);
};
