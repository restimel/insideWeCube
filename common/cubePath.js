function CubePath() {
	this.cubeBuilder = null;
	this.token = main.control.add(this.onMessage.bind(this));
	this.mapOrientation = 'top';
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
			x: parseInt(x, 10),
			y: parseInt(y, 10),
			z: parseInt(z, 10),
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

CubePath.prototype.changeMapOrientation = function(cubeOrientation) {
	this.mapOrientation = cubeOrientation;
	main.control.action('path', {action: 'getCubeMap', data: {
		orientation: this.mapOrientation,
		accessible: this.accessible
	}}, this.token);
};

CubePath.prototype.getMaps = function(callback) {
	main.control.action('path', {action: 'getCubeMaps', data: {
		accessible: this.accessible
	}}, function(args) {
		callback(args.data);
	});
};

CubePath.prototype.getPath = function(data) {
	var cells = data.accessible;
	this.accessible = cells;

	main.control.action('path', {action: 'getCubeMap', data: {orientation: this.mapOrientation, accessible: cells}}, this.token);
	main.control.action('path', {action: 'getPathInfo', data: data}, this.token);

	main.removeClass('accessible-path');
	cells.forEach(function(cell) {
		var el = document.getElementById('main-' + cell.x + '-' + cell.y + '-' + cell.z);
		if (el) {
			el.classList.add('accessible-path');
		} else {
			console.warn('element not found: ', cell, cells)
		}
	});
};

CubePath.prototype.getPathInfo = function(info) {
	this.cubeBuilder.renderInfo(info);
};

CubePath.prototype.getCubeMap = function(mapElements) {
	this.cubeBuilder.renderMiniMap(mapElements);
};

CubePath.prototype.setColor = function(color) {
	main.control.action('path', {action: 'setColor', data: {
		color: color
	}}, this.token);
};
