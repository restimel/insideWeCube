function Cube3D() {

}

Cube3D.render = function(container, position, cube) {
	cube = cube || {};
	var color = cube.color || 'blue';
	var name = cube.name || 'Cube';

	var cube3d = document.createElement('div');
	cube3d.className = 'conteneur3d cube-'+color;

	var parent = document.createElement('div');
	parent.className = 'parent';

	var face = document.createElement('div'); /* back */
	face.className = 'face cote6';
	parent.appendChild(face);

	face = document.createElement('div'); /* top */
	face.className = 'face cote5 light-face';
	var text = document.createElement('span');
	text.className = 'cube-title';
	text.textContent = 'INSIDE³';
	face.appendChild(text);
	var hole = document.createElement('div');
	hole.className = 'ball-hole';
	face.appendChild(hole);
	text = document.createElement('span');
	text.className = 'cube-name';
	text.textContent = 'Awesome0';
	face.appendChild(text);
	parent.appendChild(face);

	face = document.createElement('div'); /* bottom */
	face.className = 'face cote4';
	var cnt = document.createElement('div');
	cnt.className = 'cube-face-bottom';
	text = document.createElement('span');
	text.className = 'cube-title-site';
	text.textContent = 'insidezecube.com';
	cnt.appendChild(text);
	hole = document.createElement('div');
	hole.className = 'ball-hole';
	cnt.appendChild(hole);
	face.appendChild(cnt);
	parent.appendChild(face);

	face = document.createElement('div'); /* left */
	face.className = 'face cote3';
	parent.appendChild(face);

	face = document.createElement('div'); /* right */
	face.className = 'face cote2';
	parent.appendChild(face);

	face = document.createElement('div'); /* front */
	face.className = 'face cote1';
	parent.appendChild(face);
	cube3d.appendChild(parent);

	/* Shadow grid */
	var shadow = document.createElement('div');
	shadow.className = 'cube-shadow';

	var grid = document.createElement('table'),
		row, i, j;

	i = 5;
	while (i--) {
		row = grid.insertRow(-1);
		row.className = 'grid';
		j = 5;
		while (j--) {
			row.insertCell(-1);
		}
	}
	shadow.appendChild(grid);
	cube3d.appendChild(shadow);

	Cube3D.position(cube3d, position);
	container.appendChild(cube3d);

	container.className += ' position-cell';
};

Cube3D.askPosition = function(container, callBack, currentPosition, cube) {
	var dialogBox = document.createElement('dialog'),
		header = document.createElement('header'),
		body = document.createElement('section'),
		footer = document.createElement('footer'),
		btnOk = document.createElement('button'),
		btnCancel = document.createElement('button'),
		form = document.createElement('form'),
		preview = document.createElement('aside'),
		titleTop = document.createElement('span'),
		titleRotation = document.createElement('span'),
		position = {
			r: currentPosition.r,
			d: currentPosition.d,
			b: currentPosition.b
		};


	var renderPosition = function() {
		preview.innerHTML = '';
		preview.className = 'preview-cube-position';
		this.render(preview, position, cube);
	}.bind(this);

	/* header */
	header.textContent = $$('Set your cube current position');

	/* footer */
	btnOk.textContent = $$('Ok');
	btnOk.onclick = applyChange;
	footer.appendChild(btnOk);

	btnCancel.textContent = $$('Cancel');
	btnCancel.onclick = close;
	footer.appendChild(btnCancel);

	/* body */
	body.className = 'body-cube-position';

	form.className = 'form-cube-position';
	form.onsubmit = function(event) {
		applyChange();
		event.preventdDefault();
		return false;
	};
	titleTop.textContent = $$('INSIDE³ face is');
	titleTop.className = 'title-cube-position';
	form.appendChild(titleTop);

	buildRadio('b', $$('at TOP'), $$('at BOTTOM'));

	titleRotation.textContent = $$('Your cube is slightly rotated');
	titleRotation.className = 'title-cube-position';
	form.appendChild(titleRotation);

	buildRadio('r', $$('to the RIGHT'), $$('to the LEFT'));
	buildRadio('d', $$('BACKWARD'), $$('FORWARD'));

	body.appendChild(form);

	renderPosition();
	body.appendChild(preview);

	/* dialog box */
	prepareDialog();

	dialogBox.appendChild(header);
	dialogBox.appendChild(body);
	dialogBox.appendChild(footer);

	container.appendChild(dialogBox);
	dialogBox.showModal();

	function applyChange() {
		callBack(position);
		close();
	}

	function close() {
		container.removeChild(dialogBox);
	}

	function buildRadio(positionComponent, textTrue, textFalse) {
		var component = document.createElement('div'),
			label = document.createElement('label'),
			input = document.createElement('input');

		component.className = 'form-radio-component';

		input.type = 'radio';
		input.name = 'radio-position-' + positionComponent;
		input.checked = position[positionComponent];
		input.change = changeValue.bind(this, positionComponent, true);
		label.appendChild(input);
		label.appendChild(document.createTextNode(textTrue));
		component.appendChild(label);

		label = document.createElement('label');
		input = document.createElement('input');
		input.type = 'radio';
		input.name = 'radio-position-' + positionComponent;
		input.checked = !position[positionComponent];
		input.change = changeValue.bind(this, positionComponent, false);
		label.appendChild(input);
		label.appendChild(document.createTextNode(textFalse));
		component.appendChild(label);

		form.appendChild(component);
	}

	function changeValue(positionComponent, value) {
		position[positionComponent] = value;
		renderPosition();
	}

	function prepareDialog() {
		if (typeof dialogBox.showModal !== 'function') {
			/* Shim of HTML5 dialog */
			dialogBox.className = 'dialog-cube-position fake-dialog';

			dialogBox.showModal = function() {
				this.open = true;
			};
			dialogBox.close = close;
			dialogBox.open = false;
		} else {
			dialogBox.className = 'dialog-cube-position';
			dialogBox.addEventListener('close', close, false);
		}
	}
};

Cube3D.getColor = function() {
	return [
		{code: 'black', name: $$('black')},
		{code: 'blue', name: $$('blue')},
		{code: 'brown', name: $$('brown')},
		{code: 'crystal', name: $$('crystal')},
		{code: 'green', name: $$('green')},
		{code: 'orange', name: $$('orange')},
		{code: 'red', name: $$('red')}
	].sort(function(a, b) {return a.name > b.name;});
};

Cube3D.position = function(elCell, position) {
	var str = 'position_';
	str += position.b ? 'TOP_' : 'BOTTOM_';
	str += position.d ? 'UP_' : 'DOWN_';
	str += position.r ? 'LEFT' : 'RIGHT';

	elCell.className += ' ' + str;
};
