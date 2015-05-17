'use strict';

(function(){
	var path = location.pathname.split('/'),
		i = path.indexOf('worker');

	path = path.slice(0, i);
	path = path.join('/');
	if (path.indexOf('/') !== 0) {
		path = '/' + path;
	}

	self.$$configuration = {path: path};
})();

if (typeof console === 'undefined') {
	console = {};
	console.log = console.warn = console.error = console.info = function(){
		try {
			self.postMessage({log: JSON.stringify(arguments)});
		} catch (e) {
			self.postMessage({log: JSON.stringify(
				Array.prototype.map.call(arguments, getValue)
			)});
		}

		function getValue(v, noDeep) {
			var t = typeof v,
				o, x;

			noDeep = typeof noDeep === 'boolean' ? noDeep : false;

			switch(t) {
				case 'object':
					if (v instanceof Array) {
						return v.map(function (o){
							return getValue(o, noDeep);
						});
					} else {
						if (noDeep) {
							return '(Object [not displayed])';
						} else {
							o = {};
							for (x in v) {
								o[x] = getValue(v[x], true);
							}
							return o;
						}
					}
					break;
				default: 
					return v;
			}
		}
	};
}

importScripts(
	'indexDB.js',
	'../models/store.js',
	'../models/level.js',
	'../models/cube.js',
	'path.js',
	'generator.js',
	'heuristic.js',
	'createWorker.js',
	'../libs/i18n/translate-i18n.js',
	'../common/helpers.js'
);

self.onmessage = function(e) {
	var data = e.data,
		action = data.action,
		args = data.args,
		token = data.token;

	switch (action) {
		case 'saveCube':
			self.postMessage({data: saveCube(args), token: token});
			break;
		case 'saveCubeFromLevels':
			self.postMessage({data: saveCubeFromLevels(args), token: token});
			break;
		case 'importCubes':
			self.postMessage({data: saveCubes(args), token: token});
			break;
		case 'exportCubes':
			self.postMessage({data: JSON.stringify(store.cubes.filter(function(cube) {
				return cube.visible;
			})), token: token});
			break;
		case 'getCubes':
			self.postMessage({data: store.getCubes(args), token: token});
			break;
		case 'getLevels':
			self.postMessage({data: store.getLevels(args), token: token});
			break;
		case 'getLevel':
			self.postMessage({data: store.getLevel(args), token: token});
			break;
		case 'setVisible':
			store.setVisible(args.cubeName, args.visible);
			break;
		case 'removeCube':
			store.removeCube(args.cubeName);
			break;
		case 'path':
			path.router(args, token);
			break;
		case 'generator':
			generator.router(args, token);
			break;
		case 'heuristic':
			heuristic.router(args, token);
			break;
		case 'changeLng':
			$$.changeLng(args);
			break;
		case 'config':
			Object.keys(args).forEach(setConfig.bind(self, args));
			break;
		case 'getCubeInfo':
			self.postMessage({
				data: {
					action: 'cubeInfo',
					info: getCubeInfo(args.name)
				},
				token: token
			});
			break;
		case 'newWorker':
			createWorker.link(e.ports[0]);
			break;
		case 'changePort':
			self.postMessage = e.ports[0].postMessage.bind(e.ports[0]);
			e.ports[0].onmessage = self.onmessage;
			break;
	}
};

function setConfig(o, key) {
	var value = o[key];

	if (typeof value !== 'undefined' && value !== null) {
		Helper.config[key] = value;
	}
}

var tempCube = new Cube();

function sendMessage(message, type, option) {
	option = option || {};
	type = type || 'success';
	var time = typeof option.time === 'undefined' ? 10000 : option.time;
	var html = option.html || false;

	self.postMessage({
		data: {
			action: 'message',
			message: message,
			time: time,
			html: html,
			type: type
		}
	});
}

function saveCube(data, option) {
	tempCube.parse(data, option);
	store.save(tempCube, option);
	return 1;
}

function saveCubeFromLevels(data, option) {
	option = option || data.option || {};

	data.levels.forEach(function(levelName, index) {
		tempCube.levels[index].parse(store.getLevel(levelName).toJSON());
	}, this);
	var name = data.name;
	var i = 0;

	if (!name) {
		do {
			name = $$('generated cube - %d', i++);
		} while(store.search({name: name}, store.cubes) > -1);
	}

	tempCube.name = name;
	store.save(tempCube, option);
	return name;
}

function saveCubes(data, option) {
	var obj;

	try {
		obj = JSON.parse(data);
	} catch (e) {
		return $$('Your data is not a valid import.\nIt is not possible to load any cube from it.');
	}

	if (obj instanceof Array) {
		obj.forEach(saveCubeCallback);
		return obj.length;
	} else {
		saveCube(obj, option);
		return 1;
	}

	function saveCubeCallback(data) {
		saveCube(data, option);
	}
}

function getCubeInfo(name) {
	var cube = store.getCube(name);
	return {
		name: cube.name,
		color: cube.color,
		start: cube.startCell,
		end: cube.finishCell
	};
}

/* init worker */
var path = new Path();
var generator = new Generator();
var heuristic = new Heuristic();
