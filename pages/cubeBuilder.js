function CubeBuilder(cubePath) {
	this.cubePath = cubePath;
	this.init();
}

CubeBuilder.prototype.init = function() {
	var cubePath = this.cubePath;

	this.levels = [1, 2, 3, 4, 5, 6, 7].map(function(_, i) {
		return new LevelConstructor(i, cubePath);
	});
	this.name = '';
};

CubeBuilder.prototype.render = function(container) {
	this.container = container;

	var btn = document.createElement('button');
	btn.textContent = $$('Reset cube');
	btn.onclick = this.reset.bind(this);
	container.appendChild(btn);

	var inputName = document.createElement('input');
	inputName.placeholder = $$('Cube name');
	inputName.value = this.name || '';
	inputName.onchange = this.changeName.bind(this);
	container.appendChild(inputName);
	this.elemName = inputName;

	btn = document.createElement('button');
	btn.textContent = $$('Save cube');
	btn.onclick = this.save.bind(this);
	container.appendChild(btn);

	var select = document.createElement('select');
	select.onchange = this.changeCube.bind(this).bind(this);
	select.appendChild(document.createElement('option'));
	main.control.action('getCubes', null, function(data) {
		data.forEach(function(name) {
			var option = document.createElement('option');
			
			option.value = option.textContent = name;
			select.appendChild(option);
		});
	});
	container.appendChild(select);

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
	if (typeof e === 'string') {
		this.name = e;
		this.elemName.value = e;
	} else {
		this.name = e.target.value;
	}
};

CubeBuilder.prototype.changeCube = function(e) {
	var name;

	if (typeof e === 'string') {
		name = e;
	} else {
		name = e.currentTarget.value;
	}

	if (name === '') {
		return false;
	}

	this.changeName(name);

	this.levels.forEach(function(lvl, i) {
		lvl.changeLevel(name + '-' + (i + 1));
	});
};

CubeBuilder.prototype.save = function() {
	var name = this.name;
	if (name === '') {
		main.message($$('Please enter a name for the cube.'), 'error');
		return false;
	}

	main.control.action('saveCube', JSON.stringify(this), function(data) {
		if (data === 1) {
			main.message($$('cube "%s" saved.', name), 'success');
		}
	});
};

CubeBuilder.prototype.toJSON = function() {
	return {
		name: this.name,
		levels: this.levels.map(function(l) {return l.toJSON();})
	};
};

CubeBuilder.prototype.parse = function(json) {
	if (typeof json === 'string') {
		json = JSON.parse(json);
	}
	this.name = json.name;
	levels: this.levels.map(function(l, i) {return l.parse(json.levels[i]);})
};