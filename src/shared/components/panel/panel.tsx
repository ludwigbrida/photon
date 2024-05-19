import { PropsWithChildren } from "react";
import classes from "./panel.module.css";

export type PanelProps = {
	title: string;
};

export const Panel = ({ title, children }: PropsWithChildren<PanelProps>) => {
	return (
		<div className={classes.panel}>
			<header>{title}</header>
			<div>{children}</div>
			<footer></footer>
		</div>
	);
};
