function CubeGenerator() {
	this.advancedOptions = new AdvancedOptions({hideOptions: ['advanced', 'trsfmLvl']});
	this.token = main.control.add(this.onMessage.bind(this));
	this.cube = new Cube();
	this.saveList = [null];
	this.cubeSize = 7;

	this.init();
}

CubeGenerator.prototype.init = function() {
	this.state = this.state || 'config'; /* config | running | result */
	this.computeOption = {
		levels: []
	};
};

/* render */
CubeGenerator.prototype.render = function(container) {
	this.container = container;
	this.container.innerHTML = '';

	this.elements = {};

	var section;

	/* Menu */
	section = document.createElement('section');
	section.className = 'generator-menu';
	this.elements.menu = section;
	container.appendChild(section);

	/* level selector */
	section = document.createElement('section');
	section.className = 'generator-level-selector';
	this.elements.levelSelector = section;
	container.appendChild(section);

	/* Information */
	section = document.createElement('section');
	section.className = 'generator-information';
	this.elements.researchInfo = section;
	container.appendChild(section);

	/* Research evolution */
	section = document.createElement('section');
	section.className = 'generator-research-status';
	this.elements.researchStatus = section;
	container.appendChild(section);

	/* cube solution */
	section = document.createElement('section');
	section.className = 'generator-cube-solution';
	this.elements.cubeSolution = section;
	container.appendChild(section);

	/* cube details */
	section = document.createElement('section');
	section.className = 'generator-cube-details';
	this.elements.cubeDetails = section;
	container.appendChild(section);

	this.renderMenu();
	this.renderLevelSelector();
	this.renderResearchStatus();

	this.changeState();
};

CubeGenerator.prototype.renderMenu = function() {
	var container = this.elements.menu,
		button, select;

	container.innerHTML = '';
	if (this.state === 'config') {
		button = document.createElement('button');
		button.textContent = $$('Look for possible maze');
		button.title = $$('Look for solvable cubes from selected levels');
		button.onclick = this.changeState.bind(this, 'running');
		container.appendChild(button);

		button = document.createElement('button');
		button.className = 'font-awesome';
		button.textContent = '\uf085'; // cogs
		button.title = $$('Manage options');
		button.onclick = this.advancedOptions.render.bind(this.advancedOptions);
		container.appendChild(button);

		select = document.createElement('select');
		select.onchange = this.changeCubeSize.bind(this, select);
		Helper.buildSelect(select, [{
			name: $$('only normal cubes'),
			id: 7
		}, {
			name: $$('only novice cubes'),
			id: 5
		}, {
			name: $$('All cubes'),
			id: -1
		}], this.cubeSize);
		container.appendChild(select);
	} else {
		button = document.createElement('button');
		button.className = 'font-awesome'
		button.textContent = '\uf0c7'; //save
		button.title = $$('Save selected cubes');
		button.onclick = this.saveCubes.bind(this);
		container.appendChild(button);

		button = document.createElement('button');
		button.textContent = this.state === 'running' ? $$('Stop analyze') : $$('Do another analysis');
		button.title = this.state === 'running' ? $$('Stop the current search') : $$('Change configuration to do a new analysis');
		button.onclick = this.state === 'running' ? this.cancelSearch.bind(this) : this.changeState.bind(this, 'config');
		container.appendChild(button);
	}
};

