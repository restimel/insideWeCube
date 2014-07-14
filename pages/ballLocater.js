function BallLocater() {
	this.token = main.control.add(this.onMessage.bind(this));
	this.cubeName = '';
	this.container = null;
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
	main.control.action('euristic', {action: 'reset', data: this.cubeName}, this.token);

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
		this.textIntruction('-r'),
		this.textIntruction('d')
	].join('<br>');

	cell = row.insertCell(-1);
	cell.textContent = $$('POSITION_TOP_UP_RIGHT');

	cell = row.insertCell(-1);
	cell.textContent = '';

	table.appendChild(tbody);

	container.appendChild(table);
};

BallLocater.prototype.renderInstruction = function(movement) {
	var row = this.tbody.insertRow(-1);
		cell = row.insertCell(-1),
		position = row.rowIndex;

	cell.textContent = this.textIntruction(movement);

	cell = row.insertCell(-1);
	cell.textContent = $$('POSITION_TOP_UP_RIGHT'); //TODO update position

	cell = row.insertCell(-1);
	cell.className = 'BallLocater-result';
	cell.textContent = $$('What did you observed?');
	cell.appendChild(this.formMvt(0, position));
	cell.appendChild(this.formMvt(1, position));
	cell.appendChild(this.formMvt(2, position));
};

BallLocater.prototype.formMvt = function(code, position) {
	var cnt = document.createElement('label'),
		input = document.createElement('input'),
		text = document.createElement('span');

	input.type = 'radio';
	input.name = 'answerLocater';
	input.onchange = this.answer.bind(this, code, position);
	cnt.appendChild(input);

	text.textContent = this.textResult(code);
	cnt.appendChild(text);

	return cnt;
};

BallLocater.prototype.onMessage = function(data) {
	switch (data.action) {
		case 'instruction':
			this.renderInstruction(data.data);
			break;
		default:
			console.log('message unknown', data);
	}
};

/* Actions */

BallLocater.prototype.answer = function(code, position) {
	console.log('code:'+code);
	main.control.action('euristic', {action: 'answer', data: {
		code: code,
		position: position
	}}, this.token);
};


/* Text and messages */

BallLocater.prototype.textIntruction = function(mvt) {
	switch (mvt) {
		case 'r': return $$('Rotate your cube slightly to the right.');
		case '-r': return $$('Rotate your cube slightly to the left.');
		case 'd': return $$('Rotate your cube slightly upward.');
		case '-d': return $$('Rotate your cube slightly downward.');
		case 'b': return $$('Rotate your cube to have the face INSIDE³ at the top.');
		case '-b': return $$('Rotate your cube to have the face INSIDE³ at the bottom.');
		default:
			return $$('I am sorry, I can\'t help you here :(');
	}
};

BallLocater.prototype.textResult = function(code) {
	switch (code) {
		case 0: return $$('The ball has not moved.');
		case 1: return $$('The ball has moved and stopped.');
		case 2: return $$('The ball has moved and falled.');
		default:
			return $$('Something should happen but I don\'t know what :(');
	}
};
