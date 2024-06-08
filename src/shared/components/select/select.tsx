export type SelectProps = {
	items: string[];
};

export const Select = ({ items }: SelectProps) => {
	return (
		<select size={items.length}>
			{items.map((item, index) => (
				<option key={index}>{item}</option>
			))}
		</select>
	);
};
