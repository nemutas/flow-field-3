#version 300 es

in vec3 position;
in vec2 uv;

uniform sampler2D tSim;
uniform vec2 uResolution;
uniform int uMask;

out float vLife;

void main() {
  vec2 asp = uResolution / min(uResolution.x, uResolution.y);
  vec4 sim = texture(tSim, uv);

  // vLife = sim.z;
  vLife = 1.0 - abs(sim.z * 2.0 - 1.0);
  vLife *= float(gl_VertexID < uMask);

  gl_PointSize = vLife * 5.0;
  gl_Position = vec4(sim.xy / asp, 0.0, 1.0);
}