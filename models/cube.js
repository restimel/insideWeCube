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