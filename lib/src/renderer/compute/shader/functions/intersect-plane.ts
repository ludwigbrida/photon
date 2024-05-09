// language=WGSL
export default `

fn intersectPlane(ray: Ray, plane: Plane, impact: ptr<function, Impact>) -> bool {
	let denominator: f32 = dot(plane.normal, ray.direction);

	if (denominator > 0.000001) {
		let p0l0: vec3f = plane.origin - ray.origin;

		impact.distance = dot(p0l0, plane.normal) / denominator;
		impact.origin = ray.origin + ray.direction * impact.distance;
		impact.normal = plane.normal;
		impact.material = materials[plane.materialIndex];

		return true;
		// return impact.distance >= 0;
	}

	return false;
}

`;
