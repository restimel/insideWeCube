
function Router() {
	this.routes = [
		{
			name: 'Create levels',
			route: 'creator'
		},
		{
			name: 'Build Cube',
			route: 'builder'
		},
		{
			name: 'Analyze Cube',
			route: 'analyzer'
		}
	]
}

Router.prototype.renderMenu = function(container) {
	this.routes.forEach(createElement);
	
	function createElement (route) {
		var el = document.createElement('li');
		el.className = 'route-menu-item';
		el.textContent = $$(route.name);
		//TODO add route event

		container.appendChild(el);
	}
}