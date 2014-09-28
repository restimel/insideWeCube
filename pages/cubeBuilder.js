function CubeBuilder(cubePath) {
	this.cubePath = cubePath;
	cubePath.setBuilder(this);
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
	this.container.innerHTML = '';

	var cubeBuilder = document.createElement('section');
	cubeBuilder.className = 'cube-builder-section';

	var btn = document.createElement('button');
	btn.textContent = $$('Reset cube');
	btn.onclick = this.reset.bind(this);
	cubeBuilder.appendChild(btn);

	var inputName = document.createElement('input');
	inputName.placeholder = $$('Cube name');
	inputName.value = this.name || '';
	inputName.onchange = this.changeName.bind(this);
	cubeBuilder.appendChild(inputName);
	this.elemName = inputName;

	btn = document.createElement('button');
	btn.textContent = $$('Save cube');
	btn.onclick = this.save.bind(this);
	cubeBuilder.appendChild(btn);

	var select = document.createElement('select');
	select.onchange = this.changeCube.bind(this);
	select.appendChild(document.createElement('option'));
	main.control.action('getCubes', null, function(data) {
		data.forEach(function(name) {
			var option = document.createElement('option');
			
			option.value = option.textContent = name;
			select.appendChild(option);
		});
	});
	cubeBuilder.appendChild(select);

	container.appendChild(cubeBuilder);

	var info = document.createElement('section');
	info.className = 'cube-info-section';
	container.appendChild(info);

	this.cubeContainer = cubeBuilder;
	this.cubeInfo = info;

	this.levels.forEach(this.renderLevel, this);
};

CubeBuilder.prototype.renderLevel = function(level, i) {
	var sct = document.createElement('section');

	sct.className = 'level-editor';

	level.render(sct);
	this.cubeContainer.appendChild(sct);
};

CubeBuilder.prototype.renderInfo = function(info) {
	this.cubeInfo.innerHTML = '';

	var length = info.length + 1,
		available = info.available,
		deadEnd = info.deadEnd,
		chgLevel = info.chgLevel,
		chgDirection = info.chgDirection,
		chgTop = info.chgTop,
		nbMovement = info.nbMovement,
		nbMvtOutPath = info.nbMvtOutPath,
		nbDifficultCrossing = info.nbDifficultCrossing,
		difficulty = length * 1.1 / 24 + // 11
					 (available - length) * 1.5 / 24 + // 15
					 //chgDirection * 0.3 + // 0
					 chgLevel * 1.5 / 7 + // ~15 (current max ~7)
					 chgTop * 1.8 + // ~35 (current max 17)
					 nbMovement / 20 + // ~5 (current max ~3.5)
					 nbMvtOutPath / 10 +
					 nbDifficultCrossing * 3, // ~20 (current max 21)
		maxDifficulty = 90,
		lowDifficulty = maxDifficulty / 3,
		highDifficulty = maxDifficulty * 2 / 3;

	var finish = document.createElement('section'),
		pathLength = document.createElement('section'),
		availability = document.createElement('section'),
		elDeadEnd =  document.createElement('section'),
		elDifficulty = document.createElement('section'),
		elChgDirection = document.createElement('section'),
		elChgLevel = document.createElement('section'),
		elMovement = document.createElement('section'),
		elCbReverse = document.createElement('section'),
		elHardCells = document.createElement('section'),
		meter, label;

	availability.className = 'info';
	elDeadEnd.className = 'info';

	if (info.finish) {
		finish.className = 'finish-yes';
		finish.textContent = $$('Cube can be solved.');

		pathLength.className = 'info';
		pathLength.textContent = $$('%i cells must be crossed (%2%%).', length, 100 * length/available);

		elDeadEnd.textContent = $$('%i dead-ends (%2%%)', deadEnd, 100 * (available - length)/available);

		elChgDirection.className = 'info';
		elChgDirection.textContent = $$('%i turns inside levels (%2%%)', chgDirection, 100 * chgDirection/length);

		elChgLevel.className = 'info';
		elChgLevel.textContent = $$('%i movements through levels (%2%%)', chgLevel, 100 * chgLevel/length);

		elMovement.className = 'info';
		elMovement.textContent = $$('%i cube rotations are needed (at least)', nbMovement);

		elCbReverse.className = 'info';
		elCbReverse.textContent = $$('%i upside-down cube flips are needed (at least)', chgTop);

		elHardCells.className = 'info';
		elHardCells.textContent = $$('%i hardcore passages', nbDifficultCrossing);

		elDifficulty.className = 'info';
		label = document.createElement('label');
		label.textContent = $$('Cube difficulty: ');

		meter = document.createElement('meter');
		meter.value = difficulty;
		meter.optimum = 0;
		meter.low = lowDifficulty;
		meter.high = highDifficulty;
		meter.max = maxDifficulty;
		meter.value = difficulty;
		meter.textContent = difficulty;
		label.appendChild(meter);

		elDifficulty.appendChild(label);
	} else {
		finish.className = 'finish-no';
		finish.textContent = $$('Cube is not solvable.');

		pathLength.className = 'noInfo';

		elDeadEnd.textContent = $$('%i dead-ends', deadEnd);

		elChgDirection.className = 'noInfo';
		elChgLevel.className = 'noInfo';
		elDifficulty.className = 'noInfo';
		elMovement.className = 'noInfo';
		elCbReverse.className = 'noInfo';
		elHardCells.className = 'noInfo';
	}

	availability.textContent = $$('%i cells are accessible (%2%%).', available, 10 * available / 24);

	this.cubeInfo.appendChild(finish);
	this.cubeInfo.appendChild(elDifficulty);
	this.cubeInfo.appendChild(availability);
	this.cubeInfo.appendChild(pathLength);
	this.cubeInfo.appendChild(elDeadEnd);
	this.cubeInfo.appendChild(elChgLevel);
	this.cubeInfo.appendChild(elChgDirection);
	this.cubeInfo.appendChild(elMovement);
	this.cubeInfo.appendChild(elCbReverse);
	this.cubeInfo.appendChild(elHardCells);
};

CubeBuilder.prototype.reset = function() {
	this.cubePath.reset();
	this.init();
	this.render(this.container);
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