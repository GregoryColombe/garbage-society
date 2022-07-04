import * as THREE from 'three'
import { CAMERA_FOV } from '../../utils/utils'
import ScreenShake from '../../libs/screenShake'

class Camera {
	constructor({ renderer }) {
		this.renderer = renderer
		this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 400)
		this.screenShake = ScreenShake()

		this.init()
	}

	init() {
		this.cameraTarget = new THREE.Vector3()

		this.camera.position.set(5.8, 7.6, 5.2)
		this.camera.lookAt(this.cameraTarget)

		window.camera = this.camera

		window.shake = this.shake
	}

	stopShake = () => {
		clearInterval(this.shakeIntervall)
	}

	shake = (loop = false) => {
		const delay = 300

		if (loop) {
			this.shakeIntervall = setInterval(() => {
				this.screenShake.shake(this.camera, new THREE.Vector3(0.1, 0, 0), delay /* ms */)
			}, delay)
		} else {
			this.screenShake.shake(this.camera, new THREE.Vector3(0.1, 0, 0), delay /* ms */)
		}
	}

	onUpdate = () => {
		this.screenShake.update(this.camera)
	}
}

export default Camera
