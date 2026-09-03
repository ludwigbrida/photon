import type { AuthorNode } from "./types.ts";

export type Group = {
  readonly type: "group";
  readonly children: readonly AuthorNode[];
};

export const group = (...children: AuthorNode[]): Group => ({
  type: "group",
  children,
});
