function CubeBuilder() {
	this.init();
}

CubeBuilder.prototype.init = function() {
	this.levels = [1, 2, 3, 4, 5, 6, 7].map(function(_, i) {
		return new LevelConstructor();
	});
};

CubeBuilder.prototype.render = function(container) {
	this.container = container;

	var btn = document.createElement('button');
	btn.textContent = $$('Reset cube');
	btn.onclick = this.reset.bind(this);
	container.appendChild(btn);

	var inputName = document.createElement('input');
	inputName.placeholder = $$('Cube name');
	inputName.value = ''; //this.cube.name;
	inputName.onchange = this.changeName.bind(this);
	container.appendChild(inputName);

	btn = document.createElement('button');
	btn.textContent = $$('Save cube');
	btn.onclick = this.save.bind(this);
	container.appendChild(btn);

	this.levels.forEach(this.renderLevel, this);
};

CubeBuilder.prototype.renderLevel = function(level, i) {
	var sct = document.createElement('section');
	var header = document.createElement('header');

	header.textContent = (i+1) + '-';
	this.container.appendChild(header);

	level.render(sct);
	this.container.appendChild(sct);
};

CubeBuilder.prototype.reset = function() {
	this.init();
};

CubeBuilder.prototype.changeName = function(e) {
	console.log('todo changeName', e.currentTarget.value);
};

CubeBuilder.prototype.save = function() {
	console.log('todo save');
};