function RatingOptions(option) {
	option = option || {};
	this.callbackFunction = option.callback;
}

RatingOptions.prototype.render = function(data) {
	var that = this;
	var dialogBox = document.createElement('dialog'),
		header = document.createElement('header'),
		body = document.createElement('section'),
		footer = document.createElement('footer'),
		btnSave = document.createElement('button'),
		btnClose = document.createElement('button');

	this.data = data;
	this.dialogBox = dialogBox;
	
	/* header */
	header.textContent = $$('Rating options');

	/* footer */
	btnSave.textContent = $$('Save');
	btnSave.onclick = save;
	footer.appendChild(btnSave);

	btnClose.textContent = $$('Cancel');
	btnClose.onclick = close;
	footer.appendChild(btnClose);

	/* body */
	body.className = 'body-cube-filter';
	this.optionSelector = document.createElement('div');
	this.optionSelector.className = 'filter-container';

	this.optionList = [
		{
			id: 'nbAvailable',
			shortName: $$('Accessible cells'),
			longName: $$('Number of accessible cells')
		},
		{
			id: 'pathLength',
			shortName: $$('Path length'),
			longName: $$('Length of the shortest path')
		},
		{
			id: 'dEndLength',
			shortName: $$('Dead-end cells'),
			longName: $$('Number of cells which are not in the shortest path')
		},
		{
			id: 'nbDEnd',
			shortName: $$('Dead-ends'),
			longName: $$('Number of dead-end ways')
		},
		{
			id: 'nbChgDir',
			shortName: $$('Number of turns'),
			longName: $$('Number of turns inside levels')
		},
		{
			id: 'rateDir',
			shortName: $$('Turns rate'),
			longName: $$('Rate of turns against the path length')
		},
		{
			id: 'nbChgLvl',
			shortName: $$('Movements through levels'),
			longName: $$('Number of movements through levels')
		},
		{
			id: 'nbMovement',
			shortName: $$('Cube rotations'),
			longName: $$('Number of cube rotations needed')
		},
		{
			id: 'nbMvtRot',
			shortName: $$('Cube flips'),
			longName: $$('Number of upside-down cube flips needed')
		},
		{
			id: 'rateRot',
			shortName: $$('Flip rate'),
			longName: $$('Rate of flips against rotations')
		},
		{
			id: 'nbOut',
			shortName: $$('Outside path required'),
			longName: $$('Number of cells the ball must go outside the shortest path')
		},
		{
			id: 'nbDifficultCrs',
			shortName: $$('Hardcore passages'),
			longName: $$('Number of hardcore passages')
		}
	];

	this.optionList.forEach(function(option) {
		var id = option.id;
		option.pnd = Helper.config['pnd_' + id];
		option.max = Helper.config['max_' + id];
	});
	this.computeRanges();

	this.loadOption(this.optionList);
	body.appendChild(this.optionSelector);

	/* dialog box */
	prepareDialog();

	dialogBox.appendChild(header);
	dialogBox.appendChild(body);
	dialogBox.appendChild(footer);

	this.updateValues();

	document.body.appendChild(dialogBox);
	dialogBox.showModal();

	function close() {
		document.body.removeChild(dialogBox);
	}

	function save() {
		that.optionList.forEach(function(option) {
			var id = option.id;
			Helper.config['pnd_' + id] = option.pnd;
			Helper.config['max_' + id] = option.max;
		});

		that.callback();

		close();
	}

	function prepareDialog() {
		if (typeof dialogBox.showModal !== 'function') {
			/* Shim of HTML5 dialog */
			dialogBox.className = 'dialog-cube-filter fake-dialog';

			dialogBox.showModal = function() {
				this.open = true;
			};
			dialogBox.close = close;
			dialogBox.open = false;
		} else {
			dialogBox.className = 'dialog-cube-filter';
			dialogBox.addEventListener('close', close, false);
		}
	}
};

RatingOptions.prototype.callback = function() {
	if (typeof this.callbackFunction === 'function') {
		this.callbackFunction();
	}
};

