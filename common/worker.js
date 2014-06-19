importScripts(
	'../models/store.js',
	'../models/level.js',
	'../models/cube.js',
	'path.js',
	'../libs/translate-i18n.js'
);

if (typeof console === 'undefined') {
	console = {};
	console.log = console.warn = console.error = function(){
		self.postMessage({log: JSON.stringify(arguments)});
	};
}

self.onmessage = function(e) {
	var data = e.data,
		action = data.action,
		args = data.args,
		token = data.token;

	switch (action) {
		case 'saveCube':
			self.postMessage({data: saveCube(args), token: token});
			break;
		case 'importCubes':
			self.postMessage({data: saveCubes(args), token: token});
			break;
		case 'exportCubes':
			self.postMessage({data: JSON.stringify(store.cubes), token: token});
			break;
		case 'getCubes':
			self.postMessage({data: store.getCubes(), token: token});
			break;
		case 'getLevels':
			self.postMessage({data: store.getLevels(), token: token});
			break;
		case 'getLevel':
			self.postMessage({data: store.getLevel(args), token: token});
			break;
		case 'path':
			path.router(args, token);
			break;
	}
};

var tempCube = new Cube();

function saveCube(data) {
	tempCube.parse(data);
	store.save(tempCube);
	return 1;
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

function preloadCubes(){
	var xhr = new XMLHttpRequest(),
		user = '',
		password = '';
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
			saveCubes(xhr.responseText);
		}
	};
	
	xhr.open("GET", "cubes.json", true, user, password);
	xhr.send();
}

/* init worker */
preloadCubes();
path = new Path();