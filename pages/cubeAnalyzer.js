function CubeAnalyzer() {
	this.ballLocater = new BallLocater(this.identifyCell.bind(this), this.resetStep3.bind(this));
	this.reset(false);

	this.findStart = true;
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
	resetBtn.textContent = $$('Restart analysis');
	resetBtn.onclick = this.reset.bind(this, true);
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
	label.textContent = $$('Select the cube where you are lost: ');
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
	this.ballLocater.reset(this.cubeName);

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

	label = document.createElement('div');
	label.className = 'label';
	label.textContent = $$('If you know where the ball is, please click on the corresponding cell.');
	cubeSection.appendChild(label);

	this.ballLocater.renderCube(cubeSection);

	step.appendChild(cubeSection);

	/* Euristic section */
	var euristicSection = document.createElement('section');
	euristicSection.className = 'locate-by-euristic';

	label = document.createElement('span');
	label.className = 'label';
	label.textContent = $$('If you don\'t know where the ball is, please follow the instructions.');
	euristicSection.appendChild(label);

	var ballLocaterContainer = document.createElement('div');
	this.ballLocater.render(ballLocaterContainer);
	euristicSection.appendChild(ballLocaterContainer);

	step.appendChild(euristicSection);

	container.appendChild(step);
};

CubeAnalyzer.prototype.renderStep3 = function() {
	var container = this.container;

	var previousElem = document.querySelector('.analyze-step3');
	if (previousElem) {
		container.removeChild(previousElem);
		previousElem = null;
	}

	var step = document.createElement('fieldset'),
		title = document.createElement('legend');
	step.className = 'analyze-step3';
	title.textContent = $$('Find your way back');
	step.appendChild(title);

	var label = document.createElement('span');
	label.className = 'label';
	label.textContent = $$('Where do you want to go?');
	step.appendChild(label);

	var cnt = document.createElement('section');

	/* form section */
	var form = document.createElement('form');
	form.className = 'ask-cell-end';

	var input = document.createElement('input');
	input.type = 'radio';
	input.name = 'ask-cell-end';
	input.id = 'endCellStart';
	input.onchange = this.changeEndTarget.bind(this, cnt, input.id);
	if (this.findStart) {
		input.checked = true;
		setTimeout(this.changeEndTarget.bind(this,cnt, input.id), 1);
	}
	form.appendChild(input);

	label = document.createElement('label');
	label.textContent = $$('To the start.');
	label.htmlFor = 'endCellStart';
	form.appendChild(label);

	input = document.createElement('input');
	input.type = 'radio';
	input.name = 'ask-cell-end';
	input.id = 'endCellEnd';
	input.onchange = this.changeEndTarget.bind(this, cnt, input.id);
	if (!this.findStart) {
		input.checked = true;
		setTimeout(this.changeEndTarget.bind(this,cnt, input.id), 1);
	}
	form.appendChild(input);

	label = document.createElement('label');
	label.textContent = $$('To the end.');
	label.htmlFor = 'endCellEnd';
	form.appendChild(label);

	step.appendChild(form);

	/* movement section */
	step.appendChild(cnt);

	container.appendChild(step);
};

/* Actions */

CubeAnalyzer.prototype.reset = function(render) {
	this.step = 1;

	this.cubeName = '';

	if (render) {
		main.message.clear();
		this.render();
	}
};

CubeAnalyzer.prototype.resetStep3 = function() {
	var previousElem = document.querySelector('.analyze-step3');
	if (previousElem) {
		this.container.removeChild(previousElem);
	}
};

CubeAnalyzer.prototype.changeCube = function(e) {
	var name;

	if (typeof e === 'string') {
		name = e;
	} else {
		name = e.currentTarget.value;
	}

	if (name === '') {
		this.reset(true);
		return;
	}

	this.cubeName = name;
	this.step = 2;

	this.render();
};

CubeAnalyzer.prototype.identifyCell = function(cell, position) {
	this.ballCell = {
		x: cell.x,
		y: cell.y,
		z: cell.z
	};

	this.cubePosition = {
		r: position.r,
		d: position.d,
		b: position.b
	};

	this.step = 3;

	this.renderStep3();
};

CubeAnalyzer.prototype.changeEndTarget = function(container, id) {
	var endTarget = id === 'endCellEnd';

	if (endTarget && this.findStart) {
		if (!confirm($$('Are you sure you want to be spoiled?\nDon\'t you want to try to solve it by yourself?'))) {
			document.getElementById('endCellStart').checked = true;
			endTarget = false;
		}
	}

	this.findStart = !endTarget;
	this.ballLocater.findWay(this.ballCell, container, endTarget, this.cubePosition);
};
