function Control(){
	this.worker = new Worker('common/worker.js');

	this.worker.onmessage = this.onmessage.bind(this);
	this.token = 0;
	this.callbacks = {};
}

Control.prototype.onmessage = function(e) {
	var data = e.data;

	if (data.token) {
		this.callbacks[data.token](data.data);
		delete this.callbacks[data.token];
	}
};

Control.prototype.action = function(code, data, callback) {
	var message = {action: code, args: data};
	if (typeof callback === 'function') {
		this.token++;
		this.callbacks[this.token] = callback;
		message.token = this.token;
	}
	this.worker.postMessage(message);
};
