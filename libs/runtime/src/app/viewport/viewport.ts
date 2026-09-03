import { html, mounted, type Ref, ref } from "@grainular/nord";

type ViewportProps = {
  readonly canvasRef: Ref<HTMLCanvasElement>;
  readonly onMount: () => () => void;
};

export const Viewport = ({ canvasRef, onMount }: ViewportProps) => html`
  <canvas
    class="block h-full min-w-0 flex-1 object-contain [image-rendering:pixelated]"
    ${ref(canvasRef)}
    ${mounted(onMount)}
    width="640"
    height="480"
  ></canvas>
`;
