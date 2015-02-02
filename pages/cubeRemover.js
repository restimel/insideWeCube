function CubeRemover(fcallback) {
	this.callBack = fcallback;
	this.state = [];
}

CubeRemover.prototype.render = function(container) {
	main.control.action('getCubes', true, this.loadCube.bind(this));

	var dialogBox = document.createElement('dialog'),
		header = document.createElement('header'),
		body = document.createElement('section'),
		footer = document.createElement('footer'),
		btnDelete = document.createElement('button'),
		btnClose = document.createElement('button');

	/* header */
	header.textContent = $$('Delete cubes');

	/* footer */
	btnDelete.textContent = $$('Delete');
	btnDelete.className = 'danger';
	btnDelete.onclick = deleteCubes.bind(this);
	footer.appendChild(btnDelete);

	btnClose.textContent = $$('Close');
	btnClose.onclick = close;
	footer.appendChild(btnClose);

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

	function deleteCubes() {
		/* TODO confirmation */
		this.state.forEach(function(s) {
			main.control.action('removeCube', {cubeName: s[0]});
		});

		if (typeof this.callBack === 'function') {
			this.callBack(this.state);
		}
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

CubeRemover.prototype.loadCube = function(list) {
	var changeState = this.changeState.bind(this);
	this.cubeSelector.innerHTML = '';

	list.forEach(function(cube, index) {
		var cubeName = cube[0],
			visible = cube[1],
			original = cube[2],
			container = document.createElement('div'),
			input = original ? null : document.createElement('input'),
			label = document.createElement('label'),
			id = 'cube_remover_' + index;

		container.className = 'cube-remover';

		if (!original) {
			input.type = 'checkbox';
			input.id = id;
			input.onchange = function () {
				changeState(cubeName, this.checked);
			};
			container.appendChild(input);
		}

		if (!visible) {
			cubeName += ' (' + $$('hidden') + ')';
		}

		label.htmlFor = id;
		label.textContent = cubeName;

		if (original) {
			label.className = 'disabled';
			label.title = $$('Original cube can\'t be removed!');
		}

		container.appendChild(label);

		this.cubeSelector.appendChild(container);
	}, this);
};

CubeRemover.prototype.changeState = function(cubeName, toRemove) {
	if (!this.state.some(function(s) {
		if (s[0] === cubeName) {
			s[1] = toRemove;
			return true;
		}
	})) {
		this.state.push([cubeName, toRemove]);
	}
}
