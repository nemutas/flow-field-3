import * as THREE from 'three'
import { FrameBuffer } from '../core/FrameBuffer'
import { RawShaderMaterial } from '../core/ExtendedMaterials'
import vertexShader from '../shader/quad.vs'
import fragmentShader from '../shader/effect_output.fs'

export class OutputPass extends FrameBuffer {
  constructor(renderer: THREE.WebGLRenderer, source: THREE.Texture) {
    const material = new RawShaderMaterial({
      uniforms: {
        tSource: { value: source },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
    })

    super(renderer, material)
  }
}
