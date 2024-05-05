import * as THREE from 'three'
import { Simulator } from './Simulator'
import { BackBuffer } from './core/BackBuffer'
import { RawShaderMaterial } from './core/ExtendedMaterials'
import { FrameBuffer } from './core/FrameBuffer'
import { Three } from './core/Three'
import { AfterimagePass } from './effects/AfterimagePass'
import { OutputPass } from './effects/OutputPass'
import fragmentShader from './shader/point.fs'
import vertexShader from './shader/point.vs'

export class Canvas extends Three {
  private simulator: Simulator
  private points: THREE.Points<THREE.BufferGeometry, RawShaderMaterial>

  private mainSceneRenderTarget: THREE.WebGLRenderTarget
  private afterimage: BackBuffer
  private output: FrameBuffer

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)

    this.init()

    this.mainSceneRenderTarget = this.createRenderTarget()
    this.afterimage = new AfterimagePass(this.renderer, this.mainSceneRenderTarget.texture)
    this.output = new OutputPass(this.renderer, this.afterimage.texture)

    this.simulator = new Simulator(this.renderer, [512 * 1, 512 * 1])

    this.points = this.createPoints()
    window.addEventListener('resize', this.resize.bind(this))
    this.renderer.setAnimationLoop(this.anime.bind(this))
  }

  private init() {
    this.scene.background = new THREE.Color('#000')
  }

  private createRenderTarget() {
    const { width, height } = this.size
    const dpr = this.renderer.getPixelRatio()
    return new THREE.WebGLRenderTarget(width * dpr, height * dpr)
  }

  private createPoints() {
    const geo = new THREE.BufferGeometry()

    const positions: number[] = []
    const uvs: number[] = []

    for (let ix = 0; ix < this.simulator.size.width; ix++) {
      for (let iy = 0; iy < this.simulator.size.height; iy++) {
        positions.push(0, 0, 0)
        uvs.push(ix / this.simulator.size.width, iy / this.simulator.size.height)
      }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

    const mat = new RawShaderMaterial({
      uniforms: {
        tSim: { value: null },
        uResolution: { value: [this.size.width, this.size.height] },
        uMask: { value: this.calcMaskSize() },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })

    const points = new THREE.Points(geo, mat)
    this.scene.add(points)

    return points
  }

  private calcMaskSize() {
    let mask = this.simulator.size.width * this.simulator.size.height * ((this.size.width * this.size.height) / (1745 * 870))
    mask = Math.trunc(mask)
    return mask
  }

  private resize() {
    const { width, height } = this.size
    const dpr = this.renderer.getPixelRatio()

    this.points.material.uniforms.uResolution.value = [this.size.width, this.size.height]
    this.points.material.uniforms.uMask.value = this.calcMaskSize()
    this.mainSceneRenderTarget.setSize(width * dpr, height * dpr)
    this.simulator.resize()
    this.afterimage.resize()
  }

  private anime() {
    const dt = this.clock.getDelta()

    // render main scene
    this.simulator.render(dt)
    this.points.material.uniforms.tSim.value = this.simulator.texture

    this.renderer.setRenderTarget(this.mainSceneRenderTarget)
    this.renderer.render(this.scene, this.camera)

    // render post-effect
    this.afterimage.render()

    // render output
    this.output.uniforms.tSource.value = this.afterimage.texture

    this.renderer.setRenderTarget(null)
    this.renderer.render(this.output.scene, this.output.camera)
  }
}
