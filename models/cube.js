function Cube (name) {
	this.name = name;
	this.levels = [];
	this.visible = true;
}

Cube.prototype.init = function() {
	var nb = 7,
		i;

	for (i = 0; i < nb; i++) {
		this.levels[i] = new Level();
	}
};

Cube.prototype.clone = function(alsoMetaData) {
	var cube = new Cube();
	cube.parse(this.toJSON());

	if (alsoMetaData) {
		cube.visible = this.visible;
		cube.original = this.original;
	}

	return cube;
};

Cube.prototype.addLevel = function (z, level) {
	this.levels[z] = level;
};

Cube.prototype.get = function (x, y, z) {
	if (z<0 || z>6 || x<0 || x>5 || y<0 || y>5) {
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
	if (x < 5 && cell.d && this.isFree(x+1, y, z)) {
		directions.push({
			x: x + 1,
			y: y,
			z: z,
			from: -2
		});
	}

	// right
	if (y < 5 && cell.r && this.isFree(x, y+1, z)) {
		directions.push({
			x: x ,
			y: y + 1,
			z: z,
			from: 1
		});
	}

	// bottom
	if (z < 6 && cell.b) {
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
		levels: this.levels.map(function(l) {return l.toJSON();})
	};

	if (this.startCell.x !== 1 || this.startCell.y !== 1 || this.startCell.z !== 0) {
		json.start = this.startCell;
	}

	if (this.finishCell.x !== 4 || this.finishCell.y !== 4 || this.finishCell.z !== 6) {
		json.end = this.finishCell;
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

	if (Cube.checkCell(json.start)) {
		this.startCell = json.start;
	} else {
		this.startCell = {x: 1, y: 1, z: 0};
	}

	if (Cube.checkCell(json.end)) {
		this.finishCell = json.end;
	} else {
		this.finishCell = {x: 4, y: 4, z: 6};
	}

	if (option && option.fromDB) {
		this.visible = !!json.visible;
		this.original = !!json.original;
	}

	this.levels = [];
	json.levels.forEach(function(l, i) {this.addLevel(i, new Level(l));}, this);
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

	if (typeof cell.r === 'undefined') {
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

Cube.prototype.renderMap = function(orientation, available, uid) {
	uid = uid || '';
	var cube = [],
		x, y, z,
		level, row, cell,
		cl, clName,
		computeClass = {
			'top': function(x, y, z) {
				var cl;

				if (isAvailable(x, y, z)) {
					cl = this.get(x, y, z);
					if (cl.b) {
						clName.push('hole');
					}
					if (cl.d) {
						clName.push('passage-down');
					}
					if (cl.r) {
						clName.push('passage-right');
					}
					if (this.get(x-1, y, z).d) {
						clName.push('passage-up');
					}
					if (this.get(x, y-1, z).r) {
						clName.push('passage-left');
					}
					if (cl.s === 1) {
						clName.push('start-cell');
					} else if (cl.s === -1) {
						clName.push('end-cell');
					} else if (cl.s === 2) {
						clName.push('pin');
					}
					if (this.get(x, y, z-1).s === -2) {
						clName.push('pin-top');
					}
					cell += ' id="map'+uid+'-'+x+'-'+y+'-'+z+'"';
				} else {
					clName.push('unavailable');
				}
			},
			'bottom': function(x, y, z) {
				var cl;
				z = 6 - z;
				x = 5 - x;

				if (isAvailable(x, y, z)) {
					cl = this.get(x, y, z);
					if (this.get(x, y, z - 1).b) {
						clName.push('hole');
					}
					if (cl.d) {
						clName.push('passage-up');
					}
					if (cl.r) {
						clName.push('passage-right');
					}
					if (this.get(x-1, y, z).d) {
						clName.push('passage-down');
					}
					if (this.get(x, y-1, z).r) {
						clName.push('passage-left');
					}
					if (cl.s === 1) {
						clName.push('start-cell');
					} else if (cl.s === -1) {
						clName.push('end-cell');
					} else if (cl.s === 2) {
						clName.push('pin-top');
					}
					if (this.get(x, y, z-1).s === -2) {
						clName.push('pin');
					}
					cell += ' id="map'+uid+'-'+x+'-'+y+'-'+z+'"';
				} else {
					clName.push('unavailable');
				}
			}
		}[orientation];

	if (typeof computeClass !== 'function') {
		return [];
	}
	computeClass = computeClass.bind(this);

	for(z = 0; z < 7; z++) {
		level = [
			'<table',
			' id="mapLevel', uid, '-', z, '"',
			' class="mini-map color-', this.color, '">'
		];

		for(x = 0; x < 6; x++) {
			row = ['<tr>'];

			for(y = 0; y < 6; y++) {
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
}