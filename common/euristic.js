function Euristic() {
	this.cube = null;
}

Euristic.prototype.router = function(args, token) {
	var route = args.action,
		data = args.data,
		f = this[route];

	this.token = token;

	if (typeof f === 'function') {
		f.call(this, data);
	} else {
		console.warn('Route not found', route);
	}
};

Euristic.prototype.reset = function(cubeName) {
	//load cube with cubeName
	//get list of probable position
	//analyze which move is the best

	var instruction = 'r'; // test
	//send instruction
	self.postMessage({data: {action: 'instruction', data: instruction}, token: this.token});
};

Euristic.prototype.answer = function(rsp) {
	var code = rsp.code,
		position = rsp.position;

	//TODO manage answer
	console.log('response', code, position);
};
