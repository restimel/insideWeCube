'use strict';

(function(){
	var path = location.pathname.split('/'),
		i = path.indexOf('worker');

	path = path.slice(0, i);
	path = '/' + path.join('/');

	self.$$configuration = {path: path};
})();

if (typeof console === 'undefined') {
	console = {};
	console.log = console.warn = console.error = function(){
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
	'heuristic.js',
	'../libs/i18n/translate-i18n.js'
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
			self.postMessage({data: store.getLevels(), token: token});
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
		case 'heuristic':
			heuristic.router(args, token);
			break;
		case 'changeLng':
			$$.changeLng(args);
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
	}
};

var tempCube = new Cube();

function sendMessage(message, type, option) {
	optin = option || {};
	type = type || 'success';
	var time = typeof option.time === 'undefined' ? 10000 : option.time;
	var html = option.html || false;

	self.postMessage({
		data: {
			action: 'message',
			message: message,
			time: time,
			html: html
			type: type
		}
	});
}

function saveCube(data, option) {
	tempCube.parse(data, option);
	store.save(tempCube, option);
	return 1;
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
		color: cube.color
	};
}

/* init worker */
var path = new Path();
var heuristic = new Heuristic();
