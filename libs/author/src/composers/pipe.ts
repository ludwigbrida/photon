import { type Modifier } from "../types/modifier.ts";
import { type Shape } from "../types/shape.ts";

export const pipe = (shape: Shape, ...modifiers: readonly Modifier[]): Shape => {
  return modifiers.reduce((result, modifier) => modifier(result), shape);
};
