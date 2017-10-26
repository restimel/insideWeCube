var uid = 0;

function Cube (name) {
	this.name = name || uid++;
	this.levels = [];
	this.visible = true;
	this.reset({});

	this.phantomBalls = [];
}

Cube.prototype.init = function() {
	var nb = this.size,
		i;

	for (i = 0; i < nb; i++) {
		this.levels[i] = new Level();
	}
	this.hash = null;
};

Cube.prototype.reset = function(args) {
	this.size = args.size || 7;
	this.mapSize = args.mapSize || 6;
	this.startCell = args.startCell || {x: 1, y: 1, z: 0};
	this.finishCell = args.finishCell || {x: this.mapSize - 2, y: this.mapSize - 2, z: this.size - 1};
}

Cube.prototype.clone = function(alsoMetaData) {
	var cube = new Cube();
	cube.parse(this.toJSON());

	if (alsoMetaData) {
		cube.visible = this.visible;
		cube.original = this.original;
	}

	return cube;
};

Cube.prototype.load = function (levels, callback) {
	var that = this;
	var count = levels.length;

	levels.forEach(function(lvl, i) {
		if (typeof store === 'object') {
			that.addLevel(i, store.getLevel(new Level(lvl)));
			checkEnd();
		}
		else {
			main.control.action('getLevel', lvl, function(json) {
				that.addLevel(i, new Level(json));
				checkEnd();
			});
		}
	});

	function checkEnd() {
		--count;
		if (!count) {
			callback();
		}
	}
};

Cube.prototype.addLevel = function (z, level) {
	this.levels[z] = level;
	this.hash = null;
};

Cube.prototype.get = function (x, y, z) {
	if (z<0 || z>=this.size || x<0 || x>=this.mapSize || y<0 || y>=this.mapSize) {
		return {};
	}
	return this.levels[z].get(x, y);
};

Cube.prototype.isFree = function (x, y, z) {
	var cell = this.get(x, y, z),
		oCell = this.get(x, y, z-1);

	return Helper.config.pin || ((cell.s !== 2 || z === 0) && (oCell.s !== -2 || z === this.levels.length-1));
};

/**
 * Get list of all neighbour cells accessible from specified cell
 */
Cube.prototype.getNeighbours = function (x, y, z) {
	var directions = [],
		cell = this.get(x, y, z);

	// down
	if (x < this.mapSize - 1 && cell.d && this.isFree(x+1, y, z)) {
		directions.push({
			x: x + 1,
			y: y,
			z: z,
			from: -2
		});
	}

	// right
	if (y < this.mapSize - 1 && cell.r && this.isFree(x, y+1, z)) {
		directions.push({
			x: x ,
			y: y + 1,
			z: z,
			from: 1
		});
	}

	// bottom
	if (z < (this.size - 1) && cell.b) {
		directions.push({
			x: x ,
			y: y ,
			z: z + 1,
			from: -3
		});
	}

	// up
	if (x > 0 && this.get(x - 1, y, z).d && this.isFree(x-1, y, z)) {
		directions.push({
			x: x -1,
			y: y,
			z: z,
			from: 2
		});
	}

	// left
	if (y > 0 && this.get(x, y - 1, z).r && this.isFree(x, y-1, z)) {
		directions.push({
			x: x ,
			y: y - 1,
			z: z,
			from: -1
		});
	}

	// top
	if (z > 0 && this.get(x, y, z -1).b) {
		directions.push({
			x: x ,
			y: y,
			z: z - 1,
			from: 3
		});
	}

	return directions;
};

Cube.prototype.toJSON = function() {
	var json = {
		name: this.name,
		color: this.color,
		levels: this.levels.map(function(l) {return l.toJSON();}),
		size: this.size,
		mapSize: this.mapSize
	};

	if (this.phantomBalls && this.phantomBalls.length) {
		json.ghost = this.phantomBalls.map(Cube.convertFromCell).filter(function(c) { return !!c; });
	}

	if (this.startCell.x !== 1 || this.startCell.y !== 1 || this.startCell.z !== 0) {
		json.start = {
			x: this.startCell.x,
			y: this.startCell.y,
			z: this.startCell.z
		};
	}

	if (this.finishCell.x !== this.mapSize - 2 || this.finishCell.y !== this.mapSize - 2 || this.finishCell.z !== this.size - 1) {
		json.end = {
			x: this.finishCell.x,
			y: this.finishCell.y,
			z: this.finishCell.z
		};
	}

	return json;
};

