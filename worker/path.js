function Path() {
	this.token = -1;
	this.clcToken = -1;
	this.cube = new Cube();

	this.cube.init();
}

Path.prototype.router = function(args, token) {
	var route = args.action,
		data = args.data,
		f = this[route];

	this.token = token;

	if (typeof f === 'function') {
		f.call(this, data);
	} else {
		console.warn('Route not found', route);
	}
};

Path.prototype.calculatePath = function() {
	var token = ++this.clcToken;

	setTimeout(function() {
		if (this.clcToken !== token) {
			// deprecated call
			return;
		}
		this.runCompute();
	}.bind(this), 10);
};

Path.prototype.getAvailableCells = function(cell) {
	var list = [];
	var toAnalyzed = [cell];

	var manageCell = function(cell) {
		var links = cell.linked;
		var i, li, nextCell;

		list.push(cell);
		if (!links) {
			cell.linked = links = this.cube.getNeighbours(cell.x, cell.y, cell.z);
		}

		for (i = 0, li = links.length; i < li; i++) {
			nextCell = searchCell(links[i]);

			if (!nextCell) {
				toAnalyzed.push(links[i]);
			}
		}
	}.bind(this);

	var searchCell = function(cell) {
		var i;

		i = list.length -1;
		if (i>0) {
			for (; i; i--) {
				if (Cube.comparePosition(list[i], cell)) {
					return list[i];
				}
			}
		}

		i = toAnalyzed.length -1;
		if (i>0) {
			for (; i; i--) {
				if (Cube.comparePosition(toAnalyzed[i], cell)) {
					return toAnalyzed[i];
				}
			}
		}

		return false;
	};

	while (toAnalyzed.length) {
		cell = toAnalyzed.pop();
		manageCell(cell);
	}

	return list;
};

Path.prototype.runCompute = function() {
	var finishCell = this.cube.finishCell || {x: this.cube.mapSize - 2, y: this.cube.mapSize - 2, z: this.cube.size - 1};
	var startCell = this.cube.startCell || {x: 1, y: 1, z: 0};
	var deepest = 0;
	var hash;

	var max = Math.max;

	startCell.parent = null;
	startCell.linked = [];

	this.setTarget(finishCell);

	// SPY.start('runCompute-createVar');
	var allCells = [],
		cellsToAnalyzed = [],
		info = {
			finish: false,
			length: 1,
			deadEnd: -1
		},
		that = this,
		searchCell = function(cell){
			// SPY.start('searchCell');
			var r = (function(cell) {
				var i, li = allCells.length;

				for (i = li - 1; i >= 0; i--) {
					if (Cube.comparePosition(allCells[i], cell)) {
						return allCells[i];
					}
				}

				li = cellsToAnalyzed.length;
				for (i = 0; i < li; i++) {
					if (Cube.comparePosition(cellsToAnalyzed[i], cell)) {
						if (cellsToAnalyzed[i].dst > cell.dst) {
							cellsToAnalyzed[i].dst = cell.dst;
							cellsToAnalyzed[i].parent = cell.parent;
						}
						return cellsToAnalyzed[i];
					}
				}

				return false;
			})(cell);
		// SPY.stop('searchCell');
		return r;},
		addCell = function(ocell) {
			// SPY.start('addCell');
			// SPY.start('addCell-1');
			var dst = ocell.dst + 1,
				nextCells = this.cube.getNeighbours(ocell.x, ocell.y, ocell.z);
			// SPY.stop('addCell-1');
			// SPY.start('addCell-2');
			allCells.push(ocell);
			deepest = max(deepest, ocell.z);
			// SPY.stop('addCell-2');

			ocell.linked = [];

			// SPY.start('addCell-3');
			var i = 0;
			var li = nextCells.length;
			var cell;
			while (i<li) {
				cell = nextCells[i];
				cell = that.createCell(cell);
				cell.dst = dst;

				var f = searchCell(cell);
				if (!f) {
					cell.parent = ocell;
					cellsToAnalyzed.push(cell);
					ocell.linked.push(cell);
				} else {
					if (nextCells.length === 1) {
						info.deadEnd++;
					}
					ocell.linked.push(f);
				}
				i++;
			}
			// SPY.stop('addCell-3');
			// SPY.stop('addCell');
		}.bind(this),
		findClosest = function() {
			// SPY.start('findClosest');
			var dst = Infinity,
				pos = -1,
				i, li = cellsToAnalyzed.length;

			for (i = 0; i < li; i++) {
				if (cellsToAnalyzed[i].dst < dst) {
					dst = cellsToAnalyzed[i].dst;
					pos = i;
				}
			}

// SPY.stop('findClosest');
			return pos;
		},
		createPath = function() {
			// SPY.start('createPath');
			var i, cell;
			while (cellsToAnalyzed.length) {
				i = findClosest();
				cell = cellsToAnalyzed[i];
				cellsToAnalyzed.splice(i, 1);

				if (Cube.comparePosition(cell, finishCell)) {
					info.finish = cell;
					info.length = cell.dst;
				}

				addCell(cell);
			}
			// SPY.stop('createPath');
		},
		firstCell = this.createCell(startCell);
	// SPY.stop('runCompute-createVar');

	firstCell.dst = 0;
	cellsToAnalyzed.push(firstCell);
	createPath();

	info.deepest = deepest;
	if (info.finish) {
		hash = this.cube.getHash(true);
	}
	// allAccessible must also include possibilities of phantom bals (regarding options)
	allAccessible = allCells;
	if (Helper.config.phantomBalls) {
		this.cube.phantomBalls.forEach(function(ghost) {
			allAccessible = allAccessible.concat(this.getAvailableCells(ghost));
		}, this);
	}
	this.result({accessible: allCells, allAccessible: allAccessible, info: info, hash: hash});
};

