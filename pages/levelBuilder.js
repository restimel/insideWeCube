function LevelConstructor(index, cubePath, parentCube, cubeColor, options) {
	options = options || {};
	this.index = index;

	this.reset({
		lid: options.lid,
		s: options.s ? options.s : []
	});

	this.cubePath = cubePath;
	this.cube = parentCube;
	this.color = cubeColor;
	this.lastLevel = !!options.lastLevel;
	this.action = 0;
}

LevelConstructor.prototype.render = function(container) {
	if (container) {
		this.container = container;
	} else {
		container = this.container;
		container.innerHTML = '';
	}
	var label, input, textarea, messageArea;

	var header = document.createElement('header');

	header.textContent = (this.index + 1) + '-';
	container.appendChild(header);

	var toolBar  = document.createElement('div');

	var inputName = document.createElement('input');
	inputName.placeholder = $$('level identifier');
	inputName.value = this.level.name || '';
	inputName.onchange = this.changeName.bind(this);
	toolBar.appendChild(inputName);

	var slctLevel = document.createElement('select');
	slctLevel.onchange = this.changeLevel.bind(this);
	var option = document.createElement('option');
	option.textContent = $$('Load a level');
	option.disabled = true;
	option.selected = true;
	slctLevel.add(option);
	main.control.action('getLevels', {lid: this.lastLevel, groupByCube: true}, function(data) {
		Helper.buildSelect(slctLevel, data);
	});
	toolBar.appendChild(slctLevel);

	/* Transform tool select */
	var select = document.createElement('select');
	select.className = 'font-awesome' + (Helper.config.trsfmLvl ? '' : ' hidden');
	select.onchange = this.rotateLevel.bind(this);
	option = document.createElement('option');
	option.textContent = $$('Rotate the level');
	option.disabled = true;
	option.selected = true;
	select.add(option);
	option = document.createElement('option');
	option.value = -90;
	option.textContent = '\uf064 ' + $$('Rotate 90° clockwise');
	select.add(option);
	option = document.createElement('option');
	option.value = 90;
	option.textContent = '\uf112 ' + $$('Rotate 90° counter-clockwise');
	select.add(option);
	option = document.createElement('option');
	option.value = 180;
	option.textContent = '\uf079 ' + $$('Rotate 180°');
	select.add(option);
	this.transformTool = select;
	toolBar.appendChild(select);

	/* option to tell it is a lid level */
	if (this.lastLevel && Helper.config.advanced) {
		label = document.createElement('label');
		label.className = 'lid-level-option';
		input = document.createElement('input');
		input.type = 'checkbox';
		input.checked = this.level.lid;
		input.onchange = this.changeLidLevel.bind(this, input);
		label.textContent = $$('Is a lid level:');
		label.appendChild(input);
		toolBar.appendChild(label);
	}
	container.appendChild(toolBar);

	/* level */
	this.renderLevel(container);

	messageArea = document.createElement('div');
	messageArea.className = 'message-area';

	/* comments */
	textarea = document.createElement('textarea');
	textarea.placeholder = $$('note about this level');
	textarea.value = this.level.cmt || '';
	textarea.onchange = this.onCommentChange.bind(this);
	messageArea.appendChild(textarea);

	/* message */
	this.elementMessage = document.createElement('div');
	this.elementMessage.className = 'lvl-message ' + this.message.type;
	this.textContent = this.message.text;
	messageArea.appendChild(this.elementMessage);
	this.checkInfo();

	container.appendChild(messageArea);
};

