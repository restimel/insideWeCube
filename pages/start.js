var startPage = {};

startPage.render = function(container) {
	/* import */
	var header = document.createElement('h1'),
		explanation = document.createElement('p'),
		img = document.createElement('img');

	header.textContent = 'Inside We Cube';
	container.appendChild(header);

	explanation.textContent = $$('How to find your ball lost inside the cube? How to build new mazes from your cubes?');
	container.appendChild(explanation);

	explanation = document.createElement('p');
	explanation.textContent = $$('"Inside We Cube" will help you!');
	container.appendChild(explanation);

	img.className = 'start-main';
	img.src = 'img/zen.png';
	img.alt = $$('Keep your calm stay zen!');

	container.appendChild(img);
};
