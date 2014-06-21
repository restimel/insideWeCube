function Cube (name) {
	this.name = name;
	this.levels = [];
}

Cube.prototype.init = function() {
	var nb = 7,
		i;

	for (i = 0; i < nb; i++) {
		this.levels[i] = new Level();
	}
};

Cube.prototype.clone = function() {
	var cube = new Cube();
	cube.parse(this.toJSON());

	return cube;
};

Cube.prototype.addLevel = function (z, level) {
	this.levels[z] = level;
};

Cube.prototype.get = function (x, y, z) {
	return this.levels[z].get(x, y);
};

Cube.prototype.getDirection = function (x, y, z) {
	var directions = [],
		cell = this.get(x, y, z);

	// down
	if (x < 5 && cell.d) {
		directions.push({
			x: x + 1,
			y: y,
			z: z,
			from: -2
		});
	}

	// right
	if (y < 5 && cell.r) {
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
	if (x > 0 && this.get(x - 1, y, z).d) {
		directions.push({
			x: x -1,
			y: y,
			z: z,
			from: 2
		});
	}

	// left
	if (y > 0 && this.get(x, y - 1, z).r) {
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
	return {
		name: this.name,
		levels: this.levels.map(function(l) {return l.toJSON();})
	};
};

Cube.prototype.parse = function(json) {
	if (typeof json === 'string') {
		json = JSON.parse(json);
	}
	this.name = json.name;
	this.levels = [];
	json.levels.forEach(function(l, i) {this.addLevel(i, new Level(l));}, this);
};
