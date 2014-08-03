function Cube3D() {

}

Cube3D.render = function(container, position, color) {
	color = color || 'blue';

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

	Cube3D.position(cube3d, position);
	container.appendChild(cube3d);

	container.className += ' position-cell';
};

Cube3D.getColor = function() {
	return [
		{code: 'black', name:$$('black')},
		{code: 'blue', name:$$('blue')},
		{code: 'brown', name:$$('brown')},
		{code: 'crystal', name:$$('crystal')},
		{code: 'green', name:$$('green')},
		{code: 'orange', name:$$('orange')},
		{code: 'red', name:$$('red')}
	].sort(function(a, b) {return a.name > b.name;});
}

Cube3D.position = function(elCell, position) {
	var str = 'position_';
	str += position.b ? 'TOP_' : 'BOTTOM_';
	str += position.d ? 'UP_' : 'DOWN_';
	str += position.r ? 'LEFT' : 'RIGHT';

	elCell.className += ' ' + str;
};
