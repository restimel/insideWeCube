function BallLocater(findCallback) {
	this.token = main.control.add(this.onMessage.bind(this));
	this.cubeName = '';
	this.container = null;

	this.findCallback = findCallback;
}

BallLocater.prototype.reset = function(cubeName) {
	if (typeof cubeName === 'string') {
		this.cubeName = cubeName;
	}

	if (this.container) {
		this.render();
	}
};

BallLocater.prototype.resetInstructions = function() {
	main.message.clear();
	this.container.innerHTML = '';
	this.render(this.container, this.position);
};

BallLocater.prototype.getCube = function() {
	return {
		name: this.cubeName
	};
};

/* Render */
BallLocater.prototype.render = function(container, position) {
	position = position || {
		r: 0,
		d: 1,
		b: 1
	};
	this.position = position;

	main.control.action('heuristic', {action: 'reset', data: {
		cubeName: this.cubeName,
		position: this.position
	}}, this.token);

	if (typeof container === 'undefined') {
		container = this.container;
	} else {
		this.container = container;
	}

	var table = document.createElement('table');
	table.className = 'instructions';
	/* Head */
	var tHead = document.createElement('thead');
	var row = document.createElement('tr');
	var cell = document.createElement('th');
	cell.textContent = $$('Instructions');
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.textContent = $$('Position attended');
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.textContent = $$('Results');
	row.appendChild(cell);

	tHead.appendChild(row);
	table.appendChild(tHead);

	/* first Cell */
	var tbody = document.createElement('tbody');
	this.tbody = tbody;
	row = tbody.insertRow(-1);
	cell = row.insertCell(-1);
	cell.innerHTML = this.textIntruction('', position);

	cell = row.insertCell(-1);
	Cube3D.render(cell, position, this.getCube());

	cell = row.insertCell(-1);
	var changePosition = document.createElement('button');
	changePosition.textContent = $$('This is not my current position!');
	changePosition.onclick = function() {
		Cube3D.askPosition(container, function(position) {
			container.innerHTML = '';
			this.render(container, position);
		}.bind(this), position, this.getCube());
	}.bind(this);
	cell.appendChild(changePosition);

	table.appendChild(tbody);

	container.appendChild(table);

	var btnLost = document.createElement('button');
	btnLost.textContent = $$('I have lost my ball! I don\'t know what happened!');
	btnLost.onclick = this.resetInstructions.bind(this);
	container.appendChild(btnLost);
};

BallLocater.prototype.renderCube = function(container) {
	this.mapOrientation = this.mapOrientation || 'top';

	var that = this,
		label = document.createElement('label'),
		select = document.createElement('select');

	label.textContent = $$('Map orientation: ');
	select.onchange = function() {
		that.getCubeMap(this.value);
	};

	[{id:'top', text:$$('INSIDE³ face at top')},
	 {id:'bottom', text:$$('INSIDE³ face at bottom')}
	].forEach(function(item) {
		var option = document.createElement('option');
		option.value = item.id;
		option.textContent = item.text;
		if (item.id === this.mapOrientation) {
			option.selected = true;
		}
		select.add(option);
	}, this);
	label.appendChild(select);
	container.appendChild(label);

	this.cubeSelectorContainer = document.createElement('section');
	container.appendChild(this.cubeSelectorContainer);

	this.cubeSelectorContainer.onclick = this.selectCell.bind(this);

	this.getCubeMap();
};

BallLocater.prototype.renderCubeSelector = function(cubeHtml) {
	this.cubeSelectorContainer.innerHTML = cubeHtml.map(function(html, i) {
		return '<figure><caption>'+$$('Level %d', i+1)+'</caption>'+html+'</figure>';
	}).join('');
};

BallLocater.prototype.renderInstruction = function(movement, rowPst, position) {
	while (this.tbody.rows[rowPst - 1]) {
		this.tbody.deleteRow(rowPst - 1);
	}

	var row = this.tbody.insertRow(-1),
		cell = row.insertCell(-1),
		iRow = row.rowIndex;

	cell.textContent = this.textIntruction(movement);

	cell = row.insertCell(-1);
	Cube3D.render(cell, position, this.getCube());

	cell = row.insertCell(-1);
	cell.className = 'BallLocater-result';
	cell.textContent = $$('What did you observe?');
	cell.appendChild(this.formMvt(0, iRow));
	cell.appendChild(this.formMvt(1, iRow));
	cell.appendChild(this.formMvt(-1, iRow));

	if (row.scrollIntoViewIfNeeded) {
		row.scrollIntoViewIfNeeded(true);
	} else {
		row.scrollIntoView();
	}
};

BallLocater.prototype.renderWayBack = function(path) {
	var position,
		container = this.wayContainer;
	container.innerHTML = '';

	var table = document.createElement('table');

	/* header */
	var row = table.insertRow(-1),
		cell = document.createElement('th');

	cell.textContent = $$('Instructions');
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.textContent = $$('Position attended');
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.textContent = $$('Expected results');
	row.appendChild(cell);
	if (row.scrollIntoViewIfNeeded) {
		row.scrollIntoViewIfNeeded(true);
	} else {
		row.scrollIntoView();
	}

	/* instructions */
	path.forEach(function(instruction) {
		row = table.insertRow(-1);
		cell = row.insertCell(-1);
		cell.innerHTML = this.textIntruction(instruction.mvt, position || instruction.position);

		cell = row.insertCell(-1);
		Cube3D.render(cell, instruction.position);

		cell = row.insertCell(-1);
		cell.innerHTML = this.textResult(instruction.result);

		position = instruction.position;
	}, this);

	container.appendChild(table);
};

