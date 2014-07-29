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

/* Render */
BallLocater.prototype.render = function(container) {
	var position = {
		r: 0,
		d: 1,
		b: 1
	};
	this.position = position;

	main.control.action('heuristic', {action: 'reset', data: this.cubeName}, this.token);

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
	cell.innerHTML = [
		$$('Put your cube with the INSIDE³ face at top. INSIDE³ must face you and is readable.'),
		this.textIntruction('-r', position),
		this.textIntruction('d', position)
	].join('<br>');

	cell = row.insertCell(-1);
	this.displayPosition(cell, position);

	cell = row.insertCell(-1);
	cell.textContent = '';

	table.appendChild(tbody);

	container.appendChild(table);
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
	this.displayPosition(cell, position);

	cell = row.insertCell(-1);
	cell.className = 'BallLocater-result';
	cell.textContent = $$('What did you observe?');
	cell.appendChild(this.formMvt(0, iRow));
	cell.appendChild(this.formMvt(1, iRow));
	cell.appendChild(this.formMvt(-1, iRow));

	row.scrollIntoViewIfNeeded();
};

BallLocater.prototype.renderWayBack = function(path) {
	var position = this.position,
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
	row.scrollIntoViewIfNeeded();

	path.forEach(function(instruction) {
		row = table.insertRow(-1);
		cell = row.insertCell(-1);
		cell.textContent = this.textIntruction(instruction.mvt, position);

		cell = row.insertCell(-1);
		this.displayPosition(cell, instruction.position);

		cell = row.insertCell(-1);
		cell.textContent = this.textResult(instruction.result);

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

/* Helper */

BallLocater.prototype.displayPosition = function(elCell, position) {
	position = position || this.position;

	var str = 'POSITION_';
	str += position.b ? 'TOP_' : 'BOTTOM_';
	str += position.d ? 'UP_' : 'DOWN_';
	str += position.r ? 'LEFT' : 'RIGHT';

	elCell.textContent = str;
};

/* Text and messages */

BallLocater.prototype.textIntruction = function(mvt, position) {
	position = position || this.position;

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
		case -1: return $$('I am not sure what happen...');
		case 0: return $$('The ball has not moved.');
		case 1: return $$('The ball has moved.');
		case 2: return $$('The ball has moved and fallen.');
		default:
			return $$('Something should happen but I don\'t know what :(');
	}
};
