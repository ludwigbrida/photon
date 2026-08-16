export type SceneInput = {
  readonly voxels: Uint32Array;
  readonly materials: Float32Array;
};

export type PerspectiveCamera = {
  readonly mode: "perspective";
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly fov: number;
};

export type OrthographicCamera = {
  readonly mode: "orthographic";
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly scale: number;
};

export type Camera = PerspectiveCamera | OrthographicCamera;

const cameraMode = {
  perspective: 1,
  orthographic: 0,
} as const;

export const createCameraUniform = (camera: Camera): Float32Array => {
  const parameter = camera.mode === "perspective" ? (camera.fov * Math.PI) / 180 : camera.scale;

  return new Float32Array([
    camera.position[0],
    camera.position[1],
    camera.position[2],
    cameraMode[camera.mode],
    camera.target[0],
    camera.target[1],
    camera.target[2],
    parameter,
  ]);
};
