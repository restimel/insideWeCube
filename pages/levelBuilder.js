function LevelConstructor(index, cubePath) {
	this.reset();
	this.index = index;
	this.cubePath = cubePath;
}

LevelConstructor.prototype.render = function(container) {
	if (container) {
		this.container = container;
	} else {
		container = this.container;
		container.innerHTML = '';
	}

	var btn = document.createElement('button');
	btn.textContent = $$('reset level');
	btn.onclick = this.reset.bind(this);
	container.appendChild(btn);

	var inputName = document.createElement('input');
	inputName.placeholder = $$('level identifier');
	inputName.value = this.level.name || '';
	inputName.onchange = this.changeName.bind(this);
	container.appendChild(inputName);

	var select = document.createElement('select');
	select.onchange = this.changeLevel.bind(this);
	select.appendChild(document.createElement('option'));
	controller.action('getLevels', null, function(data) {
		data.forEach(function(name) {
			var option = document.createElement('option');
			
			option.value = option.textContent = name;
			select.appendChild(option);
		});
	});
	container.appendChild(select);

	// btn = document.createElement('button');
	// btn.textContent = $$('save level');
	// btn.onclick = this.save.bind(this);
	// container.appendChild(btn);

	this.renderLevel(container);
};

LevelConstructor.prototype.renderLevel = function(container) {
	if (!container) {
		container = this.container;
	}

	var table = document.createElement('table'),
		row1, row2,	el, cell, x, y;

	table.className = 'constructor-table';

	for (x = 0; x < 6; x++) {
		row1  = document.createElement('tr');
		row2  = document.createElement('tr');

		for (y = 0; y < 6; y++) {
			cell = this.level.get(x, y);

			el = document.createElement('td');
			el.id = 'main-' + x + '-' + y + '-' + this.index;
			el.className = 'cell-main-' + (cell.b ? 'hole' : 'fill');
			row1.appendChild(el);

			el = document.createElement('td');
			el.id = 'wallR-' + x + '-' + y + '-' + this.index;
			el.className = 'cell-wallR-' + (cell.r ? 'hole' : 'fill');
			row1.appendChild(el);

			el = document.createElement('td');
			el.id = 'wallD-' + x + '-' + y + '-' + this.index;
			el.className = 'cell-wallD-' + (cell.d ? 'hole' : 'fill');
			row2.appendChild(el);

			el = document.createElement('td');
			el.className = 'cell-none';
			row2.appendChild(el);
		}

		table.appendChild(row1);
		table.appendChild(row2);
	}

	table.onclick = this.change.bind(this);
	container.appendChild(table);
};

LevelConstructor.prototype.reset = function() {
	this.level = new Level('');
};

LevelConstructor.prototype.changeName = function(e) {
	this.level.name = e.currentTarget.value;
}

LevelConstructor.prototype.changeLevel = function(e) {
	var lvl = e.currentTarget.value;
	controller.action('getLevel', lvl, function(l) {
		if (l) {
			this.parse(l);
			this.render();
		} else {
			console.warn('could not change to level ' + lvl + ' because it is not found');
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
