export default `

fn intersectSphere(ray: Ray, sphere: Sphere, impact: ptr<function, Impact>) -> bool {
	let a: f32 = dot(ray.direction, ray.direction);
	let b: f32 = 2 * dot(ray.direction, ray.origin - sphere.origin);
	let c: f32 = dot(ray.origin - sphere.origin, ray.origin - sphere.origin) - sphere.radius * sphere.radius;
	let discriminant: f32 = b * b - 4 * a * c;

	impact.distance = (-b - sqrt(discriminant)) / (2 * a);
	impact.origin = ray.origin + ray.direction * (*impact).distance;
	impact.normal = normalize((*impact).origin - sphere.origin);
	impact.material = materials[sphere.materialIndex];

	return discriminant > 0;
}

`;
