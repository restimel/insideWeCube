function Cube3D() {

}

Cube3D.prototype.render = function(container) {
	var cube3d = document.createElement('div');
	cube3d.id = 'conteneur';

	var parent = document.createElement('div');
	parent.className = 'parent';

	var face = document.createElement('div'); /* back */
	face.className = 'face cote6';
	parent.appendChild(face);

	face = document.createElement('div'); /* top */
	face.className = 'face cote5 light-face';
	var text = document.createElement('span');
	text.className = 'cube-title';
	text.textContent = 'INSIDE3';
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
	text = document.createElement('span');
	text.className = 'cube-title';
	text.textContent = 'INSIDE3';
	face.appendChild(text);
	hole = document.createElement('div');
	hole.className = 'ball-hole';
	face.appendChild(hole);
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

	var shadow = document.createElement('div');
	shadow.className = 'cube-shadow';
	cube3d.appendChild(shadow);

	container.appendChild(cube3d);
};
