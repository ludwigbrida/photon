import { Vector3 } from "./vector3.ts";

/**
 * Type that represents a 4x4-dimensional matrix with members **m01** to **m33** in column-major notation.
 *
 * @example
 * const matrix: Matrix4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
 */
export type Matrix4 = Tuple<number, 16>;

/**
 * Creates a matrix from a translation vector.
 *
 * @param translation - The basis translation vector.
 *
 * @return A matrix representing the resulting translation transform.
 */
const createFromTranslation = (translation: Vector3): Matrix4 => {
	return [
		identity[0],
		identity[1],
		identity[2],
		identity[3],
		identity[4],
		identity[5],
		identity[6],
		identity[7],
		identity[8],
		identity[9],
		identity[10],
		identity[11],
		translation[0],
		translation[1],
		translation[2],
		identity[15],
	];
};

/**
 * Creates a perspective matrix.
 *
 * @param fieldOfView - The field of view in radians.
 * @param aspectRatio - The aspect ratio of the resulting view plane.
 * @param near - The near clipping plane.
 * @param far - The far clipping plane.
 *
 * @return A matrix representing the perspective projection.
 */
const createPerspective = (
	fieldOfView: number,
	aspectRatio: number,
	near: number,
	far: number,
): Matrix4 => {
	const fov = 1 / Math.tan(fieldOfView / 2);
	const inv = 1 / (near - far);
	return [
		fov / aspectRatio,
		identity[1],
		identity[2],
		identity[3],
		identity[4],
		fov,
		identity[6],
		identity[7],
		identity[8],
		identity[9],
		(near + far) * inv,
		-1,
		identity[12],
		identity[13],
		near * far * inv * 2,
		identity[15],
	];
};

const identity: Matrix4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export const matrix4 = {
	createFromTranslation,
	createPerspective,
	identity,
};
