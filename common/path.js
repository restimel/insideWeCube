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
				dst: 0
			}],
			info = {
				finish: false,
				length: 0,
				deadEnd: 0
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
							w[i].dst = cell.dst;
						}
						return true;
					}
				}

				return false;
			},
			addCell = function(cell) {
				var dst = cell.dst + 1,
					nextCells = this.cube.getDirection(cell.x, cell.y, cell.z);
				p.push(cell);

				nextCells.forEach(function(cell){
					cell.dst = dst;
					if (!searchCell(cell)) {
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
						info.finish = true;
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
	self.postMessage({data: rslt, token: this.token});
};

// called function
Path.prototype.loadLevel = function(args) {
	var index = args.index,
		levelName = args.levelName;

	this.cube.levels[index].parse(store.getLevel(levelName).clone());
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
