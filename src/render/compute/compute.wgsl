@group(0) @binding(0) var outputTexture: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var inputTexture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> camera: Camera;
@group(0) @binding(3) var<storage, read> materials: array<Material>;
@group(0) @binding(4) var<storage, read> planes: array<Plane>;
@group(0) @binding(5) var<storage, read> spheres: array<Sphere>;

struct Ray {
	origin: vec3<f32>,
	direction: vec3<f32>,
}

struct Material {
	diffuse: vec3<f32>,
	metallic: f32,
}

struct Plane {
	position: vec3<f32>,
	normal: vec3<f32>,
	materialIndex: f32,
}

struct Sphere {
	position: vec3<f32>,
	radius: f32,
	materialIndex: f32,
}

struct Impact {
	position: vec3<f32>,
	normal: vec3<f32>,
	distance: f32,
	material: Material,
}

struct Light {
	color: vec3<f32>,
	direction: vec3<f32>,
}

struct Camera {
	position: vec3<f32>,
}

fn rayAt(ray: Ray, distance: f32) -> vec3<f32> {
	return ray.origin + ray.direction * distance;
}

fn intersectPlane(ray: Ray, plane: Plane, impact: ptr<function, Impact>) -> bool {
	let denominator = dot(plane.normal, ray.direction);

	if (denominator < 0) {
		let rayToPlane = plane.position - ray.origin;

		impact.distance = dot(rayToPlane, plane.normal) / denominator;
		impact.position = rayAt(ray, impact.distance);
		impact.normal = plane.normal;
		impact.material = materials[i32(plane.materialIndex)];

		// Ensure that the plane is in front of the ray
		// TODO: Should this be > 0 to ensure that e.g. shadow rays work?
		return impact.distance >= 0;
	}

	return false;
}

fn intersectSphere(ray: Ray, sphere: Sphere, impact: ptr<function, Impact>) -> bool {
	let a = dot(ray.direction, ray.direction);
	let b = dot(ray.direction, ray.origin - sphere.position) * 2;
	let c = dot(ray.origin - sphere.position, ray.origin - sphere.position) - sphere.radius * sphere.radius;
	let discriminant = b * b - 4 * a * c;

	// TODO: Split intersection check and impact calculation.
	// TODO: The impact should only be evaluated if the sphere is actually the
	// TODO: closest object to the camera for performance reasons.
	// TODO: - Loop over all objects in the scene and determine the closest one
	// TODO: - Do impact evaluation for closest object
	// TODO: - Calculate shading for this object

	impact.distance = (-b - sqrt(discriminant)) / (2 * a);
	impact.position = rayAt(ray, impact.distance);
	impact.normal = normalize(impact.position - sphere.position);
	impact.material = materials[u32(sphere.materialIndex)];

	return discriminant > 0 && impact.distance > 0;
}

/**
 * Intersect a ray with the entire scene.
 */
fn intersect(ray: Ray) -> Impact {
	// Keep track of the closest impact distance by initializing it with a very
	// high value, reducing it with every new impact that occurs at a closer
	// distance as we loop through the meshes.
	var closestDistance = f32(1e8);
	var closestImpact: Impact;

	// Loop through all planes in the scene.
	for (var i = 0u; i < arrayLength(&planes); i++) {
		let plane = planes[i];
		var impact: Impact;

		let hit = intersectPlane(ray, plane, &impact);

		// Check if the ray has hit a plane and whether the impact was closer than
		// our current closest distance, effectively occluding objects that are
		// further away.
		if (hit && impact.distance < closestDistance) {
			// Update the current closest distance to the impact distance.
			closestDistance = impact.distance;
			closestImpact = impact;
		}
	}

	// Loop through all spheres in the scene.
	for (var i = 0u; i < arrayLength(&spheres); i++) {
		let sphere = spheres[i];
		var impact: Impact;

		let hit = intersectSphere(ray, sphere, &impact);

		if (hit && impact.distance < closestDistance) {
			closestDistance = impact.distance;
			closestImpact = impact;
		}
	}

	return closestImpact;
}

/**
 * Calculate the color of a given ray.
 */
fn shade(incidentRay: Ray) -> vec3<f32> {
	const bounces = 1u;

	var color = vec3<f32>(0, 0, 0);
	var bouncedColor = vec3<f32>(1, 1, 1);

	var currentBounce = 0u;
	var ray = incidentRay;
	var impact: Impact;

	// TODO
	var light: Light;
	light.color = vec3<f32>(1, 1, 1);
	light.direction = normalize(vec3<f32>(0.5, -0.75, -1));

	impact = intersect(ray);

	// Loop while there is an intersection occuring and we did not exceed the
	// bounce limit.
	while (impact.distance < f32(1e8) && currentBounce < bounces + 1) {
		// Handle metallic surfaces by reflecting the ray.
		if (impact.material.metallic > 0.f) {
			ray.origin = impact.position;
			ray.direction = reflect(ray.direction, impact.normal);
			ray.direction = normalize(ray.direction);

			// bouncedColor *= impact.material.diffuse;

			currentBounce++;

			impact = intersect(ray);

		// The ray did hit a non-metallic material.
		} else {
			// Cast a new ray from the impact point to the light source
			// to determine whether it hits an object on the way.
			var shadowRay: Ray;
			shadowRay.origin = impact.position;
			shadowRay.direction = normalize(-light.direction);

			// Test whether the shadow ray hits an object in the scene.
			let shadowImpact = intersect(shadowRay);

			if (shadowImpact.distance < f32(1e8)) {
				// TODO
				color = vec3<f32>(0, 0, 0);
			} else {
				let diffuseContribution = max(dot(-light.direction, impact.normal), 0);
				color = impact.material.diffuse * diffuseContribution;
			}

			break;
		}
	}

	return color;
	// return color * bouncedColor;
}

@compute
@workgroup_size(1, 1, 1)
fn main(@builtin(global_invocation_id) pixel: vec3<u32>) {
	let screenSize = textureDimensions(outputTexture);
	let screenPosition = pixel.xy;

	let horizontalCoefficient = (f32(screenPosition.x) - f32(screenSize.x) / 2) / f32(screenSize.x);
	let verticalCoefficient = -((f32(screenPosition.y) - f32(screenSize.y) / 2) / f32(screenSize.x));

	let forward = vec3<f32>(0, 0, -1);
	let right = vec3<f32>(1, 0, 0);
	let up = vec3<f32>(0, 1, 0);

	let samples = 1u;

	var color = vec3(0.f);

	var ray: Ray;
	ray.origin = camera.position;
	ray.direction = normalize(forward + horizontalCoefficient * right + verticalCoefficient * up);

	// Gather samples around the target pixel for anti-aliasing.
	for (var i = 0u; i < samples; i++) {
		color = shade(ray);
	}

	// Store the final pixel color back into the output texture.
	textureStore(outputTexture, screenPosition, vec4(color, 1));
}
