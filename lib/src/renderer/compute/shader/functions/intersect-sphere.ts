// language=WGSL
export default `

fn intersectSphere(ray: Ray, sphere: Sphere, impact: ptr<function, Impact>) -> bool {
	let a = dot(ray.direction, ray.direction);
	let b = dot(ray.direction, ray.origin - sphere.position) * 2;
	let c = dot(ray.origin - sphere.position, ray.origin - sphere.position) - sphere.radius * sphere.radius;
	let discriminant = b * b - 4 * a * c;

	impact.distance = (-b - sqrt(discriminant)) / (2 * a);
	impact.origin = ray.origin + ray.direction * impact.distance;
	impact.normal = normalize(impact.origin - sphere.position);
	impact.material = materials[u32(sphere.materialIndex)];

	return discriminant > 0 && impact.distance > 0;
}

`;
