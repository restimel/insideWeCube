var mainRouter, controller;

function main(container){
	mainRouter = new Router();

	createBody(container);
	controller = new Control();
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

function createBody(container) {
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
}
