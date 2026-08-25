import package::compute::types::camera::Camera;
import package::compute::types::environment::Environment;
import package::compute::types::frame::Frame;
import package::compute::types::material::Material;

/**
 * The accumulated radiance from the preceding sample.
 *
 * This texture is read when updating the running average.
 * It must have the same dimensions as `OUTPUT_TEXTURE`.
 */
@group(0) @binding(0) var INPUT_TEXTURE: texture_2d<f32>;

/**
 * The accumulated radiance after the current sample is added.
 *
 * The host alternates this texture with `INPUT_TEXTURE` between dispatches to progressively refine
 * the image.
 */
@group(0) @binding(1) var OUTPUT_TEXTURE: texture_storage_2d<rgba32float, write>;

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
