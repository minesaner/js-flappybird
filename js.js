var canvas = document.getElementById('canvas')
var context = canvas.getContext('2d')
var sceneHeight = window.innerHeight
var sceneWidth = window.innerWidth
var upEventName = document.ontouchend !== undefined ? 'touchend' : 'click'
var pipeGap = 120
var pipeSpacing = 150
var images = {}
var imageBase = 'images/'
var pipeWidth
var pipeHeight

var skyNode,
	landNode,
	birdNode,
	mouseClickStamp,
	birdImageNo,
	pipeNodes,
	lastTime,
	isOver,
	score,
	dropSpeed,
	dropSpan

function initCanvas() {
	canvas.width = sceneWidth
	canvas.height = sceneHeight
	canvas.style.backgroundColor = 'rgb(81, 192, 201)'
}

function loadImages() {
	var sceneImages = ['land.png', 'sky.png', 'pipeDown.png', 'pipeUp.png', 'scoreboard.png', 'bird-00.png', 'bird-01.png', 'bird-02.png', 'bird-03.png']
	var imagesCount = sceneImages.length

	for (let imageName of sceneImages) {
		var image = new Image()
		image.src = imageBase + imageName
		images[imageName.split('.')[0]] = image
		image.onload = function () {
			imagesCount -= 1

			if (imagesCount === 0) {
				setImages()
				bindEvent()
				setupGame()
			}
		}
	}
}

function drawLand() {
	var landImage = images['land']
	landNode = new SceneNode(context, landImage, {
		position: {
			x: 0,
			y: sceneHeight - landImage.height,
			width: sceneWidth,
			height: landImage.height
		},
		isTiled: true,
		moveDistance: 1
	})
}

function drawSky() {
	var skyImage = images['sky']
	skyNode = new SceneNode(context, skyImage, {
		position: {
			x: 0,
			y: sceneHeight - skyImage.height - images['land'].height,
			width: sceneWidth,
			height: skyImage.height
		},
		isTiled: true,
		moveDistance: 0.4
	})
}

function createPipePair() {
	var pipeUpImage = images['pipeUp']
	var pipeDownImage = images['pipeDown']
	var pipeRemainingSpace = sceneHeight - images['land'].height
	var pipeDownMinHeight = pipeRemainingSpace - pipeGap - pipeUpImage.height + 10
	var pipeDownHeight = Math.min(Math.max(Math.random() * pipeDownImage.height, pipeDownMinHeight), pipeRemainingSpace - pipeGap)
	var pipePair = []

	pipePair.push(new SceneNode(context, pipeUpImage, {
		position: {
			x: sceneWidth,
			y: pipeDownHeight + pipeGap,
			width: pipeWidth,
			height: pipeHeight
		},
		moveDistance: 1
	}))

	pipePair.push(new SceneNode(context, pipeDownImage, {
		position: {
			x: sceneWidth,
			y: pipeDownHeight - pipeHeight,
			width: pipeWidth,
			height: pipeHeight
		},
		moveDistance: 1
	}))

	return pipePair
}

function drawPipe() {
	pipeNodes.push(createPipePair())
}

function drawBird() {
	var birdImage = images['bird-0' + birdImageNo]

	birdNode = new SceneNode(context, birdImage, {
		position: {
			x: (sceneWidth - birdImage.width) / 2,
			y: (sceneHeight - images['land'].height) / 2,
			width: birdImage.width,
			height: birdImage.height
		},
		moveDistance: 0
	})
}

function setImages() {
	var ratio = Math.min(devicePixelRatio, 2)

	for (let p in images) {
		images[p].height *= ratio
		images[p].width *= ratio
	}

	images['scoreboard'].width = 236
	images['scoreboard'].height = 280

	pipeWidth = images['pipeUp'].width
	pipeHeight = images['pipeUp'].height
}

function drawScene() {
	drawSky()
	drawPipe()
	drawBird()
	drawLand()
}

