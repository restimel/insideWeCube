function createWorker() {
	if (typeof Worker === 'function') {
		return new Worker('worker.js');
	}

	var worker = {
		postMessage: function() {
			this.port.postMessage.apply(this.port, arguments);
		},
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
	createWorker.buildingWorker.port = port;
	port.onmessage = function() {
		createWorker.buildingWorker.onmessage.apply(createWorker.buildingWorker, arguments);
	};
	createWorker.buildingWorker = null;
};
