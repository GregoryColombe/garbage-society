import { Howl } from 'howler'

class Sounds {
	constructor() {
		this.ambiant = new Howl({ src: ['/sounds/ambiant.mp3'], loop: true })
		this.moveSide = new Howl({ src: ['/sounds/move2.mp3'], volume: 0.5 })
		this.moveUp = new Howl({ src: ['/sounds/move1.mp3'], volume: 0.5 })
		this.obstacle = new Howl({ src: ['/sounds/obstacle.mp3'], volume: 1.7 })
		this.point = new Howl({ src: ['/sounds/points1.mp3'], volume: 0.7 })
		this.boost = new Howl({ src: ['/sounds/boost.mp3'], volume: 1 })

		this.allMuted = false
		this.fadeDuration = 1000
	}

	playAmbiant() {
		this.ambiant.play()
	}

	playMoveSide() {
		this.moveSide.play()
	}

	playMoveUp() {
		this.moveUp.play()
	}

	playCollideObstacle() {
		this.obstacle.play()
	}

	playMorePoints() {
		this.point.play()
	}

	playBoost() {
		this.boost.play()
	}

	muteAllSounds = () => {
		this.ambiant.fade(1, 0, this.fadeDuration)
		this.moveSide.fade(1, 0, this.fadeDuration)
		this.moveUp.fade(1, 0, this.fadeDuration)
		this.obstacle.fade(1, 0, this.fadeDuration)
		this.point.fade(1, 0, this.fadeDuration)
		this.boost.fade(1, 0, this.fadeDuration)

		this.allMuted = true
	}

	unmuteAllSounds = () => {
		this.ambiant.fade(0, 1, this.fadeDuration)
		this.moveSide.fade(0, 1, this.fadeDuration)
		this.moveUp.fade(0, 1, this.fadeDuration)
		this.obstacle.fade(0, 1, this.fadeDuration)
		this.point.fade(0, 1, this.fadeDuration)
		this.boost.fade(0, 1, this.fadeDuration)

		this.allMuted = false
	}
}

export default Sounds