Cube.prototype.parse = function(json, option) {
	if (typeof json === 'string') {
		json = JSON.parse(json);
	}
	this.name = json.name;
	if (json.color) {
		this.color = json.color;
	}
	this.size = json.size || json.levels.length || 7;
	this.mapSize = json.mapSize || json.levels[0] && json.levels[0].cells.length || 6;

	if (typeof json.ghost === 'object' && json.ghost instanceof Array && json.ghost.length) {
		this.phantomBalls = json.ghost.map(function(cell) {
			return Cube.convertToCell(cell);
		}).filter(function(cell) {
			return Cube.checkCell(cell);
		});
	} else {
		this.phantomBalls = json.phantomBalls || [];
	}

	if (Cube.checkCell(json.start)) {
		this.startCell = json.start;
	} else if (Cube.checkCell(json.startCell)) {
		this.startCell = json.startCell;
	} else {
		this.startCell = {x: 1, y: 1, z: 0};
	}

	if (Cube.checkCell(json.end)) {
		this.finishCell = json.end;
	} else if (Cube.checkCell(json.finishCell)) {
		this.finishCell = json.finishCell;
	} else {
		this.finishCell = {x: this.mapSize - 2, y: this.mapSize - 2, z: this.size - 1};
	}

	this.visible = !!json.visible;

	if (option && option.fromDB) {
		this.original = !!json.original;
	}

	this.levels = [];
	json.levels.forEach(function(l, i) {this.addLevel(i, new Level(l));}, this);
	this.hash = null;
};

/**
 * get the ball movement when the cube is in a particular position
 *
 * From:
 *  1 → / -1 ←
 *  2 ↑ / -2 ↓
 *  3 ↥ / -3 ↧
 */
Cube.prototype.getMovement = function(cellPos, cubePosition, from) {
	var x = cellPos.x,
		y = cellPos.y,
		z = cellPos.z,
		cell = this.get(x, y, z),
		rslt = [cellPos],
		isFalling = [3, -3].indexOf(from) !== -1;

	if (typeof cell === 'undefined') {
		return [];
	}

	/* Z */
	if (!isFalling) {
		if (cubePosition.b && cell.b) {
			return rslt.concat(this.getMovement({
				x: x,
				y: y,
				z: z + 1
			}, cubePosition, -3));
		}
		if (!cubePosition.b && this.get(x, y, z-1).b) {
			return rslt.concat(this.getMovement({
				x: x,
				y: y,
				z: z - 1
			}, cubePosition, 3));
		}
	}

	/* X/Y */
	if ([1, -1].indexOf(from) === -1){
		if (cubePosition.r && cell.r && this.isFree(x, y+1, z)) {
			return rslt.concat(this.getMovement({
				x: x,
				y: y + 1,
				z: z
			}, cubePosition, 1));
		}
		if (!cubePosition.r && this.get(x, y-1, z).r && this.isFree(x, y-1, z)) {
			return rslt.concat(this.getMovement({
				x: x,
				y: y - 1,
				z: z
			}, cubePosition, -1));
		}

		if (cubePosition.d && cell.d && this.isFree(x+1, y, z)) {
			return rslt.concat(this.getMovement({
				x: x + 1,
				y: y,
				z: z
			}, cubePosition, -2));
		}
		if (!cubePosition.d && this.get(x-1, y, z).d && this.isFree(x-1, y, z)) {
			return rslt.concat(this.getMovement({
				x: x - 1,
				y: y,
				z: z
			}, cubePosition, 2));
		}
	} else {
		if (cubePosition.d && cell.d && this.isFree(x+1, y, z)) {
			return rslt.concat(this.getMovement({
				x: x + 1,
				y: y,
				z: z
			}, cubePosition, -2));
		}
		if (!cubePosition.d && this.get(x-1, y, z).d && this.isFree(x-1, y, z)) {
			return rslt.concat(this.getMovement({
				x: x - 1,
				y: y,
				z: z
			}, cubePosition, 2));
		}

		if (cubePosition.r && cell.r && this.isFree(x, y+1, z)) {
			return rslt.concat(this.getMovement({
				x: x,
				y: y + 1,
				z: z
			}, cubePosition, 1));
		}
		if (!cubePosition.r && this.get(x, y-1, z).r && this.isFree(x, y-1, z)) {
			return rslt.concat(this.getMovement({
				x: x,
				y: y - 1,
				z: z
			}, cubePosition, -1));
		}
	}

	/* Z */
	if (isFalling) {
		if (cubePosition.b && cell.b) {
			return rslt.concat(this.getMovement({
				x: x,
				y: y,
				z: z + 1
			}, cubePosition, -3));
		}
		if (!cubePosition.b && this.get(x, y, z-1).b) {
			return rslt.concat(this.getMovement({
				x: x,
				y: y,
				z: z - 1
			}, cubePosition, 3));
		}
	}

	return rslt;
};

