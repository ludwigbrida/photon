export const createComputePipeline = (
	device: GPUDevice,
	colorBufferView: GPUTextureView,
	scene: GPUBuffer,
	voxelBuffer: GPUBuffer,
	materialBuffer: GPUBuffer,
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
					buffer: voxelBuffer,
				},
			},
			{
				binding: 3,
				resource: {
					buffer: materialBuffer,
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
		code: `
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

			fn intersectSphere(ray: Ray, sphere: Sphere, impact: ptr<function, Impact>) -> bool {
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

				(*impact).distance = tmin;
				(*impact).origin = ray.origin + ray.direction * tmin;
				// Calculate the normal based on the intersected face
				(*impact).normal = normalize(sign(ray.direction) * (1.0 - abs(step(voxelMax, (*impact).origin)) - abs(step((*impact).origin, voxelMin))));
				(*impact).material = materials[voxel.materialIndex];

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

				/* if (intersectSphere(ray, sphere, &impact) && impact.distance > 0) {
				let diffuseContribution: f32 = max(dot(-light.direction, impact.normal), 0);
				pixelColor = vec3<f32>(0.5, 1, 0.75) * diffuseContribution;
				} */

				for (var i: u32 = 0; i < arrayLength(&voxels); i++) {
					let voxel: Voxel = voxels[i]; // Access the voxel at index i
					var impact: Impact;

					if (intersectVoxel(ray, voxel, &impact) && impact.distance > 0) {
						pixelColor = impact.material.diffuse;
					}
				}

				textureStore(colorBuffer, screenPosition, vec4<f32>(pixelColor, 1));
			}
		`,
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
