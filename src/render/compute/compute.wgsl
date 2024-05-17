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
	var impact: Impact;

	// Keep track of the closest impact distance by initializing it with a very
	// high value, reducing it with every new impact that occurs at a closer
	// distance as we loop through the meshes.
	var closestDistance = f32(1e8);

	// Loop through all planes in the scene.
	for (var i = 0u; i < arrayLength(&planes); i++) {
		let plane = planes[i];

		let hit = intersectPlane(ray, plane, &impact);
	}

	// Loop through all spheres in the scene.
	for (var i = 0u; i < arrayLength(&spheres); i++) {
		let sphere = spheres[i];
	}

	return impact;
}

/**
 * Calculate the color of a given ray.
 */
fn shade(ray: Ray) -> vec3<f32> {
	return vec3(0);
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

	// Gather samples around the target pixel for anti-aliasing.
	for (var i = 0u; i < samples; i++) {}

	var ray: Ray;
	ray.origin = camera.position;
	ray.direction = normalize(forward + horizontalCoefficient * right + verticalCoefficient * up);

	var light: Light;
	light.color = vec3<f32>(1, 1, 1);
	light.direction = normalize(vec3<f32>(0.5, -0.75, -1));

	var closestDistance = f32(1e8);

	for (var i = 0u; i < arrayLength(&planes); i++) {
		var impact: Impact;

		if (intersectPlane(ray, planes[i], &impact) && impact.distance < closestDistance) {
			closestDistance = impact.distance;
			let diffuseContribution = max(dot(-light.direction, impact.normal), 0);
			color = impact.material.diffuse * diffuseContribution;
		}
	}

	// TODO: Continue by introducing the raytracing pipeline

	for (var i: u32 = 0; i < arrayLength(&spheres); i++) {
		var impact: Impact;

		if (intersectSphere(ray, spheres[i], &impact) && impact.distance < closestDistance) {
			closestDistance = impact.distance;
			let diffuseContribution = max(dot(-light.direction, impact.normal), 0);
			color = impact.material.diffuse * diffuseContribution;
		}
	}

	// Store the final pixel color back into the output texture.
	textureStore(outputTexture, screenPosition, vec4(color, 1));
}
