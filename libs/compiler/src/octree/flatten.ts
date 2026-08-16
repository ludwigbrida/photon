import { encodeBranch, encodeEmpty, encodeLeaf } from "./encode.ts";
import { Node } from "./node.ts";

export const flattenOctree = (root: Node): Uint32Array => {
  const nodes: number[] = [];

  const writeNode = (node: Node, index: number): void => {
    if (node.type === "empty") {
      nodes[index] = encodeEmpty();
      return;
    }

    if (node.type === "leaf") {
      nodes[index] = encodeLeaf(node.materialIndex);
      return;
    }

    const firstChildIndex = nodes.length;

    // Reserve eight consecutive slots for this branch's children.
    for (let i = 0; i < 8; i++) {
      nodes.push(encodeEmpty());
    }

    nodes[index] = encodeBranch(firstChildIndex);

    for (let i = 0; i < 8; i++) {
      writeNode(node.children[i], firstChildIndex + i);
    }
  };

  // Reserve the root node at index 0.
  nodes.push(encodeEmpty());

  writeNode(root, 0);

  return new Uint32Array(nodes);
};
