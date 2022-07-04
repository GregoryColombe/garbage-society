import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import gsap from 'gsap'

import { COLORS, DEV, WITH_BLOOM } from '../../utils/utils'
import Game from './Game'
import Camera from './Camera'
import InterfaceBloom from '../interface/InterfaceBloom'

// shaders
export default class GameScene {
	constructor() {
		if (DEV) {
			this.gui = new dat.GUI()
			this.stats = new Stats()
		}
		this.clock = new THREE.Clock()
		this.playing = false

		THREE.Cache.enabled = true

		// others
		this.sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		}

		window.gameScene = this
	}

	initCanvas() {
		// Loader

		// Renderer
		this.renderer = new THREE.WebGLRenderer({
			canvas: document.querySelector('canvas.webgl'),
			antialias: true,
		})
		this.renderer.setSize(this.sizes.width, this.sizes.height)
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		/**
		 * Camera
		 */
		this.cam = new Camera({
			renderer: this.renderer,
		})
		this.camera = this.cam.camera
		this.camera.aspect = this.sizes.width / this.sizes.height
		this.controls = new OrbitControls(this.camera, document.body)

		// Scene
		this.scene = new THREE.Scene()
	}

	build() {
		this.initCanvas()

		if (WITH_BLOOM) {
			this.bloom = new InterfaceBloom({
				scene: this.scene,
				camera: this.camera,
				renderer: this.renderer,
				screen: this.sizes,
			})
		}

		// Game
		this.game = new Game({
			scene: this.scene,
			camera: this.cam,
			pauseCanvas: this.pauseCanvas,
			playCanvas: this.playCanvas,
			gameStart: this.start,
			bloom: this.bloom,
			showRedEffect: this.showRedEffect,
			increaseDamageEffect: this.increaseDamageEffect,
			startBoostEffect: this.startBoostEffect,
			stopBoostEffect: this.stopBoostEffect,
		})
		window.increaseDamageEffect = this.increaseDamageEffect
		this.game.onStart = () => {
			// Add On start functions of the game
		}
		this.game.onEnd = () => {
			// Add On end functions of the game
		}

		// Lights
		const pointLight = new THREE.PointLight(0xffffff, 2)
		pointLight.position.x = 2
		pointLight.position.y = 3
		pointLight.position.z = 4
		this.scene.add(pointLight)

		window.light = pointLight

		const ambiantLight = new THREE.AmbientLight(0xffffff, 0.8)
		this.scene.add(ambiantLight)
		window.ambiantLight = ambiantLight

		// PlaneEffect
		this.initPlaneEffect()
	}

	initPlaneEffect() {
		const textureLoader = new THREE.TextureLoader()

		const aspect = window.innerWidth / window.innerHeight

		this.planeEffect = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(aspect, 1),
			new THREE.ShaderMaterial({
				transparent: true,
				uniforms: {
					uDamageProgress: { value: 0 },
					uDamageColor: { value: new THREE.Color('#6ab04c') },
					uRedIntensity: { value: 0 },
					uRed: { value: new THREE.Color(COLORS.RED) },
					uInsetShadow: { value: textureLoader.load('/images/inset-shadow.jpeg') },
				},
				vertexShader: `

					varying vec2 vUv;

					void main() {

						vUv = uv;

						gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
					}
				`,
				fragmentShader: `

				uniform sampler2D uInsetShadow;
				uniform vec3 uDamageColor;
				uniform float uDamageProgress;
				varying vec2 vUv;

				void main(){

					float alpha = .0;
					float MAX_DAMAGE = 1.;


					// GREEN
					alpha = 1.;
					vec3 color = uDamageColor;

					vec2 center = vec2(.5);
					float dist = distance(center, vUv) / .5;
					dist *= min(
						(-.5 + uDamageProgress),
						MAX_DAMAGE
					);
					alpha = dist;

					gl_FragColor = vec4(color, alpha);
				}

				`,
			})
		)
		this.scene.add(this.planeEffect)
		this.planeEffect.position.copy(this.camera.position)

		// Camera target
		const cameraToTarget = new THREE.Vector3().subVectors(this.cam.cameraTarget, this.camera.position)
		this.planeEffect.position.addScaledVector(cameraToTarget, 0.05)
		this.planeEffect.lookAt(this.camera.position)

		this.planeEffect2 = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(aspect, 1),
			new THREE.ShaderMaterial({
				transparent: true,
				uniforms: {
					uRedIntensity: { value: 0 },
					uRed: { value: new THREE.Color(COLORS.RED) },
					uWhite: { value: new THREE.Color(COLORS.WHITE) },
					uWhiteIntensity: { value: 0 },
					uInsetShadow: { value: textureLoader.load('/images/inset-shadow.jpeg') },
				},
				vertexShader: `

					varying vec2 vUv;

					void main() {

						vUv = uv;

						gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
					}
				`,
				fragmentShader: `

					uniform sampler2D uInsetShadow;
					uniform vec3 uRed;
					uniform vec3 uWhite;
					uniform float uRedIntensity;
					uniform float uWhiteIntensity;
					varying vec2 vUv;

					void main(){

						float whiteIntensity = pow(uWhiteIntensity, 2.);
						float alpha = .0;
						vec3 color = uWhiteIntensity > 0. ? uWhite : uRed;

						// RED
						float insetShadow = texture2D(uInsetShadow, vUv).r;
						alpha += insetShadow * (uWhiteIntensity > 0. ? whiteIntensity : uRedIntensity);

						gl_FragColor = vec4(color, alpha);
					}

				`,
			})
		)
		this.scene.add(this.planeEffect2)
		this.planeEffect2.position.copy(this.camera.position)

		// Camera target
		this.planeEffect2.position.addScaledVector(cameraToTarget, 0.04995)
		this.planeEffect2.lookAt(this.camera.position)
	}

	increaseDamageEffect = () => {
		this.planeEffect.material.uniforms.uDamageProgress.value += 0.05
	}

	showRedEffect = () => {
		gsap.to(this.planeEffect2.material.uniforms.uRedIntensity, {
			value: 1,
			repeat: 1,
			duration: 0.35,
			yoyo: true,
			ease: 'power2.inOut',
		})

		gsap.to(this.camera.rotation, {
			z: Math.PI * 1,
			repeat: 1,
			yoyo: true,
			duration: 0.3,
			onUpdate: () => {
				this.camera.updateProjectionMatrix()
			},
		})
	}

	startBoostEffect = () => {
		gsap.to(this.planeEffect2.material.uniforms.uWhiteIntensity, {
			value: 1,
			repeat: -1,
			yoyo: true,
			duration: 0.5,
			ease: 'power2.out',
		})
	}

	stopBoostEffect = () => {
		gsap.to(this.planeEffect2.material.uniforms.uWhiteIntensity, {
			value: 0,
			duration: 1,
			ease: 'power2.out',
			overwrite: true,
		})
	}

	addEvents = () => {
		window.addEventListener('resize', () => {
			// Update this.sizes
			this.sizes.width = window.innerWidth
			this.sizes.height = window.innerHeight

			// Update camera
			this.camera.aspect = this.sizes.width / this.sizes.height
			this.camera.updateProjectionMatrix()

			// Update renderer
			this.renderer.setSize(this.sizes.width, this.sizes.height)
			this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		})
	}

	onTick = () => {
		const delta = this.clock.getDelta()

		if (this.playing) {
			this.game.onUpdate(delta)
		}

		if (DEV) this.stats.update()

		// Update objects

		// Update Orbital Controls
		if (this.controls) {
			this.controls.update()
		}

		// Render
		if (WITH_BLOOM) {
			this.bloom.render()
		} else {
			this.renderer.render(this.scene, this.camera)
		}

		// Camera
		this.cam.onUpdate()

		// Call tick again on the next frame
		window.requestAnimationFrame(this.onTick)
	}

	start = () => {
		this.addEvents()
		this.game.start()
		this.onTick()
	}

	stop() {
		this.playing = false
	}
	resume() {
		this.playing = true
	}

	pauseCanvas = () => {
		this.stop()
	}

	playCanvas = () => {
		this.resume()
	}
}