Cube.prototype.couldMove = function(cellPos, cubePosition) {
	var x = cellPos.x,
		y = cellPos.y,
		z = cellPos.z,
		cell = this.get(x, y, z);

	if (typeof cell.r === 'undefined') {
		return false;
	}

	/* Z */
	if ( (cubePosition.b && cell.b)
	  || (!cubePosition.b && this.get(x, y, z-1).b)) {
		return true;
	}

	/* X/Y */
	if(  (cubePosition.r && cell.r && this.isFree(x, y+1, z))
	  || (!cubePosition.r && this.get(x, y-1, z).r && this.isFree(x, y-1, z))
	  || (cubePosition.d && cell.d && this.isFree(x+1, y, z))
	  || (!cubePosition.d && this.get(x-1, y, z).d && this.isFree(x-1, y, z))) {
		return true;
	}

	return false;
};

Cube.prototype.isPhantomCell = function(cell) {
	if (!this.phantomBalls || !this.phantomBalls.length) {
		return false;
	}

	return this.phantomBalls.some(function(ghost) {
		return Cube.comparePosition(ghost, cell);
	});
};

Cube.prototype.togglePhantom = function(cell, toggle) {
	var index = -1;

	this.phantomBalls.some(function(ghost, idx) {
		var same = Cube.comparePosition(ghost, cell);

		if (same) {
			index = idx;
		}
		return same;
	});

	toggle = typeof toggle === 'boolean' ? !!toggle : index === -1;

	if (toggle && index === -1) {
		this.phantomBalls.push(cell);
	} else if (!toggle && index !== -1) {
		this.phantomBalls.splice(index, 1);
	}

	return toggle;
};

Cube.prototype.getClassFromCell = function(cell, classList, x, y, z) {
	var isPositive = cell.s > 0;
	var cellPosition = {x: x, y: y, z: z};
	var ngbCell;

	/* XXX: -1 and -2 are kept to support compatibility with old maps */
	/* special cells
	 * 1: start
	 * 2: inner Pin
	 * 4: finish
	 * 8: outer Pin
	 */

	if (Cube.comparePosition(this.startCell, cellPosition) || (isPositive && cell.s & 1)) {
		classList.push('start-cell');
	}
	if (Cube.comparePosition(this.finishCell, cellPosition) || cell.s === -1 || (isPositive && cell.s & 4)) {
		classList.push('end-cell');
	}
	if (isPositive && cell.s & 2) {
		classList.push('pin');
	}
	ngbCell = this.get(x, y, z-1).s;
	if (ngbCell === -2 || (ngbCell > 0 && ngbCell & 8)) {
		classList.push('pin-top');
	}
	if (this.isPhantomCell(cellPosition)) {
		classList.push('phantom');
	}
};

