var rowSize = [1,2,3,4,5,6];

function Level (name) {
	this.name = name;
	this.cells = rowSize.map(initRow);
}

Level.prototype.get = function (x, y) {
	return this.cells[x][y];
};

Level.prototype.toggle = function (x, y, property, value) {
	if (typeof value === 'undefined') {
		value = !this.cells[x][y][property];
	}

	return this.cells[x][y][property] = value;
};

function initRow() {
	var row = rowSize.map(function() {
		return {
			r: false, //move to Right
			d: false, //move to Down
			b: false, //move bottom side (through level)
			s: 0 // 0: normal, 1: start, -1: finish
		};
	});
	return row;
}
