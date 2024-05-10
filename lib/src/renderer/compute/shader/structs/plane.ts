// language=WGSL
export default `

struct Plane {
	position: vec3<f32>,
	_padding1: f32,
	normal: vec3<f32>,
	_padding2: f32,
	materialIndex: f32,
	_padding3: vec3<f32>,
}

`;