Cube.prototype.renderMap = function(orientation, available, uid) {
	uid = uid || '';
	var cube = [];
	var x, y, z;
	var lx, ly, lz;
	var level, row, cell;
	var cl, clName;
	var that = this;
	var computeClass = {
		'top': function(ox, oy, oz) {
			var x = ox,
				y = oy,
				z = oz;
			var map = {
				TOP: 'TOP',
				BOTTOM: 'BOTTOM',
				RIGHT: 'RIGHT',
				LEFT: 'LEFT',
				DOWN: 'DOWN',
				UP: 'UP'
			}

			clName = clName.concat(getClassName(x, y, z, map));
		},
		'bottom': function(ox, oy, oz) {
			var x = lx - ox - 1,
				y = oy,
				z = lz - oz - 1;

			var map = {
				TOP: 'BOTTOM',
				BOTTOM: 'TOP',
				RIGHT: 'RIGHT',
				LEFT: 'LEFT',
				DOWN: 'UP',
				UP: 'DOWN'
			}

			clName = clName.concat(getClassName(x, y, z, map));
		},
		'right': function(ox, oy, oz) {
			var x = ox,
				y = lz - oz - 1,
				z = oy;

			var map = {
				TOP: 'RIGHT',
				BOTTOM: 'LEFT',
				RIGHT: 'BOTTOM',
				LEFT: 'TOP',
				DOWN: 'DOWN',
				UP: 'UP'
			}

			clName = clName.concat(getClassName(x, y, z, map));
		},
		'left': function(ox, oy, oz) {
			var x = lx - ox - 1,
				y = oz,
				z = oy;

			var map = {
				TOP: 'LEFT',
				BOTTOM: 'RIGHT',
				RIGHT: 'BOTTOM',
				LEFT: 'TOP',
				DOWN: 'UP',
				UP: 'DOWN'
			}

			clName = clName.concat(getClassName(x, y, z, map));
		},
		'front': function(ox, oy, oz) {
			var x = lz - oz - 1,
				y = lx - ox - 1,
				z = oy;

			var map = {
				TOP: 'DOWN',
				BOTTOM: 'UP',
				RIGHT: 'BOTTOM',
				LEFT: 'TOP',
				DOWN: 'LEFT',
				UP: 'RIGHT'
			}

			clName = clName.concat(getClassName(x, y, z, map));
		},
		'back': function(ox, oy, oz) {
			var x = oz,
				y = ox,
				z = oy;

			var map = {
				TOP: 'UP',
				BOTTOM: 'DOWN',
				RIGHT: 'BOTTOM',
				LEFT: 'TOP',
				DOWN: 'RIGHT',
				UP: 'LEFT'
			}

			clName = clName.concat(getClassName(x, y, z, map));
		}
	}[orientation];
	// var lvlLength = this.levels.reduce(function(total, lvl) {
	// 	return total + (lvl.isActive ? 1 : 0);
	// }, 0);

	switch(orientation) {
		case 'top':
		case 'bottom':
			lx = this.mapSize;
			ly = this.mapSize;
			lz = this.levels.length;
			break;

		case 'right':
		case 'left':
		case 'front':
		case 'back':
			lx = this.mapSize;
			ly = this.levels.length;
			lz = this.mapSize;
			break;
	}

	if (typeof computeClass !== 'function') {
		return [];
	}

	for(z = 0; z < lz; z++) {
		level = [
			'<table',
			' id="mapLevel', uid, '-', z, '"',
			' class="mini-map color-', this.color, '">'
		];

		for(x = 0; x < lx; x++) {
			row = ['<tr>'];

			for(y = 0; y < ly; y++) {
				clName = [''];
				cell = '<td';

				computeClass(x, y, z);
				cell += ' class="' + clName.join(' ') + '"';
				cell += '></td>';
				row.push(cell);
			}
			row.push('</tr>');
			level.push(row.join(''));
		}
		level.push('</table>');
		cube.push(level.join(''));
	}

	return cube;

	function isAvailable(x, y, z) {
		return available.some(function(cell) {
			return cell.x === x && cell.y === y && cell.z === z;
		});
	}

	function getNeighbors(x, y, z) {
		var cell = that.get(x, y, z);
		var neighbors = {
			TOP: that.get(x, y, z-1).b,
			BOTTOM: cell.b,
			LEFT: that.get(x, y - 1, z).r,
			RIGHT: cell.r,
			UP: that.get(x - 1, y, z).d,
			DOWN: cell.d
		};

		return neighbors;
	}

	function getClassName(x, y, z, map) {
		var clName = [];
		var neighbors;

		if (isAvailable(x, y, z)) {
			neighbors = getNeighbors(x, y, z);

			if (neighbors[map.BOTTOM]) {
				clName.push('hole');
			}
			if (neighbors[map.DOWN]) {
				clName.push('passage-down');
			}
			if (neighbors[map.RIGHT]) {
				clName.push('passage-right');
			}
			if (neighbors[map.UP]) {
				clName.push('passage-up');
			}
			if (neighbors[map.LEFT]) {
				clName.push('passage-left');
			}
			that.getClassFromCell(that.get(x, y, z), clName, x, y, z);

			// manage cell's id
			cell += ' id="map'+uid+'-'+x+'-'+y+'-'+z+'"';
		} else {
			clName.push('unavailable');
		}
		return clName;
	}
};

/**
 * Compute the best position for the given cell, where the ball shouldn't move at start
 */