LevelConstructor.prototype.renderLevel = function(container) {
	if (!container) {
		container = this.container;
	}

	var tableContainer = document.createElement('div'),
		table = document.createElement('table'),
		row1, row2,	el, cell, x, y, bord;

	bord = document.createElement('td');
	bord.className = 'cell-wall';

	table.className = 'constructor-table color-' + this.color;

	row1  = document.createElement('tr');
	row1.appendChild(bord.cloneNode());
	for (x = 0; x < 6; x++) {
		row1.appendChild(bord.cloneNode());
		row1.appendChild(bord.cloneNode());
	}
	table.appendChild(row1);

	for (x = 0; x < 6; x++) {
		row1  = document.createElement('tr');
		row2  = document.createElement('tr');

		for (y = 0; y < 6; y++) {
			cell = this.level.get(x, y);

			if (y === 0) {
				row1.appendChild(bord.cloneNode());
				row2.appendChild(bord.cloneNode());
			}

			el = document.createElement('td');
			el.id = 'main-' + x + '-' + y + '-' + this.index;
			el.className = 'cell-main-' + (cell.b ? 'hole' : 'fill');

			if (this.startCL && x === this.startCL[0] && y === this.startCL[1]) {
				this.setCell(el, 's1', true);
			} else if (this.endCL && x === this.endCL[0] && y === this.endCL[1]) {
				this.setCell(el, 's-1', true);
			}
			if (cell.s) {
				this.setCell(el, 's'+cell.s, true);
			}
			row1.appendChild(el);

			if (y === 5) {
				row1.appendChild(bord.cloneNode());
			} else {
				el = document.createElement('td');
				el.id = 'wallR-' + x + '-' + y + '-' + this.index;
				el.className = 'cell-wallR-' + (cell.r ? 'hole' : 'fill');
				row1.appendChild(el);
			}

			if (x === 5) {
				row2.appendChild(bord.cloneNode());
				row2.appendChild(bord.cloneNode());
			} else {
				el = document.createElement('td');
				el.id = 'wallD-' + x + '-' + y + '-' + this.index;
				el.className = 'cell-wallD-' + (cell.d ? 'hole' : 'fill');
				row2.appendChild(el);

				if (y === 5) {
					row2.appendChild(bord.cloneNode());
				} else {
					el = document.createElement('td');
					el.className = 'cell-' + (cell.r && cell.d ? 'none' : 'wall');
					row2.appendChild(el);
				}
			}
		}

		table.appendChild(row1);
		table.appendChild(row2);
	}

	table.onclick = this.change.bind(this);
	tableContainer.appendChild(table);

	tableContainer.className = 'level-container';
	container.appendChild(tableContainer);
};

LevelConstructor.prototype.renderMessage = function(message, type) {
	message = typeof message === 'string' ? message : this.message.text;
	type = type || this.message.type;

	this.elementMessage.textContent = message;
	main.changeClass(this.elementMessage, this.message.type, type);
	this.message = {
		text: message,
		type: type
	};
};

LevelConstructor.prototype.renderTransform = function(val) {
	if (val) {
		this.transformTool.classList.remove('hidden');
	} else {
		this.transformTool.classList.add('hidden');
	}
};

LevelConstructor.prototype.reset = function(options) {
	var cellOptions = options.s.filter(function(c) {
		return c[2] === this.index && c[3] !== 1 && c[3] !== -1;
	}, this);

	options.s = cellOptions;
	this.level = new Level('', options);
	this.message = {
		message: '',
		type: 'none'
	};
};

LevelConstructor.prototype.changeName = function(e) {
	this.level.name = e.currentTarget.value;
};

LevelConstructor.prototype.onCommentChange = function(e) {
	var cmt = e.currentTarget.value;
	this.level.cmt = cmt;
	if (/^(?:the\s*lord\s*of\s*the\s*cubes|le\s*seigneur\s*des\s*cubes)/i.test(cmt)) {
		EasterEggs.lordOfTheCubes();
	}
};

LevelConstructor.prototype.changeColor = function(color) {
	var elems = document.querySelectorAll('.color-' + this.color);

	Array.prototype.forEach.call(elems, function(elem) {
		elem.classList.remove('color-' + this.color);
		elem.classList.add('color-' + color);
	}, this);
	this.color = color;
};

LevelConstructor.prototype.changeLevel = function(e) {
	var lvl;

	if (typeof e === 'string') {
		lvl = e;
	} else {
		lvl = e.currentTarget.value;
	}

	main.control.action('getLevel', lvl, function(l) {
		var nextlvl;

		if (l) {
			this.parse(l);
			this.render();

			this.checkInfo();
			nextlvl = this.cube.levels[this.index +1];
			if (nextlvl) {
				nextlvl.checkInfo();
			}
		} else {
			main.message($$('Level %s is not found.', lvl), 'error');
		}
	}.bind(this));

	this.cubePath.loadLevel(this.index, lvl);
};

LevelConstructor.prototype.changeLidLevel = function(input) {
	var isLid = input.checked
	this.level.lid = isLid;
};

LevelConstructor.prototype.rotateLevel = function(e) {
	var val = typeof e === 'object' ? e.target.value : e;

	this.level.rotate(val);
	this.render();

	this.cubePath.rotateLevel(this.index, val);
};

