import { type Material } from "../material.ts";
import { type Bounds } from "./bounds.ts";

export type Shape = {
  readonly bounds: Bounds;
  readonly sample: (x: number, y: number, z: number) => Material | undefined;
};
