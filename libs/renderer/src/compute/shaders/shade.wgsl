/**
 * Calculates simple Lambert diffuse lighting for a surface.
 */
fn shadeSurface(baseColor: vec3f, surfaceNormal: vec3f) -> vec3f {
  let lightDirection = normalize(environment.sunDirection);

  let sunFacing = max(dot(surfaceNormal, lightDirection), 0);

  let ambientLight = vec3f(0.25);

  let directLight = environment.sunColor * environment.sunIntensity * sunFacing;

  return baseColor * (ambientLight + directLight);
}

/**
 * Converts a geometric hit into a display color.
 *
 * TODO: shading modes (unlit, debug, lambert, etc.)
 */
fn shadeHit(hit: Hit, ray: Ray) -> vec4f {
  let material = materials[hit.materialIndex];
  let shadedColor = shadeSurface(material.color.rgb, hit.normal);

  return vec4(shadedColor, material.color.a);
}

/**
 * Calculates the color for a ray that missed all voxel geometry.
 *
 * TODO: procedural sky, atmospheric scattering, cloud raymarching
 */
fn shadeMiss(ray: Ray) -> vec4f {
  return vec4(0);
}