LevelConstructor.prototype.setAction = function(action) {
	this.action = action;
};

LevelConstructor.prototype.setCell = function(el, type, val) {
	var o = {
		textContent: '',
		title: ''
	};

	if (!el) {
		return;
	}

	if (val) {
		switch (type) {
			case 's1':
				o.textContent = $$('S');
				o.title = $$('Start');
				break;
			case 's-1':
				o.textContent = $$('F');
				o.title = $$('Finish');
				break;
			case 's2':
				o.textContent = '\uf077'; // ^
				o.title = $$('Pin inside maze');
				break;
			case 's-2':
				o.textContent = '\uf078'; // v
				o.title = $$('Pin at the bottom of level');
				break;
		}
	}

	el.textContent = o.textContent;
	el.title = o.title;
};

LevelConstructor.prototype.checkInfo = function() {
	var message = '';
	var type = 'none';

	if (this.index && this.level.hasPinConflict(this.cube.levels[this.index - 1].level.getOutSidePins())) {
		message = $$('This level won\'t be well positioned due to the pin under the previous level.');
		type = 'error';
	}

	this.renderMessage(message, type);
};

LevelConstructor.prototype.change = function(e) {
	var el = e.target,
		id = el.id,
		val, lvl;

	if (!id) {
		return false;
	}

	id = id.split('-');

	switch (id[0]){
		case 'main':
			switch (this.action) {
				case 0: type = 'b'; break;
				case 1:	type = 's'; val = 1; this.cube.startCell(id.slice(1).map(parseFloat)); break;
				case -1: type = 's'; val = -1; this.cube.endCell(id.slice(1).map(parseFloat)); break;
				case 2:	type = 's'; val = 2; break;
				case -2: type = 's'; val = -2; break;
				default: return;
			}

			val = this.level.toggle(id[1], id[2], type, val);
			if (type === 'b') {
				el.className = 'cell-main-' + (val ? 'hole' : 'fill');
			} else {
				this.setCell(el, type+val, true);
				lvl = this.cube.levels[this.index +1];
				if (lvl) {
					lvl.checkInfo();
				}
			}
			break;
		case 'wallR':
			type = 'r';
			val = this.level.toggle(id[1], id[2], type);
			el.className = 'cell-wallR-' + (val ? 'hole' : 'fill');
			this.checkInfo();
			break;
		case 'wallD':
			type = 'd';
			val = this.level.toggle(id[1], id[2], type);
			el.className = 'cell-wallD-' + (val ? 'hole' : 'fill');
			break;
	}

	this.cubePath.setCell(id[1], id[2], this.index, type, val);
};

LevelConstructor.prototype.startCell = function(id) {
	var el;

	if (this.startCL && this.startCL[0] === id[0] && this.startCL[1] === id[1] && this.startCL[2] === id[2]) {
		return;
	}

	if (this.startCL) {
		el = document.getElementById('main-' + this.startCL[0] + '-' + this.startCL[1] + '-' + this.startCL[2]);
		this.setCell(el, '');
	}

	if (id[2] === this.index) {
		el = document.getElementById('main-' + id[0] + '-' + id[1] + '-' + id[2]);
		this.setCell(el, 's1', 1);
		this.startCL = id.concat([]);
	} else {
		this.startCL = null;
	}
};

LevelConstructor.prototype.endCell = function(id) {
	var el;

	if (this.endCL && this.endCL[0] === id[0] && this.endCL[1] === id[1] && this.endCL[2] === id[2]) {
		return;
	}

	if (this.endCL) {
		el = document.getElementById('main-' + this.endCL[0] + '-' + this.endCL[1] + '-' + this.endCL[2]);
		this.setCell(el, '');
	}

	if (id[2] === this.index) {
		el = document.getElementById('main-' + id[0] + '-' + id[1] + '-' + id[2]);
		this.setCell(el, 's-1', -1);
		this.endCL = id.concat([]);
	} else {
		this.endCL = null;
	}
};

LevelConstructor.prototype.save = function() {
	//To be kept???
	console.log('check name & save level '+ this.level.name);
};

LevelConstructor.prototype.toJSON = function() {
	return this.level.toJSON();
};

LevelConstructor.prototype.parse = function(json) {
	this.level.parse(json);
};
