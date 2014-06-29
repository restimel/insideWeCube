function About() {}

About.prototype.render = function(container) {
	var program = document.createElement('section');

	var header = document.createElement('header'),
		title = document.createElement('h2'),
		link = document.createElement('a'),
		subTitle = document.createElement('span');

	title.textContent = 'Inside We Cube';
	header.appendChild(title);

	subTitle.textContent = $$('An INSIDE³ solver: ');

	link.textContent = 'http://www.insidezecube.com';
	link.href = 'http://www.insidezecube.com';
	subTitle.appendChild(link);
	header.appendChild(subTitle);

	program.appendChild(header);

	var author = document.createElement('div');
	author.textContent = $$('Author: %s', 'Restimel');
	program.appendChild(author);

	var version = document.createElement('div');
	version.textContent = $$('Version: %s', '1.0');
	program.appendChild(version);

	var date = document.createElement('div');
	date.textContent = $$('Date: %s', (new Date(1403301600000)).toDateString());
	program.appendChild(date);

	container.appendChild(program);
};
