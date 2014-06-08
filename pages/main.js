var mainRouter, controller;

function main(container){
	controller = new Control();
	mainRouter = new Router();

	main.container = container;

	main.createBody(container);
}

var dspMessage = (function() {
	var container = document.createDocumentFragment();

	function f(msg, keep) {
		if (!keep) {
			f.clear();
		}

		var elem = document.createElement('section');
		elem.textContent = msg;
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
	mainRouter.renderMenu(navHeader);
	container.appendChild(navHeader);

	messageSct.className = 'message';
	dspMessage.builder(messageSct);
	container.appendChild(messageSct);

	contents.className = 'main-content';
	container.appendChild(contents);

	mainRouter.setContainer(contents);
};

main.removeClass = function (className, element) {
	if (typeof element === 'undefined') {
		element = main.container;
	}

	Array.prototype.forEach.bind(element.querySelectorAll('.' + className))(function(elem) {
		elem.classList.remove(className);
	});
};
