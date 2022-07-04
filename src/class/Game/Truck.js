import * as THREE from 'three'
import gsap from 'gsap'

import assetStore from '../../utils/asset-store'
import { DEV, OFFSET_SIDE, CAMERA_FOV, BOOST_SPEED_COEF } from '../../utils/utils'

class Truck {
	scene = null
	model = null
	animationMixer = null
	openTruckAnimAction = null
	currentPos = 'center' // left || center || right
	isBoosting = false
	offsetTop = 2
	defaultPos = new THREE.Vector3(0, 0.5, 0)

	constructor({ scene, decreaseSpeed, changeSpeed, camera, startBoostEffect, stopBoostEffect }) {
		this.truckParent = new THREE.Group()
		this.scene = scene
		this.camera = camera

		this.prevPosition = new THREE.Vector3()
		this._vector = new THREE.Vector3()
		this.decreaseSpeed = decreaseSpeed
		this.changeSpeed = changeSpeed
		this.startBoostEffect = startBoostEffect
		this.stopBoostEffect = stopBoostEffect

		this.loadModel()
		this.levitate()
	}

	loadModel() {
		this.model = assetStore.models.truck.model
		this.modelScene = assetStore.models.truck.model.scene

		// Animation
		this.animationMixer = new THREE.AnimationMixer(this.model.scene)
		const clips = this.model.animations

		const clip = THREE.AnimationClip.findByName(clips, 'Camion_Jette')
		this.openTruckAnimAction = this.animationMixer.clipAction(clip)
		this.openTruckAnimAction.setLoop(true, 1)

		this.modelScene.position.copy(this.defaultPos)
		this.prevPosition.copy(this.truckParent.position)
		this.modelScene.rotateY(Math.PI / 2)

		// Box
		let box = new THREE.Box3()
		box.setFromObject(this.modelScene)
		this.box = box

		if (DEV) {
			let helper = new THREE.Box3Helper(box)
			this.scene.add(helper)
		}

		this.truckParent.add(this.modelScene)
		this.scene.add(this.truckParent)
	}

	onLeftPressed() {
		switch (this.currentPos) {
			case 'left':
				// console.log('already on left side')
				break
			case 'center':
				this.goLeft()
				break
			case 'right':
				this.goCenter()
				break
		}
	}

	onRightPressed() {
		switch (this.currentPos) {
			case 'left':
				this.goCenter()
				break
			case 'center':
				this.goRight()
				break
			case 'right':
				// console.log('already on right side')
				break
		}
	}

	onSpacePressed() {
		this.onHitObstacle()
		// this.isBoosting ? this.disableBoost() : this.enableBoost()
	}

	levitate() {
		gsap.to(this.modelScene.position, {
			y: this.modelScene.position.y + 0.2,
			duration: 2.5,
			repeat: -1,
			repeatDelay: 0.5,
			ease: 'sin.inOut',
			yoyo: true,
			yoyoEase: true,
		})
	}

	goLeft() {
		gsap.to(this.truckParent.position, {
			duration: 0.4,
			x: -OFFSET_SIDE,
		})
		this.currentPos = 'left'
	}

	goCenter() {
		gsap.to(this.truckParent.position, { x: 0 })
		this.currentPos = 'center'
	}

	goRight() {
		gsap.to(this.truckParent.position, {
			duration: 0.4,
			x: OFFSET_SIDE,
		})
		this.currentPos = 'right'
	}

	enableBoost() {
		if (this.isBoosting) {
			return false
		}

		this.isBoosting = true
		gsap.to(this.truckParent.position, { y: this.offsetTop })

		this.box.expandByVector(new THREE.Vector3(OFFSET_SIDE * 2, 0, 4))

		// icnrease speed
		this.changeSpeed(BOOST_SPEED_COEF)

		// start effect
		this.startBoostEffect()

		this.camera.shake(true)
	}

	disableBoost() {
		if (!this.isBoosting) {
			return false
		}

		gsap.to(this.truckParent.position, { y: 0 })
		this.box.expandByVector(new THREE.Vector3(-OFFSET_SIDE * 2, 0, -4))
		this.isBoosting = false

		this.changeSpeed(1 / BOOST_SPEED_COEF)

		// stop effect
		this.stopBoostEffect()

		this.camera.stopShake()
	}

	update(delta) {
		// invert of position
		this._vector.copy(this.prevPosition)
		this._vector.multiplyScalar(-1)
		this._vector.y = 0

		this.box.translate(this._vector)

		this._vector.copy(this.truckParent.position)
		this._vector.y = 0

		this.box.translate(this._vector)

		this.prevPosition.copy(this.truckParent.position)

		if (this.animationMixer) {
			this.animationMixer.update(delta)
		}
	}

	playOpenTruckAnim() {
		setTimeout(() => {
			if (this.openTruckAnimAction.isRunning()) return
			this.openTruckAnimAction.reset()
			this.openTruckAnimAction.play()
		}, 1000)
	}
}

export default Truck
