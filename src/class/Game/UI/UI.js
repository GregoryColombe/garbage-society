import gsap from 'gsap'
import src from 'gsap/src'
import { DEV } from '../../../utils/utils'

class UI {
	// Main UI
	ui = document.querySelector('#ui')

	// Home
	home = document.querySelector('#ui-home')
	homeStartButton = document.querySelector('#ui-home_start-button')

	//Introduction
	introduction = document.querySelector('#ui-introduction')
	introductionVideo = document.querySelector('#ui-introduction-video')
	introSkipBtn = document.querySelector('#ui-introduction-skip-btn')

	// Keycode Explain
	keycodeExplane = document.querySelector('#ui-key-explane')
	keycodeExplaneSkipBtn = document.querySelector('#ui-key-explane-skip-btn')

	// Game
	uiGame = document.querySelector('#ui-game')
	playOrStopBtn = document.querySelector('.ui-game-playOrStop')
	playOrStopIcon = document.querySelector('.ui-game-playOrStop svg path')

	// Score
	score = document.querySelectorAll('.score')
	lifes = document.querySelector('#lifes')

	// Cinematique
	cinematique = document.querySelector('#ui-cinematique')
	cinematiqueContainer = document.querySelector('#ui-cinematique-container')
	cinematiqueVideo = document.querySelector('#ui-cinematique-video')
	outroSkipBtn = document.querySelector('#ui-cinematique-skip-btn')

	constructor({ gameStart, pauseCanvas, playCanvas, muteAllSounds, unmuteAllSounds }) {
		this.gameStart = gameStart
		this.pauseCanvas = pauseCanvas
		this.playCanvas = playCanvas
		this.muteAllSounds = muteAllSounds
		this.unmuteAllSounds = unmuteAllSounds
		this.playing = true

		if (DEV) {
			this.home.style.display = 'none'
			this.uiGame.style.display = 'flex'
			this.uiGame.style.opacity = 1
			this.ui.style.pointerEvents = 'none'
			this.blurElement(this.ui, 0, 0.5)
			this.playCanvas()
		}
		this.addEventListenners()
	}

	setScore(score) {
		this.score.forEach((item) => {
			item.innerHTML = score
		})
	}
	setLifes(lifes) {
		this.lifes.innerHTML = lifes
		this.changeHeartImg()
	}

	changeHeartImg = () => {
		const lifesNb = parseInt(this.lifes.innerHTML)
		if (lifesNb <= 3) {
			switch (lifesNb) {
				case 0:
					document.querySelector('.lifes-background-1').style.display = 'none'
					document.querySelector('.lifes-background-0').style.display = 'block'
					break
				case 1:
					document.querySelector('.lifes-background-2').style.display = 'none'
					document.querySelector('.lifes-background-1').style.display = 'block'
					break
				case 2:
					document.querySelector('.lifes-background-3').style.display = 'none'
					document.querySelector('.lifes-background-2').style.display = 'block'
					break
				default:
					break
			}
		}
	}

	fadeOut(target) {
		gsap.to(target, {
			opacity: 0,
			duration: 1,
			onComplete: () => {
				target.style.display = 'none'

				switch (target) {
					case this.home:
						this.fadeIn(this.introduction, 1)
						this.introductionVideo.play()
						break
					case this.introductionVideo:
						this.introductionVideo.pause()
						this.fadeOut(this.introduction)
						this.fadeIn(this.keycodeExplane, 3)
						break
					case this.keycodeExplane:
						this.fadeIn(this.uiGame, 3)
						this.blurElement(this.ui, 0, 1.5)
						this.playCanvas()
						this.gameStart()
						break
					case this.cinematiqueVideo:
						this.fadeOut(this.cinematique)
				}
			},
		})
	}

	fadeIn(target, time) {
		gsap.to(target, {
			opacity: 1,
			duration: time,
			onStart: () => {
				target.style.display = 'flex'
			},
			onComplete: () => {
				switch (target) {
					case this.cinematique:
						this.muteAllSounds()
						this.fadeIn(this.cinematiqueContainer, 3)
						break
				}
			},
		})
	}

	blurElement(target, value, time) {
		gsap.to(target, { backdropFilter: `blur(${value}px)`, duration: time })
	}

	startIntroduction = () => {
		this.fadeOut(this.home)
	}
	startCinematique = () => {
		this.blurElement(this.ui, 8, 1)
		this.fadeIn(this.cinematique, 1)
	}

	playOrStop = () => {
		switch (this.playing) {
			case true:
				this.pauseCanvas()
				this.muteAllSounds()
				this.playOrStopIcon.setAttribute('d', 'M3 22v-20l18 10-18 10z')
				this.blurElement(this.ui, 8, 0.5)
				break
			case false:
				this.playCanvas()
				this.playOrStopIcon.setAttribute('d', 'M11 22h-4v-20h4v20zm6-20h-4v20h4v-20z')
				this.blurElement(this.ui, 0, 0.5)
				this.unmuteAllSounds()
				break
		}
		this.playing = !this.playing
	}

	changeBackgroundOutro = () => {
		// If more than 5 points
		if (this.score[0].innerHTML > 30) {
			document.querySelector('.ui-cinematique-background-1').style.display = 'block'
		} else {
			document.querySelector('.ui-cinematique-background-2').style.display = 'block'
		}
	}

	addEventListenners() {
		// Home
		this.homeStartButton.addEventListener('click', this.startIntroduction)
		this.playOrStopBtn.addEventListener('click', this.playOrStop)

		// Introduction
		this.introSkipBtn.addEventListener('click', () => {
			this.fadeOut(this.introductionVideo)
		})
		this.introductionVideo.addEventListener('ended', () => {
			this.fadeOut(this.introductionVideo)
		})

		// Keycode explination
		this.keycodeExplaneSkipBtn.addEventListener('click', () => {
			this.fadeOut(this.keycodeExplane)
		})

		// Cinematique
		this.outroSkipBtn.addEventListener('click', () => {
			window.location.reload()
		})

		// Escape keydown
		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				this.playOrStop()
			}
		})
	}
}

export default UI
