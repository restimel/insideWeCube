function CubePath() {
	this.cubeBuilder = null;
	this.token = main.control.add(this.onMessage.bind(this));
}

CubePath.prototype.setBuilder = function(builder) {
	this.cubeBuilder = builder;
};

CubePath.prototype.loadLevel = function(index, levelName) {
	var data = {
		action: 'loadLevel',
		data: {
			index: index,
			levelName: levelName
		}
	};

	main.control.action('path', data, this.token);
};

CubePath.prototype.reset = function(index, levelName) {
	var data = {
		action: 'reset'
	};

	main.control.action('path', data, this.token);
};

CubePath.prototype.setCell = function(x, y, z, type, value) {
	var data = {
		action: 'setCell',
		data: {
			x: x,
			y: y,
			z: z,
			type: type,
			value: value
		}
	};

	main.control.action('path', data, this.token);
};

CubePath.prototype.computePath = function() {
	main.control.action('path', {action: 'computePath'}, this.token);
};

CubePath.prototype.onMessage = function(data) {
	if (typeof this[data.action] === 'function') {
		this[data.action](data.data);
	} else {
		console.warn('Path action unknown', data.action, data);
	}
};

CubePath.prototype.getPath = function(data) {
	var cells = data.accessible;

	main.control.action('path', {action: 'getCubeMap', data: {orientation: 'top', accessible: cells}}, this.token);
	main.control.action('path', {action: 'getPathInfo', data: data}, this.token);

	main.removeClass('accessible-path');
	cells.forEach(function(cell) {
		document.getElementById('main-' + cell.x + '-' + cell.y + '-' + cell.z).classList.add('accessible-path');
	});
};

CubePath.prototype.getPathInfo = function(info) {
	this.cubeBuilder.renderInfo(info);
};

CubePath.prototype.getCubeMap = function(mapElements) {
	this.cubeBuilder.renderMiniMap(mapElements);
};