CubeGenerator.prototype.renderLevelSelector = function() {
	var container = this.elements.levelSelector,
		fieldset, legend, select, label;

	container.innerHTML = '';

	/* level selector */
	fieldset = document.createElement('fieldset');
	legend = document.createElement('legend');
	legend.textContent = $$('Choose levels');
	fieldset.appendChild(legend);

	label = document.createElement('aside');
	label.textContent = $$('Select all levels that can be put inside the cube. (You need to select at least %d levels)', this.cubeSize > 0 ? this.cubeSize : 7);
	fieldset.appendChild(label);

	select = document.createElement('select');
	this.elements.levelsSelect = select;
	select.multiple = true;
	select.onchange = this.changeLevelSelected.bind(this);
	/* implement the single click to pulti-select (no need of Ctrl+click) */
	select.onmousedown = function(evt) {
		var el = evt.target;

		if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey || el.tagName.toLowerCase() !== 'option' || typeof MouseEvent === 'undefined') {
			return; /* use the default behavior */
		}

		evt.preventDefault();
		evt.stopPropagation();

		var evtMouse = new MouseEvent('mousedown', {ctrlKey: true, 'bubbles':true, 'cancelable':false});
		el.dispatchEvent(evtMouse);
	};
	fieldset.appendChild(select);

	container.appendChild(fieldset);

	/* initialisation */
	this.getLvlList();
};

CubeGenerator.prototype.getLvlList = function() {
	main.control.action('getLevels', {
		allLevels: true,
		groupByCube: true,
		filter: this.cubeSize
	}, this.getLevels.bind(this));
};

CubeGenerator.prototype.renderResearchStatus = function() {
	var container = this.elements.researchStatus,
		progress, label, button, div;

	var init_max = 0,
		init_value = 1;

	container.innerHTML = '';

	progress = document.createElement('progress');
	progress.id = 'progress_generator_search';
	progress.max = init_max;
	progress.value = init_value;
	this.elements.runningProgress = progress;
	container.appendChild(progress);

	label = document.createElement('label');
	label.htmlFor = 'progress_generator_search';
	label.textContent = $$('%D / %D', init_value, init_max);
	label.title = $$('%d / %d', init_value, init_max);
	this.elements.runningState = label;
	container.appendChild(label);

	button = document.createElement('button');
	button.textContent = $$('Stop');
	button.title = $$('Stop the current search');
	button.onclick = this.cancelSearch.bind(this);
	this.elements.stopSearch = button;
	container.appendChild(button);

	div = document.createElement('div');
	this.elements.nbFound = div;
	container.appendChild(div);
};

CubeGenerator.prototype.renderInfo = function(data) {
	var nbLvl = data.nbLvl;
	var nbLid = data.nbLid;
	var nbPossibilities = data.nbPossibilities.total || 0;

	var container = this.elements.researchInfo;
	container.innerHTML = '';

	var div;

	div = document.createElement('div');
	div.innerHTML = $$('Number of selected levels: %d', nbLvl + nbLid) +
					'<br>' +
				    $$('%d generic levels. %d lid levels', nbLvl, nbLid);
	container.appendChild(div);

	div = document.createElement('div');
	div.innerHTML = $$('Number of combinations: %d', nbPossibilities) +
					'<br>' +
				    $$('Estimated time: %{u:s}t', Math.ceil(nbPossibilities * 0.006));
	container.appendChild(div);
};

/* Methods */

CubeGenerator.prototype.changeState = function(state) {
	var issues;
	var updateState = function() {
		if (state !== this.state) {
			this.state = state;
			this.renderMenu();
		}
	}.bind(this);

	if (!state) {
		state = this.state;
	}

	switch(state) {
		case 'config':
			updateState();

			this.elements.levelSelector.classList.remove('hidden');
			this.elements.researchInfo.classList.remove('hidden');
			this.elements.researchStatus.classList.add('hidden');
			this.elements.cubeSolution.classList.add('hidden');
			this.elements.cubeDetails.classList.add('hidden');
			break;
		case 'running':
			issues = this.isRunningValid();

			if (issues.length) {
				main.message(issues.join('<br>'), 'error', {html:true});
			} else {
				main.message.clear();
				this.elements.cubeSolution.innerHTML = '';
				updateState();
				this.countSolvable = 0;
				main.control.action('generator', {
					action: 'compute',
					data: {
						levels: this.computeOption.levels
					}
				}, this.token);

				this.elements.levelSelector.classList.add('hidden');
				this.elements.researchInfo.classList.add('hidden');
				this.elements.researchStatus.classList.remove('hidden');
				this.elements.cubeSolution.classList.remove('hidden');
				this.elements.cubeDetails.classList.remove('hidden');

				if (this.elements.stopSearch) {
					this.elements.stopSearch.classList.remove('hidden');
				}
			}
			break;
		case 'result':
			updateState();
			this.elements.levelSelector.classList.add('hidden');
			this.elements.researchInfo.classList.add('hidden');
			this.elements.researchStatus.classList.remove('hidden');
			this.elements.cubeSolution.classList.remove('hidden');
			this.elements.cubeDetails.classList.remove('hidden');

			if (this.elements.stopSearch) {
				this.elements.stopSearch.classList.add('hidden');
			}
			break;
	}
};

