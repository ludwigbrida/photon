import { Vector3 } from "@photon/core";

type WgslValue = {
  readonly alignment: number;
  readonly byteLength: number;
  readonly write: (view: DataView, byteOffset: number) => void;
};

const roundUp = (value: number, alignment: number): number => {
  return Math.ceil(value / alignment) * alignment;
};

export const f32 = (value: number): WgslValue => {
  return {
    alignment: 4,
    byteLength: 4,
    write: (view, byteOffset) => {
      view.setFloat32(byteOffset, value, true);
    },
  };
};

export const u32 = (value: number): WgslValue => {
  return {
    alignment: 4,
    byteLength: 4,
    write: (view, byteOffset) => {
      view.setUint32(byteOffset, value, true);
    },
  };
};

export const vec3f = (value: Vector3): WgslValue => {
  return {
    alignment: 16,
    byteLength: 12,
    write: (view, byteOffset) => {
      view.setFloat32(byteOffset, value[0], true);
      view.setFloat32(byteOffset + 4, value[1], true);
      view.setFloat32(byteOffset + 8, value[2], true);
    },
  };
};

const struct = (...members: readonly WgslValue[]): WgslValue => {
  let byteOffset = 0;
  let alignment = 1;

  const layout = members.map((member) => {
    byteOffset = roundUp(byteOffset, member.alignment);
    alignment = Math.max(alignment, member.alignment);

    const memberOffset = byteOffset;
    byteOffset += member.byteLength;

    return {
      member,
      byteOffset: memberOffset,
    };
  });

  const byteLength = roundUp(byteOffset, alignment);

  return {
    alignment,
    byteLength,
    write: (view, byteOffset) => {
      for (const item of layout) {
        item.member.write(view, byteOffset + item.byteOffset);
      }
    },
  };
};

export const pack = (...members: readonly WgslValue[]): ArrayBuffer => {
  const root = struct(...members);
  const buffer = new ArrayBuffer(root.byteLength);

  root.write(new DataView(buffer), 0);

  return buffer;
};
