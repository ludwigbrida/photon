/// <reference types="@webgpu/types" />

/**
 * Utility type for an n-length tuple with arbitrary generic argument.
 */
type Tuple<T, N extends number> = N extends N
	? number extends N
		? T[]
		: _TupleOf<T, N, []>
	: never;

type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
	? R
	: _TupleOf<T, N, [T, ...R]>;
