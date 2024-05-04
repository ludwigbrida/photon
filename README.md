# 🌈 Photon

Photon is a minimalist, real-time [path tracer](https://en.wikipedia.org/wiki/Path_tracing), built from scratch using WebGPU compute shaders and [WGSL](https://w3.org/TR/WGSL).

- **Dependency-free:** The actual renderer uses no external dependencies; all rendering code and mathematical expressions have been implemented from scratch
- **Real-time:** This is a hardware accelerated path tracer, running computations in parallel on the GPU, which grants interactive frame rates for most operations

Photon takes a three-dimensional, geometric scene description and synthesizes an image by simulating the physically accurate propagation of light from the perspective of a virtual camera.

> [!TIP]
> A fully functional demo can be viewed and tested here: [photon.ludwigbrida.dev](https://photon.ludwigbrida.dev) ✨

## Features

- [x] Simple parametric shapes
  - Spheres
  - Cubes
- [ ] Arbitrary polygonal meshes
- [ ] Physically-based materials
  - Reflection
  - Refraction
  - Dielectrics
  - Metals
- [ ] Acceleration structures
- [ ] Global illumination
- [ ] Ambient occlusion
- [ ] Subsurface scattering

## Scenes

Photon takes in a descriptor in `JSON` format that outlines all objects and materials that are present in a scene as well as some metadata. An exemplary scene descriptor could roughly look like this:

```json
{
	"objects": [
		{
			"name": "Sphere",
			"transform": {
				"translation": [0, 0, 0],
				"rotation": [0, 0, 0],
				"scale": [1, 1, 1]
			},
			"mesh": {
				"type": "sphere",
				"radius": 1
			},
			"material": "768d515d-60a9-4183-9b66-2fb01f08c066"
		}
	],
	"materials": {
		"768d515d-60a9-4183-9b66-2fb01f08c066": {
			"name": "Metal",
			"albedo": [0, 0, 0],
			"reflectance": 1
		}
	},
	"meta": {
		"camera": {
			"transform": {
				"translation": [0, 0, -5],
				"rotation": [0, 0, 0],
				"scale": [1, 1, 1]
			}
		}
	}
}
```

## License

Photon is licensed under [MIT](./LICENSE.md).
