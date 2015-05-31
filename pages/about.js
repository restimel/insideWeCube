function About() {}

About.prototype.render = function(container) {
	var contributors = ['Dav1d23']; /* add your Github name here if you have contributes to this application */

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
	author.innerHTML = $$('Author: %s', createGithubLink('Restimel'));
	program.appendChild(author);

	if (contributors.length) {
		var elContributors = document.createElement('div');
		elContributors.innerHTML = $$('Contributors: %s', contributors.map(createGithubLink).join(', '));
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
	license.innerHTML += '<a rel="license" href="http://creativecommons.org/licenses/by/4.0/" target="_blank"><img alt="Licence Creative Commons" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a>';
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

	var fontAwesome = document.createElement('div');
	fontAwesome.textContent = $$('Font icons: ');
	link = document.createElement('a');
	link.textContent = link.href = 'http://fontawesome.io/';
	link.target = '_blank';
	fontAwesome.appendChild(link);
	credit.appendChild(fontAwesome);

	credit.className = 'about-section';
	container.appendChild(credit);

	function createGithubLink(user) {
		return '<a href="https://github.com/' + encodeURIComponent(user) + '" target="_blank">'+user+'</a>';
	}
};

About.prototype.renderFAQ = function(container) {
	var faq = [
		{
			q: $$('The application doesn\'t seem to work.'),
			a: $$('Try with another browser or a newer version of your browser.<br>This application is written with HTML5 API, only modern browsers can run correctly this application. Some features may not work correctly depending on your browser version.<br>It doesn\'t work at all on Internet Explorer 9 and prior versions.')
		},
		{
			q: $$('How can I build a new maze from cubes I have?'),
			a: $$('Go to "Cube Manager" and build your cube with your own levels. On the right you\'ll see if your cube is solvable and the difficulty of your construction.<br>If you have levels that are not in the database, you can build and save them (don\'t forget to also save your creation in "Import/Export" menu in order to re-use cubes/levels you built)')
		},
		{
			q: $$('How can I reset my real cube without opening it?'),
			a: $$('Go to "Lost in cube?" and follow the instructions. The first instructions will help to know where your ball is in the cube. Then instructions are given to bring back the ball to the start (or the end, but it is better if you solve it by your own, isn\'t it?).')
		},
		{
			q: $$('How to send a cube map to a friend?'),
			a: $$('Go to "Import/Export" and copy the code in "export cubes" area. Paste this code in a text file if you want to save it on your computer. You can also send this code to a friend. He will be able to import it on his computer with this application.')
		},
		{
			q: $$('How to read a cube sent by a friend?'),
			a: $$('Go to "Import/Export" and paste the code he sent you in the "import cubes" area. Then click on "Import" button. If the code is valid you are able to select these cubes/levels in "Cube manager" or "Lost in cube?" menus.')
		},
		{
			q: $$('How can I print cube maps that I have created?'),
			a: $$('Go to "Cube Manager" and select the cube to print. Then click on "maps preview" in the small maps section at bottom right (this section must be opened first if it is reduced). A new tab will open displaying all maps of this cube. You can use the print feature of your browser.')
		},
		{
			q: $$('I am looking for all mazes I can create from cubes I own.'),
			a: $$('Go to "Look for new mazes!", select levels you own and click on "Look for possible maze". All combinations you can create will appear. Warning: in some cases it can take a very long time!')
		},
		{
			q: $$('Why the estimated difficulty is different between \"Cube manager\" and \"Look for new mazes!\"?'),
			a: $$('In \"Look for new mazes!\" to avoid taking more time to compute, the estimation is based only on the number of available cells and dead-ends.<br>In \"Cube manager\", only one cube is analyzed, so a more complex algorithm is run including the number of needed rotations to solve it.')
		},
		{
			q: $$('I would like to save the generated cubes.'),
			a: $$('When possible solutions are displayed, you can click on them to see what they look like. If you tick their checkbox and then click on \"save\" (%s) they will be saved with the given name (if no name is provided a generated name will be given).', '\uf0c7')
		},
		{
			q: $$('I have created lot of cube but I want to get rid of them. How can I remove them?'),
			a: $$('Go to "Cube Manager" and click on "Delete cubes" button (%s). Select cubes you want to remove and click on "delete". These cubes won\'t be display anymore in your browser.<br>Note: If you have customized an original cube and you remove it, the original maps are restored.', '\uf1b3\uf014')
		},
		{
			q: $$('How can I see only cubes I own?'),
			a: $$('Click on "Filter"  button and then unselect cube you don\'t want to see. They will not appear anymore in cubes selection. To be able to choose them again, re-select them in the "Filter" menu')
		},
		{
			q: $$('What are \"lid\" levels?'),
			a: $$('These levels are the ones which close the cube box. These levels cannot go inside the cube, they must stay at the last level.')
		},
		{
			q: $$('What are \"%s\", \"%s\" or \"pin\"?', '\uf077', '\uf078'),
			a: $$('\"Pins\" are the thin piece which blocks the ball at the start (which is inside the level (%s)) or at the end (which is below the previous level (%s)).', '\uf077', '\uf078')
		},
		{
			q: $$('How can I change the start/end of a cube? or define pin? or set level as \"lid\"?'),
			a: $$('In the \"Cube manager\", you can set configuration with the button %s. If you tick \"more tools\", you will access new tools to change the start/end cell, to set if a cell has a pin. And at the last level you can define it as a lid.', '\uf085')
		},
		{
			q: $$('How can I change that ball is not block by \"pins\"?'),
			a: $$('In the configuration dialog (%s), if you tick \"ball goes through pin\", pins will be ignored when your cubes will be evaluated.', '\uf085')
		},
		{
			q: $$('How can I choose any levels at the last level?'),
			a: $$('In the configuration dialog (%s), if you tick \"last level is lid only\", you can choose only level which are lid at the last level. Untick it to be able to choose any levels.', '\uf085')
		},
		{
			q: $$('How can I rotate levels?'),
			a: $$('In the configuration dialog (%s), if you tick \"rotate levels\", you will be able to change the level rotation.', '\uf085')
		},
		{
			q: $$('What is the INSIDE³ side?'),
			a: $$('An insideZeCube cube has 2 noticeable sides.<ul><li>The "INSIDE³" side where you also see the name of the cube. This is the top side where the ball was when you have bought the cube.</li><li>The "InsideZeCube.com" side is where the cube can be opened (when feasible). This is where the ball must be visible to finish the cube.</li></ul>In order to follow instructions, you should always keep one of these two sides at the top with the title readable.')
		},
		{
			q: $$('Sometimes the helper can not help me and gives no clear instructions.'),
			a: $$('This happen when a complex movement must be done (like a diagonal movement). Current algorithm can not resolve such movement. I am very sorry, you have to find the correct movement on your own :(<br>This may happen in difficult cubes (Awful, Vicious and Mortal)')
		},
		{
			q: $$('Why are maps of Mortal cubes not available?'),
			a: $$('The goal of Mortal cube is to discover the map levels on your own. If you take maps from someone else, you should better buy a Vicious or an Awful cube ;p')
		},
		{
			q: $$('I really want maps of Mortal cube!'),
			a: $$('Try to find someone who know maps of your cube and import them with the import/export tool.')
		},
		{
			q: $$('Why does it look so awful?'),
			a: $$('I am not a designer. If you can improve the application design, I will be glad to accept your work.')
		},
		{
			q: $$('Why is it called "Inside We cube"?'),
			a: $$('<ol><li>I had to find a name ;)</li><li>When you type "InsideZeCube" with a wrong AZERTY↔QWERTY keyboard configuration you get "InsideWeCube".</li><li>Because INSIDE this application WE solve CUBEs.</li></ol>')
		},
		{
			q: $$('Which technologies have been used for this program?'),
			a: $$('This is built only with JavaScript. There is nothing stored outside your browser.<br>No frameworks have been used. The whole application is hand made.')
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
