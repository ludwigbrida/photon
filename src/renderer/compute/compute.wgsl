struct Material {
	diffuse: vec3<f32>,
}

struct Voxel {
	position: vec3<i32>,
	materialIndex: i32,
}

struct Sphere {
	origin: vec3<f32>,
	radius: f32,
	material: Material,
}

struct Ray {
	origin: vec3<f32>,
	direction: vec3<f32>,
}

struct Impact {
	origin: vec3<f32>,
	normal: vec3<f32>,
	distance: f32,
	material: Material,
}

struct Light {
	color: vec3<f32>,
	direction: vec3<f32>,
}

struct Scene {
	cameraPosition: vec3<f32>,
}

fn intersect(ray: Ray, sphere: Sphere, impact: ptr<function, Impact>) -> bool {
	let a: f32 = dot(ray.direction, ray.direction);
	let b: f32 = 2 * dot(ray.direction, ray.origin - sphere.origin);
	let c: f32 = dot(ray.origin - sphere.origin, ray.origin - sphere.origin) - sphere.radius * sphere.radius;
	let discriminant: f32 = b * b - 4 * a * c;

	(*impact).distance = (-b - sqrt(discriminant)) / (2 * a);
	(*impact).origin = ray.origin + ray.direction * (*impact).distance;
	(*impact).normal = normalize((*impact).origin - sphere.origin);
	(*impact).material = sphere.material;

	return discriminant > 0;
}

@group(0)
@binding(0)
var colorBuffer: texture_storage_2d<rgba8unorm, write>;

@group(0)
@binding(1)
var<uniform> scene: Scene;

@group(0)
@binding(2)
var<storage, read> voxels: array<Voxel>;

@group(0)
@binding(3)
var<storage, read> materials: array<Material>;

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

	var sphere: Sphere;
	sphere.origin = vec3<f32>(0, 0, -5);
	sphere.radius = 1;

	var ray: Ray;
	ray.origin = scene.cameraPosition;
	ray.direction = normalize(forward + horizontalCoefficient * right + verticalCoefficient * up);

	var light: Light;
	light.color = vec3<f32>(1, 1, 1);
	light.direction = normalize(vec3<f32>(1, -1, -1));

	var pixelColor: vec3<f32> = vec3<f32>(0.5, 0, 0.25);

	var impact: Impact;

	if (intersect(ray, sphere, &impact) && impact.distance > 0) {
		let diffuseContribution: f32 = max(dot(-light.direction, impact.normal), 0);
		pixelColor = vec3<f32>(0.5, 1, 0.75) * diffuseContribution;
	}

	textureStore(colorBuffer, screenPosition, vec4<f32>(pixelColor, 1));
}