/* could be override to use results elsewhere */
Path.prototype.result = function(rslt) {
	this.storeData = rslt || this.storeData;
	self.postMessage({data: {action: 'getPath', data: this.storeData}, token: this.token});
};

/*
 1 → / -1 ←
 2 ↑ / -2 ↓
 3 ↥ / -3 ↧
*/
Path.prototype.getDirections = function(path) {
	var i = 0, li = path.length,
		nCell,
		cell = path[0];

	if (!cell.direction) {
		cell.avoid = [];
		cell.preferences = {};
		cell.direction = 0; /* finish */
	}

	for (i = 1; i < li; i++) {
		nCell = cell;
		cell = path[i];

		if (!cell.direction) {
			cell.direction = Cube.getDirection(cell, nCell);
			cell.avoid = this.avoid(cell, nCell);
		}
	}

	if (!cell.from) {
		cell.from = -cell.direction;
	}
};

Path.prototype.avoid = function(cell, nCell) {
	var directions = this.cube.getNeighbours(cell.x, cell.y, cell.z).map(function(c) {
			return c.from;
		}),
		mvt = [cell.direction, -cell.direction, cell.from, -cell.from];

	cell.avoid = directions.concat(nCell.avoid)
		.reduce(function(list, dir) {
			if (list.indexOf(dir) === -1 && mvt.indexOf(dir) === -1) {
				list.push(dir);
			}

			return list;
		}, []);

	/* estimate preference */
	this.computePref(cell, nCell);
};

