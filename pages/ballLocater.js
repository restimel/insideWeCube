function BallLocater(findCallback, resetCallBack) {
	this.token = main.control.add(this.onMessage.bind(this));
	this.cubeName = '';
	this.container = null;

	if (typeof self.localStorage !== 'undefined') {
		this.isPossibleDisplayed = self.localStorage.getItem('hidePossible') !== 'true';
	} else {
		this.isPossibleDisplayed = true;
	}

	this.findCallback = findCallback;
	this.resetCallBack = resetCallBack;
}

BallLocater.prototype.reset = function(cubeName) {
	if (typeof this.resetCallBack === 'function') {
		this.resetCallBack();
	}

	if (typeof cubeName === 'string' && cubeName !== this.cubeName) {
		this.cubeName = cubeName;
		main.control.action('getCubeInfo', {name: cubeName}, this.token);
	} else if (this.container) {
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
		name: this.cubeName,
		color: this.cubeColor
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
	container.innerHTML = '';

	var table = document.createElement('table');
	table.className = 'instructions';
	/* Head */
	var tHead = document.createElement('thead');
	var row = document.createElement('tr');
	var cell = document.createElement('th');
	cell.textContent = $$('Instructions');
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.textContent = $$('Expected position');
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

	var label = document.createElement('label'),
		input = document.createElement('input');

	label.textContent = $$('Watch possible ball locations');
	label.className = 'configuration';
	input.type = 'checkbox';
	input.checked = this.isPossibleDisplayed;
	input.onchange = this.onChangePossibleDisplay.bind(this);
	label.appendChild(input);
	container.appendChild(label);
};

BallLocater.prototype.renderCube = function(container) {
	this.mapOrientation = this.mapOrientation || 'top';

	container.appendChild(Helper.selectCubeOrientation(this.getCubeMap.bind(this), this.mapOrientation));

	this.cubeSelectorContainer = document.createElement('section');
	container.appendChild(this.cubeSelectorContainer);

	this.cubeSelectorContainer.onclick = this.selectCell.bind(this);

	this.getCubeMap();
};

BallLocater.prototype.renderCubeSelector = function(cubeHtml) {
	this.cubeHtml = cubeHtml.map(function(html, i) {
		return '<figure><caption>'+$$('Level %d', i+1)+'</caption>'+html+'</figure>';
	});
	this.cubeSelectorContainer.innerHTML = this.cubeHtml.join('');

	var id = 'map-' + this.cubeStart.x + '-' + this.cubeStart.y + '-' + this.cubeStart.z;
	var elem = document.getElementById(id);
	if (elem) {
		elem.classList.add('start-cell');
		elem.title = $$('Start');
	}

	id = 'map-' + this.cubeEnd.x + '-' + this.cubeEnd.y + '-' + this.cubeEnd.z;
	elem = document.getElementById(id);
	if (elem) {
		elem.classList.add('end-cell');
		elem.title = $$('Finish');
	}

	this.displayPossible();
};

BallLocater.prototype.renderInstruction = function(movement, rowPst, position) {
	while (this.tbody.rows[rowPst - 1]) {
		this.tbody.deleteRow(rowPst - 1);
	}

	var row = this.tbody.insertRow(-1),
		cell = row.insertCell(-1),
		sign = document.createElement('div'),
		iRow = row.rowIndex;

	sign.className = 'mvt-summary';
	sign.textContent = this.summaryMvt(movement);
	cell.appendChild(sign);
	cell.appendChild(document.createTextNode(this.textIntruction(movement)));

	cell = row.insertCell(-1);
	Cube3D.render(cell, position, this.getCube());

	cell = row.insertCell(-1);
	cell.className = 'BallLocater-result';
	cell.textContent = $$('What did you observe?');
	cell.appendChild(this.formMvt(0, iRow));
	cell.appendChild(this.formMvt(1, iRow));
	cell.appendChild(this.formMvt(-1, iRow));

	row.onclick = this.displayPossible.bind(this);

	if (row.scrollIntoViewIfNeeded) {
		row.scrollIntoViewIfNeeded(true);
	} else {
		row.scrollIntoView();
	}

};

BallLocater.prototype.renderWayBack = function(path) {
	this.detailsMvt = true;

	var position,
		container = this.wayContainer,
		summary = [];

	container.innerHTML = '';

	var sumDetails = document.createElement('details'),
		sumTitle = document.createElement('summary'),
		instrSummary = document.createElement('p');

	sumDetails.className = 'instructions-summary';
	sumDetails.appendChild(sumTitle);
	sumDetails.appendChild(instrSummary);

	container.appendChild(sumDetails);

	var table = document.createElement('table');

	/* header */
	var row = table.insertRow(-1),
		cell = document.createElement('th');

	cell.textContent = $$('Instructions');
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.textContent = $$('Expected position');
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.textContent = $$('Expected results');
	row.appendChild(cell);

	if (this.detailsMvt) {
		cell = document.createElement('th');
		cell.textContent = $$('Ball movement');
		row.appendChild(cell);
	}

	setTimeout(function(row) {
		if (row.scrollIntoViewIfNeeded) {
			row.scrollIntoViewIfNeeded(true);
		} else {
			row.scrollIntoView();
		}
	}, 10, row);

	/* instructions */
	path.forEach(function(instruction, i) {
		var sign = document.createElement('div'),
			span = document.createElement('span'),
			symbol;

		row = table.insertRow(-1);
		cell = row.insertCell(-1);

		if (i) {
			symbol = this.summaryMvt(instruction.mvt, position || instruction.position);
			summary.push(symbol);

			sign.className = 'mvt-summary';
			sign.textContent = symbol;
			cell.appendChild(sign);
		}

		span.innerHTML = this.textIntruction(instruction.mvt, position || instruction.position);
		cell.appendChild(span);

		cell = row.insertCell(-1);
		Cube3D.render(cell, instruction.position, this.getCube());

		cell = row.insertCell(-1);
		cell.innerHTML = this.textResult(instruction.result);

		if (this.detailsMvt) {
			cell = row.insertCell(-1);
			cell.classname = 'mini-map ball-mvt';
			cell.innerHTML = this.renderDetailedMap(instruction, i);
		}

		position = instruction.position;
	}, this);

	container.appendChild(table);

	sumTitle.textContent = $$('Instructions summary (%d)', summary.length);
	instrSummary.innerHTML = summary.join('&emsp;');
};

/* Render mini-map of where the ball have moved */
BallLocater.prototype.renderDetailedMap = function(instruction, i) {
	var bMvt = instruction.bMvt,
		fig = [],
		z, tZ;

	if (!bMvt || !bMvt.length) {
		return '';
	}

	z = bMvt[0].z;
	tZ = bMvt[bMvt.length - 1].z;

	fig.push(this.cubeHtml[z]);

	while(z !== tZ) {
		z+= z > tZ ? -1 : 1;
		fig.push(this.cubeHtml[z]);
	}

	setTimeout(function() {
		bMvt.forEach(function(cell, cellIndex) {
			var id = 'detail' + [i,cell.x, cell.y, cell.z].join('-'),
				cell = document.getElementById(id);

			if (cell) {
				cell.classList.add('movement-location');
				if (cellIndex === 0) {
					cell.classList.add('movement-start');
				}
				if (cellIndex === bMvt.length - 1) {
					cell.classList.add('movement-end');
				}
			}
		});
	}, 10);

	return fig.join('').replace(/id="map/g, 'id="detail'+i);
}

/* show which cells are possible */
BallLocater.prototype.renderPossible = function(possible) {
	main.removeClass('possible-location');
	if (this.isPossibleDisplayed && possible instanceof Array) {
		possible.forEach(function(coordinate) {
			var id = 'map-' + [coordinate.x, coordinate.y, coordinate.z].join('-');
				cell = document.getElementById(id);

			if (cell) {
				cell.classList.add('possible-location');
			}
		});
	}
};

/* Ask to display possible cells */
BallLocater.prototype.displayPossible = function(row) {
	if (this.isPossibleDisplayed) {
		if (typeof row === 'object') {
			if (['INPUT', 'LABEL'].indexOf(row.target.tagName) !== -1) {
				return;
			}
			row = row.currentTarget.rowIndex - 2;
		}

		if (typeof row !== 'number') {
			row = -1;
		}

		main.control.action('heuristic', {action: 'getPossibleCells', data: {
			iRow: row
		}}, this.token);
	} else {
		main.removeClass('possible-location');
	}
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

BallLocater.prototype.onChangePossibleDisplay = function(evt) {
	var input = evt.target;

	this.isPossibleDisplayed = !!input.checked;
	if (typeof self.localStorage !== 'undefined') {
		self.localStorage.setItem('hidePossible', !this.isPossibleDisplayed);
	}

	this.displayPossible();
};

/* Communication */
BallLocater.prototype.onMessage = function(data) {
	var args = data.data;

	switch (data.action) {
		case 'instruction':
			this.renderInstruction(args.mvt, args.iRow + 2, args.position);
			this.position = args.position;
			this.renderPossible(args.possible);
			break;
		case 'impossible':
			if (args.possible.length === 0) {
				main.message($$('No cell in this cube fits your observation. Are you sure of your answer?'), 'error');
			} else {
				main.message($$('Many cells fit your observation. It is not possible to differenciate them :( %s',
					args.possible.reduce(function(str, cell) {
						return str + '[ x:' + (cell.y+1) + ' y:' + (cell.x+1) + ' level:' + (cell.z+1) +']';
					}, '')), 'error');
				this.renderPossible(args.possible);
			}
			break;
		case 'found':
			main.message($$('The ball location has been found!'), 'success', {timeout: 2000});
			this.renderPossible(args.possible);
			this.findCallback(args.cell, args.position);
			break;
		case 'wayBack':
			this.renderWayBack(args.path);
			break;
		case 'renderCube':
			this.renderCubeSelector(args.cube);
			break;
		case 'cubeInfo':
			this.cubeColor = data.info.color;
			this.cubeStart = data.info.start;
			this.cubeEnd = data.info.end;
			if (this.container) {
				this.render();
			}
			break;
		case 'possibleCells':
			this.renderPossible(args.possible);
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
	var str;

	function displayPosition(position) {
		var str = [];
		str.push(position.b ? $$('The INSIDE³ side is at the top.') : $$('The INSIDE³ side is at the bottom.'));
		str.push(position.d === position.b ? $$('Your cube is slightly rotated backward.') : $$('Your cube is slightly rotated forward.'));
		str.push(position.r ?  $$('Your cube is slightly rotated to the right.') : $$('Your cube is slightly rotated to the left.'));
		return str;
	}

	if (mvt === '') {
		str = displayPosition(position);
		str.splice(1, 0, $$('The text is readable.'));
		return str.join('<br>');
	}

	if (position.b) {
		switch (mvt) {
			case 'r': return $$('Rotate your cube slightly to the right.');
			case '-r': return $$('Rotate your cube slightly to the left.');
			case 'd': return $$('Rotate your cube slightly backward.');
			case '-d': return $$('Rotate your cube slightly forward.');
			case 'b': return $$('Rotate your cube to have the INSIDE³ side at the bottom.');
			case '-b':
				if (position.d) {
					return $$('Rotate your cube backward to have the INSIDE³ side at the bottom.');
				} else {
					return $$('Rotate your cube forward to have the INSIDE³ side at the bottom.');
				}
			default:
				str = displayPosition(position);
				str.splice(0, 0,
					$$('I am sorry, I can\'t help you here :('),
					'',
					$$('Cube should end up in this position:')
				);
				return str.join('<br>');
		}
	}else {
		switch (mvt) {
			case 'r': return $$('Rotate your cube slightly to the right.');
			case '-r': return $$('Rotate your cube slightly to the left.');
			case 'd': return $$('Rotate your cube slightly forward.');
			case '-d': return $$('Rotate your cube slightly backward.');
			case 'b':
				if (position.d) {
					return $$('Rotate your cube forward to have the INSIDE³ side at the top.');
				} else {
					return $$('Rotate your cube backward to have the INSIDE³ side at the top.');
				}
			case '-b': return $$('Rotate your cube to have the INSIDE³ side at the top.');
			default:
				str = displayPosition(position);
				str.splice(0, 0,
					$$('I am sorry, I can\'t help you here :('),
					'',
					$$('Cube should end up in this position:')
				);
				return str.join('<br>');
		}
	}
};

BallLocater.prototype.summaryMvt = function(mvt, position) {
	position = position || this.position;

	if (position.b) {
		switch (mvt) {
			case 'r': return '⇒';
			case '-r': return '⇐';
			case 'd': return '⇓';
			case '-d': return '⇑';
			case 'b': return '↺';
			case '-b':
				if (position.d) {
					return '⇓↺';
				} else {
					return '⇑↻';
				}
			default:
				return '?';
		}
	}else {
		switch (mvt) {
			case 'r': return '⇒';
			case '-r': return '⇐';
			case 'd': return '⇑';
			case '-d': return '⇓';
			case 'b':
				if (position.d) {
					return '⇑↻';
				} else {
					return '⇓↺';
				}
			case '-b': return '↻';
			default:
				return '?';
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
