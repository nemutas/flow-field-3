import * as THREE from 'three'
import { RawShaderMaterial } from '../core/ExtendedMaterials'
import vertexShader from '../shader/quad.vs'
import fragmentShader from '../shader/effect_afterimage.fs'
import { BackBuffer } from '../core/BackBuffer'

export class AfterimagePass extends BackBuffer {
  constructor(renderer: THREE.WebGLRenderer, source: THREE.Texture) {
    const material = new RawShaderMaterial({
      uniforms: {
        tSource: { value: source },
        tBackBuffer: { value: null },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
      // transparent: true,
    })

    super(renderer, material)
  }

  resize() {
    super.resize()
  }

  render() {
    this.uniforms.tBackBuffer.value = this.backBuffer
    super.render()
  }
}
