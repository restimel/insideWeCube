var store = {
	cubes: [],
	levels: [],

	save: function(item) {
		var i;

		i = this.search(item, store.cubes);
		if (i === -1) {
			store.cubes.push(item.clone());
		} else {
			store.cubes[i] = item.clone();
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
				list.push([cube.name, cube.visible]);
			} else if (cube.visible) {
				list.push(cube.name);
			}
		});

		return list.sort();
	},

	getLevels: function() {
		var list = [];
		this.cubes.forEach(function(cube) {
			if (cube.visible) {
				cube.levels.forEach(function(level, i) {
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

	setVisible: function(name, visible) {
		var cube = this.getCube(name);

		if (cube) {
			cube.visible = visible;
		}
	}
};
