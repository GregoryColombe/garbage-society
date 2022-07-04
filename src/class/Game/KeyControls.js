class keyControls {
	onLeftPressed = null
	onRightPressed = null
	onSpacePressed = null

	constructor() {
		document.addEventListener('keydown', this.onKeydown, true)
	}

	reset() {
		document.removeEventListener('keydown', this.onKeydown, true)
	}

	onKeydown = (e) => {
		switch (e.keyCode) {
			// LEFT
			case 81:
				this.onLeftPressed()
				break
			case 65:
				this.onLeftPressed()
				break
			case 37:
				this.onLeftPressed()
				break
			// RIGHT
			case 68:
				this.onRightPressed()
				break
			case 39:
				this.onRightPressed()
				break
			// SPACE
			case 32:
				this.onSpacePressed()
				break
		}
	}
}

export default keyControls
