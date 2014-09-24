function main(container){
	main.control = new Control();
	main.router = new Router();
	main.language = new Languages(main.refresh);

	main.container = container;

	main.createBody(container);
	main.control.action('changeLng', $$.getCurrentLng());
	main.refresh();
}

main.version = '0.9';

main.message = (function() {
	var container = document.createDocumentFragment();

	function f(msg, type, keep) {
		if (!keep) {
			f.clear();
		}
		if (!type) {
			type = 'info';
		}

		var elem = document.createElement('section');
		elem.textContent = msg;
		elem.className = type;
		elem.onclick = f.close;

		container.appendChild(elem);
	}

	f.clear = function() {
		container.innerHTML = '';
	};

	f.close = function(event) {
		container.removeChild(event.currentTarget);
	};

	f.builder = function(cnt) {
		container = cnt;
	};

	return f;
})();

main.createBody = function(container) {
	var navHeader = document.createElement('nav'),
		messageSct = document.createElement('section'),
		contents = document.createElement('section');

	navHeader.className = 'route-menu';
	main.router.renderMenu(navHeader);
	container.appendChild(navHeader);

	messageSct.className = 'message';
	main.message.builder(messageSct);
	container.appendChild(messageSct);

	contents.className = 'main-content';
	container.appendChild(contents);

	main.router.setContainer(contents);

	main.language.render(container);
};

main.refresh = function() {
	main.container.innerHTML = '';
	main.createBody(main.container);
	main.router.navigation(main.router.lastRoute);
};

main.removeClass = function (className, element) {
	if (typeof element === 'undefined') {
		element = main.container;
	}

	Array.prototype.forEach.bind(element.querySelectorAll('.' + className))(function(elem) {
		elem.classList.remove(className);
	});
};
