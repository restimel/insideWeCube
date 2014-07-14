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
	}
};

Path.prototype.calculatePath = function() {
	var token = ++this.clcToken;

	setTimeout(function() {
		if (this.clcToken !== token) {
			// deprecated call
			return;
		}

		var p = [],
			w = [{
				x: 1,
				y: 1,
				z: 0,
				dst: 0,
				parent: null,
				linked: []
			}],
			info = {
				finish: false,
				length: 1,
				deadEnd: -1
			},
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
			};
		createPath();

		this.result({accessible: p, info: info});
	}.bind(this), 10);
};

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
			// if (nCell.from) {
			// 	cell.direction = nCell.from;
			// } else {
				cell.direction = Cube.getDirection(cell, nCell);
			// }
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
		mvt = [cell.direction, -cell.direction, cell.from, -cell.from],
		pos = Cube.fromDirection(cell.direction),
		posFrom = Cube.fromDirection(cell.from);

	cell.avoid = directions.concat(nCell.avoid)
		.reduce(function(list, dir) {
			if (list.indexOf(dir) === -1 && mvt.indexOf(dir) === -1) {
				list.push(dir);
			}

			return list;
		}, []);

	/* estimate preference */
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
	cell.preferences[pos.key] = pos.value;
};

Path.prototype.countMovement = function(path, info, available) {
	var checkPosition = function(currentCell, ballLocation, mvt) {
		if (!Cube.comparePosition(ballLocation, currentCell)) {
			info.nbMvtOutPath += ballMvt.length - iBallMvt;

			// compute  extra-movements
			var rslt = this.goFrom(ballMvt[ballMvt.length -1], available, path, currentCell, position);

			info.nbDifficultCrossing += rslt.nbDifficultCrossing;
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

	var position = {
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
			if (typeof ballMvt[iBallMvt] !== 'undefined') {
				checkPosition(currCell, ballMvt[iBallMvt], ballMvt);
			}

			// make cube rotations
			this.logRotations(position, currCell.preferences, rotations, currCell);
			
			// get orientation to do the movement
			pos = Cube.fromDirection(currCell.direction);

			position[pos.key] = pos.value;
			rotations.push(pos.value ? pos.key: '-' + pos.key);

			ballMvt = this.cube.getMovement(currCell, position, currCell.from);
			// console.log('Debug',iPath,position, ballMvt)
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

Path.prototype.logRotations = function(position, pref, rotations, currCell) {
	var verif;

	if ( position.r !== pref.r && Math.abs(currCell.direction) !== 1) {
		position.r = pref.r;
		rotations.push(pref.r ? 'r' : '-r');
		verif = this.cube.getMovement(currCell, position, currCell.from);
		if (verif.length > 1) {
			console.warn('Movement unexpected Right', currCell, position, verif);
		}
	}

	if ( position.d !== pref.d && Math.abs(currCell.direction) !== 2) {
		position.d = pref.d;
		rotations.push(pref.d ? 'd' : '-d');
		verif = this.cube.getMovement(currCell, position, currCell.from);
		if (verif.length > 1) {
			console.warn('Movement unexpected Down', currCell, position, verif);
		}
	}

	if ( position.b !== pref.b && Math.abs(currCell.direction) !== 3) {
		position.b = pref.b;
		rotations.push(pref.b ? 'b' : '-b');
		verif = this.cube.getMovement(currCell, position, currCell.from);
		if (verif.length > 1) {
			console.warn('Movement unexpected Bottom', currCell, position, verif);
		}
	}
};

/**
 * Compute movements to find the way back to path
 */
Path.prototype.goFrom = function(fromPos, available, path, ref, currPosition, maxIter) {
	if (typeof maxIter !== 'number') {
		maxIter = 4;
	}

	fromPos = available.filter(Cube.comparePosition.bind(Cube, fromPos))[0];

	// find the way back
	var wbPath = [fromPos],
		cell = fromPos,
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
		// compute path to find the way back
		do {
			cell = cell.linked.reduce(function(shortest, cell) {
				if (shortest.fromEnd > cell.fromEnd) {
					return cell;
				}
				return shortest;
			}, {fromEnd: Infinity});
			wbPath.push(cell);
		} while (!path.some(Cube.comparePosition.bind(Cube, cell)));

		this.getDirections(wbPath.reverse());
		wbPath.reverse();
		console.log('preferences:', fromPos.preferences);

		// computePref
		// i = wbPath.length - 1;
		// while (i--) {
		// 	this.computePref(wbPath[i], wbPath[i + 1]);
		// }
	}

	// save rotations needed
	this.logRotations(position, fromPos.preferences, info.rotations, fromPos);

	// test cube orientation to find the way back
	var mvt = this.cube.getMovement(fromPos, fromPos.preferences, fromPos.from);
	var lastPos = mvt[mvt.length - 1];
	console.log('mvt for coming back', mvt);
	info.position = fromPos.preferences;

	var iPath = -1;

	// check that we are coming back to the right path
	path.some(function(cell, i) {
		if (Cube.comparePosition(lastPos, cell)) {
			iPath = i;
			lastPos = cell;
			return true;
		}
		return false;
	});

	if (iPath !== -1) {
		console.log('find' + maxIter, lastPos.fromEnd, ref.fromEnd)
		if (lastPos.fromEnd > ref.fromEnd) {
			if (maxIter) {
				info2 = this.goFrom(lastPos, available, path, ref, position, maxIter - 1);
				if (info2.nbDifficultCrossing) {
					console.log('path back not found' + maxIter, lastPos, lastPos.preferences, mvt);
					info = info2;
				} else {
					info2.rotations = info.rotations.concat(info2.rotations);
					info = info2;
				}
			} else {
				console.log('AIE origin ref found earlier', lastPos, ref, mvt);
				info.nbDifficultCrossing = 1;
				info.rotations = ['?'];
			}
		} else {
			info.lastPos = lastPos;
		}
	} else {
		if (maxIter) {
			info2 = this.goFrom(lastPos, available, path, ref, position, maxIter - 1);

			if (info2.nbDifficultCrossing) {
				console.log('path back not found' + maxIter, lastPos, lastPos.preferences, mvt);
				info = info2;
			} else {
				info2.rotations = info.rotations.concat(info2.rotations);
				info = info2;
			}
		} else {
			// TODO find why preferences not good
			console.log('path back not found XXX' + maxIter, lastPos, lastPos.preferences, mvt);
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
		}
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

/**
 * called function
 */
Path.prototype.loadLevel = function(args) {
	var index = args.index,
		levelName = args.levelName;

	this.cube.levels[index].parse(store.getLevel(levelName).toJSON());
	this.calculatePath();
};

Path.prototype.setCell = function(args) {
	var x = args.x,
		y = args.y,
		z = args.z,
		type = args.type,
		value = args.value;

	this.cube.get(x, y, z)[type] = value;
	this.calculatePath();
};

Path.prototype.getPathInfo = function(data) {
	var cells = data.accessible,
		last = cells[cells.length - 1],
		info = data.info,
		path = [],
		cell, i, li;

	info.available = cells.length;
	if (info.finish) {
		/* compute distance from end */
		this.computeDist(info.finish, 'fromEnd');

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

