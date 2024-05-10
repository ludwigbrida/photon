// language=WGSL
export default `

fn intersectPlane(ray: Ray, plane: Plane, impact: ptr<function, Impact>) -> bool {
	let denominator = dot(plane.normal, ray.direction);

	if (abs(denominator) > 0.000001) {
		let rayToPlane = plane.origin - ray.origin;

		impact.distance = dot(rayToPlane, plane.normal) / denominator;
		impact.origin = ray.origin + ray.direction * impact.distance;
		impact.normal = plane.normal;
		impact.material = materials[i32(plane.materialIndex)];

		// return true;
		return impact.distance >= 0;
	}

	return false;
}

`;
