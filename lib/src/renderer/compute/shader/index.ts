import intersectPlane from "./functions/intersect-plane";
import intersectSphere from "./functions/intersect-sphere";
import Camera from "./structs/camera";
import Impact from "./structs/impact";
import Light from "./structs/light";
import Material from "./structs/material";
import Plane from "./structs/plane";
import Ray from "./structs/ray";
import Sphere from "./structs/sphere";

// language=WGSL
const main = `

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

`;

export default `

${Ray}
${Material}
${Plane}
${Sphere}
${Impact}
${Light}
${Camera}

${intersectPlane}
${intersectSphere}

${main}

`;
