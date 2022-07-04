// libs
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

// utils
const voidFunction = () => {}

const ENTIRE_SCENE = 0,
	BLOOM_SCENE = 1

// shaders
const vertexShader = `
    varying vec2 vUv;

    void main() {

        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
`

const fragmentShader = `
    uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;

    varying vec2 vUv;

    void main() {

        gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

    }
`

export default class InterfaceBloom {
	constructor({ renderer, scene, screen, camera, params = {} }) {
		this.renderer = renderer
		this.scene = scene
		this.screen = screen
		this.camera = camera

		this.parameters = Object.assign(
			{
				exposure: 1,
				bloomStrength: 1.2,
				bloomThreshold: 0.1,
				bloomRadius: 0,
			},
			params
		)

		this.autoInit()
	}

	render() {
		const tempBackground = this.scene.background

		// darken
		this.scene.background = null
		this.scene.traverse(this.darkenNonBloomed)

		// render 1
		this.bloomComposer.render()

		// restore
		this.scene.traverse(this.restoreMaterial)
		this.scene.background = tempBackground

		// render 2
		this.finalComposer.render()
	}

	// Events
	onResize(screen) {
		this.screen = screen

		this.bloomComposer.setSize(this.screen.width, this.screen.height)
		this.finalComposer.setSize(this.screen.width, this.screen.height)

		this.render()
	}

	// Build
	autoInit() {
		this.bloomLayer = new THREE.Layers()
		this.bloomLayer.set(BLOOM_SCENE)
		this.materials = {}
		this.darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })

		// renderer
		this.renderer.toneMapping = THREE.ReinhardToneMapping
		this.renderer.toneMappingExposure = Math.pow(this.parameters.exposure, 4.0)

		// passes
		this.initPasses()
	}

	initPasses() {
		this.renderScene = new RenderPass(this.scene, this.camera)

		this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.screen.width, this.screen.THREE), 1.5, 0.4, 0.85)
		this.bloomPass.threshold = this.parameters.bloomThreshold
		this.bloomPass.strength = this.parameters.bloomStrength
		this.bloomPass.radius = this.parameters.bloomRadius

		this.bloomComposer = new EffectComposer(this.renderer)
		this.bloomComposer.renderToScreen = false
		this.bloomComposer.addPass(this.renderScene)
		this.bloomComposer.addPass(this.bloomPass)

		this.finalPass = new ShaderPass(
			new THREE.ShaderMaterial({
				uniforms: {
					baseTexture: { value: null },
					bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
				},
				vertexShader,
				fragmentShader,
				defines: {},
			}),
			'baseTexture'
		)
		this.finalPass.needsSwap = true

		this.finalComposer = new EffectComposer(this.renderer)
		this.finalComposer.addPass(this.renderScene)
		this.finalComposer.addPass(this.finalPass)
	}

	// Helpers

	addToBloomLayer(obj) {
		obj.layers.enable(BLOOM_SCENE)
		this.render()
	}

	darkenNonBloomed = (obj) => {
		if ((obj.isMesh || obj.isPoints) && this.bloomLayer.test(obj.layers) === false) {
			this.materials[obj.uuid] = obj.material
			obj.material = this.darkMaterial
		}
	}

	restoreMaterial = (obj) => {
		if (this.materials[obj.uuid]) {
			obj.material = this.materials[obj.uuid]
			delete this.materials[obj.uuid]
		}
	}
}
