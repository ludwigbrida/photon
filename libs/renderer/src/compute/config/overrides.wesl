/**
 * The width and height of each compute workgroup.
 *
 * The image is synthesized as a grid of `WORKGROUP_SIZE * WORKGROUP_SIZE` tiles for performance
 * reasons. Each tile is processed by a workgroup containing one shader invocation per pixel,
 * which can execute concurrently on the GPU.
 *
 * It must be greater than zero and evenly divide both image dimensions.
 */
override WORKGROUP_SIZE: u32;

/**
 * The dimensions of the output image in pixels.
 *
 * They must match the respective dimensions of the accumulation textures.
 */
override IMAGE_WIDTH: u32;
override IMAGE_HEIGHT: u32;

/**
 * The number of levels in the scene's voxel octree.
 *
 * It defines a cubic scene with `2 ^ OCTREE_DEPTH` voxels along each axis.
 *
 * It must be at least one and match the depth used to compile the voxel data.
 */
override OCTREE_DEPTH: u32;

/**
 * The maximum number of continuation rays spawned after the primary ray.
 *
 * `0` evaluates only the surface reached by the primary ray. Larger values add indirect light
 * bounces at a higher computational cost.
 */
override MAX_BOUNCES: u32;
