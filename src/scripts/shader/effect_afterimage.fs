#version 300 es
precision highp float;

uniform sampler2D tSource;
uniform sampler2D tBackBuffer;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec4 b = texture(tBackBuffer, vUv);
  vec4 src = texture(tSource, vUv);
  
  src = mix(b, src, 0.1);

  outColor = src;
}