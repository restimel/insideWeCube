function level (name) {
	this.name = name;
	this.cells = (new Array(6)).map(initRow);
}

level.prototype.get = function (x, y) {
	return this.cells[x][y];
};

level.prototype.toggle = function (x, y, property, value) {
	if (typeof value === 'undefined') {
		value = !this.cells[x][y][property];
	}

	return this.cells[x][y][property] = value;
};

function initRow() {
	var row = (new Array(6)).map(function() {
		return {
			r: false, //move to Right
			d: false, //move to Down
			b: false, //move bottom side (through level)
			s: 0 // 0: normal, 1: start, -1: finish
		};
	});
}