BallLocater.prototype.formMvt = function(code, iRow) {
	var cnt = document.createElement('label'),
		input = document.createElement('input'),
		text = document.createElement('span');

	input.type = 'radio';
	input.name = 'answerLocater'+iRow;
	input.onchange = this.answer.bind(this, code, iRow);
	cnt.appendChild(input);

	text.textContent = this.textResult(code);
	cnt.appendChild(text);

	return cnt;
};

BallLocater.prototype.getCubeMap = function(mapOrientation) {
	this.mapOrientation = mapOrientation || this.mapOrientation || 'top';

	main.control.action('heuristic', {action: 'renderCube', data: {
		cubeName: this.cubeName,
		orientation: this.mapOrientation
	}}, this.token);
};

/* Communication */
BallLocater.prototype.onMessage = function(data) {
	var args = data.data;

	switch (data.action) {
		case 'instruction':
			this.renderInstruction(args.mvt, args.iRow + 2, args.position);
			this.position = args.position;
			break;
		case 'impossible':
			if (args.possible.length === 0) {
				main.message($$('No cell in this cube fit your observation. Are you sure about your answer?'), 'error');
			} else {
				main.message($$('Many cells fit your observation. It is not possible to differenciate them :( %s',
					args.possible.reduce(function(str, cell) {
						return str + '[ x:' + (cell.y+1) + ' y:' + (cell.x+1) + ' level:' + (cell.z+1) +']';
					}, '')), 'error');
			}
			break;
		case 'found':
			main.message($$('The ball location has been found!'), 'success', 2000);
			this.findCallback(args.cell, args.position);
			break;
		case 'wayBack':
			this.renderWayBack(args.path);
			break;
		case 'renderCube':
			this.renderCubeSelector(args.cube);
			break;
		default:
			console.warn('message unknown', data);
	}
};

/* Actions */
BallLocater.prototype.answer = function(code, iRow) {
	main.control.action('heuristic', {action: 'answer', data: {
		code: code,
		iRow: iRow - 2
	}}, this.token);
};

BallLocater.prototype.findWay = function(cell, container, cellEnd, position) {
	main.control.action('heuristic', {action: 'wayBack', data: {
		cell: cell,
		target: cellEnd,
		position: position
	}}, this.token);

	this.wayContainer = container;
};

BallLocater.prototype.selectCell = function(event) {
	var location = event.target.id.split('-'),
		cell = {
			x: parseInt(location[1], 10),
			y: parseInt(location[2], 10),
			z: parseInt(location[3], 10)
		},
		position = this.position;

	if (location[0] === 'map' && !event.target.classList.contains('unavailable')) {
		this.findCallback(cell, position);
	}
};

/* Helper */

/* Text and messages */

BallLocater.prototype.textIntruction = function(mvt, position) {
	position = position || this.position;

	if (mvt === '') {
		var str = [];
		str.push(position.b ? $$('the face INSIDE³ is at top') : $$('the face INSIDE³ is at bottom'));
		str.push(position.d === position.b ? $$('your cube is slightly rotated backward') : $$('your cube is slightly rotated forward'));
		str.push(position.r ?  $$('your cube is slightly rotated to the right') : $$('your cube is slightly rotated to the left'));
		return str.join('<br>');
	}

	if (position.b) {
		switch (mvt) {
			case 'r': return $$('Rotate your cube slightly to the right.');
			case '-r': return $$('Rotate your cube slightly to the left.');
			case 'd': return $$('Rotate your cube slightly backward.');
			case '-d': return $$('Rotate your cube slightly forward.');
			case 'b': return $$('Rotate your cube to have the face INSIDE³ at the bottom.');
			case '-b':
				if (position.d) {
					return $$('Rotate your cube backward to have the face INSIDE³ at the bottom.');
				} else {
					return $$('Rotate your cube forward to have the face INSIDE³ at the bottom.');
				}
			default:
				return $$('I am sorry, I can\'t help you here :(');
		}
	}else {
		switch (mvt) {
			case 'r': return $$('Rotate your cube slightly to the right.');
			case '-r': return $$('Rotate your cube slightly to the left.');
			case 'd': return $$('Rotate your cube slightly forward.');
			case '-d': return $$('Rotate your cube slightly backward.');
			case 'b':
				if (position.d) {
					return $$('Rotate your cube forward to have the face INSIDE³ at the top.');
				} else {
					return $$('Rotate your cube backward to have the face INSIDE³ at the top.');
				}
			case '-b': return $$('Rotate your cube to have the face INSIDE³ at the top.');
			default:
				return $$('I am sorry, I can\'t help you here :(');
		}
	}
};

BallLocater.prototype.textResult = function(code) {
	switch (code) {
		case -1: return $$('I am not sure what happened...');
		case 0: return $$('The ball has not moved.');
		case 1: return $$('The ball has moved.');
		case 2: return $$('The ball has moved and fallen.');
		default:
			if (code > 90) {
				return [this.textResult(code - 100), $$('The ball is now visible!')].join('<br>');
			}

			return $$('Something should happen but I don\'t know what :(');
	}
};
