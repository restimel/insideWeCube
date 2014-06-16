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

CubePath.prototype.onMessage = function(data) {
	var cells = data.accessible,
		last = cells[cells.length - 1];
	if ( last.z === 6 && last.x === 4 && last.y === 4) {
		//To remove end is not obviously the last
		console.log('could be finished in ' + last.dst + ' movements ('+ (100 * (last.dst+1)/cells.length) + ' %)')
	}

	this.cubeBuilder.renderInfo(data.info, cells);

	main.removeClass('accessible-path');
	cells.forEach(function(cell) {
		document.getElementById('main-' + cell.x + '-' + cell.y + '-' + cell.z).classList.add('accessible-path');
	});
};
