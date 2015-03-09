function LevelConstructor(index, cubePath, cubeColor, options) {
	options = options || {};

	this.reset({
		lid: options.lid,
		s: options.s ? options.s.filter(function(c) {
				return c[2] === index;
			}) : []
	});
	this.index = index;
	this.cubePath = cubePath;
	this.color = cubeColor;
	this.lastLevel = !!options.lastLevel;
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

			if (this.index === 0 && x === 1 && y === 1) {
				el.textContent = $$('S');
				el.title = $$('Start');
			} else if (this.index === 6 && x === 4 && y === 4) {
				el.textContent = $$('F');
				el.title = $$('Finish');
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
			type = 'b';
			val = this.level.toggle(id[1], id[2], type);
			el.className = 'cell-main-' + (val ? 'hole' : 'fill');
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