Cube.prototype.computeBestPosition = function(cell, position, doNotChangeCell) {
	var pst = position,
		dCell;

	if (this.couldMove(cell, pst)) {
		dCell = this.get(cell.x, cell.y, cell.z);

		if (pst.r && dCell.r) {
			pst = Cube.computePosition(pst, '-r');
		}
		if (!pst.r && this.get(cell.x, cell.y - 1, cell.z).r) {
			pst = Cube.computePosition(pst, 'r');
		}

		if (pst.d && dCell.d) {
			pst = Cube.computePosition(pst, '-d');
		}
		if (!pst.d && this.get(cell.x - 1, cell.y, cell.z).d) {
			pst = Cube.computePosition(pst, 'd');
		}

		if (pst.b && dCell.b) {
			pst = Cube.computePosition(pst, '-b');
		}
		if (!pst.b && this.get(cell.x, cell.y, cell.z - 1).b) {
			pst = Cube.computePosition(pst, 'b');
		}

		/* we should be in a room */
		if (this.couldMove(cell, pst)) {
			if (!doNotChangeCell) {
				dCell = this.getMovement(cell, position, 0);
				dCell = dCell[dCell.length - 1];
				cell.x = dCell.x;
				cell.y = dCell.y;
				cell.z = dCell.z;
			}

			pst = position;
		}
	}

	return pst;
};

Cube.prototype.compare = function(cube) {
	return this.getHash() === cube.getHash();
};

Cube.prototype.getHash = function(forceCompute) {
	var hash;

	if (this.hash && !forceCompute) {
		return this.hash;
	}

	hash = this.levels.reduce(function (hash, lvl) {
		return hash + lvl.getHash(forceCompute);
	}, '');

	this.hash = hash;
	return this.hash;
};

/* Static method */

/*
 1 → / -1 ←
 2 ↑ / -2 ↓
 3 ↥ / -3 ↧
*/
Cube.fromDirection = function(direction) {
	var rslt = {
		'-1': { key: 'r', value: false},
		'1': { key: 'r', value: true},
		'-2': { key: 'd', value: true},
		'2': { key: 'd', value: false},
		'-3': { key: 'b', value: true},
		'3': { key: 'b', value: false},
		'0': { key: '?', value: false}
	}
	return rslt[direction];
};

Cube.getDirectionFromMvt = function(mvt) {
	var rslt = {
		'-r': -1,
		'r': 1,
		'd': -2,
		'-d': 2,
		'b': -3,
		'-b': 3,
		'?': 0
	}
	mvt = mvt.replace(/^(-?[?a-z]).*$/, '$1');
	return rslt[mvt];
};

Cube.comparePosition = function(c1, c2) {
	return c1.x === c2.x && c1.y === c2.y && c1.z === c2.z;
};

/*
return
 1 → / -1 ←
 2 ↑ / -2 ↓
 3 ↥ / -3 ↧
*/
Cube.getDirection = function(c1, c2) {
	if (c1.z > c2.z) {
		return 3;
	}
	if (c1.z < c2.z) {
		return -3;
	}

	if (c1.x > c2.x) {
		return 2;
	}
	if (c1.x < c2.x) {
		return -2;
	}

	if (c1.y > c2.y) {
		return -1;
	}
	if (c1.y < c2.y) {
		return 1;
	}

	return 0;
};

/**
 * Compute the new position when a movement occurs
 */
Cube.computePosition = function(position, mvt) {
	var pst = Cube.copyPosition(position);

	switch (mvt) {
		case '-r': pst.r = 0; break;
		case 'r': pst.r = 1; break;
		case '-d': pst.d = 0; break;
		case 'd': pst.d = 1; break;
		case '-b': pst.b = 0; break;
		case 'b': pst.b = 1; break;
	}

	return pst;
};

Cube.copyPosition = function(position) {
	return {
		r: position.r,
		d: position.d,
		b: position.b
	};
};

Cube.checkCell = function (cell) {
	return typeof cell === 'object' && typeof cell.x === 'number' && typeof cell.y === 'number' && typeof cell.z === 'number';
};

Cube.convertToCell = function(aCell) {
	if (!aCell || !(aCell instanceof Array)) {
		return;
	}
	return {
		x: aCell[0],
		y: aCell[1],
		z: aCell[2]
	};
};

Cube.convertFromCell = function(cell) {
	if (!Cube.checkCell(cell)) {
		return;
	}
	return [cell.x, cell.y, cell.z];
};
