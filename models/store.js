var store = {
	db: new Dbstore(),
	cubes: [],
	levels: [],

	save: function(item, option) {
		item = item.clone(true);
		option = option || {};

		if (!option.fromDB) {
			this.db.setCube(item, option);
		}

		var i = this.search(item, store.cubes);
		if (i === -1) {
			store.cubes.push(item);
		} else {
			if (!option.fromDB || !item.original) {
				store.cubes[i] = item;
			}
		}
	},

	search: function(item, list) {
		var pos = -1;

		list.some(function(it, index) {
			if (it.name === item.name) {
				pos = index;
				return true;
			}
			return false;
		});
		return pos;
	},

	getCube: function(name) {
		var cube = null;
		this.cubes.some(function(c) {
			if (c.name === name) {
				cube = c;
				return true;
			}
			return false;
		});
		return cube;
	},

	getCubes: function(allCubes) {
		var list = [];

		this.cubes.forEach(function(cube) {
			if (allCubes) {
				list.push([cube.name, cube.visible, cube.original]);
			} else if (cube.visible) {
				list.push(cube.name);
			}
		});

		return list.sort();
	},

	getLevels: function(options) {
		options = options || {};
		var list = [];
		var lid = !!options.lid;
		this.cubes.forEach(function(cube) {
			if (cube.visible) {
				cube.levels.forEach(function(level, i) {
					if (lid != level.lid && (!lid || Helper.config.lid)) {
						return;
					}

					if (level.name && list.indexOf(level.name === -1)) {
						list.push(level.name);
					} else {
						list.push(cube.name + '-' + (i+1));
					}
				});
			}
		});
		return list.sort();
	},

	getLevel: function(name) {
		var lvl = null;
		this.cubes.some(function(cube) {
			return cube.levels.some(function(level, i) {
				if ((level.name && level.name === name)
				||	 cube.name + '-' + (i+1) === name) {
					lvl = level;
					return true;
				}
				return false;
			});
		});
		return lvl;
	},

	removeCube: function(name) {
		var db = this.db;
		var i = this.search({name: name}, store.cubes);
		this.cubes.splice(i, 1);
		db.removeCube(name, removeDone);

		function removeDone(evt) {
			setTimeout(function(){
				db.getCube(name, hasCube);
			}, 100);
		}
		function hasCube(cube) {
			console.log(cube);
			if (cube) {
				self.saveCube(JSON.stringify(cube), {fromDB: true});
				self.sendMessage($$('Cube "%s" has been replaced by its original version.', name));
			} else {
				self.sendMessage($$('Cube "%s" has been removed from your local storage.', name));
			}
		}
	},

	setVisible: function(name, visible) {
		var cube = this.getCube(name);

		if (cube) {
			cube.visible = visible;
			this.db.setCube(cube, {keepOriginal: true});
		}
	}
};
