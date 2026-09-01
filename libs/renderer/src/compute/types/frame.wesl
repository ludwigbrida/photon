/**
 * Defines the state for one progressive rendering sample.
 *
 * The CPU supplies this data before each accumulation dispatch. It identifies the current sample so
 * the shader can generate different random values and combine the result with samples from earlier
 * dispatches.
 */
struct Frame {
  /**
   * The zero-based index of the current accumulation sample.
   *
   * `0` starts a new accumulation sequence. Each subsequent dispatch must use the next index so
   * random sampling varies and the running average remains correct.
   */
  sampleIndex: u32,

  /**
   * Coordinates of the interleaved bucket rendered by this dispatch.
   */
  bucketX: u32,

  bucketY: u32,

  /**
   * The number of interleaved buckets along each image axis.
   *
   * A value of 1 renders the complete image in one dispatch.
   */
  bucketGridSize: u32,
}
