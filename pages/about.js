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
		summary;

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
	summary = document.createElement('summary');
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
	version.textContent = $$('Version: %s', main.version);
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
			q: $$('The application doesn\'t seems to work.'),
			a: $$('Try with another browser or a newer version of your browser.<br>This application is written with HTML5 API only modern browser can run correctly this application. Some features could not work correctly depending on your browser version.<br>It doesn\'t work at all on Internet Explorer 9 and prior versions.')
		},
		{
			q: $$('How could I build new maze from cube I have?'),
			a: $$('Go to "Cube Manager" and build your cube with level you own. On the right you\'ll see if your cube is solvable and the difficulty of your construction.<br>If you have levels that are not in the database you could build and save them (don\'t forget to also save your creation in "Import/Export" menu in order to re-use cubes/levels you built)')
		},
		{
			q: $$('How could I reset my real cube without opening it?'),
			a: $$('Go to "Lost in cube?" and follow the instructions. The first instructions will help to know where your ball is in the cube. Then instructions are given to bring back the ball to the start (or the end, but it is better if you solve it by your own, isn\'t it?).')
		},
		{
			q: $$('How to sent a cube map to a friend?'),
			a: $$('Go to "Import/Export" and copy the code in "export cubes" area. Paste this code in a text file if you want to save it on your computer. You can also sent this code to a friend. He will be able to import it on his computer with this application.')
		},
		{
			q: $$('How to read a cube sent by a friend?'),
			a: $$('Go to "Import/Export" and paste the code he sent you in the "import cubes" area. Then click on "Import" button. If the code is valid you are able to select these cubes/levels in "Cube manager" or "Lost in cube?" menus.')
		},
		{
			q: $$('What is the INSIDE³ face?'),
			a: $$('An insideZeCube cube has 2 noticeable faces.<ul><li>The "INSIDE³" face where you also see the name of the cube. This is the top face where the ball was when you have bought the cube.</li><li>The "InsideZeCube.com" face is where the cube can be open (when feasible). This is where the ball must be visible to finish the cube.</li></ul>In order to follow instructions, you should always keep one of these to face at top with the title readable.')
		},
		{
			q: $$('Sometime the helper could not help me and give no clear instructions.'),
			a: $$('This happen when a complex movement must be done (like a diagonal movement). Current algorithm could not resolve such movement. I am very sorry you have to find the correct movement on your own :(<br>This could happen in difficult cubes (Awful, Vicious and Mortal)')
		},
		{
			q: $$('Why maps of Mortal cubes are not available?'),
			a: $$('The goal of Mortal cube is to discover the map levels on your own. If you take maps from someone else, you should better buy a Vicious or an Awful cube ;p')
		},
		{
			q: $$('I really want maps of Mortal cube!'),
			a: $$('Try to find someone who know maps of your cube and import them with the import/export tool.')
		},
		{
			q: $$('Why it looks so awful?'),
			a: $$('I am not a designer. If you can improve the application design, I will be glad to accept your work.')
		},
		{
			q: $$('Why is it called "Inside We cube"?'),
			a: $$('<ol><li>I had to find a name ;)</li><li>When you type "InsideZeCube" with a wrong AZERTY↔QWERTY keyboard configuration you get "InsideWeCube".</li><li>Because INSIDE this application WE solve CUBE.</li></ol>')
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
};
