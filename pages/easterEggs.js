var EasterEggs = {
	lordOfTheCubes: function() {
		var mainContainer = main.container;
		var container = document.createElement('div');
		mainContainer.appendChild(container);

		var color = 'black';
		var name = $$('The lord of the cubes');

		var cube3d = document.createElement('div');
		cube3d.className = 'conteneur3d cube-'+color;

		var parent = document.createElement('div');
		parent.className = 'parent';

		var face = document.createElement('div'); /* back */
		face.className = 'face cote6 quoted';
		face.textContent = $$('One cube to bring them all');
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
		text.textContent = name;
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
		face.className = 'face cote3 quoted';
		face.textContent = $$('And in the darkness to bind them');
		parent.appendChild(face);

		face = document.createElement('div'); /* right */
		face.className = 'face cote2 quoted';
		face.textContent = $$('One cube to find them');
		parent.appendChild(face);

		face = document.createElement('div'); /* front */
		face.className = 'face cote1 quoted';
		face.textContent = $$('One cube to rule them all');
		parent.appendChild(face);
		cube3d.appendChild(parent);

		/* Shadow grid */
		var shadow = document.createElement('div');
		shadow.className = 'cube-shadow';
		cube3d.appendChild(shadow);

		container.appendChild(cube3d);

		container.className += ' lordCube position-cell';
		container.onclick = EasterEggs.removeItSelf;
	}
};

EasterEggs.removeItSelf = function(e) {
	var el = e.currentTarget;
	el.parentNode.removeChild(el);
};
