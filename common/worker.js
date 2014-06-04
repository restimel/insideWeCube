importScripts(
	'../models/store.js',
	'../models/level.js',
	'../models/cube.js',
	'../libs/translate-i18n.js'
);

self.onmessage = function(e) {
	var data = e.data,
		action = data.action,
		args = data.args,
		token = data.token,
		message;

	switch (action) {
		case 'test':
			self.postMessage({data: 'toto', token: token})
			break;
		case 'saveCube':
			saveCube(args);
			break;
		case 'loadCubes':
			self.postMessage({data: saveCubes(args), token: token});
			break;
		case 'getCubes':
			self.postMessage({data: JSON.stringify(store.cubes), token: token});
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

function saveCube(data) {
	currentCube.parse(data);
	store.save(currentCube);
	return true; //TODO analyze if all is ok
}

function saveCubes(data) {
	var obj;

	try {
		obj = JSON.parse(data);
	} catch (e) {
		return $$('Your data are not a valid import.\nIt is not possible to load any cube from it.');
	}

	if (obj instanceof Array) {
		obj.forEach(saveCube);
		return obj.length;
	} else {
		saveCube(obj);
		return 1;
	}
}