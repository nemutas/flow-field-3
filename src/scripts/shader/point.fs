#version 300 es
precision highp float;

out vec4 outColor;

in float vLife;

void main() {
  float c = smoothstep(0.5, 0.3, distance(gl_PointCoord, vec2(0.5)));
  outColor = vec4(1, 1, 1, vLife * 0.3 * c);
}