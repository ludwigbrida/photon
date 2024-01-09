export type Vector3 = [number, number, number];

const add = (vector1: Vector3, vector2: Vector3): Vector3 => {
	return [
		vector1[0] + vector2[0],
		vector1[1] + vector2[1],
		vector1[2] + vector2[2],
	];
};

export const vector3 = {
	add,
};
