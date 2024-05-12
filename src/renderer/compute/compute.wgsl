struct Ray {
	origin: vec3<f32>,
	direction: vec3<f32>,
}

struct Material {
	diffuse: vec3<f32>,
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

fn intersectPlaneLegacy(ray: Ray, plane: Plane, impact: ptr<function, Impact>) -> bool {
	let denominator = dot(plane.normal, ray.direction);

	if (abs(denominator) > 0.000001) {
		let rayToPlane = plane.position - ray.origin;

		impact.distance = dot(rayToPlane, plane.normal) / denominator;
		impact.position = ray.origin + ray.direction * impact.distance;
		impact.normal = plane.normal;
		impact.material = materials[i32(plane.materialIndex)];

		// return true;
		return impact.distance >= 0;
	}

	return false;
}

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
		impact.position = ray.origin + ray.direction * impact.distance;
		impact.normal = plane.normal;
		impact.material = materials[u32(plane.materialIndex)];

		// Only if hit from the right direction && Only hit if impact occurs in front of the ray
		return denominator < 0 && impact.distance > 0;
	//}

	// return false;
}

fn intersectSphere(ray: Ray, sphere: Sphere, impact: ptr<function, Impact>) -> bool {
	let a = dot(ray.direction, ray.direction);
	let b = dot(ray.direction, ray.origin - sphere.position) * 2;
	let c = dot(ray.origin - sphere.position, ray.origin - sphere.position) - sphere.radius * sphere.radius;
	let discriminant = b * b - 4 * a * c;

	impact.distance = (-b - sqrt(discriminant)) / (2 * a);
	impact.position = ray.origin + ray.direction * impact.distance;
	impact.normal = normalize(impact.position - sphere.position);
	impact.material = materials[u32(sphere.materialIndex)];

	return discriminant > 0 && impact.distance > 0;
}

@group(0)
@binding(0)
var colorBuffer: texture_storage_2d<rgba8unorm, write>;

@group(0)
@binding(1)
var<uniform> camera: Camera;

@group(0)
@binding(2)
var<storage, read> materials: array<Material>;

@group(0)
@binding(3)
var<storage, read> planes: array<Plane>;

@group(0)
@binding(4)
var<storage, read> spheres: array<Sphere>;

@compute
@workgroup_size(1, 1, 1)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
	let screenSize: vec2<u32> = textureDimensions(colorBuffer);
	let screenPosition: vec2<i32> = vec2<i32>(i32(globalInvocationId.x), i32(globalInvocationId.y));

	let horizontalCoefficient: f32 = (f32(screenPosition.x) - f32(screenSize.x) / 2) / f32(screenSize.x);
	let verticalCoefficient: f32 = -((f32(screenPosition.y) - f32(screenSize.y) / 2) / f32(screenSize.x));

	let forward: vec3<f32> = vec3<f32>(0, 0, -1);
	let right: vec3<f32> = vec3<f32>(1, 0, 0);
	let up: vec3<f32> = vec3<f32>(0, 1, 0);

	var ray: Ray;
	ray.origin = camera.position;
	ray.direction = normalize(forward + horizontalCoefficient * right + verticalCoefficient * up);

	var light: Light;
	light.color = vec3<f32>(1, 1, 1);
	light.direction = normalize(vec3<f32>(0.5, -0.75, -1));

	var pixelColor = vec3<f32>(0.5, 0, 0.25);
	var closestDistance = f32(1e8);

	for (var i: u32 = 0; i < arrayLength(&planes); i++) {
		let plane: Plane = planes[i];
		var impact: Impact;

		if (intersectPlane(ray, plane, &impact) && impact.distance < closestDistance) {
			closestDistance = impact.distance;
			let diffuseContribution = max(dot(-light.direction, impact.normal), 0);
			pixelColor = impact.material.diffuse * diffuseContribution;
		}
	}

	for (var i: u32 = 0; i < arrayLength(&spheres); i++) {
		let sphere: Sphere = spheres[i];
		var impact: Impact;

		if (intersectSphere(ray, sphere, &impact) && impact.distance < closestDistance) {
			closestDistance = impact.distance;
			let diffuseContribution = max(dot(-light.direction, impact.normal), 0);
			pixelColor = impact.material.diffuse * diffuseContribution;
		}
	}

	textureStore(colorBuffer, screenPosition, vec4<f32>(pixelColor, 1));
}