Path.prototype.countMovement = function(path, info, available, pst) {
	var checkPosition = function(currentCell, ballLocation, mvt, willBeMoved) {
		if (!Cube.comparePosition(ballLocation, currentCell)) {
			info.nbMvtOutPath += ballMvt.length - iBallMvt;

			// compute  extra-movements
			var rslt = this.goFrom(ballMvt[ballMvt.length -1], available, path, currentCell, position);

			if (rslt.nbDifficultCrossing) {
				info.nbDifficultCrossing += rslt.nbDifficultCrossing;

				var i = -1, currtCell;

				do {
					i++;
					currtCell = path[iPath + i];
					if (!currtCell) {
						return false;
					}
					rslt.position = this.cube.computeBestPosition(currtCell, rslt.position, true);
				} while (this.cube.couldMove(currtCell, rslt.position));
				rslt.rotations[0] = '?-' + [currtCell.x, currtCell.y, currtCell.z, rslt.position.r, rslt.position.d, rslt.position.b].join('-');
				rslt.lastPos = currtCell;
			}

			rotations = rotations.concat(rslt.rotations);

			position = rslt.position;

			iBallMvt = ballMvt.length;

			if (rslt.lastPos) {
				moveBall(rslt.lastPos, willBeMoved);
			}

			return false;
		}
		return true;
	}.bind(this),
		// move path up to where the ball is now
		moveBall = function(nPos, willBeMoved) {
			var i = iPath;
			if (!Cube.comparePosition(nPos, currCell)) {
				while (!Cube.comparePosition(nPos, path[i])) {
					i++;
				}

				if (willBeMoved) {
					i--;
				}

				iPath = i;
				currCell = path[iPath];
			} else if (willBeMoved) {
				iPath--;
				currCell = path[iPath];
			}
		};

	var position = pst || {
			r: false,
			d: true,
			b: true
		},
		rotations = [],
		iPath = 0,
		ballMvt = [], iBallMvt = 0, ballLocation,
		currCell, pref,
		pos, verif;

	while (iPath < path.length - 1) {
		currCell = path[iPath];

		// the ball has stop at this place
		if (iBallMvt >= ballMvt.length -1) {
			if (typeof ballMvt[iBallMvt] !== 'undefined') { //when last position of ballMvt
				checkPosition(currCell, ballMvt[iBallMvt], ballMvt);
			}

			// make cube rotations
			this.logRotations(position, currCell.preferences, rotations, currCell);

			// get orientation to do the movement
			pos = Cube.fromDirection(currCell.direction);

			position[pos.key] = pos.value;
			rotations.push(pos.value ? pos.key: '-' + pos.key);

			ballMvt = this.cube.getMovement(currCell, position, currCell.from);
			iBallMvt = 0;
		}
		ballLocation = ballMvt[iBallMvt];

		checkPosition(currCell, ballLocation, ballMvt, true);

		iPath++;
		iBallMvt++;
	}

	info.nbMovement = rotations.length;
	info.chgTop = rotations.filter(function(v) {return v === 'b' || v === '-b';}).length;
	info.rotations = rotations;
};

/**
 * Save movements needed to change rotation
 */
Path.prototype.logRotations = function(position, pref, rotations, currCell) {
	var verif;

	if ( typeof pref.r !== 'undefined' && position.r != pref.r && Math.abs(currCell.direction) !== 1) {
		position.r = pref.r;
		rotations.push(pref.r ? 'r' : '-r');
		verif = this.cube.getMovement(currCell, position, currCell.from);
		if (verif.length > 1) {
			console.warn('Movement unexpected Right (cell, position, pref, verif, rotations)', currCell, position, pref, verif, rotations);
			rotations.pop();
			position.r = !pref.r;
		}
	}

	if ( typeof pref.d !== 'undefined' && position.d != pref.d && Math.abs(currCell.direction) !== 2) {
		position.d = pref.d;
		rotations.push(pref.d ? 'd' : '-d');
		verif = this.cube.getMovement(currCell, position, currCell.from);
		if (verif.length > 1) {
			console.warn('Movement unexpected Down (cell, position, pref, verif, rotations)', currCell, position, pref, verif, rotations);
			rotations.pop();
			position.d = !pref.d;
		}
	}

	if ( typeof pref.b !== 'undefined' && position.b != pref.b && Math.abs(currCell.direction) !== 3) {
		position.b = pref.b;
		rotations.push(pref.b ? 'b' : '-b');
		verif = this.cube.getMovement(currCell, position, currCell.from);
		if (verif.length > 1) {
			console.warn('Movement unexpected Bottom (cell, position, pref, verif, rotations)', currCell, position, pref, verif, rotations);
			rotations.pop();
			position.b = !pref.b;
		}
	}
};

Path.prototype.buildPath = function(cell, endCells) {
	var path = [cell];

	do {
		cell = cell.linked.reduce(function(shortest, cell) {
			if (shortest.dstFromTarget > cell.dstFromTarget) {
				return cell;
			}
			return shortest;
		}, {dstFromTarget: Infinity});
		path.push(cell);
	} while (cell.linked && !endCells.some(Cube.comparePosition.bind(Cube, cell)));

	return path;
};

/**
 * Compute movements to find the way back to path using a different technique than goFrom
 *		- fromCell {Cell}: cell where the ball is lost
 *		- available {Cell[]}: list of available cells
 *		- path {Cell[]}: list of cell which is the main path from Start to End
 *		- ref {Cell}: cell where the ball must go
 *		- currPosition {Position}: current cube orientation
 */
