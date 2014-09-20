var startPage = {};

startPage.render = function(container) {
	/* import */
	var header = document.createElement('h1'),
		explanation = document.createElement('p'),
		img = document.createElement('img');

	header.textContent = 'InsideWeCube';
	container.appendChild(header);

	explanation.textContent = $$('You have lost your ball inside the cube? You want to build new maze from your cubes?');
	container.appendChild(explanation);

	explanation = document.createElement('p');
	explanation.textContent = $$('InsideWeCube will help you!');
	container.appendChild(explanation);

	img.className = 'start-main';
	img.src = 'img/zen.png';
	img.alt = $$('Keep your calm stay zen!');

	container.appendChild(img);
};
