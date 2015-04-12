function CubeGenerator() {
	this.advancedOptions = new AdvancedOptions({hideMoreTools: true});
	this.token = main.control.add(this.onMessage.bind(this));

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
};

CubeGenerator.prototype.renderMenu = function() {
	var container = this.elements.menu,
		button;

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
	} else {
		button = document.createElement('button');
		button.className = 'font-awesome'
		button.textContent = '\uf0c7'; //save
		button.title = $$('Save selected cubes');
		button.onclick = this.saveCubes.bind(this);
		button.disabled = true; // TODO activate it
		container.appendChild(button);

		button = document.createElement('button');
		button.textContent = this.state === 'running' ? $$('Stop research') : $$('Change research option');
		button.title = this.state === 'running' ? $$('Stop the current search') : $$('Change configuration to do a new research');
		button.onclick = this.cancelSearch.bind(this);
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
	label.textContent = $$('Select all levels that can be put inside the cube. (You need to select at least 7 levels)');
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
	main.control.action('getLevels', {
		allLevels: true,
		groupByCube: true
	}, this.getLevels.bind(this));
};


CubeGenerator.prototype.renderResearchStatus = function() {
	var container = this.elements.researchStatus,
		progress, label, button;

	var DBG_max = 1234567890,
		DBG_value = 154567654;

	container.innerHTML = '';

	progress = document.createElement('progress');
	progress.id = 'progress_generator_search';
	progress.max = DBG_max;
	progress.value = DBG_value;
	this.elements.runningProgress = progress;
	container.appendChild(progress);

	label = document.createElement('label');
	label.htmlFor = 'progress_generator_search';
	label.textContent = $$('%D / %D', DBG_value, DBG_max);
	label.title = $$('%d / %d', DBG_value, DBG_max);
	this.elements.runningState = label;
	container.appendChild(label);

	button = document.createElement('button');
	button.textContent = $$('Stop');
	button.title = $$('Stop the current search');
	button.onclick = this.cancelSearch.bind(this);
	container.appendChild(button);
};

/* Methods */

CubeGenerator.prototype.changeState = function(state) {
	var issues;

	switch(state) {
		case 'config':
			this.state = state;
			console.warn('TODO: changeState config')
			break;
		case 'running':
			issues = this.isRunningValid();

			if (issues.length) {
				main.message(issues.join('<br>'), 'error', {html:true});
			} else {
				main.message.clear();
				this.state = state;
				this.countSolvable = 0;
				main.control.action('generator', {
					action: 'compute',
					data: {
						levels: this.computeOption.levels
					}
				}, this.token);
				console.warn('TODO run compute and switch page');
			}
			break;
	}
};

CubeGenerator.prototype.isRunningValid = function() {
	var issues = [];

	if (this.computeOption.levels.length < 7) {
		issues.push($$('Select at least 7 levels'));
	}

	return issues;
};

/* Action */

CubeGenerator.prototype.changeLevelSelected = function(evt) {
	this.computeOption.levels = Array.prototype.filter.call(evt.target.options, function(el) {
		return el.selected;
	}).map(function(el) {
		return el.value;
	});
};

CubeGenerator.prototype.saveCubes = function() {
	console.warn('TODO: save cubes');
	main.message('TODO → save selected cubes', 'WARNING');
};

CubeGenerator.prototype.cancelSearch = function() {
	console.warn('TODO: cancel research', this.state);
	main.message($$('TODO → cancel research (%s)', this.state), 'WARNING');
};

/* Action from worker */

CubeGenerator.prototype.getLevels = function(list) {
	Helper.buildSelect(this.elements.levelsSelect, list, this.computeOption.levels);
};

CubeGenerator.prototype.issueBeforeRun = function(issues) {
	main.message(issues.join('<br>'), 'error', {html:true});
	this.changeState('config');
};

CubeGenerator.prototype.runningState = function(data) {
	var label = this.elements.runningState;
	var progress = this.elements.runningProgress;

	progress.value = data.index;
	progress.max = data.total;

	label.textContent = $$('%D / %D', data.index, data.total);
	label.title = $$('%d / %d', data.index, data.total);
};

CubeGenerator.prototype.result = function(data) {
	this.countSolvable++;
	console.warn('todo ',this.countSolvable, data);
};

CubeGenerator.prototype.finished = function(data) {
	console.warn('FINISH', data);
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
