# Photon 🌈

Create expressive procedural voxel scenes in code and bring them to life with physically based path
tracing on the web.

> [!IMPORTANT]
> This project is currently under active development and all APIs are subject to change. You are
> welcome to check it out, but should not use it for serious projects yet.

Photon is a **code-first voxel scene authoring and rendering framework** built around procedural
generation and GPU-accelerated path tracing with WebGPU.

## Authoring ✨

Build voxel scenes **entirely from code** by combining simple primitives and procedural generators
into complex structures. Rather than manually placing thousands of voxels, you describe _the rules
that produce them_ using strongly-typed functions.

```typescript
const white = material({
  color: [1, 1, 1],
});

const emissive = material({
  color: [1, 0.22, 0.03],
  emission: {
    color: [1, 0.16, 0.015],
    strength: 20,
  },
});

const scene = group(
  pyramid({
    position: [0, 0, 0],
    height: 10,
    material: white,
  }),
  voxel({
    position: [0, 3, -7],
    material: emissive,
  }),
);
```

The authoring layer provides composable building blocks that can be reused, nested and combined as
you wish:

| Concept       | Purpose                                                                |
| ------------- | ---------------------------------------------------------------------- |
| 🎨 Materials  | Define how generated surfaces interact with light.                     |
| 🧊 Primitives | Basic building blocks from which voxel geometry can be created.        |
| ⚙️ Generators | Procedurally produce custom geometry according to your own algorithms. |
| 📦 Groups     | Compose multiple elements into reusable, hierarchical structures.      |

Photon's goal is to make modeling feel more like programming than traditional 3D authoring:
define rules, compose them, and let the scene emerge from code.

## Rendering 🖥️

### Capabilities

- ⚡ **GPU-accelerated** path tracing from a sparse voxel octree
- 🔄 **Progressive accumulation** for converging renders
  - Stochastic _anti-aliasing_
- 💡 **Physically based light transport** with global illumination
- 🎨 **BSDF material pipeline**
  - _Diffuse reflection_ — Lambertian-style diffuse light scattering
  - _Metallic reflection_ — Ideal smooth mirror reflection
  - _Emission_ — Glowing surfaces can emit radiance
- ☀️ **Sun and gradient-sky** environment lighting, including hard or soft shadows
- 📷 **Perspective and orthographic** cameras

## License

This software is provided under the [MIT license](./LICENSE.md).
