import package::compute::types::camera::Camera;
import package::compute::types::emitter::Emitter;
import package::compute::types::environment::Environment;
import package::compute::types::frame::Frame;
import package::compute::types::material::Material;

/**
 * The HDR running average that updates across samples.
 */
@group(0) @binding(0) var<storage, read_write> ACCUMULATION: array<vec4f>;

/**
 * The presentational preview shown by the visualization pass.
 */
@group(0) @binding(1) var PRESENTATION: texture_storage_2d<rgba8unorm, write>;

/**
 * The state that changes for each progressive rendering sample.
 */
@group(0) @binding(2) var<uniform> FRAME: Frame;

/**
 * The camera used to generate rays for the output image.
 */
@group(1) @binding(0) var<uniform> CAMERA: Camera;

/**
 * The scene-wide lighting and background configuration.
 */
@group(2) @binding(0) var<uniform> ENVIRONMENT: Environment;

/**
 * The encoded voxel octree used for ray traversal.
 */
@group(3) @binding(0) var<storage, read> VOXELS: array<u32>;

/**
 * The materials referenced by lead nodes in `VOXELS`.
 */
@group(3) @binding(1) var<storage, read> MATERIALS: array<Material>;

@group(3) @binding(2) var<storage, read> EMITTERS: array<Emitter>;
