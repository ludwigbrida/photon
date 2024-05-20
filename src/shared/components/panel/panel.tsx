import { PropsWithChildren, ReactNode } from "react";
import classes from "./panel.module.css";

export type PanelProps = {
	header: string;
	footer?: ReactNode;
};

export const Panel = ({
	header,
	footer,
	children,
}: PropsWithChildren<PanelProps>) => {
	return (
		<div className={classes.panel}>
			<header className={classes.header}>{header}</header>
			<div className={classes.content}>{children}</div>
			<footer>{footer}</footer>
		</div>
	);
};
