function LevelConstructor(index, cubePath, parentCube, cubeColor, options) {
	options = options || {};

	this.reset({
		lid: options.lid,
		s: options.s ? options.s.filter(function(c) {
				return c[2] === index;
			}) : []
	});

	this.index = index;
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

	var header = document.createElement('header');

	header.textContent = (this.index + 1) + '-';
	container.appendChild(header);

	var inputName = document.createElement('input');
	inputName.placeholder = $$('level identifier');
	inputName.value = this.level.name || '';
	inputName.onchange = this.changeName.bind(this);
	container.appendChild(inputName);

	var select = document.createElement('select');
	select.onchange = this.changeLevel.bind(this);
	select.appendChild(document.createElement('option'));
	main.control.action('getLevels', {lid: this.lastLevel}, function(data) {
		data.forEach(function(name) {
			var option = document.createElement('option');
			
			option.value = option.textContent = name;
			select.appendChild(option);
		});
	});
	container.appendChild(select);

	this.renderLevel(container);
};

LevelConstructor.prototype.renderLevel = function(container) {
	if (!container) {
		container = this.container;
	}

	var table = document.createElement('table'),
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
	container.appendChild(table);
};

LevelConstructor.prototype.reset = function(options) {
	this.level = new Level('', options);
};

LevelConstructor.prototype.changeName = function(e) {
	this.level.name = e.currentTarget.value;
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
		if (l) {
			this.parse(l);
			this.render();
		} else {
			main.message($$('Level %s is not found.', lvl), 'error');
		}
	}.bind(this));

	this.cubePath.loadLevel(this.index, lvl);
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

LevelConstructor.prototype.change = function(e) {
	var el = e.target,
		id = el.id,
		val;

	if (!id) {
		return false;
	}

	id = id.split('-');

	switch (id[0]){
		case 'main':
			switch (this.action) {
				case 0: type = 'b'; break;
				case 1:	type = 's1'; this.cube.startCell(id.slice(1).map(parseFloat)); break;
				case -1: type = 's-1'; this.cube.endCell(id.slice(1).map(parseFloat)); break;
				case 2:	type = 's2'; break;
				case -2: type = 's-2'; break;
				default: return;
			}

			val = this.level.toggle(id[1], id[2], type);
			if (type === 'b') {
				el.className = 'cell-main-' + (val ? 'hole' : 'fill');
			} else {
				this.setCell(el, type, val);
			}
			break;
		case 'wallR':
			type = 'r';
			val = this.level.toggle(id[1], id[2], type);
			el.className = 'cell-wallR-' + (val ? 'hole' : 'fill');
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
		this.setCell(el, 's1');
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
		this.setCell(el, 's-1');
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
