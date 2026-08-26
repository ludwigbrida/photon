import { type Vector3 } from "@photon/core";
import { type Modifier } from "../types/modifier.ts";

export const move = (offset: Vector3): Modifier => {
  return (field) => {
    return {
      bounds: {
        min: [
          field.bounds.min[0] + offset[0],
          field.bounds.min[1] + offset[1],
          field.bounds.min[2] + offset[2],
        ],
        max: [
          field.bounds.max[0] + offset[0],
          field.bounds.max[1] + offset[1],
          field.bounds.max[2] + offset[2],
        ],
      },
      sample: (x, y, z) => {
        return field.sample(x - offset[0], y - offset[1], z - offset[2]);
      },
    };
  };
};