Path.prototype.goFrom = function(fromCell, available, path, ref, currPosition) {
	/* find the way back */
	var info = {
		nbDifficultCrossing: 0,
		rotations: []
	};
	var position = Cube.copyPosition(currPosition);
	var done = [];
	var todo = [{
		rotations: [],
		cell: fromCell,
		pos: currPosition
	}];
	var cube = this.cube;
	var result;

	/* functions used in process */
	var getCellFromMvt = function(mvt, cellPos) {
		var cell, pos, direction, allCells;

		mvt = cellPos.pos[mvt] ? '-' + mvt : mvt;
		direction = Cube.getDirectionFromMvt(mvt);
		pos = Cube.computePosition(cellPos.pos, mvt);
		allCells = cube.getMovement(cellPos.cell, pos, direction);
		cell = allCells[allCells.length - 1];

		return {
			rotations: cellPos.rotations.concat([mvt]),
			cell: cell,
			pos: pos
		};
	};

	var computeNextMvt = function(cellPos) {
		return [
			getCellFromMvt('r', cellPos),
			getCellFromMvt('d', cellPos),
			getCellFromMvt('b', cellPos)
		];
	};

	var isInAvailable = function(nextCell) {
		var iPath = -1;
		var aCell;

		/* check that we are coming back to the right path */
		path.some(function(cell) {
			if (Cube.comparePosition(nextCell.cell, cell)) {
				aCell = cell;
				return true;
			}
			return false;
		});

		return aCell;
	};

	var isNotInArray = function(array, nextCell) {
		return !array.some(function(cell) {
			return Cube.comparePosition(cell.cell, nextCell.cell) &&
				   cell.pos.r == nextCell.pos.r &&
				   cell.pos.d == nextCell.pos.d &&
				   cell.pos.b == nextCell.pos.b
		});
	};

	var addResult = function(cellPos) {
		if (result &&
			(result.rotations.length < cellPos.rotations.length ||
			 (result.rotations.length === cellPos.rotations.length &&
			  result.cell.dstFromTarget <= cellPos.cell.dstFromTarget
			 )
			)
		   )
		{
			return;
		}
		result = cellPos;
	};

	var analyzeNextCell = function(nextCell) {
		var cell;

		cell = isInAvailable(nextCell);
		if (cell) {
			if (cell.dstFromTarget <= ref.dstFromTarget) {
				/* is in the right direction */
				nextCell.cell = cell;
				addResult(nextCell);
			} /* else drop the cell as it is worst than ref */
			return;
		}

		if (isNotInArray(done, nextCell) && isNotInArray(todo, nextCell)) {
			todo.push(nextCell);
		}
	};

	var analyzeNexts = function(nextCellPos) {
		nextCellPos.forEach(analyzeNextCell);
	};

	/* variables needed for computation */
	var cellPos;
	var nextCellPos;

	/* compute cells */
	while (todo.length && !result) {
		cellPos = todo.shift();
		done.push(cellPos);

		nextCellPos = computeNextMvt(cellPos);
		analyzeNexts(nextCellPos);
	}

	/* manage result */
	if (!result) {
		info.nbDifficultCrossing++;
		info.rotations = ['?'];
		info.lastPos = ref;
		info.position = Cube.copyPosition(ref.preferences);
	} else {
		info.rotations = result.rotations;
		info.lastPos = result.cell;
		info.position = result.pos;
	}

	return info;
};

Path.prototype.computeDist = function (fromCell, attr) {
	var remain = [fromCell],
		done = [],
		cell, pos, dist,
		hasBeenWatch = function(c) {
			return done.some(Cube.comparePosition.bind(Cube, c)) || remain.some(Cube.comparePosition.bind(Cube, c));
		},
		findClosest = function() {
			var dst = Infinity,
				pos = -1,
				i, li = remain.length;

			for (i = 0; i < li; i++) {
				if (remain[i][attr] < dst) {
					dst = remain[i][attr];
					pos = i;
				}
			}

			return pos;
		};

	fromCell[attr] = 0;

	while (remain.length) {
		pos = findClosest();
		cell = remain[pos];
		done.push(cell);
		remain.splice(pos, 1);

		dist = cell[attr] + 1;

		if (!cell.linked) {
			console.warn('no linked', cell);
		}
		cell.linked.forEach(function(c) {
			if (!hasBeenWatch(c)) {
				c[attr] = dist;
				remain.push(c);
			}
		});
	}
};

