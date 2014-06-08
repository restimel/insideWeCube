
function Router(contentContainer) {
	var cube = new CubeBuilder(new CubePath()),
		importExport = new exportImport();
	this.routes = [
		{
			name: 'Build levels',
			route: 'builder',
			object: cube
		},
		{
			name: 'Analyze Cube',
			route: 'analyzer'
		},
		{
			name: 'Import/Export',
			route: 'importExport',
			object: importExport
		}
	];

	if (typeof contentContainer === 'object') {
		this.setContainer(contentContainer);
	}
}

Router.prototype.setContainer = function (contentContainer) {
	this.content = contentContainer;
};

Router.prototype.renderMenu = function(container) {
	this.routes.forEach(createElement.bind(this));

	function createElement (route) {
		var el = document.createElement('li');
		el.className = 'route-menu-item';
		el.textContent = $$(route.name);
		el.onclick = this.navigation.bind(this, route.route);

		container.appendChild(el);
	}
}

Router.prototype.navigation = function(route) {
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

	this.content.innerHTML = '';
	if (typeof r.object === 'function' || typeof r.object === 'object') {
		r.object.render(this.content);
	}
};
