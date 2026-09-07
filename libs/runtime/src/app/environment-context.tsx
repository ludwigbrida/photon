import type { Environment } from "@photon/renderer";
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { RuntimeController } from "../controller.ts";

type EnvironmentContextValue = {
  readonly environment: Environment;
  readonly updateEnvironment: Dispatch<SetStateAction<Environment>>;
};

export const EnvironmentContext = createContext(null as unknown as EnvironmentContextValue);

type EnvironmentProviderProps = {
  readonly controller: RuntimeController;
};

export const EnvironmentProvider = ({
  controller,
  children,
}: PropsWithChildren<EnvironmentProviderProps>) => {
  const [environment, updateEnvironment] = useState(controller.initialEnvironment);

  useEffect(() => {
    controller.configure({ environment });
  }, [controller, environment]);

  const value = useMemo(
    () => ({ environment, updateEnvironment }),
    [environment, updateEnvironment],
  );

  return <EnvironmentContext value={value}>{children}</EnvironmentContext>;
};