Path.prototype.computePref = function(cell, nCell) {
	var posFrom = Cube.fromDirection(cell.from),
		pos = Cube.fromDirection(cell.direction);

	if (!cell.preferences || typeof cell.preferences.r === 'undefined') {
		cell.preferences = Cube.copyPosition(nCell.preferences);

		cell.avoid.forEach(function(dir) {
			var p = Cube.fromDirection(dir);
			if (p) {
				cell.preferences[p.key] = !p.value;
			}
		});

		if (typeof posFrom !== 'undefined') {
			cell.preferences[posFrom.key] = posFrom.value;
		}
		if (typeof pos !== 'undefined') {
			cell.preferences[pos.key] = pos.value;
		}
	}
};

Path.prototype.getPathMvt = function(cell, cellTarget, startPosition, available, resetDirection) {
	cell = available.filter(Cube.comparePosition.bind(Cube, cell))[0];
	cellTarget = available.filter(Cube.comparePosition.bind(Cube, cellTarget))[0];
	startPosition = Cube.copyPosition(startPosition);

	this.setTarget(cellTarget);

	/* compute path */
	this.computeDist(cellTarget, 'dstFromTarget');
	var path = this.buildPath(cell, [cellTarget]);

	/* compute avoid & pref */
	this.getDirections(path.reverse());
	path.reverse();

	/* compute mvt */
	var info = {
		nbDifficultCrossing: 0,
		rotations: []
	};

	this.countMovement(path, info, available, startPosition);

	return info.rotations;
};

Path.prototype.setTarget = function(target) {
	this.TargetCell = target;
	this.target = '_' + target.x + '_' + target.y + '_' + target.z;
}

/**
 * Add information and method to cells
 */
Path.prototype.createCell = function(cell) {
	if (!cell.hasOwnProperty('direction')) {
		cell.info = {};

		var compute = false,
			getInfo = function(search) {
			var path;

			if (typeof cell.info[this.target] === 'undefined') {
				cell.info[this.target] = {};

				if (search) {
					compute = true;
					this.computeDist(this.targetCell, 'dstFromTarget');
					this.getDirections(path);
					compute = false;
				}
			}

			return cell.info[this.target];
		}.bind(this);

		Object.defineProperty(cell, 'direction', {
			get: function() {
				return getInfo(true).direction;
			},
			set: function(val) {
				getInfo().direction = val;
			}
		});

		Object.defineProperty(cell, 'preferences', {
			get: function() {
				return getInfo(true).preferences;
			},
			set: function(val) {
				getInfo().preferences = val;
			}
		});

		Object.defineProperty(cell, 'avoid', {
			get: function() {
				return getInfo(true).avoid;
			},
			set: function(val) {
				getInfo().avoid = val;
			}
		});

		Object.defineProperty(cell, 'dstFromTarget', {
			get: function() {
				var dstFromTarget = getInfo(true).dstFromTarget;

				if (typeof dstFromTarget === 'undefined' && !compute) {
					compute = true;
					this.computeDist(this.targetCell, 'dstFromTarget');
					compute = false;
				}

				return getInfo(true).dstFromTarget;
			},
			set: function(val) {
				getInfo().dstFromTarget = val;
			}
		});
	}

	return cell;
};

/**
 * called functions (for routing)
 */

Path.prototype.loadCube = function(cubeName) {
	this.cube = store.getCube(cubeName).clone();
	this.calculatePath();
};

Path.prototype.loadLevel = function(args) {
	var index = args.index,
		levelName = args.levelName;

	this.cube.levels[index].parse(store.getLevel(levelName).toJSON());
	this.calculatePath();
};

Path.prototype.loadLevels = function(levels) {
	// SPY.start('loadLevels-load');
	// levels.forEach(function(levelName, index) {
	// 	this.cube.levels[index].parse(store.getLevel(levelName).toJSON());
	// }, this);

	levels.forEach(function(lvl, index) {
		this.cube.levels[index] = lvl;
	}, this);
	// SPY.stop('loadLevels-load');

	// SPY.start('loadLevels-run');
	this.runCompute();
	// SPY.stop('loadLevels-run');
};

