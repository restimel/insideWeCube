function main(container){
	main.control = new Control();
	main.router = new Router();
	main.language = new Languages(main.refresh);

	main.container = container;

	main.createBody(container);
	main.control.action('changeLng', $$.getCurrentLng());
	main.refresh();
}

main.version = '1.0';

main.message = (function() {
	var container = document.createDocumentFragment(),
		list = [];

	function f(msg, type, option) {
		option = option || {};

		if (!option.keep) {
			f.clear();
		}

		if (!type) {
			type = 'info';
		}

		var elem = document.createElement('section');
		elem.textContent = msg;
		elem.className = type;
		elem.onclick = f.eclose;

		container.appendChild(elem);

		list.push(elem);

		if (typeof option.timeout === 'number') {
			setTimeout(function() {
				f.close(elem);
			}, option.timeout);
		}
	}

	f.clear = function() {
		container.innerHTML = '';
		list = [];
	};

	f.close = function(elem) {
		container.removeChild(elem);
		var i = list.indexOf(elem);
		list.splice(i, 1);
	};

	f.eclose = function(event) {
		f.close(event.currentTarget);
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
