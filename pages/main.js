var mainRoute;

function main(container){
	mainRouter = new Router();

	createBody(container);
}

function createBody(container) {
	var navHeader = document.createElement('nav'),
		contents = document.createElement('section');

	navHeader.className = 'route-menu';
	mainRouter.renderMenu(navHeader);

	contents.className = 'main-content';

	container.appendChild(navHeader);
	container.appendChild(contents);
}