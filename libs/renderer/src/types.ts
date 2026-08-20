export type Scene = {
  readonly depth: number;
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
  orthographic: 0,
  perspective: 1,
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

export type Sun = {
  readonly azimuthDegrees: number;
  readonly elevationDegrees: number;
  readonly intensity: number;
  readonly color: readonly [number, number, number];
};

export type Environment = {
  readonly sun: Sun;
};

const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const createSunDirection = (
  azimuthDegrees: number,
  elevationDegrees: number,
): readonly [number, number, number] => {
  const azimuth = degreesToRadians(azimuthDegrees);
  const elevation = degreesToRadians(elevationDegrees);

  const horizontalLength = Math.cos(elevation);

  return [
    horizontalLength * Math.sin(azimuth),
    Math.sin(elevation),
    horizontalLength * Math.cos(azimuth),
  ];
};

export const createEnvironmentUniform = (environment: Environment): Float32Array => {
  const sunDirection = createSunDirection(
    environment.sun.azimuthDegrees,
    environment.sun.elevationDegrees,
  );

  return new Float32Array([
    sunDirection[0],
    sunDirection[1],
    sunDirection[2],
    environment.sun.intensity,
    environment.sun.color[0],
    environment.sun.color[1],
    environment.sun.color[2],
  ]);
};
