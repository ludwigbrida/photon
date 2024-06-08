import {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useMemo,
	useState,
} from "react";

type MaterialContextProps = {
	materials: Material[];
	serializedMaterials: Float32Array;
	setMaterials: Dispatch<SetStateAction<Material[]>>;
};

export const MaterialContext = createContext(
	null as unknown as MaterialContextProps,
);

export const MaterialProvider = ({ children }: PropsWithChildren) => {
	const [materials, setMaterials] = useState<Material[]>([
		{
			name: "White",
			diffuse: [1, 1, 1],
			metallic: 0,
		},
		{
			name: "Red",
			diffuse: [1, 0, 0],
			metallic: 0,
		},
		{
			name: "Green",
			diffuse: [0, 1, 0],
			metallic: 0,
		},
		{
			name: "Left Sphere",
			diffuse: [0, 0, 0],
			metallic: 1,
		},
		{
			name: "Right Sphere",
			diffuse: [1, 1, 1],
			metallic: 0,
		},
	]);

	const serializedMaterials = useMemo(() => {
		return Float32Array.from(
			materials
				.map((material) => [...material.diffuse, material.metallic])
				.flat(),
		);
	}, [materials]);

	return (
		<MaterialContext.Provider
			value={{ materials, serializedMaterials, setMaterials }}
		>
			{children}
		</MaterialContext.Provider>
	);
};
