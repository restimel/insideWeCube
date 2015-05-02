function createWorker() {
	if (typeof Worker === 'function') {
		return new Worker('worker.js');
	}

	var worker = {
		postMessage: (function() {
			var store = [];
			var messages = function() {
				store.push(arguments);
			};

			messages.send = function(w) {
				store.forEach(function(args) {
					w.postMessage.apply(w, args);
				});
			};

			return messages;
		})(),
		onmessage: function() {},
		terminate: function() {
			self.postMessage({data: {action: 'terminateWorker'}});
		}
	};

	createWorker.buildingWorker = worker;
	self.postMessage({data: {action: 'newWorker'}});

	return worker;
}

createWorker.link = function (port) {
	var worker = createWorker.buildingWorker;
	var postMessages = worker.postMessage;

	worker.port = port;
	port.onmessage = createWorker.onmessage(worker);
	worker.postMessage = createWorker.postMessage;
	postMessages.send(worker);

	createWorker.buildingWorker = null;
};

/* save method */
createWorker.postMessage = function() {
	this.port.postMessage.apply(this.port, arguments);
};

createWorker.onmessage = function(worker) {
	return function() {
		worker.onmessage.apply(worker, arguments);
	}
};