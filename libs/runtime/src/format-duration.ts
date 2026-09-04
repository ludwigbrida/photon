export type DurationParts = {
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
};

const pad = (value: number) => value.toString().padStart(2, "0");

export const formatDuration = (milliseconds: number): DurationParts => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  return {
    hours: pad(Math.floor(totalSeconds / 3600)),
    minutes: pad(Math.floor((totalSeconds % 3600) / 60)),
    seconds: pad(totalSeconds % 60),
  };
};
