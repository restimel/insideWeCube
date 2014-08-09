
function Router(contentContainer) {
	var cube = new CubeBuilder(new CubePath()),
		importExport = new exportImport(),
		cubeAnalyzer = new CubeAnalyzer(),
		about = new About();

	this.routes = [
		{
			name: 'Build cube',
			route: 'builder',
			object: cube
		},
		{
			name: 'Analyze cube',
			route: 'analyzer',
			object: cubeAnalyzer
		},
		{
			name: 'Import/Export',
			route: 'importExport',
			object: importExport
		},
		{
			name: '?',
			route: 'about',
			object: about
		}
	];

	this.lastRoute = null;

	if (typeof contentContainer === 'object') {
		this.setContainer(contentContainer);
	}
}

Router.prototype.setContainer = function (contentContainer) {
	this.content = contentContainer;
};

Router.prototype.renderMenu = function(container) {
	this.container = container;
	this.routes.forEach(createElement.bind(this));

	function createElement (route) {
		var el = document.createElement('div');
		el.className = 'route-menu-item ' + route.route;
		el.textContent = $$(route.name);
		el.onclick = this.navigation.bind(this, route.route);

		container.appendChild(el);
	}
}

Router.prototype.navigation = function(route, evt) {
	var r = null,
		s = this.routes.some(function(ro) {
			if (ro.route === route) {
				r = ro;
				return true;
			}
			return false;
		});

	if (!s) {
		console.error('route not found', route);
		return false;
	}

	this.lastRoute = route;

	main.message.clear();

	this.content.innerHTML = '';
	if (typeof r.object === 'function' || typeof r.object === 'object') {
		r.object.render(this.content);
	}
	main.removeClass('active', this.container);
	evt.target.classList.add('active');
};
