// language=WGSL
export const example = `

fn intersectPlane(ray: Ray, plane: Plane, impact: ptr<function, Impact>) -> bool {
	let denominator = dot(plane.normal, ray.direction);

	if (abs(denominator) > 0.000001) {
		let rayToPlane = plane.position - ray.origin;

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

// language=WGSL
export default `

fn intersectPlane(ray: Ray, plane: Plane, impact: ptr<function, Impact>) -> bool {
	let rayToPlane = plane.position - ray.origin;
	let denominator = dot(rayToPlane, plane.normal);
	let vn = dot(ray.direction, plane.normal);
	let t = denominator / vn;

	if (vn == 0) {
		// Ray is parallel to plane
		return false;
	}

	if (t < 0) {
		// Ray in front of plane
		return false;
	}

	//if (denominator < 0) {
		impact.distance = t;
		impact.origin = ray.origin + ray.direction * impact.distance;
		impact.normal = plane.normal;
		impact.material = materials[i32(plane.materialIndex)];

		return true;
	//}

	// return false;
}

`;
