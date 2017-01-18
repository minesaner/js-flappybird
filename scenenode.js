function SceneNode(context, image, options) {
	this.context = context
	this.image = image
	this.bounds = {
		x: 0,
		y: 0,
		width: image.width,
		height: image.height
	}
	this.position = options.position
	this.moveDistance = options.moveDistance
	this.isTiled = options.isTiled
	this.sceneWidth = context.canvas.width
	this.sceneHeight = context.canvas.height
	this.imageCount = 1

	this.init()
}

SceneNode.prototype.init = function () {
	if (this.isTiled) {
		this.imageCount = Math.ceil(this.position.width / this.image.width) + 1
		this.bounds.width = this.image.width * this.imageCount
	} else {
		this.draw()
	}
}

SceneNode.prototype.animate = function () {
	this.position.x -= this.moveDistance

	if (this.isTiled) {
		if (Math.abs(this.position.x) >= this.image.width) {
			this.position.x += this.image.width
		}
	}
	
	this.draw()
}

SceneNode.prototype.draw = function () {
	for (let i = 0; i < this.imageCount; i++) {
		this.context.drawImage(
			this.image,
			this.position.x + i * this.image.width,
			this.position.y,
			this.image.width,
			this.image.height
		)
	}
}

SceneNode.prototype.hitDetection = function (anotherNode) {
	var maxX = Math.max(this.position.x + this.bounds.width, anotherNode.position.x + anotherNode.bounds.width)
	var minX = Math.min(this.position.x, anotherNode.position.x)
	var maxY = Math.max(this.position.y + this.bounds.height, anotherNode.position.y + anotherNode.bounds.height)
	var minY = Math.min(this.position.y, anotherNode.position.y)

	return ((maxX - minX) <= (this.bounds.width + anotherNode.bounds.width)) &&
		((maxY - minY) <= (this.bounds.height + anotherNode.bounds.height))
}

SceneNode.prototype.x = function () {
	return this.position.x
}