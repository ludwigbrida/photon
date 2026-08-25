import package::compute::types::sky::Sky;
import package::compute::types::sun::Sun;

/**
 * Defines the scene-wide surroundings of the world.
 */
struct Environment {
  /**
   * The directional light emitted by the sun.
   */
  sun: Sun,

  /**
   * The procedural background visible behind the scene.
   */
  sky: Sky,
}
