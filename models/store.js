var store = {
	cubes: [],
	levels: [],
	save: function(item) {
		var i, list;
		// if (item instanceof Cube) {
		// 	list = this.cubes;
		// } else if (item instanceof Level) {
		// 	list = this.levels;
		// }

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
	getLevels: function() {
		var list = [];
		this.cubes.forEach(function(cube) {
			cube.levels.forEach(function(level, i) {
				if (level.name && list.indexOf(level.name === -1)) {
					list.push(level.name);
				} else {
					list.push(cube.name + '-' + (i+1));
				}
			});
		});
		return list;
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
	}
};
