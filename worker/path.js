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

		this.setTarget({x: 4, y: 4, z: 6});

		var p = [],
			w = [],
			info = {
				finish: false,
				length: 1,
				deadEnd: -1
			},
			that = this,
			searchCell = function(cell) {
				var i, li = p.length;
				
				for (i = li - 1; i >= 0; i--) {
					if (Cube.comparePosition(p[i], cell)) {
						return p[i];
					}
				}

				li = w.length;
				for (i = 0; i < li; i++) {
					if (Cube.comparePosition(w[i], cell)) {
						if (w[i].dst > cell.dst) {
							w[i].dst = cell.dst;
							w[i].parent = cell.parent;
						}
						return w[i];
					}
				}

				return false;
			},
			addCell = function(ocell) {
				var dst = ocell.dst + 1,
					nextCells = this.cube.getNeighbours(ocell.x, ocell.y, ocell.z);
				p.push(ocell);

				ocell.linked = [];

				nextCells.forEach(function(cell){
					cell = that.createCell(cell);
					cell.dst = dst;

					var f = searchCell(cell);
					if (!f) {
						cell.parent = ocell;
						w.push(cell);
						ocell.linked.push(cell);
					} else {
						if (nextCells.length === 1) {
							info.deadEnd++;
						}
						ocell.linked.push(f);
					}
				});
			}.bind(this),
			findClosest = function() {
				var dst = Infinity,
					pos = -1,
					i, li = w.length;

				for (i = 0; i < li; i++) {
					if (w[i].dst < dst) {
						dst = w[i].dst;
						pos = i;
					}
				}

				return pos;
			},
			createPath = function() {
				var i, cell;
				while (w.length) {
					i = findClosest();
					cell = w[i];
					w.splice(i, 1);

					if (cell.z === 6 && cell.x === 4 && cell.y === 4) {
						info.finish = cell;
						info.length = cell.dst;
					}

					addCell(cell);
				}
			},
			firstCell = this.createCell({
				x: 1,
				y: 1,
				z: 0,
				parent: null,
				linked: []
			});

		firstCell.dst = 0;
		w.push(firstCell);
		createPath();

		this.result({accessible: p, info: info});
	}.bind(this), 10);
};

