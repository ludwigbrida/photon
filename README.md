# Photon 🌈

> Create expressive procedural voxel scenes in code and bring them to life with physically based
> path tracing on the web.

Photon is a **code-first voxel scene authoring and rendering framework** built around procedural
generation and GPU-accelerated path tracing with WebGPU.

## Authoring ✨

Build voxel scenes **entirely from code** by combining simple primitives and procedural generators
into complex structures. Rather than manually placing thousands of voxels, you describe _the rules
that produce them_ using strongly-typed functions.

```typescript
const scene = group(
  voxel(...),
  pyramid(...),
  customGenerator(...)
);
```

The authoring layer provides composable building blocks that can be reused, transformed, nested and
combined as you wish:

| Concept         | Purpose                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- |
| 🎨 Materials    | Define how generated surfaces interact with light.                                                 |
| 🧊 Primitives   | Basic building blocks (e.g. `cube`, `sphere`, `pyramid`) from which voxel geometry can be created. |
| 🔧 Transformers | Modify (e.g. `translate`, `scale`) or combine (e.g. `union`) generated geometry.                   |
| ⚙️ Generators   | Procedurally produce custom geometry according to your own algorithms.                             |
| 📦 Groups       | Compose multiple elements into reusable, hierarchical structures.                                  |

Photon's goal is to make modeling feel more like programming than traditional 3D authoring:
define rules, compose them, and let the scene emerge from code.

## Rendering 🖥️

### Capabilities

- ⚡ **GPU-accelerated** path tracing
- 🔄 **Progressive accumulation** for converging renders
- 💡 **Physically based light transport** including global illumination
- 🎨 **BSDF material pipeline**
  - _Diffuse reflection_ — Lambertian-style diffuse light scattering
- 📷 **Perspective and orthographic** cameras

## License

This software is provided under the [MIT license](./LICENSE.md).
