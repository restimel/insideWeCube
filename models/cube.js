function Cube (name) {
	this.name = name;
	this.levels = [];
}

Cube.prototype.addLevel = function (z, level) {
	this.levels[z] = level;
};

Cube.prototype.getCells = function (x, y, z) {
	return this.levels[z].get(x, y);
};

Cube.prototype.getDirection = function (x, y, z) {

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