Path.prototype.rotateLevel = function(args) {
	var index = args.index,
		rotation = args.rotation;

	this.cube.levels[index].rotate(rotation);
	this.calculatePath();
};

Path.prototype.reset = function(args) {
	var color = this.cube.color;
	this.cube = new Cube();
	this.cube.reset(args);
	this.cube.init();
	this.cube.color = color;
};

/**
 * Change a cell wall states and run the path processing.
 * @param args {Object}
 *		- x {Number} x coordinates of the cell
 *		- y {Number} y coordinates of the cell
 *		- z {Number} z coordinates of the cell
 *		- type {'r'|'d'|'b'} the wall to update
 *		- z {Boolean} if we could go through the wall (truthy) or not (falsy)
 */
Path.prototype.setCell = function(args) {
	var x = args.x,
		y = args.y,
		z = args.z,
		type = args.type,
		value = args.value;

	if (type === 'P') {
		this.cube.togglePhantom({
			x: x,
			y: y,
			z: z
		});
		return this.result();
	} else if (type === 's' && value === 1) {
		this.cube.startCell = {
			x: x,
			y: y,
			z: z
		};
	} else if (type === 's' && value === -1) {
		this.cube.finishCell = {
			x: x,
			y: y,
			z: z
		};
	} else {
		this.cube.get(x, y, z)[type] = value;
	}
	this.calculatePath();
};

/**
 * (re)run the path calculation without any changes
 */
Path.prototype.computePath = function() {
	this.calculatePath();
};

/**
 * Change the cube color
 * @param args {Object}
 *		- color {String} the color of the cube
 */
Path.prototype.setColor = function(args) {
	this.cube.color = args.color;
};

/**
 * Return the map of the current cube
 */
Path.prototype.getCubeMap = function(data) {
	var orientation = data.orientation || 'top',
		accessiblePath = data.allAccessible || data.accessible || [];

	self.postMessage({data: {
		action: 'getCubeMap',
		data: this.cube.renderMap(orientation, accessiblePath)
	}, token: this.token});
};

/**
 * Return the map of the current cube
 */
Path.prototype.getCubeMaps = function(data) {
	var accessiblePath = data.accessible || [],
		maps = [];

	maps.push({
		orientation: $$('The INSIDE³ side'),
		html: this.cube.renderMap('top', accessiblePath)
	});

	maps.push({
		orientation: $$('The InsideZeCube.com side'),
		html: this.cube.renderMap('bottom', accessiblePath)
	});

	if (Helper.config.stickerMaps) {
		maps.push({
			orientation: $$('The right side'),
			html: this.cube.renderMap('right', accessiblePath)
		});

		maps.push({
			orientation: $$('The front side'),
			html: this.cube.renderMap('front', accessiblePath)
		});

		maps.push({
			orientation: $$('The left side'),
			html: this.cube.renderMap('left', accessiblePath)
		});

		maps.push({
			orientation: $$('The rear side'),
			html: this.cube.renderMap('back', accessiblePath)
		});
	}

	self.postMessage({data: {
		action: 'getCubeMaps',
		data: maps
	}, token: this.token});
};

Path.prototype.getPathInfo = function(data) {
	var cells = data.accessible,
		last = cells[cells.length - 1],
		info = data.info,
		path = [],
		cell, i, li;

	info.available = cells.length;
	if (info.finish) {
		this.setTarget(info.finish);

		/* compute distance from end */
		this.computeDist(info.finish, 'dstFromTarget');

		cell = info.finish;
		do {
			path.push(cell);
			cell = cell.parent;
		} while (cell);

		this.getDirections(path);
		path = path.reverse();

		info.chgLevel = 0;
		info.chgDirection = 0;
		info.chgTop = 0;
		info.nbMovement = 0;
		info.nbMvtOutPath = 0;
		info.nbDifficultCrossing = 0;

		li = path.length - 1;
		for(i = 1; i < li; i++) {
			cell = path[i];
			if (cell.from !== cell.direction) {
				if ([-1, 1, -2, 2].indexOf(cell.direction) !== -1) {
					info.chgDirection++;
				}
			}
			if ([-3, 3].indexOf(cell.direction) !== -1) {
				info.chgLevel++;
			}
		}

		this.countMovement(path, info, cells);
	}

	self.postMessage({data: {action: 'getPathInfo', data: info}, token: this.token});
};