/* could be override to use results elsewhere */
Path.prototype.result = function(rslt) {
	self.postMessage({data: {action: 'getPath', data: rslt}, token: this.token});
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
	var checkPosition = function(currentCell, ballLocation, mvt) {
		if (!Cube.comparePosition(ballLocation, currentCell)) {
			info.nbMvtOutPath += ballMvt.length - iBallMvt;

			// compute  extra-movements
			var rslt = this.goFrom(ballMvt[ballMvt.length -1], available, path, currentCell, position);

			if (rslt.nbDifficultCrossing) {
				info.nbDifficultCrossing += rslt.nbDifficultCrossing;

				// rslt.rotations[0] = '?-' + [currentCell.x, currentCell.y, currentCell.z].join('-');
			}

			rotations = rotations.concat(rslt.rotations);

			position = rslt.position;

			iBallMvt = ballMvt.length;

			if (rslt.lastPos) {
				moveBall(rslt.lastPos);
			}

			return false;
		}
		return true;
	}.bind(this),
		// move path up to where the ball is now
		moveBall = function(nPos) {
			var i = iPath;
			if (!Cube.comparePosition(nPos, currCell)) {
				while (!Cube.comparePosition(nPos, path[i])) {
					i++;
				}

				iPath = i;
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
		
		checkPosition(currCell, ballLocation, ballMvt);

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
			console.warn('Movement unexpected Right', currCell, position, verif);
		}
	}

	if ( typeof pref.d !== 'undefined' && position.d != pref.d && Math.abs(currCell.direction) !== 2) {
		position.d = pref.d;
		rotations.push(pref.d ? 'd' : '-d');
		verif = this.cube.getMovement(currCell, position, currCell.from);
		if (verif.length > 1) {
			console.warn('Movement unexpected Down', currCell, position, verif);
		}
	}

	if ( typeof pref.b !== 'undefined' && position.b != pref.b && Math.abs(currCell.direction) !== 3) {
		position.b = pref.b;
		rotations.push(pref.b ? 'b' : '-b');
		verif = this.cube.getMovement(currCell, position, currCell.from);
		if (verif.length > 1) {
			console.warn('Movement unexpected Bottom', currCell, position, verif);
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
	} while (!endCells.some(Cube.comparePosition.bind(Cube, cell)));

	return path;
}

/**
 * Compute movements to find the way back to path
 */
Path.prototype.goFrom = function(fromPos, available, path, ref, currPosition, maxIter) {
	if (typeof maxIter !== 'number') {
		maxIter = 10;
	}

	fromPos = available.filter(Cube.comparePosition.bind(Cube, fromPos))[0];

	/* find the way back */
	var wbPath,
		info = {
			nbDifficultCrossing: 0,
			rotations: []
		},
		position = {
			r: currPosition.r,
			d: currPosition.d,
			b: currPosition.b
		},
		i;

	if (!fromPos.preferences || typeof fromPos.preferences.r === 'undefined') {
		/* compute path to find the way back */
		wbPath = this.buildPath(fromPos, path);

		this.getDirections(wbPath.reverse());
		wbPath.reverse();
	}

	/* save rotations needed */
	this.logRotations(position, fromPos.preferences, info.rotations, fromPos);

	/* test cube orientation to find the way back */
	var mvt = this.cube.getMovement(fromPos, fromPos.preferences, fromPos.from);
	var lastPos = mvt[mvt.length - 1];
	var rot = Cube.fromDirection(fromPos.direction);

	info.position = fromPos.preferences;
	info.rotations.push(rot.value ? rot.key : '-' + rot.key);

	var iPath = -1;

	/* check that we are coming back to the right path */
	path.some(function(cell, i) {
		if (Cube.comparePosition(lastPos, cell)) {
			iPath = i;
			lastPos = cell;
			return true;
		}
		return false;
	});

	if (iPath !== -1) {
		/* the ball is came back to the path */
		if (lastPos.dstFromTarget > ref.dstFromTarget) {
			if (maxIter) {
				info2 = this.goFrom(lastPos, available, path, ref, position, maxIter - 1);
				if (info2.nbDifficultCrossing) {
					/* path back could not be found */;
					info = info2;
				} else {
					info2.rotations = info.rotations.concat(info2.rotations);
					info = info2;
				}
			} else {
				/* has moving back to an earlier cell */
				info.nbDifficultCrossing = 1;
				info.rotations = ['?'];
			}
		} else {
			/* has found the exit */
			info.lastPos = lastPos;
		}

	} else {
		/* we still haven't refound the path */
		if (maxIter) {
			info2 = this.goFrom(lastPos, available, path, ref, position, maxIter - 1);

			if (info2.nbDifficultCrossing) {
				/* Path back not found*/
				info = info2;
			} else {
				info2.rotations = info.rotations.concat(info2.rotations);
				info = info2;
			}
		} else {
			info.nbDifficultCrossing = 1;
			info.rotations = ['?'];
		}
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
		cell.preferences = {
			r: nCell.preferences.r,
			d: nCell.preferences.d,
			b: nCell.preferences.b
		};

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
	startPosition = {
		b: startPosition.b,
		d: startPosition.d,
		r: startPosition.r
	};

	this.setTarget(cellTarget);

	/* compute path */
	this.computeDist(cellTarget, 'dstFromTarget');
	var path = this.buildPath(cell, [cellTarget]);

/* still needed? */
	// if (resetDirection) {
	// 	path.forEach(function(cell) {
	// 		delete cell.direction;
	// 	});
	// }
/* still needed ??? */

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

Path.prototype.reset = function(args) {
	this.cube = new Cube();
	this.cube.init();
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

	this.cube.get(x, y, z)[type] = value;
	this.calculatePath();
};

/**
 * (re)run the path calculation without any changes
 */
Path.prototype.computePath = function() {
	this.calculatePath();
};

/**
 * Return the map of the current cube
 */
Path.prototype.getCubeMap = function(data) {
	var orientation = data.orientation || 'top',
		accessiblePath = data.accessible || [];

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
		data = [];

	data.push({
		orientation: $$('The INSIDE³ side'),
		html: this.cube.renderMap('top', accessiblePath)
	});

	data.push({
		orientation: $$('The InsideZeCube.com side'),
		html: this.cube.renderMap('bottom', accessiblePath)
	});

	self.postMessage({data: {
		action: 'getCubeMaps',
		data: data
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
