importScripts(
	'../models/store.js',
	'../models/level.js',
	'../models/cube.js'
);

self.onmessage = function(e) {
	var data = e.data,
		action = data.action,
		args = data.args,
		token = data.token;

	switch (action) {
		case 'test':
			self.postMessage({data: 'toto', token: token})
			break;
		case 'saveCube':
			currentCube.parse(args)
			saveCube();
			break;
		case 'getLevels':
			self.postMessage({data: store.getLevels(), token: token});
			break;
		case 'getLevel':
			self.postMessage({data: store.getLevel(args), token: token});
			break;
		case 'setCell':
			break;
	}
};

var currentCube = new Cube();

function saveCube() {
	store.save(currentCube);
}
