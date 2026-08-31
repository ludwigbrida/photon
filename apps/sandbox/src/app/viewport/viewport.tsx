import type { Ref } from "react";

type ViewportProps = {
  readonly ref: Ref<HTMLCanvasElement>;
};

export const Viewport = ({ ref }: ViewportProps) => {
  return (
    <canvas
      className="block h-full min-w-0 flex-1 object-contain"
      ref={ref}
      width={640}
      height={480}
    />
  );
};
