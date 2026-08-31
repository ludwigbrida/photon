import { Ref } from "react";

type CanvasProps = {
  readonly ref: Ref<HTMLCanvasElement>;
};

export const Canvas = ({ ref }: CanvasProps) => {
  return <canvas className="canvas" ref={ref} width={640} height={480} />;
};