CubeGenerator.prototype.changeCubeSize = function(select) {
	this.cubeSize = +select.value;
	this.renderLevelSelector();
	// this.getLvlList();
};

CubeGenerator.prototype.isRunningValid = function() {
	var size = 7;
	var issues = [];

	if (this.cubeSize > 0) {
		size = this.cubeSize;
	}

	if (this.computeOption.levels.length < size) {
		issues.push($$('Select at least %d levels', size));
	}

	return issues;
};

CubeGenerator.prototype.addCubeBox = function(levels, accessible, difficulty, maxDifficulty, hash) {
	var container = this.elements.cubeSolution;
	var saveIndex;
	var saveName;

	var box, meter, inputChk, inputName;

	box = document.createElement('div');
	box.className = 'cube-generated';

	meter = document.createElement('meter');
	meter.value = difficulty;
	meter.optimum = 0;
	meter.low = maxDifficulty / 3;
	meter.high = 2 * maxDifficulty / 3;
	meter.max = maxDifficulty;
	box.appendChild(meter);

	inputChk = document.createElement('input');
	inputChk.type = 'checkbox';
	inputChk.title = $$('Save this configuration as a cube');
	inputChk.onclick = function(e) {e.stopPropagation();};
	inputChk.onchange = function(e) {
		var input = e.target;

		if (input.checked) {
			saveIndex = saveIndex || this.saveList.length;
			this.saveList[saveIndex] = {
				name: saveName,
				levels: levels
			};
		} else {
			this.saveList[saveIndex] = null;
		}
	}.bind(this);
	box.appendChild(inputChk);

	inputName = document.createElement('input');
	inputName.type = 'text';
	inputName.placeholder = $$('cube name');
	inputName.title = $$('name of the cube when it will be saved');
	inputName.onclick = function(e) {e.stopPropagation();};
	inputName.onchange = function(e) {
		saveName = e.target.value;
		if (saveIndex) {
			this.saveList[saveIndex].name = saveName;
		}
	}.bind(this);
	box.appendChild(inputName);

	box.onclick = function(e) {
		this.cube.load(levels, function() {
			var maps = this.cube.renderMap('top', accessible);
			this.elements.cubeDetails.innerHTML = maps.map(function(mp, i) {
				return mp + '<caption>' + CubeGenerator.getLevelName(levels[i]) + '</caption>';
			}).join('<br>');
		}.bind(this));

		main.removeClass('box-active');
		box.classList.add('box-active');
	}.bind(this);

	container.appendChild(box);

	main.control.action('getCubeFromHash', hash,
		function(data) {
			var name;

			if (data) {
				name = data.name;
				inputChk.disabled = true;
				inputChk.checked = false;
				inputChk.style.visibility = 'hidden';
				inputChk.title = $$('Cube already saved');
				inputName.value = name;
				inputName.disabled = true;
				inputName.title = $$('This cube is already saved under name: %s', name);
			}
		});
};

/* Action */

CubeGenerator.prototype.changeLevelSelected = function(evt) {
	this.computeOption.levels = Array.prototype.filter.call(evt.target.options, function(el) {
		return el.selected;
	}).map(function(el) {
		return el.value;
	});

	main.control.action('generator', {
		action: 'loadLevels',
		data: {
			levels: this.computeOption.levels,
			size: this.cubeSize,
			mapSize: this.cubeSize > 6 ? this.cubeSize - 1 : this.cubeSize
		}
	}, this.token);
};

