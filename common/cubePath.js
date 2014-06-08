function CubePath() {
	this.cube = new Cube();

	this.token = main.control.add(this.onMessage.bind(this));
}

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
	var last = data[data.length - 1];
	if ( last.z === 6 && last.x === 4 && last.y === 4) {
		//To remove end is not obviously the last
		console.log('could be finished in ' + last.dst + ' movements ('+ (100 * (last.dst+1)/data.length) + ' %)')
	}

	main.removeClass('accessible-path');
	data.forEach(function(cell) {
		document.getElementById('main-' + cell.x + '-' + cell.y + '-' + cell.z).classList.add('accessible-path');
	})
};
