import * as THREE from 'three'
import gsap from 'gsap'

import Truck from './Truck'
import Road from './Road'
import KeyControls from './KeyControls'
import UI from './UI/UI'
import Sounds from './Sounds'

import { MUTED_DEFAULT } from '../../utils/utils'

class Game {
	score = 0
	lifes = 3
	speed = 0.1
	speedCoef = 0.0001
	time = 0
	isStarted = false
	isPaused = false
	isFinished = false

	constructor({
		scene,
		camera,
		pauseCanvas,
		playCanvas,
		gameStart,
		bloom,
		showRedEffect,
		increaseDamageEffect,
		startBoostEffect,
		stopBoostEffect,
	}) {
		// props
		this.scene = scene
		this.camera = camera

		this.bloom = bloom

		this.gameStart = gameStart
		this.pauseCanvas = pauseCanvas
		this.playCanvas = playCanvas
		this.showRedEffect = showRedEffect
		this.increaseDamageEffect = increaseDamageEffect
		this.stopBoostEffect = stopBoostEffect
		this.startBoostEffect = startBoostEffect

		this.playingSound = true
		this.soundOrMuteBtn = document.querySelector('.ui-game-soundOrMute')
		this.soundOrMuteIcon = document.querySelector('.ui-game-soundOrMute svg path')

		// methods
		this.init()
		this.addEvents()
	}

	init() {
		// Truck
		this.truck = new Truck({
			scene: this.scene,
			decreaseSpeed: this.decreaseSpeed,
			camera: this.camera,
			changeSpeed: this.changeSpeed,
			startBoostEffect: this.startBoostEffect,
			stopBoostEffect: this.stopBoostEffect,
		})

		// Sounds
		this.sounds = new Sounds()

		// Road
		this.road = new Road({
			scene: this.scene,
			truck: this.truck,
			bloom: this.bloom,
			onCollideObstacle: this.onCollideObstacle,
			onCollideTrash: this.onCollideTrash,
			onCollideBoost: this.onCollideBoost,
		})

		// UI
		this.ui = new UI({
			gameStart: this.gameStart,
			pauseCanvas: this.pauseCanvas,
			playCanvas: this.playCanvas,
			muteAllSounds: this.sounds.muteAllSounds,
			unmuteAllSounds: this.sounds.unmuteAllSounds,
		})
		this.ui.setScore(this.score)
		this.ui.setLifes(this.lifes)
	}

	addEvents() {
		this.soundOrMuteBtn.addEventListener('click', this.soundOrMute)
	}

	soundOrMute = () => {
		switch (this.playingSound) {
			case true:
				this.sounds.muteAllSounds()
				this.soundOrMuteIcon.setAttribute(
					'd',
					'M5 17h-5v-10h5v10zm2-10v10l9 5v-20l-9 5zm15.324 4.993l1.646-1.659-1.324-1.324-1.651 1.67-1.665-1.648-1.316 1.318 1.67 1.657-1.65 1.669 1.318 1.317 1.658-1.672 1.666 1.653 1.324-1.325-1.676-1.656z'
				)
				break
			case false:
				this.sounds.unmuteAllSounds()
				this.soundOrMuteIcon.setAttribute(
					'd',
					'M5 17h-5v-10h5v10zm2-10v10l9 5v-20l-9 5zm17 4h-5v2h5v-2zm-1.584-6.232l-4.332 2.5 1 1.732 4.332-2.5-1-1.732zm1 12.732l-4.332-2.5-1 1.732 4.332 2.5 1-1.732z'
				)
				break
		}
		this.playingSound = !this.playingSound
	}

	start = () => {
		// Sounds
		if (MUTED_DEFAULT) {
			this.sounds.muteAllSounds()
		} else {
			this.sounds.playAmbiant()
		}

		// Controls
		this.keyControls = new KeyControls()
		this.keyControls.onLeftPressed = () => {
			if (this.truck.currentPos != 'left') this.sounds.playMoveSide()
			this.truck.onLeftPressed()
			// console.log('left pressed')
		}
		this.keyControls.onRightPressed = () => {
			if (this.truck.currentPos != 'right') this.sounds.playMoveSide()
			this.truck.onRightPressed()
			// console.log('right pressed')
		}
		this.keyControls.onSpacePressed = () => {
			// if (this.truck.isBoosting) {
			// 	this.truck.disableBoost()
			// } else {
			// 	this.truck.enableBoost()
			// }
		}
	}

	end = () => {
		this.onEnd()
		this.isFinished = true
	}

	// ON UPDATE
	onUpdate = (delta) => {
		this.road.update(this.speed, delta)
		this.truck.update(delta)
	}

	onCollideTrash = () => {
		console.log('- COLLIDE TRASH -')

		if (!this.truck.isBoosting) {
			this.speed += this.speed * 0.05
		}

		this.sounds.playMorePoints()
		this.score++
		this.ui.setScore(this.score)
		this.truck.playOpenTruckAnim()
		this.increaseDamageEffect()
	}

	onCollideBoost = () => {
		console.log('collide boost')
		// Enable boost
		this.truck.enableBoost()
		this.sounds.playBoost()

		setTimeout(() => {
			this.truck.disableBoost()
		}, 10 * 1000)
	}

	onCollideObstacle = () => {
		console.log('- COLLIDE OBSTACLE -')

		// show effect
		this.showRedEffect()

		// Shake camera
		this.camera.shake()

		// trigger sound
		const oldSpeed = this.speed
		this.speed = this.speed / 2
		setTimeout(
			() =>
				gsap.to(this, {
					speed: oldSpeed,
					duration: 1,
				}),
			2000
		)
		this.sounds.playCollideObstacle()

		if (this.lifes > 1) {
			this.lifes--
			this.ui.setLifes(this.lifes)
		} else {
			this.lifes--
			this.ui.setLifes(this.lifes)

			this.ui.changeBackgroundOutro()
			this.ui.startCinematique()
			this.pauseCanvas()
		}
	}

	changeSpeed = (coef) => {
		gsap.to(this, {
			speed: this.speed * coef,
			duration: 0.65,
			ease: 'power2.out',
		})
	}
}

export default Game
