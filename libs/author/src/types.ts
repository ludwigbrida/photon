export type Vec3 = readonly [number, number, number];

export type Color = readonly [number, number, number];

export type Voxel = {
  readonly type: "voxel";
  readonly position: Vec3;
  readonly color: Color;
};
