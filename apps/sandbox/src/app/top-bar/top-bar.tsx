import classNames from "classnames";
import packageJson from "../../../package.json";

type TopBarProps = {
  readonly isRendering: boolean;
};

export const TopBar = ({ isRendering }: TopBarProps) => {
  return (
    <header className="flex h-7 shrink-0 items-center justify-between border-b border-border px-3">
      <h1 className="text-xs font-semibold tracking-wide">
        🌈 Photon <span className="font-normal text-text-muted">v{packageJson.version}</span>
      </h1>
      <span
        className={classNames("text-[10px] font-medium uppercase tracking-wide", {
          "text-status": isRendering,
          "text-text-muted": !isRendering,
        })}
      >
        {isRendering ? "Rendering" : "Stopped"}
      </span>
    </header>
  );
};
