# 🌈 Photon

Photon is a minimalist, real-time [path tracer](https://en.wikipedia.org/wiki/Path_tracing), built from scratch using WebGPU compute shaders and [WGSL](https://w3.org/TR/WGSL).

- **Dependency-free:** The actual renderer uses no external dependencies; all rendering code and mathematical expressions have been implemented from scratch
- **Real-time:** This is a hardware accelerated path tracer, running computations in parallel on the GPU, which grants interactive frame rates for most operations

Photon takes a three-dimensional, geometric scene description and synthesizes an image by simulating the physically accurate propagation of light from the perspective of a virtual camera.

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

## License

Photon is licensed under [MIT](./LICENSE.md).
