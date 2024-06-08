import { createContext, PropsWithChildren } from "react";

export type SceneProps = {};

export const Scene = createContext(null as unknown as SceneProps);

export const SceneContext = ({ children }: PropsWithChildren) => {
	return <Scene.Provider value={{}}>{children}</Scene.Provider>;
};