CubeGenerator.prototype.saveCubes = function() {
	var list = this.saveList.filter(function(item) { return item;});
	
	if (confirm($$('will you save these %d cubes?', list.length) + '\n' + list.map(function(c) {return c.name || $$('unnamed cube')}).join('\n'))) {
		list.forEach(function(cube) {
			main.control.action('saveCubeFromLevels', cube, 
		cubeSaved);
		});
	};

	function cubeSaved(name) {
		main.message($$('cube "%s" saved', name), 'success', {keep: true, timeout: 15000});
	}
};

CubeGenerator.prototype.cancelSearch = function() {
	main.control.action('generator', {
		action: 'stop',
		data: {}
	}, this.token);
	main.message($$('The search has been interrupted!'), 'info', {timeout: 4000});
	this.elements.runningState.textContent += ' ' + $$('(canceled)');
	this.changeState('result');
};

/* Action from worker */

CubeGenerator.prototype.getLevels = function(list) {
	Helper.buildSelect(this.elements.levelsSelect, list, this.computeOption.levels, true);
	this.changeLevelSelected({target: this.elements.levelsSelect});
};

CubeGenerator.prototype.issueBeforeRun = function(issues) {
	main.message(issues.join('<br>'), 'error', {html:true});
	this.changeState('config');
};

CubeGenerator.prototype.runningState = function(data) {
	var label = this.elements.runningState;
	var progress = this.elements.runningProgress;
	var total = data.total;
	var value = Math.min(data.index, total);

	progress.value = value;
	progress.max = total;

	label.textContent = $$('%D / %D', value, total);
	label.title = $$('%d / %d', value, total);
};

CubeGenerator.prototype.result = function(data) {
	this.countSolvable++;
	this.elements.nbFound.textContent = $$('Number of solvable cubes: %D', this.countSolvable);
	this.elements.nbFound.title = $$('Number of solvable cubes: %d', this.countSolvable);

	var accessible = data.accessible;
	var available = accessible.length;
	var length = data.info.length;
	var deadEnd = data.info.deadEnd;
	// var difficulty = available; //TODO
	// var maxDifficulty = 216;

	var difficulty = length * 1.2 / 24 + // 12
					 (available - length) * 1.5 / 24 + // 15;
					 deadEnd * 0.3;
	var maxDifficulty = 35;

	// difficulty = length * 1.1 / 24 + // 11
	// 				 (available - length) * 1.5 / 24 + // 15
	// 				 //chgDirection * 0.3 + // 0
	// 				 chgLevel * 1.5 / 7 + // ~15 (current max ~7)
	// 				 chgTop * 1.85 + // ~35 (current max 17)
	// 				 nbMovement * 0.1 + // ~5 (current max ~3.5)
	// 				 nbMvtOutPath * 0.1 +
	// 				 nbDifficultCrossing * 5, // ~15 (current max 3)
	// 	maxDifficulty = 95,

	this.addCubeBox(data.levels, accessible, difficulty, maxDifficulty, data.hash);
};

CubeGenerator.prototype.finished = function(data) {
	this.elements.runningState.textContent += ' ' + $$('(search completed)');

	this.changeState('result');
};

CubeGenerator.prototype.computeInformations = function(data) {
	this.renderInfo(data);
};

CubeGenerator.prototype.debug = function(data) { // TODO delete this method
	console.debug(data);
};

/* listener */

CubeGenerator.prototype.onMessage = function(data) {
	var action = data.action;

	if (typeof this[action] === 'function') {
		this[action](data.data);
	} else {
		console.warn('Path action unknown', action, data);
	}
};

/* Static methods */

CubeGenerator.getLevelName = function(lvlName) {
	var slices = lvlName.split('§');
	var name = slices[slices.length - 1];
	return name;
};
