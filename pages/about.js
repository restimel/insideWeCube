function About() {}

About.prototype.render = function(container) {
	var program = document.createElement('details'),
		credit = document.createElement('details');

	var header = document.createElement('header'),
		title = document.createElement('h2'),
		link = document.createElement('a'),
		subTitle = document.createElement('span'),
		summary = document.createElement('summary');

	title.textContent = 'Inside We Cube';
	header.appendChild(title);

	subTitle.textContent = $$('An INSIDE³ solver: ');

	link.textContent = 'http://www.insidezecube.com';
	link.href = 'http://www.insidezecube.com';
	link.target = '_blank';
	subTitle.appendChild(link);
	header.appendChild(subTitle);

	container.appendChild(header);

	summary.textContent = $$('About the program');
	program.appendChild(summary);

	var author = document.createElement('div');
	author.textContent = $$('Author: %s', 'Restimel');
	program.appendChild(author);

	var version = document.createElement('div');
	version.textContent = $$('Version: %s', '0.8');
	program.appendChild(version);

	var date = document.createElement('div');
	date.textContent = $$('Date: %s', (new Date(1403301600000)).toDateString());
	program.appendChild(date);

	program.open = true;
	container.appendChild(program);

	summary = document.createElement('summary');
	summary.textContent = $$('Credit');
	credit.appendChild(summary);

	var insidezecube = document.createElement('div');
	insidezecube.textContent = $$('The game: ');
	link = document.createElement('a');
	link.textContent = link.href = 'http://www.insidezecube.com';
	link.target = '_blank';
	insidezecube.appendChild(link);
	credit.appendChild(insidezecube);

	var flagIcon = document.createElement('div');
	flagIcon.textContent = $$('Languages icons: ');
	link = document.createElement('a');
	link.textContent = link.href = 'http://www.freeflagicons.com';
	link.target = '_blank';
	flagIcon.appendChild(link);
	credit.appendChild(flagIcon);

	container.appendChild(credit);

};
