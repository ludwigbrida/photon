export type InputProps<T> = {
	value: T;
	onChange: (value: T) => void;
};

export const Input = <T extends string | number>({
	value,
	onChange,
}: InputProps<T>) => {
	return (
		<input
			type="number"
			value={value}
			onChange={(event) => onChange(event.target.value as T)}
		/>
	);
};
