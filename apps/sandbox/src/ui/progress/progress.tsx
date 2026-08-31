import { Progress as BaseProgress } from "@base-ui/react/progress";

type ProgressProps = {
  readonly value: number;
  readonly max: number;
};

export const Progress = ({ value, max }: ProgressProps) => {
  return (
    <BaseProgress.Root value={value} max={max}>
      <BaseProgress.Track className="h-1 overflow-hidden bg-border">
        <BaseProgress.Indicator className="bg-accent" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
};
