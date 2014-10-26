function cubeFilter(fcallback) {
	this.callBack = fcallback;
	this.state = [];
}

cubeFilter.prototype.render = function(container) {
	var that = this;
	
	main.control.action('getCubes', true, this.loadCube.bind(this));

	var dialogBox = document.createElement('dialog'),
		header = document.createElement('header'),
		body = document.createElement('section'),
		footer = document.createElement('footer'),
		btnOk = document.createElement('button'),
		btnCancel = document.createElement('button');

	/* header */
	header.textContent = $$('Filter cubes');

	/* footer */
	btnOk.textContent = $$('Ok');
	btnOk.onclick = applyChange;
	footer.appendChild(btnOk);

	btnCancel.textContent = $$('Cancel');
	btnCancel.onclick = close;
	footer.appendChild(btnCancel);

	/* body */
	body.className = 'body-cube-filter';
	this.cubeSelector = document.createElement('div');
	this.cubeSelector.className = 'filter-container';
	body.appendChild(this.cubeSelector);
	
	/* dialog box */
	prepareDialog();

	dialogBox.appendChild(header);
	dialogBox.appendChild(body);
	dialogBox.appendChild(footer);

	document.body.appendChild(dialogBox);
	dialogBox.showModal();

	function applyChange() {
		this.state.forEach(function(s) {
			main.control.action('setVisible', {cubeName: s[0], visible: s[1]});
		});

		that.callBack(this.state);
		close();
	}

	function close() {
		document.body.removeChild(dialogBox);
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

cubeFilter.prototype.loadCube = function(list) {
	var changeState = this.changeState.bind(this);
	this.cubeSelector.innerHTML = '';

	list.forEach(function(cube, index) {
		var cubeName = cube[0],
			visible = cube[1],
			container = document.createElement('div'),
			input = document.createElement('input'),
			label = document.createElement('label'),
			id = 'cube_filter_' + index;

		container.className = 'cube-filter';

		input.type = 'checkbox';
		input.id = id;
		input.checked = !!visible;
		input.onchange = function () {
			changeState(cubeName, this.value);
		};

		label.forHTML = id;
		label.textContent = cubeName;

		container.appendChild(input);
		container.appendChild(label);

		this.cubeSelector.appendChild(container);
	}, this);
};

cubeFilter.prototype.changeState = function(cubeName, visible) {
	if (!this.state.some(function(s) {
		if (s[0] === cubeName) {
			s[1] = visible;
			return true;
		}
	})) {
		this.state.push([cubeName, visible]);
	}
}
