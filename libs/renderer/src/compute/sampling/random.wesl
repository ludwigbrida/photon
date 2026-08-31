/**
 * Produces a deterministic, pseudo-random value by thoroughly mixing the bits of an input seed.
 *
 * The same input is guaranteed to always produce the same output, while similar or nearby inputs,
 * such as adjacent pixels or consecutive samples, produce wildly different, decorrelated outputs.
 *
 * This behavior is generally required for many sampling applications, such as arbitrary diffuse
 * bounce directions or randomly chosen points on a surface.
 * It enables fast visual randomization and without it, the resulting image could contain banding
 * artifacts, repeating patterns or unstable noise.
 *
 * Implementation of Thomas Wang's `hash32shiftmult` 32-bit integer hash.
 */
fn hash(seed: u32) -> u32 {
  var value = seed;

  value = (value ^ 61u) ^ (value >> 16u);
  value *= 9u;
  value = value ^ (value >> 4u);
  value *= 0x27d4eb2du;
  value = value ^ (value >> 15u);

  return value;
}

/**
 * Produces a pseudo-random value in [0.0, 1.0].
 *
 * `dimension` selects an independent random dimension for the same pixel and progressive sample.
 * Dimensions 0 and 1 are reserved for camera jitter. Diffuse path sampling will start at
 * dimension 2.
 */
fn sampleRandom(pixel: vec2u, sampleIndex: u32, dimension: u32) -> f32 {
  var seed = hash(pixel.x);
  seed = hash(seed ^ pixel.y);
  seed = hash(seed ^ sampleIndex);
  seed = hash(seed ^ dimension);

  // Keep the upper 24 random bits, which fit exactly in f32's mantissa.
  // This guarantees a value below 1.0 even after integer-to-float conversion.
  return f32(seed >> 8u) * (1.0 / 16777216.0);
}
