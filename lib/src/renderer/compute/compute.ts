import shader from "./shader";

export const createComputePipeline = (
	device: GPUDevice,
	colorBufferView: GPUTextureView,
	scene: GPUBuffer,
	materialBuffer: GPUBuffer,
	planeBuffer: GPUBuffer,
	sphereBuffer: GPUBuffer,
) => {
	const computeBindGroupLayout = device.createBindGroupLayout({
		label: "computeBindGroupLayout",
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.COMPUTE,
				storageTexture: {
					access: "write-only",
					format: "rgba8unorm",
					viewDimension: "2d",
				},
			},
			{
				binding: 1,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "uniform",
				},
			},
			{
				binding: 2,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
			{
				binding: 3,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
			{
				binding: 4,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
		],
	});

	const computeBindGroup = device.createBindGroup({
		label: "computeBindGroup",
		layout: computeBindGroupLayout,
		entries: [
			{
				binding: 0,
				resource: colorBufferView,
			},
			{
				binding: 1,
				resource: {
					buffer: scene,
				},
			},
			{
				binding: 2,
				resource: {
					buffer: materialBuffer,
				},
			},
			{
				binding: 3,
				resource: {
					buffer: planeBuffer,
				},
			},
			{
				binding: 4,
				resource: {
					buffer: sphereBuffer,
				},
			},
		],
	});

	const computePipelineLayout = device.createPipelineLayout({
		label: "computePipelineLayout",
		bindGroupLayouts: [computeBindGroupLayout],
	});

	const computeShaderModule = device.createShaderModule({
		label: "computeShader",
		code: shader /*`
			struct Material {
				diffuse: vec3<f32>,
			}

			struct Voxel {
				position: vec3<i32>,
				materialIndex: i32,
			}

			struct Plane {
				origin: vec3<f32>,
				normal: vec3<f32>,
				materialIndex: i32,
			}

			struct Sphere {
				origin: vec3<f32>,
				radius: f32,
				materialIndex: i32,
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

			fn intersectPlane(ray: Ray, plane: Plane, impact: ptr<function, Impact>) -> bool {
				let denominator: f32 = dot(plane.normal, ray.direction);

				if (denominator > 0.000001) {
					let p0l0: vec3<f32> = plane.origin - ray.origin;

					impact.distance = dot(p0l0, plane.normal) / denominator;
					impact.origin = ray.origin + ray.direction * impact.distance;
					impact.normal = plane.normal;
					impact.material = materials[plane.materialIndex];

					return true;
					// return impact.distance >= 0;
				}

				return false;
			}

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

			fn calculateNormal(ray: Ray, tmin: f32, t1: vec3<f32>, t2: vec3<f32>) -> vec3<f32> {
					var normal: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
					let tNear: vec3<f32> = select(t2, t1, ray.direction > vec3<f32>(0.0, 0.0, 0.0));

					// Determine which face the ray hit based on tmin
					if (tNear.x == tmin) {
							normal = vec3<f32>(-sign(ray.direction.x), 0.0, 0.0);
					} else if (tNear.y == tmin) {
							normal = vec3<f32>(0.0, -sign(ray.direction.y), 0.0);
					} else if (tNear.z == tmin) {
							normal = vec3<f32>(0.0, 0.0, -sign(ray.direction.z));
					}
					return normal;
			}

			fn intersectVoxel2(ray: Ray, voxel: Voxel, impact: ptr<function, Impact>) -> bool {
					let voxelMin: vec3<f32> = vec3<f32>(voxel.position); // Lower corner of the voxel
					let voxelMax: vec3<f32> = vec3<f32>(voxel.position) + vec3<f32>(1.0, 1.0, 1.0); // Upper corner of the voxel

					let invDir: vec3<f32> = 1.0 / ray.direction;
					let t1: vec3<f32> = (voxelMin - ray.origin) * invDir;
					let t2: vec3<f32> = (voxelMax - ray.origin) * invDir;

					let tmin: f32 = max(max(min(t1.x, t2.x), min(t1.y, t2.y)), min(t1.z, t2.z));
					let tmax: f32 = min(min(max(t1.x, t2.x), max(t1.y, t2.y)), max(t1.z, t2.z));

					if (tmax < max(tmin, 0.0)) {
							return false;
					}

					impact.distance = tmin;
					impact.origin = ray.origin + ray.direction * tmin;
					impact.normal = calculateNormal(ray, tmin, t1, t2);
					impact.material = materials[voxel.materialIndex];

					return true;
			}

			fn intersectVoxel(ray: Ray, voxel: Voxel, impact: ptr<function, Impact>) -> bool {
				let voxelMin: vec3<f32> = vec3<f32>(voxel.position); // Lower corner of the voxel
				let voxelMax: vec3<f32> = vec3<f32>(voxel.position) + vec3<f32>(1.0, 1.0, 1.0); // Upper corner of the voxel

				let invDir: vec3<f32> = 1.0 / ray.direction;
				let t1: vec3<f32> = (voxelMin - ray.origin) * invDir;
				let t2: vec3<f32> = (voxelMax - ray.origin) * invDir;

				let tmin: f32 = max(max(min(t1.x, t2.x), min(t1.y, t2.y)), min(t1.z, t2.z));
				let tmax: f32 = min(min(max(t1.x, t2.x), max(t1.y, t2.y)), max(t1.z, t2.z));

				if (tmax < max(tmin, 0.0)) {
						return false;
				}

				impact.distance = tmin;
				impact.origin = ray.origin + ray.direction * tmin;
				// Calculate the normal based on the intersected face
				impact.normal = normalize(sign(ray.direction) * (1.0 - abs(step(voxelMax, (*impact).origin)) - abs(step((*impact).origin, voxelMin))));
				impact.material = materials[voxel.materialIndex];

				return true;
			}

			@group(0)
			@binding(0)
			var colorBuffer: texture_storage_2d<rgba8unorm, write>;

			@group(0)
			@binding(1)
			var<uniform> scene: Scene;

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

				// for (var i: u32 = 0; i < arrayLength(&voxels); i++) {
				// 	let voxel: Voxel = voxels[i]; // Access the voxel at index i
				// 	var impact: Impact;
				//
				// 	if (intersectVoxel2(ray, voxel, &impact) && impact.distance > 0) {
				// 		let diffuseContribution: f32 = max(dot(-light.direction, impact.normal), 0);
				// 		pixelColor = impact.material.diffuse * diffuseContribution;
				// 	}
				// }

				for (var i: u32 = 0; i < arrayLength(&planes); i++) {
					let plane: Plane = planes[i];
					var impact: Impact;

					if (intersectPlane(ray, plane, &impact)) {
						// let diffuseContribution: f32 = max(dot(-light.direction, impact.normal), 0);
						pixelColor = impact.material.diffuse; // * diffuseContribution;
					}
				}

				for (var i: u32 = 0; i < arrayLength(&spheres); i++) {
					let sphere: Sphere = spheres[i];
					var impact: Impact;

					if (intersectSphere(ray, sphere, &impact) && impact.distance > 0) {
						let diffuseContribution: f32 = max(dot(-light.direction, impact.normal), 0);
						pixelColor = impact.material.diffuse * diffuseContribution;
					}
				}

				textureStore(colorBuffer, screenPosition, vec4<f32>(pixelColor, 1));
			}
		`, */,
	});

	const computePipeline = device.createComputePipeline({
		label: "computePipeline",
		layout: computePipelineLayout,
		compute: {
			module: computeShaderModule,
			entryPoint: "main",
		},
	});

	return {
		computeBindGroup,
		computePipeline,
	};
};
