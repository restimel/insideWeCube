function About() {}

About.prototype.render = function(container) {
	var contributors = []; /* add your name or nickname here if you have contributes to this application */

	var program = document.createElement('details'),
		credit = document.createElement('details'),
		faq = document.createElement('details');

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

	/* FAQ */
	summary = document.createElement('summary');
	summary.textContent = $$('FAQ');
	faq.appendChild(summary);

	this.renderFAQ(faq);

	faq.className = 'about-section';
	container.appendChild(faq);

	/* Program */
	summary.textContent = $$('About the program');
	program.appendChild(summary);

	var author = document.createElement('div');
	author.textContent = $$('Author: %s', 'Restimel');
	program.appendChild(author);

	if (contributors.length) {
		var elContributors = document.createElement('div');
		elContributors.textContent = $$('Contributors: %s', contributors.join(', '));
		program.appendChild(elContributors);
	}

	var version = document.createElement('div');
	version.textContent = $$('Version: %s', '0.8');
	program.appendChild(version);

	var date = document.createElement('div');
	date.textContent = $$('Date: %s', (new Date(1403301600000)).toDateString());
	program.appendChild(date);

	var license = document.createElement('div');
	license.textContent = $$('License: (%s) you are free to use, share and modify it if you keep credits to authors and contributors.', 'CC BY 4.0');
	license.innerHTML += '<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Licence Creative Commons" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a>';
	program.appendChild(license);

	var contribute = document.createElement('div');
	contribute.innerHTML = $$('Contribution: Sources are available on %s.', '<a href="https://github.com/restimel/insideWeCube" target="_blank">GitHub</a>');
	program.appendChild(contribute);

	program.open = true;
	program.className = 'about-section';
	container.appendChild(program);

	/* Credits */
	summary = document.createElement('summary');
	summary.textContent = $$('Credits');
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

	credit.className = 'about-section';
	container.appendChild(credit);
};

About.prototype.renderFAQ = function(container) {
	var faq = [
		{
			q: $$('Sometime the helper could not help me and give no clear instructions.'),
			a: $$('This happen when a complex movement must be done (like a diagonal movement). Current algorithm could not resolve such movement. I am very sorry you have to find the correct movement on your own :(<br>This could happen in difficult cubes (Awful, Vicious and Mortal)')
		},
		{
			q: $$('Why maps of Mortal cubes are not available?'),
			a: $$('The goal of Mortal cube is to discover the maps on your own. If you take maps from someone else, you should better buy a Vicious or an Awful cube.')
		},
		{
			q: $$('I really want maps of Mortal cube!'),
			a: $$('Try to find someone who know maps of your cube and import them with the import/export tool.')
		}
	];

	faq.forEach(function(fq) {
		var section = document.createElement('details'),
			question = document.createElement('summary'),
			answer = document.createElement('p');

		question.textContent = fq.q;
		question.className = 'faq-question';
		section.appendChild(question);

		answer.innerHTML = fq.a;
		answer.className = 'faq-answer';
		section.appendChild(answer);

		section.className = 'faq-item';
		container.appendChild(section);
	});
}
