function Level (name, options) {
	options = options || {};

	if (typeof name === 'object') {
		this.parse(name);
	} else {
		this.name = name;
		this.lid = !!options.lid;
		this.resetCells(options.mapSize || 6);
		this.cmt = '';

		if (options.s instanceof Array) {
			options.s.forEach(function(cell) {
				this.cells[cell[0]][cell[1]].s = cell[3];
			}, this);
		}
	}
}

Level.prototype.resetCells = function(size) {
	size = size || 6;
	this.cells = [];
	for (var i = 0; i < size; i++) {
		this.cells.push(initRow(size));
	}
};

Level.prototype.clone = function() {
	var lvl = new Level();
	lvl.parse(this.toJSON());

	return lvl;
};

Level.prototype.get = function (x, y) {
	return this.cells[x][y];
};

Level.prototype.rotate = function (rotation) {
	var lx = this.cells.length;
	var ly = this.cells[0].length;
	var Lx = lx -1,
		Ly = ly -1;
	var cells = new Array(lx);

	var copy;
	switch(rotation.toString()) {
		case '90': copy = copy90; break;
		case '-90': copy = copy_90; break;
		case '180': copy = copy180; break;
		default:
			console.warn('rotation unknown');
			return;
	}
	copy = copy.bind(this);

	var x, y;

	for (x = 0; x < lx; x++) {
		cells[x] = new Array(ly);
		for (y = 0; y < ly; y++) {
			cells[x][y] = copy(x, y);
		}
	}

	this.cells = cells;
	this.hash = null;

	function copy90(x, y) {
		var c = this.get(y, Lx-x) || {};
		var c2 = (Lx-x-1 >= 0 ? this.get(y, Lx-x-1) : null) || {};
		var cell = {
			r: c.d,
			d: c2.r,
			b: c.b,
			s: c.s
		};

		return cell;
	}

	function copy_90(x, y) {
		var c = this.get(Ly-y, x) || {};
		var c2 = (Ly-y-1 >= 0 ? this.get(Ly-y-1, x) : null) || {};
		var cell = {
			r: c2.d,
			d: c.r,
			b: c.b,
			s: c.s
		};

		return cell;
	}

	function copy180(x, y) {
		var c = this.get(Lx-x, Ly-y) || {};
		var c2 = (Lx-x-1 >= 0 ? this.get(Lx-x-1, Ly-y) : null) || {};
		var c3 = (Ly-y-1 >= 0 ? this.get(Lx-x, Ly-y-1) : null) || {};
		var cell = {
			r: c3.r,
			d: c2.d,
			b: c.b,
			s: c.s
		};

		return cell;
	}
};

Level.prototype.getOutSidePins = function() {
	var pins = [];

	this.cells.forEach(function(row, x) {
		row.forEach(function (cell, y) {
			if (cell.s === -2) {
				pins.push({
					x: x,
					y: y
				});
			}
		});
	});

	return pins;
};

Level.prototype.hasPinConflict = function(pins) {
	var conflict = !Helper.config.pin &&
		pins.some(function(cell) {
			return !this.get(cell.x, cell.y).r;
		}, this);

	return conflict;
};

Level.prototype.toggle = function (x, y, property, value) {
	if (property === 's') {
		switch (value) {
			case 1: return 1;
			case -1: return -1;
			default:
				value = this.cells[x][y][property] === value ? 0 : value;
		}
	}

	if (typeof value === 'undefined' || value === null) {
		value = !this.cells[x][y][property];
	}

	this.hash = null;

	return this.cells[x][y][property] = value;
};

Level.prototype.toJSON = function() {
	var obj = {};

	if (this.name) {
		obj.name = this.name;
	}

	if (this.lid) {
		obj.lid = this.lid;
	}

	if (this.cmt && !/^\s*$/.test(this.cmt)) {
		obj.cmt = this.cmt;
	}

	obj.cells = JSON.parse(JSON.stringify(this.cells)
		.replace(/"[^"]+":(0|false|""),?/g, '')
		.replace(/:true/g, ':1')
		.replace(/,}/g, '}'));

	return obj;
};

Level.prototype.parse = function(json) {
	if (typeof json === 'string') {
		json = JSON.parse(json);
	}
	this.name = json.name || '';
	this.lid = !!json.lid;
	this.cells = json.cells;
	this.cmt = json.cmt;

	this.normalizeCells();
};

Level.prototype.normalizeCells = function() {
	this.cells.forEach(function(row) {
		row.forEach(function(cell) {
			cell.r = cell.r || 0;
			cell.d = cell.d || 0;
			cell.b = cell.b || 0;
			cell.s = cell.s || 0;
		});
	});

	this.hash = null;
};

Level.prototype.compare = function(level) {
	return this.getHash() === level.getHash();
};

Level.prototype.getHash = function() {
	var hash;

	if (this.hash) {
		return this.hash;
	}

	hash = '';

	this.cells.forEach(function(row) {
		row.forEach(function(cell) {
			hash += Level.cellHash(cell);
		});
	});

	this.hash = hash;
	return hash;
};

Level.prototype.parseHash = function(hash) {
	var li = hash.length;
	var rowSize = Math.sqrt(li);
	var cells = [];
	var row = [];
	var index;

	for(index = 0; index < li; index++) {
		row.push(Level.createCell(hash.charCodeAt(index)));
		if (row.length >= rowSize) {
			cells.push(row);
			row = [];
		}
	}

	this.cells = cells;
	this.hash = hash;
};

Level.cellHash = function(cell) {
	var h = 40;

	if (cell.r) {
		h += 1;
	}

	if (cell.d) {
		h += 2;
	}

	if (cell.b) {
		h += 4;
	}

	if (cell.s === 2) {
		h += 8;
	}

	if (cell.s === -2) {
		h += 16;
	}

	return String.fromCharCode(h);
};

Level.createCell = function(hash) {
	var h = hash - 40;
	var cell = {
		r: !!(h&1),
		d: !!(h&2),
		b: !!(h&4),
		s: 0
	};

	if (h&8) {
		cell.s = 2;
	}

	if (h&16) {
		cell.s = -2;
	}

	return cell;
};

function initRow(size) {
	var row = [];

	for (var i = 0; i < size; i++) {
		row.push({
			r: 0, //move to Right
			d: 0, //move to Down
			b: 0, //move bottom side (through level)
			s: 0 // 0: normal, 1: start, -1: finish, 2: pin at the current level, -2: pin at level bellow
		});
	}
	return row;
}