function birdAnimate() {
	if (mouseClickStamp && Date.now() - mouseClickStamp > 100) {
		dropSpeed = 1
		mouseClickStamp = null
	}

	birdNode.position.y += dropSpeed
	dropSpeed += dropSpan

	if (birdNode.position.y >= landNode.position.y - birdNode.bounds.height) {
		birdNode.position.y = landNode.position.y - birdNode.bounds.height
		isOver = true
	}

	if (birdNode.position.y < 0) {
		birdNode.position.y = 0
	}
	
	birdNode.animate()

	var now = Date.now()
	if (now - lastTime >= 80) {
		birdImageNo += 1
		birdImageNo %= 4
		birdNode.image = images['bird-0' + birdImageNo]
		lastTime = now
	}
}

function pipeAnimate() {
	if (pipeNodes[0][0].x() >= pipeWidth + sceneWidth) {
		pipeNodes.splice(0, 1)
	}

	if (sceneWidth - pipeNodes[pipeNodes.length - 1][0].x() >= pipeWidth + pipeSpacing) {
		pipeNodes.push(createPipePair())
	}

	for (let pipePair of pipeNodes) {
		let x = pipePair[0].x()

		if (x === birdNode.position.x - pipeWidth || x === birdNode.position.x - pipeWidth - 0.5) {
			score += 1
		}

		for (let pipe of pipePair) {
			pipe.animate()

			if (birdNode.hitDetection(pipe)) {
				isOver = true
			}
		}
	}
}

function drawScore() {
	context.save()
	var scoreText = 'Score: ' + score
	context.fillStyle = 'rgb(255,255,255)'
	context.font = '35px Arial'
	context.textAlign = 'start'
	context.textBaseline = 'middle'
	context.fillText(scoreText, sceneWidth - context.measureText(scoreText).width - 20, 30)
	context.restore()
}

function drawScoreboard() {
	var scoreboardImage = images['scoreboard']
	var x = (sceneWidth - scoreboardImage.width) / 2
	var y = (sceneHeight - scoreboardImage.height) / 2
	context.drawImage(
		scoreboardImage,
		x,
		y,
		scoreboardImage.width,
		scoreboardImage.height
	)

	context.save()
	var gold = 'rgb(255,215,0)'
	var silver = 'rgb(192,192,192)'
	var coral = 'rgb(186,110,64)'

	if (score > 10) {
		context.fillStyle = gold
	} else if (score > 5) {
		context.fillStyle = silver
	} else {
		context.fillStyle = coral
	}
	
	context.arc(x + 54, y + 136, 25, 0, 2 * Math.PI);
	context.fill()

	context.fillStyle = 'rgb(0,0,0)'
	context.font = '20px Arial'
	context.textAlign = 'center'
	context.textBaseline = 'middle'
	context.fillText(score, x + 185, y + 115)
	context.fillText(score, x + 185, y + 155)
	context.restore()
}

function drawTip() {
	var tip = 'Touch screen to begin'
	context.save()
	context.fillStyle = 'rgb(252,120,88)'
	context.font = '30px Arial'
	context.textAlign = 'center'
	context.textBaseline = 'middle'
	console.log(sceneWidth, context.measureText(tip).width)
	context.fillText(tip, sceneWidth / 2, sceneHeight - 30)
	context.restore()
}

function animate() {
	if (isOver) {
		drawScoreboard()
		drawTip()
		return
	}
	
	context.clearRect(0, 0, sceneWidth, sceneHeight)
	skyNode.animate()
	birdAnimate()
	pipeAnimate()
	landNode.animate()
	drawScore()
	
	requestAnimationFrame(animate)
}

function bindEvent() {
	document.addEventListener(upEventName, function () {
		if (isOver) {
			setupGame()
		} else {
			mouseClickStamp = Date.now()
			dropSpeed -= 6
		}
	}, false)
}

function initGameData() {
	skyNode = null
	landNode = null
	birdNode = null
	mouseClickStamp = null
	birdImageNo = 0
	pipeNodes = []
	lastTime = Date.now()
	isOver = false
	score = 0
	dropSpeed = 1
	dropSpan = 0.1
}

function setupGame() {
	initGameData()
	drawScene()
	animate()
}

initCanvas()
loadImages()
