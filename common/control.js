function Control(){
	this.worker = new Worker('worker/worker.js');

	this.worker.onmessage = this.onmessage.bind(this);
	this.token = 0;
	this.callbacks = {};
}

Control.prototype.onmessage = function(e) {
	var data = e.data,
		callback;

	if (data.token) {
		callback = this.callbacks[data.token];
		callback(data.data);
		if (!callback.persistent) {
			delete this.callbacks[data.token];
		}
	} else if (data.data && data.data.action === 'message') {
		main.message(data.data.message, data.data.type, {
			keep: true,
			timeout: data.data.time,
			html: data.data.html
		});
	} else if (data.data && data.data.action === 'newWorker') {
		if (typeof MessageChannel === 'undefined') {
			main.message($$('Your browser does not support MessageChannel. You could not use this feature.'), 'error');
			return;
		}
		if (this.backWorker) {
			this.backWorker.terminate();
		}
		var channel = new MessageChannel();
		this.worker.postMessage({action: 'newWorker'}, [channel.port1]);
		this.backWorker = new Worker('worker/worker.js');
		this.backWorker.postMessage({action: 'changePort'}, [channel.port2]);
	} else if (data.data && data.data.action === 'terminateWorker') {
		if (!this.backWorker) {
			console.warn('the back worker has been asked to be terminated but it does not exist');
			return;
		}
		this.backWorker.terminate();
		this.backWorker = null;
	} else {
		try {
			console.log(JSON.parse(data.log));
		} catch(e) {
			console.log(data);
		}
	}
};

Control.prototype.action = function(code, data, callback) {
	var message = {action: code, args: data};
	if (typeof callback === 'function') {
		this.token++;
		this.callbacks[this.token] = callback;
		message.token = this.token;
	} else if (typeof callback === 'number') {
		message.token = callback;
	}

	this.worker.postMessage(message);
};

Control.prototype.add = function(callback) {
	this.token++;
	this.callbacks[this.token] = callback;
	callback.persistent = true;
	return this.token;
};
