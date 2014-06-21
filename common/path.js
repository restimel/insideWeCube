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
				parent: null
			}],
			info = {
				finish: false,
				length: 1,
				deadEnd: -1
			},
			compare = function (o1, o2) {
				return o1.x === o2.x && o1.y === o2.y && o1.z === o2.z;
			},
			searchCell = function(cell) {
				var i, li = p.length;
				
				for (i = li - 1; i >= 0; i--) {
					if (compare(p[i], cell)) {
						return true;
					}
				}

				li = w.length;
				for (i = 0; i < li; i++) {
					if (compare(w[i], cell)) {
						if (w[i].dst > cell.dst) {
							w[i] = cell;
						}
						return true;
					}
				}

				return false;
			},
			addCell = function(ocell) {
				var dst = ocell.dst + 1,
					nextCells = this.cube.getDirection(ocell.x, ocell.y, ocell.z);
				p.push(ocell);

				nextCells.forEach(function(cell){
					cell.dst = dst;
					if (!searchCell(cell)) {
						cell.parent = ocell;
						w.push(cell);
					} else {
						if (nextCells.length === 1) {
							info.deadEnd++;
						}
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

	cell.avoid = [];
	cell.direction = 0; /* finish */

	for (i = 1; i < li; i++) {
		nCell = cell;
		cell = path[i];

		cell.direction = nCell.from;
		cell.avoid = this.avoid(cell, nCell);
	}

	cell.from = 0; /* start */
};

Path.prototype.avoid = function(cell, nCell) {
	var directions = this.cube.getDirection(cell.x, cell.y, cell.z).map(function(c) {
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
};

// called function
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
		cell = info.finish.parent;
		while (cell) {
			path.push(cell);
			cell = cell.parent;
		}

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

		// todo fill info mouvmeent from this path
	}

	self.postMessage({data: {action: 'getPathInfo', data: info}, token: this.token});
};
