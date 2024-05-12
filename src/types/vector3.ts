/**
 * Type that represents a 3-dimensional vector with members **x**, **y** and **z**.
 *
 * @example
 * const vector: Vector3 = [1, 2, 3];
 */
export type Vector3 = Tuple<number, 3>;

/**
 * Adds two vectors.
 *
 * @example
 * const vector1: Vector3 = [1, 2, 3];
 * const vector2: Vector3 = [4, 5, 6];
 * const result = add(vector1, vector2); // [5, 7, 9]
 *
 * @param vector1 - The first vector to add.
 * @param vector2 - The second vector to add.
 *
 * @return A new vector representing the element-wise sum of both input vectors.
 */
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
