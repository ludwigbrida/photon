# Photon 🌈

> Create expressive procedural voxel scenes in code and bring them to life with physically based
> path tracing on the web.

Photon is a **code-first voxel scene authoring and rendering framework** built around procedural
generation and GPU-accelerated path tracing with WebGPU.

## Authoring ✨

Build voxel scenes _entirely from code_ by combining simple primitives and procedural generators into
complex structures.

```typescript
const scene = group(
  voxel(...),
  pyramid(...),
  customGenerator(...)
);
```

The authoring layer provides composable building blocks for procedural scene creation:

| Building block | Description |
| -------------- | ----------- |
|                |             |

Photon's goal is to make modeling feel more like programming than traditional 3D authoring:
define rules, compose them, and let the scene emerge from code.

## Rendering 🎨

### Capabilities

- ⚡ **GPU-accelerated** path tracing
- 🔄 **Progressive accumulation** for converging renders
- 💡 **Physically based light transport** including global illumination
- 📷 **Perspective and orthographic** cameras

## License

This software is provided under the [MIT license](./LICENSE.md).
