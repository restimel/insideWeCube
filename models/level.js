var rowSize = [1,2,3,4,5,6];

function Level (name) {
	if (typeof name === 'object') {
		this.parse(name);
	} else {
		this.name = name;
		this.cells = rowSize.map(initRow);
	}
}

Level.prototype.clone = function() {
	var lvl = new Level();
	lvl.parse(this.toJSON());

	return lvl;
};

Level.prototype.get = function (x, y) {
	return this.cells[x][y];
};

Level.prototype.toggle = function (x, y, property, value) {
	if (typeof value === 'undefined') {
		value = !this.cells[x][y][property];
	}

	return this.cells[x][y][property] = value;
};

Level.prototype.toJSON = function() {
	return {
		name: this.name || '',
		cells: JSON.parse(JSON.stringify(this.cells).replace(/:false,/g, ':0,').replace(/:true,/g, ':1,'))
	};
};

Level.prototype.parse = function(json) {
	if (typeof json === 'string') {
		json = JSON.parse(json);
	}
	this.name = json.name;
	this.cells = json.cells;
};

function initRow() {
	var row = rowSize.map(function() {
		return {
			r: 0, //move to Right
			d: 0, //move to Down
			b: 0, //move bottom side (through level)
			s: 0 // 0: normal, 1: start, -1: finish
		};
	});
	return row;
}
