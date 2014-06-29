function CubeAnalyzer() {
	this.reset();
}

/* Render */

CubeAnalyzer.prototype.render = function(container) {
	if (typeof container === 'undefined') {
		container = this.container;
	} else {
		this.container = container;
	}

	container.innerHTML = '';
	
	var tools = document.createElement('section');

	var resetBtn = document.createElement('button');
	resetBtn.textContent = $$('Restart analyze');
	resetBtn.onclick = this.reset.bind(this);
	tools.appendChild(resetBtn);

	container.appendChild(tools);

	if (this.step >= 1) {
		this.renderStep1();
	}

	if (this.step >= 2) {
		this.renderStep2();
	}
};

CubeAnalyzer.prototype.renderStep1 = function() {
	var container = this.container;

	var step = document.createElement('fieldset'),
		title = document.createElement('legend');
	step.className = 'analyze-step1';


	title.textContent = $$('Select your cube');
	step.appendChild(title);

	var label = document.createElement('span');
	label.className = 'label';
	label.textContent = $$('Select the cube where you are lost.');
	step.appendChild(label);

	var select = document.createElement('select');
	select.onchange = this.changeCube.bind(this);
	select.appendChild(document.createElement('option'));
	main.control.action('getCubes', null, function(data) {
		data.forEach(function(name) {
			var option = document.createElement('option');
			
			option.value = option.textContent = name;
			if (this.cubeName === name) {
				option.selected = true;
			}
			select.appendChild(option);
		}.bind(this));
	}.bind(this));
	step.appendChild(select);

	container.appendChild(step);
};

CubeAnalyzer.prototype.renderStep2 = function() {
	var container = this.container;

	var step = document.createElement('fieldset'),
		title = document.createElement('legend');
	step.className = 'analyze-step2';
	title.textContent = $$('Locate the ball');
	step.appendChild(title);

	var label = document.createElement('span');
	label.className = 'label';
	label.textContent = $$('We will try to identify where the ball is.');
	step.appendChild(label);

	/* Cube section */
	var cubeSection = document.createElement('section');
	cubeSection.className = 'locate-by-cube';

	label = document.createElement('span');
	label.className = 'label';
	label.textContent = $$('If you know where the ball is, please click on the corresponding cell.');
	cubeSection.appendChild(label);

	step.appendChild(cubeSection);

	/* Euristic section */
	var euristicSection = document.createElement('section');
	euristicSection.className = 'locate-by-euristic';

	label = document.createElement('span');
	label.className = 'label';
	label.textContent = $$('If you don\'t know where the ball is, please follow the instructions.');
	euristicSection.appendChild(label);

	this.renderInstruction(euristicSection);

	var btnLost = document.createElement('button');
	btnLost.textContent = $$('I have lost my ball! I don\'t know what happened!');
	btnLost.onclick = this.resetInstructions.bind(this);

	step.appendChild(euristicSection);

	container.appendChild(step);
};

CubeAnalyzer.prototype.renderInstruction = function(container) {
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
	row = tbody.insertRow(-1);
	cell = row.insertCell(-1);
	cell.innerHTML = [
		$$('Put your cube with the INSIDE³ face at top. INSIDE³ must face you and is readable.'),
		$$('Rotate your cube slightly to the left.'),
		$$('Rotate your cube slightly upward.'),
	].join('<br>');

	cell = row.insertCell(-1);
	cell.textContent = $$('POSITION_TOP_UP_RIGHT');

	cell = row.insertCell(-1);
	cell.textContent = '';

	table.appendChild(tbody);

	container.appendChild(table);
};

/* Actions */

CubeAnalyzer.prototype.reset = function() {
	this.step = 1;

	this.cubeName = '';
};

CubeAnalyzer.prototype.changeCube = function(e) {
	var name;

	if (typeof e === 'string') {
		name = e;
	} else {
		name = e.currentTarget.value;
	}

	if (name === '') {
		this.reset();
		this.render();
		return;
	}

	this.cubeName = name;
	this.step = 2;

	this.render();
};

CubeAnalyzer.prototype.resetInstructions = function() {
	console.log('todo reset analyzer');
};
