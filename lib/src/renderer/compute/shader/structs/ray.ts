/**
 * Represents a ray.
 *
 * @example
 * let ray: Ray;
 * ray.origin = vec3f(0, 0, 0);
 * ray.direction = vec3f(0, 0, 1);
 */
export default `

struct Ray {
	origin: vec3<f32>,
	direction: vec3<f32>,
}

`;
