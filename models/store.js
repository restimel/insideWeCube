var store = {
	db: new Dbstore(),
	cubes: [],
	levels: [],

	save: function(item, option) {
		item = item.clone(true);
		option = option || {};

		if (!option.fromDB) {
			item.visible = true;
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

	getCubeFromHash: function(hash) {
		var cube;

		this.cubes.some(function(cb) {
			if (cb.getHash() === hash) {
				cube = cb;
				return true;
			}
		});

		return cube;
	},

	getLevels: function(options) {
		options = options || {};
		var list = [];
		var lvlList;
		var lid = !!options.lid;
		var allLvl = !!options.allLevels;
		var groupByCube = !!options.groupByCube;
		var filter = options.filter || -1;
		var name;

		this.cubes.forEach(function(cube) {
			if (cube.visible) {
				if (filter !== -1 && cube.size !== filter) {
					return;
				}

				lvlList = [];
				cube.levels.forEach(function(level, i) {
					if (!allLvl && lid != level.lid && (!lid || Helper.config.lid)) {
						return;
					}

					if (level.name && lvlList.indexOf(level.name === -1)) {
						name = level.name;
					} else {
						name = cube.name + '-' + (i+1);
					}
					lvlList.push({
						name: name,
						id: cube.name + '§' + name
					});
				});

				if (groupByCube) {
					list.push({
						name: cube.name,
						options: lvlList
					});
				} else {
					list = list.concat(lvlList);
				}
			}
		});

		var compare;
		if (typeof Intl === 'function') {
			compare = new Intl.Collator($$.getLocale(), {sensitivity: 'base'}).compare;
		} else {
			compare = function(a, b) {return a.localeCompare(b, $$.getLocale(), {sensitivity: 'base'});};
		}

		return list.sort(function(e1, e2) {
			var n1 = e1.hasOwnProperty('name') ? e1.name : e1;
			var n2 = e2.hasOwnProperty('name') ? e2.name : e2;

			return compare(n1, n2)
		});
	},

	getLevel: function(name) {
		var lvl = null;
		var tmp = name.split('§');
		var cubeName = tmp[0];
		var lvlName = tmp[1];
		var cube = this.getCube(cubeName);

		if (!cube) {
			lvlName = name;
			this.cubes.some(getLevelFromCube);
		} else {
			getLevelFromCube(cube);
		}

		return lvl;

		function getLevelFromCube(cube) {
			return cube.levels.some(function(level, i) {
				if ((level.name && level.name === lvlName)
				||	 cube.name + '-' + (i+1) === lvlName) {
					lvl = level;
					return true;
				}
				return false;
			});
		}
	},

	removeCube: function(name) {
		var db = this.db;
		var i = this.search({name: name}, store.cubes);

		if (i === -1) {
			self.sendMessage($$('Cube \"%s\" has not been removed.', name), 'error');
			return;
		}

		this.cubes.splice(i, 1);
		db.removeCube(name, removeDone);

		function removeDone(evt) {
			setTimeout(function(){
				db.getCube(name, hasCube);
			}, 100);
		}
		function hasCube(cube) {
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