RatingOptions.prototype.loadOption = function(list) {
	this.optionSelector.innerHTML = '';

	var output;
	var table = document.createElement('table');
	var tr = document.createElement('tr');
	var td = document.createElement('th');
	tr.appendChild(td);

	td = document.createElement('th');
	td.textContent = $$('Coefficient rate');
	tr.appendChild(td);

	td = document.createElement('th');
	td.textContent = $$('Maximum value');
	td.title = $$('Estimated maximum (it can be overhead)');
	tr.appendChild(td);

	td = document.createElement('th');
	td.className = 'small';
	td.textContent = $$('Cube');
	td.title = $$('Current cube values');
	tr.appendChild(td);
	table.appendChild(tr);

	list.forEach(function(option, index) {
		var id = option.id,
			shortName = option.shortName,
			longName = option.longName,
			value = this.data[id] || 0;

		var input, output;

		tr = document.createElement('tr');

		td = document.createElement('td');
		td.textContent = shortName;
		td.title = longName;
		tr.appendChild(td);

		td = document.createElement('td');
		input = document.createElement('input');
		input.type = 'range';
		input.min = 0;
		input.max = 100;
		input.id = 'range_' + id;
		input.oninput = this.rangeChange.bind(this)
		td.appendChild(input);
		output = document.createElement('output');
		output.id = 'output_' + id;
		td.appendChild(output);
		tr.appendChild(td);

		td = document.createElement('td');
		input = document.createElement('input');
		input.type = 'number';
		input.min = 0;
		input.id = 'max_' + id;
		input.onchange = this.maxChange.bind(this)
		td.appendChild(input);
		tr.appendChild(td);

		td = document.createElement('td');
		td.className = 'small';
		td.textContent = '(' + $$.parse('%{.3}d', value) + ')';
		tr.appendChild(td);

		table.appendChild(tr);
	}, this);

	/* Total */
	tr = document.createElement('tr');
	td = document.createElement('td');
	td.textContent = $$('Total');
	tr.appendChild(td);

	td = document.createElement('td');
	output = document.createElement('output');
	output.id = 'output_total';
	td.appendChild(output);
	tr.appendChild(td);
	table.appendChild(tr);

	/* Estimation */
	tr = document.createElement('tr');
	td = document.createElement('td');
	td.textContent = $$('Rating on current cube');
	tr.appendChild(td);

	td = document.createElement('td');
	td.colspan = 2;
	output = document.createElement('meter');
	output.id = 'output_meter';
	output.optimum = 0;
	output.low = 33;
	output.high = 66;
	output.max = 100;
	td.appendChild(output);
	tr.appendChild(td);
	table.appendChild(tr);

	this.optionSelector.appendChild(table);
};

RatingOptions.prototype.rangeChange = function(evt) {
	var id = evt.target.id.substr(6);
	var range = +evt.target.value;
	var option = this.optionList.filter(function(opt) {
		return opt.id === id;
	})[0];
	
	this.totalMax -= option.pnd * option.max;

	this.totalRange += range - option.range;
	option.range = range;
	range = range / this.totalRange;

	option.pnd = range  * this.totalMax / ((1 - range) * option.max);
	this.totalMax += option.pnd * option.max;

	this.updateValues();
};

RatingOptions.prototype.maxChange = function(evt) {
	var id = evt.target.id.substr(4);
	var max = +evt.target.value || 0;
	var option = this.optionList.filter(function(option) {
		return option.id === id;
	})[0];
	var pnd = option.pnd;
	var range = option.range / this.totalRange;

	this.totalMax -= option.pnd * option.max;
	option.max = max;
	
	option.pnd = range  * this.totalMax / ((1 - range) * option.max);
	this.totalMax += option.pnd * option.max;

	this.updateValues();
};

RatingOptions.prototype.updateValues = function(evt) {
	var total = 0;
	var meter = 0;

	this.optionList.forEach(function (option) {
		var id = option.id;
		var range = option.range;

		total += range;
		meter += option.pnd * (this.data[id] || 0);
		this.dialogBox.querySelector('#range_' + id).value = range;
		this.dialogBox.querySelector('#output_' + id).value = $$('%{.2}d%%', range);
		this.dialogBox.querySelector('#max_' + id).value = option.max;
	}, this);
	meter /= this.totalMax;
	meter *= 100;

	this.dialogBox.querySelector('#output_total').value =  $$('%{.2}d%%', total);
	this.dialogBox.querySelector('#output_meter').value = meter;
};

RatingOptions.prototype.computeRanges = function(evt) {
	var total = this.optionList.reduce(function (total, option) {
		return total + option.pnd * option.max;
	}, 0);

	this.totalMax = total;
	this.totalRange = 100;

	this.optionList.forEach(function (option) {
		option.range = option.pnd * option.max / total * 100;
	}, 0);
};
